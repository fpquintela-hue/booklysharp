import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        const totalTenants = await (prisma as any).tenant.count();
        const totalAppointments = await (prisma as any).appointment.count();
        const totalProfessionals = await (prisma as any).professional.count();
        
        // Growth calc (dummy but based on something)
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const previousTenants = await (prisma as any).tenant.count({
            where: { createdAt: { lt: lastMonth } }
        });
        
        const growth = previousTenants === 0 ? 100 : ((totalTenants - previousTenants) / previousTenants) * 100;

        return NextResponse.json({
            totalTenants,
            totalAppointments,
            totalProfessionals,
            growth: growth.toFixed(1)
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Error fetching stats' }, { status: 500 });
    }
}
