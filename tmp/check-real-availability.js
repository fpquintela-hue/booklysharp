const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const alias = 'axendamuller';
        const tenant = await prisma.tenant.findUnique({
            where: { alias },
            include: { settings: true, professionals: true, dayConfigs: true }
        });
        
        console.log("TENANT FOUND:", tenant?.name);
        if (!tenant) return;
        
        const settingsMap = tenant.settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        
        console.log("open_hour:", settingsMap['open_hour']);
        console.log("close_hour:", settingsMap['close_hour']);
        console.log("open_hour_afternoon:", settingsMap['open_hour_afternoon']);
        console.log("close_hour_afternoon:", settingsMap['close_hour_afternoon']);
        console.log("blockedSlots:", settingsMap['blockedSlots']);
        
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
        console.log("BlockedSlots Parsed:", blockedSlotsGlobal);
        
        const dateStr = '2026-03-23'; // Lunes 23 de marzo de 2026
        const targetDate = new Date(dateStr);
        const dayOfWeek = targetDate.getDay(); 
        
        const centerConfig = tenant.dayConfigs.find(c => c.date === dateStr && c.professionalId === null);
        console.log("Center closed strictly?", !!centerConfig?.isBlocked);

        const open1 = settingsMap['open_hour'] || '09:00';
        const close1 = settingsMap['close_hour'] || '14:00';
        const open2 = settingsMap['open_hour_afternoon'] || '16:00';
        const close2 = settingsMap['close_hour_afternoon'] || '20:00';
        
        const centerSlots = [...generateSlots(open1, close1, dayOfWeek, blockedSlotsGlobal), ...generateSlots(open2, close2, dayOfWeek, blockedSlotsGlobal)];
        console.log("Center raw slots for day", dayOfWeek, ":", centerSlots);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
