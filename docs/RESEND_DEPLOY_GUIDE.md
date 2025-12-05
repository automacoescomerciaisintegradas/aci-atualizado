# 🚀 Deploy Newsletter com Resend SMTP

## 📋 Configurações do Resend

- **Servidor SMTP**: `smtp.resend.com`
- **Porta**: `465` (SSL)
- **Username**: `resend`
- **Senha**: Sua API Key do Resend (começa com `re_`)

## 🎯 Passo a Passo Completo

### 1️⃣ Obter API Key do Resend

1. Acesse: https://resend.com/api-keys
2. Crie uma nova API Key
3. Copie a chave (começa com `re_...`)

### 2️⃣ Adicionar API Key no Supabase

1. Vá em: https://supabase.com/dashboard/project/udzptgbcgzcibhbipnur/settings/vault
2. Clique em **New Secret**
3. Adicione:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Cole sua API key do Resend

### 3️⃣ Deploy da Edge Function

Abra o terminal na pasta do projeto e execute:

```bash
# Login no Supabase (abrirá o navegador)
npx supabase login

# Link com o projeto
npx supabase link --project-ref udzptgbcgzcibhbipnur

# Deploy da função
npx supabase functions deploy send-welcome-email
```

### 4️⃣ Testar o Envio

**Opção A: Testar via SQL**

No Supabase SQL Editor, execute:

```sql
-- Substituir pelo seu email
SELECT send_welcome_email('seu-email@gmail.com');
```

**Opção B: Testar na Landing Page**

1. Abra: http://localhost:3001
2. Role até o footer
3. Inscreva seu email
4. Verifique sua caixa de entrada! 📧

---

## ⚙️ Configurações Importantes

### Email Remetente (FROM)

Por padrão, o código usa `onboarding@resend.dev` (email de teste do Resend).

**Para produção**, você deve usar seu próprio domínio:

1. Vá em: https://resend.com/domains
2. Adicione seu domínio `automacoescomerciais.com.br`
3. Configure os registros DNS (SPF, DKIM, DMARC)
4. Atualize o código:
   ```typescript
   const FROM_EMAIL = 'noreply@automacoescomerciais.com.br';
   ```

### Limites do Resend

- **Plano Free**: 100 emails/dia, 3.000/mês
- **Email de teste**: `onboarding@resend.dev` só funciona com emails verificados

---

## 🧪 Testar Localmente (Opcional)

Se quiser testar a função localmente antes do deploy:

```bash
# Instalar Deno (runtime da função)
# Windows (PowerShell como Admin):
irm https://deno.land/install.ps1 | iex

# Servir a função localmente
npx supabase functions serve send-welcome-email --env-file .env.local

# Testar com curl
curl -X POST http://localhost:54321/functions/v1/send-welcome-email \
  -H "Content-Type: application/json" \
  -d '{"email": "seu-email@gmail.com", "name": "Seu Nome"}'
```

---

## 📊 Verificar Logs

Se algo der errado, veja os logs:

```bash
npx supabase functions logs send-welcome-email --tail
```

Ou no Dashboard:
https://supabase.com/dashboard/project/udzptgbcgzcibhbipnur/logs/edge-functions

---

## ✅ Checklist Final

- [ ] API Key do Resend criada
- [ ] API Key adicionada no Supabase (como `RESEND_API_KEY`)
- [ ] Edge Function deployada
- [ ] Teste via SQL funcionou
- [ ] Teste na landing page funcionou
- [ ] Email recebido na caixa de entrada

---

## 🎯 Resumo dos Comandos

```bash
# Deploy completo (execute na ordem)
npx supabase login
npx supabase link --project-ref udzptgbcgzcibhbipnur
npx supabase functions deploy send-welcome-email
```

---

## ⚠️ Troubleshooting

**Erro: "RESEND_API_KEY não configurada"**
→ Adicione a secret no Supabase Dashboard

**Erro: "Authentication failed"**
→ Verifique se a API Key está correta

**Email não chega**
→ Verifique SPAM
→ Use email de teste do Resend: onboarding@resend.dev

**Erro: "Domain not verified"**
→ Use onboarding@resend.dev temporariamente
→ Ou adicione e verifique seu domínio no Resend

---

Pronto! Agora execute os comandos e teste! 🚀
