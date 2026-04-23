import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const alias = searchParams.get('alias');

        if (!alias) {
            return NextResponse.json({ error: 'Alias is required' }, { status: 400 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { alias }
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        const services = await prisma.appointmentType.findMany({
            where: { tenantId: tenant.id }
        });

        const professionals = await prisma.professional.findMany({
            where: { isActive: true, tenantId: tenant.id }
        });

        // Also fetch global settings for theme/branding
        const settings = await prisma.setting.findMany({
            where: { tenantId: tenant.id }
        });

        return NextResponse.json({
            tenant: {
                id: tenant.id,
                name: tenant.nombre_comercial,
                alias: tenant.alias,
                subscription_status: tenant.subscription_status,
                expires_at: tenant.expires_at || tenant.fecha_fin_suscripcion,
                createdAt: tenant.createdAt
            },
            services,
            professionals: professionals.map((p: any) => ({
                id: p.id,
                name: p.name,
                image: p.image,
                description: p.description,
                color: p.color
            })),
            settings: Object.fromEntries(settings.map((s: any) => [s.key, s.value]))
        });

    } catch (error) {
        console.error('Error fetching public services:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
