import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    const { filename } = await params;

    if (!filename || typeof filename !== 'string') {
        return new NextResponse('Invalid filename', { status: 400 });
    }

    // Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return new NextResponse('Invalid filename', { status: 400 });
    }

    const imgPath = join(process.cwd(), 'public', 'img', 'professionals', filename);

    if (!existsSync(imgPath)) {
        return new NextResponse('Image not found', { status: 404 });
    }

    try {
        const imageBuffer = readFileSync(imgPath);
        
        const ext = filename.split('.').pop()?.toLowerCase() || 'png';
        let contentType = 'image/png';
        if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
        if (ext === 'webp') contentType = 'image/webp';
        if (ext === 'gif') contentType = 'image/gif';
        if (ext === 'svg') contentType = 'image/svg+xml';

        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=86400, must-revalidate',
            },
        });
    } catch (e) {
        console.error('Error serving image:', e);
        return new NextResponse('Error reading image', { status: 500 });
    }
}
