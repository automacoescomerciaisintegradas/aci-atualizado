import { sendPersonalVerificationEmail } from './services/emailService.js';

// Teste do envio de e-mail
async function testEmail() {
  console.log('Testando envio de e-mail de verificação...');
  
  const result = await sendPersonalVerificationEmail(
    'automacoescomerciais@gmail.com',
    'Teste ACI',
    {
      name: 'Usuário Teste',
      email: 'teste@example.com',
      phone: '(11) 99999-9999',
      document: '123.456.789-00'
    }
  );
  
  if (result.success) {
    console.log('✅ E-mail enviado com sucesso!');
    console.log('Message ID:', result.messageId);
  } else {
    console.log('❌ Erro ao enviar e-mail:');
    console.log(result.error);
  }
}

testEmail();