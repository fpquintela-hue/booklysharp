
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const users = await (prisma as any).user.findMany({ where: { tenantId } });
        return NextResponse.json(users);
    } catch (error) {
        console.error('CRITICAL ERROR FETCHING USERS:', error);
        return NextResponse.json({ error: 'Error fetching users', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

import bcrypt from 'bcryptjs';

const hashIfNeeded = async (pwd?: string) => {
    if (!pwd) return undefined;
    if (pwd.startsWith('$2a$') || pwd.startsWith('$2b$')) return pwd;
    return await bcrypt.hash(pwd, 10);
};

export async function POST(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const data = await request.json(); // Array of users usually

        // If array, sync
        if (Array.isArray(data)) {
            for (const u of data) {
                const cleanData: any = {
                    name: u.name,
                    apellidos: u.apellidos,
                    bloqueado: u.bloqueado,
                    role: u.role,
                    theme: u.theme,
                    language: u.language,
                    calendarViewMode: u.calendarViewMode,
                    primaryColor: u.primaryColor,
                };

                if (u.password) {
                    cleanData.password = await hashIfNeeded(u.password);
                }

                const existing = await (prisma.user as any).findFirst({ where: { email: u.email, tenantId } });
                if (existing) {
                    await (prisma.user as any).update({
                        where: { id: existing.id },
                        data: cleanData
                    });
                } else {
                    await (prisma.user as any).create({
                        data: {
                            id: u.id || crypto.randomUUID(),
                            email: u.email,
                            tenantId,
                            ...cleanData
                        }
                    });
                }
            }
            return NextResponse.json({ success: true });
        }

        // Single create/update
        if (data.id) {
            const { id, ...updates } = data;

            const existing = await (prisma.user as any).findFirst({ where: { id, tenantId } });
            if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 });

            // Filter out undefined values
            const updateData: any = {};
            const allowedFields = ['name', 'apellidos', 'email', 'password', 'role', 'theme', 'language', 'calendarViewMode', 'bloqueado', 'primaryColor', 'first_login_completed'];
            for (const field of allowedFields) {
                if (updates[field] !== undefined) {
                    updateData[field] = updates[field];
                }
            }

            if (updateData.password) {
                updateData.password = await hashIfNeeded(updateData.password);
            }

            const user = await (prisma.user as any).update({
                where: { id },
                data: updateData
            });

            return NextResponse.json(user);
        }

        // Single create
        const email = data.email;
        const name = data.name;

        if (!email || !name) {
            return NextResponse.json(
                { error: 'Missing required fields for user creation (email, name)' },
                { status: 400 }
            );
        }

        const user = await (prisma.user as any).create({
            data: {
                email,
                name,
                tenantId,
                apellidos: data.apellidos || '',
                bloqueado: data.bloqueado || false,
                role: data.role || 'USER',
                password: await hashIfNeeded(data.password || '1234'),
                theme: data.theme || 'light',
                language: data.language || 'gl',
                calendarViewMode: data.calendarViewMode || 'vista1',
                primaryColor: data.primaryColor || '#2563EB',
            }
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error('CRITICAL API ERROR in /api/users:', error);
        return NextResponse.json({
            error: 'Error processing user',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const existing = await (prisma.user as any).findFirst({ where: { id, tenantId } });
        if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        await (prisma.user as any).delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Error deleting user' }, { status: 500 });
    }
}
