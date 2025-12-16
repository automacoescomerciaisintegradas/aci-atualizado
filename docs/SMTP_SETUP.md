# 📧 Guia de Configuração do E-mail (SMTP)

## 🎯 Visão Geral

O sistema de recuperação de senha envia e-mails automaticamente usando SMTP. Este guia mostra como configurar diferentes provedores de e-mail.

---

## 🚀 Configuração Rápida (Gmail)

### Passo 1: Ativar Verificação em Duas Etapas

1. Acesse: https://myaccount.google.com/security
2. Clique em **"Verificação em duas etapas"**
3. Siga as instruções para ativar

### Passo 2: Gerar Senha de App

1. Acesse: https://myaccount.google.com/apppasswords
2. Selecione **"App"** → **"Outro (nome personalizado)"**
3. Digite: `ACI - Automações`
4. Clique em **"Gerar"**
5. **Copie a senha de 16 caracteres** gerada

### Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
FRONTEND_URL=http://localhost:3001
JWT_SECRET=seu-secret-key-super-seguro
```

⚠️ **Importante**: Substitua `seu-email@gmail.com` e `xxxx xxxx xxxx xxxx` pelos seus dados reais.

---

## 📮 Outros Provedores de E-mail

### SendGrid (Recomendado para Produção)

**Vantagens**: 100 e-mails/dia grátis, alta entregabilidade, fácil configuração

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Como obter**:
1. Crie conta em: https://signup.sendgrid.com/
2. Acesse: Settings → API Keys
3. Crie uma nova API Key
4. Use `apikey` como usuário e a API Key como senha

---

### Mailgun

**Vantagens**: 5.000 e-mails/mês grátis, ótima para produção

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@seu-dominio.mailgun.org
SMTP_PASS=sua-senha-mailgun
```

**Como obter**:
1. Crie conta em: https://www.mailgun.com/
2. Acesse: Sending → Domain Settings → SMTP Credentials
3. Use as credenciais fornecidas

---

### Outlook/Hotmail

```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=seu-email@outlook.com
SMTP_PASS=sua-senha
```

⚠️ **Nota**: Pode ser necessário ativar "Permitir aplicativos menos seguros"

---

### Yahoo Mail

```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=seu-email@yahoo.com
SMTP_PASS=sua-senha-de-app
```

**Como gerar senha de app**:
1. Acesse: https://login.yahoo.com/account/security
2. Clique em "Gerar senha de app"
3. Selecione "Outro app" e digite um nome
4. Use a senha gerada

---

## 🧪 Testando a Configuração

### 1. Verificar se o servidor está rodando

```bash
npm run dev:all
```

### 2. Testar endpoint de recuperação de senha

**Usando cURL**:
```bash
curl -X POST http://localhost:3002/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"seu-email@gmail.com\"}"
```

**Usando Postman/Insomnia**:
```
POST http://localhost:3002/api/auth/forgot-password
Content-Type: application/json

{
  "email": "seu-email@gmail.com"
}
```

### 3. Verificar logs do servidor

Você deve ver no console:
```
🔑 Token de reset gerado para seu-email@gmail.com
✅ E-mail enviado com sucesso: <message-id>
✅ E-mail de recuperação enviado para: seu-email@gmail.com
```

---

## 🔧 Solução de Problemas

### ❌ Erro: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Causa**: Senha incorreta ou verificação em duas etapas não configurada

**Solução**:
1. Verifique se ativou a verificação em duas etapas
2. Gere uma nova senha de app
3. Copie a senha SEM espaços no `.env`

---

### ❌ Erro: "Connection timeout"

**Causa**: Firewall bloqueando porta 587

**Solução**:
1. Tente usar porta 465 com `secure: true`:
```typescript
// Em emailService.ts
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL
    auth: { ... }
});
```

---

### ❌ E-mail não chega na caixa de entrada

**Possíveis causas**:

1. **E-mail na pasta de SPAM**
   - Verifique a pasta de spam/lixo eletrônico
   - Marque como "Não é spam"

2. **Domínio não verificado** (SendGrid/Mailgun)
   - Configure SPF, DKIM e DMARC records
   - Verifique seu domínio no painel do provedor

3. **Limites de envio atingidos**
   - Gmail: 500 e-mails/dia
   - SendGrid Free: 100 e-mails/dia
   - Mailgun Free: 5.000 e-mails/mês

---

## 🔒 Segurança

### ✅ Boas Práticas

1. **NUNCA commite o arquivo `.env`**
   ```bash
   # Adicione ao .gitignore
   echo ".env" >> .gitignore
   ```

2. **Use variáveis de ambiente em produção**
   - Heroku: Settings → Config Vars
   - Vercel: Settings → Environment Variables
   - AWS: Systems Manager → Parameter Store

3. **Rotacione senhas regularmente**
   - Gere novas senhas de app a cada 3-6 meses
   - Revogue senhas antigas

4. **Use provedores profissionais em produção**
   - SendGrid, Mailgun, AWS SES
   - Evite usar Gmail em produção

---

## 📊 Monitoramento

### Logs do Sistema

O sistema registra automaticamente:
- ✅ E-mails enviados com sucesso
- ❌ Falhas no envio
- 🔑 Tokens gerados
- 🗑️ Tokens expirados removidos

### Exemplo de logs:
```
🔑 Token de reset gerado para user@example.com, expira em 15/12/2025 19:30:00
✅ E-mail enviado com sucesso: <1234567890@gmail.com>
✅ E-mail de recuperação enviado para: user@example.com
✅ Token abc123 marcado como usado
🧹 3 tokens expirados foram removidos
```

---

## 🎨 Personalização

### Customizar template de e-mail

Edite o arquivo `src/backend/emailService.ts`:

```typescript
export async function sendPasswordResetEmail(email: string, resetToken: string) {
    const html = `
        <!-- Seu HTML customizado aqui -->
    `;
    
    return sendEmail({ to: email, subject: '...', html });
}
```

### Alterar tempo de expiração do token

Edite `src/backend/passwordResetService.ts`:

```typescript
// Token válido por 2 horas (ao invés de 1)
expiresAt.setHours(expiresAt.getHours() + 2);
```

---

## 📞 Suporte

Se você ainda tiver problemas:

1. Verifique os logs do servidor
2. Teste com diferentes provedores de e-mail
3. Consulte a documentação do Nodemailer: https://nodemailer.com/
4. Abra uma issue no repositório do projeto

---

## ✅ Checklist de Configuração

- [ ] Verificação em duas etapas ativada (Gmail)
- [ ] Senha de app gerada
- [ ] Arquivo `.env` criado com credenciais corretas
- [ ] `.env` adicionado ao `.gitignore`
- [ ] Servidor reiniciado após configuração
- [ ] Teste de envio realizado com sucesso
- [ ] E-mail recebido na caixa de entrada
- [ ] Token de reset funcionando corretamente

---

**Última atualização**: 15/12/2025
