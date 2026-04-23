const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkConfigs() {
    const alias = 'axendamuller';
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { alias },
            include: { 
                dayConfigs: true,
                settings: true
            }
        });

        if (!tenant) {
            console.log('Tenant not found');
            return;
        }

        console.log('\n--- SETTINGS ---');
        tenant.settings.forEach(s => {
            if (s.key.includes('hour') || s.key.includes('day')) {
                console.log(`${s.key}: ${s.value}`);
            }
        });

        console.log('\n--- DAY CONFIGS (Blocked Days) ---');
        tenant.dayConfigs.forEach(c => {
            console.log(`Date: ${c.date}, IsBlocked: ${c.isBlocked}, ProfId: ${c.professionalId}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkConfigs();
