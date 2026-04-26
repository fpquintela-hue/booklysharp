import prisma from './prisma';
import nodemailer from 'nodemailer';
import { decrypt } from './encryption';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://192.168.1.6:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';

/** URL de imagen de marca por defecto cuando el tenant no tiene logo configurado */
const DEFAULT_BRAND_IMAGE_URL = process.env.DEFAULT_WHATSAPP_IMAGE_URL ||
    'https://booklysharp.com/images/whatsapp-reminder-default.png';

const getFullInstanceName = (alias: string) => `BooklySharp_${alias.replace(/[^a-zA-Z0-9]/g, '_')}`;

/**
 * Construye la URL pública de confirmación de asistencia.
 * Formato: {NEXT_PUBLIC_APP_URL}/{alias}/confirm/{appointmentId}
 */
function buildConfirmationUrl(tenantAlias: string, appointmentId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://booklysharp.com';
    return `${baseUrl}/${tenantAlias}/confirm/${appointmentId}`;
}

/**
 * Envía un mensaje de WhatsApp con imagen + caption a través de Evolution API.
 * Usa /message/sendMedia en lugar de /message/sendText.
 *
 * Manejo de errores:
 * - Timeout de red (AbortSignal) → lanza error para que el caller reintente o marque como FAILED
 * - HTTP 4xx de Evolution (número inválido, sesión no conectada, etc.) → lanza error con el mensaje de la API
 * - HTTP 5xx → lanza error genérico
 */
