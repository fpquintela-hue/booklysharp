const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  // List all tenants
  const tenants = await prisma.tenant.findMany({ select: { alias: true, id: true } });
  console.log('Tenants disponibles:');
  tenants.forEach(t => console.log(' -', t.alias, '| id:', t.id));

  if (tenants.length === 0) {
    console.log('No hay tenants. No se puede crear cita de prueba.');
    await prisma.$disconnect();
    return;
  }

  const tenant = tenants[0];
  console.log('\nUsando tenant:', tenant.alias);

  // Find or create a patient
  let patient = await prisma.patient.findFirst({ where: { tenantId: tenant.id } });
  if (!patient) {
    // Encrypt name using simple base64 for test
    const encrypted = Buffer.from('Paciente Prueba').toString('base64');
    patient = await prisma.patient.create({
      data: {
        name: encrypted,
        email: 'prueba@test.com',
        phone: '600000000',
        tenantId: tenant.id
      }
    });
    console.log('Paciente creado:', patient.id);
  } else {
    console.log('Paciente existente:', patient.id);
  }

  // Create appointment
  const appointment = await prisma.appointment.create({
    data: {
      start: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      type: 'ORDINARY',
      status: 'SCHEDULED',
      notes: 'Cita de prueba',
      patientId: patient.id,
      tenantId: tenant.id
    }
  });

  console.log('\n✅ URL para probar (dev local):');
  console.log(`http://localhost:3000/${tenant.alias}/confirm/${appointment.id}`);

  await prisma.$disconnect();
}
run().catch(e => { console.error(e); process.exit(1); });
