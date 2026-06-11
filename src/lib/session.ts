/**
 * Sesión firmada con HMAC-SHA256 (Web Crypto, compatible Node y Edge).
 * Formato del token: base64url(payloadJSON).base64url(firma)
 * Sin dependencias externas.
 */

export interface SessionPayload {
    sub: string;            // user id
    role: string;           // ADMIN | USER | SUPERADMIN
    tenantId?: string;      // ausente para SUPERADMIN
    exp: number;            // epoch en segundos
}

export const SESSION_COOKIE = 'bs_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

const getSecret = (): string => {
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
    if (!secret) {
        throw new Error('AUTH_SECRET (o NEXTAUTH_SECRET) debe estar definido en el entorno');
    }
    return secret;
};

const enc = new TextEncoder();

const toBase64Url = (bytes: Uint8Array): string => {
    let bin = '';
    for (const b of bytes) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (s: string): Uint8Array => {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
};

async function getHmacKey(usage: KeyUsage): Promise<CryptoKey> {
    return crypto.subtle.importKey(
        'raw',
        enc.encode(getSecret()),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        [usage]
    );
}

export async function signSession(
    payload: Omit<SessionPayload, 'exp'>,
    maxAgeSeconds: number = SESSION_MAX_AGE
): Promise<string> {
    const full: SessionPayload = {
        ...payload,
        exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
    };
    const body = toBase64Url(enc.encode(JSON.stringify(full)));
    const key = await getHmacKey('sign');
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(body));
    return `${body}.${toBase64Url(new Uint8Array(sig))}`;
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    try {
        const key = await getHmacKey('verify');
        const valid = await crypto.subtle.verify(
            'HMAC',
            key,
            fromBase64Url(parts[1]) as unknown as ArrayBuffer,
            enc.encode(parts[0])
        );
        if (!valid) return null;

        const payload = JSON.parse(
            new TextDecoder().decode(fromBase64Url(parts[0]))
        ) as SessionPayload;

        if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch {
        return null;
    }
}
