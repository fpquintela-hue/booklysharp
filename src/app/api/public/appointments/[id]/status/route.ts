import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();
        const { status } = data; // 'CONFIRMED' or 'CANCELLED'

        if (!status || !['CONFIRMED', 'CANCELLED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const existing = await (prisma as any).appointment.findUnique({
            where: { id },
            include: { tenant: true }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        const appointment = await (prisma as any).appointment.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ success: true, status: appointment.status });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        return NextResponse.json({ error: 'Error updating appointment status' }, { status: 500 });
    }
}
