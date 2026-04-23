import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        if (!email) return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
        
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
            return NextResponse.json({ exists: true });
        }
        return NextResponse.json({ exists: false });
    } catch (e) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
