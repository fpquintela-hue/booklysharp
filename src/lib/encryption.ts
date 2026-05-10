import crypto from 'crypto';

// Enforce ENCRYPTION_KEY in production to avoid hardcoded default key usage
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (process.env.NODE_ENV === 'production' && (!ENCRYPTION_KEY || ENCRYPTION_KEY === 'default_secret_key_needs_32_bytes_!')) {
    throw new Error('CRITICAL: ENCRYPTION_KEY must be securely set in production.');
}

const ACTIVE_KEY = ENCRYPTION_KEY || 'default_secret_key_needs_32_bytes_!';
const ALGORITHM = 'aes-256-gcm';

// Helper to ensure key is exactly 32 bytes
const getKey = () => {
    return crypto.createHash('sha256').update(String(ACTIVE_KEY)).digest('base64').substring(0, 32);
};

export const encrypt = (text: string | null | undefined): string | null => {
    if (!text) return text as any;

    // If it's already encrypted, don't encrypt again
    if (text.startsWith('ENC:')) return text;

    try {
        const iv = crypto.randomBytes(12); // Standard for GCM
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(getKey()), iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const authTag = cipher.getAuthTag().toString('hex');

        return `ENC:${iv.toString('hex')}:${authTag}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Encryption failed. Aborting to prevent data exposure.');
    }
};

export const decrypt = (encryptedText: string | null | undefined): string | null => {
    if (!encryptedText) return encryptedText as any;

    // Check if it has our encryption prefix
    if (!encryptedText.startsWith('ENC:')) return encryptedText;

    try {
        const parts = encryptedText.split(':');
        if (parts.length !== 4) return encryptedText;

        const iv = Buffer.from(parts[1], 'hex');
        const authTag = Buffer.from(parts[2], 'hex');
        const encryptedData = parts[3];

        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(getKey()), iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        return encryptedText; // Return raw text if decryption fails to avoid crashing
    }
};
