/**
 * =========================================
 * ACI - Configuração Centralizada de Pagamentos
 * =========================================
 * 
 * Configuração unificada para todos os serviços de pagamento
 * Centraliza variáveis de ambiente e configurações
 */

// ==========================================
// CONFIGURAÇÃO DO MERCADO PAGO
// ==========================================

export const MERCADO_PAGO_CONFIG = {
  // Credenciais de API
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
  publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
  webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
  
  // URLs
  apiUrl: 'https://api.mercadopago.com',
  webhookUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
  
  // Configurações de pagamento
  paymentExpirationMinutes: 30, // PIX expira em 30 minutos
  maxRetries: 3,
  timeoutMs: 10000, // 10 segundos
  
  // Ambientes
  isSandbox: process.env.NODE_ENV === 'development',
};

// ==========================================
// PACOTES DE CRÉDITOS
// ==========================================

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus: number;
  popular?: boolean;
  description: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 100,
    price: 29.90,
    bonus: 0,
    description: 'Pacote inicial para testar a plataforma',
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 500,
    price: 99.90,
    bonus: 50,
    popular: true,
    description: 'Pacote recomendado para uso regular',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    credits: 2000,
    price: 299.90,
    bonus: 300,
    description: 'Pacote completo para uso intensivo',
  },
];

// Bônus percentual para valores personalizados
export const CUSTOM_VALUE_BONUS = 0.10; // 10% de bônus

// ==========================================
// CONFIGURAÇÕES DE SEGURANÇA
// ==========================================

export const SECURITY_CONFIG = {
  // Validação de webhook
  validateWebhookSignature: true,
  
  // Limites de pagamento
  minPaymentAmount: 20.00, // R$ 20,00
  maxPaymentAmount: 5000.00, // R$ 5.000,00
  
  // Rate limiting
  maxPaymentsPerHour: 10,
  maxPaymentsPerDay: 50,
  
  // Tempo de expiração de sessão
  sessionTimeoutMinutes: 30,
};

// ==========================================
// CONFIGURAÇÕES DE LOGGING
// ==========================================

export const LOGGING_CONFIG = {
  // Níveis de log
  logPaymentEvents: true,
  logWebhookEvents: true,
  logErrorDetails: process.env.NODE_ENV === 'development',
  
  // Retenção de logs
  webhookLogRetentionDays: 30,
  paymentLogRetentionDays: 90,
};

// ==========================================
// VALIDAÇÃO DE CONFIGURAÇÃO
// ==========================================

/**
 * Valida se todas as configurações essenciais estão presentes
 */
export function validatePaymentConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validar credenciais do Mercado Pago
  if (!MERCADO_PAGO_CONFIG.accessToken) {
    errors.push('MERCADOPAGO_ACCESS_TOKEN não configurado');
  }
  
  if (!MERCADO_PAGO_CONFIG.publicKey) {
    errors.push('MERCADOPAGO_PUBLIC_KEY não configurado');
  }
  
  // Validar URLs
  if (!MERCADO_PAGO_CONFIG.webhookUrl) {
    errors.push('WEBHOOK_URL não configurada');
  }
  
  // Validar ambiente
  if (process.env.NODE_ENV === 'production' && MERCADO_PAGO_CONFIG.isSandbox) {
    errors.push('Usando credenciais de sandbox em ambiente de produção');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ==========================================
// UTILITÁRIOS
// ==========================================

/**
 * Obtém pacote de créditos pelo ID
 */
export function getCreditPackage(packageId: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
}

/**
 * Calcula créditos baseado no valor e pacote
 */
export function calculateCredits(
  amount: number,
  packageId?: string
): { baseCredits: number; bonusCredits: number; totalCredits: number } {
  let baseCredits: number;
  let bonusCredits: number;
  
  if (packageId) {
    const pkg = getCreditPackage(packageId);
    if (pkg) {
      baseCredits = pkg.credits;
      bonusCredits = pkg.bonus;
    } else {
      // Fallback para cálculo personalizado
      baseCredits = Math.floor(amount * 1000);
      bonusCredits = Math.floor(baseCredits * CUSTOM_VALUE_BONUS);
    }
  } else {
    // Valor personalizado
    baseCredits = Math.floor(amount * 1000);
    bonusCredits = Math.floor(baseCredits * CUSTOM_VALUE_BONUS);
  }
  
  return {
    baseCredits,
    bonusCredits,
    totalCredits: baseCredits + bonusCredits,
  };
}

/**
 * Formata moeda para exibição
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata quantidade de créditos
 */
export function formatCredits(amount: number): string {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}k`;
  }
  return amount.toString();
}

// Exportar tudo como objeto de configuração
export const PaymentConfig = {
  mercadoPago: MERCADO_PAGO_CONFIG,
  packages: CREDIT_PACKAGES,
  security: SECURITY_CONFIG,
  logging: LOGGING_CONFIG,
  utils: {
    validateConfig: validatePaymentConfig,
    getPackage: getCreditPackage,
    calculateCredits,
    formatCurrency,
    formatCredits,
  },
};

export default PaymentConfig;