
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { decrypt } = require('./src/lib/encryption');

async function main() {
  const alias = 'axenda muller';
  const tenant = await prisma.tenant.findUnique({ where: { alias } });
  
  if (!tenant) {
    const t2 = await prisma.tenant.findUnique({ where: { alias: 'axenda-muller' } });
    if (!t2) {
      console.log("No se encontró el negocio 'axenda muller'.");
      return;
    }
    await checkReminders(t2);
  } else {
    await checkReminders(tenant);
  }
}

async function checkReminders(tenant) {
  const today = new Date('2026-03-30T00:00:00');
  const start = new Date(today);
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  console.log(`\n🔍 Auditoría para: ${tenant.name} (${today.toLocaleDateString()})`);

  // 1. Check Reminders table (Scheduled ones like 24h before)
  const sentReminders = await prisma.reminder.findMany({
    where: {
      appointment: { tenantId: tenant.id },
      status: 'SENT',
      updatedAt: { gte: start, lte: end }
    },
    include: { appointment: { include: { patient: true } } },
    orderBy: { updatedAt: 'desc' }
  });

  if (sentReminders.length > 0) {
    console.log(`\n✅ Se enviaron ${sentReminders.length} recordatorios programados hoy:`);
    sentReminders.forEach(r => {
      const p = r.appointment.patient;
      const patientName = decrypt(p.name);
      console.log(` - [${r.type}] Cita: ${r.appointment.start.toLocaleString()} | Para: ${patientName} | Hora envío: ${r.updatedAt.toLocaleTimeString()}`);
    });
  } else {
    console.log("\n⚠️ No hay recordatorios PROGRAMADOS (ej. 24h antes) marcados como SENT hoy.");
  }

  // 2. Check Appointments created today (with immediate notifications)
  const todayAppts = await prisma.appointment.findMany({
    where: {
      tenantId: tenant.id,
      createdAt: { gte: start, lte: end }
    },
    include: { patient: true, reminders: true }
  });

  if (todayAppts.length > 0) {
    console.log(`\n📅 Se realizaron ${todayAppts.length} reservas hoy:`);
    todayAppts.forEach(a => {
      const patientName = decrypt(a.patient.name);
      const isSent = a.reminders.some(r => r.timeMinutes === 0 && r.status === 'SENT');
      console.log(` - Reserva: ${a.type} | Para: ${patientName} | Notificación inmediata: ${isSent ? 'ENVIADA ✅' : 'PENDIENTE/NO CONFIG. ⏳'}`);
    });
  } else {
    console.log("\n📭 No se realizaron nuevas reservas hoy.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
