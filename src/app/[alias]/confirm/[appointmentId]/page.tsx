import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import ConfirmationClient from '@/components/ConfirmationClient';

interface PageProps {
    params: Promise<{ alias: string; appointmentId: string }>;
}

export default async function ConfirmationPage({ params }: PageProps) {
    const { alias, appointmentId } = await params;

    const appointment = await (prisma as any).appointment.findUnique({
        where: { id: appointmentId },
        include: {
            patient: true,
            tenant: true
        }
    });

    // Guard: appointment must exist, have a tenant, and the alias must match
    if (!appointment || !appointment.tenant || appointment.tenant.alias !== alias) {
        return notFound();
    }


    const patientName = decrypt(appointment.patient.name) || 'Paciente';
    const dateObj = new Date(appointment.start);
    
    const appointmentDateFormatter = new Intl.DateTimeFormat('es-ES', {
        timeZone: 'Europe/Madrid',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const appointmentTimeFormatter = new Intl.DateTimeFormat('es-ES', {
        timeZone: 'Europe/Madrid',
        hour: '2-digit',
        minute: '2-digit'
    });

    const appointmentDate = appointmentDateFormatter.format(dateObj);
    const appointmentTime = appointmentTimeFormatter.format(dateObj);
    
    // Capitalize first letter of date
    const dateCapitalized = appointmentDate.charAt(0).toUpperCase() + appointmentDate.slice(1);

    return (
        <ConfirmationClient
            appointmentId={appointment.id}
            patientName={patientName}
            appointmentDate={dateCapitalized}
            appointmentTime={appointmentTime}
            appointmentType={appointment.type}
            initialStatus={appointment.status}
            tenantAlias={appointment.tenant.alias}
            tenantName={appointment.tenant.nombre_comercial}
            tenantPhone={appointment.tenant.telefono}
        />
    );
}
