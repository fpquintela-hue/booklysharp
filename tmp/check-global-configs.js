const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkGlobalConfigs() {
    try {
        console.log('\n--- GLOBAL SETTINGS ---');
        const globalSettings = await prisma.setting.findMany({ 
            where: { tenantId: null } 
        });
        
        globalSettings.forEach(s => {
            console.log(`${s.key}: ${s.value}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkGlobalConfigs();
