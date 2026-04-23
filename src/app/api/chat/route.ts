import { NextResponse } from 'next/server';

const DIFY_API_KEY = process.env.DIFY_API_KEY || 'app-9KuNDI5GpKxsA8TSIOrU3nFB'; // Reemplazar con tu clave real
const DIFY_URL = process.env.DIFY_URL || 'http://192.168.1.7/v1'; // Cambiar si usas Dify autoalojado

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query, conversation_id, user = 'booklysharp_user' } = body;

        if (!query) {
            return NextResponse.json({ error: 'Falta el mensaje (query)' }, { status: 400 });
        }

        const difyResponse = await fetch(`${DIFY_URL}/chat-messages`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DIFY_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: {},
                query: query,
                response_mode: 'blocking',
                conversation_id: conversation_id || '',
                user: user || 'tester-1'
            }),
        });

        if (!difyResponse.ok) {
            const errorText = await difyResponse.text();
            console.error('Error desde Dify:', errorText);
            return NextResponse.json({ error: 'Error del servidor de chat' }, { status: difyResponse.status });
        }

        const data = await difyResponse.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('API Chat Error:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
