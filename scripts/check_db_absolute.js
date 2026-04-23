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
    const superAdmins = await prisma.superAdmin.findMany();
    console.log('SuperAdmins in prisma/main.db:', superAdmins.map(s => ({ username: s.username, id: s.id })));
    
    const user = await prisma.user.findUnique({
      where: { email: 'fpquintela@gmail.com' },
      include: { tenant: true }
    });
    console.log('User fpquintela@gmail.com:', user ? { id: user.id, email: user.email, hasTenant: !!user.tenant, tenantAlias: user.tenant?.alias } : 'Not found');

  } catch(e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
r();
