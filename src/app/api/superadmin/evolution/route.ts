import { NextResponse } from 'next/server';

const getEvolutionConfig = () => {
    return {
        url: process.env.GLOBAL_EVOLUTION_API_URL || process.env.EVOLUTION_API_URL || 'http://192.168.1.6:8080',
        key: process.env.GLOBAL_EVOLUTION_API_KEY || process.env.EVOLUTION_API_KEY || ''
    };
};

export async function GET(req: Request) {
    const config = getEvolutionConfig();
    try {
        const response = await fetch(`${config.url}/instance/fetchInstances`, {
            headers: { 'apikey': config.key }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch instances', details: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const config = getEvolutionConfig();
    try {
        const body = await req.json();
        const { action, instanceName, data } = body;

        if (!action || !instanceName) {
            return NextResponse.json({ error: 'Missing action or instanceName' }, { status: 400 });
        }

        let url = '';
        let method = 'POST';
        let payload = undefined;

        switch (action) {
            case 'logout':
                url = `${config.url}/instance/logout/${instanceName}`;
                method = 'DELETE';
                break;
            case 'connectionState':
                url = `${config.url}/instance/connectionState/${instanceName}`;
                method = 'GET';
                break;
            case 'sendText':
                url = `${config.url}/message/sendText/${instanceName}`;
                payload = {
                    number: data.number,
                    text: data.text
                };
                break;
            case 'sendMedia':
                url = `${config.url}/message/sendMedia/${instanceName}`;
                // Using a more compatible payload structure for Evolution API
                payload = {
                    number: data.number,
                    mediatype: 'image',
                    mimetype: 'image/png',
                    media: data.media || 'https://booklysharp.com/images/whatsapp-reminder-default.png',
                    fileName: 'reserva.png',
                    caption: data.caption || 'Mensaje de prueba con imagen'
                };
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const fetchOptions: any = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'apikey': config.key
            }
        };

        if (payload) {
            fetchOptions.body = JSON.stringify(payload);
        }

        const response = await fetch(url, fetchOptions);
        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            return NextResponse.json({ error: result.message || result.error || 'Evolution API Error' }, { status: response.status });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to execute action', details: error.message }, { status: 500 });
    }
}
