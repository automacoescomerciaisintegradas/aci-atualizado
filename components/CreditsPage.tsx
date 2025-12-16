import React, { useState, useEffect } from 'react';
import { apiClient } from '../src/services/apiClient';
import { CreditIcon, CheckCircleIcon, SparklesIcon, RocketIcon, CrownIcon, XCircleIcon, CopyIcon, CreditCardIcon, PlusIcon } from './Icons';

interface CreditsPlan {
    id: string;
    name: string;
    credits: number;
    price: number;
    bonus: number;
    popular: boolean;
    features: string[];
}

interface PaymentMethod {
    id: string;
    type: string;
    last4: string;
    expiry_month: number;
    expiry_year: number;
    is_default: boolean;
    created_at: string;
}

interface UserCredits {
    balance: number;
    total_purchased: number;
    total_used: number;
}

interface Transaction {
    id: string;
    amount: number;
    credits: number;
    status: string;
    payment_method: string;
    pix_qr_code?: string;
    pix_copy_paste?: string;
    created_at: string;
    expires_at?: string;
}

export const CreditsPage: React.FC = () => {
    const [userCredits, setUserCredits] = useState<UserCredits>({ balance: 0, total_purchased: 0, total_used: 0 });
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<CreditsPlan | null>(null);
    const [loading, setLoading] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
    const [showPaymentMethods, setShowPaymentMethods] = useState(false);
    const [copied, setCopied] = useState(false);

    const plans: CreditsPlan[] = [
        {
            id: 'starter',
            name: 'Starter',
            credits: 100,
            price: 29.90,
            bonus: 0,
            popular: false,
            features: ['100 créditos', 'Válido para sempre', 'Suporte por email', 'Todas as ferramentas']
        },
        {
            id: 'pro',
            name: 'Pro',
            credits: 500,
            price: 99.90,
            bonus: 50,
            popular: true,
            features: ['500 créditos', '+50 bônus', 'Válido para sempre', 'Suporte prioritário', 'Todas as ferramentas']
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            credits: 2000,
            price: 299.90,
            bonus: 300,
            popular: false,
            features: ['2000 créditos', '+300 bônus', 'Válido para sempre', 'Suporte VIP 24/7', 'Acesso antecipado', 'Consultoria inclusa']
        }
    ];

    useEffect(() => {
        fetchUserCredits();
        fetchPaymentMethods();
    }, []);

    const fetchUserCredits = async () => {
        try {
            const userId = apiClient.getUserId();
            if (!userId) return;

            // Buscar créditos do usuário via API
            const response = await apiClient.getCredits(userId);

            if (response.success && response.credits) {
                setUserCredits({
                    balance: response.credits.balance || 0,
                    total_purchased: response.credits.total_purchased || 0,
                    total_used: response.credits.total_used || 0
                });
            }
        } catch (error) {
            console.error('Erro ao buscar créditos:', error);
        }
    };

    const fetchPaymentMethods = async () => {
        try {
            const userId = apiClient.getUserId();
            if (!userId) return;

            // TODO: Implementar endpoint /api/payment-methods
            console.log('📦 Buscando métodos de pagamento...');
            setPaymentMethods([]);
        } catch (error) {
            console.error('Erro ao buscar métodos de pagamento:', error);
        }
    };

    const handlePurchase = async (plan: CreditsPlan) => {
        setLoading(true);
        setSelectedPlan(plan);

        try {
            const userId = apiClient.getUserId();
            if (!userId) {
                alert('Você precisa estar logado para comprar créditos');
                setLoading(false);
                return;
            }

            // TODO: Integrar com Mercado Pago para gerar PIX
            // Simular criação de checkout
            const transactionId = crypto.randomUUID();

            setCurrentTransaction({
                id: transactionId,
                amount: plan.price,
                credits: plan.credits + plan.bonus,
                status: 'pending',
                payment_method: 'pix',
                pix_qr_code: 'https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=00020126580014BR.GOV.BCB.PIX0136example-pix-key&choe=UTF-8',
                pix_copy_paste: '00020126580014BR.GOV.BCB.PIX0136example-pix-key5204000053039865802BR5913ACI%20Platform6009SAO%20PAULO62070503***6304XXXX',
                created_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
            });

            setShowQRCode(true);

            // Simular polling de pagamento
            console.log('🔄 Aguardando confirmação do pagamento PIX...');

        } catch (error: any) {
            console.error('Erro ao criar checkout:', error);
            alert('Erro ao criar pagamento. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white mb-3 flex items-center gap-3">
                        <SparklesIcon className="w-10 h-10 text-brand-primary" />
                        Créditos & Planos
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Adicione créditos para usar nossas ferramentas ou escolha um plano. Sem mensalidades, seus créditos não expiram.
                    </p>
                </div>

                {/* Current Balance */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-blue-100">Saldo Atual</span>
                            <CreditIcon className="w-6 h-6 text-blue-200" />
                        </div>
                        <div className="text-4xl font-bold text-white">{userCredits.balance.toLocaleString()}</div>
                        <p className="text-sm text-blue-200 mt-1">créditos disponíveis</p>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Total Comprado</span>
                            <RocketIcon className="w-6 h-6 text-gray-500" />
                        </div>
                        <div className="text-3xl font-bold text-white">{userCredits.total_purchased.toLocaleString()}</div>
                        <p className="text-sm text-gray-500 mt-1">créditos histórico</p>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-400">Total Utilizado</span>
                            <CheckCircleIcon className="w-6 h-6 text-gray-500" />
                        </div>
                        <div className="text-3xl font-bold text-white">{userCredits.total_used.toLocaleString()}</div>
                        <p className="text-sm text-gray-500 mt-1">créditos consumidos</p>
                    </div>
                </div>

                {/* Plans */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-6">Escolha seu Plano</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative bg-slate-800 border-2 rounded-2xl p-8 transition-all hover:scale-105 ${plan.popular
                                    ? 'border-brand-primary shadow-2xl shadow-brand-primary/20'
                                    : 'border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-primary text-white px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                        <CrownIcon className="w-4 h-4" />
                                        Mais Popular
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                    <div className="text-5xl font-bold text-white mb-1">
                                        R$ {plan.price.toFixed(2)}
                                    </div>
                                    <p className="text-gray-400">pagamento único</p>
                                </div>

                                <div className="mb-6 text-center">
                                    <div className="text-3xl font-bold text-brand-primary mb-1">
                                        {plan.credits + plan.bonus}
                                    </div>
                                    <p className="text-gray-400 text-sm">
                                        {plan.credits} créditos
                                        {plan.bonus > 0 && <span className="text-green-400"> +{plan.bonus} bônus</span>}
                                    </p>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2 text-gray-300">
                                            <CheckCircleIcon className="w-5 h-5 text-green-400 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handlePurchase(plan)}
                                    disabled={loading}
                                    className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${plan.popular
                                        ? 'bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg shadow-brand-primary/30'
                                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {loading && selectedPlan?.id === plan.id ? 'Processando...' : 'Comprar Agora'}
                                </button>

                                <div className="mt-4 text-center">
                                    <button
                                        onClick={() => setShowPaymentMethods(true)}
                                        className="text-sm text-brand-secondary hover:text-brand-primary font-medium"
                                    >
                                        Ver outros métodos de pagamento
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* QR Code Modal */}
                {showQRCode && currentTransaction && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-white">Pagamento via PIX</h3>
                                <button
                                    onClick={() => setShowQRCode(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <XCircleIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="text-center mb-6">
                                <div className="bg-white p-4 rounded-xl inline-block mb-4">
                                    {currentTransaction.pix_qr_code && (
                                        <img
                                            src={currentTransaction.pix_qr_code}
                                            alt="QR Code PIX"
                                            className="w-64 h-64"
                                        />
                                    )}
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Escaneie o QR Code com seu app de banco
                                </p>
                            </div>

                            {currentTransaction.pix_copy_paste && (
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Ou copie o código PIX:
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={currentTransaction.pix_copy_paste}
                                            readOnly
                                            className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white text-sm font-mono"
                                        />
                                        <button
                                            onClick={() => copyToClipboard(currentTransaction.pix_copy_paste!)}
                                            className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                        >
                                            <CopyIcon className="w-4 h-4" />
                                            {copied ? 'Copiado!' : 'Copiar'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-sm">
                                <p className="text-blue-200 mb-2">
                                    💡 <strong>Aguardando pagamento...</strong>
                                </p>
                                <p className="text-blue-300 text-xs">
                                    Seus créditos serão adicionados automaticamente após a confirmação do pagamento (geralmente em segundos).
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {showPaymentMethods && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <CreditCardIcon className="w-6 h-6 text-brand-primary" />
                                    Métodos de Pagamento
                                </h3>
                                <button
                                    onClick={() => setShowPaymentMethods(false)}
                                    className="text-gray-400 hover:text-white"
                                >
                                    <XCircleIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-gray-400 mb-4">
                                    Escolha um método de pagamento para suas compras futuras ou adicione um novo método.
                                </p>

                                {/* Payment Methods List */}
                                <div className="space-y-4 mb-6">
                                    {paymentMethods.length === 0 ? (
                                        <div className="text-center py-8">
                                            <CreditCardIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                                            <h4 className="text-lg font-medium text-white mb-2">Nenhum método de pagamento salvo</h4>
                                            <p className="text-gray-400 mb-4">Adicione um método para facilitar suas futuras compras</p>
                                        </div>
                                    ) : (
                                        paymentMethods.map((method) => (
                                            <div
                                                key={method.id}
                                                className={`flex items-center justify-between p-4 rounded-lg border ${method.is_default
                                                        ? 'bg-blue-900/20 border-blue-700'
                                                        : 'bg-slate-900/50 border-slate-700'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="bg-slate-700 p-3 rounded-lg">
                                                        <CreditCardIcon className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-white font-medium">
                                                                {method.type === 'card' ? 'Cartão de Crédito' : method.type}
                                                            </span>
                                                            {method.is_default && (
                                                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                                                    Padrão
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-400 text-sm">
                                                            Terminado em {method.last4} • {method.expiry_month.toString().padStart(2, '0')}/{method.expiry_year}
                                                        </p>
                                                        <p className="text-gray-500 text-xs">
                                                            Adicionado em {new Date(method.created_at).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Add New Method Button */}
                                <button
                                    onClick={() => {
                                        alert('Funcionalidade para adicionar novo método de pagamento será implementada em breve.');
                                    }}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg transition-colors"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                    Adicionar Novo Método de Pagamento
                                </button>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                                <button
                                    onClick={() => setShowPaymentMethods(false)}
                                    className="bg-slate-700 hover:bg-slate-600 text-white py-2.5 px-6 rounded-lg transition-colors"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};