async function sendWhatsAppMedia({
    instanceName,
    number,
    imageUrl,
    caption,
}: {
    instanceName: string;
    number: string;
    imageUrl: string;
    caption: string;
    confirmUrl: string;
}): Promise<void> {
    const controller = new AbortController();
    // Timeout de 15 segundos para evitar bloqueos en el job de recordatorios
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    let response: Response;
    try {
        // Use Evolution API v2 Interactive Message format for CTA Buttons
        response = await fetch(
            `${EVOLUTION_API_URL}/message/sendInteractive/${instanceName}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY,
                },
                body: JSON.stringify({
                    number,
                    interactiveMessage: {
                        type: "button",
                        header: {
                            type: "image",
                            image: imageUrl
                        },
                        body: {
                            text: caption
                        },
                        footer: {
                            text: "Por favor, no respondas este WhatsApp"
                        },
                        buttons: [
                            {
                                type: "url",
                                title: "Confirmar Asistencia",
                                payload: confirmUrl
                            }
                        ]
                    }
                }),
                signal: controller.signal,
            }
        );
    } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') {
            throw new Error('Evolution API timeout: la petición superó los 15 segundos');
        }
        throw new Error(`Error de red con Evolution API: ${String(err)}`);
    } finally {
        clearTimeout(timeoutId);
    }

    if (!response.ok) {
        let apiMessage = `HTTP ${response.status}`;
        try {
            const body = await response.json() as { message?: string; error?: string };
            apiMessage = body.message || body.error || apiMessage;
        } catch {
            // ignoramos errores al parsear el body de error
        }
        throw new Error(`Evolution API error: ${apiMessage}`);
    }
}

export async function getTransporter() {
    // Priority 1: Environment Variables
    const envHost = process.env.GLOBAL_SMTP_HOST;
    const envUser = process.env.GLOBAL_SMTP_USER;
    const envPass = process.env.GLOBAL_SMTP_PASS;
    const envPort = process.env.GLOBAL_SMTP_PORT;
    const envFrom = process.env.GLOBAL_SMTP_FROM;
    const envSecure = process.env.GLOBAL_SMTP_SECURE;

    if (envHost && envUser && envPass) {
        return {
            transporter: nodemailer.createTransport({
                host: envHost,
                port: parseInt(envPort || '587'),
                secure: envSecure === 'ssl',
                auth: { user: envUser, pass: envPass },
            }),
            from: envFrom || envUser
        };
    }

    // Priority 2: Database Settings (Backwards compatibility / Dynamic change)
    const settings = await (prisma as any).setting.findMany({
        where: {
            tenantId: null,
            key: {
                in: [
                    'GLOBAL_SMTP_HOST',
                    'GLOBAL_SMTP_PORT',
                    'GLOBAL_SMTP_USER',
                    'GLOBAL_SMTP_PASS',
                    'GLOBAL_SMTP_FROM',
                    'GLOBAL_SMTP_SECURE'
                ]
            }
        }
    });

    const config = settings.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {});

    if (!config.GLOBAL_SMTP_HOST || !config.GLOBAL_SMTP_USER || !config.GLOBAL_SMTP_PASS) {
        return null;
    }

    return {
        transporter: nodemailer.createTransport({
            host: config.GLOBAL_SMTP_HOST,
            port: parseInt(config.GLOBAL_SMTP_PORT) || 587,
            secure: config.GLOBAL_SMTP_SECURE === 'ssl',
            auth: {
                user: config.GLOBAL_SMTP_USER,
                pass: config.GLOBAL_SMTP_PASS,
            },
        }),
        from: config.GLOBAL_SMTP_FROM || config.GLOBAL_SMTP_USER
    };
}

export async function sendImmediateNotification(appointment: any, tenant: any, type: 'WHATSAPP' | 'EMAIL') {
    try {
        const settings = tenant.settings.reduce((acc: any, s: any) => {
            acc[s.key] = s.value;
            return acc;
        }, {});

        const patientPhone = decrypt((appointment.patient as any)?.phone);
        const patientEmail = decrypt((appointment.patient as any)?.email);
        const patientName = decrypt((appointment.patient as any)?.name);
        
        const dateStr = new Intl.DateTimeFormat('es-ES', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            hour: '2-digit', 
            minute: '2-digit',
            timeZone: 'Europe/Madrid'
        }).format(new Date(appointment.start));

        // Get template or use default
        let template = settings.whatsapp_template_reserva_automatica || "Hola *{{nombre}}* has realizado la reserva para el dia *{{fecha}}*. Te esperamos.";
        
        const finalMessage = template
            .replace(/{{nombre}}|{nombre}/g, patientName)
            .replace(/{{fecha}}|{fecha}/g, dateStr)
            .replace(/{{servicio}}|{servicio}/g, appointment.type || '');

        if (type === 'WHATSAPP' && patientPhone) {
            let cleanNumber = patientPhone.replace(/[^0-9]/g, '');
            if (cleanNumber.startsWith('00')) cleanNumber = cleanNumber.substring(2);
            const finalNumber = (cleanNumber.length === 9) ? `34${cleanNumber}` : cleanNumber;

            const fullInstanceName = getFullInstanceName(tenant.alias);

            // Imagen corporativa: logo del tenant si existe, sino imagen por defecto
            const imageUrl = (settings.logoUrl && !settings.logoUrl.startsWith('/'))
                ? settings.logoUrl
                : DEFAULT_BRAND_IMAGE_URL;

            const caption = finalMessage;

            try {
                await sendWhatsAppMedia({
                    instanceName: fullInstanceName,
                    number: finalNumber,
                    imageUrl,
                    caption,
                    confirmUrl
                });
                return true;
            } catch (err: unknown) {
                console.error('[WhatsApp] Error enviando media en notificación inmediata:', err);
                return false;
            }
        } 
        else if (type === 'EMAIL' && patientEmail) {
            const emailSystem = await getTransporter();
            if (!emailSystem) return false;

            await emailSystem.transporter.sendMail({
                from: emailSystem.from,
                to: patientEmail,
                subject: `Confirmación de reserva - ${settings.appTitle || 'Booklysharp'}`,
                text: finalMessage.replace(/\*/g, ''),
                html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #0058be;">Confirmación de Reserva</h2>
                        <p>Hola <strong>${patientName}</strong>,</p>
                        <p>Has realizado una reserva para el día <strong>${dateStr}</strong>.</p>
                        <p>Servicio: ${appointment.type}</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                        <p style="font-size: 12px; color: #999;">Esta es una notificación automática de ${settings.appTitle || 'Booklysharp'}.</p>
                      </div>`
            });
            return true;
        }
    } catch (error) {
        console.error('Error sending immediate notification:', error);
        return false;
    }
}
