
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const types = await prisma.appointmentType.findMany();
    console.log(JSON.stringify(types, null, 2));
    process.exit(0);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
});
