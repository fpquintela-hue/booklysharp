'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BookingPortalV2 } from '@/components/BookingPortalV2';
import { CalendarX, Loader2 } from 'lucide-react';

export default function ReserveNewPage() {
    const params = useParams();
    const alias = params?.alias as string;
    const [data, setData] = useState<{ tenant: any, services: any[], settings: any, professionals: any[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!alias) return;
        fetch(`/api/public/services?alias=${alias}`)
            .then(res => {
                if (!res.ok) throw new Error('Tenant no encontrado');
                return res.json();
            })
            .then(d => setData(d))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [alias]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[#001c3b]" size={48} />
                    <p className="text-slate-500 font-semibold font-inter">Cargando Portal...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
                <div className="bg-white p-12 rounded-[2rem] shadow-xl max-w-md text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                        <CalendarX size={40} className="text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 font-manrope">Portal no disponible</h1>
                    <p className="text-slate-500">No hemos podido encontrar el portal de reservas para "{alias}".</p>
                </div>
            </div>
        );
    }

    if (data.settings?.portalEnabled === 'false') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
                <div className="bg-white p-12 rounded-[2rem] shadow-xl max-w-md text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                        <CalendarX size={40} className="text-amber-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 font-manrope">Servicio Pausado</h1>
                    <p className="text-slate-500">
                        Nuestro portal de reservas online se encuentra en mantenimiento. Por favor, contacta directamente con el centro.
                    </p>
                </div>
            </div>
        );
    }

    return <BookingPortalV2
        alias={data.tenant.alias}
        tenantName={data.tenant.name || data.tenant.nombre_comercial}
        services={data.services}
        professionals={data.professionals || []}
        settings={data.settings}
    />;
}
