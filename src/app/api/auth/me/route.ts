import { NextResponse } from 'next/server';

/**
 * Devuelve la identidad de la sesión actual.
 * El proxy (src/proxy.ts) ya ha verificado la cookie y ha inyectado
 * estos headers; si no hay sesión válida, el proxy responde 401 antes
 * de llegar aquí. El cliente lo usa para validar sesiones restauradas
 * desde localStorage.
 */
export async function GET(request: Request) {
    return NextResponse.json({
        id: request.headers.get('x-user-id'),
        role: request.headers.get('x-user-role'),
        tenantId: request.headers.get('x-tenant-id') || null,
    });
}
