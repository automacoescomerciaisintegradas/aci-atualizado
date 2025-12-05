// Configurações de ambiente para e-mail
export const EMAIL_CONFIG = {
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: 587,
  SMTP_USERNAME: 'automacoescomerciais@gmail.com',
  // Recomenda-se usar um App Password em vez da senha principal
  // Veja: https://support.google.com/accounts/answer/185833
  SMTP_PASSWORD: 'nzhyikkbecdamomf', // Substituir por App Password
  SMTP_SENDER: '"ACI Automações Comerciais" <automacoescomerciais@gmail.com>',
  SMTP_SECURE: false // true para porta 465, false para porta 587
};