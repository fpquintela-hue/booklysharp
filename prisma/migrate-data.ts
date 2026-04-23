import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting data migration...');

    // 1. Split names for Users
    const users = await prisma.user.findMany();
    for (const user of users) {
        if (user.name && user.name.includes(' ') && (user.apellidos === '' || !user.apellidos)) {
            const firstSpaceIndex = user.name.indexOf(' ');
            const newName = user.name.substring(0, firstSpaceIndex).trim();
            const newApellidos = user.name.substring(firstSpaceIndex + 1).trim();

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    name: newName,
                    apellidos: newApellidos
                }
            });
            console.log(`Updated User: ${user.name} -> ${newName} | ${newApellidos}`);
        }
    }

    // 2. Split names for Patients
    const patients = await prisma.patient.findMany();
    for (const patient of patients) {
        if (patient.name && patient.name.includes(' ') && (patient.apellidos === '' || !patient.apellidos)) {
            const firstSpaceIndex = patient.name.indexOf(' ');
            const newName = patient.name.substring(0, firstSpaceIndex).trim();
            const newApellidos = patient.name.substring(firstSpaceIndex + 1).trim();

            await prisma.patient.update({
                where: { id: patient.id },
                data: {
                    name: newName,
                    apellidos: newApellidos
                }
            });
            console.log(`Updated Patient: ${patient.name} -> ${newName} | ${newApellidos}`);
        }
    }

    // 3. Seed Appointment Types
    const defaultTypes = [
        { name: 'ordinaria', duration: 30, color: '#3b82f6' },
        { name: 'urgencia', duration: 30, color: '#ef4444' },
        { name: 'bloqueo', duration: 30, color: '#6b7280' }
    ];

    const defaultTenant = await prisma.tenant.findFirst();
    if (defaultTenant) {
        for (const type of defaultTypes) {
            await prisma.appointmentType.upsert({
                where: { name_tenantId: { name: type.name, tenantId: defaultTenant.id } },
                update: {},
                create: { ...type, tenantId: defaultTenant.id }
            });
            console.log(`Ensured AppointmentType: ${type.name}`);
        }
    }

    console.log('Data migration completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
