import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const tenantsRaw = await (prisma as any).tenant.findMany({
            include: {
                _count: {
                    select: {
                        appointmentTypes: true,
                        professionals: true
                    }
                },
                users: {
                    orderBy: { updatedAt: 'desc' },
                    take: 1,
                    select: { updatedAt: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        // Formatear la salida para incluir lastActivity
        const tenants = tenantsRaw.map((t: any) => ({
            ...t,
            lastActivity: t.users[0]?.updatedAt || t.createdAt,
            users: undefined // No devolver el array de users
        }));
        
        return NextResponse.json(tenants);
    } catch (error) {
        console.error('Error fetching tenants:', error);
        return NextResponse.json({ error: 'Error fetching tenants' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const {
            alias, name, adminPassword, contactName, contactEmail, contactAddress,
            appTitle, loginText, startTime, endTime, gridStep,
            primaryColor, theme, calendarViewMode, language
        } = await request.json();

        if (!alias || !name || !adminPassword) {
            return NextResponse.json({ error: 'Faltan datos requeridos (alias, nombre o contraseña)' }, { status: 400 });
        }

        // Check if exists
        const existing = await (prisma as any).tenant.findUnique({ where: { alias } });
        if (existing) {
            return NextResponse.json({ error: 'El alias ya existe' }, { status: 400 });
        }

        // Subscription expiration (2 months if FREE)
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 2);

        const tenant = await (prisma as any).tenant.create({
            data: {
                alias,
                nombre_comercial: name || alias,
                contactName,
                contactEmail,
                contactAddress,
                subscriptionType: 'FREE',
                subscriptionExpiresAt: expiresAt
            }
        });

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create the admin user. name: 'admin' allows login using the OR: [{email}, {name}] logic!
        await (prisma as any).user.create({
            data: {
                email: `admin@${alias}.com`,
                name: 'admin',
                password: hashedPassword,
                role: 'ADMIN',
                tenantId: tenant.id,
                language: language || 'es',
                theme: theme || 'light',
                primaryColor: primaryColor || '#2563EB',
                calendarViewMode: calendarViewMode || 'vista1',
                first_login_completed: false,
                is_verified: true // Creado por superadmin
            }
        });

        // Set up all initial settings in a more efficient way
        const initialSettings = [
            { key: 'appTitle', value: appTitle || name },
            { key: 'loginText', value: loginText || `Bienvenido a la agenda de ${name}.` },
            { key: 'gridStep', value: gridStep || '30' },
            { key: 'startTime', value: startTime || '09:00' },
            { key: 'endTime', value: endTime || '20:00' },
            { key: 'language', value: language || 'es' },
            { key: 'brandColor', value: primaryColor || '#2563EB' },
            { key: 'calendarViewMode', value: calendarViewMode || 'vista1' },
            { 
                key: 'reminders_config', 
                value: JSON.stringify([
                    { id: 'default_0', time: '0_MINUTES', method: 'BOTH' },
                    { id: 'default_24h', time: '1_DAY', method: 'BOTH' },
                    { id: 'default_1w_after', time: 'CUSTOM', customValue: -10080, method: 'BOTH' }
                ])
            }
        ];

        for (const s of initialSettings) {
            await (prisma as any).setting.create({
                data: {
                    key: s.key,
                    value: s.value,
                    tenantId: tenant.id,
                }
            });
        }

        // Create default professional
        await (prisma as any).professional.create({
            data: {
                name: contactName || name || 'Agenda principal',
                description: 'General',
                tenantId: tenant.id,
                color: primaryColor || '#3b82f6',
                isActive: true
            }
        });

        // Create default appointment type matching the grid duration
        await (prisma as any).appointmentType.create({
            data: {
                name: 'Cita Normal',
                duration: parseInt(gridStep || '30'),
                color: primaryColor || '#10b981',
                tenantId: tenant.id
            }
        });

        // Create default test customer
        await (prisma as any).patient.create({
            data: {
                name: 'Usuario',
                apellidos: 'de Prueba',
                phone: '000000000',
                email: `prueba@${alias}.com`,
                tenantId: tenant.id
            }
        });

        return NextResponse.json(tenant);
    } catch (error: any) {
        console.error('Error creating tenant:', error);
        return NextResponse.json({
            error: 'Error creating tenant',
            details: error.message || String(error)
        }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, maxAppointmentTypes, maxProfessionals, subscriptionType, subscriptionExpiresAt, billingAddress, paymentMethod, ...rest } = body;

        if (!id) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
        }

        const dataToUpdate: any = {};

        
        // Allowed generic fields
        const allowedFields = [
            'nombre_comercial', 'telefono', 'nivel_de_suscripcion', 'subscription_plan', 'subscription_status',
            'auto_renew', 'billing_info', 'payment_methods', 'pais', 'provincia', 'ciudad', 'calle', 'numero', 'codigo_postal',
            'facturacion_pais', 'facturacion_provincia', 'facturacion_ciudad', 'facturacion_calle', 'facturacion_numero', 'facturacion_codigo_postal',
            'forma_de_pago', 'datos_de_pago'
        ];
        
        for (const field of allowedFields) {
            if (rest[field] !== undefined) {
                dataToUpdate[field] = rest[field];
            }
        }

        if (typeof maxAppointmentTypes === 'number' && !Number.isNaN(maxAppointmentTypes)) {
            dataToUpdate.maxAppointmentTypes = maxAppointmentTypes;
        }
        if (typeof maxProfessionals === 'number' && !Number.isNaN(maxProfessionals)) {
            dataToUpdate.maxProfessionals = maxProfessionals;
        }
        
        // Map old frontend fields to correct Prisma schema fields
        if (subscriptionType) {
            dataToUpdate.subscription_status = subscriptionType; // In frontend 'active', 'expired', 'trial' is passed here
        }
        if (subscriptionExpiresAt) {
            dataToUpdate.expires_at = new Date(subscriptionExpiresAt);
            dataToUpdate.fecha_fin_suscripcion = new Date(subscriptionExpiresAt); // Backward compat
        }
        
        if (rest.fecha_fin_suscripcion) dataToUpdate.fecha_fin_suscripcion = new Date(rest.fecha_fin_suscripcion);
        if (billingAddress !== undefined) dataToUpdate.billing_info = billingAddress;
        if (paymentMethod !== undefined) dataToUpdate.payment_methods = paymentMethod;

        if (Object.keys(dataToUpdate).length === 0) {
            return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
        }

        const updatedTenant = await (prisma as any).tenant.update({
            where: { id },
            data: dataToUpdate
        });

        return NextResponse.json(updatedTenant);
    } catch (error) {
        console.error('Error updating tenant:', error);
        return NextResponse.json({ error: 'Error updating tenant' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
        }

        await (prisma as any).tenant.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting tenant:', error);
        return NextResponse.json({ error: 'Error deleting tenant' }, { status: 500 });
    }
}
