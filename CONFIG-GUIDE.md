# 🔑 GUIA DE CONFIGURAÇÃO - VARIÁVEIS DE AMBIENTE

Este guia explica todas as variáveis de ambiente necessárias para rodar a plataforma ACI.

## 📝 Como Usar

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e preencha os valores

3. Reinicie o servidor após qualquer alteração

---

## 🔴 OBRIGATÓRIAS

### OPENAI_API_KEY (Geração de Conteúdo com IA)

**O que é:**
Chave de API da OpenAI para usar GPT-4, GPT-3.5 e DALL-E.

**Como obter:**
1. Acesse: https://platform.openai.com/api-keys
2. Faça login (ou crie conta)
3. Clique em "Create new secret key"
4. Dê um nome: "ACI Platform"
5. Copie a chave (formato: `sk-proj-xxxxxxxxxx`)

**Adicionar no .env:**
```env
OPENAI_API_KEY=sk-proj-sua-chave-aqui
```

**Custos:**
- Novos usuários: **$5 grátis** (válido por 3 meses)
- Após $5: Adicione cartão em https://platform.openai.com/account/billing
- Monitore uso: https://platform.openai.com/usage

---

### JWT_SECRET (Autenticação)

**O que é:**
Chave secreta usada para assinar tokens JWT de autenticação.

**Como gerar:**
Use uma chave aleatória e segura (mínimo 32 caracteres):

```bash
# Opção 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Opção 2: Online
# Acesse: https://randomkeygen.com/
```

**Adicionar no .env:**
```env
JWT_SECRET=sua-chave-aleatoria-de-no-minimo-32-caracteres-aqui
```

**⚠️ IMPORTANTE:**
- Nunca compartilhe esta chave
- Use uma diferente em produção
- Se mudar, todos os usuários precisarão fazer login novamente

---

## 🟡 OPCIONAIS

### META/FACEBOOK (Integração Instagram)

**O que é:**
Credenciais do Facebook Developers para integração Instagram via Graph API.

**Quando necessário:**
Apenas se for usar funcionalidades de Instagram (publicar posts, ler comentários, enviar DMs).

**Como obter:**

1. **Criar App no Facebook:**
   - Acesse: https://developers.facebook.com/
   - Clique em "My Apps" → "Create App"
   - Escolha "Consumer" ou "Business"
   - Preencha informações do app

2. **Obter Credenciais:**
   - No dashboard do app, vá em "Settings" → "Basic"
   - Copie **App ID** e **App Secret**

3. **Configurar Produto Instagram:**
   - Clique em "Add Product"
   - Selecione "Instagram Graph API"
   - Configure permissões e URLs de redirect

4. **Adicionar no .env:**
```env
META_APP_ID=123456789012345
META_APP_SECRET=abc123def456ghi789jkl012mno345pq
META_REDIRECT_URI=http://localhost:3001/api/integrations/instagram/callback
META_API_VERSION=v19.0
FRONTEND_URL=http://localhost:3000
```

**Documentação:**
- Tutorial completo: https://developers.facebook.com/docs/instagram-api

---

### TELEGRAM_BOT_TOKEN (Integração Telegram)

**O que é:**
Token de autenticação do seu bot do Telegram.

**Quando necessário:**
Apenas se for usar funcionalidades de Telegram (envio em massa, canais).

**Como obter:**

1. Abra o Telegram
2. Procure por **@BotFather**
3. Envie `/newbot`
4. Siga as instruções
5. Copie o token fornecido (formato: `1234567890:ABCdefGHIjklMNO`)

**Adicionar no .env:**
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

---

## 🟢 CONFIGURAÇÕES BÁSICAS

### VITE_API_URL e PORT

**O que são:**
URLs e portas usadas pelo frontend e backend.

**Valores padrão:**
```env
VITE_API_URL=http://localhost:3001
PORT=3001
```

**Quando mudar:**
- Se a porta 3001 já estiver em uso
- Se estiver implantando em produção
- Se quiser usar outra porta

---

### VITE_ADMIN_EMAIL

**O que é:**
Email adicional com privilégios de super administrador.

**Valores padrão:**
Super admins já configurados no código:
- admin@aci.com
- suporte@aci.com
- teste@teste.com
- automacoescomerciais@gmail.com

**Adicionar no .env:**
```env
VITE_ADMIN_EMAIL=seu-email@exemplo.com
```

---

## 🔵 FUTURAS (NÃO IMPLEMENTADAS AINDA)

### DATABASE_URL (Banco de Dados)

```env
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/aci_db

# MySQL
DATABASE_URL=mysql://user:password@localhost:3306/aci_db

# MongoDB
DATABASE_URL=mongodb://localhost:27017/aci_db
```

---

### STRIPE (Pagamentos)

```env
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxx
```

Obter em: https://dashboard.stripe.com/apikeys

---

### MERCADO PAGO (Pagamentos PIX)

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-123456789-012345-a1b2c3d4e5f6
```

Obter em: https://www.mercadopago.com.br/developers/

---

## 📋 Checklist de Configuração

Antes de iniciar a aplicação, verifique:

- [ ] `.env` criado a partir do `.env.example`
- [ ] `OPENAI_API_KEY` configurada ✅ OBRIGATÓRIO
- [ ] `JWT_SECRET` configurado ✅ OBRIGATÓRIO
- [ ] `VITE_API_URL` e `PORT` corretos
- [ ] Se usar Instagram: `META_APP_ID` e `META_APP_SECRET` configurados
- [ ] Se usar Telegram: `TELEGRAM_BOT_TOKEN` configurado
- [ ] Arquivo `.env` está no `.gitignore`

---

## 🆘 Problemas?

Se algo não funcionar:

1. Verifique se reiniciou o servidor após mudar `.env`
2. Confirme que não há espaços extras nas variáveis
3. Veja [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para erros específicos

---

**Última atualização:** 12/12/2024
