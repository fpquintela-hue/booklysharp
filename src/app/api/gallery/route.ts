
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const galleryDir = path.join(process.cwd(), 'public', 'img', 'peluqueria');
        
        if (!fs.existsSync(galleryDir)) {
            return NextResponse.json([]);
        }

        const files = fs.readdirSync(galleryDir);
        const images = files
            .filter(file => /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file))
            .map(file => `/img/peluqueria/${file}`);

        return NextResponse.json(images);
    } catch (error) {
        console.error('Error reading gallery:', error);
        return NextResponse.json({ error: 'Failed to read gallery' }, { status: 500 });
    }
}
