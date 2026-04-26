import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/encryption';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import nodemailer from 'nodemailer';

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://192.168.1.6:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';

/** URL de imagen de marca por defecto si el tenant no tiene logo configurado */
const DEFAULT_BRAND_IMAGE_URL = process.env.DEFAULT_WHATSAPP_IMAGE_URL ||
    'https://booklysharp.com/images/whatsapp-reminder-default.png';

const getFullInstanceName = (alias: string) => `BooklySharp_${alias.replace(/[^a-zA-Z0-9]/g, '_')}`;

/**
 * Construye el enlace dinámico de confirmación de asistencia.
 * Formato: {NEXT_PUBLIC_APP_URL}/{alias}/confirm/{appointmentId}
 */
function buildConfirmationUrl(tenantAlias: string, appointmentId: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://booklysharp.com';
    return `${baseUrl}/${tenantAlias}/confirm/${appointmentId}`;
}

/**
 * Envía un mensaje de WhatsApp con imagen + caption via Evolution API /message/sendMedia.
 *
 * Errores manejados:
 * - Timeout de 15 s (AbortSignal) → lanza error
 * - HTTP 4xx (número inválido, instancia desconectada...) → lanza error con mensaje de la API
 * - HTTP 5xx / red → lanza error genérico
 */
async function sendWhatsAppMedia({
    instanceName,
    number,
    imageUrl,
    caption,
    confirmUrl,
}: {
    instanceName: string;
    number: string;
    imageUrl: string;
    caption: string;
    confirmUrl: string;
}): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    let response: Response;
    try {
        // Evolution API v2 Interactive Message format for CTA Buttons
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
                                title: "Ver o Anular Cita",
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
            // ignoramos errores de parseo del body de error
        }
        throw new Error(`Evolution API error (${instanceName}): ${apiMessage}`);
    }
}

