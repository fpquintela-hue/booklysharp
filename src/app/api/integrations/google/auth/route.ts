import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/google-calendar';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');
    const tenantId = searchParams.get('tenantId');

    if (!professionalId || !tenantId) {
        return NextResponse.json({ error: 'Faltan parámetros: professionalId y tenantId' }, { status: 400 });
    }

    const authUrl = getGoogleAuthUrl(professionalId, tenantId);

    // Redirect to Google's consent screen
    return NextResponse.redirect(authUrl);
}
