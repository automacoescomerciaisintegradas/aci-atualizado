/**
 * =========================================
 * ACI - Sistema de Créditos Pay-per-Use
 * Componente de Demonstração Completa
 * =========================================
 */

import React, { useState, useMemo } from 'react';
import { useCredits, useCreditAnalytics } from '../hooks/useCredits';
import {
    CreditServiceType,
    CreditPackage,
    PricingModel,
    TransactionMetadata,
} from '../types/credit';
import {
    CreditIcon,
    SparklesIcon,
    TrendingUpIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronRightIcon,
} from './Icons';

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const CreditSystemDemo: React.FC = () => {
    const {
        balance,
        transactions,
        isLoading,
        error,
        packages,
        pricingModels,
        debitCredits,
        addCredits,
        calculateCost,
        checkSufficientBalance,
        formatCurrency,
        formatNumber,
        getPricingModel,
    } = useCredits({
        autoRefresh: true,
        onLowBalance: (balance, threshold) => {
            console.log(`⚠️ Saldo baixo: ${balance} (threshold: ${threshold})`);
        },
    });

    const { analytics } = useCreditAnalytics(30);

    // Estado local
    const [activeTab, setActiveTab] = useState<'usage' | 'packages' | 'history' | 'analytics'>('usage');
    const [selectedService, setSelectedService] = useState<CreditServiceType>('ai_generation_gemini');
    const [quantity, setQuantity] = useState(1000);
    const [operationResult, setOperationResult] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Calcular custo em tempo real
    const costEstimate = useMemo(() => {
        return calculateCost(selectedService, quantity);
    }, [selectedService, quantity, calculateCost]);

    // Agrupar serviços por categoria
    const servicesByCategory = useMemo(() => {
        const models = Object.values(pricingModels);
        const categories = ['ai', 'messaging', 'ecommerce', 'publishing', 'content'] as const;

        return categories.reduce((acc, category) => {
            acc[category] = models.filter(m => m.category === category);
            return acc;
        }, {} as Record<string, PricingModel[]>);
    }, [pricingModels]);

    // Handlers
    const handleDebit = async () => {
        setIsProcessing(true);
        setOperationResult(null);

        try {
            const sufficient = await checkSufficientBalance(selectedService, quantity);
            if (!sufficient) {
                setOperationResult('❌ Saldo insuficiente para esta operação');
                return;
            }

            const metadata: TransactionMetadata = {
                wordCount: selectedService.startsWith('ai_generation') ? quantity : undefined,
                recipientCount: selectedService.includes('send') ? quantity : undefined,
            };

            const result = await debitCredits(
                selectedService,
                `Uso de ${getPricingModel(selectedService)?.serviceName}`,
                metadata
            );

            if (result.success) {
                setOperationResult(`✅ Débito realizado! Novo saldo: ${formatCurrency(result.newBalance)}`);
            } else {
                setOperationResult(`❌ Erro: ${result.error?.message}`);
            }
        } catch (err: any) {
            setOperationResult(`❌ Erro: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleQuickRecharge = async (amount: number) => {
        setIsProcessing(true);
        try {
            const result = await addCredits(amount, `Recarga rápida de ${formatCurrency(amount)}`);
            if (result.success) {
                setOperationResult(`✅ Recarga de ${formatCurrency(amount)} realizada!`);
            } else {
                setOperationResult(`❌ Erro: ${result.error?.message}`);
            }
        } catch (err: any) {
            setOperationResult(`❌ Erro: ${err.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="bg-dark-bg min-h-screen p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-2xl border border-purple-500/30 p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                <SparklesIcon className="w-8 h-8 text-purple-400" />
                                Sistema de Créditos ACI
                            </h1>
                            <p className="text-dark-text-secondary mt-1">
                                Demonstração completa do sistema pay-per-use
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm text-dark-text-secondary">Saldo Disponível</p>
                                <p className="text-3xl font-bold text-white">
                                    {formatCurrency(balance?.totalCredits || 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Operation Result */}
                {operationResult && (
                    <div className={`rounded-xl p-4 ${operationResult.startsWith('✅')
                            ? 'bg-green-900/30 border border-green-500/50'
                            : 'bg-red-900/30 border border-red-500/50'
                        }`}>
                        <p className={operationResult.startsWith('✅') ? 'text-green-400' : 'text-red-400'}>
                            {operationResult}
                        </p>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                        title="Saldo Total"
                        value={formatCurrency(balance?.totalCredits || 0)}
                        subtitle="Disponível para uso"
                        icon="💰"
                        color="blue"
                    />
                    <StatCard
                        title="Créditos Bônus"
                        value={formatCurrency(balance?.bonusCredits || 0)}
                        subtitle="Promocionais"
                        icon="🎁"
                        color="purple"
                    />
                    <StatCard
                        title="Total Comprado"
                        value={formatCurrency(balance?.lifetimePurchased || 0)}
                        subtitle="Histórico total"
                        icon="📈"
                        color="green"
                    />
                    <StatCard
                        title="Total Usado"
                        value={formatCurrency(balance?.lifetimeUsed || 0)}
                        subtitle="Em transações"
                        icon="📊"
                        color="amber"
                    />
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-dark-border pb-2">
                    {[
                        { id: 'usage', label: 'Simular Uso', icon: '🔧' },
                        { id: 'packages', label: 'Pacotes', icon: '📦' },
                        { id: 'history', label: 'Histórico', icon: '📜' },
                        { id: 'analytics', label: 'Analytics', icon: '📊' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-slate-800 text-dark-text-secondary hover:bg-slate-700'
                                }`}
                        >
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-dark-card rounded-xl border border-dark-border p-6">
                    {activeTab === 'usage' && (
                        <UsageSimulator
                            servicesByCategory={servicesByCategory}
                            selectedService={selectedService}
                            onServiceChange={setSelectedService}
                            quantity={quantity}
                            onQuantityChange={setQuantity}
                            costEstimate={costEstimate}
                            balance={balance?.totalCredits || 0}
                            formatCurrency={formatCurrency}
                            formatNumber={formatNumber}
                            onDebit={handleDebit}
                            onQuickRecharge={handleQuickRecharge}
                            isProcessing={isProcessing}
                        />
                    )}

                    {activeTab === 'packages' && (
                        <PackagesGrid
                            packages={packages}
                            formatCurrency={formatCurrency}
                            onPurchase={(pkg) => handleQuickRecharge(pkg.price)}
                        />
                    )}

                    {activeTab === 'history' && (
                        <TransactionHistory
                            transactions={transactions}
                            formatCurrency={formatCurrency}
                        />
                    )}

                    {activeTab === 'analytics' && (
                        <AnalyticsView
                            analytics={analytics}
                            formatCurrency={formatCurrency}
                            formatNumber={formatNumber}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

interface StatCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: string;
    color: 'blue' | 'purple' | 'green' | 'amber';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color }) => {
    const colorClasses = {
        blue: 'from-blue-600 to-blue-800',
        purple: 'from-purple-600 to-purple-800',
        green: 'from-green-600 to-green-800',
        amber: 'from-amber-600 to-amber-800',
    };

    return (
        <div className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl p-5 shadow-xl`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-white/80 text-sm">{title}</span>
                <span className="text-2xl">{icon}</span>
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <p className="text-xs text-white/60 mt-1">{subtitle}</p>
        </div>
    );
};

interface UsageSimulatorProps {
    servicesByCategory: Record<string, PricingModel[]>;
    selectedService: CreditServiceType;
    onServiceChange: (service: CreditServiceType) => void;
    quantity: number;
    onQuantityChange: (qty: number) => void;
    costEstimate: any;
    balance: number;
    formatCurrency: (v: number) => string;
    formatNumber: (v: number) => string;
    onDebit: () => void;
    onQuickRecharge: (amount: number) => void;
    isProcessing: boolean;
}

const UsageSimulator: React.FC<UsageSimulatorProps> = ({
    servicesByCategory,
    selectedService,
    onServiceChange,
    quantity,
    onQuantityChange,
    costEstimate,
    balance,
    formatCurrency,
    formatNumber,
    onDebit,
    onQuickRecharge,
    isProcessing,
}) => {
    const [expandedCategory, setExpandedCategory] = useState<string | null>('ai');
    const hasSufficientBalance = balance >= costEstimate.finalPrice;

    const categoryLabels: Record<string, string> = {
        ai: '🤖 Inteligência Artificial',
        messaging: '📱 Mensagens',
        ecommerce: '🛒 E-commerce',
        publishing: '📝 Publicação',
        content: '📰 Conteúdo',
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Seleção de Serviço */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Selecione um Serviço</h3>
                <div className="space-y-2">
                    {Object.entries(servicesByCategory).map(([category, services]) => (
                        <div key={category} className="bg-slate-800/50 rounded-lg border border-slate-700">
                            <button
                                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                                className="w-full flex items-center justify-between p-3 text-left"
                            >
                                <span className="font-medium text-white">{categoryLabels[category]}</span>
                                {expandedCategory === category ? (
                                    <ChevronDownIcon className="w-5 h-5 text-dark-text-secondary" />
                                ) : (
                                    <ChevronRightIcon className="w-5 h-5 text-dark-text-secondary" />
                                )}
                            </button>
                            {expandedCategory === category && (
                                <div className="px-3 pb-3 space-y-1">
                                    {services.map(service => (
                                        <button
                                            key={service.serviceType}
                                            onClick={() => onServiceChange(service.serviceType)}
                                            className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${selectedService === service.serviceType
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-slate-700/50 text-dark-text-secondary hover:bg-slate-700'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{service.icon}</span>
                                                <span>{service.serviceName}</span>
                                            </div>
                                            <span className="text-xs">
                                                {formatCurrency(service.basePrice)}/{service.unit}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Calculadora e Ações */}
            <div className="space-y-6">
                {/* Quantidade */}
                <div>
                    <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                        Quantidade ({costEstimate.unit}s)
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            min="1"
                            max="10000"
                            value={quantity}
                            onChange={(e) => onQuantityChange(Number(e.target.value))}
                            className="flex-1"
                        />
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => onQuantityChange(Math.max(1, Number(e.target.value)))}
                            className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-center"
                        />
                    </div>
                </div>

                {/* Resumo de Custo */}
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <h4 className="font-semibold text-white mb-3">Resumo do Custo</h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-dark-text-secondary">Preço Base:</span>
                            <span className="text-white">{formatCurrency(costEstimate.basePrice)}</span>
                        </div>
                        {costEstimate.discount > 0 && (
                            <div className="flex justify-between">
                                <span className="text-dark-text-secondary">Desconto por Volume:</span>
                                <span className="text-green-400">-{formatCurrency(costEstimate.discount)} ({costEstimate.discountPercent.toFixed(1)}%)</span>
                            </div>
                        )}
                        <div className="border-t border-slate-700 pt-2 flex justify-between">
                            <span className="font-medium text-white">Total:</span>
                            <span className="text-xl font-bold text-purple-400">{formatCurrency(costEstimate.finalPrice)}</span>
                        </div>
                    </div>
                </div>

                {/* Status do Saldo */}
                <div className={`p-4 rounded-xl ${hasSufficientBalance ? 'bg-green-900/20 border border-green-700/30' : 'bg-red-900/20 border border-red-700/30'}`}>
                    <div className="flex items-center gap-2">
                        {hasSufficientBalance ? (
                            <>
                                <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                <span className="text-green-400">Saldo suficiente para esta operação</span>
                            </>
                        ) : (
                            <>
                                <TrendingUpIcon className="w-5 h-5 text-red-400" />
                                <span className="text-red-400">Saldo insuficiente - Faltam {formatCurrency(costEstimate.finalPrice - balance)}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Ações */}
                <div className="flex gap-3">
                    <button
                        onClick={onDebit}
                        disabled={isProcessing || !hasSufficientBalance}
                        className={`flex-1 py-3 px-4 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${hasSufficientBalance && !isProcessing
                                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white'
                                : 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {isProcessing ? (
                            <span className="animate-spin">⏳</span>
                        ) : (
                            <CreditIcon className="w-5 h-5" />
                        )}
                        Simular Débito
                    </button>
                </div>

                {/* Recarga Rápida */}
                <div>
                    <p className="text-sm text-dark-text-secondary mb-2">Recarga Rápida (Demo)</p>
                    <div className="flex gap-2">
                        {[10, 25, 50, 100].map(amount => (
                            <button
                                key={amount}
                                onClick={() => onQuickRecharge(amount)}
                                disabled={isProcessing}
                                className="flex-1 py-2 px-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50"
                            >
                                +{formatCurrency(amount)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface PackagesGridProps {
    packages: CreditPackage[];
    formatCurrency: (v: number) => string;
    onPurchase: (pkg: CreditPackage) => void;
}

const PackagesGrid: React.FC<PackagesGridProps> = ({ packages, formatCurrency, onPurchase }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {packages.map(pkg => (
            <div
                key={pkg.id}
                className={`relative bg-slate-800/50 border rounded-xl p-5 ${pkg.highlighted ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-slate-700'
                    }`}
            >
                {pkg.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {pkg.badge}
                    </div>
                )}
                <div className="text-center mb-4 pt-2">
                    <h4 className="text-lg font-bold text-white">{pkg.name}</h4>
                    <div className="text-3xl font-extrabold text-white my-2">
                        {formatCurrency(pkg.price)}
                    </div>
                    <p className="text-xs text-dark-text-secondary">{pkg.description}</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-3 mb-4 text-center">
                    <p className="text-2xl font-bold text-purple-400">{formatCurrency(pkg.totalCredits)}</p>
                    <p className="text-xs text-dark-text-secondary">
                        {formatCurrency(pkg.credits)} + {formatCurrency(pkg.bonusCredits)} bônus
                    </p>
                </div>
                <ul className="space-y-1 mb-4 text-xs">
                    {pkg.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-center gap-1 text-dark-text-secondary">
                            <span className="text-green-400">✓</span> {f}
                        </li>
          max))}
                </ul>
                <button
                    onClick={() => onPurchase(pkg)}
                    className={`w-full py-2 rounded-lg font-bold transition-all ${pkg.highlighted
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                >
                    Comprar
                </button>
            </div>
        ))}
    </div>
);

interface TransactionHistoryProps {
    transactions: any[];
    formatCurrency: (v: number) => string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions, formatCurrency }) => (
    <div>
        <h3 className="text-lg font-semibold text-white mb-4">Últimas Transações</h3>
        {transactions.length === 0 ? (
            <div className="text-center py-8 text-dark-text-secondary">
                Nenhuma transação encontrada
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-800">
                        <tr>
                            <th className="px-4 py-3 text-left text-dark-text-secondary">Data</th>
                            <th className="px-4 py-3 text-left text-dark-text-secondary">Tipo</th>
                            <th className="px-4 py-3 text-left text-dark-text-secondary">Descrição</th>
                            <th className="px-4 py-3 text-right text-dark-text-secondary">Valor</th>
                            <th className="px-4 py-3 text-right text-dark-text-secondary">Saldo Após</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map(tx => (
                            <tr key={tx.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                                <td className="px-4 py-3 text-dark-text-secondary">
                                    {new Date(tx.createdAt).toLocaleDateString('pt-BR')}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs ${tx.type === 'debit' ? 'bg-red-900/50 text-red-400' :
                                            tx.type === 'credit' ? 'bg-green-900/50 text-green-400' :
                                                'bg-purple-900/50 text-purple-400'
                                        }`}>
                                        {tx.type === 'debit' ? 'Débito' : tx.type === 'credit' ? 'Crédito' : 'Bônus'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-white">{tx.description}</td>
                                <td className={`px-4 py-3 text-right font-medium ${tx.type === 'debit' ? 'text-red-400' : 'text-green-400'
                                    }`}>
                                    {tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount)}
                                </td>
                                <td className="px-4 py-3 text-right text-dark-text-secondary">
                                    {formatCurrency(tx.balanceAfter)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </div>
);

interface AnalyticsViewProps {
    analytics: any;
    formatCurrency: (v: number) => string;
    formatNumber: (v: number) => string;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, formatCurrency, formatNumber }) => {
    if (!analytics) {
        return (
            <div className="text-center py-8 text-dark-text-secondary">
                Carregando analytics...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-sm text-dark-text-secondary mb-1">Total Gasto (30 dias)</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(analytics.usage?.totalSpent || 0)}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-sm text-dark-text-secondary mb-1">Média Diária</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(analytics.usage?.averageDaily || 0)}</p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                    <p className="text-sm text-dark-text-secondary mb-1">Previsão Mensal</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(analytics.trends?.predictedMonthlyUsage || 0)}</p>
                </div>
            </div>

            {analytics.recommendations?.suggestedPackage && (
                <div className="bg-purple-900/20 border border-purple-700/30 rounded-xl p-4">
                    <p className="text-purple-300">
                        💡 <strong>Recomendação:</strong> Com base no seu uso, o pacote <strong>{analytics.recommendations.suggestedPackage}</strong> seria ideal para você.
                    </p>
                </div>
            )}
        </div>
    );
};

export default CreditSystemDemo;
