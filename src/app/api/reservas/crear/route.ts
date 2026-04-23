
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { addMinutes } from 'date-fns';
import { encrypt, decrypt } from '@/lib/encryption';
import { sendImmediateNotification } from '@/lib/notifications';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { 
            alias, 
            serviceId, 
            date, 
            time,
            datetimeISO, 
            name, 
            phone,
            email,
            notificationPreference,
            googleId 
        } = body;

        if (!alias || !serviceId || !date || !time || !name) {
            return NextResponse.json({ error: 'Faltan parámetros obligatorios' }, { status: 400 });
        }

        if (!phone && !email) {
            return NextResponse.json({ error: 'Debes proporcionar al menos un teléfono o un correo electrónico' }, { status: 400 });
        }

        // 1. Find the tenant
        const tenant = await prisma.tenant.findUnique({
            where: { alias },
            include: {
                appointmentTypes: true,
                settings: true,
                professionals: true,
                dayConfigs: true
            }
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
        }

        // 2. Find or create the patient IDENTIFYING BY PHONE OR EMAIL
        // We fetch all patients of the tenant and decrypt to find a match. 
        // Note: For large databases, a hashed search field (deterministic) would be more efficient.
        const allPatients = await prisma.patient.findMany({ 
            where: { tenantId: tenant.id } 
        });

        const normalizedPhone = phone ? phone.replace(/\s+/g, '').replace('+', '') : null;
        
        let patient = allPatients.find((p: any) => {
            // Check phone match
            if (normalizedPhone && p.phone) {
                const decPhone = decrypt(p.phone)?.replace(/\s+/g, '').replace('+', '');
                console.log(`[Matching] Trying phone: ${normalizedPhone} vs stored: ${decPhone}`);
                if (decPhone === normalizedPhone) {
                    console.log(`[Matching] Phone MATCH found for patient ${p.id}`);
                    return true;
                }
            }
            // Check email match if provided
            if (email && p.email) {
                const decEmail = decrypt(p.email)?.toLowerCase().trim();
                console.log(`[Matching] Trying email: ${email} vs stored: ${decEmail}`);
                if (decEmail === email.toLowerCase().trim()) {
                    console.log(`[Matching] Email MATCH found for patient ${p.id}`);
                    return true;
                }
            }
            return false;
        });

        if (!patient) {
            // Create new patient if none found
            patient = await prisma.patient.create({
                data: {
                    name: encrypt(name) || name,
                    phone: phone ? (encrypt(phone) || phone) : null,
                    email: email ? (encrypt(email) || email) : null,
                    tenantId: tenant.id
                }
            });
        } else {
            // Update existing patient data if they provided something new/missing
            const updates: any = {};
            
            const currentName = decrypt(patient.name);
            const currentPhone = decrypt(patient.phone);
            const currentEmail = decrypt(patient.email);

            // If name is different, update (e.g., Fernando instead of Mercedes)
            if (name && currentName !== name) {
                console.log(`[Updating] Name change detected: ${currentName} -> ${name}`);
                updates.name = encrypt(name);
            }
            
            // If phone is different (normalized match failed but email match succeeded), update
            if (phone && currentPhone !== phone) {
                console.log(`[Updating] Phone change detected: ${currentPhone} -> ${phone}`);
                updates.phone = encrypt(phone);
            }

            // Also fill missing email if it was previously empty
            if (email && !currentEmail) {
                updates.email = encrypt(email);
            }
            
            if (Object.keys(updates).length > 0) {
                await prisma.patient.update({
                    where: { id: patient.id },
                    data: updates
                });
                console.log(`[Sync] Patient ${patient.id} updated successfully.`);
            }
        }

        // 3. Find service details
        const service = tenant.appointmentTypes.find((s: any) => s.id === serviceId);
        const duration = service?.duration || 30;

        // 4. Timezone-aware date creation
        // By relying on the browser's exact ISO string, the time matches perfectly without guessing offsets.
        const start = datetimeISO ? new Date(datetimeISO) : new Date(`${date}T${time}:00`);
        const end = addMinutes(start, duration);

        // 5. DETERMINE FREE PROFESSIONAL
        const dayOfWeek = start.getDay();
        const settingsMap = tenant.settings.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
        const blockedSlotsGlobal = settingsMap['blockedSlots'] ? JSON.parse(settingsMap['blockedSlots']) : [];

        const isTimeBlocked = (t: string, day: number, blocks: any[]) => {
            return blocks.some(b => Number(b.dayOfWeek) === day && t >= b.startTime && t < b.endTime);
        };

        if (isTimeBlocked(time, dayOfWeek, blockedSlotsGlobal)) {
            return NextResponse.json({ error: 'El centro no está disponible en este horario' }, { status: 409 });
        }

        const activeProfessionals = tenant.professionals.filter((p: any) => p.isActive);
        const dayAppointments = await prisma.appointment.findMany({
            where: {
                tenantId: tenant.id,
                start: { 
                    gte: new Date(`${date}T00:00:00`), 
                    lte: new Date(`${date}T23:59:59`) 
                },
                status: { not: 'CANCELLED' }
            }
        });

        const overlappingAppts = dayAppointments.filter((appt: any) => {
            const aStart = new Date(appt.start);
            const aEnd = new Date(appt.end);
            return (start < aEnd) && (end > aStart);
        });

        const unassignedAppts = overlappingAppts.filter((a: any) => !a.professionalId);

        const freeProfs = activeProfessionals.filter((prof: any) => {
            const profConfig = tenant.dayConfigs.find((c: any) => c.date === date && c.professionalId === prof.id);
            if (profConfig?.isBlocked) return false;

            const profBlocksKey = `blockedSlots_${prof.id}`;
            const profBlocks = settingsMap[profBlocksKey] ? JSON.parse(settingsMap[profBlocksKey]) : [];
            if (isTimeBlocked(time, dayOfWeek, profBlocks)) return false;

            const hasSpecificConflict = overlappingAppts.some((a: any) => a.professionalId === prof.id);
            if (hasSpecificConflict) return false;

            return true;
        });

        let assignedProfId = body.professionalId || null;
        
        if (assignedProfId) {
            // Validate that the explicitly assigned professional is actually free
            const isAssignedProfFree = freeProfs.some((p: any) => p.id === assignedProfId);
            if (!isAssignedProfFree) {
                return NextResponse.json({ 
                    error: 'El profesional seleccionado ya no está disponible en el horario elegido.',
                }, { status: 409 });
            }
        } else if (!assignedProfId && freeProfs.length > unassignedAppts.length) {
            assignedProfId = freeProfs[0].id;
        }

        if (!assignedProfId) {
            return NextResponse.json({ 
                error: 'No hay profesionales disponibles para este servicio en el horario seleccionado.',
            }, { status: 409 });
        }

        // 6. Preparar recordatorios según config del tenant
        const remindersToCreate = [
            {
                type: (notificationPreference === 'WHATSAPP') ? 'WHATSAPP' : 'EMAIL',
                timeMinutes: 0, // Inmediata (confirmación)
                status: 'PENDING'
            }
        ];

        const configStr = settingsMap['reminders_config'];
        if (configStr) {
            try {
                const config = JSON.parse(configStr);
                const timeMap: Record<string, number> = {
                    '30_MINUTES': 30,
                    '1_HOUR': 60,
                    '1_DAY': 1440,
                    '2_DAYS': 2880,
                    '7_DAYS': 10080
                };

                (config as any[]).forEach((r: any) => {
                    let mins = timeMap[r.time] || 0;
                    if (r.time === 'CUSTOM' && r.customValue) {
                        mins = parseInt(r.customValue) || 30;
                    }
                    if (mins > 0) {
                        let type = (notificationPreference === 'WHATSAPP') ? 'WHATSAPP' : 'EMAIL';
                        if (r.method === 'WHATSAPP') type = 'WHATSAPP';
                        if (r.method === 'EMAIL') type = 'EMAIL';

                        remindersToCreate.push({
                            type,
                            timeMinutes: mins,
                            status: 'PENDING'
                        });
                    }
                });
            } catch (e) {
                console.error('Error parsing reminders_config:', e);
            }
        } else {
            // Default 1 day before if no config found
            remindersToCreate.push({
                type: (notificationPreference === 'WHATSAPP') ? 'WHATSAPP' : 'EMAIL',
                timeMinutes: 1440,
                status: 'PENDING'
            });
        }

        // 7. Create the appointment with assigned professional
        const appointment = await prisma.appointment.create({
            data: {
                start,
                end,
                type: service?.name || 'Cita Portal',
                status: 'SCHEDULED',
                patientId: patient.id,
                professionalId: assignedProfId,
                tenantId: tenant.id,
                notes: encrypt(`Reserva web. Preferencia: ${notificationPreference || 'No especificada'}`),
                reminders: {
                    create: remindersToCreate
                }
            },
            include: {
                reminders: true
            }
        });

        try {
            const success = await sendImmediateNotification(
                { ...appointment, patient: { name, phone, email } }, 
                tenant, 
                (notificationPreference === 'WHATSAPP') ? 'WHATSAPP' : 'EMAIL'
            );

            if (success) {
                const immediateReminder = appointment.reminders.find((r: any) => r.timeMinutes === 0);
                if (immediateReminder) {
                    await prisma.reminder.update({
                        where: { id: immediateReminder.id },
                        data: { status: 'SENT' }
                    });
                }
            }
        } catch (e) {
            console.error('Failed to send notification:', e);
        }

        return NextResponse.json({ 
            success: true, 
            appointmentId: appointment.id,
            message: 'Reserva creada con éxito' 
        });

    } catch (error) {
        console.error('Error al crear reserva:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
