import { NextRequest, NextResponse } from 'next/server';
import { verifySession, SESSION_COOKIE } from '@/lib/session';

/**
 * Proxy de autenticación de la API (Next 16: antes "middleware").
 *
 * Regla central: el tenant activo SIEMPRE se deriva de la cookie de sesión
 * firmada, nunca del header `x-tenant-id` que envíe el navegador.
 * Excepción: el SUPERADMIN puede fijar `x-tenant-id` manualmente
 * (gestión de usuarios de un tenant desde su panel).
 */

// Endpoints públicos por diseño (login, registro, portal de reservas...).
const PUBLIC_PATTERNS: RegExp[] = [
    /^\/api\/auth\/(login|logout|register|verify|forgot-password|reset-password|check-alias|check-email)(\/|$)/,
    /^\/api\/public\//,          // disponibilidad, servicios, confirmación de cita
    /^\/api\/reservas\//,        // creación de reservas del portal público
    /^\/api\/gallery(\/|$)/,     // imágenes públicas
    /^\/api\/img\//,             // imágenes de profesionales/servicios
    /^\/api\/reminders\/process(\/|$)/, // se protege a sí mismo con CRON_SECRET
];

// GET públicos solo si llevan ?alias= (branding y días bloqueados del portal).
const PUBLIC_GET_WITH_ALIAS: RegExp[] = [
    /^\/api\/settings(\/|$)/,
    /^\/api\/dayconfigs(\/|$)/,
];

function isPublic(req: NextRequest): boolean {
    const { pathname, searchParams } = req.nextUrl;
    if (PUBLIC_PATTERNS.some((r) => r.test(pathname))) return true;
    if (
        req.method === 'GET' &&
        searchParams.has('alias') &&
        PUBLIC_GET_WITH_ALIAS.some((r) => r.test(pathname))
    ) {
        return true;
    }
    return false;
}

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (!pathname.startsWith('/api/')) return NextResponse.next();
    if (isPublic(req)) return NextResponse.next();

    const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
        return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (pathname.startsWith('/api/superadmin') && session.role !== 'SUPERADMIN') {
        return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
    }

    // Inyectar identidad verificada para los route handlers.
    const headers = new Headers(req.headers);
    headers.set('x-user-id', session.sub);
    headers.set('x-user-role', session.role);

    if (session.role === 'SUPERADMIN') {
        // El superadmin puede operar sobre un tenant concreto enviando
        // x-tenant-id desde su panel; se respeta el valor del cliente.
        if (!req.headers.get('x-tenant-id')) headers.set('x-tenant-id', '');
    } else {
        // Usuarios normales: se ignora cualquier valor enviado por el cliente.
        headers.set('x-tenant-id', session.tenantId ?? '');
    }

    return NextResponse.next({ request: { headers } });
}

export const config = {
    matcher: '/api/:path*',
};
