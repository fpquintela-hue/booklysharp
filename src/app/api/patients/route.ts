import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/encryption';

export async function GET(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const rawPatients = await (prisma as any).patient.findMany({
            where: { tenantId }
        });

        // Desencriptar datos
        const decryptedPatients = rawPatients.map((p: any) => ({
            ...p,
            name: decrypt(p.name) || '',
            apellidos: decrypt(p.apellidos) || '',
            phone: decrypt(p.phone) || '',
            email: decrypt(p.email) || '',
            notes: p.notes ? decrypt(p.notes) : '',
            treatmentPlan: p.treatmentPlan ? decrypt(p.treatmentPlan) : ''
        }));

        // Ordenar en memoria por apellidos y nombre, ya que en la base están cifrados
        decryptedPatients.sort((a: any, b: any) => {
            const apellidoA = (a.apellidos || '').toLowerCase();
            const apellidoB = (b.apellidos || '').toLowerCase();
            if (apellidoA < apellidoB) return -1;
            if (apellidoA > apellidoB) return 1;

            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;

            return 0;
        });

        return NextResponse.json(decryptedPatients);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error fetching patients' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await request.json();

        // If array, sync/import (Legacy support)
        if (Array.isArray(data)) {
            for (const p of data) {
                const secureData = {
                    name: encrypt(p.name || 'Sin Nombre') as string,
                    apellidos: encrypt(p.apellidos || '') as string,
                    phone: encrypt(p.phone || '000000000') as string,
                    email: encrypt(p.email || '') as string,
                    notes: p.notes ? (encrypt(p.notes) as string) : null,
                    treatmentPlan: p.treatmentPlan ? (encrypt(p.treatmentPlan) as string) : null,
                    bloqueado: p.bloqueado ?? false,
                };

                await (prisma as any).patient.upsert({
                    where: { id: p.id },
                    update: secureData,
                    create: { id: p.id, tenantId, ...secureData }
                });
            }
            return NextResponse.json({ success: true });
        }

        // Single Create
        const patientData = {
            name: encrypt(data.name) as string,
            apellidos: encrypt(data.apellidos || '') as string,
            phone: encrypt(data.phone) as string,
            email: encrypt(data.email || '') as string,
            notes: data.notes ? (encrypt(data.notes) as string) : null,
            treatmentPlan: data.treatmentPlan ? (encrypt(data.treatmentPlan) as string) : null,
            bloqueado: data.bloqueado ?? false,
            tenantId,
        };

        const result = await (prisma as any).patient.create({
            data: patientData
        });

        return NextResponse.json({
            ...result,
            name: decrypt(result.name),
            apellidos: decrypt(result.apellidos),
            phone: decrypt(result.phone),
            email: decrypt(result.email),
            notes: result.notes ? decrypt(result.notes) : '',
            treatmentPlan: result.treatmentPlan ? decrypt(result.treatmentPlan) : ''
        });
    } catch (error) {
        console.error('POST /api/patients error:', error);
        return NextResponse.json({ error: 'Error processing patient' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await request.json();
        const { id, ...updates } = data;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Verify ownership
        const existing = await (prisma as any).patient.findFirst({ where: { id, tenantId } });
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const updateData: any = {};
        if (updates.name !== undefined) updateData.name = encrypt(updates.name);
        if (updates.apellidos !== undefined) updateData.apellidos = encrypt(updates.apellidos || '');
        if (updates.phone !== undefined) updateData.phone = encrypt(updates.phone);
        if (updates.email !== undefined) updateData.email = encrypt(updates.email || '');
        if (updates.notes !== undefined) updateData.notes = updates.notes ? encrypt(updates.notes) : null;
        if (updates.treatmentPlan !== undefined) updateData.treatmentPlan = updates.treatmentPlan ? encrypt(updates.treatmentPlan) : null;
        if (updates.bloqueado !== undefined) updateData.bloqueado = updates.bloqueado;

        const result = await (prisma as any).patient.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json({
            ...result,
            name: decrypt(result.name),
            apellidos: decrypt(result.apellidos),
            phone: decrypt(result.phone),
            email: decrypt(result.email),
            notes: result.notes ? decrypt(result.notes) : '',
            treatmentPlan: result.treatmentPlan ? decrypt(result.treatmentPlan) : ''
        });
    } catch (error) {
        console.error('PATCH /api/patients error:', error);
        return NextResponse.json({ error: 'Error updating patient' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const p = await (prisma as any).patient.findFirst({ where: { id, tenantId } });
        if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        await (prisma as any).patient.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/patients error:', error);
        return NextResponse.json({ error: 'Error deleting patient' }, { status: 500 });
    }
}

