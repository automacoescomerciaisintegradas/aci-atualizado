/**
 * =========================================
 * ACI - Sistema de Créditos Pay-per-Use
 * Serviço Principal de Créditos
 * =========================================
 * 
 * Serviço Singleton para gerenciamento completo
 * de créditos com integração Supabase.
 */

import { supabase } from './supabaseClient';
import {
    CreditServiceType,
    TransactionType,
    TransactionStatus,
    PaymentMethod,
    CreditEventType,
    PricingModel,
    VolumeDiscount,
    CreditTransaction,
    TransactionMetadata,
    CreditBalance,
    CreditPackage,
    CreditAnalytics,
    CreditEvent,
    CreditSystemConfig,
    DebitCreditsRequest,
    AddCreditsRequest,
    CreditOperationResult,
    CostCalculationRequest,
    CostCalculationResult,
    TransactionFilters,
    PaginationOptions,
    PaginatedResponse,
    DEFAULT_CREDIT_CONFIG,
    ServiceUsage,
    DailyUsage,
} from '../types/credit';

// ==========================================
// MODELOS DE PRECIFICAÇÃO ACI
// ==========================================

export const PRICING_MODELS: Record<CreditServiceType, PricingModel> = {
    ai_generation_gemini: {
        serviceType: 'ai_generation_gemini',
        serviceName: 'Geração IA (Gemini)',
        description: 'Geração de texto com Google Gemini',
        category: 'ai',
        icon: '🤖',
        basePrice: 0.00089,
        unit: 'palavra',
        minimumCharge: 0.05,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 1000, discountPercent: 0, pricePerUnit: 0.00089 },
            { minQuantity: 1001, maxQuantity: 5000, discountPercent: 10, pricePerUnit: 0.00080 },
            { minQuantity: 5001, maxQuantity: 20000, discountPercent: 20, pricePerUnit: 0.00071 },
            { minQuantity: 20001, maxQuantity: Infinity, discountPercent: 30, pricePerUnit: 0.00062 },
        ],
        dailyLimit: 100000,
        monthlyLimit: 2000000,
        isActive: true,
        requiresApiKey: true,
        estimatedTime: '2-5 segundos',
    },
    ai_generation_gpt4: {
        serviceType: 'ai_generation_gpt4',
        serviceName: 'Geração IA (GPT-4)',
        description: 'Geração de texto com OpenAI GPT-4',
        category: 'ai',
        icon: '🧠',
        basePrice: 0.012,
        unit: 'palavra',
        minimumCharge: 0.10,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 500, discountPercent: 0, pricePerUnit: 0.012 },
            { minQuantity: 501, maxQuantity: 2000, discountPercent: 10, pricePerUnit: 0.0108 },
            { minQuantity: 2001, maxQuantity: 10000, discountPercent: 15, pricePerUnit: 0.0102 },
            { minQuantity: 10001, maxQuantity: Infinity, discountPercent: 25, pricePerUnit: 0.009 },
        ],
        dailyLimit: 50000,
        monthlyLimit: 1000000,
        isActive: true,
        requiresApiKey: true,
        estimatedTime: '3-8 segundos',
    },
    ai_generation_gpt35: {
        serviceType: 'ai_generation_gpt35',
        serviceName: 'Geração IA (GPT-3.5)',
        description: 'Geração de texto com OpenAI GPT-3.5',
        category: 'ai',
        icon: '💬',
        basePrice: 0.002,
        unit: 'palavra',
        minimumCharge: 0.02,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 2000, discountPercent: 0, pricePerUnit: 0.002 },
            { minQuantity: 2001, maxQuantity: 10000, discountPercent: 15, pricePerUnit: 0.0017 },
            { minQuantity: 10001, maxQuantity: Infinity, discountPercent: 25, pricePerUnit: 0.0015 },
        ],
        dailyLimit: 200000,
        monthlyLimit: 5000000,
        isActive: true,
        requiresApiKey: true,
        estimatedTime: '1-3 segundos',
    },
    image_generation: {
        serviceType: 'image_generation',
        serviceName: 'Geração de Imagem',
        description: 'Criação de imagens com IA',
        category: 'ai',
        icon: '🖼️',
        basePrice: 0.99,
        unit: 'imagem',
        minimumCharge: 0.99,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 10, discountPercent: 0, pricePerUnit: 0.99 },
            { minQuantity: 11, maxQuantity: 50, discountPercent: 10, pricePerUnit: 0.89 },
            { minQuantity: 51, maxQuantity: 200, discountPercent: 20, pricePerUnit: 0.79 },
            { minQuantity: 201, maxQuantity: Infinity, discountPercent: 30, pricePerUnit: 0.69 },
        ],
        dailyLimit: 500,
        monthlyLimit: 10000,
        isActive: true,
        requiresApiKey: true,
        estimatedTime: '10-30 segundos',
    },
    telegram_send: {
        serviceType: 'telegram_send',
        serviceName: 'Envio Telegram',
        description: 'Envio de mensagens via Telegram',
        category: 'messaging',
        icon: '✈️',
        basePrice: 0.03,
        unit: 'envio',
        minimumCharge: 0.03,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 100, discountPercent: 0, pricePerUnit: 0.03 },
            { minQuantity: 101, maxQuantity: 500, discountPercent: 20, pricePerUnit: 0.024 },
            { minQuantity: 501, maxQuantity: 2000, discountPercent: 40, pricePerUnit: 0.018 },
            { minQuantity: 2001, maxQuantity: Infinity, discountPercent: 50, pricePerUnit: 0.015 },
        ],
        dailyLimit: 10000,
        monthlyLimit: 200000,
        isActive: true,
        requiresApiKey: true,
        estimatedTime: '1-2 segundos',
    },
    whatsapp_send: {
        serviceType: 'whatsapp_send',
        serviceName: 'Envio WhatsApp',
        description: 'Envio de mensagens via WhatsApp',
        category: 'messaging',
        icon: '📱',
        basePrice: 0.04,
        unit: 'envio',
        minimumCharge: 0.04,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 100, discountPercent: 0, pricePerUnit: 0.04 },
            { minQuantity: 101, maxQuantity: 500, discountPercent: 15, pricePerUnit: 0.034 },
            { minQuantity: 501, maxQuantity: 2000, discountPercent: 30, pricePerUnit: 0.028 },
            { minQuantity: 2001, maxQuantity: Infinity, discountPercent: 40, pricePerUnit: 0.024 },
        ],
        dailyLimit: 5000,
        monthlyLimit: 100000,
        isActive: true,
        requiresApiKey: true,
        estimatedTime: '2-4 segundos',
    },
    shopee_query: {
        serviceType: 'shopee_query',
        serviceName: 'Consulta Shopee',
        description: 'Consulta de produtos na Shopee',
        category: 'ecommerce',
        icon: '🛒',
        basePrice: 0.02,
        unit: 'consulta',
        minimumCharge: 0.02,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 200, discountPercent: 0, pricePerUnit: 0.02 },
            { minQuantity: 201, maxQuantity: 1000, discountPercent: 20, pricePerUnit: 0.016 },
            { minQuantity: 1001, maxQuantity: 5000, discountPercent: 35, pricePerUnit: 0.013 },
            { minQuantity: 5001, maxQuantity: Infinity, discountPercent: 50, pricePerUnit: 0.01 },
        ],
        dailyLimit: 20000,
        monthlyLimit: 500000,
        isActive: true,
        requiresApiKey: false,
        estimatedTime: '1-3 segundos',
    },
    amazon_query: {
        serviceType: 'amazon_query',
        serviceName: 'Consulta Amazon',
        description: 'Consulta de produtos na Amazon',
        category: 'ecommerce',
        icon: '📦',
        basePrice: 0.025,
        unit: 'consulta',
        minimumCharge: 0.025,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 200, discountPercent: 0, pricePerUnit: 0.025 },
            { minQuantity: 201, maxQuantity: 1000, discountPercent: 15, pricePerUnit: 0.021 },
            { minQuantity: 1001, maxQuantity: 5000, discountPercent: 30, pricePerUnit: 0.0175 },
            { minQuantity: 5001, maxQuantity: Infinity, discountPercent: 40, pricePerUnit: 0.015 },
        ],
        dailyLimit: 15000,
        monthlyLimit: 400000,
        isActive: true,
        requiresApiKey: false,
        estimatedTime: '2-4 segundos',
    },
    mercadolivre_query: {
        serviceType: 'mercadolivre_query',
        serviceName: 'Consulta Mercado Livre',
        description: 'Consulta de produtos no Mercado Livre',
        category: 'ecommerce',
        icon: '🏪',
        basePrice: 0.018,
        unit: 'consulta',
        minimumCharge: 0.018,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 300, discountPercent: 0, pricePerUnit: 0.018 },
            { minQuantity: 301, maxQuantity: 1500, discountPercent: 20, pricePerUnit: 0.0144 },
            { minQuantity: 1501, maxQuantity: 7000, discountPercent: 35, pricePerUnit: 0.0117 },
            { minQuantity: 7001, maxQuantity: Infinity, discountPercent: 45, pricePerUnit: 0.0099 },
        ],
        dailyLimit: 25000,
        monthlyLimit: 600000,
        isActive: true,
        requiresApiKey: false,
        estimatedTime: '1-2 segundos',
    },
    woocommerce_sync: {
        serviceType: 'woocommerce_sync',
        serviceName: 'Sincronização WooCommerce',
        description: 'Sincronização de produtos com WooCommerce',
        category: 'publishing',
        icon: '🔄',
        basePrice: 0.17,
        unit: 'sincronização',
        minimumCharge: 0.17,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 50, discountPercent: 0, pricePerUnit: 0.17 },
            { minQuantity: 51, maxQuantity: 200, discountPercent: 15, pricePerUnit: 0.1445 },
            { minQuantity: 201, maxQuantity: 500, discountPercent: 25, pricePerUnit: 0.1275 },
            { minQuantity: 501, maxQuantity: Infinity, discountPercent: 35, pricePerUnit: 0.1105 },
        ],
        dailyLimit: 2000,
        monthlyLimit: 50000,
        isActive: true,
        requiresApiKey: true,
        estimatedTime: '3-10 segundos',
    },
    wordpress_publish: {
        serviceType: 'wordpress_publish',
        serviceName: 'Publicação WordPress',
        description: 'Publicação de conteúdo no WordPress',
        category: 'publishing',
        icon: '📝',
        basePrice: 0.05,
        unit: 'publicação',
        minimumCharge: 0.05,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 50, discountPercent: 0, pricePerUnit: 0.05 },
            { minQuantity: 51, maxQuantity: 200, discountPercent: 20, pricePerUnit: 0.04 },
            { minQuantity: 201, maxQuantity: 500, discountPercent: 35, pricePerUnit: 0.0325 },
            { minQuantity: 501, maxQuantity: Infinity, discountPercent: 50, pricePerUnit: 0.025 },
        ],
        dailyLimit: 1000,
        monthlyLimit: 20000,
        isActive: true,
        requiresApiKey: true,
        estimatedTime: '2-5 segundos',
    },
    instagram_post: {
        serviceType: 'instagram_post',
        serviceName: 'Publicação Instagram',
        description: 'Publicação de conteúdo no Instagram',
        category: 'publishing',
        icon: '📸',
        basePrice: 0.08,
        unit: 'publicação',
        minimumCharge: 0.08,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 30, discountPercent: 0, pricePerUnit: 0.08 },
            { minQuantity: 31, maxQuantity: 100, discountPercent: 15, pricePerUnit: 0.068 },
            { minQuantity: 101, maxQuantity: 300, discountPercent: 25, pricePerUnit: 0.06 },
            { minQuantity: 301, maxQuantity: Infinity, discountPercent: 35, pricePerUnit: 0.052 },
        ],
        dailyLimit: 500,
        monthlyLimit: 10000,
        isActive: true,
        requiresApiKey: true,
        estimatedTime: '3-8 segundos',
    },
    blog_article: {
        serviceType: 'blog_article',
        serviceName: 'Artigo para Blog',
        description: 'Geração de artigo completo otimizado para SEO',
        category: 'content',
        icon: '📰',
        basePrice: 2.50,
        unit: 'artigo',
        minimumCharge: 2.50,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 10, discountPercent: 0, pricePerUnit: 2.50 },
            { minQuantity: 11, maxQuantity: 50, discountPercent: 15, pricePerUnit: 2.125 },
            { minQuantity: 51, maxQuantity: 100, discountPercent: 25, pricePerUnit: 1.875 },
            { minQuantity: 101, maxQuantity: Infinity, discountPercent: 35, pricePerUnit: 1.625 },
        ],
        dailyLimit: 200,
        monthlyLimit: 5000,
        isActive: true,
        requiresApiKey: true,
        estimatedTime: '30-60 segundos',
    },
    product_review: {
        serviceType: 'product_review',
        serviceName: 'Review de Produto',
        description: 'Geração de review detalhado de produto',
        category: 'content',
        icon: '⭐',
        basePrice: 1.50,
        unit: 'review',
        minimumCharge: 1.50,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 20, discountPercent: 0, pricePerUnit: 1.50 },
            { minQuantity: 21, maxQuantity: 100, discountPercent: 20, pricePerUnit: 1.20 },
            { minQuantity: 101, maxQuantity: 300, discountPercent: 30, pricePerUnit: 1.05 },
            { minQuantity: 301, maxQuantity: Infinity, discountPercent: 40, pricePerUnit: 0.90 },
        ],
        dailyLimit: 500,
        monthlyLimit: 10000,
        isActive: true,
        requiresApiKey: true,
        estimatedTime: '20-40 segundos',
    },
    ebook_chapter: {
        serviceType: 'ebook_chapter',
        serviceName: 'Capítulo de eBook',
        description: 'Geração de capítulo completo para eBook',
        category: 'content',
        icon: '📚',
        basePrice: 5.00,
        unit: 'capítulo',
        minimumCharge: 5.00,
        volumeDiscounts: [
            { minQuantity: 1, maxQuantity: 5, discountPercent: 0, pricePerUnit: 5.00 },
            { minQuantity: 6, maxQuantity: 20, discountPercent: 10, pricePerUnit: 4.50 },
            { minQuantity: 21, maxQuantity: 50, discountPercent: 20, pricePerUnit: 4.00 },
            { minQuantity: 51, maxQuantity: Infinity, discountPercent: 30, pricePerUnit: 3.50 },
        ],
        dailyLimit: 50,
        monthlyLimit: 1000,
        isActive: true,
        requiresApiKey: true,
        estimatedTime: '60-120 segundos',
    },
};

