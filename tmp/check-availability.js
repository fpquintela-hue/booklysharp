const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAvailability() {
    const alias = 'axendamuller';
    const dates = ['2026-03-22', '2026-03-23'];

    try {
        const tenant = await prisma.tenant.findUnique({
            where: { alias },
            include: { appointments: true }
        });

        if (!tenant) {
            console.log('Tenant "axendamuller" not found.');
            return;
        }

        const allSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '16:00', '16:30', '17:00'];

        for (const dateStr of dates) {
            console.log(`\n--- Checking: ${dateStr} ---`);
            const startOfDay = new Date(dateStr);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(dateStr);
            endOfDay.setHours(23, 59, 59, 999);

            const dayAppointments = await prisma.appointment.findMany({
                where: {
                    tenantId: tenant.id,
                    start: { gte: startOfDay, lte: endOfDay }
                }
            });

            console.log(`Existing appointments: ${dayAppointments.length}`);
            dayAppointments.forEach(a => console.log(` - ${a.start.getHours()}:${a.start.getMinutes().toString().padStart(2, '0')}`));

            const available = allSlots.filter(s => {
                const [h, m] = s.split(':').map(Number);
                return !dayAppointments.some(a => a.start.getHours() === h && a.start.getMinutes() === m);
            });

            console.log(`Available slots (${available.length}): ${available.join(', ') || 'NONE'}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkAvailability();
