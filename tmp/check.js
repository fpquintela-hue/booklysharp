const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  let tenant = await prisma.tenant.findUnique({ where: { alias: 'axendamuller' } });
  if (!tenant) {
      tenant = await prisma.tenant.findUnique({ where: { alias: 'axenda muller' } });
  }
  if (!tenant) {
      tenant = await prisma.tenant.findUnique({ where: { alias: 'axenda-muller' } });
  }
  if (!tenant) {
    console.log("No se encontró el negocio");
    return;
  }
  
  const targetDateStart = new Date('2026-03-30T00:00:00.000Z');
  const targetDateEnd = new Date('2026-03-30T23:59:59.999Z');

  console.log(`Buscando citas para tenant ${tenant.alias} en el día 2026-03-30...`);
  
  const appointments = await prisma.appointment.findMany({
    where: {
      tenantId: tenant.id,
      start: {
        gte: targetDateStart,
        lte: targetDateEnd
      }
    },
    include: {
      reminders: true,
      patient: true
    }
  });

  console.log(`Encontradas ${appointments.length} citas hoy.`);
  appointments.forEach(a => {
    console.log(`\nCita ID: ${a.id}`);
    console.log(`Hora: ${a.start}`);
    console.log(`Reminders:`);
    a.reminders.forEach(r => {
      console.log(`  - [${r.id}] Type: ${r.type}, timeMinutes: ${r.timeMinutes}, status: ${r.status}, updatedAt: ${r.updatedAt}`);
    });
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
