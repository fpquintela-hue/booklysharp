
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function run() {
    const settings = await prisma.setting.findMany({
        where: {
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
    }, {});

    console.log('SMTP Config found in DB:', {
        host: config.GLOBAL_SMTP_HOST,
        user: config.GLOBAL_SMTP_USER,
        pass: config.GLOBAL_SMTP_PASS ? '********' : null
    });

    if (!config.GLOBAL_SMTP_HOST || !config.GLOBAL_SMTP_USER || !config.GLOBAL_SMTP_PASS) {
        console.error('No SMTP configuration found in .env or Database.');
        process.exit(1);
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

    const from = config.GLOBAL_SMTP_FROM || config.GLOBAL_SMTP_USER;
    const to = 'fpquintela2@gmail.com';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const name = 'Fernando';
    const nombre_comercial = 'BooklySharp Test';
    const verifyUrl = `${baseUrl}/test/verificar?token=test-token`;

    const html = `
        <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="text-align: center; padding: 30px 20px; border-bottom: 1px solid #e2e8f0; background-color: #ffffff;">
                    <img src="${baseUrl}/booklysharp_logo.png" alt="BooklySharp Logo" style="height: 48px; width: auto;" />
                </div>
                <div style="padding: 40px 30px; color: #334155;">
                    <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 24px;">¡Bienvenido a BooklySharp, ${name}!</h1>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Es un verdadero placer darle la bienvenida a nuestra plataforma. Le agradecemos sinceramente la confianza depositada en <strong>BooklySharp</strong> para la gestión de <strong>${nombre_comercial}</strong>.
                    </p>
                    
                    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        Nuestro compromiso es proporcionarle las mejores herramientas para optimizar sus reservas, fidelizar a sus clientes y escalar su negocio con la máxima eficiencia. Para comenzar a disfrutar de todas nuestras funcionalidades, necesitamos verificar su dirección de correo electrónico.
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="${verifyUrl}" style="background-color: #005bc4; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                            Activar mi cuenta profesional
                        </a>
                    </div>
                    
                    <p style="font-size: 14px; line-height: 1.5; color: #64748b; margin-bottom: 10px;">
                        Si el botón no funciona, copie y pegue el siguiente enlace en su navegador:
                    </p>
                    <p style="font-size: 13px; color: #3b82f6; word-break: break-all; margin-bottom: 30px;">
                        <a href="${verifyUrl}" style="color: #3b82f6; text-decoration: underline;">${verifyUrl}</a>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                    
                    <p style="font-size: 14px; color: #64748b;">
                        Por motivos de seguridad, este enlace de activación caducará en <strong>24 horas</strong>. Si tiene alguna pregunta, nuestro equipo de soporte técnico está a su entera disposición.
                    </p>
                    <p style="font-size: 14px; color: #64748b; font-weight: 600; margin-top: 20px;">
                        Atentamente,<br/>
                        El equipo de operaciones de BooklySharp
                    </p>
                </div>
                <div style="background-color: #f1f5f9; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
                    © ${new Date().getFullYear()} BooklySharp. Todos los derechos reservados.
                </div>
            </div>
        </div>
    `;

    try {
        await transporter.sendMail({
            from,
            to,
            subject: 'Test de Activación - BooklySharp PRO Template',
            html
        });
        console.log('Email sent successfully to', to);
    } catch (err) {
        console.error('Failed to send email:', err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
