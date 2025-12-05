import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config/email.js';

// Configurações SMTP
const smtpConfig = {
  host: EMAIL_CONFIG.SMTP_HOST,
  port: EMAIL_CONFIG.SMTP_PORT,
  secure: EMAIL_CONFIG.SMTP_SECURE, // true for 465, false for other ports
  auth: {
    user: EMAIL_CONFIG.SMTP_USERNAME,
    pass: EMAIL_CONFIG.SMTP_PASSWORD
  }
};

// Criar transporter
const transporter = nodemailer.createTransporter(smtpConfig);

// Verificar conexão (opcional, apenas para debugging)
/*
transporter.verify((error, success) => {
  if (error) {
    console.error('Erro na configuração do transporte de e-mail:', error);
  } else {
    console.log('Servidor de e-mail pronto para enviar mensagens');
  }
});
*/

// Função para enviar e-mail de verificação pessoal
export const sendPersonalVerificationEmail = async (
  userEmail: string,
  userName: string,
  userData: {
    name: string;
    email: string;
    phone: string;
    document: string;
  }
) => {
  try {
    const mailOptions = {
      from: EMAIL_CONFIG.SMTP_SENDER,
      to: userEmail,
      subject: 'Verificação de Identidade - ACI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #4f46e5; color: white; padding: 20px; text-align: center;">
            <h1>ACI Automações Comerciais</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333;">Verificação de Identidade</h2>
            <p>Olá ${userName},</p>
            <p>Recebemos uma solicitação de verificação de identidade. Abaixo estão os dados fornecidos:</p>
            
            <div style="background: white; padding: 15px; border-radius: 5px; border: 1px solid #eee; margin: 20px 0;">
              <h3>Dados de Verificação</h3>
              <p><strong>Nome Completo:</strong> ${userData.name}</p>
              <p><strong>E-mail:</strong> ${userData.email}</p>
              <p><strong>Telefone:</strong> ${userData.phone}</p>
              <p><strong>Documento (CPF/CNPJ):</strong> ${userData.document}</p>
            </div>
            
            <p>Estes dados serão utilizados apenas para fins de verificação de identidade.</p>
            <p>Equipe ACI Automações Comerciais</p>
          </div>
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© 2025 ACI Automações Comerciais. Todos os direitos reservados.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail de verificação enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar e-mail de verificação:', error);
    return { success: false, error: error.message };
  }
};

// Função para enviar e-mail de confirmação de verificação
export const sendVerificationConfirmationEmail = async (
  userEmail: string,
  userName: string
) => {
  try {
    const mailOptions = {
      from: EMAIL_CONFIG.SMTP_SENDER,
      to: userEmail,
      subject: 'Verificação Concluída - ACI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; color: white; padding: 20px; text-align: center;">
            <h1>ACI Automações Comerciais</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333;">Verificação Concluída com Sucesso!</h2>
            <p>Olá ${userName},</p>
            <p>Parabéns! Sua identidade foi verificada com sucesso em nosso sistema.</p>
            <p>Agora você tem acesso completo a todas as funcionalidades da plataforma.</p>
            <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #10b981; margin: 20px 0;">
              <h3>Benefícios da Verificação</h3>
              <ul>
                <li>Acesso ilimitado às funcionalidades premium</li>
                <li>Prioridade no suporte técnico</li>
                <li>Maior limite de créditos mensais</li>
                <li>Funcionalidades exclusivas para usuários verificados</li>
              </ul>
            </div>
            <p>Equipe ACI Automações Comerciais</p>
          </div>
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© 2025 ACI Automações Comerciais. Todos os direitos reservados.</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-mail de confirmação enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar e-mail de confirmação:', error);
    return { success: false, error: error.message };
  }
};

export default transporter;