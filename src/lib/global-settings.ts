import prisma from '@/lib/prisma';

/**
 * Lectura de ajustes GLOBALES del sistema (no de un tenant).
 *
 * Cómo se guardan: en la tabla `Setting` de PostgreSQL, una fila por clave,
 * con `tenantId = NULL`. Son los mismos registros que escribe el panel de
 * superadmin (SMTP global, modo mantenimiento, etc.). Aquí los leemos
 * directamente desde el servidor, sin pasar por la API.
 */
export async function getGlobalSettings(keys: string[]): Promise<Record<string, string>> {
    const rows = await (prisma as any).setting.findMany({
        where: { tenantId: null, key: { in: keys } },
    });
    return rows.reduce((acc: Record<string, string>, r: any) => {
        acc[r.key] = r.value;
        return acc;
    }, {} as Record<string, string>);
}

export interface MaintenanceStatus {
    enabled: boolean;
    message: string;
}

export const MAINTENANCE_DEFAULT_MESSAGE =
    'Estamos realizando tareas de mantenimiento. Volveremos a estar operativos en breve.';

/** Estado del modo mantenimiento configurado por el superadmin. */
export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
    try {
        const s = await getGlobalSettings(['MAINTENANCE_ENABLED', 'MAINTENANCE_MESSAGE']);
        return {
            enabled: s.MAINTENANCE_ENABLED === 'true',
            message: s.MAINTENANCE_MESSAGE?.trim() || MAINTENANCE_DEFAULT_MESSAGE,
        };
    } catch {
        // Si la BD no responde, nunca bloquear la landing con un falso aviso.
        return { enabled: false, message: MAINTENANCE_DEFAULT_MESSAGE };
    }
}
