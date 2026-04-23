import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const now = new Date();
        const currentMonthStart = startOfMonth(now);
        const currentMonthEnd = endOfMonth(now);
        
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        const [currentCount, lastCount] = await Promise.all([
            (prisma as any).appointment.count({
                where: {
                    tenantId,
                    start: {
                        gte: currentMonthStart,
                        lte: currentMonthEnd
                    }
                }
            }),
            (prisma as any).appointment.count({
                where: {
                    tenantId,
                    start: {
                        gte: lastMonthStart,
                        lte: lastMonthEnd
                    }
                }
            })
        ]);

        let percentage = 0;
        if (lastCount > 0) {
            percentage = Math.round(((currentCount - lastCount) / lastCount) * 100);
        } else if (currentCount > 0) {
            percentage = 100;
        }

        return NextResponse.json({
            count: currentCount,
            percentage: percentage,
            trend: percentage >= 0 ? 'up' : 'down'
        });
    } catch (error) {
        console.error('Stats API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
