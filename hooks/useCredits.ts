/**
 * =========================================
 * ACI - Sistema de Créditos Pay-per-Use
 * Hook React para Integração
 * =========================================
 * 
 * Hook React com estado reativo, auto-refresh,
 * e integração completa com CreditService.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { creditService, PRICING_MODELS, CREDIT_PACKAGES } from '../services/creditService';
import {
    CreditServiceType,
    CreditBalance,
    CreditTransaction,
    CreditAnalytics,
    CreditPackage,
    PricingModel,
    CreditOperationResult,
    TransactionMetadata,
    TransactionFilters,
    PaginationOptions,
    PaginatedResponse,
    CostCalculationResult,
    CreditEvent,
    CreditEventType,
} from '../types/credit';

// ==========================================
// TIPOS DO HOOK
// ==========================================

export interface UseCreditsOptions {
    /** Atualizar saldo automaticamente */
    autoRefresh?: boolean;
    /** Intervalo de atualização em ms (padrão: 30000) */
    refreshInterval?: number;
    /** Callback quando saldo for atualizado */
    onBalanceUpdate?: (balance: CreditBalance) => void;
    /** Callback quando saldo estiver baixo */
    onLowBalance?: (balance: number, threshold: number) => void;
    /** Callback quando uma transação for criada */
    onTransaction?: (transaction: CreditTransaction) => void;
    /** Callback para erros */
    onError?: (error: Error) => void;
}

export interface UseCreditsReturn {
    // Estado
    balance: CreditBalance | null;
    transactions: CreditTransaction[];
    isLoading: boolean;
    error: string | null;
    isInitialized: boolean;

    // Dados estáticos
    packages: CreditPackage[];
    pricingModels: Record<CreditServiceType, PricingModel>;

    // Operações de saldo
    refreshBalance: () => Promise<void>;
    debitCredits: (
        serviceType: CreditServiceType,
        description: string,
        metadata?: TransactionMetadata
    ) => Promise<CreditOperationResult>;
    addCredits: (
        amount: number,
        description: string,
        options?: {
            type?: 'credit' | 'bonus' | 'adjustment';
            metadata?: TransactionMetadata;
        }
    ) => Promise<CreditOperationResult>;

    // Cálculos
    calculateCost: (
        serviceType: CreditServiceType,
        quantity: number,
        metadata?: TransactionMetadata
    ) => CostCalculationResult;
    checkSufficientBalance: (
        serviceType: CreditServiceType,
        quantity: number,
        metadata?: TransactionMetadata
    ) => Promise<boolean>;

    // Transações
    getTransactions: (
        filters?: TransactionFilters,
        pagination?: PaginationOptions
    ) => Promise<PaginatedResponse<CreditTransaction>>;
    refreshTransactions: (limit?: number) => Promise<void>;

    // Analytics
    getAnalytics: (startDate: Date, endDate: Date) => Promise<CreditAnalytics | null>;

    // Utilitários
    formatCurrency: (value: number) => string;
    formatNumber: (value: number) => string;
    getPricingModel: (serviceType: CreditServiceType) => PricingModel | null;
    getEstimatedCost: (serviceType: CreditServiceType, details: TransactionMetadata) => number;

    // Pacotes
    getPackages: () => CreditPackage[];
    getPackageById: (id: string) => CreditPackage | null;

    // Serviço (acesso direto)
    creditService: typeof creditService;
}

// ==========================================
// HOOK PRINCIPAL
// ==========================================

