# 💳 Sistema de Pagamento PIX - ACI

## Visão Geral

Sistema completo de pagamento PIX integrado com **Mercado Pago** para recarga de créditos na plataforma ACI.

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │ ProfilePage     │ -> │ PixPaymentModal │ -> │ QR Code Display │  │
│  │ (Botão Comprar) │    │ (Fluxo Pagamento)│    │ (Código PIX)    │  │
│  └─────────────────┘    └────────┬────────┘    └─────────────────┘  │
│                                  │                                   │
│                         ┌────────▼────────┐                         │
│                         │ pixPaymentService│                        │
│                         │  (Singleton)     │                        │
│                         └────────┬────────┘                         │
└──────────────────────────────────┼──────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
        ┌───────────▼───────────┐     ┌───────────▼───────────┐
        │    Mercado Pago API   │     │       Supabase        │
        │  (Criar Pagamento)    │     │  (Salvar Transação)   │
        └───────────┬───────────┘     └───────────────────────┘
                    │
        ┌───────────▼───────────┐
        │   Webhook Notification│
        │   (Pagamento Aprovado)│
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────┐
        │  api/webhooks/        │
        │  mercadopago.ts       │
        └───────────┬───────────┘
                    │
        ┌───────────▼───────────┐
        │  Atualizar Créditos   │
        │  + Notificar Usuário  │
        └───────────────────────┘
```

---

## 📁 Arquivos Criados

| Arquivo | Descrição |
|---------|-----------|
| `services/pixPaymentService.ts` | Serviço singleton para integração com Mercado Pago |
| `components/PixPaymentModal.tsx` | Modal de pagamento com QR Code e status em tempo real |
| `api/webhooks/mercadopago.ts` | Handler de webhook para notificações de pagamento |

---

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione no seu `.env`:

```env
# Mercado Pago - Obtenha em: https://www.mercadopago.com.br/developers/panel/credentials
VITE_MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxx-xxxx-xxxx-xxxx
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-xxxx-xxxx-xxxx-xxxx

# Para o webhook (servidor)
MERCADO_PAGO_ACCESS_TOKEN=APP_USR-xxxx-xxxx-xxxx-xxxx
MERCADO_PAGO_WEBHOOK_SECRET=seu-webhook-secret

# URL da aplicação (para callback do webhook)
VITE_APP_URL=https://seu-dominio.com
```

### 2. Configurar Webhook no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel/app
2. Selecione sua aplicação
3. Vá em **Webhooks** > **Configurar notificações**
4. Adicione a URL: `https://seu-dominio.com/api/webhooks/mercadopago`
5. Selecione os eventos: `payment`

### 3. Executar as Migrações SQL

Execute o SQL em `supabase/migrations/20241204_users_and_credits.sql` para criar as tabelas necessárias.

---

## 🎯 Fluxo de Pagamento

### 1. Usuário Inicia Compra
```typescript
import { PixPaymentModal } from '@/components/PixPaymentModal';

// No componente
<PixPaymentModal
  isOpen={showPaymentModal}
  onClose={() => setShowPaymentModal(false)}
  package={selectedPackage}
  onPaymentSuccess={(credits) => {
    toast.success(`${credits} créditos adicionados!`);
    refreshBalance();
  }}
  onPaymentFailed={(reason) => {
    toast.error(`Pagamento falhou: ${reason}`);
  }}
/>
```

### 2. Geração do QR Code PIX
- O modal chama `pixPaymentService.createPixPayment()`
- A API do Mercado Pago retorna o QR Code e código PIX
- A transação é salva no banco com status `pending`

### 3. Usuário Paga
- O usuário escaneia o QR Code ou copia o código PIX
- Paga pelo app do banco

### 4. Confirmação via Webhook
- Mercado Pago envia notificação de pagamento aprovado
- O webhook processa e adiciona os créditos automaticamente
- O modal exibe "Pagamento Aprovado!"

### 5. Fallback: Polling
- Caso o webhook falhe, o modal verifica o status a cada 5 segundos
- Garante que o pagamento seja processado mesmo sem webhook

---

## 📊 Tabelas do Banco

### payment_transactions
```sql
- id (UUID)
- user_id (UUID, FK -> auth.users)
- payment_method ('pix')
- payment_gateway ('mercadopago')
- gateway_transaction_id (ID do Mercado Pago)
- amount (valor em R$)
- status ('pending', 'completed', 'failed', 'cancelled')
- pix_code (código copia e cola)
- pix_qr_code (QR code base64)
- pix_expires_at (data de expiração)
- metadata (JSON com detalhes)
- paid_at (quando foi pago)
```

### credit_transactions
```sql
- id (UUID)
- user_id (UUID)
- type ('credit' para recarga)
- amount (valor em R$)
- credits_amount (créditos adicionados)
- balance_after (saldo após transação)
- description ('Recarga PIX - Pacote X')
- metadata (detalhes do pagamento)
```

### webhook_logs
```sql
- id (UUID)
- provider ('mercadopago')
- event_type ('payment.approved', etc)
- payload (JSON do webhook)
- status ('received', 'processed', 'failed')
- processed_at (timestamp)
```

---

## 🔒 Segurança

### Validação de Webhook
O sistema valida a assinatura HMAC do Mercado Pago:

```typescript
// Header x-signature contém ts e v1
// Validação: HMAC-SHA256(manifest, webhookSecret) === v1
const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
const hmac = crypto.createHmac('sha256', webhookSecret);
const signature = hmac.update(manifest).digest('hex');
```

### Proteções Implementadas
- ✅ Validação de assinatura HMAC
- ✅ Idempotência (não processa pagamento já processado)
- ✅ Validação de status antes de adicionar créditos
- ✅ Log de todas as operações
- ✅ RLS no banco para acesso apenas ao próprio usuário

---

## 🧪 Testando

### Ambiente de Sandbox
1. Use credenciais de teste do Mercado Pago
2. Use os cartões de teste fornecidos pelo MP
3. PIX em sandbox aprova automaticamente

### Simulando Pagamento Aprovado
```typescript
// No console do navegador
await pixPaymentService.processWebhook({
  type: 'payment',
  data: { id: 'seu-payment-id' }
});
```

---

## 📱 Experiência do Usuário

### Estados do Modal

| Estado | Descrição |
|--------|-----------|
| `loading` | Gerando QR Code PIX... |
| `qrcode` | Exibindo QR Code + Timer de expiração |
| `processing` | Processando pagamento... |
| `success` | ✅ Pagamento Aprovado! |
| `error` | ❌ Erro no pagamento (com opção de retry) |
| `expired` | ⏰ PIX expirado (gerar novo) |

### Timer de Expiração
- PIX expira em **30 minutos** por padrão
- Timer visual mostra tempo restante
- Alerta visual quando < 5 minutos

---

## 🚀 Deploy

### Vercel / Next.js
```typescript
// pages/api/webhooks/mercadopago.ts
import { handleWebhook } from '@/api/webhooks/mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const response = await handleWebhook(req);
  return res.status(response.status).json(await response.json());
}
```

### Supabase Edge Functions
```typescript
// supabase/functions/mercadopago-webhook/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleWebhook } from './handler.ts';

serve(async (req) => handleWebhook(req));
```

---

## 📞 Suporte

- Documentação Mercado Pago: https://www.mercadopago.com.br/developers/pt/docs
- Webhooks: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
- Sandbox: https://www.mercadopago.com.br/developers/panel/test-users
