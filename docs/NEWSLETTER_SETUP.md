# Newsletter System - Guia de Configuração

## 📋 Passo a Passo para Configurar o Sistema de Newsletter

### 1️⃣ Executar a Migration no Supabase

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard
2. Selecione seu projeto: `udzptgbcgzcibhbipnur`
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo:
   ```
   supabase/migrations/20250105_create_newsletter_leads.sql
   ```
6. Clique em **RUN** para executar a migration
7. Você verá a mensagem: `Newsletter leads table created successfully!`

### 2️⃣ Verificar a Tabela Criada

No **Table Editor** do Supabase, você verá a nova tabela `newsletter_leads` com as seguintes colunas:

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | ID único do lead |
| `email` | VARCHAR | Email (único) |
| `name` | VARCHAR | Nome (opcional) |
| `status` | VARCHAR | `active`, `unsubscribed`, `bounced` |
| `source` | VARCHAR | Origem (`landing_page`) |
| `subscribed_at` | TIMESTAMP | Data de inscrição |
| `welcome_email_sent` | BOOLEAN | Email de boas-vindas enviado? |
| `welcome_email_sent_at` | TIMESTAMP | Quando foi enviado |
| `metadata` | JSONB | Dados extras (user agent, etc) |

### 3️⃣ Funcionalidades Implementadas

✅ **Validação de Email**: Regex para validar formato
✅ **Verificação de Duplicatas**: Não permite emails duplicados
✅ **Reativação**: Se o email foi cancelado, reativa automaticamente
✅**Loading State**: Spinner durante o envio
✅ **Mensagens de Feedback**:
   - ✅ Verde: Inscrição bem-sucedida
   - ℹ️ Azul: Email já inscrito
   - ❌ Vermelho: Erro na inscrição

### 4️⃣ Políticas de Segurança (RLS)

- ✅ **Público pode inserir**: Qualquer pessoa pode se inscrever
- ✅ **Público pode ver apenas seu email**: Proteção de privacidade
- ✅ **Autenticados veem tudo**: Usuários logados veem todos os leads
- ✅ **Apenas admins podem editar/deletar**: Proteção contra modificações

### 5️⃣ Próximos Passos (Opcional)

#### Configurar Email de Boas-Vindas Real

Para enviar emails reais, você precisará:

1. **Configurar Resend.com ou SendGrid**:
   ```bash
   npm install resend
   ```

2. **Criar Edge Function** em `supabase/functions/send-welcome-email/`:
   ```typescript
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
   import { Resend } from 'https://esm.sh/resend@2.0.0'

   const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

   serve(async (req) => {
     const { email } = await req.json()
     
     await resend.emails.send({
       from: 'ACI <noreply@automacoescomerciais.com.br>',
       to: email,
       subject: '🎉 Bem-vindo ao ACI!',
       html: `
         <h1>Bem-vindo ao ACI!</h1>
         <p>Obrigado por se inscrever na nossa newsletter.</p>
         <p>Em breve você receberá novidades sobre automações comerciais.</p>
       `
     })

     return new Response(JSON.stringify({ success: true }), {
       headers: { 'Content-Type': 'application/json' }
     })
   })
   ```

3. **Adicionar variável de ambiente no Supabase**:
   - RESEND_API_KEY=`sua_chave_aqui`

### 6️⃣ Testando o Sistema

1. Acesse a landing page: http://localhost:3001
2. Role até o footer
3. Inscreva-se com seu email
4. Verifique no Supabase Table Editor se o lead foi criado
5. Tente se inscrever novamente e veja a mensagem "já inscrito"

## 🎯 Mensagens que o Usuário Verá

| Situação | Mensagem |
|----------|----------|
| **Novo lead** | 🎉 Obrigado por se inscrever! Você receberá nossas novidades em breve. |
| **Email já existe (ativo)** | ✅ Este email já está inscrito na nossa newsletter! |
| **Email reativado** | 🎉 Bem-vindo de volta! Sua inscrição foi reativada. |
| **Email inválido** | Email inválido. Por favor, verifique e tente novamente. |
| **Erro genérico** | Erro ao processar inscrição. Tente novamente. |

## 📊 Visualizar Leads no Dashboard

Você pode criar uma página de admin para visualizar os leads:

```sql
-- Query para ver leads recentes
SELECT 
  email,
  name,
  status,
  subscribed_at,
  welcome_email_sent
FROM newsletter_leads
WHERE status = 'active'
ORDER BY subscribed_at DESC
LIMIT 50;
```

## 🔧 Troubleshooting

**Problema**: "relation 'newsletter_leads' does not exist"
**Solução**: Execute a migration no SQL Editor do Supabase

**Problema**: "permission denied for table newsletter_leads"
**Solução**: Verifique se as políticas RLS foram criadas corretamente

**Problema**: Email não está sendo salvo
**Solução**: Verifique o console do navegador (F12) para erros
