import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const professionals = await (prisma as any).professional.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' }
        });

        // Evitamos enviar el token como texto plano al navegador por seguridad
        const safeProfessionals = professionals.map((p: any) => ({
            ...p,
            googleAccessToken: !!p.googleAccessToken,
            googleRefreshToken: !!p.googleRefreshToken
        }));

        return NextResponse.json(safeProfessionals);
    } catch (error) {
        console.error('Error fetching professionals:', error);
        return NextResponse.json({ error: 'Error fetching professionals' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await request.json();

        // Check limit
        const count = await (prisma as any).professional.count({ where: { tenantId } });
        const tenant = await (prisma as any).tenant.findUnique({ where: { id: tenantId } });

        if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

        const limit = tenant.maxProfessionals ?? 3;
        if (count >= limit) {
            return NextResponse.json({ error: `Maximum of ${limit} professionals reached.` }, { status: 400 });
        }

        const professional = await (prisma as any).professional.create({
            data: {
                tenantId,
                name: data.name,
                email: data.email,
                phone: data.phone,
                color: data.color || '#10b981',
                description: data.description,
                isActive: data.isActive !== undefined ? data.isActive : true,
            },
        });
        return NextResponse.json(professional);
    } catch (error) {
        console.error('Error creating professional:', error);
        return NextResponse.json({ error: 'Error creating professional' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        return NextResponse.json({ error: 'Use dynamic route for PUT' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: 'Error updating professional' }, { status: 500 });
    }
}
