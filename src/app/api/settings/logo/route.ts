import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import prisma from '@/lib/prisma';
import fs from 'fs';

export async function POST(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const formData = await request.formData();
        const file = formData.get('logo') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Calculate a unique filename to avoid browser caching issues (optional), or just overwrite and let the client handle cache-busting
        const filename = `custom-logo-${Date.now()}.png`;

        // We assume public/img exists
        const imgDir = join(process.cwd(), 'public', 'img');
        if (!fs.existsSync(imgDir)) {
            fs.mkdirSync(imgDir, { recursive: true });
        }

        const filePath = join(imgDir, filename);

        // Write the file
        await writeFile(filePath, buffer);

        const logoUrl = `/img/${filename}`;

        // Update the Setting in database to point to the new logo
        await prisma.setting.upsert({
            where: { key_tenantId: { key: 'logoUrl', tenantId } },
            update: { value: logoUrl },
            create: { key: 'logoUrl', value: logoUrl, tenantId },
        });

        return NextResponse.json({ success: true, logoUrl });
    } catch (error) {
        console.error('Error uploading logo:', error);
        return NextResponse.json({ error: 'Error al subir el logo' }, { status: 500 });
    }
}
