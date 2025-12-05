import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const SMTP_HOST = 'smtp.resend.com';
const SMTP_PORT = 465;
const SMTP_USERNAME = 'resend';
const SMTP_PASSWORD = Deno.env.get('RESEND_API_KEY')!; // Sua API Key do Resend
const FROM_EMAIL = 'onboarding@resend.dev'; // Ou seu domínio verificado
const FROM_NAME = 'ACI - Automações Comerciais';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface WelcomeEmailRequest {
  email: string
  name?: string
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { email, name } = await req.json() as WelcomeEmailRequest

    // Validar email
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se já foi enviado
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    const { data: lead, error: fetchError } = await supabase
      .from('newsletter_leads')
      .select('*')
      .eq('email', email)
      .single()

    if (fetchError || !lead) {
      return new Response(
        JSON.stringify({ error: 'Lead não encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    if (lead.welcome_email_sent) {
      return new Response(
        JSON.stringify({ message: 'Email de boas-vindas já foi enviado' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verificar se SMTP está configurado
    if (!SMTP_PASSWORD) {
      console.error('RESEND_API_KEY não configurada')
      // Marcar como enviado mesmo sem enviar (para desenvolvimento)
      await supabase
        .from('newsletter_leads')
        .update({
          welcome_email_sent: true,
          welcome_email_sent_at: new Date().toISOString()
        })
        .eq('email', email)

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email marcado como enviado (RESEND_API_KEY não configurada)'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const firstName = name ? name.split(' ')[0] : 'Visitante'

    const emailHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao ACI!</title>
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; }
    .logo { font-size: 48px; font-weight: 900; color: white; margin: 0; }
    .accent { color: #CCFF00; }
    .content { padding: 40px 30px; }
    h1 { color: #1e40af; font-size: 28px; margin: 0 0 20px 0; }
    p { color: #4b5563; line-height: 1.6; margin: 0 0 15px 0; font-size: 16px; }
    .cta { display: inline-block; margin: 30px 0; padding: 16px 40px; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; }
    .benefits { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .benefit { display: flex; align-items: start; margin: 15px 0; }
    .benefit-icon { color: #CCFF00; font-size: 24px; margin-right: 12px; }
    .footer { background: #f9fafb; padding: 30px; text-center; font-size: 14px; color: #6b7280; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 class="logo">ACI<span class="accent">.</span></h1>
      <p style="color: white; margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Automações Comerciais Integradas</p>
    </div>
    
    <div class="content">
      <h1>🎉 Bem-vindo${name ? `, ${firstName}` : ''}!</h1>
      
      <p>Obrigado por se inscrever na newsletter do <strong>ACI</strong>!</p>
      
      <p>Você acaba de dar o primeiro passo para <strong>revolucionar</strong> sua estratégia de marketing com o poder da inteligência artificial.</p>

      <div class="benefits">
        <h3 style="color: #1e40af; margin: 0 0 15px 0;">O que você vai receber:</h3>
        
        <div class="benefit">
          <span class="benefit-icon">🚀</span>
          <div><strong>Dicas exclusivas</strong> sobre automação de vendas e marketing digital</div>
        </div>
        
        <div class="benefit">
          <span class="benefit-icon">🤖</span>
          <div><strong>Novidades sobre IA</strong> aplicada a e-commerce e afiliados</div>
        </div>
        
        <div class="benefit">
          <span class="benefit-icon">💰</span>
          <div><strong>Ofertas especiais</strong> e descontos exclusivos para assinantes</div>
        </div>
        
        <div class="benefit">
          <span class="benefit-icon">📊</span>
          <div><strong>Estudos de caso</strong> de quem já está escalando vendas com ACI</div>
        </div>
      </div>

      <p><strong>Pronto para começar?</strong> Crie sua conta gratuita e teste todas as funcionalidades do ACI:</p>

      <center>
        <a href="https://aci.automacoescomerciais.com.br" class="cta">Começar Agora - É Grátis →</a>
      </center>

      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        Fique atento ao seu email - em breve você receberá conteúdos exclusivos para maximizar seus resultados!
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 10px 0;"><strong>ACI - Automações Comerciais Integradas</strong></p>
      <p style="margin: 0 0 20px 0;">Automatize suas vendas com inteligência artificial</p>
      <p style="margin: 0; font-size: 12px;">
        Você está recebendo este email porque se inscreveu em nossa newsletter.<br>
        <a href="https://aci.automacoescomerciais.com.br/unsubscribe?email=${encodeURIComponent(email)}" style="color: #1e40af;">Cancelar inscrição</a>
      </p>
    </div>
  </div>
</body>
</html>
`

    // Configurar cliente SMTP do Resend
    const client = new SMTPClient({
      connection: {
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        tls: true,
        auth: {
          username: SMTP_USERNAME,
          password: SMTP_PASSWORD,
        },
      },
    });

    // Enviar email
    await client.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: '🎉 Bem-vindo ao ACI - Automações Comerciais Integradas!',
      content: emailHtml,
      html: emailHtml,
    });

    await client.close();

    // Marcar como enviado no banco
    await supabase
      .from('newsletter_leads')
      .update({
        welcome_email_sent: true,
        welcome_email_sent_at: new Date().toISOString()
      })
      .eq('email', email)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email de boas-vindas enviado com sucesso via Resend SMTP!'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    )

  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao enviar email' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
