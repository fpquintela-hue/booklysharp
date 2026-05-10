import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('--- RESTAURACIÓN DE SUPERADMIN ---');
    
    // 1. Asegurar que existe la tabla (aunque npx prisma db push debería hacerlo)
    
    // 2. Crear superadmin
    const username = 'superadmin';
    const password = 'superadmin_password_123'; // Cambia esto después
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Creando/Actualizando superadmin: ${username}...`);
    
    const sa = await prisma.superAdmin.upsert({
        where: { username },
        update: { password: hashedPassword },
        create: {
            username,
            password: hashedPassword
        }
    });

    console.log('¡SuperAdmin restaurado con éxito!');
    console.log('Username:', sa.username);
    console.log('Temp Password:', password);
    console.log('---');
}

main()
    .catch(e => {
        console.error('Error al restaurar SuperAdmin:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
