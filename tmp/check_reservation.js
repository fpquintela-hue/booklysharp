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

        // Buscamos pacientes que se llamen "Fernandito"
        const patients = await prisma.patient.findMany({
            where: {
                tenantId: tenant.id,
                name: { contains: 'Fernandito' }
            }
        });

        if (patients.length === 0) {
            console.log('No se encontró ningún paciente con el nombre "Fernandito"');
            return;
        }

        const patientIds = patients.map(p => p.id);

        // Fecha buscada: Jueves 26 de Marzo de 2026 (según el contexto local es 2026)
        // 09:00 AM. 
        // Usaremos un rango por si hay variaciones de huso horario o segundos
        const startSearch = new Date('2026-03-26T00:00:00Z');
        const endSearch = new Date('2026-03-26T23:59:59Z');

        const appointments = await prisma.appointment.findMany({
            where: {
                tenantId: tenant.id,
                patientId: { in: patientIds },
                start: {
                    gte: startSearch,
                    lte: endSearch
                }
            },
            include: {
                patient: true
            }
        });

        if (appointments.length === 0) {
            console.log('No hay citas para "Fernandito" el 26 de Marzo de 2026');
        } else {
            console.log(`Se han encontrado ${appointments.length} cita(s):`);
            appointments.forEach(app => {
                console.log(`- Paciente: ${app.patient.name} ${app.patient.apellidos}`);
                console.log(`  Inicio: ${app.start.toISOString()}`);
                console.log(`  Fin: ${app.end.toISOString()}`);
                console.log(`  Estado: ${app.status}`);
                console.log(`  Tipo: ${app.type}`);
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
