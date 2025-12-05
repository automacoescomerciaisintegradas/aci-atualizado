# 🗄️ Instruções para Criar as Tabelas no Supabase

## Opção 1: Via SQL Editor no Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `supabase/migrations/20241204_payment_system.sql`
6. Clique em **Run** para executar

## Opção 2: Via Supabase CLI

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Linkar ao projeto
supabase link --project-ref SEU_PROJECT_REF

# Executar migração
supabase db push
```

## 📋 Tabelas Criadas

| Tabela | Descrição |
|--------|-----------|
| `user_credits` | Saldo de créditos de cada usuário |
| `payment_transactions` | Transações de pagamento (PIX, cartão) |
| `credit_transactions` | Histórico de uso e recarga de créditos |
| `credit_packages` | Pacotes de créditos disponíveis |
| `webhook_logs` | Logs de webhooks do Mercado Pago |

## 🔐 Políticas RLS

Todas as tabelas possuem **Row Level Security (RLS)** habilitado:

- Usuários só podem ver seus próprios dados
- Service Role tem acesso total (necessário para webhooks)
- Admins podem gerenciar todos os dados

## 🎁 Dados Iniciais

**Pacotes de Créditos:**
- Starter: R$ 29,90 → 100 créditos
- Pro: R$ 99,90 → 500 créditos + 75 bônus (⭐ Mais Popular)
- Business: R$ 179,90 → 1000 créditos + 200 bônus
- Enterprise: R$ 399,90 → 2500 créditos + 750 bônus

**Bônus de Boas-vindas:**
- Novos usuários ganham R$ 10 em créditos automaticamente!

## ⚙️ Variáveis de Ambiente Necessárias

Adicione ao seu `.env`:

```env
# Mercado Pago
VITE_MERCADO_PAGO_ACCESS_TOKEN=seu_access_token
VITE_MERCADO_PAGO_PUBLIC_KEY=sua_public_key
VITE_MERCADO_PAGO_WEBHOOK_SECRET=seu_webhook_secret

# URL da aplicação (para callback do webhook)
VITE_APP_URL=https://seudominio.com
```

## 🔗 Configurar Webhook no Mercado Pago

1. Acesse [Mercado Pago Developers](https://www.mercadopago.com.br/developers)
2. Vá para **Suas integrações**
3. Selecione sua aplicação
4. Em **Webhooks**, configure:
   - **URL**: `https://seudominio.com/api/webhooks/mercadopago`
   - **Eventos**: `payment`

## ✅ Verificação

Após executar a migração, verifique se as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_credits', 
    'payment_transactions', 
    'credit_transactions', 
    'credit_packages', 
    'webhook_logs'
);
```

Deve retornar 5 tabelas.
