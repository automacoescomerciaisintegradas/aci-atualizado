# 💳 Plano de Melhoria do Sistema de Pagamentos - ACI

## 📋 Diagnóstico Atual

### Estado: ⚠️ Funcional mas com inconsistências graves

### Componentes Existentes:
- ✅ Serviço de pagamento PIX completo
- ✅ Webhook robusto com validação de assinatura  
- ✅ Componentes React funcionais
- ✅ Documentação detalhada
- ❌ **GRAVE**: Inconsistência entre bancos de dados
- ❌ **GRAVE**: Configuração de ambiente incompleta
- ❌ **GRAVE**: Fluxos duplicados e fragmentados

---

## 🎯 Prioridades de Correção

### 1. 🚨 CRÍTICO - Unificar Banco de Dados (Semana 1)
**Problema**: Sistema usa tanto Supabase quanto armazenamento em memória

**Solução**:
```typescript
// Substituir creditLedger.ts por integração completa com Supabase
// Tabelas necessárias já existem:
// - user_credits
// - payment_transactions  
// - credit_transactions
// - webhook_logs
```

**Arquivos afetados**:
- `src/backend/creditLedger.ts` → Remover
- `src/backend/routes/payments.ts` → Atualizar para usar Supabase
- `services/pixPaymentService.ts` → Padronizar com Supabase

### 2. ⚠️ ALTO - Corrigir Configuração de Ambiente (Semana 1)
**Problema**: Variáveis de ambiente inconsistentes e hardcoded

**Solução**:
```env
# .env correto
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx
MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx
MERCADOPAGO_WEBHOOK_SECRET=secreto_seguro
WEBHOOK_URL=https://seu-dominio.com/api/webhooks/mercadopago
```

### 3. 🔄 MÉDIO - Padronizar Fluxos de Pagamento (Semana 2)
**Problema**: Webhook e rotas API duplicados

**Solução**:
- Consolidar em um único ponto de entrada
- Padronizar tratamento de erros
- Implementar retry mechanism

---

## 📦 Implementações Específicas

### 1. Unificação do Sistema de Créditos

**Antes (Fragmentado)**:
```typescript
// creditLedger.ts - In-memory
const ledger: Record<string, LedgerEntry> = {};

// pixPaymentService.ts - Supabase
await getSupabase().from('user_credits').insert({...});

// payments.ts - Espera Prisma
// await prisma.paymentTransaction.create({ ... });
```

**Depois (Unificado)**:
```typescript
// Única fonte verdade - Todas as operações via Supabase
class CreditService {
  async addCredits(userId: string, amount: number) {
    const { data } = await supabase.rpc('add_user_credits', {
      user_id: userId,
      amount: amount
    });
    return data;
  }
}
```

### 2. Configuração Centralizada

**Criar**: `config/payment.ts`
```typescript
export const PAYMENT_CONFIG = {
  mercadoPago: {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY!,
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET!,
    apiUrl: 'https://api.mercadopago.com',
  },
  webhook: {
    url: `${process.env.FRONTEND_URL}/api/webhooks/mercadopago`,
  },
  packages: [
    { id: 'starter', credits: 100, price: 29.90, bonus: 0 },
    { id: 'pro', credits: 500, price: 99.90, bonus: 50 },
    { id: 'enterprise', credits: 2000, price: 299.90, bonus: 300 },
  ],
};
```

### 3. Tratamento de Erros Robusto

```typescript
// services/paymentErrorHandler.ts
export class PaymentError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export const handlePaymentError = (error: unknown): PaymentError => {
  if (error instanceof PaymentError) return error;
  
  if (error instanceof Error) {
    return new PaymentError('INTERNAL_ERROR', error.message);
  }
  
  return new PaymentError('UNKNOWN_ERROR', 'Erro desconhecido');
};
```

---

## 🧪 Testes Necessários

### 1. Testes Unitários
- [ ] Serviço de pagamento PIX
- [ ] Validação de webhook
- [ ] Cálculo de créditos
- [ ] Tratamento de erros

### 2. Testes de Integração
- [ ] Fluxo completo de pagamento PIX
- [ ] Processamento de webhook
- [ ] Adição de créditos
- [ ] Cenários de erro

### 3. Testes Manuais
- [ ] Pagamento com sucesso
- [ ] Pagamento rejeitado
- [ ] Timeout do PIX
- [ ] Webhook duplicado

---

## 📈 Métricas de Sucesso

### Antes vs Depois:
| Métrica | Antes | Meta | Depois |
|---------|-------|------|--------|
| Consistência DB | 30% | 100% | ✅ |
| Tempo de resposta | 2-5s | <2s | ✅ |
| Taxa de sucesso | 70% | >95% | ✅ |
| Logs de erro | Fragmentados | Centralizados | ✅ |

---

## 🚀 Roadmap de Implementação

### Semana 1: Fundação
- [ ] Unificar banco de dados (Supabase)
- [ ] Corrigir configuração de ambiente
- [ ] Criar serviço centralizado de créditos
- [ ] Implementar tratamento de erros

### Semana 2: Padronização
- [ ] Consolidar fluxos de pagamento
- [ ] Padronizar componentes React
- [ ] Implementar testes unitários básicos
- [ ] Documentar processo atualizado

### Semana 3: Otimização
- [ ] Implementar retry mechanism
- [ ] Adicionar monitoramento
- [ ] Otimizar performance
- [ ] Testes de integração completos

### Semana 4: Validação Final
- [ ] Testes E2E completos
- [ ] Revisão de segurança
- [ ] Benchmark de performance
- [ ] Documentação final

---

## ⚠️ Riscos e Mitigações

### Risco 1: Perda de dados durante migração
**Mitigação**: Backup completo antes da migração + rollback plan

### Risco 2: Downtime durante deploy
**Mitigação**: Deploy gradual + feature flags

### Risco 3: Erros de configuração em produção
**Mitigação**: Ambiente de staging completo + testes automatizados

---

## 📚 Recursos Necessários

### Documentação:
- [ ] Guia de migração
- [ ] Manual de operação
- [ ] Troubleshooting guide

### Monitoramento:
- [ ] Dashboard de métricas
- [ ] Alertas de erro
- [ ] Logs centralizados

### Suporte:
- [ ] Canal de suporte técnico
- [ ] FAQ para usuários
- [ ] Processo de incidente

---

## ✅ Critérios de Aceitação

O sistema estará considerado **TOTALMENTE FUNCIONAL** quando:

1. **Consistência**: Todos os componentes usarem o mesmo banco de dados
2. **Confiabilidade**: Taxa de sucesso > 95%
3. **Performance**: Tempo de resposta < 2 segundos
4. **Monitoramento**: Todos os erros são registrados e rastreáveis
5. **Documentação**: Processo completamente documentado
6. **Testes**: Cobertura de testes > 80%

---

*Este plano será executado em colaboração com o Web Agent Bundle Instructions para garantir consistência e qualidade.*