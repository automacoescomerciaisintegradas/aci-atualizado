import React, { useState, useEffect } from 'react';
import { DollarSignIcon, ChevronLeftIcon, CheckCircleIcon, CreditCardIcon, SparklesIcon, CopyIcon, SpinnerIcon } from './Icons';
import { useSettings } from '../hooks/useSettings';
import type { Page } from '../App';
import { apiClient } from '../src/services/apiClient';
import { MercadoPagoBrick } from './MercadoPagoBrick';

interface CreditPurchasePageProps {
    onNavigate: (page: Page) => void;
    onPaymentSuccess?: (credits: number) => void;
}

type Step = 'valor' | 'metodo' | 'pagamento' | 'concluido';
type PaymentMethodType = 'pix' | 'card';

const PACKAGES = [
    { id: 'pack-50', value: 50.00, credits: 50000, label: 'Básico', price: 'R$ 50,00', popular: false },
    { id: 'pack-99', value: 99.00, credits: 100000, label: 'Padrão', price: 'R$ 99,00', popular: false },
    { id: 'pack-197', value: 197.00, credits: 200000, label: 'Pro', price: 'R$ 197,00', popular: true },
    { id: 'pack-397', value: 397.00, credits: 400000, label: 'Expert', price: 'R$ 397,00', popular: false },
    { id: 'pack-697', value: 697.00, credits: 700000, label: 'Agency', price: 'R$ 697,00', popular: false },
    { id: 'pack-999', value: 999.00, credits: 1000000, label: 'Ultimate', price: 'R$ 999,00', popular: false },
];

