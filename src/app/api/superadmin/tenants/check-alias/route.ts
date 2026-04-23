import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const alias = searchParams.get('alias');

    if (!alias) {
        return NextResponse.json({ available: false, error: 'Alias es requerido' }, { status: 400 });
    }

    try {
        const existing = await prisma.tenant.findUnique({ where: { alias } });
        return NextResponse.json({ available: !existing });
    } catch (error) {
        console.error('Error checking alias:', error);
        return NextResponse.json({ available: false, error: 'Error del servidor al comprobar alias' }, { status: 500 });
    }
}