// ==========================================
// PACOTES DE CRÉDITOS
// ==========================================

export const CREDIT_PACKAGES: CreditPackage[] = [
    {
        id: 'starter',
        name: 'Starter',
        description: 'Ideal para começar a testar a plataforma',
        credits: 10,
        bonusCredits: 0,
        totalCredits: 10,
        price: 10.00,
        pricePerCredit: 1.00,
        discountPercent: 0,
        features: [
            'R$ 10 em créditos',
            'Válido para sempre',
            'Acesso a todas as ferramentas',
            'Suporte por email',
        ],
        highlighted: false,
        isActive: true,
        isPromo: false,
    },
    {
        id: 'basic',
        name: 'Básico',
        description: 'Para uso regular da plataforma',
        credits: 30,
        bonusCredits: 3,
        totalCredits: 33,
        price: 29.90,
        pricePerCredit: 0.91,
        discountPercent: 9,
        originalPrice: 33.00,
        features: [
            'R$ 30 em créditos',
            '+R$ 3 bônus (10%)',
            'Válido para sempre',
            'Suporte prioritário',
        ],
        highlighted: false,
        isActive: true,
        isPromo: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        description: 'Melhor custo-benefício para profissionais',
        credits: 100,
        bonusCredits: 20,
        totalCredits: 120,
        price: 89.90,
        pricePerCredit: 0.75,
        discountPercent: 25,
        originalPrice: 120.00,
        features: [
            'R$ 100 em créditos',
            '+R$ 20 bônus (20%)',
            'Válido para sempre',
            'Suporte VIP',
            'Acesso antecipado',
        ],
        highlighted: true,
        badge: 'Mais Popular',
        isActive: true,
        isPromo: false,
    },
    {
        id: 'business',
        name: 'Business',
        description: 'Para equipes e uso intensivo',
        credits: 250,
        bonusCredits: 75,
        totalCredits: 325,
        price: 199.90,
        pricePerCredit: 0.62,
        discountPercent: 38,
        originalPrice: 325.00,
        features: [
            'R$ 250 em créditos',
            '+R$ 75 bônus (30%)',
            'Válido para sempre',
            'Suporte VIP 24/7',
            'Consultoria inclusa',
            'API dedicada',
        ],
        highlighted: false,
        badge: 'Melhor Valor',
        isActive: true,
        isPromo: false,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'Solução corporativa completa',
        credits: 500,
        bonusCredits: 200,
        totalCredits: 700,
        price: 349.90,
        pricePerCredit: 0.50,
        discountPercent: 50,
        originalPrice: 700.00,
        features: [
            'R$ 500 em créditos',
            '+R$ 200 bônus (40%)',
            'Válido para sempre',
            'Suporte VIP 24/7',
            'Gerente de conta dedicado',
            'SLA garantido',
            'Integrações customizadas',
        ],
        highlighted: false,
        isActive: true,
        isPromo: false,
    },
];

