# Migração para Cloudflare D1

## ✅ O que foi feito:

### 1. **Infraestrutura**
- ✅ Instalado Wrangler CLI
- ✅ Configurado `wrangler.toml` com D1 Database
- ✅ Criado schema SQL inicial (`migrations/0001_initial_schema.sql`)
- ✅ Executado migração localmente (25 comandos OK)

### 2. **Backend (Cloudflare Worker)**
- ✅ Criado cliente D1 (`src/services/d1Client.ts`)
- ✅ Criado sistema de autenticação (`src/services/d1Auth.ts`)
- ✅ Criado Worker com API REST (`src/index.ts`)
- ✅ Criado utilitários HTTP (`src/utils/http.ts`)

### 3. **Frontend (React)**
- ✅ Criado cliente API (`src/services/apiClient.ts`)
- ✅ Migrado `useAuth.ts` para usar D1 API
- ✅ Removido todas referências ao Supabase

### 4. **Configuração**
- ✅ Criado `.env.example` com variáveis de ambiente
- ✅ Instalado dependências necessárias (`nanoid`, `@cloudflare/workers-types`)

## 📋 Próximos Passos:

### 1. **Autenticar no Cloudflare**
```bash
wrangler login
```

### 2. **Executar migração remota**
```bash
wrangler d1 execute aci-db --remote --file=./migrations/0001_initial_schema.sql
```

### 3. **Configurar variáveis de ambiente**
Copie `.env.example` para `.env`:
```bash
cp .env.example .env
```

### 4. **Desenvolvimento Local**

#### Terminal 1: Iniciar Worker
```bash
wrangler dev
```
Isso iniciará o Worker localmente em `http://localhost:8787`

#### Terminal 2: Iniciar React
```bash
npm run dev
```
Isso iniciará o React em `http://localhost:5173`

### 5. **Deploy para Produção**

```bash
# Deploy do Worker
wrangler deploy

# Build do React (se necessário)
npm run build
```

## 🔑 Endpoints da API

### Autenticação
- `POST /api/auth/signup` - Criar conta
- `POST /api/auth/login` - Fazer login
- `GET /api/auth/user?id={userId}` - Buscar usuário
- `PUT /api/auth/profile` - Atualizar perfil

### Créditos
- `GET /api/credits/balance?userId={userId}` - Ver saldo
- `GET /api/credits/transactions?userId={userId}` - Ver histórico

### Pacotes
- `GET /api/packages` - Listar pacotes de créditos

### WordPress
- `GET /api/wordpress/connections?userId={userId}` - Listar conexões
- `POST /api/wordpress/connection` - Adicionar conexão

### API Keys
- `GET /api/keys?userId={userId}` - Listar chaves
- `POST /api/keys` - Adicionar chave

### Saúde
- `GET /api/health` - Health check

## 📦 Estrutura de Dados

### Tabelas Criadas:
- `profiles` - Perfis de usuários
- `user_credits` - Saldo de créditos
- `credit_transactions` - Histórico de transações
- `credit_packages` - Pacotes disponíveis
- `payment_transactions` - Transações de pagamento
- `wordpress_connections` - Conexões WordPress
- `api_keys` - Chaves de API
- `webhook_logs` - Logs de webhooks

## 🔒 Segurança

### TODO: Implementar
1. **Hash de senhas** - Adicionar bcrypt/argon2 para hash de senhas
2. **JWT Tokens** - Implementar autenticação com tokens JWT
3. **Rate Limiting** - Adicionar limitação de requisições
4. **Validação de dados** - Validação mais robusta de inputs

## 🎯 Diferenças do Supabase

| Recurso | Supabase | D1 |
|---------|----------|-----|
| Auth | Integrado | Customizado |
| Database | PostgreSQL | SQLite (D1) |
| Real-time | Sim | Não (precisa implementar) |
| Storage | Integrado | Precisa usar R2 |
| Edge Functions | Sim | Cloudflare Workers |
| Custos | Tem free tier | Pay-as-you-go |

## ⚠️ Notas Importantes:

1. **Senha em Texto Simples**: Atualmente as senhas NÃO estão com hash! Isso é apenas para desenvolvimento. NUNCA use em produção sem implementar hash de senhas!

2. **Reset de Senha**: A função `handleForgotPassword` está apenas simulada. Você precisará implementar envio de e-mail real (usando Cloudflare Email Workers ou serviço externo).

3. **Sessions**: Não há gerenciamento de sessão ainda. Em produção, implemente JWT tokens.

## 🚀 Vantagens do D1

1. ✅ **Edge Computing** - Dados replicados globalmente
2. ✅ **Serverless** - Paga apenas pelo uso
3. ✅ **Integração** - Funciona perfeitamente com Workers e Pages
4. ✅ **Performance** - Latência ultra-baixa
5. ✅ **Escalabilidade** - Escala automaticamente
