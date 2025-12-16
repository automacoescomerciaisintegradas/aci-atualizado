import { nanoid } from 'nanoid';

interface PasswordResetToken {
    token: string;
    email: string;
    expiresAt: Date;
    used: boolean;
}

// In-memory storage (em produção, use Redis ou banco de dados)
const resetTokens = new Map<string, PasswordResetToken>();

/**
 * Gera um token de recuperação de senha
 */
export function generateResetToken(email: string): string {
    // Gera um token único e seguro
    const token = nanoid(32);

    // Token válido por 1 hora
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Armazena o token
    resetTokens.set(token, {
        token,
        email: email.toLowerCase(),
        expiresAt,
        used: false
    });

    console.log(`🔑 Token de reset gerado para ${email}, expira em ${expiresAt.toLocaleString()}`);

    return token;
}

/**
 * Valida um token de recuperação de senha
 */
export function validateResetToken(token: string): { valid: boolean; email?: string; error?: string } {
    const resetData = resetTokens.get(token);

    if (!resetData) {
        return { valid: false, error: 'Token inválido ou não encontrado' };
    }

    if (resetData.used) {
        return { valid: false, error: 'Token já foi utilizado' };
    }

    if (new Date() > resetData.expiresAt) {
        resetTokens.delete(token);
        return { valid: false, error: 'Token expirado. Solicite um novo reset de senha.' };
    }

    return { valid: true, email: resetData.email };
}

/**
 * Marca um token como usado
 */
export function markTokenAsUsed(token: string): void {
    const resetData = resetTokens.get(token);
    if (resetData) {
        resetData.used = true;
        console.log(`✅ Token ${token} marcado como usado`);

        // Remove o token após 5 minutos
        setTimeout(() => {
            resetTokens.delete(token);
            console.log(`🗑️ Token ${token} removido da memória`);
        }, 5 * 60 * 1000);
    }
}

/**
 * Limpa tokens expirados (executar periodicamente)
 */
export function cleanExpiredTokens(): void {
    const now = new Date();
    let cleaned = 0;

    for (const [token, data] of resetTokens.entries()) {
        if (now > data.expiresAt || data.used) {
            resetTokens.delete(token);
            cleaned++;
        }
    }

    if (cleaned > 0) {
        console.log(`🧹 ${cleaned} tokens expirados foram removidos`);
    }
}

// Limpa tokens expirados a cada 15 minutos
setInterval(cleanExpiredTokens, 15 * 60 * 1000);
