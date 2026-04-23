const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    try {
        const tenants = await prisma.tenant.findMany();
        console.log("Tenants:", tenants);
        const users = await prisma.user.findMany();
        console.log("Users:", users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, tenantId: u.tenantId })));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
run();