export function useCredits(options: UseCreditsOptions = {}): UseCreditsReturn {
    const {
        autoRefresh = true,
        refreshInterval = 30000,
        onBalanceUpdate,
        onLowBalance,
        onTransaction,
        onError,
    } = options;

    // Estado
    const [balance, setBalance] = useState<CreditBalance | null>(null);
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Refs para callbacks e timers
    const onBalanceUpdateRef = useRef(onBalanceUpdate);
    const onLowBalanceRef = useRef(onLowBalance);
    const onTransactionRef = useRef(onTransaction);
    const onErrorRef = useRef(onError);
    const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Atualizar refs quando callbacks mudarem
    useEffect(() => {
        onBalanceUpdateRef.current = onBalanceUpdate;
        onLowBalanceRef.current = onLowBalance;
        onTransactionRef.current = onTransaction;
        onErrorRef.current = onError;
    }, [onBalanceUpdate, onLowBalance, onTransaction, onError]);

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    useEffect(() => {
        let mounted = true;

        const initialize = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Obter usuário atual
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    await creditService.setCurrentUser(user.id);

                    if (mounted) {
                        await refreshBalance();
                        await refreshTransactions(10);
                        setIsInitialized(true);
                    }
                } else {
                    if (mounted) {
                        setIsInitialized(true);
                        setIsLoading(false);
                    }
                }
            } catch (err: any) {
                console.error('Erro ao inicializar useCredits:', err);
                if (mounted) {
                    setError(err.message || 'Erro ao inicializar');
                    onErrorRef.current?.(err);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        initialize();

        // Listener para mudanças de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                await creditService.setCurrentUser(session.user.id);
                if (mounted) {
                    await refreshBalance();
                    await refreshTransactions(10);
                }
            } else if (event === 'SIGNED_OUT') {
                await creditService.setCurrentUser(null);
                if (mounted) {
                    setBalance(null);
                    setTransactions([]);
                }
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // ==========================================
    // AUTO-REFRESH
    // ==========================================

    useEffect(() => {
        if (!autoRefresh || !isInitialized) return;

        const startAutoRefresh = () => {
            refreshTimerRef.current = setInterval(async () => {
                try {
                    await refreshBalance();
                } catch (err) {
                    console.error('Erro no auto-refresh:', err);
                }
            }, refreshInterval);
        };

        startAutoRefresh();

        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [autoRefresh, refreshInterval, isInitialized]);

    // ==========================================
    // EVENT LISTENERS
    // ==========================================

    useEffect(() => {
        const handleBalanceUpdated = (event: CreditEvent) => {
            refreshBalance();
        };

        const handleLowBalanceWarning = (event: CreditEvent) => {
            const data = event.data as { currentBalance: number; threshold: number };
            onLowBalanceRef.current?.(data.currentBalance, data.threshold);
        };

        const handleTransactionCreated = (event: CreditEvent) => {
            refreshTransactions(10);
            const tx = event.data as CreditTransaction;
            onTransactionRef.current?.(tx);
        };

        creditService.addEventListener('balance_updated', handleBalanceUpdated);
        creditService.addEventListener('low_balance_warning', handleLowBalanceWarning);
        creditService.addEventListener('transaction_created', handleTransactionCreated);

        return () => {
            creditService.removeEventListener('balance_updated', handleBalanceUpdated);
            creditService.removeEventListener('low_balance_warning', handleLowBalanceWarning);
            creditService.removeEventListener('transaction_created', handleTransactionCreated);
        };
    }, []);

    // ==========================================
    // OPERAÇÕES DE SALDO
    // ==========================================

    const refreshBalance = useCallback(async () => {
        try {
            const newBalance = await creditService.getBalance(true);
            setBalance(newBalance);

            if (newBalance) {
                onBalanceUpdateRef.current?.(newBalance);

                // Verificar saldo baixo
                if (newBalance.totalCredits < newBalance.lowBalanceThreshold) {
                    onLowBalanceRef.current?.(newBalance.totalCredits, newBalance.lowBalanceThreshold);
                }
            }
        } catch (err: any) {
            console.error('Erro ao atualizar saldo:', err);
            setError(err.message);
            onErrorRef.current?.(err);
        }
    }, []);

    const debitCredits = useCallback(async (
        serviceType: CreditServiceType,
        description: string,
        metadata?: TransactionMetadata
    ): Promise<CreditOperationResult> => {
        try {
            setError(null);
            const result = await creditService.debitCredits({
                serviceType,
                description,
                metadata,
            });

            if (!result.success && result.error) {
                setError(result.error.message);
            } else {
                await refreshBalance();
                await refreshTransactions(10);
            }

            return result;
        } catch (err: any) {
            const errorResult: CreditOperationResult = {
                success: false,
                newBalance: balance?.totalCredits || 0,
                error: { code: 'UNKNOWN', message: err.message },
            };
            setError(err.message);
            onErrorRef.current?.(err);
            return errorResult;
        }
    }, [balance, refreshBalance]);

    const addCredits = useCallback(async (
        amount: number,
        description: string,
        options?: {
            type?: 'credit' | 'bonus' | 'adjustment';
            metadata?: TransactionMetadata;
        }
    ): Promise<CreditOperationResult> => {
        try {
            setError(null);
            const result = await creditService.addCredits({
                amount,
                description,
                type: options?.type || 'credit',
                metadata: options?.metadata,
            });

            if (!result.success && result.error) {
                setError(result.error.message);
            } else {
                await refreshBalance();
                await refreshTransactions(10);
            }

            return result;
        } catch (err: any) {
            const errorResult: CreditOperationResult = {
                success: false,
                newBalance: balance?.totalCredits || 0,
                error: { code: 'UNKNOWN', message: err.message },
            };
            setError(err.message);
            onErrorRef.current?.(err);
            return errorResult;
        }
    }, [balance, refreshBalance]);

    // ==========================================
    // CÁLCULOS
    // ==========================================

    const calculateCost = useCallback((
        serviceType: CreditServiceType,
        quantity: number,
        metadata?: TransactionMetadata
    ): CostCalculationResult => {
        return creditService.calculateCost({ serviceType, quantity, metadata });
    }, []);

    const checkSufficientBalance = useCallback(async (
        serviceType: CreditServiceType,
        quantity: number,
        metadata?: TransactionMetadata
    ): Promise<boolean> => {
        return creditService.checkSufficientBalance(serviceType, quantity, metadata);
    }, []);

    const getEstimatedCost = useCallback((
        serviceType: CreditServiceType,
        details: TransactionMetadata
    ): number => {
        let quantity = 1;

        if (serviceType.startsWith('ai_generation') && details.wordCount) {
            quantity = details.wordCount;
        } else if (details.recipientCount) {
            quantity = details.recipientCount;
        }

        const cost = creditService.calculateCost({ serviceType, quantity, metadata: details });
        return cost.finalPrice;
    }, []);

    // ==========================================
    // TRANSAÇÕES
    // ==========================================

    const getTransactions = useCallback(async (
        filters?: TransactionFilters,
        pagination?: PaginationOptions
    ): Promise<PaginatedResponse<CreditTransaction>> => {
        return creditService.getTransactions(filters, pagination);
    }, []);

    const refreshTransactions = useCallback(async (limit = 10) => {
        try {
            const result = await creditService.getTransactions(undefined, { page: 1, limit });
            setTransactions(result.data);
        } catch (err: any) {
            console.error('Erro ao atualizar transações:', err);
        }
    }, []);

    // ==========================================
    // ANALYTICS
    // ==========================================

    const getAnalytics = useCallback(async (
        startDate: Date,
        endDate: Date
    ): Promise<CreditAnalytics | null> => {
        return creditService.getAnalytics(startDate, endDate);
    }, []);

    // ==========================================
    // UTILITÁRIOS
    // ==========================================

    const formatCurrency = useCallback((value: number): string => {
        return creditService.formatCurrency(value);
    }, []);

    const formatNumber = useCallback((value: number): string => {
        return creditService.formatNumber(value);
    }, []);

    const getPricingModel = useCallback((serviceType: CreditServiceType): PricingModel | null => {
        return creditService.getPricingModel(serviceType);
    }, []);

    // ==========================================
    // PACOTES
    // ==========================================

    const getPackages = useCallback((): CreditPackage[] => {
        return creditService.getPackages();
    }, []);

    const getPackageById = useCallback((id: string): CreditPackage | null => {
        return creditService.getPackageById(id);
    }, []);

    // ==========================================
    // RETORNO
    // ==========================================

    return {
        // Estado
        balance,
        transactions,
        isLoading,
        error,
        isInitialized,

        // Dados estáticos
        packages: CREDIT_PACKAGES,
        pricingModels: PRICING_MODELS,

        // Operações de saldo
        refreshBalance,
        debitCredits,
        addCredits,

        // Cálculos
        calculateCost,
        checkSufficientBalance,

        // Transações
        getTransactions,
        refreshTransactions,

        // Analytics
        getAnalytics,

        // Utilitários
        formatCurrency,
        formatNumber,
        getPricingModel,
        getEstimatedCost,

        // Pacotes
        getPackages,
        getPackageById,

        // Serviço
        creditService,
    };
}

// ==========================================
// HOOKS AUXILIARES
// ==========================================

/**
 * Hook simples para obter apenas o saldo
 */
export function useCreditBalance() {
    const { balance, isLoading, refreshBalance } = useCredits({ autoRefresh: true });
    return { balance, isLoading, refresh: refreshBalance };
}

/**
 * Hook para verificar saldo antes de operação
 */
export function useCreditCheck(serviceType: CreditServiceType, quantity: number) {
    const { balance, checkSufficientBalance, calculateCost } = useCredits({ autoRefresh: false });
    const [hasSufficientBalance, setHasSufficientBalance] = useState(false);
    const [cost, setCost] = useState<CostCalculationResult | null>(null);

    useEffect(() => {
        const check = async () => {
            const sufficient = await checkSufficientBalance(serviceType, quantity);
            setHasSufficientBalance(sufficient);
            setCost(calculateCost(serviceType, quantity));
        };
        check();
    }, [serviceType, quantity, checkSufficientBalance, calculateCost]);

    return { hasSufficientBalance, cost, balance };
}

/**
 * Hook para analytics
 */
export function useCreditAnalytics(days: number = 30) {
    const { getAnalytics } = useCredits({ autoRefresh: false });
    const [analytics, setAnalytics] = useState<CreditAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const result = await getAnalytics(startDate, endDate);
            setAnalytics(result);
            setIsLoading(false);
        };
        fetch();
    }, [days, getAnalytics]);

    return { analytics, isLoading };
}

export default useCredits;
