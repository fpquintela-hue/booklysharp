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
/**
 * Sends a plain text WhatsApp message via Evolution API.
 * Used for immediate booking confirmations.
 */
async function sendWhatsAppText({
    instanceName,
    number,
    message,
}: {
    instanceName: string;
    number: string;
    message: string;
}): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    let response: Response;
    try {
        response = await fetch(
            `${EVOLUTION_API_URL}/message/sendText/${instanceName}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': EVOLUTION_API_KEY,
                },
                body: JSON.stringify({
                    number,
                    text: message,
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

/**
 * Sends an immediate notification (WhatsApp text or email) right after a booking is created.
 *
 * @param appointment - Appointment object. `patient` may contain either encrypted or plain-text fields.
 * @param tenant      - Tenant object including `settings[]` and `alias`.
 * @param type        - Channel preference chosen by the customer.
 * @param plainPatient - When true, `appointment.patient` contains plain-text data (already decrypted).
 */
export async function sendImmediateNotification(
    appointment: any,
    tenant: any,
    type: 'WHATSAPP' | 'EMAIL',
    plainPatient = false
) {
    try {
        const settings = tenant.settings?.reduce((acc: any, s: any) => {
            acc[s.key] = s.value;
            return acc;
        }, {}) ?? {};

        // Patient data: if plainPatient=true it comes raw from the booking form;
        // otherwise it is stored encrypted and we decrypt it here.
        const rawPatient = appointment.patient as any;
        const patientPhone = plainPatient ? rawPatient?.phone : decrypt(rawPatient?.phone);
        const patientEmail = plainPatient ? rawPatient?.email : decrypt(rawPatient?.email);
        const patientName  = plainPatient ? rawPatient?.name  : decrypt(rawPatient?.name);

        const dateStr = new Intl.DateTimeFormat('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Madrid'
        }).format(new Date(appointment.start));

        const confirmUrl = buildConfirmationUrl(tenant.alias, appointment.id);

        // Build the message from the tenant template or a sensible default
        const template = settings.whatsapp_template_reserva_automatica ||
            '¡Hola *{{nombre}}*! 📅 Tu reserva ha sido confirmada para el *{{fecha}}*. Servicio: *{{servicio}}*.';

        const bodyText = template
            .replace(/{{nombre}}|{nombre}/g, patientName || 'Cliente')
            .replace(/{{fecha}}|{fecha}/g,   dateStr)
            .replace(/{{servicio}}|{servicio}/g, appointment.type || '');

        // ────────────────────── WhatsApp ──────────────────────
        if (type === 'WHATSAPP' && patientPhone) {
            let cleanNumber = patientPhone.replace(/[^0-9]/g, '');
            if (cleanNumber.startsWith('00')) cleanNumber = cleanNumber.substring(2);
            const finalNumber = cleanNumber.length === 9 ? `34${cleanNumber}` : cleanNumber;

            const fullInstanceName = getFullInstanceName(tenant.alias);

            // Plain-text message: body + confirmation link
            const finalMessage = `${bodyText}\n\n✅ Confirmar o anular tu cita:\n${confirmUrl}`;

            try {
                await sendWhatsAppText({
                    instanceName: fullInstanceName,
                    number: finalNumber,
                    message: finalMessage,
                });
                return true;
            } catch (err: unknown) {
                console.error('[WhatsApp] Error enviando confirmación inmediata:', err);
                return false;
            }
        }

        // ────────────────────── Email ──────────────────────
        if (type === 'EMAIL' && patientEmail) {
            const emailSystem = await getTransporter();
            if (!emailSystem) {
                console.warn('[Email] No hay transporter configurado. Revisa SMTP.');
                return false;
            }

            const businessName = settings.appTitle || tenant.nombre_comercial || 'BooklySharp';
            const plainText = bodyText.replace(/\*/g, '');

            await emailSystem.transporter.sendMail({
                from: emailSystem.from,
                to: patientEmail,
                subject: `Confirmación de reserva — ${businessName}`,
                text: `${plainText}\n\nConfirma o anula tu cita: ${confirmUrl}`,
                html: `
                    <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; color: #1e293b;">
                        <div style="background: #2563eb; padding: 28px 32px; border-radius: 12px 12px 0 0;">
                            <h1 style="color: #fff; font-size: 22px; margin: 0;">Reserva confirmada ✅</h1>
                        </div>
                        <div style="background: #f8fafc; padding: 32px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                            <p style="font-size: 16px; margin: 0 0 8px;">Hola, <strong>${patientName || 'Cliente'}</strong></p>
                            <p style="color: #475569; margin: 0 0 24px;">Tu cita ha quedado registrada con los siguientes datos:</p>

                            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 10px 12px; background: #fff; border: 1px solid #e2e8f0; font-weight: 600; width: 30%;">Servicio</td>
                                    <td style="padding: 10px 12px; background: #fff; border: 1px solid #e2e8f0;">${appointment.type || 'Consulta'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 12px; background: #f1f5f9; border: 1px solid #e2e8f0; font-weight: 600;">Fecha y hora</td>
                                    <td style="padding: 10px 12px; background: #f1f5f9; border: 1px solid #e2e8f0;">${dateStr}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 12px; background: #fff; border: 1px solid #e2e8f0; font-weight: 600;">Centro</td>
                                    <td style="padding: 10px 12px; background: #fff; border: 1px solid #e2e8f0;">${businessName}</td>
                                </tr>
                            </table>

                            <a href="${confirmUrl}" style="display: inline-block; background: #2563eb; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 15px;">Ver o anular mi cita</a>

                            <p style="font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                                Este correo fue enviado automáticamente por ${businessName} a través de BooklySharp.
                                Si no has realizado esta reserva, puedes ignorar este mensaje o anularla desde el botón de arriba.
                            </p>
                        </div>
                    </div>`,
            });
            return true;
        }

        return false;
    } catch (error) {
        console.error('[sendImmediateNotification] Error:', error);
        return false;
    }
}
