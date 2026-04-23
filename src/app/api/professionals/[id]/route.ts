import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const data = await request.json();

        const existing = await prisma.professional.findFirst({ where: { id, tenantId } });
        if (!existing) return NextResponse.json({ error: 'Professional not found' }, { status: 404 });

        const professional = await prisma.professional.update({
            where: { id },
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                color: data.color,
                description: data.description,
                isActive: data.isActive,
            },
        });

        return NextResponse.json(professional);
    } catch (error) {
        console.error('Error updating professional:', error);
        return NextResponse.json({ error: 'Error updating professional' }, { status: 500 });
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

        // We might want to check if there are appointments first, 
        // but for now let's just allow deleting if the user wants.
        const existing = await prisma.professional.findFirst({ where: { id, tenantId } });
        if (!existing) return NextResponse.json({ error: 'Professional not found' }, { status: 404 });

        await prisma.professional.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting professional:', error);
        return NextResponse.json({ error: 'Error deleting professional' }, { status: 500 });
    }
}
