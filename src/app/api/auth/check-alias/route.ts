import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { alias } = await request.json();
        if (!alias) return NextResponse.json({ error: 'Alias requerido' }, { status: 400 });
        
        const existingAlias = await prisma.tenant.findUnique({ where: { alias } });
        if (existingAlias) {
            return NextResponse.json({ exists: true });
        }
        return NextResponse.json({ exists: false });
    } catch (e) {
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
