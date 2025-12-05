/**
 * =========================================
 * ACI - Sistema de Créditos Pay-per-Use
 * Tipos e Interfaces TypeScript
 * =========================================
 * 
 * Definições de tipos para o sistema de créditos
 * pronto para produção.
 */

// ==========================================
// ENUMS E CONSTANTES
// ==========================================

/**
 * Tipos de serviços disponíveis no sistema ACI
 */
export type CreditServiceType =
    | 'ai_generation_gemini'    // Geração de texto com Gemini
    | 'ai_generation_gpt4'      // Geração de texto com GPT-4
    | 'ai_generation_gpt35'     // Geração de texto com GPT-3.5
    | 'image_generation'        // Geração de imagens
    | 'telegram_send'           // Envio via Telegram
    | 'whatsapp_send'           // Envio via WhatsApp
    | 'shopee_query'            // Consulta à API Shopee
    | 'amazon_query'            // Consulta à API Amazon
    | 'mercadolivre_query'      // Consulta à API Mercado Livre
    | 'woocommerce_sync'        // Sincronização WooCommerce
    | 'wordpress_publish'       // Publicação WordPress
    | 'instagram_post'          // Publicação Instagram
    | 'blog_article'            // Artigo completo para blog
    | 'product_review'          // Review de produto
    | 'ebook_chapter';          // Capítulo de eBook

/**
 * Status de uma transação
 */
export type TransactionStatus =
    | 'pending'     // Aguardando processamento
    | 'completed'   // Concluída com sucesso
    | 'failed'      // Falhou
    | 'refunded'    // Reembolsada
    | 'cancelled';  // Cancelada

/**
 * Tipo de transação
 */
export type TransactionType =
    | 'debit'       // Débito (uso de créditos)
    | 'credit'      // Crédito (compra/recarga)
    | 'bonus'       // Bônus (promocional)
    | 'refund'      // Reembolso
    | 'adjustment'; // Ajuste manual

/**
 * Método de pagamento
 */
export type PaymentMethod =
    | 'pix'
    | 'credit_card'
    | 'debit_card'
    | 'boleto'
    | 'balance'     // Saldo interno
    | 'promotional'; // Promocional/Bônus

/**
 * Eventos do sistema de créditos
 */
export type CreditEventType =
    | 'balance_updated'
    | 'transaction_created'
    | 'low_balance_warning'
    | 'credits_expired'
    | 'auto_recharge_triggered'
    | 'payment_completed'
    | 'payment_failed'
    | 'subscription_renewed';

// ==========================================
// INTERFACES PRINCIPAIS
// ==========================================

/**
 * Modelo de precificação por serviço
 */
export interface PricingModel {
    serviceType: CreditServiceType;
    serviceName: string;
    description: string;
    category: 'ai' | 'messaging' | 'ecommerce' | 'publishing' | 'content';
    icon: string;

    // Precificação base
    basePrice: number;           // Preço base em R$
    unit: string;                // Unidade (palavra, envio, consulta, etc.)
    minimumCharge: number;       // Cobrança mínima

    // Desconto por volume
    volumeDiscounts: VolumeDiscount[];

    // Limites
    dailyLimit?: number;         // Limite diário
    monthlyLimit?: number;       // Limite mensal

    // Flags
    isActive: boolean;
    requiresApiKey: boolean;
    estimatedTime: string;       // Tempo estimado de execução
}

/**
 * Desconto por volume
 */
export interface VolumeDiscount {
    minQuantity: number;
    maxQuantity: number;
    discountPercent: number;
    pricePerUnit: number;
}

/**
 * Transação de créditos
 */
export interface CreditTransaction {
    id: string;
    userId: string;

    // Tipo e status
    type: TransactionType;
    status: TransactionStatus;

    // Valores
    amount: number;              // Valor em R$
    creditsAmount: number;       // Quantidade de créditos
    balanceAfter: number;        // Saldo após transação

    // Serviço relacionado
    serviceType?: CreditServiceType;
    serviceName?: string;

    // Detalhes
    description: string;
    metadata?: TransactionMetadata;

    // Referências
    externalId?: string;         // ID externo (gateway, etc.)
    parentTransactionId?: string; // Para refunds

    // Datas
    createdAt: Date;
    processedAt?: Date;
    expiresAt?: Date;

    // Auditoria
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Metadados da transação
 */
export interface TransactionMetadata {
    // Para operações de IA
    wordCount?: number;
    tokenCount?: number;
    aiModel?: string;
    promptLength?: number;

