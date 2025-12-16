/**
 * Serviço de Email para Cloudflare Workers
 * Usa Resend API para enviar emails
 */

import { D1Client } from './d1Client';

export interface EmailConfig {
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USERNAME: string;
  SMTP_PASSWORD: string;
  SMTP_SENDER: string;
  RESEND_API_KEY?: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Gera token de reset seguro
 */
export function generateResetToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Gera código de reset de 6 dígitos
 */
export function generateResetCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Classe para gerenciar reset de senha
 */
export class PasswordResetService {
  private db: D1Client;
  private baseUrl: string;
  private emailConfig: EmailConfig;

  constructor(db: D1Client, baseUrl: string, emailConfig: EmailConfig) {
    this.db = db;
    this.baseUrl = baseUrl;
    this.emailConfig = emailConfig;
  }

  /**
   * Solicita reset de senha - cria token e envia email
   */
  async requestReset(email: string): Promise<{ success: boolean; error?: string; resetUrl?: string }> {
    try {
      // Verificar se usuário existe
      const user = await this.db.first<{ id: string; email: string; full_name: string }>(
        'SELECT id, email, full_name FROM profiles WHERE email = ?',
        [email.toLowerCase()]
      );

      if (!user) {
        // Por segurança, não revelar se o email existe ou não
        console.log('⚠️ Email não encontrado:', email);
        return { success: true };
      }

      // Invalidar tokens anteriores
      await this.db.execute(
        'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE email = ? AND used_at IS NULL',
        [email.toLowerCase()]
      );

      // Gerar novo token
      const token = generateResetToken();
      const code = generateResetCode();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutos

      // Salvar token no banco
      await this.db.execute(
        `INSERT INTO password_reset_tokens (id, user_id, email, token, expires_at)
         VALUES (?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), user.id, email.toLowerCase(), token, expiresAt]
      );

      // Gerar URL de reset
      const resetUrl = `${this.baseUrl}/reset-password?token=${token}`;

      // Logar no console para desenvolvimento
      console.log('');
      console.log('========================================');
      console.log('🔐 RESET DE SENHA - LINK GERADO');
      console.log('========================================');
      console.log(`📧 Email: ${email}`);
      console.log(`👤 Nome: ${user.full_name || 'Usuário'}`);
      console.log(`🔑 Código: ${code}`);
      console.log(`🔗 Link: ${resetUrl}`);
      console.log('========================================');
      console.log('');

      // Enviar email
      await this.sendResetEmail(email, user.full_name || 'Usuário', resetUrl, code);

      return { success: true, resetUrl };
    } catch (error: any) {
      console.error('Error requesting password reset:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verifica se token é válido
   */
  async verifyToken(token: string): Promise<{ valid: boolean; email?: string; error?: string }> {
    try {
      const resetToken = await this.db.first<{
        id: string;
        email: string;
        expires_at: string;
        used_at: string | null;
      }>(
        'SELECT id, email, expires_at, used_at FROM password_reset_tokens WHERE token = ?',
        [token]
      );

      if (!resetToken) {
        return { valid: false, error: 'Token inválido' };
      }

      if (resetToken.used_at) {
        return { valid: false, error: 'Token já foi utilizado' };
      }

      if (new Date(resetToken.expires_at) < new Date()) {
        return { valid: false, error: 'Token expirado' };
      }

      return { valid: true, email: resetToken.email };
    } catch (error: any) {
      console.error('Error verifying token:', error);
      return { valid: false, error: error.message };
    }
  }

  /**
   * Reseta a senha usando o token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verificar token
      const verification = await this.verifyToken(token);
      if (!verification.valid) {
        return { success: false, error: verification.error };
      }

      // Buscar usuário pelo email
      const user = await this.db.first<{ id: string }>(
        'SELECT id FROM profiles WHERE email = ?',
        [verification.email!]
      );

      if (!user) {
        return { success: false, error: 'Usuário não encontrado' };
      }

      // Atualizar senha
      // TODO: Implementar hash de senha aqui!
      await this.db.execute(
        'UPDATE profiles SET password_hash = ?, updated_at = ? WHERE id = ?',
        [newPassword, new Date().toISOString(), user.id]
      );

      // Marcar token como usado
      await this.db.execute(
        'UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE token = ?',
        [token]
      );

      return { success: true };
    } catch (error: any) {
      console.error('Error resetting password:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia email de reset de senha
   */
  private async sendResetEmail(to: string, name: string, resetUrl: string, code: string): Promise<void> {
    const html = this.generateEmailHtml(name, resetUrl, code);
    const text = this.generateEmailText(name, resetUrl, code);

    // Tentar enviar via Resend API
    if (this.emailConfig.RESEND_API_KEY) {
      try {
        await this.sendViaResend(to, 'Redefinir sua senha - ACI', html, text);
        console.log('✅ Email enviado com sucesso via Resend');
        return;
      } catch (error: any) {
        console.error('⚠️ Falha ao enviar email via Resend:', error.message);
      }
    }

    // Fallback: MailChannels
    try {
      await this.sendViaMailChannels(to, 'Redefinir sua senha - ACI', html, text);
      console.log('✅ Email enviado com sucesso via MailChannels');
    } catch (error: any) {
      console.error('⚠️ Falha ao enviar email via MailChannels:', error.message);
      console.log('💡 Use o link do console para testar o reset de senha localmente');
    }
  }

  /**
   * Envia email usando Resend API
   */
  private async sendViaResend(to: string, subject: string, html: string, text: string): Promise<void> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.emailConfig.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ACI <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
        text: text,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`Resend API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('📧 Resend email ID:', data.id);
  }

  /**
   * Envia email usando MailChannels (gratuito para Cloudflare Workers)
   */
  private async sendViaMailChannels(to: string, subject: string, html: string, text: string): Promise<void> {
    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
          },
        ],
        from: {
          email: this.emailConfig.SMTP_USERNAME || 'noreply@aci.com',
          name: 'ACI Automações Comerciais',
        },
        subject: subject,
        content: [
          {
            type: 'text/plain',
            value: text,
          },
          {
            type: 'text/html',
            value: html,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MailChannels error: ${response.status} - ${errorText}`);
    }
  }

  /**
   * Gera HTML do email
   */
  private generateEmailHtml(name: string, resetUrl: string, code: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - ACI</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e4e4e7;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #6366f1;">
                ACI Automações Comerciais
              </h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #18181b;">
                Olá, ${name}!
              </h2>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #52525b;">
                Recebemos uma solicitação para redefinir a senha da sua conta. Se você não fez essa solicitação, ignore este email.
              </p>
              
              <!-- Code Box -->
              <div style="background-color: #f4f4f5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 14px; color: #71717a;">
                  Seu código de verificação:
                </p>
                <p style="margin: 0; font-size: 32px; font-weight: 700; color: #6366f1; letter-spacing: 4px;">
                  ${code}
                </p>
              </div>
              
              <p style="margin: 0 0 24px; font-size: 14px; color: #71717a; text-align: center;">
                Ou clique no botão abaixo:
              </p>
              
              <!-- Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                  Redefinir Senha
                </a>
              </div>
              
              <p style="margin: 0; font-size: 14px; color: #a1a1aa; text-align: center;">
                Este link expira em <strong>30 minutos</strong>.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
              <p style="margin: 0; font-size: 12px; color: #a1a1aa; text-align: center;">
                © 2024 ACI Automações Comerciais. Todos os direitos reservados.<br>
                Se você não solicitou esta redefinição, ignore este email.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Gera texto do email
   */
  private generateEmailText(name: string, resetUrl: string, code: string): string {
    return `
Olá, ${name}!

Recebemos uma solicitação para redefinir a senha da sua conta ACI.

Seu código de verificação: ${code}

Ou acesse o link: ${resetUrl}

Este link expira em 30 minutos.

Se você não solicitou esta redefinição, ignore este email.

--
ACI Automações Comerciais
    `.trim();
  }
}