// ==========================================
// CREDIT SERVICE - SINGLETON
// ==========================================

type EventListener = (event: CreditEvent) => void;

class CreditService {
    private static instance: CreditService;
    private config: CreditSystemConfig;
    private eventListeners: Map<CreditEventType, Set<EventListener>>;
    private currentUserId: string | null = null;
    private balanceCache: CreditBalance | null = null;
    private cacheExpiry: number = 0;
    private readonly CACHE_TTL = 30000; // 30 segundos

    private constructor() {
        this.config = DEFAULT_CREDIT_CONFIG;
        this.eventListeners = new Map();
    }

    /**
     * Obtém a instância única do CreditService
     */
    public static getInstance(): CreditService {
        if (!CreditService.instance) {
            CreditService.instance = new CreditService();
        }
        return CreditService.instance;
    }

    // ==========================================
    // CONFIGURAÇÃO
    // ==========================================

    /**
     * Atualiza a configuração do sistema
     */
    public setConfig(config: Partial<CreditSystemConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Obtém a configuração atual
     */
    public getConfig(): CreditSystemConfig {
        return { ...this.config };
    }

    // ==========================================
    // AUTENTICAÇÃO
    // ==========================================

    /**
     * Define o usuário atual
     */
    public async setCurrentUser(userId: string | null): Promise<void> {
        this.currentUserId = userId;
        this.invalidateCache();

        if (userId) {
            await this.ensureBalanceExists(userId);
        }
    }

    /**
     * Obtém o ID do usuário atual
     */
    public getCurrentUserId(): string | null {
        return this.currentUserId;
    }

    /**
     * Garante que o registro de saldo existe para o usuário
     */
    private async ensureBalanceExists(userId: string): Promise<void> {
        const { data, error } = await supabase
            .from('user_credits')
            .select('user_id')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // Registro não existe, criar
            await supabase.from('user_credits').insert({
                user_id: userId,
                balance: 0,
                reserved_credits: 0,
                bonus_credits: 0,
                total_purchased: 0,
                total_used: 0,
                total_bonus: 0,
                low_balance_threshold: this.config.lowBalanceThresholdDefault,
                auto_recharge_enabled: false,
                current_month_usage: 0,
                current_month_purchased: 0,
            });
        }
    }

