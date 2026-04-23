import { NextResponse } from 'next/server';
import { getTokensFromCode } from '@/lib/google-calendar';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const stateBase64 = searchParams.get('state');

        if (!code || !stateBase64) {
            return NextResponse.json({ error: 'Faltan parámetros de autorización (Code / State)' }, { status: 400 });
        }

        // Decode the state we sent initially to know who this token belongs to
        const { professionalId, tenantId } = JSON.parse(Buffer.from(stateBase64, 'base64').toString('ascii'));

        // Exchange code for tokens
        const tokens = await getTokensFromCode(code);

        // Verify professional exists
        const prof = await (prisma as any).professional.findFirst({
            where: { id: professionalId, tenantId }
        });

        if (!prof) {
            return NextResponse.json({ error: 'Profesional no encontrado' }, { status: 404 });
        }

        // Antes de guardar todo, vamos a conectarnos a Google y ver si tiene o si podemos crear un Calendario específico
        // para que las citas no se le mezclen a la persona con sus citas de "Ir al gimnasio".
        let finalCalendarId = prof.googleCalendarId;

        try {
            const { getCalendarClient } = require('@/lib/google-calendar');
            const calendar = getCalendarClient(tokens.access_token, tokens.refresh_token);

            // Si el profesional no tiene un calendario creado por nosotros aún, lo creamos.
            if (!finalCalendarId) {
                const newCalendar = await calendar.calendars.insert({
                    requestBody: {
                        summary: `booklysharp: ${prof.name}`,
                        description: `Calendario oficial conectado a booklysharp Reservas para el profesional ${prof.name}. Las citas creadas aquí se sincronizarán en tiempo real.`,
                        timeZone: 'Europe/Madrid'
                    }
                });
                if (newCalendar.data && newCalendar.data.id) {
                    finalCalendarId = newCalendar.data.id;
                }
            }
        } catch (calendarError) {
            console.error('Error creando el calendario inicial de Google:', calendarError);
            // Si falla la creación, en el peor de los casos usaríamos su calendario principal ('primary'),
            // pero lo dejamos vacío para que el sistema intente volver a crearlo en el futuro o salte a 'primary'.
        }

        // Save tokens and the new dedicated Calendar ID
        await (prisma as any).professional.update({
            where: { id: professionalId },
            data: {
                googleAccessToken: tokens.access_token,
                // Only save refresh token if it was provided (Google sometimes omits it if already consented)
                ...(tokens.refresh_token ? { googleRefreshToken: tokens.refresh_token } : {}),
                googleCalendarId: finalCalendarId
            }
        });

        // Redirect back to the app (we can hardcode or guess the tenant alias, but a safe global redirect could be an intermediate 'Success' page)
        // Let's get the tenant to redirect nicely
        const tenant = await (prisma as any).tenant.findUnique({
            where: { id: tenantId }
        });

        let targetUrl = '/';
        if (tenant?.alias) {
            targetUrl = `/${tenant.alias}/userapp`;
        }

        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}${targetUrl}?google_sync=success`);
    } catch (error) {
        console.error('Error in Google Callback:', error);
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?google_sync=error`);
    }
}
