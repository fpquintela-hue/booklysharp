const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const tenant = await prisma.tenant.findUnique({
            where: { alias: 'axendamuller' }
        });

        if (!tenant) {
            console.log('Tenant "axendamuller" no encontrado');
            return;
        }

        const startDay = new Date('2026-03-26T00:00:00Z');
        const endDay = new Date('2026-03-26T23:59:59Z');

        const appointments = await prisma.appointment.findMany({
            where: {
                tenantId: tenant.id,
                start: {
                    gte: startDay,
                    lte: endDay
                }
            },
            include: {
                patient: true
            }
        });

        if (appointments.length === 0) {
            console.log('No hay ninguna reserva registrada para el 26 de Marzo de 2026.');
        } else {
            console.log(`Reservas encontradas para el 26 de Marzo:`);
            appointments.forEach(app => {
                const localStart = new Date(app.start).toLocaleString();
                console.log(`- [${localStart}] Paciente: ${app.patient.name} ${app.patient.apellidos}`);
                console.log(`  Estado: ${app.status} | Tipo: ${app.type}`);
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
