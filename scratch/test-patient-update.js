const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function test() {
    try {
        const r = await p.patient.findFirst({});
        console.log('DB OK, first patient:', r ? r.id : 'none');
        if (r) {
            console.log('name field:', r.name);
            console.log('treatmentPlan field:', r.treatmentPlan);
        }
        
        // Try an update
        if (r) {
            const updated = await p.patient.update({
                where: { id: r.id },
                data: { treatmentPlan: 'TEST' }
            });
            console.log('Update OK:', updated.treatmentPlan);
            // Restore
            await p.patient.update({
                where: { id: r.id },
                data: { treatmentPlan: r.treatmentPlan }
            });
        }
    } catch (e) {
        console.error('DB ERROR:', e.message);
        console.error('Full error:', e);
    } finally {
        await p.$disconnect();
    }
}

test();
