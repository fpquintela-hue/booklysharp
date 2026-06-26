/**
 * Apaga el aviso de modo mantenimiento directamente en la BD.
 * Ejecutar EN el servidor:  node scripts/maintenance-off.js
 *
 * Elimina además posibles filas DUPLICADAS de MAINTENANCE_ENABLED con
 * tenantId NULL (el índice único trata los NULL como distintos en Postgres,
 * así que pudieron quedar varias de pruebas anteriores) y deja una sola en 'false'.
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
    const rows = await prisma.setting.findMany({
        where: { key: 'MAINTENANCE_ENABLED', tenantId: null },
        orderBy: { id: 'asc' },
    });
    console.log(`Filas MAINTENANCE_ENABLED (tenantId NULL): ${rows.length}`);
    rows.forEach((r) => console.log(`  id=${r.id} value=${r.value}`));

    if (rows.length === 0) {
        await prisma.setting.create({ data: { key: 'MAINTENANCE_ENABLED', value: 'false', tenantId: null } });
        console.log('Creada MAINTENANCE_ENABLED = false');
    } else {
        // Conserva la primera en 'false', borra el resto (limpia duplicados).
        await prisma.setting.update({ where: { id: rows[0].id }, data: { value: 'false' } });
        const extra = rows.slice(1);
        if (extra.length) {
            await prisma.setting.deleteMany({ where: { id: { in: extra.map((r) => r.id) } } });
            console.log(`Borradas ${extra.length} fila(s) duplicada(s).`);
        }
        console.log('MAINTENANCE_ENABLED dejado en false ✓');
    }

    await prisma.$disconnect();
})().catch((e) => { console.error('ERROR:', e.message); process.exit(1); });