    // ==========================================
    // SALDO
    // ==========================================

    /**
     * Obtém o saldo atual do usuário
     */
    public async getBalance(forceRefresh = false): Promise<CreditBalance | null> {
        if (!this.currentUserId) return null;

        // Verificar cache
        if (!forceRefresh && this.balanceCache && Date.now() < this.cacheExpiry) {
            return this.balanceCache;
        }

        try {
            const { data, error } = await supabase
                .from('user_credits')
                .select('*')
                .eq('user_id', this.currentUserId)
                .single();

            if (error) throw error;

            const balance: CreditBalance = {
                userId: data.user_id,
                availableCredits: data.balance || 0,
                reservedCredits: data.reserved_credits || 0,
                bonusCredits: data.bonus_credits || 0,
                totalCredits: (data.balance || 0) + (data.bonus_credits || 0),
                lifetimePurchased: data.total_purchased || 0,
                lifetimeUsed: data.total_used || 0,
                lifetimeBonus: data.total_bonus || 0,
                lowBalanceThreshold: data.low_balance_threshold || this.config.lowBalanceThresholdDefault,
                autoRechargeEnabled: data.auto_recharge_enabled || false,
                autoRechargeAmount: data.auto_recharge_amount,
                autoRechargeThreshold: data.auto_recharge_threshold,
                currentMonthUsage: data.current_month_usage || 0,
                currentMonthPurchased: data.current_month_purchased || 0,
                lastTransactionAt: data.last_transaction_at ? new Date(data.last_transaction_at) : undefined,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
            };

            // Atualizar cache
            this.balanceCache = balance;
            this.cacheExpiry = Date.now() + this.CACHE_TTL;

            return balance;
        } catch (error) {
            console.error('Erro ao obter saldo:', error);
            return null;
        }
    }

    /**
     * Invalida o cache de saldo
     */
    public invalidateCache(): void {
        this.balanceCache = null;
        this.cacheExpiry = 0;
    }

    // ==========================================
    // CÁLCULO DE CUSTOS
    // ==========================================

    /**
     * Obtém o modelo de precificação de um serviço
     */
    public getPricingModel(serviceType: CreditServiceType): PricingModel | null {
        return PRICING_MODELS[serviceType] || null;
    }

    /**
     * Obtém todos os modelos de precificação
     */
    public getAllPricingModels(): PricingModel[] {
        return Object.values(PRICING_MODELS).filter(m => m.isActive);
    }

    /**
     * Obtém modelos por categoria
     */
    public getPricingModelsByCategory(category: PricingModel['category']): PricingModel[] {
        return Object.values(PRICING_MODELS).filter(m => m.category === category && m.isActive);
    }

