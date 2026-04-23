const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const alias = 'axendamuller';
        const tenant = await prisma.tenant.findUnique({
            where: { alias },
            include: { settings: true, dayConfigs: true }
        });
        
        console.log("--- TENANT SETTINGS ---");
        tenant.settings.forEach(s => {
            if (['open_hour', 'close_hour', 'open_hour_afternoon', 'close_hour_afternoon', 'blockedSlots'].includes(s.key)) {
                console.log(`${s.key}: ${s.value}`);
            }
        });

        console.log("\n--- DAY CONFIGS (BLOCKED) ---");
        tenant.dayConfigs.filter(d => d.isBlocked).forEach(d => {
            console.log(`Date: ${d.date}, Prof: ${d.professionalId || 'CENTER'}, Blocked: ${d.isBlocked}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
