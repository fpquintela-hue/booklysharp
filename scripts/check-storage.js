/**
 * Inspección de almacenamiento — ejecutar EN el servidor (donde corre la app):
 *   node scripts/check-storage.js
 *
 * Muestra los ajustes globales (tenantId = NULL) enmascarando secretos,
 * y un recuento de filas por tabla. Sirve para verificar de un vistazo
 * cómo y dónde se está guardando la configuración del sistema.
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
    const mask = (k, v) => /PASS|SECRET|KEY|TOKEN/i.test(k) ? (v ? '••••(set)' : '(empty)') : v;
    console.log('DB =', (process.env.DATABASE_URL || '').replace(/:\/\/([^:]+):[^@]+@/, '://$1:****@'));

    const globals = await prisma.setting.findMany({ where: { tenantId: null }, orderBy: { key: 'asc' } });
    console.log('\n=== Settings GLOBALES (tenantId = NULL) ===');
    if (!globals.length) console.log('(ninguno todavía)');
    globals.forEach((s) => console.log(` ${s.key} = ${mask(s.key, s.value)}`));

    const [tenants, users, patients, appointments, settings, reminders] = await prisma.$transaction([
        prisma.tenant.count(), prisma.user.count(), prisma.patient.count(),
        prisma.appointment.count(), prisma.setting.count(), prisma.reminder.count(),
    ]);
    console.log('\n=== Recuento de filas ===');
    console.log(` tenants=${tenants} users=${users} patients=${patients} appointments=${appointments} settings=${settings} reminders=${reminders}`);

    await prisma.$disconnect();
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
