import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { addDays, isAfter, startOfDay as fnsStartOfDay } from 'date-fns';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const alias = searchParams.get('alias');
        const dateStr = searchParams.get('date');
        const professionalId = searchParams.get('professionalId');

        if (!alias || !dateStr) {
            return NextResponse.json({ error: 'Alias and Date are required' }, { status: 400 });
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

        const [y, m, d] = dateStr.split('-').map(Number);
        const targetDate = new Date(y, m - 1, d);
        const today = fnsStartOfDay(new Date());

        const settingsMap = tenant.settings.reduce((acc: Record<string, string>, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);

        const advanceMode = settingsMap['bookingAdvanceMode'] || 'automatic';
        const advanceWindow = settingsMap['bookingAdvanceWindow'] || '1m';

        if (advanceMode === 'automatic') {
            let maxDate = addDays(today, 30);
            if (advanceWindow === '1w') maxDate = addDays(today, 7);
            else if (advanceWindow === '15d') maxDate = addDays(today, 15);
            else if (advanceWindow === '2m') maxDate = addDays(today, 60);
            if (isAfter(fnsStartOfDay(targetDate), maxDate)) {
                return NextResponse.json({ availableSlots: [], message: 'Agenda no abierta' });
            }
        }

        const dayOfWeek = targetDate.getDay();
        const centerConfig = tenant.dayConfigs.find((c: any) => c.date === dateStr && c.professionalId === null);
        if (centerConfig?.isBlocked) {
            return NextResponse.json({ availableSlots: [], message: 'Día no laboral' });
        }

        const open1 = settingsMap['startTime'] || settingsMap['open_hour'] || '08:00';
        const close1 = settingsMap['endTime'] || settingsMap['close_hour'] || '14:00';
        const open2 = settingsMap['open_hour_afternoon']; 
        const close2 = settingsMap['close_hour_afternoon'];
        const blockedSlotsGlobal = settingsMap['blockedSlots'] ? JSON.parse(settingsMap['blockedSlots']) : [];

        const isTimeBlocked = (time: string, day: number, blocks: any[]) => {
            return blocks.some(b => Number(b.dayOfWeek) === day && time >= b.startTime && time < b.endTime);
        };

        const generateSlots = (start: string | undefined, end: string | undefined) => {
            if (!start || !end || start === end) return [];
            const slots = [];
            let [h, min] = start.split(':').map(Number);
            let current = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
            while (current < end) {
                if (!isTimeBlocked(current, dayOfWeek, blockedSlotsGlobal)) slots.push(current);
                min += 30; if (min >= 60) { h += 1; min -= 60; }
                current = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
                if (h >= 24) break;
            }
            return slots;
        };

        const centerSlots = [...generateSlots(open1, close1), ...generateSlots(open2, close2)];

        const startOfTargetDay = new Date(`${dateStr}T00:00:00`);
        const endOfTargetDay = new Date(`${dateStr}T23:59:59`);
        const appointments = await prisma.appointment.findMany({
            where: {
                tenantId: tenant.id,
                start: { gte: startOfTargetDay, lte: endOfTargetDay },
                status: { not: 'CANCELLED' }
            }
        });

        const activeProfessionals = tenant.professionals.filter((p: any) => {
            if (!p.isActive) return false;
            if (professionalId && p.id !== professionalId) return false;
            return true;
        });

        const finalAvailableSlots = centerSlots.filter(slotTime => {
            const availableProfs = activeProfessionals.filter((prof: any) => {
                const profBlocked = tenant.dayConfigs.some((c: any) => c.date === dateStr && c.professionalId === prof.id && c.isBlocked);
                if (profBlocked) return false;
                const profBlocks = settingsMap[`blockedSlots_${prof.id}`] ? JSON.parse(settingsMap[`blockedSlots_${prof.id}`]) : [];
                return !isTimeBlocked(slotTime, dayOfWeek, profBlocks);
            });
            if (availableProfs.length === 0) return false;

            const [sh, sm] = slotTime.split(':').map(Number);
            const conflictingAppts = appointments.filter((appt: any) => {
                const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });
                const aStartStr = fmt.format(new Date(appt.start));
                const aEndStr = fmt.format(new Date(appt.end));
                
                const aMins = parseInt(aStartStr.split(':')[0]) * 60 + parseInt(aStartStr.split(':')[1]);
                const aEndMins = parseInt(aEndStr.split(':')[0]) * 60 + parseInt(aEndStr.split(':')[1]);
                const sMins = sh * 60 + sm;
                
                return sMins >= aMins && sMins < aEndMins;
            });

            let busyCount = 0;
            const availableProfIds = availableProfs.map((p: any) => p.id);
            busyCount += conflictingAppts.filter((a: any) => a.professionalId && availableProfIds.includes(a.professionalId)).length;
            busyCount += conflictingAppts.filter((a: any) => !a.professionalId).length;

            return availableProfs.length > busyCount;
        });

        // Filter out past slots if today
        const now = new Date();
        const madridTime = new Intl.DateTimeFormat('en-GB', { 
            timeZone: 'Europe/Madrid', 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
        }).format(now);
        const [currH, currM] = madridTime.split(':').map(Number);

        const filteredSlots = finalAvailableSlots.filter(slotTime => {
            if (targetDate.getTime() === today.getTime()) {
                const [sh, sm] = slotTime.split(':').map(Number);
                if (sh < currH) return false;
                if (sh === currH && sm <= currM) return false;
            }
            return true;
        });

        const slotsWithProfs = filteredSlots.map(slotTime => {
            const [sh, sm] = slotTime.split(':').map(Number);
            const slotDate = new Date(`${dateStr}T${String(sh).padStart(2, '0')}:${String(sm).padStart(2, '0')}:00`);
            const availableProfs = activeProfessionals.filter((prof: any) => {
                const profBlocked = tenant.dayConfigs.some((c: any) => c.date === dateStr && c.professionalId === prof.id && c.isBlocked);
                if (profBlocked) return false;
                const profBlocks = settingsMap[`blockedSlots_${prof.id}`] ? JSON.parse(settingsMap[`blockedSlots_${prof.id}`]) : [];
                if (isTimeBlocked(slotTime, dayOfWeek, profBlocks)) return false;
                const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });
                return !appointments.some((appt: any) => {
                    if (appt.professionalId !== prof.id) return false;
                    const aStartStr = fmt.format(new Date(appt.start));
                    const aEndStr = fmt.format(new Date(appt.end));
                    const aMins = parseInt(aStartStr.split(':')[0]) * 60 + parseInt(aStartStr.split(':')[1]);
                    const aEndMins = parseInt(aEndStr.split(':')[0]) * 60 + parseInt(aEndStr.split(':')[1]);
                    const sMins = sh * 60 + sm;
                    return sMins >= aMins && sMins < aEndMins;
                });
            });
            return { time: slotTime, professionals: availableProfs.map((p: any) => ({ id: p.id, name: p.name })) };
        });

        return NextResponse.json({ availableSlots: filteredSlots, slotDetails: slotsWithProfs });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
