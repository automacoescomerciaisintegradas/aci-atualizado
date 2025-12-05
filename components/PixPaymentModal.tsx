/**
 * =========================================
 * ACI - Modal de Pagamento PIX
 * =========================================
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { pixPaymentService, PixPaymentResponse, PaymentStatus } from '../services/pixPaymentService';
import { CreditPackage } from '../types/credit';
import {
    XIcon,
    CheckCircleIcon,
    CreditIcon,
    SparklesIcon,
} from './Icons';

// ==========================================
// TIPOS
// ==========================================

interface PixPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    package: CreditPackage;
    onPaymentSuccess?: (credits: number) => void;
    onPaymentFailed?: (reason: string) => void;
}

type PaymentStep = 'loading' | 'qrcode' | 'processing' | 'success' | 'error' | 'expired';

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const PixPaymentModal: React.FC<PixPaymentModalProps> = ({
    isOpen,
    onClose,
    package: pkg,
    onPaymentSuccess,
    onPaymentFailed,
}) => {
    // Estado
    const [step, setStep] = useState<PaymentStep>('loading');
    const [paymentData, setPaymentData] = useState<PixPaymentResponse | null>(null);
    const [timeRemaining, setTimeRemaining] = useState({ minutes: 30, seconds: 0 });
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Refs
    const pollingRef = useRef<boolean>(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // ==========================================
    // CRIAR PAGAMENTO
    // ==========================================

    const createPayment = useCallback(async () => {
        setStep('loading');
        setError(null);

        try {
            const response = await pixPaymentService.createPixPayment({
                amount: pkg.price,
                packageId: pkg.id,
                description: `ACI Créditos - Pacote ${pkg.name}`,
                creditsAmount: pkg.credits,
                bonusCredits: pkg.bonusCredits,
            });

            if (!response.success || !response.pixCode) {
                setError(response.error?.message || 'Erro ao gerar pagamento PIX');
                setStep('error');
                return;
            }

            setPaymentData(response);
            setStep('qrcode');

            // Iniciar polling de status
            startPolling(response.paymentId!, response.transactionId!);

        } catch (err: any) {
            console.error('Erro ao criar pagamento:', err);
            setError(err.message || 'Erro ao processar pagamento');
            setStep('error');
        }
    }, [pkg]);

    // ==========================================
    // POLLING DE STATUS
    // ==========================================

    const startPolling = useCallback((paymentId: string, transactionId: string) => {
        if (pollingRef.current) return;
        pollingRef.current = true;

        const checkStatus = async () => {
            if (!pollingRef.current) return;

            try {
                const status = await pixPaymentService.getPaymentStatus(paymentId);

                if (status?.status === 'approved') {
                    pollingRef.current = false;
                    setStep('success');
                    onPaymentSuccess?.(pkg.totalCredits);
                    return;
                }

                if (status?.status === 'rejected' || status?.status === 'cancelled') {
                    pollingRef.current = false;
                    setStep('error');
                    setError('Pagamento rejeitado ou cancelado');
                    onPaymentFailed?.(status.statusDetail || 'Pagamento não aprovado');
                    return;
                }

                // Continuar verificando a cada 5 segundos
                if (pollingRef.current) {
                    setTimeout(checkStatus, 5000);
                }
            } catch (err) {
                console.error('Erro no polling:', err);
                // Continuar tentando
                if (pollingRef.current) {
                    setTimeout(checkStatus, 10000);
                }
            }
        };

        // Primeira verificação após 10 segundos
        setTimeout(checkStatus, 10000);
    }, [pkg, onPaymentSuccess, onPaymentFailed]);

    // ==========================================
    // TIMER DE EXPIRAÇÃO
    // ==========================================

    useEffect(() => {
        if (step !== 'qrcode' || !paymentData?.expiresAt) return;

        const updateTimer = () => {
            const remaining = pixPaymentService.getTimeRemaining(new Date(paymentData.expiresAt!));
            setTimeRemaining(remaining);

            if (remaining.expired) {
                setStep('expired');
                pollingRef.current = false;
                onPaymentFailed?.('Tempo expirado');
            }
        };

        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [step, paymentData, onPaymentFailed]);

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    useEffect(() => {
        if (isOpen) {
            createPayment();
        }

        return () => {
            pollingRef.current = false;
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [isOpen, createPayment]);

    // ==========================================
    // COPIAR CÓDIGO PIX
    // ==========================================

    const handleCopyPixCode = async () => {
        if (!paymentData?.pixCode) return;

        try {
            await navigator.clipboard.writeText(paymentData.pixCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error('Erro ao copiar:', err);
        }
    };

    // ==========================================
    // FECHAR MODAL
    // ==========================================

    const handleClose = () => {
        pollingRef.current = false;
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
        onClose();
    };

    // ==========================================
    // RENDER
    // ==========================================

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <PixIcon className="w-6 h-6" />
                        Pagamento PIX
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-dark-text-secondary hover:text-white"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Content por step */}
                {step === 'loading' && <LoadingStep />}
                {step === 'qrcode' && paymentData && (
                    <QRCodeStep
                        paymentData={paymentData}
                        pkg={pkg}
                        timeRemaining={timeRemaining}
                        copied={copied}
                        onCopy={handleCopyPixCode}
                    />
                )}
                {step === 'processing' && <ProcessingStep />}
                {step === 'success' && <SuccessStep pkg={pkg} onClose={handleClose} />}
                {step === 'error' && <ErrorStep error={error} onRetry={createPayment} onClose={handleClose} />}
                {step === 'expired' && <ExpiredStep onRetry={createPayment} onClose={handleClose} />}
            </div>
        </div>
    );
};

