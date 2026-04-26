'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, CalendarClock, MessageCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface ConfirmationClientProps {
    appointmentId: string;
    patientName: string;
    appointmentDate: string;
    appointmentTime: string;
    appointmentType: string;
    initialStatus: string;
    tenantAlias: string;
    tenantName: string;
    tenantPhone?: string | null;
}

export default function ConfirmationClient({
    appointmentId,
    patientName,
    appointmentDate,
    appointmentTime,
    appointmentType,
    initialStatus,
    tenantAlias,
    tenantName,
    tenantPhone
}: ConfirmationClientProps) {
    const [status, setStatus] = useState(initialStatus);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleUpdateStatus = async (newStatus: 'CONFIRMED' | 'CANCELLED') => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/public/appointments/${appointmentId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) throw new Error('Error al actualizar');
            
            setStatus(newStatus);
            if (newStatus === 'CONFIRMED') {
                toast.success('¡Cita confirmada con éxito!');
            } else {
                toast.error('Cita cancelada correctamente');
            }
        } catch (error) {
            toast.error('No se pudo procesar tu solicitud, intenta de nuevo más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleWhatsAppReschedule = () => {
        if (!tenantPhone) {
            // Si no hay teléfono, simplemente redirigir a la página de reservas
            router.push(`/${tenantAlias}`);
            return;
        }
        
        let cleanNumber = tenantPhone.replace(/[^0-9]/g, '');
        if (cleanNumber.length === 9) cleanNumber = `34${cleanNumber}`;
        
        const text = encodeURIComponent(`Hola ${tenantName}, quiero cambiar el día/hora de mi cita de ${appointmentType} del ${appointmentDate} a las ${appointmentTime}.`);
        window.open(`https://wa.me/${cleanNumber}?text=${text}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden p-8 space-y-8">
                
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-gray-900">{tenantName}</h1>
                    <p className="text-gray-500">Gestión de Cita</p>
                </div>

                <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 space-y-4">
                    <p className="text-lg text-gray-800 text-center font-medium">
                        Hola, {patientName}
                    </p>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                            <span className="text-gray-500">Servicio</span>
                            <span className="font-semibold text-gray-900">{appointmentType}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                            <span className="text-gray-500">Fecha</span>
                            <span className="font-semibold text-gray-900">{appointmentDate}</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm">
                            <span className="text-gray-500">Hora</span>
                            <span className="font-semibold text-blue-600 text-base">{appointmentTime}</span>
                        </div>
                    </div>
                </div>

                {status === 'SCHEDULED' && (
                    <div className="space-y-6">
                        <h2 className="text-center text-lg font-semibold text-gray-800">¿Asistirás a tu cita?</h2>
                        
                        <div className="space-y-3">
                            <Button 
                                onClick={() => handleUpdateStatus('CONFIRMED')}
                                disabled={isLoading}
                                className="w-full h-14 text-base font-semibold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                            >
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                Sí, Confirmar Asistencia
                            </Button>

                            <Button 
                                onClick={handleWhatsAppReschedule}
                                disabled={isLoading}
                                variant="outline"
                                className="w-full h-14 text-base font-semibold border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
                            >
                                <CalendarClock className="w-5 h-5 mr-2 text-blue-600" />
                                Cambiar día y hora
                            </Button>

                            <Button 
                                onClick={() => {
                                    if(confirm('¿Estás seguro de que deseas anular esta cita?')) {
                                        handleUpdateStatus('CANCELLED')
                                    }
                                }}
                                disabled={isLoading}
                                variant="ghost"
                                className="w-full h-12 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                No podré ir, anular cita
                            </Button>
                        </div>
                    </div>
                )}

                {status === 'CONFIRMED' && (
                    <div className="text-center space-y-6 py-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">¡Cita Confirmada!</h2>
                            <p className="text-gray-500">Te esperamos el día y hora acordados.</p>
                        </div>
                    </div>
                )}

                {status === 'CANCELLED' && (
                    <div className="text-center space-y-6 py-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                            <XCircle className="w-10 h-10" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Cita Anulada</h2>
                            <p className="text-gray-500">Tu reserva ha sido cancelada correctamente.</p>
                        </div>
                        
                        <Button 
                            onClick={() => router.push(`/${tenantAlias}`)}
                            className="mt-4 w-full rounded-xl bg-gray-900 text-white hover:bg-gray-800"
                        >
                            Volver al portal de reservas
                        </Button>
                    </div>
                )}

            </div>
        </div>
    );
}
