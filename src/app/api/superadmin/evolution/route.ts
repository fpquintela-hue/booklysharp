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
            case 'delete':
                url = `${config.url}/instance/delete/${instanceName}`;
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
                
                let finalMedia = data.media || 'https://booklysharp.com/images/whatsapp-reminder-default.png';
                let finalMime = 'image/png';

                // Try to convert HTTP URL to Base64 to avoid Evolution API download issues (business not found)
                if (finalMedia.startsWith('http')) {
                    try {
                        const imgRes = await fetch(finalMedia);
                        if (imgRes.ok) {
                            const arrayBuffer = await imgRes.arrayBuffer();
                            const base64Str = Buffer.from(arrayBuffer).toString('base64');
                            finalMime = imgRes.headers.get('content-type') || 'image/png';
                            // Many Evolution API versions expect the raw base64 string without the data:image/xxx;base64, prefix
                            finalMedia = base64Str;
                        } else {
                            console.error(`[Evolution Proxy] Error fetching media URL: ${imgRes.status}`);
                            return NextResponse.json({ error: `La URL de la imagen no es válida o devolvió un error: ${imgRes.status}` }, { status: 400 });
                        }
                    } catch (e: any) {
                        console.error(`[Evolution Proxy] Exception fetching media: ${e.message}`);
                        return NextResponse.json({ error: 'No se pudo acceder a la URL de la imagen proporcionada.' }, { status: 400 });
                    }
                }

                // We use sendInteractive to send the image with a URL button (Call to Action)
                url = `${config.url}/message/sendInteractive/${instanceName}`;
                
                payload = {
                    number: data.number,
                    interactiveMessage: {
                        type: "button",
                        header: {
                            type: "image",
                            image: finalMedia // Base64 or URL
                        },
                        body: {
                            text: data.caption || 'Mensaje de prueba con imagen'
                        },
                        footer: {
                            text: "Por favor, no respondas este WhatsApp"
                        },
                        buttons: [
                            {
                                type: "url",
                                title: "Confirmar Asistencia",
                                payload: `http://192.168.1.6:3000/${instanceName.replace('BooklySharp_', '')}/confirm/${data.appointmentId || 'test-id'}`
                            }
                        ]
                    }
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
            console.error(`[Evolution API Error] ${action}:`, result);
            return NextResponse.json({ error: result.message || result.error || JSON.stringify(result) || 'Evolution API Error' }, { status: response.status });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to execute action', details: error.message }, { status: 500 });
    }
}
