const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    let superadmin = await prisma.superAdmin.findFirst();
    console.log("Current SuperAdmin:", superadmin);

    if (superadmin) {
        // let's reset it to 1234admin
        const hashed = await bcrypt.hash('1234admin', 10);
        await prisma.superAdmin.update({
            where: { id: superadmin.id },
            data: { password: hashed }
        });
        console.log("SuperAdmin password reset to '1234admin'.");
    } else {
        const hashed = await bcrypt.hash('1234admin', 10);
        superadmin = await prisma.superAdmin.create({
            data: { username: 'superadmin', password: hashed }
        });
        console.log("SuperAdmin created with password '1234admin'.");
    }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
