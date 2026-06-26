import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
        }

        // Recuperar al superadmin (estamos seguros de que es el único por ahora)
        const superadmin = await prisma.superAdmin.findFirst({
            where: { username: 'superadmin' }
        });

        if (!superadmin) {
             return NextResponse.json({ error: 'Superadmin no encontrado' }, { status: 404 });
        }

        // Verificar contraseña actual
        const isHashed = superadmin.password.startsWith('$2a$') || superadmin.password.startsWith('$2b$');
        let isMatch = false;
        if (isHashed) {
            isMatch = await bcrypt.compare(currentPassword, superadmin.password);
        } else {
            isMatch = superadmin.password === currentPassword;
        }

        if (!isMatch) {
            return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 401 });
        }

        // Hashing nueva contraseña
        const hashed = await bcrypt.hash(newPassword, 10);

        await prisma.superAdmin.update({
            where: { id: superadmin.id },
            data: { password: hashed }
        });

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Change password error:', e);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
