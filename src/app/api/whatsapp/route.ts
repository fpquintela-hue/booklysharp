import { NextResponse } from 'next/server';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://192.168.1.6:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';

async function getTenantAlias(req: Request) {
    const authHeader = req.headers.get('tenant-id');
    return authHeader || 'default'; 
}

const getFullInstanceName = (alias: string) => `BooklySharp_${alias.replace(/[^a-zA-Z0-9]/g, '_')}`;

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const alias = searchParams.get('alias');

    if (!alias) {
        return NextResponse.json({ error: 'Tenant alias is required' }, { status: 400 });
    }

    try {
        const fullInstanceName = getFullInstanceName(alias);
        // Check if instance exists and its state (Evolution v2+)
        const response = await fetch(`${EVOLUTION_API_URL}/instance/connectionState/${fullInstanceName}`, {
            headers: { 'apikey': EVOLUTION_API_KEY }
        });

        const data = await response.json();
        
        // La estructura de v2 suele ser data.instance.state o data.state directamente
        const state = data.instance?.state || data.state;
        const ownerJid = data.instance?.ownerJid || data.ownerJid;
        const isConnected = state === 'open' || state === 'connected';

        return NextResponse.json({ 
            connected: isConnected, 
            state: state || 'unknown',
            number: ownerJid ? ownerJid.split('@')[0] : 'Desconocido'
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch WhatsApp status' }, { status: 500 });
    }
}

// Nueva ruta para enviar un mensaje de prueba/confirmación
export async function PATCH(req: Request) {
    const { searchParams } = new URL(req.url);
    const queryAlias = searchParams.get('alias');
    
    // Parse body safely
    let body: any = {};
    try {
        body = await req.json();
    } catch (e) {
        // Body might be empty
    }

    const { alias: bodyAlias, number, text } = body;
    const finalAlias = bodyAlias || queryAlias;

    if (!finalAlias || !number) {
        return NextResponse.json({ 
            error: 'Missing parameters', 
            details: { alias: !!finalAlias, number: !!number } 
        }, { status: 400 });
    }

    try {
        const fullInstanceName = getFullInstanceName(finalAlias);
        const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${fullInstanceName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                number: number.startsWith('34') ? number : `34${number}`, // Asegurar prefijo si falta (asumiendo España por defecto si no lo trae)
                text: text || "🔔 *Booklysharp*: Conexión realizada con éxito. Este terminal está listo para recibir notificaciones."
            })
        });

        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json({ error: data.message || 'Error from Evolution API' }, { status: response.status });
        }
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const { alias } = await req.json();

    if (!alias) {
        return NextResponse.json({ error: 'Tenant alias is required' }, { status: 400 });
    }

    try {
        const fullInstanceName = getFullInstanceName(alias);
        // En v2.3.7 la ruta de creación
        const createResponse = await fetch(`${EVOLUTION_API_URL}/instance/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': EVOLUTION_API_KEY
            },
            body: JSON.stringify({
                instanceName: fullInstanceName,
                integration: "WHATSAPP-BAILEYS",
                qrcode: true,
                browser: "BooklySharp" 
            })
        });

        const createData = await createResponse.json();
        let qrBase64 = createData.hash?.base64 || createData.qrcode?.base64 || createData.base64;

        if (!qrBase64) {
            const connectRes = await fetch(`${EVOLUTION_API_URL}/instance/connect/${fullInstanceName}`, {
                headers: { 'apikey': EVOLUTION_API_KEY }
            });
            const connectData = await connectRes.json();
            qrBase64 = connectData.base64 || connectData.qrcode?.base64;
        }

        if (qrBase64) {
            return NextResponse.json({ qr: qrBase64 });
        }

        console.error('QR Generation Failed. API Response:', JSON.stringify(createData, null, 2));

        return NextResponse.json({ 
            error: 'No se pudo obtener el código QR.', 
            details: 'Verifica que la instancia no esté ya conectada o que la API Key sea correcta.',
            apiResponse: createData 
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: 'Error de red con Evolution API' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const alias = searchParams.get('alias');

    if (!alias) {
        return NextResponse.json({ error: 'Tenant alias is required' }, { status: 400 });
    }

    try {
        const fullInstanceName = getFullInstanceName(alias);
        const response = await fetch(`${EVOLUTION_API_URL}/instance/delete/${fullInstanceName}`, {
            method: 'DELETE',
            headers: {
                'apikey': EVOLUTION_API_KEY
            }
        });

        return NextResponse.json({ success: response.ok });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to disconnect WhatsApp' }, { status: 500 });
    }
}

