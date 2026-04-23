import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const alias = 'axendamuller';
  const todayStr = '2026-03-26';
  const startOfDay = new Date(`${todayStr}T00:00:00+01:00`);
  const endOfDay = new Date(`${todayStr}T23:59:59+01:00`);

  const tenant = await prisma.tenant.findUnique({
    where: { alias },
    include: {
      settings: true,
      appointments: {
        where: {
          start: { gte: startOfDay, lte: endOfDay },
          status: { not: 'CANCELLED' }
        },
        include: {
          patient: true,
          reminders: true
        }
      }
    }
  });

  if (!tenant) {
    console.log('Tenant not found');
    return;
  }

  const reminderSettings = tenant.settings.filter(s => s.key.startsWith('reminders_') || s.key === 'reminders');

  console.log(JSON.stringify({
    tenantName: tenant.nombre_comercial,
    reminderSettings,
    appointmentsCount: tenant.appointments.length,
    appointments: tenant.appointments.map(a => ({
      id: a.id,
      start: a.start,
      patient: a.patient.id, // Just ID for now or name if needed (remember to decrypt if encrypted!)
      reminders: a.reminders.map(r => ({
        type: r.type,
        time: r.timeMinutes,
        status: r.status
      }))
    }))
  }, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
