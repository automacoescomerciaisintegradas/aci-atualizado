import React, { useState, useEffect } from 'react';
import { X, Check, Copy, ChevronLeft, Shield, Smartphone, ArrowRight, Zap, Loader2 } from 'lucide-react';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialPackage?: {
        id: string;
        price: number;
        credits: number;
        bonus: number;
        total: number;
    } | null;
}

interface PixResponse {
    success: boolean;
    payment: {
        id: string;
        status: string;
        amount: number;
        credits: number;
        pix: {
            code: string;
            qrCodeBase64: string;
            ticketUrl: string;
        };
        expiresAt: string;
    };
    error?: string;
}

interface PaymentStatusResponse {
    id: number;
    status: string;
    statusDetail: string;
    amount: number;
    paidAt: string | null;
}

type CheckoutStep = 'value' | 'data' | 'payment' | 'success';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, initialPackage }) => {
    const [step, setStep] = useState<CheckoutStep>('value');
    const [selectedPackage, setSelectedPackage] = useState(initialPackage);
    const [customAmount, setCustomAmount] = useState<number>(50);
    const [isLoading, setIsLoading] = useState(false);
    const [pixData, setPixData] = useState<{
        id: string;
        qrCode: string;
        qrCodeBase64: string;
        expiresAt: string;
    } | null>(null);
    const [timer, setTimer] = useState(1800); // 30 minutos em segundos
    const [copied, setCopied] = useState(false);
    const [customerEmail, setCustomerEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    // Resetar quando abrir
    useEffect(() => {
        if (isOpen) {
            setStep(initialPackage ? 'data' : 'value');
            setSelectedPackage(initialPackage);
            setPixData(null);
            setTimer(1800);
            const cachedEmail = localStorage.getItem('userEmail') || '';
            setCustomerEmail(cachedEmail);
            setEmailError('');
        }
    }, [isOpen, initialPackage]);

    // Timer do PIX
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 'payment' && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    // Verificar status do pagamento periodicamente
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (step === 'payment' && pixData?.id) {
            interval = setInterval(async () => {
                try {
                    const response = await fetch(`${window.location.origin}/api/payments/status/${pixData.id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                        }
                    });
                    const data = await response.json() as PaymentStatusResponse;
                    if (data.status === 'approved') {
                        setStep('success');
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error('Erro ao verificar status:', error);
                }
            }, 5000); // Verifica a cada 5 segundos
        }
        return () => clearInterval(interval);
    }, [step, pixData]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const handleCreatePix = async () => {
        const normalizedEmail = customerEmail.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!normalizedEmail) {
            setEmailError('E-mail é obrigatório para gerar o PIX.');
            return;
        }
        if (!emailRegex.test(normalizedEmail)) {
            setEmailError('Digite um e-mail válido.');
            return;
        }

        setIsLoading(true);
        try {
            const amount = selectedPackage ? selectedPackage.price : customAmount;
            const packageId = selectedPackage?.id || 'custom';

            const response = await fetch(`${window.location.origin}/api/payments/create-pix`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    amount,
                    packageId,
                    description: `Recarga de Créditos ACI`,
                    customerEmail: normalizedEmail
                })
            });

            const data = await response.json() as PixResponse;
            if (data.success) {
                setPixData({
                    id: data.payment.id,
                    qrCode: data.payment.pix.code,
                    qrCodeBase64: data.payment.pix.qrCodeBase64,
                    expiresAt: data.payment.expiresAt
                });
                setStep('payment');
                setTimer(1800);
            } else {
                alert(data.error || 'Erro ao gerar PIX');
            }
        } catch (error) {
            console.error('Erro ao processar PIX:', error);
            alert('Falha na conexão com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (pixData?.qrCode) {
            navigator.clipboard.writeText(pixData.qrCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#0a0b0d]/80 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-xl my-8 bg-[#16181d] rounded-[2.5rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Close/Back */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    {step !== 'value' && step !== 'success' && (
                        <button onClick={() => setStep('value')} className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm font-bold">Voltar</span>
                        </button>
                    )}
                    <div className="text-white font-black tracking-tighter text-xl mx-auto">
                        {step === 'success' ? 'Recarga Concluída' : 'Checkout ACI'}
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-white p-2 bg-white/5 rounded-full transition-all">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Steps Progress */}
                {step !== 'success' && (
                    <div className="flex px-8 py-4 gap-2">
                        {['value', 'data', 'payment'].map((s, i) => (
                            <div key={s} className="flex-1 h-1 rounded-full relative overflow-hidden bg-white/5">
                                <div
                                    className={`absolute inset-0 bg-purple-500 transition-all duration-500 ${step === s || (i === 0 && step !== 'value') || (i === 1 && step === 'payment')
                                            ? 'translate-x-0' : '-translate-x-full'
                                        }`}
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="p-8 md:p-10">
                    {/* STEP 1: VALOR */}
                    {step === 'value' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-2xl font-bold text-white mb-6">Escolha o Valor</h2>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {[50, 100, 200, 500].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => {
                                            setCustomAmount(val);
                                            setSelectedPackage(null);
                                        }}
                                        className={`p-4 rounded-2xl border transition-all text-center ${customAmount === val && !selectedPackage
                                                ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg'
                                                : 'bg-white/5 border-white/10 text-slate-400'
                                            }`}
                                    >
                                        <div className="text-xs font-black uppercase mb-1">Recarga</div>
                                        <div className="text-xl font-black">R$ {val}</div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setStep('data')}
                                className="w-full h-16 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 text-lg"
                            >
                                Continuar <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* STEP 2: DADOS */}
                    {step === 'data' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <h2 className="text-2xl font-bold text-white mb-2">Confirme seus Dados</h2>
                            <p className="text-slate-500 mb-8 font-medium">Os créditos serão adicionados à sua conta logada.</p>

                            <div className="space-y-6 mb-10">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                                        E-mail para entrega dos créditos
                                    </label>
                                    <input
                                        type="email"
                                        value={customerEmail}
                                        onChange={(e) => {
                                            setCustomerEmail(e.target.value);
                                            if (emailError) setEmailError('');
                                        }}
                                        placeholder="seuemail@dominio.com"
                                        className="w-full h-12 px-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50"
                                    />
                                    {emailError && (
                                        <p className="mt-2 text-xs text-red-400">{emailError}</p>
                                    )}
                                </div>
                                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs font-black text-slate-500 uppercase mb-1">Recarga Selecionada</div>
                                        <div className="text-xl font-black text-white">
                                            R$ {(selectedPackage?.price || customAmount).toFixed(2).replace('.', ',')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black text-emerald-500 uppercase mb-1">+10% Bônus</div>
                                        <div className="text-emerald-400 font-bold">
                                            +{((selectedPackage?.total || customAmount * 1100) - (selectedPackage?.credits || customAmount * 1000)).toLocaleString('pt-BR')} créditos
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                                    <Shield className="w-6 h-6 text-blue-400 flex-shrink-0" />
                                    <p className="text-sm text-slate-300">Pagamento processado com segurança via Mercado Pago.</p>
                                </div>
                            </div>

                            <button
                                onClick={handleCreatePix}
                                disabled={isLoading}
                                className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Gerar QR Code PIX <Zap className="w-5 h-5" /></>}
                            </button>
                        </div>
                    )}

                    {/* STEP 3: PAGAMENTO (PIX) */}
                    {step === 'payment' && pixData && (
                        <div className="text-center animate-in fade-in zoom-in-95 duration-500">
                            <h2 className="text-2xl font-bold text-white mb-2">Quase lá!</h2>
                            <p className="text-slate-500 mb-8 font-medium">Escaneie o QR Code ou copie a chave PIX.</p>

                            <div className="bg-white p-6 rounded-[2.5rem] mb-8 inline-block shadow-[0_0_50px_rgba(255,255,255,0.05)] border-4 border-emerald-500/20 relative group">
                                <img
                                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                                    alt="QR Code PIX"
                                    className="w-48 h-48 md:w-56 md:h-56 mix-blend-multiply"
                                />
                                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2.2rem]">
                                    <Smartphone className="w-10 h-10 text-slate-900 animate-bounce" />
                                </div>
                            </div>

                            <div className="mb-8">
                                <div className="text-4xl font-black text-white mb-2 tabular-nums">{formatTime(timer)}</div>
                                <div className="text-xs font-black text-slate-500 uppercase tracking-widest">Tempo Restante</div>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={copyToClipboard}
                                    className="w-full h-16 bg-white/5 border border-white/10 hover:border-emerald-500/50 text-white font-bold rounded-2xl flex items-center justify-between px-6 transition-all group"
                                >
                                    <span className="truncate max-w-[250px] text-slate-400 text-xs font-medium">{pixData.qrCode}</span>
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        <span className="text-xs uppercase font-black">{copied ? 'Copiado!' : 'Copiar Chave'}</span>
                                    </div>
                                </button>

                                <div className="flex items-center justify-center gap-2 text-slate-500 py-4">
                                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                                    <span className="text-sm font-medium animate-pulse">Aguardando confirmação automática...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: CONCLUÍDO */}
                    {step === 'success' && (
                        <div className="text-center animate-in fade-in zoom-in-95 duration-700">
                            <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                                <Check className="w-12 h-12 text-emerald-400" />
                            </div>
                            <h2 className="text-4xl font-black text-white mb-4">Pagamento Confirmado!</h2>
                            <p className="text-slate-400 text-lg mb-10 max-w-sm mx-auto font-medium">Seus créditos já foram adicionados e estão prontos para uso.</p>

                            <div className="bg-emerald-500/5 rounded-3xl p-8 border border-emerald-500/20 mb-10">
                                <div className="text-sm font-black text-emerald-500/60 uppercase mb-2">Novo Saldo</div>
                                <div className="text-5xl font-black text-white tracking-tighter">
                                    {(selectedPackage?.total || customAmount * 1100).toLocaleString('pt-BR')}
                                    <span className="text-lg text-slate-500 ml-2">credits</span>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full h-16 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all text-lg shadow-xl"
                            >
                                Começar a Usar
                            </button>
                            <button
                                onClick={() => {
                                    onClose();
                                    window.location.href = '/?page=product-search';
                                }}
                                className="w-full mt-3 h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all text-sm shadow-xl uppercase tracking-wide"
                            >
                                Buscar Produtos Agora
                            </button>
                            <p className="mt-3 text-center text-xs text-slate-400">
                                CADA CLIQUE NO BOTÃO BUSCAR CONSOME <strong className="text-amber-300">R$0,09</strong> EM CRÉDITOS.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Safe Badges */}
                {step !== 'success' && (
                    <div className="p-8 bg-black/20 flex items-center justify-center gap-8 border-t border-white/5 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <img src="https://logopng.com.br/logos/pix-106.png" alt="Pix" className="h-6" />
                        <img src="https://logodownload.org/wp-content/uploads/2016/08/mercado-pago-logo-0.png" alt="Mercado Pago" className="h-4" />
                        <div className="flex items-center gap-2 text-white font-bold text-[10px] uppercase tracking-widest">
                            <Shield className="w-3 h-3" /> Secure Checkout
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
