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
            where: { alias },
            include: {
                professionals: {
                    where: { isActive: true },
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        color: true
                    }
                }
            }
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        return NextResponse.json({
            professionals: tenant.professionals
        });

    } catch (error) {
        console.error('Error fetching public professionals:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
