import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getTransporter } from '@/lib/notifications';
import { normalizePlanId, getPlanById } from '@/lib/subscription-plans';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            email, password, name, apellidos, // Admin user
            alias, nombre_comercial, telefono,
            nivel_de_suscripcion,
            pais, provincia, ciudad, calle, numero, codigo_postal,
            facturacion_pais, facturacion_provincia, facturacion_ciudad, facturacion_calle, facturacion_numero, facturacion_codigo_postal,
            forma_de_pago
        } = body;

        if (!email || !password || !alias || !nombre_comercial) {
            return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
        }

        // Check if alias exists
        const existingAlias = await prisma.tenant.findUnique({ where: { alias } });
        if (existingAlias) {
            return NextResponse.json({ error: 'El alias comercial ya está en uso' }, { status: 400 });
        }

        // Check if email exists
        const existingEmail = await prisma.user.findUnique({ where: { email } });
        if (existingEmail) {
            return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
        }

        // Resolve canonical plan and derive trial period from plan definition
        const canonicalPlanId = normalizePlanId(nivel_de_suscripcion);
        const selectedPlan = getPlanById(canonicalPlanId);
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + selectedPlan.trialDays);

        // Transaction to create Tenant and Admin User
        const tenant = await prisma.$transaction(async (tx) => {
            const newTenant = await tx.tenant.create({
                data: {
                    alias,
                    nombre_comercial,
                    telefono,
                    nivel_de_suscripcion: canonicalPlanId,
                    fecha_fin_suscripcion: trialEndDate,
                    pais, provincia, ciudad, calle, numero, codigo_postal,
                    facturacion_pais, facturacion_provincia, facturacion_ciudad, facturacion_calle, facturacion_numero, facturacion_codigo_postal,
                    forma_de_pago,
                }
            });

            const hashedPassword = await bcrypt.hash(password, 10);
            const token = crypto.randomBytes(32).toString('hex');
            const expires = new Date();
            expires.setHours(expires.getHours() + 24);

            await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: name || 'Admin',
                    apellidos: apellidos || '',
                    role: 'ADMIN',
                    tenantId: newTenant.id,
                    primaryColor: '#2563eb', // FASE 4: Azul por defecto
                    is_verified: false,
                    verification_token: token,
                    verify_token_expires: expires,
                    first_login_completed: false
                }
            });

            // Auto-create professional (Fase 2)
            await tx.professional.create({
                data: {
                    name: name || 'Admin',
                    description: 'General',
                    color: '#2563eb',
                    isActive: true,
                    tenantId: newTenant.id
                }
            });

            // Auto-create basic settings (Fase 4 - Branding)
            await tx.setting.createMany({
                data: [
                    { key: 'brandColor', value: '#2563eb', tenantId: newTenant.id },
                    { key: 'appTitle', value: nombre_comercial, tenantId: newTenant.id },
                    // Default reminder: 24h before appointment via WhatsApp
                    {
                        key: 'reminders_config',
                        value: JSON.stringify([
                            { id: 'default_24h', time: '1_DAY', method: 'WHATSAPP' }
                        ]),
                        tenantId: newTenant.id
                    }
                ]
            });

            // Auto-create default AppointmentType (Fase 5)
            await tx.appointmentType.create({
                data: {
                    name: 'Servicio',
                    duration: 30,
                    color: '#3b82f6',
                    tenantId: newTenant.id
                }
            });

            return { newTenant, token };
        });

        // FASE 1: Send verification email
        const emailSystem = await getTransporter();
        if (emailSystem) {
            const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
            const verifyUrl = `${baseUrl}/${tenant.newTenant.alias}/verificar?token=${tenant.token}`;
            
            await emailSystem.transporter.sendMail({
                from: emailSystem.from,
                to: email,
                subject: `Verifica tu cuenta - Bienvenido a BooklySharp`,
                html: `
                    <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                            <div style="text-align: center; padding: 30px 20px; border-bottom: 1px solid #e2e8f0; background-color: #ffffff;">
                                <img src="${baseUrl}/booklysharp_logo.png" alt="BooklySharp Logo" style="height: 48px; width: auto;" />
                            </div>
                            <div style="padding: 40px 30px; color: #334155;">
                                <h1 style="color: #0f172a; font-size: 24px; font-weight: 700; margin-bottom: 24px;">¡Bienvenido a BooklySharp, ${name || 'Administrador'}!</h1>
                                
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
                `
            });
        }

        return NextResponse.json({ success: true, tenantAlias: tenant.newTenant.alias });
    } catch (e) {
        console.error('Register API error:', e);
        return NextResponse.json({ error: 'Error del servidor al registrarse' }, { status: 500 });
    }
}
