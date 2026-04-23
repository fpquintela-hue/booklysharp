const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const alias = 'axendamuller';
        const dateStr = '2026-03-23'; // Lunes
        const targetDate = new Date(dateStr);
        const dayOfWeek = targetDate.getDay(); 

        const tenant = await prisma.tenant.findUnique({
            where: { alias },
            include: { settings: true, professionals: true, dayConfigs: true }
        });
        
        let settingsMap = tenant.settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        
        const generateSlots = (start, end, dayOfWeek, blockedSlotsGlobal) => {
            const isTimeBlocked = (time, day, blocks) => {
                return blocks.some(b => {
                    if (b.dayOfWeek !== day) return false;
                    return time >= b.startTime && time < b.endTime;
                });
            };
        
            const slots = [];
            if (!start || !end) return slots;
            let [h, m] = start.split(':').map(Number);
            let current = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            
            while (current < end) {
                if (!isTimeBlocked(current, dayOfWeek, blockedSlotsGlobal)) {
                    slots.push(current);
                }
                m += 30;
                if (m >= 60) {
                    h += 1;
                    m -= 60;
                }
                current = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                if (h >= 24) break; // Safety
            }
            return slots;
        };
        
        const blockedSlotsGlobal = settingsMap['blockedSlots'] ? JSON.parse(settingsMap['blockedSlots']) : [];
        const open1 = settingsMap['open_hour'] || '09:00';
        const close1 = settingsMap['close_hour'] || '14:00';
        const open2 = settingsMap['open_hour_afternoon'] || '16:00';
        const close2 = settingsMap['close_hour_afternoon'] || '20:00';
        
        const centerSlots = [...generateSlots(open1, close1, dayOfWeek, blockedSlotsGlobal), ...generateSlots(open2, close2, dayOfWeek, blockedSlotsGlobal)];
        console.log("centerSlots", centerSlots.length);

        const startOfTargetDay = new Date(dateStr);
        startOfTargetDay.setHours(0, 0, 0, 0);
        const endOfTargetDay = new Date(dateStr);
        endOfTargetDay.setHours(23, 59, 59, 999);

        const appointments = await prisma.appointment.findMany({
            where: {
                tenantId: tenant.id,
                start: { gte: startOfTargetDay, lte: endOfTargetDay },
                status: { not: 'CANCELLED' }
            }
        });

        const filterLog = [];
        
        const finalAvailableSlots = centerSlots.filter(slotTime => {
            const [sh, sm] = slotTime.split(':').map(Number);
            
            return tenant.professionals.some(prof => {
                const profBlocked = tenant.dayConfigs.some(c => c.date === dateStr && c.professionalId === prof.id && c.isBlocked);
                if (profBlocked) { filterLog.push(`${slotTime} - ${prof.name} blocked specific day`); return false; }

                const profBlocksKey = `blockedSlots_${prof.id}`;
                const profBlocks = settingsMap[profBlocksKey] ? JSON.parse(settingsMap[profBlocksKey]) : [];
                const isTimeBlocked = (time, day, blocks) => {
                    return blocks.some(b => {
                        if (b.dayOfWeek !== day) return false;
                        return time >= b.startTime && time < b.endTime;
                    });
                };
                if (isTimeBlocked(slotTime, dayOfWeek, profBlocks)) {
                     filterLog.push(`${slotTime} - ${prof.name} blocked time`);
                     return false;
                }

                const hasAppt = appointments.some(appt => {
                    if (appt.professionalId && appt.professionalId !== prof.id) return false;
                    const aStart = new Date(appt.start);
                    return aStart.getHours() === sh && aStart.getMinutes() === sm;
                });

                if (hasAppt) { filterLog.push(`${slotTime} - ${prof.name} has appt`); return false; }
                
                return true;
            });
        });

        console.log("finalAvailableSlots", finalAvailableSlots);
        if (finalAvailableSlots.length === 0) {
            console.log("LOG:", filterLog);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
