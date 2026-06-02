import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { startOfMonth, endOfMonth, addDays, format, startOfDay } from 'date-fns';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const alias = searchParams.get('alias');
        const year = searchParams.get('year');
        const month = searchParams.get('month'); 
        const professionalId = searchParams.get('professionalId');

        if (!alias || !year || !month) {
            return NextResponse.json({ error: 'Alias, year and month are required' }, { status: 400 });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { alias },
            include: {
                settings: true,
                professionals: true,
                dayConfigs: true
            }
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        const monthI = Number(month);
        const yearI = Number(year);
        const monthStart = startOfMonth(new Date(yearI, monthI - 1, 1));
        const monthEnd = endOfMonth(new Date(yearI, monthI - 1, 1));
        
        const allDaysInMonth = [];
        let cur = monthStart;
        while (cur <= monthEnd) {
            allDaysInMonth.push(cur);
            cur = addDays(cur, 1);
        }

        const settingsMap = tenant.settings.reduce((acc: Record<string, string>, curr: { key: string, value: string }) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        const open1 = settingsMap['startTime'] || settingsMap['open_hour'] || '07:00';
        const close1 = settingsMap['endTime'] || settingsMap['close_hour'] || '21:00';
        const open2 = settingsMap['open_hour_afternoon']; 
        const close2 = settingsMap['close_hour_afternoon'];
        const blockedSlotsGlobal = settingsMap['blockedSlots'] ? JSON.parse(settingsMap['blockedSlots']) : [];

        const isTimeBlocked = (time: string, day: number, blocks: any[]) => {
            return blocks.some((b: any) => Number(b.dayOfWeek) === day && time >= b.startTime && time < b.endTime);
        };

        const generateSlots = (start: string | undefined, end: string | undefined, dayOfWeek: number) => {
            if (!start || !end || start === end) return [];
            const slots = [];
            let [h, m] = start.split(':').map(Number);
            let current = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            while (current < end) {
                if (!isTimeBlocked(current, dayOfWeek, blockedSlotsGlobal)) slots.push(current);
                m += 30; if (m >= 60) { h += 1; m -= 60; }
                current = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                if (h >= 24) break;
            }
            return slots;
        };

        const appointments = await prisma.appointment.findMany({
            where: {
                tenantId: tenant.id,
                start: { gte: monthStart, lte: monthEnd },
                status: { not: 'CANCELLED' }
            }
        });

        const activeProfessionals = tenant.professionals.filter((p: any) => {
            if (!p.isActive) return false;
            if (professionalId && p.id !== professionalId) return false;
            return true;
        });

        const availableDates = [];
        if (activeProfessionals.length > 0) {
            for (const date of allDaysInMonth) {
                if (date < startOfDay(new Date())) continue;
                const dStr = format(date, 'yyyy-MM-dd');
                const dayOfWeek = date.getDay();
                if (tenant.dayConfigs.find((c: any) => c.date === dStr && c.professionalId === null && c.isBlocked)) continue;

                const centerSlots = [...generateSlots(open1, close1, dayOfWeek), ...generateSlots(open2, close2, dayOfWeek)];
                if (centerSlots.length === 0) continue;

                const hasSlot = centerSlots.some(slotTime => {
                    const availableProfs = activeProfessionals.filter((prof: any) => {
                        if (tenant.dayConfigs.some((c: any) => c.date === dStr && c.professionalId === prof.id && c.isBlocked)) return false;
                        const pBlocks = settingsMap[`blockedSlots_${prof.id}`] ? JSON.parse(settingsMap[`blockedSlots_${prof.id}`]) : [];
                        return !isTimeBlocked(slotTime, dayOfWeek, pBlocks);
                    });
                    if (availableProfs.length === 0) return false;

                    const [sh, sm] = slotTime.split(':').map(Number);
                    const slotDate = new Date(`${dStr}T${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00`);
                    const conflicting = appointments.filter((appt: any) => {
                        const aStart = new Date(appt.start);
                        const aEnd = new Date(appt.end);
                        return slotDate >= aStart && slotDate < aEnd;
                    });

                    let busy = 0;
                    const aIds = availableProfs.map((p: any) => p.id);
                    busy += conflicting.filter((a: any) => a.professionalId && aIds.includes(a.professionalId)).length;
                    busy += conflicting.filter((a: any) => !a.professionalId).length;
                    return availableProfs.length > busy;
                });

                if (hasSlot) availableDates.push(dStr);
            }
        }

        return NextResponse.json({ availableDates });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