export const CreditPurchasePage: React.FC<CreditPurchasePageProps> = ({ onNavigate, onPaymentSuccess }) => {
    const { settings, addCreditTransaction } = useSettings();
    const [step, setStep] = useState<Step>('valor');
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [customValue, setCustomValue] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('pix');

    // Dados do PIX
    const [pixCode, setPixCode] = useState<string | null>(null);
    const [pixQrCode, setPixQrCode] = useState<string | null>(null);
    const [paymentId, setPaymentId] = useState<string | null>(null);
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<{ minutes: number; seconds: number }>({ minutes: 30, seconds: 0 });

    // Calcular valores
    const getSelectedValue = (): number => {
        if (selectedPackage === 'custom') {
            const val = parseFloat(customValue.replace(',', '.'));
            return isNaN(val) ? 0 : val;
        }
        const pkg = PACKAGES.find(p => p.id === selectedPackage);
        return pkg?.value || 0;
    };

    const value = getSelectedValue();
    const currentPkg = PACKAGES.find(p => p.id === selectedPackage);

    // Créditos fixos dos pacotes ou cálculo por Real para personalizado (1 Real = 1000 créditos)
    const baseCredits = selectedPackage === 'custom'
        ? Math.floor(value * 1000)
        : (currentPkg?.credits || 0);

    const bonusCredits = Math.floor(baseCredits * 0.10); // 10% de bônus fixo para todos
    const totalCredits = baseCredits + bonusCredits;

    // Timer do PIX
    useEffect(() => {
        if (!expiresAt) return;

        const interval = setInterval(() => {
            const now = new Date();
            const diff = expiresAt.getTime() - now.getTime();

            if (diff <= 0) {
                setTimeRemaining({ minutes: 0, seconds: 0 });
                clearInterval(interval);
                return;
            }

            setTimeRemaining({
                minutes: Math.floor(diff / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [expiresAt]);

    const handleCreatePixPayment = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await apiClient.createPixPayment(
                value,
                selectedPackage || undefined,
                `Recarga de ${totalCredits.toLocaleString('pt-BR')} créditos ACI`
            );

            if (!data.success) {
                throw new Error(data.error || 'Erro ao criar pagamento');
            }

            setPixCode(data.payment.pix.code);
            setPixQrCode(data.payment.pix.qrCodeBase64);
            setPaymentId(data.payment.id);
            setExpiresAt(new Date(data.payment.expiresAt));
            setStep('pagamento');
        } catch (err: any) {
            console.error('Erro ao criar PIX:', err);
            setError(err.message || 'Erro ao processar pagamento');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePaymentSelection = () => {
        if (value < 20) {
            setError('Valor mínimo: R$ 20,00');
            return;
        }
        setStep('metodo');
        setError(null);
    };

    const confirmPaymentMethod = () => {
        if (paymentMethod === 'pix') {
            handleCreatePixPayment();
        } else {
            setStep('pagamento'); // Vai renderizar o Brick
        }
    };

    // Copiar código PIX
    const handleCopyPix = () => {
        if (pixCode) {
            navigator.clipboard.writeText(pixCode);
        }
    };

    // Verificar status do pagamento
    const handleCheckStatus = async () => {
        if (!paymentId) return;

        setIsLoading(true);
        try {
            const data = await apiClient.getPaymentStatus(paymentId);

            if (data.status === 'approved') {
                setStep('concluido');
                if (addCreditTransaction) {
                    addCreditTransaction('purchase', totalCredits, `Compra de créditos - Pacote: ${currentPkg?.price || 'Personalizado'}`);
                }
                if (onPaymentSuccess) {
                    onPaymentSuccess(totalCredits);
                }
            }
        } catch (err) {
            console.error('Erro ao verificar status:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBrickPaymentResult = (result: any) => {
        if (result.status === 'approved') {
            setStep('concluido');
            if (addCreditTransaction) {
                addCreditTransaction('purchase', totalCredits, `Compra de créditos - Cartão`);
            }
            if (onPaymentSuccess) {
                onPaymentSuccess(totalCredits);
            }
        } else if (result.status === 'in_process') {
            // Pode mostrar aviso de que está em processamento
            alert('Pagamento em processamento. Os créditos serão adicionados assim que aprovado.');
        } else {
            setError('Pagamento não aprovado: ' + (result.status_detail || result.status));
        }
    };

    // Renderizar etapa
    const renderStep = () => {
        switch (step) {
            case 'valor':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-slate-100">Selecione um valor</h2>
                        </div>

                        {/* Banner de Promoção */}
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 glow-green/10">
                            <p className="text-green-400 font-bold leading-relaxed">
                                Promoção: Ganhe 10% de bônus em qualquer recarga!
                            </p>
                        </div>

                        {/* Pacotes */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                            {PACKAGES.map((pkg) => (
                                <button
                                    key={pkg.id}
                                    onClick={() => { setSelectedPackage(pkg.id); setCustomValue(''); }}
                                    className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300 group ${selectedPackage === pkg.id
                                        ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/10'
                                        : 'border-slate-800 bg-[#1a1f2e] hover:border-slate-700'
                                        }`}
                                >
                                    {pkg.popular && (
                                        <div className="absolute -top-3 px-2 py-0.5 bg-yellow-500 text-dark-text-primary text-[10px] font-bold rounded-full flex items-center gap-1 shadow-lg z-10">
                                            <span>👑</span> Top
                                        </div>
                                    )}
                                    <span className="text-sm font-bold text-slate-300 mb-1">{pkg.label}</span>
                                    <div className="mb-2 text-center">
                                        <div className={`text-xl font-bold ${selectedPackage === pkg.id ? 'text-purple-400' : 'text-purple-500'}`}>
                                            R$ {pkg.value.toString().split('.')[0]}
                                        </div>
                                    </div>
                                    <div className="text-center text-xs text-slate-400">
                                        {(pkg.credits / 1000).toFixed(0)}k créditos
                                    </div>

                                    {/* Círculo Seletor */}
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-3 transition-all ${selectedPackage === pkg.id ? 'border-purple-500' : 'border-slate-600'
                                        }`}>
                                        {selectedPackage === pkg.id && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Valor Personalizado */}
                        <div className="pt-4">
                            <h3 className="text-base font-bold text-slate-200 mb-2">Ou digite outro valor</h3>
                            <input
                                type="text"
                                placeholder="R$ 0,00"
                                value={customValue}
                                onChange={(e) => {
                                    setCustomValue(e.target.value);
                                    setSelectedPackage('custom');
                                }}
                                onFocus={() => setSelectedPackage('custom')}
                                className="w-full bg-[#1a2030] border border-slate-800 rounded-xl p-4 text-slate-200 focus:border-purple-500/50 outline-none transition-all"
                            />
                            <p className="text-xs text-slate-500 mt-2">Mínimo: R$ 50,00</p>
                        </div>

                        {/* Resumo */}
                        {value > 0 && (
                            <div className="text-center bg-purple-600/5 rounded-xl p-4 border border-purple-500/10">
                                <p className="text-sm text-slate-400">
                                    Total: <span className="text-white font-bold">{totalCredits.toLocaleString('pt-BR')} créditos</span>
                                    {' '}(incluindo bônus)
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center">
                                {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4">
                            <button onClick={() => onNavigate('home')} className="px-6 py-3 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                            <button
                                onClick={handlePaymentSelection}
                                disabled={value < 20}
                                className="px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Continuar
                            </button>
                        </div>
                    </div>
                );

            case 'metodo':
                return (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white mb-4">Escolha a forma de pagamento</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setPaymentMethod('pix')}
                                className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 ${paymentMethod === 'pix' ? 'border-green-500 bg-green-500/10' : 'border-slate-800 bg-[#1a1f2e] hover:bg-[#252b3d]'
                                    }`}
                            >
                                <div className="text-3xl">💠</div>
                                <div className="text-lg font-bold text-white">PIX</div>
                                <div className="text-sm text-slate-400">Aprovação imediata</div>
                            </button>

                            <button
                                onClick={() => setPaymentMethod('card')}
                                className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-4 ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-[#1a1f2e] hover:bg-[#252b3d]'
                                    }`}
                            >
                                <div className="text-3xl">💳</div>
                                <div className="text-lg font-bold text-white">Cartão de Crédito</div>
                                <div className="text-sm text-slate-400">Até 12x</div>
                            </button>
                        </div>

                        <div className="flex justify-between pt-6">
                            <button onClick={() => setStep('valor')} className="text-slate-400 hover:text-white">Voltar</button>
                            <button
                                onClick={confirmPaymentMethod}
                                className="px-8 py-3 bg-brand-primary hover:bg-brand-primary/90 text-white font-bold rounded-xl transition-all"
                            >
                                Confirmar Pagamento
                            </button>
                        </div>
                    </div>
                );

            case 'pagamento':
                if (paymentMethod === 'pix') {
                    return (
                        <div className="space-y-6 text-center">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Pagamento via PIX</h3>
                                <p className="text-dark-text-secondary text-sm">Escaneie o QR Code ou copie o código</p>
                            </div>

                            <div className="text-amber-400 text-sm">
                                ⏱️ Expira em {timeRemaining.minutes}:{timeRemaining.seconds.toString().padStart(2, '0')}
                            </div>

                            {pixQrCode && (
                                <div className="flex justify-center">
                                    <div className="bg-white p-4 rounded-2xl">
                                        <img src={`data:image/png;base64,${pixQrCode}`} alt="QR Code PIX" className="w-64 h-64" />
                                    </div>
                                </div>
                            )}

                            {pixCode && (
                                <div className="flex gap-2">
                                    <input type="text" value={pixCode} readOnly className="flex-1 bg-dark-card border border-dark-border rounded-xl p-3 text-white text-sm font-mono truncate" />
                                    <button onClick={handleCopyPix} className="px-4 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center gap-2"><CopyIcon className="h-4 w-4" /> Copiar</button>
                                </div>
                            )}

                            <button onClick={handleCheckStatus} disabled={isLoading} className="w-full py-4 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl flex items-center justify-center gap-2">
                                {isLoading ? <SpinnerIcon className="h-5 w-5 animate-spin" /> : 'Já paguei - Verificar'}
                            </button>

                            <button onClick={() => setStep('metodo')} className="text-sm text-dark-text-secondary hover:text-white">← Voltar</button>
                        </div>
                    );
                } else {
                    return (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-white">Pagamento com Cartão</h3>
                                <button onClick={() => setStep('metodo')} className="text-sm text-slate-400 hover:text-white">Trocar método</button>
                            </div>

                            <div className="bg-[#1a1f2e] p-6 rounded-xl border border-slate-700">
                                <MercadoPagoBrick
                                    amount={value}
                                    description={`Compra de ${totalCredits} créditos`}
                                    onPaymentResult={handleBrickPaymentResult}
                                    onError={(err) => setError('Erro no pagamento: ' + JSON.stringify(err))}
                                />
                            </div>

                            {error && (
                                <div className="text-red-400 text-center text-sm mt-4">{error}</div>
                            )}
                        </div>
                    );
                }

            case 'concluido':
                return (
                    <div className="text-center space-y-6 py-8">
                        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                            <CheckCircleIcon className="h-10 w-10 text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Pagamento Aprovado! 🎉</h3>
                            <p className="text-dark-text-secondary">Seus créditos já foram adicionados à sua conta.</p>
                        </div>
                        <div className="glass rounded-xl p-6 border border-green-500/20">
                            <div className="text-sm text-dark-text-secondary mb-2">Créditos adicionados</div>
                            <div className="text-4xl font-bold text-green-400">+{totalCredits.toLocaleString('pt-BR')}</div>
                            <div className="text-sm text-dark-text-secondary mt-2">Novo saldo: {(settings.credits + totalCredits).toLocaleString('pt-BR')} créditos</div>
                        </div>
                        <button onClick={() => onNavigate('home')} className="w-full gradient-primary text-white font-bold py-4 rounded-xl hover:brightness-110 transition-all">Voltar ao Dashboard</button>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => step === 'valor' ? onNavigate('home') : setStep('valor')} className="glass hover:bg-white/10 p-2.5 rounded-xl text-dark-text-secondary transition-all">
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <DollarSignIcon className="h-6 w-6 text-brand-primary" />
                        Créditos & Planos
                    </h1>
                    <p className="text-sm text-dark-text-secondary">Recarregue sua conta para continuar usando as ferramentas.</p>
                </div>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-center gap-4 mb-8">
                {[
                    { id: 'valor', label: '1. Valor' },
                    { id: 'metodo', label: '2. Método' },
                    { id: 'pagamento', label: '3. Pagamento' },
                    { id: 'concluido', label: '4. Concluído' },
                ].map((s, index) => (
                    <div key={s.id} className={`flex items-center gap-2 ${step === s.id ? 'text-white font-bold' : 'text-slate-600'}`}>
                        <span className={`${step === s.id ? 'text-brand-primary' : ''}`}>{s.label}</span>
                        {index < 3 && <span className="text-slate-700">→</span>}
                    </div>
                ))}
            </div>

            <div className="card-premium p-6 md:p-8">
                {renderStep()}
            </div>
        </div>
    );
};

export default CreditPurchasePage;
