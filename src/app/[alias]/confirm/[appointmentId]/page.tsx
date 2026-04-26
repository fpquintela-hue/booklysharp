import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import ConfirmationClient from '@/components/ConfirmationClient';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

    if (!appointment || appointment.tenant.alias !== alias) {
        return notFound();
    }

    const patientName = decrypt(appointment.patient.name) || 'Paciente';
    const appointmentDate = format(new Date(appointment.start), "eeee d 'de' MMMM, yyyy", { locale: es });
    const appointmentTime = format(new Date(appointment.start), 'HH:mm');
    
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