// ==========================================
// STEP COMPONENTS
// ==========================================

const LoadingStep: React.FC = () => (
    <div className="text-center py-12">
        <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-purple-500 rounded-full animate-spin" />
            <PixIcon className="absolute inset-0 m-auto w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Gerando PIX...</h3>
        <p className="text-dark-text-secondary text-sm">Aguarde enquanto preparamos seu pagamento</p>
    </div>
);

interface QRCodeStepProps {
    paymentData: PixPaymentResponse;
    pkg: CreditPackage;
    timeRemaining: { minutes: number; seconds: number };
    copied: boolean;
    onCopy: () => void;
}

const QRCodeStep: React.FC<QRCodeStepProps> = ({ paymentData, pkg, timeRemaining, copied, onCopy }) => (
    <div className="space-y-6">
        {/* Valor e pacote */}
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-dark-text-secondary">Pacote</p>
                    <p className="font-bold text-white">{pkg.name}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-dark-text-secondary">Valor</p>
                    <p className="text-2xl font-bold text-green-400">
                        {pixPaymentService.formatCurrency(pkg.price)}
                    </p>
                </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center">
                <span className="text-sm text-dark-text-secondary">Você receberá:</span>
                <span className="font-bold text-purple-400">
                    {pixPaymentService.formatCurrency(pkg.totalCredits)} em créditos
                </span>
            </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-xl p-4 flex items-center justify-center">
            {paymentData.pixQrCode ? (
                <img
                    src={paymentData.pixQrCode}
                    alt="QR Code PIX"
                    className="w-48 h-48"
                />
            ) : (
                <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400">QR Code</span>
                </div>
            )}
        </div>

        {/* Timer */}
        <div className="text-center">
            <p className="text-sm text-dark-text-secondary mb-1">Expira em</p>
            <p className={`text-2xl font-mono font-bold ${timeRemaining.minutes < 5 ? 'text-red-400' : 'text-white'
                }`}>
                {String(timeRemaining.minutes).padStart(2, '0')}:{String(timeRemaining.seconds).padStart(2, '0')}
            </p>
        </div>

        {/* Código PIX */}
        <div>
            <p className="text-sm text-dark-text-secondary mb-2">Ou copie o código PIX:</p>
            <div className="relative">
                <input
                    type="text"
                    value={paymentData.pixCode || ''}
                    readOnly
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 pr-24 text-white text-sm font-mono truncate"
                />
                <button
                    onClick={onCopy}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg font-medium text-sm transition-all ${copied
                            ? 'bg-green-600 text-white'
                            : 'bg-purple-600 hover:bg-purple-500 text-white'
                        }`}
                >
                    {copied ? '✓ Copiado' : 'Copiar'}
                </button>
            </div>
        </div>

        {/* Instruções */}
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-300 mb-2">📱 Como pagar:</h4>
            <ol className="text-sm text-blue-200/80 space-y-1 list-decimal list-inside">
                <li>Abra o app do seu banco</li>
                <li>Escolha pagar com PIX</li>
                <li>Escaneie o QR code ou cole o código</li>
                <li>Confirme o pagamento</li>
            </ol>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 justify-center text-dark-text-secondary">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-sm">Aguardando pagamento...</span>
        </div>
    </div>
);

const ProcessingStep: React.FC = () => (
    <div className="text-center py-12">
        <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-yellow-500/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-transparent border-t-yellow-500 rounded-full animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Processando pagamento...</h3>
        <p className="text-dark-text-secondary text-sm">Confirmando transação com o banco</p>
    </div>
);

interface SuccessStepProps {
    pkg: CreditPackage;
    onClose: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({ pkg, onClose }) => (
    <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircleIcon className="w-12 h-12 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Pagamento Aprovado!</h3>
        <p className="text-dark-text-secondary mb-6">
            Seus <strong className="text-purple-400">{pixPaymentService.formatCurrency(pkg.totalCredits)}</strong> créditos
            foram adicionados à sua conta.
        </p>

        <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl p-4 border border-purple-500/30 mb-6">
            <div className="flex items-center justify-center gap-3">
                <CreditIcon className="w-8 h-8 text-purple-400" />
                <div className="text-left">
                    <p className="text-sm text-dark-text-secondary">Créditos adicionados</p>
                    <p className="text-2xl font-bold text-white">+{pixPaymentService.formatCurrency(pkg.totalCredits)}</p>
                </div>
            </div>
        </div>

        <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2"
        >
            <SparklesIcon className="w-5 h-5" />
            Começar a Usar
        </button>
    </div>
);

interface ErrorStepProps {
    error: string | null;
    onRetry: () => void;
    onClose: () => void;
}

const ErrorStep: React.FC<ErrorStepProps> = ({ error, onRetry, onClose }) => (
    <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
            <XIcon className="w-12 h-12 text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Erro no Pagamento</h3>
        <p className="text-dark-text-secondary mb-6">
            {error || 'Ocorreu um erro ao processar seu pagamento.'}
        </p>
        <div className="flex gap-3">
            <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
            >
                Cancelar
            </button>
            <button
                onClick={onRetry}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all"
            >
                Tentar Novamente
            </button>
        </div>
    </div>
);

interface ExpiredStepProps {
    onRetry: () => void;
    onClose: () => void;
}

const ExpiredStep: React.FC<ExpiredStepProps> = ({ onRetry, onClose }) => (
    <div className="text-center py-8">
        <div className="w-20 h-20 mx-auto mb-6 bg-amber-500/20 rounded-full flex items-center justify-center">
            <span className="text-4xl">⏰</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">PIX Expirado</h3>
        <p className="text-dark-text-secondary mb-6">
            O tempo para pagamento expirou. Gere um novo código para continuar.
        </p>
        <div className="flex gap-3">
            <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
            >
                Cancelar
            </button>
            <button
                onClick={onRetry}
                className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-all"
            >
                Gerar Novo PIX
            </button>
        </div>
    </div>
);

// ==========================================
// PIX ICON
// ==========================================

const PixIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 512 512" className={className} fill="currentColor">
        <path d="M242.4 292.5C247.8 287.1 257.1 287.1 262.5 292.5L339.5 369.5C353.7 383.7 372.6 391.5 392.6 391.5H407.7L310.6 488.6C280.3 518.9 231.1 518.9 200.8 488.6L103.3 391.2H112.6C132.6 391.2 151.5 383.4 165.7 369.2L242.4 292.5zM262.5 218.9C257.1 224.4 247.9 224.5 242.4 218.9L165.7 142.2C151.5 128 132.6 120.2 112.6 120.2H103.3L200.7 22.76C231.1-7.586 280.3-7.586 310.6 22.76L407.8 120H392.6C372.6 120 353.7 127.8 339.5 142L262.5 218.9zM112.6 142.7C126.4 142.7 139.1 148.3 149.7 158.1L226.4 234.8C233.6 241.1 243 245.6 252.5 245.6C## 245.6 268.6 241.1 275.9 234.8L199.2 158.1C## 148.3 126.4 142.7 112.6 142.7H80.89L24.22 199.4C-7.586 231.2-7.586 280.4 24.22 312.2L80.89 368.9H112.6C126.4 368.9 139.1 363.3 149.7 353.5L226.4 276.8C233.6 269.6 243 265.1 252.5 265.1C## 265.1 268.6 269.6 275.9 276.8L352.6 353.5C363.2 364.1 376.6 368.9 390.4 368.9H430.3L486.9 312.2C518.9 280.4 518.9 231.2 486.9 199.4L430.3 142.7H390.4C376.6 142.7 363.2 147.5 352.6 158.1L275.9 234.8C268.6 241.1 262 245.6 252.5 245.6C243 245.6 233.6 241.1 226.4 234.8L149.7 158.1C139.1 148.3 126.4 142.7 112.6 142.7z" />
    </svg>
);

export default PixPaymentModal;
