const nodemailer = require('nodemailer');

// Configurações SMTP do Gmail
const smtpConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'automacoescomerciais@gmail.com',
    pass: 'nzhyikkbecdamomf'
  }
};

// Criar transporter
const transporter = nodemailer.createTransporter(smtpConfig);

// Verificar conexão
transporter.verify((error, success) => {
  if (error) {
    console.error('Erro na configuração do transporte de e-mail:', error);
  } else {
    console.log('Servidor de e-mail pronto para enviar mensagens');
    
    // Enviar e-mail de teste
    const mailOptions = {
      from: '"ACI Automações Comerciais" <automacoescomerciais@gmail.com>',
      to: 'automacoescomerciais@gmail.com',
      subject: 'Teste de Envio de E-mail - ACI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #4f46e5; color: white; padding: 20px; text-align: center;">
            <h1>ACI Automações Comerciais</h1>
          </div>
          <div style="padding: 20px; background: #f8f9fa;">
            <h2 style="color: #333;">Teste de Envio de E-mail</h2>
            <p>Este é um e-mail de teste para verificar se o serviço de envio está funcionando corretamente.</p>
            <p>Se você recebeu este e-mail, significa que a configuração SMTP está funcionando!</p>
            <p>Equipe ACI Automações Comerciais</p>
          </div>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Erro ao enviar e-mail:', error);
      } else {
        console.log('E-mail enviado com sucesso:', info.messageId);
      }
      process.exit(0);
    });
  }
});