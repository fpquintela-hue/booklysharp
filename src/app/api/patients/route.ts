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

        // If array, sync/import
        if (Array.isArray(data)) {
            // Upsert patients one by one
            for (const p of data) {
                const existing = await (prisma as any).patient.findFirst({ where: { id: p.id, tenantId } });
                const secureData = {
                    name: encrypt(p.name) as string,
                    apellidos: encrypt(p.apellidos || '') as string,
                    phone: encrypt(p.phone) as string,
                    email: encrypt(p.email) as string,
                    notes: p.notes ? (encrypt(p.notes) as string) : null,
                    treatmentPlan: p.treatmentPlan ? (encrypt(p.treatmentPlan) as string) : null,
                    bloqueado: p.bloqueado ?? false,
                };

                if (existing) {
                    await (prisma as any).patient.update({
                        where: { id: p.id },
                        data: secureData
                    });
                } else {
                    await (prisma as any).patient.create({
                        data: {
                            id: p.id,
                            tenantId,
                            ...secureData
                        }
                    });
                }
            }
            return NextResponse.json({ success: true });
        }

        // Single create/update
        const id = data.id;
        let result;
        if (id) {
            // First verify it belongs to tenant
            const p = await (prisma as any).patient.findFirst({ where: { id, tenantId } });
            if (!p) return NextResponse.json({ error: 'Not found' }, { status: 404 });

            const updateData: any = {};
            if (data.name !== undefined) updateData.name = encrypt(data.name);
            if (data.apellidos !== undefined) updateData.apellidos = encrypt(data.apellidos || '');
            if (data.phone !== undefined) updateData.phone = encrypt(data.phone);
            if (data.email !== undefined) updateData.email = encrypt(data.email || '');
            if (data.notes !== undefined) updateData.notes = data.notes ? encrypt(data.notes) : null;
            if (data.treatmentPlan !== undefined) updateData.treatmentPlan = data.treatmentPlan ? encrypt(data.treatmentPlan) : null;
            if (data.bloqueado !== undefined) updateData.bloqueado = data.bloqueado;

            result = await (prisma as any).patient.update({
                where: { id },
                data: updateData
            });
        } else {
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

            // 🔍 CHECK FOR DUPLICATES: 
            // 1. Email must be UNIQUE per tenant (if provided)
            // 2. Name + Apellidos + Phone must be unique (to allow family grouping by phone)
            
            const allPatients = await (prisma as any).patient.findMany({ where: { tenantId } });
            
            const inputName = data.name.trim().toLowerCase();
            const inputApellidos = (data.apellidos || '').trim().toLowerCase();
            const inputPhone = data.phone.replace(/\s+/g, '');
            const inputEmail = (data.email || '').trim().toLowerCase();

            const existing = allPatients.find((p: any) => {
                const decEmail = (decrypt(p.email) || '').trim().toLowerCase();
                
                // If email is provided and matches -> It's the same person (Email is unique)
                if (inputEmail && decEmail === inputEmail) return true;

                // Otherwise, check for Name + Apellidos + Phone (Family Grouping)
                const decName = (decrypt(p.name) || '').trim().toLowerCase();
                const decApellidos = (decrypt(p.apellidos) || '').trim().toLowerCase();
                const decPhone = (decrypt(p.phone) || '').replace(/\s+/g, '');

                return decName === inputName && decApellidos === inputApellidos && decPhone === inputPhone;
            });

            if (existing) {
                result = existing;
            } else {
                result = await (prisma as any).patient.create({
                    data: patientData
                });
            }
        }

        // Decrypt result back for the frontend
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
        console.error(error);
        return NextResponse.json({ error: 'Error processing patient' }, { status: 500 });
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
        console.error(error);
        return NextResponse.json({ error: 'Error deleting patient' }, { status: 500 });
    }
}
