import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create initial admin user
  let admin = await prisma.user.findFirst({
    where: { email: 'admin@agenda.muller' }
  });

  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: 'admin@agenda.muller',
        name: 'Administrador',
        role: 'ADMIN',
        password: 'admin', // En un entorno real, usar hashing
      },
    });
  }

  // Create some test patients and appointments if needed
  let patient = await prisma.patient.findFirst({
    where: { email: 'prueba@test.com' }
  });

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        name: 'Paciente de Prueba',
        phone: '600000000',
        email: 'prueba@test.com',
        appointments: {
          create: {
            start: new Date(),
            end: new Date(new Date().getTime() + 1800000), // +30 mins
            type: 'ORDINARY',
            status: 'SCHEDULED',
            notes: 'Cita de prueba inicial',
          }
        }
      }
    });
  }

  console.log({ admin, patient })
  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