    // Para envios
    recipientCount?: number;
    messageType?: string;

    // Para consultas
    queryType?: string;
    resultsCount?: number;

    // Para publicações
    postId?: string;
    platform?: string;

    // Para pagamentos
    paymentMethod?: PaymentMethod;
    paymentGateway?: string;
    paymentReference?: string;
    installments?: number;

    // Genérico
    [key: string]: unknown;
}

/**
 * Saldo de créditos do usuário
 */
export interface CreditBalance {
    userId: string;

    // Saldos
    availableCredits: number;    // Créditos disponíveis
    reservedCredits: number;     // Créditos reservados (em processamento)
    bonusCredits: number;        // Créditos bônus
    totalCredits: number;        // Total (available + bonus)

    // Histórico
    lifetimePurchased: number;   // Total já comprado
    lifetimeUsed: number;        // Total já utilizado
    lifetimeBonus: number;       // Total de bônus recebidos

    // Limites e alertas
    lowBalanceThreshold: number; // Limite para alerta de saldo baixo
    autoRechargeEnabled: boolean;
    autoRechargeAmount?: number;
    autoRechargeThreshold?: number;

    // Estatísticas do período
    currentMonthUsage: number;
    currentMonthPurchased: number;
    lastTransactionAt?: Date;

    // Datas
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Pacote de créditos para compra
 */
export interface CreditPackage {
    id: string;
    name: string;
    description: string;

    // Valores
    credits: number;
    bonusCredits: number;
    totalCredits: number;        // credits + bonusCredits
    price: number;               // Em R$
    pricePerCredit: number;      // Preço por crédito

    // Desconto
    discountPercent: number;
    originalPrice?: number;

    // Características
    features: string[];
    highlighted: boolean;        // Destaque (mais popular)
    badge?: string;              // Ex: "Mais Popular", "Melhor Valor"

    // Validade
    validityDays?: number;       // Dias de validade (null = não expira)

    // Limites
    purchaseLimit?: number;      // Limite de compras por usuário

    // Flags
    isActive: boolean;
    isPromo: boolean;
    promoEndsAt?: Date;
}

/**
 * Analytics de uso de créditos
 */
export interface CreditAnalytics {
    userId: string;
    period: {
        startDate: Date;
        endDate: Date;
    };

    // Uso geral
    usage: {
        totalSpent: number;
        totalTransactions: number;
        averageTransactionValue: number;
        byService: Record<CreditServiceType, ServiceUsage>;
        byDay: DailyUsage[];
        averageDaily: number;
        peakUsageDay: string;
        peakUsageHour: number;
    };

    // Eficiência
    efficiency: {
        costPerResult: Record<CreditServiceType, number>;
        roi: number;
        conversionRate: number;
        revenueGenerated: number;
        savingsFromVolume: number;
    };

    // Tendências
    trends: {
        usageGrowth: number;       // % de crescimento
        growthTrend: 'up' | 'down' | 'stable';
        mostUsedService: CreditServiceType;
        leastUsedService: CreditServiceType;
        predictedMonthlyUsage: number;
        seasonality: SeasonalityData;
    };

    // Recomendações
    recommendations: {
        suggestedPackage: string;
        potentialSavings: number;
        optimizationTips: OptimizationTip[];
        alerts: AnalyticsAlert[];
    };
}

export interface ServiceUsage {
    serviceType: CreditServiceType;
    totalSpent: number;
    transactionCount: number;
    averagePerTransaction: number;
    lastUsed?: Date;
    percentOfTotal: number;
}

export interface DailyUsage {
    date: string;
    amount: number;
    transactionCount: number;
    services: CreditServiceType[];
}

export interface SeasonalityData {
    busiestDayOfWeek: number;    // 0-6 (Dom-Sáb)
    busiestHourOfDay: number;    // 0-23
    weekdayVsWeekend: number;    // Razão uso semana/fim de semana
}

export interface OptimizationTip {
    type: 'save_money' | 'improve_efficiency' | 'avoid_limit';
    priority: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    potentialSaving?: number;
    action?: string;
}

export interface AnalyticsAlert {
    type: 'warning' | 'info' | 'success';
    title: string;
    message: string;
    actionRequired: boolean;
    action?: string;
}

// ==========================================
// EVENTOS
// ==========================================

/**
 * Evento do sistema de créditos
 */
export interface CreditEvent<T = unknown> {
    type: CreditEventType;
    timestamp: Date;
    userId: string;
    data: T;
}

export interface BalanceUpdatedEventData {
    previousBalance: number;
    newBalance: number;
    change: number;
    reason: TransactionType;
    transactionId: string;
}

export interface LowBalanceWarningEventData {
    currentBalance: number;
    threshold: number;
    suggestedRecharge: number;
    estimatedDaysRemaining: number;
}

export interface PaymentEventData {
    transactionId: string;
    amount: number;
    credits: number;
    paymentMethod: PaymentMethod;
    status: 'completed' | 'failed';
    errorMessage?: string;
}

// ==========================================
// CONFIGURAÇÕES
// ==========================================

/**
 * Configuração do sistema de créditos
 */
export interface CreditSystemConfig {
    // Geral
    currency: string;
    currencySymbol: string;
    locale: string;

