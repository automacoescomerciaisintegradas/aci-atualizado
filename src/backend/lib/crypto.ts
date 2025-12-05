import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-secret-key!!'; // Deve ter 32 caracteres
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

/**
 * Criptografa um texto
 */
export function encrypt(text: string): string {
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));

        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Retorna IV + encrypted data
        return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
        console.error('Erro ao criptografar:', error);
        throw new Error('Erro ao criptografar dados');
    }
}

/**
 * Descriptografa um texto
 */
export function decrypt(encryptedText: string): string {
    try {
        const parts = encryptedText.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').substring(0, 32));

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Erro ao descriptografar:', error);
        throw new Error('Erro ao descriptografar dados');
    }
}
