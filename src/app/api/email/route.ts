import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { to, subject, text, html } = await request.json();

        // Fetch global SMTP settings
        const settings = await (prisma as any).setting.findMany({
            where: {
                tenantId: null,
                key: {
                    in: [
                        'GLOBAL_SMTP_HOST',
                        'GLOBAL_SMTP_PORT',
                        'GLOBAL_SMTP_USER',
                        'GLOBAL_SMTP_PASS',
                        'GLOBAL_SMTP_FROM',
                        'GLOBAL_SMTP_SECURE'
                    ]
                }
            }
        });

        const config = settings.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as any);

        if (!config.GLOBAL_SMTP_HOST || !config.GLOBAL_SMTP_USER || !config.GLOBAL_SMTP_PASS) {
            return NextResponse.json({ error: 'Configuración SMTP global no completada' }, { status: 500 });
        }

        const transporter = nodemailer.createTransport({
            host: config.GLOBAL_SMTP_HOST,
            port: parseInt(config.GLOBAL_SMTP_PORT) || 587,
            secure: config.GLOBAL_SMTP_SECURE === 'ssl',
            auth: {
                user: config.GLOBAL_SMTP_USER,
                pass: config.GLOBAL_SMTP_PASS,
            },
        });

        await transporter.sendMail({
            from: config.GLOBAL_SMTP_FROM || config.GLOBAL_SMTP_USER,
            to,
            subject,
            text,
            html
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error sending email:', error);
        return NextResponse.json({ error: error.message || 'Error al enviar email' }, { status: 500 });
    }
}
