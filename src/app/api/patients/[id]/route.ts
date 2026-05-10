import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';

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

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const patient = await (prisma as any).patient.findFirst({ where: { id, tenantId } });
        if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json(decryptPatient(patient));
    } catch (error) {
        console.error('GET /api/patients/[id] error:', error);
        return NextResponse.json({ error: 'Error fetching patient' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const updates = await request.json();

        // Verify ownership first
        const existing = await (prisma as any).patient.findFirst({ 
            where: { id, tenantId },
            select: { id: true } 
        });
        
        if (!existing) return NextResponse.json({ error: 'Patient not found' }, { status: 404 });

        // Map updates to encrypted data
        const updateData: any = {};
        const fields = ['name', 'apellidos', 'phone', 'email', 'notes', 'treatmentPlan', 'bloqueado'];
        
        for (const field of fields) {
            if (updates[field] !== undefined) {
                const val = updates[field];
                if (field === 'bloqueado') {
                    updateData[field] = !!val;
                } else if (val === null || val === undefined || val === '') {
                    updateData[field] = null;
                } else {
                    updateData[field] = encrypt(String(val));
                }
            }
        }

        const result = await (prisma as any).patient.update({
            where: { id },
            data: updateData,
        });

        // Return clean decrypted object
        return NextResponse.json({
            id: result.id,
            name: decrypt(result.name) || '',
            apellidos: decrypt(result.apellidos) || '',
            phone: decrypt(result.phone) || '',
            email: decrypt(result.email) || '',
            notes: decrypt(result.notes) || '',
            treatmentPlan: decrypt(result.treatmentPlan) || '',
            bloqueado: result.bloqueado,
            updatedAt: result.updatedAt
        });
    } catch (error: any) {
        console.error('CRITICAL: PATCH /api/patients/[id] failed:', error);
        return NextResponse.json({ 
            error: 'Database update failed', 
            detail: error.message,
            code: error.code // Prisma error code (e.g. P2002)
        }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const patient = await (prisma as any).patient.findFirst({ where: { id, tenantId } });
        if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        await (prisma as any).patient.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/patients/[id] error:', error);
        return NextResponse.json({ error: 'Error deleting patient' }, { status: 500 });
    }
}