    // Limites globais
    minimumPurchase: number;
    maximumPurchase: number;
    dailySpendLimit: number;

    // Alertas
    lowBalanceThresholdDefault: number;
    lowBalanceWarningPercent: number;

    // Expiração
    creditsExpireAfterDays: number | null;
    bonusCreditsExpireAfterDays: number;

    // Taxas
    refundFeePercent: number;
    processingFeePercent: number;

    // Features
    allowNegativeBalance: boolean;
    allowAutoRecharge: boolean;
    allowBonusTransfer: boolean;
}

// ==========================================
// REQUESTS E RESPONSES
// ==========================================

/**
 * Request para debitar créditos
 */
export interface DebitCreditsRequest {
    serviceType: CreditServiceType;
    description: string;
    metadata?: TransactionMetadata;
    idempotencyKey?: string;     // Para evitar duplicatas
}

/**
 * Request para adicionar créditos
 */
export interface AddCreditsRequest {
    amount: number;              // Valor em R$
    credits?: number;            // Créditos (calculado automaticamente se não informado)
    type: 'credit' | 'bonus' | 'adjustment';
    description: string;
    paymentMethod?: PaymentMethod;
    metadata?: TransactionMetadata;
}

/**
 * Response de operação de créditos
 */
export interface CreditOperationResult {
    success: boolean;
    transactionId?: string;
    newBalance: number;
    creditsUsed?: number;
    creditsAdded?: number;
    error?: {
        code: string;
        message: string;
        details?: unknown;
    };
}

/**
 * Request para cálculo de custo
 */
export interface CostCalculationRequest {
    serviceType: CreditServiceType;
    quantity: number;
    metadata?: TransactionMetadata;
}

/**
 * Response de cálculo de custo
 */
export interface CostCalculationResult {
    serviceType: CreditServiceType;
    quantity: number;
    basePrice: number;
    finalPrice: number;
    discount: number;
    discountPercent: number;
    unit: string;
    breakdown: {
        tier: number;
        quantity: number;
        pricePerUnit: number;
        subtotal: number;
    }[];
}

// ==========================================
// FILTROS E QUERIES
// ==========================================

/**
 * Filtros para busca de transações
 */
export interface TransactionFilters {
    startDate?: Date;
    endDate?: Date;
    type?: TransactionType | TransactionType[];
    status?: TransactionStatus | TransactionStatus[];
    serviceType?: CreditServiceType | CreditServiceType[];
    minAmount?: number;
    maxAmount?: number;
    searchTerm?: string;
}

/**
 * Opções de paginação
 */
export interface PaginationOptions {
    page: number;
    limit: number;
    sortBy?: 'createdAt' | 'amount' | 'status';
    sortOrder?: 'asc' | 'desc';
}

/**
 * Response paginada
 */
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// ==========================================
// EXPORTS DEFAULT
// ==========================================

/**
 * Configuração padrão do sistema
 */
export const DEFAULT_CREDIT_CONFIG: CreditSystemConfig = {
    currency: 'BRL',
    currencySymbol: 'R$',
    locale: 'pt-BR',
    minimumPurchase: 10,
    maximumPurchase: 10000,
    dailySpendLimit: 5000,
    lowBalanceThresholdDefault: 50,
    lowBalanceWarningPercent: 20,
    creditsExpireAfterDays: null,
    bonusCreditsExpireAfterDays: 90,
    refundFeePercent: 0,
    processingFeePercent: 0,
    allowNegativeBalance: false,
    allowAutoRecharge: true,
    allowBonusTransfer: false,
};
