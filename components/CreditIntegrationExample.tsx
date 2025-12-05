import React, { useState, useMemo } from 'react';
import { useCredits, PricingModel } from '../hooks/useCredits';
import { SparklesIcon, CheckCircleIcon, CreditIcon, TrendingUpIcon } from './Icons';

interface CreditIntegrationExampleProps {
    onPurchaseClick?: () => void;
}

export const CreditIntegrationExample: React.FC<CreditIntegrationExampleProps> = ({
    onPurchaseClick,
}) => {
    const {
        balance,
        calculateCost,
        formatCurrency,
        formatCredits,
        getPricingModel,
        getServicesByCategory,
        getCategories,
        checkSufficientBalance,
    } = useCredits();

    const [selectedService, setSelectedService] = useState<string>('blog-article');
    const [estimateQuantity, setEstimateQuantity] = useState<number>(1);
    const [selectedCategory, setSelectedCategory] = useState<PricingModel['category'] | null>(null);

    const categories = getCategories();
    const services = useMemo(() =>
        getServicesByCategory(selectedCategory || undefined),
        [selectedCategory, getServicesByCategory]
    );

    const selectedModel = getPricingModel(selectedService);
    const costEstimate = calculateCost(selectedService, estimateQuantity);
    const hasSufficientBalance = checkSufficientBalance(costEstimate.totalCredits);
    const moneyValue = costEstimate.totalCredits * 0.174; // Preço médio por crédito

    // Calcular economia com desconto por volume
    const baseCostWithoutDiscount = selectedModel
        ? selectedModel.baseCredits * estimateQuantity
        : 0;
    const savings = baseCostWithoutDiscount - costEstimate.totalCredits;

    return (
        <div className="bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border border-dark-border rounded-xl overflow-hidden shadow-2xl shadow-black/20">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 p-6 border-b border-dark-border">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <SparklesIcon className="w-7 h-7 text-purple-400" />
                    Calculadora de Créditos
                </h2>
                <p className="text-dark-text-secondary mt-1">
                    Simule o custo de suas operações e aproveite os descontos por volume
                </p>
            </div>

            <div className="p-6">
                {/* Saldo Atual */}
                <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                            <CreditIcon className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-xs text-dark-text-secondary uppercase tracking-wider">Seu Saldo</p>
                            <p className="text-2xl font-bold text-white">{formatCredits(balance.balance)}</p>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-slate-700 hidden sm:block" />
                    <div>
                        <p className="text-xs text-dark-text-secondary">Valor estimado</p>
                        <p className="text-lg font-semibold text-green-400">{formatCurrency(balance.balance * 0.174)}</p>
                    </div>
                    {!hasSufficientBalance && (
                        <button
                            onClick={onPurchaseClick}
                            className="ml-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-all shadow-lg shadow-purple-500/20"
                        >
                            Adicionar Créditos
                        </button>
                    )}
                </div>

                {/* Filtro de Categorias */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-dark-text-secondary mb-3">
                        Categoria do Serviço
                    </label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === null
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-slate-800 text-dark-text-secondary hover:bg-slate-700'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${selectedCategory === cat.id
                                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                                        : 'bg-slate-800 text-dark-text-secondary hover:bg-slate-700'
                                    }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Seleção de Serviço */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-dark-text-secondary mb-3">
                        Selecione um Serviço
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {services.map((service) => (
                            <button
                                key={service.serviceId}
                                onClick={() => setSelectedService(service.serviceId)}
                                className={`p-4 rounded-xl text-left transition-all border ${selectedService === service.serviceId
                                        ? 'bg-purple-900/30 border-purple-500 shadow-lg shadow-purple-500/10'
                                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">{service.icon}</span>
                                    <span className="font-semibold text-white">{service.serviceName}</span>
                                </div>
                                <p className="text-xs text-dark-text-secondary mb-2">{service.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-purple-400 font-medium">
                                        {service.baseCredits} créditos/unidade
                                    </span>
                                    {service.tierPricing.length > 1 && (
                                        <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">
                                            Até {service.tierPricing[service.tierPricing.length - 1].discount}% off
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Calculadora */}
                {selectedModel && (
                    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 mb-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                            {/* Quantidade */}
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                                    Quantidade
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="500"
                                        value={estimateQuantity}
                                        onChange={(e) => setEstimateQuantity(Number(e.target.value))}
                                        className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                    <input
                                        type="number"
                                        min="1"
                                        value={estimateQuantity}
                                        onChange={(e) => setEstimateQuantity(Math.max(1, Number(e.target.value)))}
                                        className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-center font-bold"
                                    />
                                </div>
                            </div>

                            {/* Resultado */}
                            <div className="flex-shrink-0 text-center md:text-right">
                                <p className="text-sm text-dark-text-secondary mb-1">Custo Total</p>
                                <p className="text-4xl font-bold text-white">
                                    {formatCredits(costEstimate.totalCredits)}
                                    <span className="text-lg text-dark-text-secondary ml-1">créditos</span>
                                </p>
                                <p className="text-sm text-dark-text-secondary">
                                    ≈ {formatCurrency(moneyValue)}
                                </p>
                            </div>
                        </div>

                        {/* Detalhes do Tier */}
                        {costEstimate.tier && (
                            <div className="mt-6 pt-6 border-t border-slate-700">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-900/50 rounded-lg p-3">
                                        <p className="text-xs text-dark-text-secondary mb-1">Preço por Unidade</p>
                                        <p className="text-lg font-bold text-white">
                                            {costEstimate.creditPerUnit} <span className="text-sm text-dark-text-secondary">créditos</span>
                                        </p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-lg p-3">
                                        <p className="text-xs text-dark-text-secondary mb-1">Desconto Aplicado</p>
                                        <p className="text-lg font-bold text-green-400">
                                            {costEstimate.discount}%
                                        </p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-lg p-3">
                                        <p className="text-xs text-dark-text-secondary mb-1">Economia</p>
                                        <p className="text-lg font-bold text-green-400">
                                            {formatCredits(savings)} <span className="text-sm text-dark-text-secondary">créditos</span>
                                        </p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-lg p-3">
                                        <p className="text-xs text-dark-text-secondary mb-1">Status</p>
                                        <p className={`text-lg font-bold flex items-center gap-2 ${hasSufficientBalance ? 'text-green-400' : 'text-red-400'}`}>
                                            {hasSufficientBalance ? (
                                                <>
                                                    <CheckCircleIcon className="w-5 h-5" />
                                                    Saldo OK
                                                </>
                                            ) : (
                                                <>
                                                    <TrendingUpIcon className="w-5 h-5" />
                                                    Recarregar
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Tabela de Tiers */}
                {selectedModel && (
                    <div className="bg-slate-800/50 rounded-xl overflow-hidden border border-slate-700/50">
                        <div className="p-4 border-b border-slate-700">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <TrendingUpIcon className="w-5 h-5 text-green-400" />
                                Tabela de Descontos por Volume - {selectedModel.serviceName}
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                                            Faixa de Quantidade
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                                            Créditos/Unidade
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                                            Desconto
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                                            Economia
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {selectedModel.tierPricing.map((tier, index) => {
                                        const isActive = estimateQuantity >= tier.minQuantity && estimateQuantity <= tier.maxQuantity;
                                        return (
                                            <tr
                                                key={index}
                                                className={`${isActive ? 'bg-purple-900/20' : ''} transition-colors`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`font-medium ${isActive ? 'text-white' : 'text-dark-text-secondary'}`}>
                                                        {tier.minQuantity} - {tier.maxQuantity === Infinity ? '∞' : tier.maxQuantity}
                                                    </span>
                                                    {isActive && (
                                                        <span className="ml-2 text-xs bg-purple-500 text-white px-2 py-0.5 rounded-full">
                                                            Ativo
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`font-bold ${isActive ? 'text-white' : 'text-dark-text-primary'}`}>
                                                        {tier.creditsPerUnit}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`font-semibold ${tier.discount > 0 ? 'text-green-400' : 'text-dark-text-secondary'}`}>
                                                        {tier.discount > 0 ? `-${tier.discount}%` : '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-green-400">
                                                    {tier.discount > 0
                                                        ? `${selectedModel.baseCredits - tier.creditsPerUnit} créditos/unidade`
                                                        : '-'
                                                    }
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Call to Action */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-500/30">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="font-semibold text-white mb-1">Pronto para começar?</h4>
                            <p className="text-sm text-dark-text-secondary">
                                Compre créditos e comece a usar todas as ferramentas da plataforma ACI.
                            </p>
                        </div>
                        <button
                            onClick={onPurchaseClick}
                            className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Comprar Créditos
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreditIntegrationExample;
