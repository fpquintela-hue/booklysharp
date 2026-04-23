import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { token, tenantAlias } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token es requerido' }, { status: 400 });
        }

        const user = await prisma.user.findFirst({
            where: { verification_token: token }
        });

        if (!user) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
        }

        if (user.is_verified) {
            return NextResponse.json({ error: 'La cuenta ya estaba verificada' }, { status: 400 });
        }

        if (user.verify_token_expires && user.verify_token_expires < new Date()) {
            return NextResponse.json({ error: 'El token ha expirado. Contacta a soporte.' }, { status: 400 });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                is_verified: true,
                verification_token: null,
                verify_token_expires: null
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Verify API error:', error);
        return NextResponse.json({ error: 'Error del servidor al verificar' }, { status: 500 });
    }
}
