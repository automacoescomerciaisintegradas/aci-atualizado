/**
 * =========================================
 * ACI - Hook de Pagamento PIX
 * =========================================
 */

import { useState, useCallback } from 'react';
import { pixPaymentService, PixPaymentResponse, PaymentStatus } from '../services/pixPaymentService';
import { CreditPackage } from '../types/credit';

// ==========================================
// TIPOS
// ==========================================

export interface UsePixPaymentOptions {
    onSuccess?: (credits: number, transactionId: string) => void;
    onError?: (error: string) => void;
    onExpired?: () => void;
}

export interface UsePixPaymentReturn {
    // Estado
    isProcessing: boolean;
    paymentData: PixPaymentResponse | null;
    error: string | null;
    status: 'idle' | 'creating' | 'waiting' | 'processing' | 'success' | 'error' | 'expired';

    // Ações
    initiatePayment: (pkg: CreditPackage) => Promise<PixPaymentResponse | null>;
    checkStatus: () => Promise<PaymentStatus | null>;
    cancelPayment: () => void;
    reset: () => void;

    // Utilitários
    formatCurrency: (value: number) => string;
    getTimeRemaining: (expiresAt: Date) => { minutes: number; seconds: number; expired: boolean };
    copyPixCode: () => Promise<boolean>;
}

// ==========================================
// HOOK
// ==========================================

export function usePixPayment(options: UsePixPaymentOptions = {}): UsePixPaymentReturn {
    const { onSuccess, onError, onExpired } = options;

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentData, setPaymentData] = useState<PixPaymentResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<UsePixPaymentReturn['status']>('idle');

    // Iniciar pagamento
    const initiatePayment = useCallback(async (pkg: CreditPackage): Promise<PixPaymentResponse | null> => {
        try {
            setIsProcessing(true);
            setError(null);
            setStatus('creating');

            const response = await pixPaymentService.createPixPayment({
                amount: pkg.price,
                packageId: pkg.id,
                description: `ACI Créditos - Pacote ${pkg.name}`,
                creditsAmount: pkg.credits,
                bonusCredits: pkg.bonusCredits,
            });

            if (!response.success || !response.pixCode) {
                const errorMsg = response.error?.message || 'Erro ao gerar pagamento PIX';
                setError(errorMsg);
                setStatus('error');
                onError?.(errorMsg);
                return null;
            }

            setPaymentData(response);
            setStatus('waiting');
            return response;
        } catch (err: any) {
            const errorMsg = err.message || 'Erro ao processar pagamento';
            setError(errorMsg);
            setStatus('error');
            onError?.(errorMsg);
            return null;
        } finally {
            setIsProcessing(false);
        }
    }, [onError]);

    // Verificar status do pagamento
    const checkStatus = useCallback(async (): Promise<PaymentStatus | null> => {
        if (!paymentData?.paymentId) return null;

        try {
            const paymentStatus = await pixPaymentService.getPaymentStatus(paymentData.paymentId);

            if (paymentStatus?.status === 'approved') {
                setStatus('success');
                const credits = paymentStatus.creditsAmount;
                onSuccess?.(credits, paymentData.transactionId || '');
            } else if (paymentStatus?.status === 'rejected' || paymentStatus?.status === 'cancelled') {
                setStatus('error');
                setError('Pagamento rejeitado');
                onError?.(paymentStatus.statusDetail || 'Pagamento rejeitado');
            }

            return paymentStatus;
        } catch (err) {
            console.error('Erro ao verificar status:', err);
            return null;
        }
    }, [paymentData, onSuccess, onError]);

    // Cancelar pagamento (limpar estado)
    const cancelPayment = useCallback(() => {
        setPaymentData(null);
        setError(null);
        setStatus('idle');
    }, []);

    // Reset completo
    const reset = useCallback(() => {
        setIsProcessing(false);
        setPaymentData(null);
        setError(null);
        setStatus('idle');
    }, []);

    // Copiar código PIX
    const copyPixCode = useCallback(async (): Promise<boolean> => {
        if (!paymentData?.pixCode) return false;

        try {
            await navigator.clipboard.writeText(paymentData.pixCode);
            return true;
        } catch (err) {
            console.error('Erro ao copiar:', err);
            return false;
        }
    }, [paymentData]);

    return {
        isProcessing,
        paymentData,
        error,
        status,
        initiatePayment,
        checkStatus,
        cancelPayment,
        reset,
        formatCurrency: pixPaymentService.formatCurrency.bind(pixPaymentService),
        getTimeRemaining: pixPaymentService.getTimeRemaining.bind(pixPaymentService),
        copyPixCode,
    };
}

export default usePixPayment;