    /**
     * Calcula o custo de uma operação
     */
    public calculateCost(request: CostCalculationRequest): CostCalculationResult {
        const model = this.getPricingModel(request.serviceType);

        if (!model) {
            throw new Error(`Modelo de precificação não encontrado: ${request.serviceType}`);
        }

        let quantity = request.quantity;

        // Ajustes especiais por tipo de serviço
        if (request.metadata) {
            if (request.serviceType.startsWith('ai_generation') && request.metadata.wordCount) {
                quantity = request.metadata.wordCount;
            }
        }

        // Calcular preço com descontos por volume
        let totalPrice = 0;
        let remainingQuantity = quantity;
        const breakdown: CostCalculationResult['breakdown'] = [];

        for (let i = 0; i < model.volumeDiscounts.length && remainingQuantity > 0; i++) {
            const tier = model.volumeDiscounts[i];
            const tierQuantity = Math.min(
                remainingQuantity,
                tier.maxQuantity === Infinity ? remainingQuantity : tier.maxQuantity - tier.minQuantity + 1
            );

            const tierSubtotal = tierQuantity * tier.pricePerUnit;
            totalPrice += tierSubtotal;
            remainingQuantity -= tierQuantity;

            breakdown.push({
                tier: i + 1,
                quantity: tierQuantity,
                pricePerUnit: tier.pricePerUnit,
                subtotal: tierSubtotal,
            });
        }

        // Aplicar cobrança mínima
        const finalPrice = Math.max(totalPrice, model.minimumCharge);
        const basePrice = quantity * model.basePrice;
        const discount = basePrice - finalPrice;
        const discountPercent = basePrice > 0 ? (discount / basePrice) * 100 : 0;

        return {
            serviceType: request.serviceType,
            quantity,
            basePrice,
            finalPrice,
            discount,
            discountPercent,
            unit: model.unit,
            breakdown,
        };
    }

    /**
     * Verifica se há saldo suficiente
     */
    public async checkSufficientBalance(
        serviceType: CreditServiceType,
        quantity: number,
        metadata?: TransactionMetadata
    ): Promise<boolean> {
        const balance = await this.getBalance();
        if (!balance) return false;

        const cost = this.calculateCost({ serviceType, quantity, metadata });
        return balance.totalCredits >= cost.finalPrice;
    }

    // ==========================================
    // OPERAÇÕES DE CRÉDITOS
    // ==========================================

