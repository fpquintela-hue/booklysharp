const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const appointments = await prisma.appointment.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { tenant: true }
  });
  
  console.log('--- CITAS RECIENTES ---');
  appointments.forEach(app => {
    console.log(`ID: ${app.id}`);
    const alias = app.tenant ? app.tenant.alias : 'ferfer'; // Fallback to ferfer if null
    console.log(`Tenant: ${alias}`);
    console.log(`URL de Confirmación: http://192.168.1.6:3000/${alias}/confirm/${app.id}`);
    console.log('-----------------------');
  });
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
