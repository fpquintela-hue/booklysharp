const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const appts = await prisma.appointment.findMany({
    where: { tenantId: { not: null } },
    include: { tenant: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  if (appts.length === 0) {
    console.log('No appointments with tenantId found');
  } else {
    appts.forEach(a => {
      console.log('ID:', a.id, '| Tenant:', a.tenant && a.tenant.alias, '| Start:', a.start);
    });
  }
  await prisma.$disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
