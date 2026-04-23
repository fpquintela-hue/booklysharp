
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { createCalendarEvent } from '@/lib/google-calendar';

export async function GET(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const profIds = searchParams.get('professionalIds')?.split(',').filter(Boolean);

        const appointments = await (prisma as any).appointment.findMany({
            where: {
                tenantId,
                ...(profIds && profIds.length > 0 ? { professionalId: { in: profIds } } : {})
            },
            include: {
                patient: true,
                professional: true
            }
        });

        // Transform to match the expected Appointment type if necessary
        const formatted = appointments.map((a: any) => {
            const decPatientName = decrypt(a.patient.name) || '';
            const decPatientApellidos = decrypt(a.patient.apellidos) || '';
            return {
                ...a,
                notes: decrypt(a.notes),
                patientName: `${decPatientApellidos}, ${decPatientName}`,
                patientBloqueado: a.patient.bloqueado,
                professionalName: a.professional?.name,
                professionalColor: a.professional?.color,
                patient: {
                    ...a.patient,
                    name: decPatientName,
                    apellidos: decPatientApellidos,
                    email: decrypt(a.patient.email),
                    phone: decrypt(a.patient.phone)
                }
            };
        });

        return NextResponse.json(formatted);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching appointments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await request.json();

        // Single create/update logic is usually handled by a separate PUT for updates, 
        // but this endpoint seems to handle creation primarily.

        const appointment = await (prisma as any).appointment.create({
            data: {
                tenantId,
                start: new Date(data.start),
                end: new Date(data.end),
                type: data.type,
                status: data.status || 'SCHEDULED',
                notes: encrypt(data.notes),
                patientId: data.patientId,
                professionalId: data.professionalId,
                // 🔔 Recordatorio Automático
                ...(data.reminderType && data.reminderType !== 'NONE' ? {
                    reminders: {
                        create: {
                            type: data.reminderType,
                            timeMinutes: data.reminderTime || 0,
                            status: 'PENDING'
                        }
                    }
                } : {})
            },
            include: {
                professional: true,
                patient: true,
                reminders: true
            }
        });

        // 🟢 SYNC CON GOOGLE CALENDAR
        if (appointment.professional && appointment.professional.googleAccessToken) {
            const decPatientName = decrypt(appointment.patient.name);
            const decPatientApellidos = decrypt(appointment.patient.apellidos);
            const patientName = `${decPatientApellidos || ''}, ${decPatientName || ''}`.trim();

            const googleEventId = await createCalendarEvent(appointment.professional, appointment, patientName);

            if (googleEventId) {
                // Guardamos el ID que nos devuelve google para futuras ediciones o borrados
                await (prisma as any).appointment.update({
                    where: { id: appointment.id },
                    data: { googleEventId }
                });
                appointment.googleEventId = googleEventId; // Lo actualizamos en la respuesta también
            }
        }

        return NextResponse.json({
            ...appointment,
            notes: decrypt(appointment.notes),
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error creating appointment' }, { status: 500 });
    }
}
