import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, email, password } = body;

        // Si se provee username y no email, podría ser el superadmin
        const identifier = email || username;

        if (!identifier || !password) {
            return NextResponse.json({ error: 'Faltan credenciales' }, { status: 400 });
        }

        const checkAndUpdatePassword = async (user: any, plainPassword: string, isSuperAdmin = false) => {
            const isHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
            if (isHashed) {
                return await bcrypt.compare(plainPassword, user.password);
            } else {
                const isMatch = user.password === plainPassword;
                if (isMatch) {
                    const hashed = await bcrypt.hash(plainPassword, 10);
                    if (isSuperAdmin) {
                        await prisma.superAdmin.update({ where: { id: user.id }, data: { password: hashed } });
                    } else {
                        await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
                    }
                }
                return isMatch;
            }
        };

        // SUPERADMIN login logic
        if (identifier.toLowerCase() === 'superadmin') {
            let superadmin = await prisma.superAdmin.findFirst({
                where: { username: 'superadmin' }
            });

            if (!superadmin) {
                return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
            }

            if (superadmin && await checkAndUpdatePassword(superadmin, password, true)) {
                return NextResponse.json({
                    id: superadmin.id,
                    username: superadmin.username,
                    role: 'SUPERADMIN'
                });
            }
            return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        // TENANT USER global login
        const user = await prisma.user.findUnique({
            where: { email: identifier },
            include: { tenant: true }
        });

        if (user && await checkAndUpdatePassword(user, password, false)) {
            if (user.bloqueado) {
                return NextResponse.json({ error: 'Usuario bloqueado' }, { status: 403 });
            }

            if (user.is_verified === false) {
                return NextResponse.json({ error: 'Por favor, verifica tu cuenta desde el email enviado.' }, { status: 403 });
            }

            if (!user.tenant) {
                 return NextResponse.json({ error: 'Usuario no asignado a ningún entorno' }, { status: 403 });
            }

            // We no longer block login for expired subscriptions; we just pass the info.
            
            return NextResponse.json({
                ...user,
                tenantAlias: user.tenant.alias,
                tenantExpiresAt: user.tenant.expires_at || user.tenant.fecha_fin_suscripcion,
                tenantSubscriptionStatus: user.tenant.subscription_status,
                tenantPlan: user.tenant.subscription_plan,
                tenantAutoRenew: user.tenant.auto_renew,
                tenantCreatedAt: user.tenant.createdAt,
                tenantBillingInfo: user.tenant.billing_info,
                tenantPaymentMethods: user.tenant.payment_methods
            });
        }

        return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
    } catch (e) {
        console.error('Login error:', e);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
