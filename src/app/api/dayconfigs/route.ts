import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const alias = searchParams.get('alias');
        let tenantId = request.headers.get('x-tenant-id');

        if (!tenantId && alias) {
            const tenant = await (prisma as any).tenant.findUnique({ where: { alias } });
            if (tenant) tenantId = tenant.id;
        }

        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const professionalId = searchParams.get('professionalId');

        // Fetch configs based on professionalId if provided, otherwise fetch all
        // to manually merge them for the global calendar view
        const configs = professionalId
            ? await (prisma as any).dayConfig.findMany({ where: { tenantId, OR: [{ professionalId }, { professionalId: null }] } })
            : await (prisma as any).dayConfig.findMany({ where: { tenantId } });

        // Create a unique compound key map for the context: "YYYY-MM-DD_profId" or "YYYY-MM-DD" para global
        const configMap = configs.reduce((acc: Record<string, boolean>, curr: any) => {
            const key = curr.professionalId ? `${curr.date}_${curr.professionalId}` : curr.date;
            acc[key] = curr.isBlocked;
            return acc;
        }, {} as Record<string, boolean>);

        return NextResponse.json(configMap);
    } catch (error) {
        console.error('Error fetching day configs:', error);
        return NextResponse.json({ error: 'Error fetching day configs' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await request.json(); // { date: 'YYYY-MM-DD', isBlocked: boolean, professionalId?: string }

        const { date, isBlocked, professionalId } = data;

        if (!date || typeof isBlocked !== 'boolean') {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const effectiveProfessionalId = professionalId === 'all' ? null : (professionalId || null);

        if (!isBlocked) {
            // If unblocking, simply delete the record if it exists
            await (prisma as any).dayConfig.deleteMany({
                where: {
                    date,
                    professionalId: effectiveProfessionalId,
                    tenantId
                }
            });
        } else {
            // Upsert the record
            await (prisma as any).dayConfig.upsert({
                where: {
                    date_professionalId_tenantId: {
                        date,
                        professionalId: effectiveProfessionalId || "", // Workaround for Prisma unique nullable
                        tenantId
                    }
                },
                update: {
                    isBlocked: true
                },
                create: {
                    date,
                    isBlocked: true,
                    professionalId: effectiveProfessionalId,
                    tenantId
                }
            }).catch(async (e: any) => {
                // If the unique constraint is tricky with nulls, fallback to a more manual approach
                const existing = await (prisma as any).dayConfig.findFirst({
                    where: { date, professionalId: effectiveProfessionalId, tenantId }
                });
                if (!existing) {
                    await (prisma as any).dayConfig.create({
                        data: { date, isBlocked: true, professionalId: effectiveProfessionalId, tenantId }
                    });
                }
            });
        }

        return NextResponse.json({ success: true, config: { date, isBlocked, professionalId: effectiveProfessionalId } });
    } catch (error) {
        console.error('Error saving day config:', error);
        return NextResponse.json({ error: 'Error saving day config' }, { status: 500 });
    }
}
