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
            <div className="ce-root ce-loading">
                <div className="ce-spinner" />
                <p className="ce-loading-text">Cargando Portal...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="ce-root ce-error-state">
                <div className="ce-error-icon">
                    <CalendarX size={32} />
                </div>
                <h1 className="ce-error-title">Portal no disponible</h1>
                <p className="ce-error-desc">
                    No hemos podido encontrar el portal de reservas para &ldquo;{alias}&rdquo;.
                </p>
            </div>
        );
    }

    if (data.settings?.portalEnabled === 'false') {
        return (
            <div className="ce-root ce-disabled-state">
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(186,26,26,.1)',
                        filter: 'blur(2rem)',
                        borderRadius: '50%',
                        transform: 'scale(1.5)'
                    }} />
                    <div className="ce-error-icon" style={{ position: 'relative', background: '#fff0f0' }}>
                        <CalendarX size={32} />
                    </div>
                </div>
                <h1 className="ce-error-title" style={{ fontSize: '1.75rem', marginBottom: '.75rem' }}>
                    Servicio Temporalmente Interrumpido
                </h1>
                <p className="ce-error-desc">
                    Nuestro portal de reservas online se encuentra en mantenimiento programado o pausado temporalmente.
                    <br />
                    <strong style={{ color: '#191c1e', marginTop: '.5rem', display: 'block' }}>
                        Por favor, contacta directamente con el centro para gestionar tu cita.
                    </strong>
                </p>
                <div className="ce-disabled-divider" />
                <span className="ce-disabled-tenant">{data.tenant.nombre_comercial}</span>
            </div>
        );
    }

    const { subscription_status, expires_at, createdAt } = data.tenant;
    let resolvedExpiresAt = expires_at ? new Date(expires_at) : null;
    if (!resolvedExpiresAt && createdAt) {
        resolvedExpiresAt = new Date(new Date(createdAt).getTime() + 14 * 24 * 60 * 60 * 1000);
    }
    const isExpired = subscription_status === 'expired' || (resolvedExpiresAt && new Date() > resolvedExpiresAt);

    if (isExpired) {
        return (
            <div className="ce-root ce-disabled-state">
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(186,26,26,.1)',
                        filter: 'blur(2rem)',
                        borderRadius: '50%',
                        transform: 'scale(1.5)'
                    }} />
                    <div className="ce-error-icon" style={{ position: 'relative', background: '#fff0f0' }}>
                        <CalendarX size={32} />
                    </div>
                </div>
                <h1 className="ce-error-title" style={{ fontSize: '1.75rem', marginBottom: '.75rem' }}>
                    Servicio no disponible
                </h1>
                <p className="ce-error-desc">
                    El servicio de reservas online no está disponible momentáneamente.
                    <br />
                    <strong style={{ color: '#191c1e', marginTop: '.5rem', display: 'block' }}>
                        Por favor, contacta directamente con el centro para gestionar tu cita.
                    </strong>
                </p>
                <div className="ce-disabled-divider" />
                <span className="ce-disabled-tenant">{data.tenant.name}</span>
            </div>
        );
    }

    return (
        <div className="ce-root ce-page">
            <main className="ce-main">
                <BookingPortal
                    alias={data.tenant.alias}
                    tenantName={data.tenant.nombre_comercial}
                    services={data.services}
                    professionals={(data as any).professionals || []}
                    settings={data.settings}
                />
            </main>
        </div>
    );
}
