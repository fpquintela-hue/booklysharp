const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function test() {
    try {
        const username = 'superadmin';
        const password = '1234admin';
        
        const superadmin = await prisma.superAdmin.findFirst({
            where: { username }
        });

        if (!superadmin) {
            console.log('User not found');
            return;
        }

        console.log('User password in DB:', superadmin.password);
        const match = await bcrypt.compare(password, superadmin.password);
        console.log('Match result:', match);
        
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
test();
