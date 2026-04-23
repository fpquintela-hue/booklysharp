import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';
import { updateCalendarEvent, deleteCalendarEvent } from '@/lib/google-calendar';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const data = await request.json();

        // Check if appointment belongs to tenant
        const existing = await (prisma as any).appointment.findFirst({ where: { id, tenantId } });
        if (!existing) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

        const updateData: any = {
            start: data.start ? new Date(data.start) : undefined,
            end: data.end ? new Date(data.end) : undefined,
            type: data.type,
            status: data.status,
            patientId: data.patientId,
            professionalId: data.professionalId,
        };

        if (data.notes !== undefined) {
            updateData.notes = encrypt(data.notes);
        }

        // 🔔 Gestionar Recordatorios Automáticos
        if (data.reminderType !== undefined) {
            // Delete pending ones to avoid duplicates if settings changed
            await (prisma as any).reminder.deleteMany({
                where: { appointmentId: id, status: 'PENDING' }
            });

            if (data.reminderType && data.reminderType !== 'NONE') {
                updateData.reminders = {
                    create: {
                        type: data.reminderType,
                        timeMinutes: data.reminderTime || 0,
                        status: 'PENDING'
                    }
                };
            }
        }

        const appointment = await (prisma as any).appointment.update({
            where: { id },
            data: updateData,
            include: { professional: true, patient: true, reminders: true }
        });

        // 🟠 SYNC: UPDATE EN GOOGLE CALENDAR
        if (appointment.professional && appointment.professional.googleAccessToken && appointment.googleEventId) {
            const decPatientName = decrypt(appointment.patient.name);
            const decPatientApellidos = decrypt(appointment.patient.apellidos);
            const patientName = `${decPatientApellidos || ''}, ${decPatientName || ''}`.trim();

            await updateCalendarEvent(appointment.professional, appointment, patientName);
        }

        return NextResponse.json({
            ...appointment,
            notes: decrypt(appointment.notes),
        });
    } catch (error) {
        console.error('Error updating appointment:', error);
        return NextResponse.json({ error: 'Error updating appointment' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        const existing = await (prisma as any).appointment.findFirst({
            where: { id, tenantId },
            include: { professional: true }
        });
        if (!existing) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

        // 🔴 SYNC: DELETE EN GOOGLE CALENDAR (antes de borrar de nuestra base de datos)
        if (existing.professional && existing.professional.googleAccessToken && existing.googleEventId) {
            await deleteCalendarEvent(existing.professional, existing.googleEventId);
        }

        await (prisma as any).appointment.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        return NextResponse.json({ error: 'Error deleting appointment' }, { status: 500 });
    }
}
