const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    try {
        const superadmin = await prisma.superAdmin.findFirst({
            where: { username: 'superadmin' }
        });

        if (!superadmin) {
             const hashed = await bcrypt.hash('1234admin', 10);
                await prisma.superAdmin.create({
                    data: { username: 'superadmin', password: hashed }
                });
                console.log('No existía el superadmin: CREADO con password 1234admin');
        } else {
            const hashed = await bcrypt.hash('1234admin', 10);
            await prisma.superAdmin.update({
                where: { id: superadmin.id },
                data: { password: hashed }
            });
            console.log('Superadmin ENCONTRADO: Password RESETEADO a 1234admin');
        }
    } catch (e) {
        console.error('Error al resetear superadmin:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
