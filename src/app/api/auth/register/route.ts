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
                    { key: 'appTitle', value: nombre_comercial, tenantId: newTenant.id }
                ]
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
                    <div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #2563eb;">¡Bienvenido a BooklySharp!</h2>
                        <p>Hola <strong>${name || 'Admin'}</strong>,</p>
                        <p>Gracias por crear tu Tenant: <strong>${nombre_comercial}</strong>.</p>
                        <p>Para activar tu cuenta y poder iniciar sesión, haz clic en el siguiente enlace:</p>
                        <p><a href="${verifyUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verificar mi cuenta</a></p>
                        <p style="font-size: 12px; color: #999; margin-top: 20px;">Este enlace expirará en 24 horas.</p>
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
