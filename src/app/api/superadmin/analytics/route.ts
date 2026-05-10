import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { subDays, subMonths, startOfDay, endOfDay, format, isAfter, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    const now = new Date();
    let startDate = now;
    let dateFormat = 'MMM dd';
    let groupMode = 'day';

    if (range === '7d') {
        startDate = subDays(now, 6);
        dateFormat = 'dd MMM';
        groupMode = 'day';
    } else if (range === '30d') {
        startDate = subDays(now, 29);
        dateFormat = 'dd MMM';
        groupMode = 'day';
    } else if (range === '3m') {
        startDate = subMonths(now, 3);
        dateFormat = 'MMM yyyy';
        groupMode = 'month';
    } else if (range === '6m') {
        startDate = subMonths(now, 6);
        dateFormat = 'MMM yyyy';
        groupMode = 'month';
    } else if (range === '1y') {
        startDate = subMonths(now, 12);
        dateFormat = 'MMM yyyy';
        groupMode = 'month';
    }

    try {
        // Fetch all tenants for accurate cumulative data
        const allTenants = await prisma.tenant.findMany({
            select: {
                id: true,
                createdAt: true,
                subscription_status: true,
                subscription_plan: true,
                fecha_fin_suscripcion: true,
                expires_at: true
            },
            orderBy: { createdAt: 'asc' }
        });

        // Appointments within range (to save memory)
        const appointmentsInRange = await prisma.appointment.findMany({
            where: {
                createdAt: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(now)
                }
            },
            select: { id: true, createdAt: true }
        });

        // --- KPIs Logic ---
        const currentMonthStart = startOfDay(subDays(now, 30));
        const previousMonthStart = startOfDay(subDays(now, 60));

        const totalTenants = allTenants.length;
        const previousTenants = allTenants.filter(t => isBefore(t.createdAt, currentMonthStart)).length;
        const newTenantsThisMonth = allTenants.filter(t => isAfter(t.createdAt, currentMonthStart)).length;
        const newTenantsPreviousMonth = allTenants.filter(t => isAfter(t.createdAt, previousMonthStart) && isBefore(t.createdAt, currentMonthStart)).length;
        
        // Active Tenants for MRR
        const activeTenants = allTenants.filter(t => t.subscription_status !== 'expired');
        // Usamos un base de $29 si no hay price property 
        const currentMRR = activeTenants.length * 29;

        // Appointments
        const appointmentsThisMonth = await prisma.appointment.count({
            where: { createdAt: { gte: currentMonthStart } }
        });
        const appointmentsPreviousMonth = await prisma.appointment.count({
            where: { createdAt: { gte: previousMonthStart, lt: currentMonthStart } }
        });

        // Churn rate (Cancelados este mes / Total inicio mes)
        const cancelledThisMonth = allTenants.filter(t => {
            if (t.subscription_status !== 'expired') return false;
            const expDate = t.expires_at || t.fecha_fin_suscripcion;
            if (!expDate) return false;
            return isAfter(new Date(expDate), currentMonthStart);
        }).length;

        const churnRate = previousTenants > 0 ? (cancelledThisMonth / previousTenants) * 100 : 0;

        const kpis = {
            totalTenants,
            newTenantsThisMonth,
            newTenantsTrend: newTenantsThisMonth - newTenantsPreviousMonth,
            currentMRR,
            appointmentsThisMonth,
            appointmentsTrend: appointmentsThisMonth - appointmentsPreviousMonth,
            churnRate: churnRate.toFixed(1),
        };

        // --- Charts Data ---
        const chartData = [];
        let iterDate = startOfDay(startDate);
        let accumulatedTenants = allTenants.filter(t => isBefore(t.createdAt, iterDate)).length;

        while (isBefore(iterDate, endOfDay(now))) {
            let nextIter;
            
            if (groupMode === 'day') {
                nextIter = subDays(iterDate, -1);
            } else {
                nextIter = subMonths(iterDate, -1);
            }

            const periodName = format(iterDate, dateFormat, { locale: es });
            
            const altasInPeriod = allTenants.filter(t => t.createdAt >= iterDate && t.createdAt < nextIter).length;
            const appsInPeriod = appointmentsInRange.filter(a => a.createdAt >= iterDate && a.createdAt < nextIter).length;
            
            accumulatedTenants += altasInPeriod;
            
            const activeTenantsInPeriod = accumulatedTenants; 
            const mrrInPeriod = activeTenantsInPeriod * 29;

            chartData.push({
                name: periodName.charAt(0).toUpperCase() + periodName.slice(1),
                altas: altasInPeriod,
                totalTenants: activeTenantsInPeriod,
                mrr: mrrInPeriod,
                citas: appsInPeriod
            });

            iterDate = nextIter;
        }

        return NextResponse.json({ kpis, chartData });

    } catch (error) {
        console.error('Error in /api/superadmin/analytics:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
