import { google } from 'googleapis';
import { decrypt } from '@/lib/encryption';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/integrations/google/callback'
);

export const getGoogleAuthUrl = (professionalId: string, tenantId: string) => {
    // We pass both professionalId and tenantId as state so the callback knows who this is for.
    const state = Buffer.from(JSON.stringify({ professionalId, tenantId })).toString('base64');

    return oauth2Client.generateAuthUrl({
        access_type: 'offline', // Very important: this gets us the refresh token
        prompt: 'consent', // Force consent so we always get a refresh token
        scope: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
        ],
        state
    });
};

export const getTokensFromCode = async (code: string) => {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};

export const getCalendarClient = (accessToken: string, refreshToken?: string) => {
    const client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    );
    client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });
    return google.calendar({ version: 'v3', auth: client });
};

// --- Calendar Actions Sync ---
export const createCalendarEvent = async (prof: any, appointment: any, patientName: string) => {
    if (!prof.googleAccessToken || !prof.googleCalendarId) return null;

    try {
        const calendar = getCalendarClient(prof.googleAccessToken, prof.googleRefreshToken);
        const event = await calendar.events.insert({
            calendarId: prof.googleCalendarId,
            requestBody: {
                summary: `${appointment.type || 'Cita'} - ${patientName}`,
                description: `Cita creada desde booklysharp\nTipo: ${appointment.type || 'General'}\nNotas: ${appointment.notes ? decrypt(appointment.notes) : 'Ninguna'}`,
                start: { dateTime: new Date(appointment.start).toISOString() },
                end: { dateTime: new Date(appointment.end).toISOString() },
            }
        });
        return event.data.id;
    } catch (error) {
        console.error('Error insertando evento en Google Calendar:', error);
        return null; // Don't crash the main app if Google sync fails temporarily
    }
};

export const updateCalendarEvent = async (prof: any, appointment: any, patientName?: string) => {
    if (!prof.googleAccessToken || !prof.googleCalendarId || !appointment.googleEventId) return;

    try {
        const calendar = getCalendarClient(prof.googleAccessToken, prof.googleRefreshToken);

        // Fetch current to not overwrite everything blindly if only partial update
        const currentEvent = await calendar.events.get({
            calendarId: prof.googleCalendarId,
            eventId: appointment.googleEventId
        });

        await calendar.events.patch({
            calendarId: prof.googleCalendarId,
            eventId: appointment.googleEventId,
            requestBody: {
                summary: patientName ? `${appointment.type || 'Cita'} - ${patientName}` : currentEvent.data.summary,
                description: `Cita creada desde booklysharp\nTipo: ${appointment.type || 'General'}\nNotas: ${appointment.notes ? decrypt(appointment.notes) : 'Ninguna'}`,
                start: { dateTime: new Date(appointment.start).toISOString() },
                end: { dateTime: new Date(appointment.end).toISOString() },
            }
        });
    } catch (error) {
        console.error('Error actualizando evento en Google Calendar:', error);
    }
};

export const deleteCalendarEvent = async (prof: any, googleEventId: string) => {
    if (!prof.googleAccessToken || !prof.googleCalendarId || !googleEventId) return;

    try {
        const calendar = getCalendarClient(prof.googleAccessToken, prof.googleRefreshToken);
        await calendar.events.delete({
            calendarId: prof.googleCalendarId,
            eventId: googleEventId
        });
    } catch (error) {
        console.error('Error borrando evento en Google Calendar:', error);
    }
};
