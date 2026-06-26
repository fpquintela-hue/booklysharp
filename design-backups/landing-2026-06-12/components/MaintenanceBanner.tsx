import { AlertTriangle } from 'lucide-react';

/**
 * Aviso de mantenimiento mostrado en la parte superior de la landing.
 * Server component: su contenido lo controla el superadmin y se lee
 * directamente de los ajustes globales (ver getMaintenanceStatus).
 */
export function MaintenanceBanner({ message }: { message: string }) {
    return (
        <div
            role="alert"
            className="relative z-50 w-full bg-amber-500 text-amber-950"
        >
            <div className="container mx-auto flex items-center justify-center gap-3 px-4 py-2.5 text-center">
                <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                <p className="text-sm font-semibold leading-snug">{message}</p>
            </div>
        </div>
    );
}
