import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Fetch superadmin
        const superadmin = await prisma.superAdmin.findFirst({
            where: { username: 'superadmin' }
        });

        if (!superadmin) {
            return NextResponse.json({ error: 'Superadmin not found' }, { status: 404 });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, superadmin.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Current password incorrect' }, { status: 401 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update
        await prisma.superAdmin.update({
            where: { id: superadmin.id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error changing superadmin password:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
