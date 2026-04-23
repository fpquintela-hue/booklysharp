import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const alias = searchParams.get('alias');
        let tenantId = null;

        if (alias) {
            const tenant = await (prisma as any).tenant.findUnique({ where: { alias } });
            if (!tenant) {
                return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
            }
            tenantId = tenant.id;
        } else {
            tenantId = request.headers.get('x-tenant-id');
        }

        // If no tenantId is provided and no alias found, we fetch global settings (tenantId: null)
        const settings = await (prisma as any).setting.findMany({ 
            where: { tenantId: tenantId || null } 
        });
        
        const settingsMap = settings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const alias = searchParams.get('alias');
        let tenantId = request.headers.get('x-tenant-id') || null;

        // If no tenantId from header but alias is provided, find the tenant
        if (!tenantId && alias) {
            const tenant = await (prisma as any).tenant.findUnique({ where: { alias } });
            if (tenant) {
                tenantId = tenant.id;
            }
        }

        const data = await request.json(); // should be an object of key-value pairs

        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'string') {
                // For global settings (tenantId null), we use findFirst/update/create 
                // because Prisma composite unique where clause sometimes struggles with nulls
                if (!tenantId) {
                    const existing = await (prisma as any).setting.findFirst({
                        where: { key, tenantId: null }
                    });
                    if (existing) {
                        await (prisma as any).setting.update({
                            where: { id: existing.id },
                            data: { value }
                        });
                    } else {
                        await (prisma as any).setting.create({
                            data: { key, value, tenantId: null }
                        });
                    }
                } else {
                    await (prisma as any).setting.upsert({
                        where: { key_tenantId: { key, tenantId } },
                        update: { value },
                        create: { key, value, tenantId },
                    });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving settings:', error);
        return NextResponse.json({ error: 'Error saving settings' }, { status: 500 });
    }
}
