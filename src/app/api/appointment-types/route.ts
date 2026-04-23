import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const types = await prisma.appointmentType.findMany({
            where: { tenantId }
        });
        return NextResponse.json(types);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to fetch appointment types' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { id, name, duration, color, action, price, image } = body;

        if (action === 'delete') {
            // Ensure at least one remains per tenant
            const count = await prisma.appointmentType.count({ where: { tenantId } });
            if (count <= 1) {
                return NextResponse.json({ error: 'At least one appointment type must remain.' }, { status: 400 });
            }
            // Must verify it belongs to tenant
            const type = await prisma.appointmentType.findFirst({ where: { id, tenantId } });
            if (!type) return NextResponse.json({ error: 'Not found' }, { status: 404 });

            await prisma.appointmentType.delete({ where: { id } });
            return NextResponse.json({ success: true });
        }

        // Check limit for new ones per tenant
        if (!id) {
            const count = await prisma.appointmentType.count({ where: { tenantId } });
            const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

            if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

            const limit = tenant.maxAppointmentTypes ?? 4;
            if (count >= limit) {
                return NextResponse.json({ error: `Maximum of ${limit} appointment types reached.` }, { status: 400 });
            }
        }

        let typeItem;
        if (id) {
            typeItem = await prisma.appointmentType.updateMany({
                where: { id, tenantId },
                data: { name, duration: parseInt(duration), color, price: price !== undefined && price !== null && price !== "" ? parseFloat(price) : null, image }
            });
            typeItem = await prisma.appointmentType.findUnique({ where: { id } });
        } else {
            typeItem = await prisma.appointmentType.create({
                data: { name, duration: parseInt(duration), color, price: price !== undefined && price !== null && price !== "" ? parseFloat(price) : null, image, tenantId }
            });
        }

        return NextResponse.json(typeItem);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to save appointment type' }, { status: 500 });
    }
}
