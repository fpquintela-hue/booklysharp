
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const { token, password, alias: providedAlias } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
        }

        // Global search for the token across all tenants
        const resetKey = `PW_RESET_${token}`;
        
        // Since key is unique within a tenant but we might have multiple tenants, 
        // and we don't know the tenantId initially, we find it by the unique key name prefix.
        // Actually, our previous implementation saved it with tenantId. 
        // Let's find any setting that starts with this key.
        const resetSetting = await (prisma as any).setting.findFirst({
            where: {
                key: resetKey
            },
            include: {
                tenant: true // To get the alias
            }
        });

        if (!resetSetting) {
            return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 400 });
        }

        const data = JSON.parse(resetSetting.value);
        const expires = new Date(data.expires);

        if (expires < new Date()) {
            await (prisma as any).setting.delete({ where: { id: resetSetting.id } });
            return NextResponse.json({ error: 'Token expirado' }, { status: 400 });
        }

        const userId = data.userId;
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password
        await (prisma as any).user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        // Clean up token
        await (prisma as any).setting.delete({ where: { id: resetSetting.id } });

        // Return the alias so the frontend can redirect correctly
        return NextResponse.json({ 
            success: true, 
            alias: resetSetting.tenant?.alias || providedAlias 
        });
    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
