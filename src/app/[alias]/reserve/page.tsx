'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { BookingPortal } from '@/components/BookingPortal';
import { CalendarX, Loader2 } from 'lucide-react';
import './reserve.css';

export default function ReservePage() {
    const params = useParams();
    const alias = params?.alias as string;
    const [data, setData] = useState<{ tenant: any, services: any[], settings: any } | null>(null);
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
            <div className="ce-app-container">
                <div className="ce-mobile-frame" style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Loader2 className="animate-spin text-[#0a1f44]" size={48} />
                    <p style={{ marginTop: '1rem', color: '#64748b', fontWeight: 600 }}>Cargando Portal...</p>
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="ce-app-container">
                <div className="ce-mobile-frame" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center' }}>
                    <CalendarX size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                    <h1 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>Portal no disponible</h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>No hemos podido encontrar el portal de reservas para "{alias}".</p>
                </div>
            </div>
        );
    }

    if (data.settings?.portalEnabled === 'false') {
        return (
            <div className="ce-app-container">
                <div className="ce-mobile-frame" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem', textAlign: 'center' }}>
                    <CalendarX size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
                    <h1 style={{ fontSize: '1.5rem', color: '#0f172a', fontWeight: 800 }}>Servicio Pausado</h1>
                    <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                        Nuestro portal de reservas online se encuentra en mantenimiento. Por favor, contacta directamente con el centro.
                    </p>
                </div>
            </div>
        );
    }

    return <BookingPortal
        alias={data.tenant.alias}
        tenantName={data.tenant.nombre_comercial}
        services={data.services}
        professionals={(data as any).professionals || []}
        settings={data.settings}
    />;
}