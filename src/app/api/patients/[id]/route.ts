import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';

type RouteContext = { params: Promise<{ id: string }> };

function decryptPatient(p: any) {
    return {
        ...p,
        name: decrypt(p.name) || '',
        apellidos: decrypt(p.apellidos) || '',
        phone: decrypt(p.phone) || '',
        email: decrypt(p.email) || '',
        notes: p.notes ? decrypt(p.notes) : '',
        treatmentPlan: p.treatmentPlan ? decrypt(p.treatmentPlan) : '',
    };
}

export async function GET(request: Request, context: RouteContext) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await context.params;
        const patient = await (prisma as any).patient.findFirst({ where: { id, tenantId } });
        if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json(decryptPatient(patient));
    } catch (error) {
        console.error('GET /api/patients/[id] error:', error);
        return NextResponse.json({ error: 'Error fetching patient' }, { status: 500 });
    }
}

export async function PATCH(request: Request, context: RouteContext) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await context.params;
        const updates = await request.json();

        console.log(`[PATCH /api/patients/${id}] tenantId=${tenantId}`, updates);

        // Verify ownership
        const existing = await (prisma as any).patient.findFirst({ where: { id, tenantId } });
        if (!existing) {
            console.error(`[PATCH /api/patients/${id}] Not found for tenant ${tenantId}`);
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const updateData: any = {};
        if (updates.name !== undefined) updateData.name = encrypt(updates.name);
        if (updates.apellidos !== undefined) updateData.apellidos = encrypt(updates.apellidos || '');
        if (updates.phone !== undefined) updateData.phone = encrypt(updates.phone);
        if (updates.email !== undefined) updateData.email = encrypt(updates.email || '');
        if (updates.notes !== undefined) updateData.notes = updates.notes ? encrypt(updates.notes) : null;
        if (updates.treatmentPlan !== undefined) updateData.treatmentPlan = updates.treatmentPlan ? encrypt(updates.treatmentPlan) : null;
        if (updates.bloqueado !== undefined) updateData.bloqueado = updates.bloqueado;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(decryptPatient(existing));
        }

        const result = await (prisma as any).patient.update({
            where: { id },
            data: updateData,
        });

        console.log(`[PATCH /api/patients/${id}] Updated successfully`);
        return NextResponse.json(decryptPatient(result));
    } catch (error) {
        console.error(`PATCH /api/patients/[id] error:`, error);
        return NextResponse.json({ error: 'Error updating patient', detail: String(error) }, { status: 500 });
    }
}

export async function DELETE(request: Request, context: RouteContext) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await context.params;
        const patient = await (prisma as any).patient.findFirst({ where: { id, tenantId } });
        if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        await (prisma as any).patient.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/patients/[id] error:', error);
        return NextResponse.json({ error: 'Error deleting patient' }, { status: 500 });
    }
}
