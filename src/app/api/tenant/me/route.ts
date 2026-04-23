import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                maxProfessionals: true,
                maxAppointmentTypes: true,
            }
        });

        if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });

        return NextResponse.json(tenant);
    } catch (error) {
        console.error('Error fetching tenant me:', error);
        return NextResponse.json({ error: 'Error fetching tenant profile' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        
        // Build data object only with provided fields
        const data: any = {};
        if (body.billing_info !== undefined) data.billing_info = body.billing_info;
        if (body.payment_methods !== undefined) data.payment_methods = body.payment_methods;
        if (body.auto_renew !== undefined) data.auto_renew = body.auto_renew;
        if (body.subscription_plan !== undefined) data.subscription_plan = body.subscription_plan;

        const tenant = await prisma.tenant.update({
            where: { id: tenantId },
            data
        });

        return NextResponse.json({ success: true, tenant });
    } catch (error) {
        console.error('Error updating tenant:', error);
        return NextResponse.json({ error: 'Error updating tenant' }, { status: 500 });
    }
}
