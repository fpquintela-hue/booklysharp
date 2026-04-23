import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import prisma from '@/lib/prisma';
import fs from 'fs';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;
        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const filename = `prof-${id}-${Date.now()}.png`;
        const imgDir = join(process.cwd(), 'public', 'img', 'professionals');
        
        if (!fs.existsSync(imgDir)) {
            fs.mkdirSync(imgDir, { recursive: true });
        }

        const filePath = join(imgDir, filename);
        await writeFile(filePath, buffer);

        const imageUrl = `/api/img/professionals/${filename}`;

        const professional = await prisma.professional.update({
            where: { id, tenantId },
            data: { image: imageUrl },
        });

        return NextResponse.json({ success: true, imageUrl });
    } catch (error) {
        console.error('Error uploading professional image:', error);
        return NextResponse.json({ error: 'Error uploading image' }, { status: 500 });
    }
}
