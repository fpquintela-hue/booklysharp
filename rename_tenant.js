const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    try {
        let tenant = await prisma.tenant.findUnique({ where: { alias: 'default' } });
        if (!tenant) tenant = await prisma.tenant.findUnique({ where: { alias: 'axendamuller' } });

        if (tenant) {
            await prisma.tenant.update({
                where: { id: tenant.id },
                data: { alias: 'axendamuller', name: 'Axenda Muller' }
            });
            console.log("Renombrado tenant a axendamuller");

            // Fix existing admin user (admin@agenda.muller) to have username 'admin'
            const adminUser = await prisma.user.findFirst({
                where: { tenantId: tenant.id, role: 'ADMIN' }
            });

            if (adminUser) {
                await prisma.user.update({
                    where: { id: adminUser.id },
                    data: { name: 'admin', password: '1234admin' } // Set login requirements
                });
                console.log("Updated admin user successfully");
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
