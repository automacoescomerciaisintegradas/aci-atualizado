# Deploy da Edge Function com Brevo SMTP

## 📋 Suas Configurações

- **Servidor SMTP**: `smtp-relay.brevo.com`
- **Porta**: `587`
- **Login**: `745874001@smtp-brevo.com`
- **Senha**: (você deve ter a senha do Brevo)

## 🚀 Deploy Passo a Passo

### 1. Instalar Supabase CLI

```bash
npm install -g supabase
```

### 2. Login no Supabase

```bash
supabase login
```

Isso abrirá o navegador para você autorizar.

### 3. Link com Seu Projeto

```bash
cd "c:\projeto telegram\aci---automações-comerciais-integradas-atualizado"
supabase link --project-ref udzptgbcgzcibhbipnur
```

### 4. Adicionar Senha SMTP no Supabase

Vá no Supabase Dashboard:
https://supabase.com/dashboard/project/udzptgbcgzcibhbipnur/settings/vault

Clique em **New Secret** e adicione:
- **Name**: `SMTP_PASSWORD`
- **Value**: Sua senha do Brevo (a mesma que você usa para login)

### 5. Deploy da Função

```bash
supabase functions deploy send-welcome-email
```

### 6. Verificar se Funcionou

Execute no Supabase SQL Editor:

```sql
-- Testar enviando email para você mesmo
SELECT send_welcome_email('seu-email@gmail.com');
```

### 7. Verificar no Brevo

Vá no painel do Brevo:
https://app.brevo.com/statistics

Você verá o email enviado!

---

## 🧪 Testar na Landing Page

1. Abra: http://localhost:3001
2. Role até o footer
3. Inscreva seu email
4. Verifique sua caixa de entrada (e SPAM também!)

---

## ⚠️ Importante sobre o FROM EMAIL

No código, estou usando `noreply@automacoescomerciais.com.br`.

**Você PRECISA verificar este domínio no Brevo**:
1. Vá em: https://app.brevo.com/senders/domain
2. Adicione o domínio `automacoescomerciais.com.br`
3. Configure os registros DNS (TXT, DKIM, etc)

**OU use o email padrão do Brevo** até configurar o domínio:
- No arquivo `send-welcome-email/index.ts`
- Linha 9: Mude para um email verificado no Brevo

---

## 📊 Verificar Logs

Se algo der errado, veja os logs:

```bash
supabase functions logs send-welcome-email
```

Ou no Supabase Dashboard:
https://supabase.com/dashboard/project/udzptgbcgzcibhbipnur/logs/edge-functions

---

## 🎯 Resumo Rápido

```bash
# 1. Instalar CLI
npm install -g supabase

# 2. Login
supabase login

# 3. Link
supabase link --project-ref udzptgbcgzcibhbipnur

# 4. Adicionar SMTP_PASSWORD no Supabase Dashboard

# 5. Deploy
supabase functions deploy send-welcome-email
```

Pronto! Agora teste inscrevendo seu email na landing page! 🎉