async function getTransporter() {
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

export async function GET(request: Request) {
    try {
        const now = new Date();
        
        // 1. Fetch all pending reminders
        const pendingReminders = await (prisma as any).reminder.findMany({
            where: {
                status: 'PENDING'
            },
            include: {
                appointment: {
                    include: {
                        patient: true,
                        tenant: {
                            include: {
                                settings: true
                            }
                        },
                        professional: true
                    }
                }
            }
        });

        const results = {
            processed: 0,
            sent_whatsapp: 0,
            sent_email: 0,
            failed: 0,
            skipped: 0
        };

        const emailSystem = await getTransporter();

        for (const reminder of pendingReminders) {
            results.processed++;
            
            const appointment = reminder.appointment;
            if (!appointment) {
                results.failed++;
                continue;
            }

            // Target time to send
            const targetTime = new Date(appointment.start.getTime() - (reminder.timeMinutes * 60000));
            
            // If it's too early to send, skip 
            // EXCEPTION: timeMinutes === 0 corresponds to the immediate booking confirmation
            // and should NOT be delayed until the appointment time.
            if (reminder.timeMinutes !== 0 && targetTime > now) {
                results.skipped++;
                continue;
            }

            // If appointment is already in the past, mark as failed if not sent within 30 mins window
            const fiveMinutesAgo = new Date(now.getTime() - 60 * 60000); // 1 hour window
            if (appointment.start < fiveMinutesAgo) {
                await (prisma as any).reminder.update({
                    where: { id: reminder.id },
                    data: { status: 'FAILED' }
                });
                results.failed++;
                continue;
            }

            // Common Data
            const tenant = appointment.tenant;
            const settings = tenant.settings.reduce((acc: any, s: any) => {
                acc[s.key] = s.value;
                return acc;
            }, {});

            const patientPhone = decrypt(appointment.patient.phone);
            const patientEmail = decrypt(appointment.patient.email);
            const patientName = decrypt(appointment.patient.name);
            const dateParts = new Intl.DateTimeFormat('es-ES', { 
                day: 'numeric', 
                month: 'long', 
                hour: '2-digit', 
                minute: '2-digit',
                timeZone: 'Europe/Madrid'
            }).formatToParts(appointment.start);
            const rDay = dateParts.find((p: any) => p.type === 'day')?.value;
            const rMonth = dateParts.find((p: any) => p.type === 'month')?.value;
            const rHour = dateParts.find((p: any) => p.type === 'hour')?.value;
            const rMinute = dateParts.find((p: any) => p.type === 'minute')?.value;
            const dateStr = `${rDay} de ${rMonth} a las ${rHour}:${rMinute}`;
            
            // Template selection
            let template = settings.whatsapp_template_1 || settings.whatsapp_template;
            if (!template) {
                template = `Hola *{{nombre}}*, te recordamos tu cita en *${settings.appTitle || 'nuestro centro'}* para el día *{{fecha}}*. ¡Te esperamos!`;
            }

            const finalMessage = template
                .replace(/{{nombre}}|{nombre}/g, patientName)
                .replace(/{{fecha}}|{fecha}/g, dateStr)
                .replace(/{{profesional}}|{profesional}/g, appointment.professional?.name || '');

            // SEND LOGIC
            if (reminder.type === 'WHATSAPP') {
                if (!patientPhone) {
                    await (prisma as any).reminder.update({ where: { id: reminder.id }, data: { status: 'FAILED' } });
                    results.failed++;
                    continue;
                }

                let cleanNumber = patientPhone.replace(/[^0-9]/g, '');
                if (cleanNumber.startsWith('00')) cleanNumber = cleanNumber.substring(2);
                const finalNumber = (cleanNumber.length === 9) ? `34${cleanNumber}` : cleanNumber;

                // Imagen corporativa: logo del tenant si es URL externa, sino imagen por defecto
                const imageUrl = (settings.logoUrl && !settings.logoUrl.startsWith('/'))
                    ? settings.logoUrl
                    : DEFAULT_BRAND_IMAGE_URL;

                // Caption condicional según si el tenant tiene profesional asignado en la cita
                const confirmUrl = buildConfirmationUrl(tenant.alias, appointment.id);
                const hasProfessional = !!appointment.professional;
                const caption = finalMessage;

                try {
                    const fullInstanceName = getFullInstanceName(tenant.alias);
                    await sendWhatsAppMedia({
                        instanceName: fullInstanceName,
                        number: finalNumber,
                        imageUrl,
                        caption,
                        confirmUrl
                    });
                    await (prisma as any).reminder.update({ where: { id: reminder.id }, data: { status: 'SENT' } });
                    results.sent_whatsapp++;
                } catch (err: unknown) {
                    console.error(`[Reminder ${reminder.id}] WhatsApp sendMedia error:`, err);
                    await (prisma as any).reminder.update({ where: { id: reminder.id }, data: { status: 'FAILED' } });
                    results.failed++;
                }
            } 
            else if (reminder.type === 'EMAIL') {
                if (!patientEmail || !emailSystem) {
                    await (prisma as any).reminder.update({ where: { id: reminder.id }, data: { status: 'FAILED' } });
                    results.failed++;
                    continue;
                }

                try {
                    await emailSystem.transporter.sendMail({
                        from: emailSystem.from,
                        to: patientEmail,
                        subject: `Recordatorio de cita - ${settings.appTitle || 'Centro de Citas'}`,
                        text: finalMessage.replace(/\*/g, ''), // Clean markdown stars for email plain text
                        html: `<div style="font-family: sans-serif; padding: 20px; color: #333;">
                                <h2 style="color: #0058be;">Recordatorio de Cita</h2>
                                <p>Hola <strong>${patientName}</strong>,</p>
                                <p>Te recordamos tu próxima cita para el día <strong>${dateStr}</strong>.</p>
                                <p>Servicio: ${appointment.type}</p>
                                ${appointment.professional?.name ? `<p>Profesional: ${appointment.professional.name}</p>` : ''}
                                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                                <p style="font-size: 12px; color: #999;">Esta es una notificación automática de ${settings.appTitle || 'Booklysharp'}.</p>
                              </div>`
                    });

                    await (prisma as any).reminder.update({ where: { id: reminder.id }, data: { status: 'SENT' } });
                    results.sent_email++;
                } catch (e) {
                    console.error('Email error:', e);
                    results.failed++;
                }
            }
        }

        return NextResponse.json({ success: true, ...results });
    } catch (error) {
        console.error('Error processing reminders:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
