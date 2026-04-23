const { PrismaClient } = require('@prisma/client');
async function r() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:z:/prisma/main.db'
      }
    }
  });

  try {
    const user = await prisma.user.findUnique({
      where: { email: 'fpquintela@gmail.com' },
      include: { tenant: true }
    });
    console.log('User status:', user ? { 
        id: user.id, 
        is_verified: user.is_verified, 
        bloqueado: user.bloqueado,
        password_length: user.password.length,
        is_hashed: user.password.startsWith('$2a$') || user.password.startsWith('$2b$')
    } : 'Not found');

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
r();
