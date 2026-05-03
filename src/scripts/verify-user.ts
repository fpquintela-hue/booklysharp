import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'fpquintela@gmail.com';
  
  console.log(`Buscando usuario con email: ${email}...`);
  
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error('Usuario no encontrado.');
    return;
  }

  console.log('Usuario encontrado:', user);

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      is_verified: true,
      verification_token: null,
      verify_token_expires: null,
    },
  });

  console.log('Usuario verificado con éxito:', updatedUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
