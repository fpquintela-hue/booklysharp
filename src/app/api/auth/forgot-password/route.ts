
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email, alias } = await request.json();

        if (!email || !alias) {
            return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
        }

        const tenant = await (prisma as any).tenant.findUnique({ where: { alias } });
        if (!tenant) {
            return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 });
        }

        const user = await (prisma as any).user.findFirst({
            where: { email, tenantId: tenant.id }
        });

        if (!user) {
            // For security, don't reveal if user exists or not
            return NextResponse.json({ success: true, message: 'Se envió un correo si la cuenta existe.' });
        }

        // Generate a random token
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour

        // Save token to settings table
        await (prisma as any).setting.create({
            data: {
                key: `PW_RESET_${token}`,
                value: JSON.stringify({ userId: user.id, expires: expires.toISOString() }),
                tenantId: tenant.id
            }
        });

        // SEND EMAIL WITH GLOBAL URL (no tenant in path)
        const baseUrl = new URL(request.url).origin;
        const resetUrl = `${baseUrl}/auth/reset?token=${token}`;

        // Fetch SMTP settings
        const smtpSettings = await (prisma as any).setting.findMany({
            where: {
                tenantId: null,
                key: { in: ['GLOBAL_SMTP_HOST', 'GLOBAL_SMTP_USER', 'GLOBAL_SMTP_PASS', 'GLOBAL_SMTP_FROM'] }
            }
        });
        
        const config = smtpSettings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as any);

        if (config.GLOBAL_SMTP_HOST) {
            const emailBody = {
                to: email,
                subject: 'Restablecer contrasinal - booklysharp',
                html: `
                    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 12px;">
                        <h2 style="color: #2563EB;">Restablecer contrasinal</h2>
                        <p>Recibimos unha solicitude para restablecer o teu contrasinal en <strong>booklysharp</strong>.</p>
                        <p>Fai clic no seguinte botón para continuar (válido por 1 hora):</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="display: inline-block; padding: 14px 30px; background: #2563EB; color: #fff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">Restablecer contrasinal</a>
                        </div>
                        <p style="color: #666; font-size: 14px;">Se o botón non funciona, copia e pega este enlace no teu navegador:</p>
                        <p style="color: #2563EB; font-size: 12px; word-break: break-all;">${resetUrl}</p>
                        <p style="margin-top: 30px; font-size: 14px;">Se non solicitaches isto, podes ignorar este correo de forma segura.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin-top: 30px;">
                        <p style="font-size: 12px; color: #999; text-align: center;">booklysharp - Xestión intelixente de axendas</p>
                    </div>
                `
            };

            await fetch(`${baseUrl}/api/email`, {
                method: 'POST',
                body: JSON.stringify(emailBody)
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
    }
}