    /**
     * Debita créditos do usuário
     */
    public async debitCredits(request: DebitCreditsRequest): Promise<CreditOperationResult> {
        if (!this.currentUserId) {
            return {
                success: false,
                newBalance: 0,
                error: { code: 'NOT_AUTHENTICATED', message: 'Usuário não autenticado' },
            };
        }

        try {
            // Obter quantidade baseada nos metadados
            let quantity = 1;
            if (request.metadata) {
                if (request.serviceType.startsWith('ai_generation') && request.metadata.wordCount) {
                    quantity = request.metadata.wordCount;
                } else if (request.metadata.recipientCount) {
                    quantity = request.metadata.recipientCount;
                }
            }

            // Calcular custo
            const cost = this.calculateCost({
                serviceType: request.serviceType,
                quantity,
                metadata: request.metadata,
            });

            // Verificar saldo
            const balance = await this.getBalance(true);
            if (!balance || balance.totalCredits < cost.finalPrice) {
                return {
                    success: false,
                    newBalance: balance?.totalCredits || 0,
                    error: { code: 'INSUFFICIENT_BALANCE', message: 'Saldo insuficiente' },
                };
            }

            // Debitar primeiro do bônus, depois do saldo principal
            let bonusToUse = Math.min(balance.bonusCredits, cost.finalPrice);
            let mainToUse = cost.finalPrice - bonusToUse;

            const newMainBalance = balance.availableCredits - mainToUse;
            const newBonusBalance = balance.bonusCredits - bonusToUse;

            // Atualizar saldo no banco
            const { error: updateError } = await supabase
                .from('user_credits')
                .update({
                    balance: newMainBalance,
                    bonus_credits: newBonusBalance,
                    total_used: balance.lifetimeUsed + cost.finalPrice,
                    current_month_usage: balance.currentMonthUsage + cost.finalPrice,
                    last_transaction_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', this.currentUserId);

            if (updateError) throw updateError;

            // Criar transação
            const transaction: Partial<CreditTransaction> = {
                userId: this.currentUserId,
                type: 'debit',
                status: 'completed',
                amount: cost.finalPrice,
                creditsAmount: cost.finalPrice,
                balanceAfter: newMainBalance + newBonusBalance,
                serviceType: request.serviceType,
                serviceName: PRICING_MODELS[request.serviceType].serviceName,
                description: request.description,
                metadata: request.metadata,
                createdAt: new Date(),
                processedAt: new Date(),
            };

            const { data: txData, error: txError } = await supabase
                .from('credit_transactions')
                .insert({
                    user_id: transaction.userId,
                    type: transaction.type,
                    status: transaction.status,
                    amount: transaction.amount,
                    credits_amount: transaction.creditsAmount,
                    balance_after: transaction.balanceAfter,
                    service_type: transaction.serviceType,
                    service_name: transaction.serviceName,
                    description: transaction.description,
                    metadata: transaction.metadata,
                })
                .select()
                .single();

            if (txError) console.error('Erro ao registrar transação:', txError);

            // Invalidar cache e emitir evento
            this.invalidateCache();
            this.emitEvent('balance_updated', {
                previousBalance: balance.totalCredits,
                newBalance: newMainBalance + newBonusBalance,
                change: -cost.finalPrice,
                reason: 'debit',
                transactionId: txData?.id,
            });

            // Verificar saldo baixo
            const newTotal = newMainBalance + newBonusBalance;
            if (newTotal < balance.lowBalanceThreshold) {
                this.emitEvent('low_balance_warning', {
                    currentBalance: newTotal,
                    threshold: balance.lowBalanceThreshold,
                    suggestedRecharge: balance.lowBalanceThreshold * 2,
                    estimatedDaysRemaining: Math.ceil(newTotal / (balance.currentMonthUsage / 30 || 1)),
                });
            }

            return {
                success: true,
                transactionId: txData?.id,
                newBalance: newTotal,
                creditsUsed: cost.finalPrice,
            };
        } catch (error: any) {
            console.error('Erro ao debitar créditos:', error);
            return {
                success: false,
                newBalance: 0,
                error: { code: 'DEBIT_FAILED', message: error.message || 'Erro ao debitar créditos' },
            };
        }
    }

    /**
     * Adiciona créditos ao usuário
     */
    public async addCredits(request: AddCreditsRequest): Promise<CreditOperationResult> {
        if (!this.currentUserId) {
            return {
                success: false,
                newBalance: 0,
                error: { code: 'NOT_AUTHENTICATED', message: 'Usuário não autenticado' },
            };
        }

        try {
            const balance = await this.getBalance(true);
            if (!balance) {
                return {
                    success: false,
                    newBalance: 0,
                    error: { code: 'BALANCE_NOT_FOUND', message: 'Registro de saldo não encontrado' },
                };
            }

            const creditsToAdd = request.credits || request.amount;
            let newMainBalance = balance.availableCredits;
            let newBonusBalance = balance.bonusCredits;
            let newTotalPurchased = balance.lifetimePurchased;
            let newTotalBonus = balance.lifetimeBonus;
            let newMonthPurchased = balance.currentMonthPurchased;

            if (request.type === 'bonus') {
                newBonusBalance += creditsToAdd;
                newTotalBonus += creditsToAdd;
            } else {
                newMainBalance += creditsToAdd;
                newTotalPurchased += creditsToAdd;
                newMonthPurchased += creditsToAdd;
            }

            // Atualizar saldo no banco
            const { error: updateError } = await supabase
                .from('user_credits')
                .update({
                    balance: newMainBalance,
                    bonus_credits: newBonusBalance,
                    total_purchased: newTotalPurchased,
                    total_bonus: newTotalBonus,
                    current_month_purchased: newMonthPurchased,
                    last_transaction_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', this.currentUserId);

            if (updateError) throw updateError;

            // Criar transação
            const { data: txData, error: txError } = await supabase
                .from('credit_transactions')
                .insert({
                    user_id: this.currentUserId,
                    type: request.type,
                    status: 'completed',
                    amount: request.amount,
                    credits_amount: creditsToAdd,
                    balance_after: newMainBalance + newBonusBalance,
                    description: request.description,
                    metadata: request.metadata,
                })
                .select()
                .single();

            if (txError) console.error('Erro ao registrar transação:', txError);

            // Invalidar cache e emitir evento
            this.invalidateCache();
            this.emitEvent('balance_updated', {
                previousBalance: balance.totalCredits,
                newBalance: newMainBalance + newBonusBalance,
                change: creditsToAdd,
                reason: request.type,
                transactionId: txData?.id,
            });

            if (request.paymentMethod) {
                this.emitEvent('payment_completed', {
                    transactionId: txData?.id,
                    amount: request.amount,
                    credits: creditsToAdd,
                    paymentMethod: request.paymentMethod,
                    status: 'completed',
                });
            }

            return {
                success: true,
                transactionId: txData?.id,
                newBalance: newMainBalance + newBonusBalance,
                creditsAdded: creditsToAdd,
            };
        } catch (error: any) {
            console.error('Erro ao adicionar créditos:', error);
            this.emitEvent('payment_failed', {
                amount: request.amount,
                paymentMethod: request.paymentMethod,
                errorMessage: error.message,
            });
            return {
                success: false,
                newBalance: 0,
                error: { code: 'ADD_FAILED', message: error.message || 'Erro ao adicionar créditos' },
            };
        }
    }

    /**
     * Reserva créditos para uma operação
     */
    public async reserveCredits(amount: number): Promise<CreditOperationResult> {
        if (!this.currentUserId) {
            return { success: false, newBalance: 0, error: { code: 'NOT_AUTHENTICATED', message: 'Usuário não autenticado' } };
        }

        try {
            const balance = await this.getBalance(true);
            if (!balance || balance.availableCredits < amount) {
                return { success: false, newBalance: balance?.totalCredits || 0, error: { code: 'INSUFFICIENT_BALANCE', message: 'Saldo insuficiente' } };
            }

            const { error } = await supabase
                .from('user_credits')
                .update({
                    balance: balance.availableCredits - amount,
                    reserved_credits: balance.reservedCredits + amount,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', this.currentUserId);

            if (error) throw error;

            this.invalidateCache();
            return { success: true, newBalance: balance.availableCredits - amount + balance.bonusCredits };
        } catch (error: any) {
            return { success: false, newBalance: 0, error: { code: 'RESERVE_FAILED', message: error.message } };
        }
    }

    /**
     * Libera créditos reservados
     */
    public async releaseReservedCredits(amount: number, commit: boolean): Promise<CreditOperationResult> {
        if (!this.currentUserId) {
            return { success: false, newBalance: 0, error: { code: 'NOT_AUTHENTICATED', message: 'Usuário não autenticado' } };
        }

        try {
            const balance = await this.getBalance(true);
            if (!balance || balance.reservedCredits < amount) {
                return { success: false, newBalance: balance?.totalCredits || 0, error: { code: 'INVALID_RESERVE', message: 'Reserva inválida' } };
            }

            const updates: Record<string, unknown> = {
                reserved_credits: balance.reservedCredits - amount,
                updated_at: new Date().toISOString(),
            };

            if (!commit) {
                // Devolver ao saldo
                updates.balance = balance.availableCredits + amount;
            } else {
                // Confirmar uso
                updates.total_used = balance.lifetimeUsed + amount;
                updates.current_month_usage = balance.currentMonthUsage + amount;
            }

            const { error } = await supabase
                .from('user_credits')
                .update(updates)
                .eq('user_id', this.currentUserId);

            if (error) throw error;

            this.invalidateCache();
            const newBalance = commit
                ? balance.availableCredits + balance.bonusCredits
                : balance.availableCredits + amount + balance.bonusCredits;

            return { success: true, newBalance };
        } catch (error: any) {
            return { success: false, newBalance: 0, error: { code: 'RELEASE_FAILED', message: error.message } };
        }
    }

    // ==========================================
    // TRANSAÇÕES
    // ==========================================

    /**
     * Obtém transações do usuário
     */
    public async getTransactions(
        filters?: TransactionFilters,
        pagination?: PaginationOptions
    ): Promise<PaginatedResponse<CreditTransaction>> {
        if (!this.currentUserId) {
            return { data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
        }

        const page = pagination?.page || 1;
        const limit = pagination?.limit || 20;
        const offset = (page - 1) * limit;

        let query = supabase
            .from('credit_transactions')
            .select('*', { count: 'exact' })
            .eq('user_id', this.currentUserId);

        // Aplicar filtros
        if (filters?.startDate) {
            query = query.gte('created_at', filters.startDate.toISOString());
        }
        if (filters?.endDate) {
            query = query.lte('created_at', filters.endDate.toISOString());
        }
        if (filters?.type) {
            query = query.in('type', Array.isArray(filters.type) ? filters.type : [filters.type]);
        }
        if (filters?.status) {
            query = query.in('status', Array.isArray(filters.status) ? filters.status : [filters.status]);
        }
        if (filters?.serviceType) {
            query = query.in('service_type', Array.isArray(filters.serviceType) ? filters.serviceType : [filters.serviceType]);
        }
        if (filters?.minAmount) {
            query = query.gte('amount', filters.minAmount);
        }
        if (filters?.maxAmount) {
            query = query.lte('amount', filters.maxAmount);
        }

        // Ordenação
        const sortBy = pagination?.sortBy || 'createdAt';
        const sortOrder = pagination?.sortOrder || 'desc';
        const columnMap: Record<string, string> = { createdAt: 'created_at', amount: 'amount', status: 'status' };
        query = query.order(columnMap[sortBy] || 'created_at', { ascending: sortOrder === 'asc' });

        // Paginação
        query = query.range(offset, offset + limit - 1);

        const { data, count, error } = await query;

        if (error) {
            console.error('Erro ao buscar transações:', error);
            return { data: [], pagination: { page, limit, total: 0, totalPages: 0, hasNext: false, hasPrev: false } };
        }

        const transactions: CreditTransaction[] = (data || []).map(t => ({
            id: t.id,
            userId: t.user_id,
            type: t.type,
            status: t.status,
            amount: t.amount,
            creditsAmount: t.credits_amount,
            balanceAfter: t.balance_after,
            serviceType: t.service_type,
            serviceName: t.service_name,
            description: t.description,
            metadata: t.metadata,
            externalId: t.external_id,
            parentTransactionId: t.parent_transaction_id,
            createdAt: new Date(t.created_at),
            processedAt: t.processed_at ? new Date(t.processed_at) : undefined,
            expiresAt: t.expires_at ? new Date(t.expires_at) : undefined,
        }));

        const total = count || 0;
        const totalPages = Math.ceil(total / limit);

        return {
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }

    // ==========================================
    // ANALYTICS
    // ==========================================

    /**
     * Obtém analytics de uso
     */
    public async getAnalytics(startDate: Date, endDate: Date): Promise<CreditAnalytics | null> {
        if (!this.currentUserId) return null;

        try {
            // Buscar transações do período
            const { data: transactions } = await supabase
                .from('credit_transactions')
                .select('*')
                .eq('user_id', this.currentUserId)
                .eq('type', 'debit')
                .eq('status', 'completed')
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());

            if (!transactions || transactions.length === 0) {
                return this.getEmptyAnalytics(startDate, endDate);
            }

            // Calcular uso por serviço
            const byService: Record<CreditServiceType, ServiceUsage> = {} as any;
            const byDay: DailyUsage[] = [];
            const dailyMap = new Map<string, DailyUsage>();
            let totalSpent = 0;

            for (const tx of transactions) {
                totalSpent += tx.amount;

                // Por serviço
                const serviceType = tx.service_type as CreditServiceType;
                if (serviceType) {
                    if (!byService[serviceType]) {
                        byService[serviceType] = {
                            serviceType,
                            totalSpent: 0,
                            transactionCount: 0,
                            averagePerTransaction: 0,
                            percentOfTotal: 0,
                        };
                    }
                    byService[serviceType].totalSpent += tx.amount;
                    byService[serviceType].transactionCount++;
                    byService[serviceType].lastUsed = new Date(tx.created_at);
                }

                // Por dia
                const dateKey = new Date(tx.created_at).toISOString().split('T')[0];
                if (!dailyMap.has(dateKey)) {
                    dailyMap.set(dateKey, { date: dateKey, amount: 0, transactionCount: 0, services: [] });
                }
                const day = dailyMap.get(dateKey)!;
                day.amount += tx.amount;
                day.transactionCount++;
                if (serviceType && !day.services.includes(serviceType)) {
                    day.services.push(serviceType);
                }
            }

            // Finalizar cálculos
            for (const service of Object.values(byService)) {
                service.averagePerTransaction = service.totalSpent / service.transactionCount;
                service.percentOfTotal = (service.totalSpent / totalSpent) * 100;
            }

            dailyMap.forEach(day => byDay.push(day));
            byDay.sort((a, b) => a.date.localeCompare(b.date));

            const days = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const averageDaily = totalSpent / days;

            // Encontrar pico
            let peakDay = byDay[0];
            for (const day of byDay) {
                if (day.amount > peakDay.amount) peakDay = day;
            }

            // Serviços mais/menos usados
            const servicesList = Object.values(byService).sort((a, b) => b.totalSpent - a.totalSpent);
            const mostUsedService = servicesList[0]?.serviceType || 'ai_generation_gemini';
            const leastUsedService = servicesList[servicesList.length - 1]?.serviceType || 'ebook_chapter';

            return {
                userId: this.currentUserId,
                period: { startDate, endDate },
                usage: {
                    totalSpent,
                    totalTransactions: transactions.length,
                    averageTransactionValue: totalSpent / transactions.length,
                    byService,
                    byDay,
                    averageDaily,
                    peakUsageDay: peakDay?.date || '',
                    peakUsageHour: 14, // Placeholder
                },
                efficiency: {
                    costPerResult: {},
                    roi: 0,
                    conversionRate: 0,
                    revenueGenerated: 0,
                    savingsFromVolume: 0,
                },
                trends: {
                    usageGrowth: 0,
                    growthTrend: 'stable',
                    mostUsedService,
                    leastUsedService,
                    predictedMonthlyUsage: averageDaily * 30,
                    seasonality: {
                        busiestDayOfWeek: 2,
                        busiestHourOfDay: 14,
                        weekdayVsWeekend: 3.5,
                    },
                },
                recommendations: {
                    suggestedPackage: this.getSuggestedPackage(averageDaily * 30),
                    potentialSavings: 0,
                    optimizationTips: [],
                    alerts: [],
                },
            };
        } catch (error) {
            console.error('Erro ao obter analytics:', error);
            return null;
        }
    }

    private getEmptyAnalytics(startDate: Date, endDate: Date): CreditAnalytics {
        return {
            userId: this.currentUserId!,
            period: { startDate, endDate },
            usage: {
                totalSpent: 0,
                totalTransactions: 0,
                averageTransactionValue: 0,
                byService: {} as any,
                byDay: [],
                averageDaily: 0,
                peakUsageDay: '',
                peakUsageHour: 0,
            },
            efficiency: {
                costPerResult: {} as any,
                roi: 0,
                conversionRate: 0,
                revenueGenerated: 0,
                savingsFromVolume: 0,
            },
            trends: {
                usageGrowth: 0,
                growthTrend: 'stable',
                mostUsedService: 'ai_generation_gemini',
                leastUsedService: 'ebook_chapter',
                predictedMonthlyUsage: 0,
                seasonality: { busiestDayOfWeek: 0, busiestHourOfDay: 0, weekdayVsWeekend: 0 },
            },
            recommendations: {
                suggestedPackage: 'starter',
                potentialSavings: 0,
                optimizationTips: [],
                alerts: [],
            },
        };
    }

    private getSuggestedPackage(monthlyUsage: number): string {
        if (monthlyUsage <= 10) return 'starter';
        if (monthlyUsage <= 33) return 'basic';
        if (monthlyUsage <= 120) return 'pro';
        if (monthlyUsage <= 325) return 'business';
        return 'enterprise';
    }

    // ==========================================
    // PACOTES
    // ==========================================

    /**
     * Obtém todos os pacotes disponíveis
     */
    public getPackages(): CreditPackage[] {
        return CREDIT_PACKAGES.filter(p => p.isActive);
    }

    /**
     * Obtém um pacote por ID
     */
    public getPackageById(id: string): CreditPackage | null {
        return CREDIT_PACKAGES.find(p => p.id === id && p.isActive) || null;
    }

    // ==========================================
    // EVENTOS
    // ==========================================

    /**
     * Adiciona um listener de evento
     */
    public addEventListener(type: CreditEventType, listener: EventListener): void {
        if (!this.eventListeners.has(type)) {
            this.eventListeners.set(type, new Set());
        }
        this.eventListeners.get(type)!.add(listener);
    }

    /**
     * Remove um listener de evento
     */
    public removeEventListener(type: CreditEventType, listener: EventListener): void {
        this.eventListeners.get(type)?.delete(listener);
    }

    /**
     * Emite um evento
     */
    private emitEvent(type: CreditEventType, data: unknown): void {
        const event: CreditEvent = {
            type,
            timestamp: new Date(),
            userId: this.currentUserId || '',
            data,
        };

        this.eventListeners.get(type)?.forEach(listener => {
            try {
                listener(event);
            } catch (error) {
                console.error(`Erro no listener de evento ${type}:`, error);
            }
        });
    }

    // ==========================================
    // UTILITÁRIOS
    // ==========================================

    /**
     * Formata valor em moeda
     */
    public formatCurrency(value: number): string {
        return new Intl.NumberFormat(this.config.locale, {
            style: 'currency',
            currency: this.config.currency,
        }).format(value);
    }

    /**
     * Formata número
     */
    public formatNumber(value: number): string {
        return new Intl.NumberFormat(this.config.locale).format(value);
    }
}

// Exportar instância singleton
export const creditService = CreditService.getInstance();
export default creditService;
