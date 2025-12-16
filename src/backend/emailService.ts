import nodemailer from 'nodemailer';

// Configuração do transporte de e-mail
// Para produção, use variáveis de ambiente
const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true, // true para 465, false para outras portas
    auth: {
        user: 'resend',
        pass: 're_MmTAe1eu_8D1mJ7qpMt1rEE7wCmTYBSTe'
    }
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Envia um e-mail usando o transporte configurado
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
    try {
        const info = await transporter.sendMail({
            from: `"ACI Automações" <onboarding@resend.dev>`, // Remetente obrigatório para testes no Resend
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        });

        console.log('✅ E-mail enviado com sucesso:', info.messageId);
        return true;
    } catch (error) {
        console.error('❌ Erro ao enviar e-mail:', error);
        return false;
    }
}

/**
 * Envia e-mail de recuperação de senha
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 40px auto;
                    background: white;
                    border-radius: 10px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                }
                .content {
                    padding: 40px 30px;
                }
                .content p {
                    margin: 0 0 20px;
                    font-size: 16px;
                }
                .button {
                    display: inline-block;
                    padding: 15px 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    margin: 20px 0;
                    text-align: center;
                }
                .button:hover {
                    opacity: 0.9;
                }
                .footer {
                    background: #f8f9fa;
                    padding: 20px 30px;
                    text-align: center;
                    font-size: 14px;
                    color: #666;
                }
                .warning {
                    background: #fff3cd;
                    border-left: 4px solid #ffc107;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }
                .code-box {
                    background: #f8f9fa;
                    border: 2px dashed #dee2e6;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                    text-align: center;
                    font-family: 'Courier New', monospace;
                    font-size: 18px;
                    font-weight: bold;
                    color: #495057;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Recuperação de Senha</h1>
                </div>
                <div class="content">
                    <p>Olá,</p>
                    <p>Recebemos uma solicitação para redefinir a senha da sua conta <strong>ACI - Automações Comerciais Integradas</strong>.</p>
                    
                    <p>Para criar uma nova senha, clique no botão abaixo:</p>
                    
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="button">Redefinir Senha</a>
                    </div>
                    
                    <p>Ou copie e cole o seguinte link no seu navegador:</p>
                    <div class="code-box">
                        ${resetUrl}
                    </div>
                    
                    <div class="warning">
                        <strong>⚠️ Importante:</strong>
                        <ul style="margin: 10px 0 0; padding-left: 20px;">
                            <li>Este link é válido por <strong>1 hora</strong></li>
                            <li>Se você não solicitou esta redefinição, ignore este e-mail</li>
                            <li>Nunca compartilhe este link com outras pessoas</li>
                        </ul>
                    </div>
                    
                    <p>Se o botão não funcionar, você também pode usar o código de recuperação abaixo:</p>
                    <div class="code-box">
                        ${resetToken}
                    </div>
                </div>
                <div class="footer">
                    <p>Este é um e-mail automático, por favor não responda.</p>
                    <p>© ${new Date().getFullYear()} ACI - Automações Comerciais Integradas. Todos os direitos reservados.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const text = `
Recuperação de Senha - ACI

Olá,

Recebemos uma solicitação para redefinir a senha da sua conta.

Para criar uma nova senha, acesse o seguinte link:
${resetUrl}

Ou use o código de recuperação: ${resetToken}

Este link é válido por 1 hora.

Se você não solicitou esta redefinição, ignore este e-mail.

---
ACI - Automações Comerciais Integradas
    `.trim();

    return sendEmail({
        to: email,
        subject: '🔐 Recuperação de Senha - ACI',
        html,
        text
    });
}

/**
 * Envia e-mail de boas-vindas
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎉 Bem-vindo à ACI!</h1>
                </div>
                <div class="content">
                    <p>Olá <strong>${name}</strong>,</p>
                    <p>Sua conta foi criada com sucesso! Você ganhou <strong>R$ 3,00</strong> de bônus para começar.</p>
                    <p>Comece agora a automatizar suas vendas e marketing!</p>
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Acessar Plataforma</a>
                </div>
            </div>
        </body>
        </html>
    `;

    return sendEmail({
        to: email,
        subject: '🎉 Bem-vindo à ACI - Automações Comerciais',
        html,
        text: `Olá ${name},\n\nSua conta foi criada com sucesso! Você ganhou R$ 3,00 de bônus.\n\nAcesse: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`
    });
}
