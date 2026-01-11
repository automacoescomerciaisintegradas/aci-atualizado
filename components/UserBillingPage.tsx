import React, { useState } from 'react';
import { ChevronLeftIcon, CreditIcon, CreditCardIcon, DollarSignIcon, TrendingUpIcon, SparklesIcon } from './Icons';
import { useSettings } from '../hooks/useSettings';
import type { Page } from '../App';

interface UserBillingPageProps {
    onNavigate: (page: Page) => void;
    onAddCreditsClick: () => void;
}

export const UserBillingPage: React.FC<UserBillingPageProps> = ({ onNavigate, onAddCreditsClick }) => {
    const { settings } = useSettings();
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

    // Pacotes de créditos (Modelo Pay-per-use)
    const creditPackages = [
        {
            id: 'pack-50',
            name: 'Valor',
            credits: 50000,
            bonus: 5000,
            price: 50.00,
            popular: false,
            color: 'from-slate-600 to-slate-700',
        },
        {
            id: 'pack-197',
            name: 'Valor',
            credits: 250000,
            bonus: 25000,
            price: 197.00,
            popular: true,
            color: 'from-purple-600 to-indigo-600',
        },
        {
            id: 'pack-397',
            name: 'Valor',
            credits: 600000,
            bonus: 60000,
            price: 397.00,
            popular: false,
            color: 'from-blue-600 to-cyan-600',
        },
        {
            id: 'pack-697',
            name: 'Valor',
            credits: 1200000,
            bonus: 120000,
            price: 697.00,
            popular: false,
            color: 'from-amber-600 to-orange-600',
        },
        {
            id: 'pack-999',
            name: 'Valor',
            credits: 2000000,
            bonus: 200000,
            price: 999.00,
            popular: false,
            color: 'from-emerald-600 to-teal-600',
        },
    ];

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    // Calcular porcentagem do saldo (baseado no teto do maior pacote 2M)
    const usagePercentage = Math.min((settings.credits / 2000000) * 100, 100);
    const getProgressColor = () => {
        if (usagePercentage > 60) return 'from-green-500 to-emerald-400';
        if (usagePercentage > 30) return 'from-yellow-500 to-orange-400';
        return 'from-red-500 to-rose-400';
    };

    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => onNavigate('home')}
                    className="glass hover:bg-white/10 p-2.5 rounded-xl text-dark-text-secondary transition-all duration-300"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
                        <CreditIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Cobrança e Créditos</h1>
                        <p className="text-sm text-dark-text-secondary">Gerencie seus créditos e métodos de pagamento</p>
                    </div>
                </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {/* Saldo Atual */}
                <div className="card-premium p-5 bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-blue-300 text-sm font-medium">Saldo Atual</span>
                        <CreditIcon className="w-5 h-5 text-blue-300" />
                    </div>
                    <div className="text-3xl font-bold text-white">{settings.credits.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-blue-200 mt-1">≈ {formatCurrency(settings.credits / 1100)}</p>
                </div>

                {/* Valor em R$ */}
                <div className="card-premium p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-dark-text-secondary text-sm font-medium">Equivalente</span>
                        <DollarSignIcon className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-3xl font-bold text-white">{formatCurrency(settings.credits / 1100)}</div>
                    <p className="text-xs text-dark-text-secondary mt-1">em créditos</p>
                </div>

                {/* Uso Médio */}
                <div className="card-premium p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-dark-text-secondary text-sm font-medium">Média Mensal</span>
                        <TrendingUpIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-3xl font-bold text-white">847</div>
                    <p className="text-xs text-dark-text-secondary mt-1">créditos/mês</p>
                </div>

                {/* Dias Restantes */}
                <div className="card-premium p-5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-dark-text-secondary text-sm font-medium">Previsão</span>
                        <SparklesIcon className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="text-3xl font-bold text-white">{Math.round((settings.credits / 847) * 30)}</div>
                    <p className="text-xs text-dark-text-secondary mt-1">dias restantes</p>
                </div>
            </div>

            {/* Barra de Progresso do Saldo */}
            <div className="card-premium p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">Status do Saldo</h3>
                    {settings.credits < 100 && (
                        <span className="text-xs text-amber-400 bg-amber-900/30 px-3 py-1 rounded-full flex items-center gap-1">
                            ⚠️ Saldo Baixo
                        </span>
                    )}
                </div>
                <div className="relative mb-4">
                    <div className="w-full bg-slate-700/50 rounded-full h-4 overflow-hidden">
                        <div
                            className={`h-4 rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-700 ease-out relative`}
                            style={{ width: `${usagePercentage}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </div>
                    </div>
                    <div className="flex justify-between text-xs text-dark-text-secondary mt-2">
                        <span>0</span>
                        <span>{settings.credits.toLocaleString('pt-BR')} / 2.000.000</span>
                    </div>
                </div>
                <button
                    onClick={onAddCreditsClick}
                    className="w-full gradient-primary text-white font-bold py-3 rounded-xl hover:brightness-110 transition-all glow-primary flex items-center justify-center gap-2"
                >
                    <CreditIcon className="h-5 w-5" />
                    Adicionar Créditos
                </button>
            </div>

            {/* Pacotes de Créditos */}
            <div className="card-premium p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                            <span className="text-2xl">🎁</span>
                            Pacotes de Créditos
                        </h3>
                        <p className="text-sm text-dark-text-secondary mt-1">Escolha o pacote ideal para suas necessidades</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {creditPackages.map((pkg) => (
                        <div
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg.id)}
                            className={`relative rounded-2xl p-5 transition-all cursor-pointer hover:scale-[1.02] border-2 ${selectedPackage === pkg.id
                                ? 'border-purple-500 shadow-xl shadow-purple-500/20 ring-2 ring-purple-500/50 bg-slate-800/80'
                                : pkg.popular
                                    ? 'border-purple-500/50 bg-slate-800/50'
                                    : 'border-dark-border bg-slate-800/30 hover:border-slate-600'
                                }`}
                        >
                            {pkg.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                    <span>👑</span> Popular
                                </div>
                            )}

                            <div className="text-center mb-4 pt-2">
                                <h4 className="text-lg font-bold text-white">{pkg.name}</h4>
                                <div className="text-3xl font-extrabold text-white my-2">
                                    {formatCurrency(pkg.price)}
                                </div>
                                <p className="text-dark-text-secondary text-xs">pagamento único</p>
                            </div>

                            <div className="bg-slate-900/50 rounded-xl p-3 mb-4 text-center">
                                <p className="text-2xl font-bold text-purple-400">
                                    {(pkg.credits + pkg.bonus).toLocaleString('pt-BR')}
                                </p>
                                <p className="text-xs text-dark-text-secondary">
                                    {pkg.credits.toLocaleString('pt-BR')} créditos
                                    {pkg.bonus > 0 && <span className="text-green-400"> +{pkg.bonus} bônus</span>}
                                </p>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddCreditsClick();
                                }}
                                className={`w-full py-2.5 font-bold rounded-xl transition-all ${pkg.popular || selectedPackage === pkg.id
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                                    }`}
                            >
                                Comprar
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Métodos de Pagamento */}
            <div className="card-premium p-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <CreditCardIcon className="h-6 w-6 text-purple-400" />
                    Métodos de Pagamento
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {/* PIX */}
                    <div className="flex items-center gap-4 glass p-4 rounded-xl border border-green-500/30">
                        <div className="p-3 bg-green-500/20 rounded-xl">
                            <span className="text-2xl">💚</span>
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-white">PIX</p>
                            <p className="text-sm text-green-400">Aprovação instantânea</p>
                        </div>
                        <span className="text-xs bg-green-500 text-white px-3 py-1 rounded-full font-medium">Recomendado</span>
                    </div>

                    {/* Cartão */}
                    <div className="flex items-center gap-4 glass p-4 rounded-xl border border-dark-border">
                        <div className="p-3 bg-slate-700 rounded-xl">
                            <CreditCardIcon className="h-6 w-6 text-dark-text-secondary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-white">Cartão de Crédito</p>
                            <p className="text-sm text-dark-text-secondary">Parcele em até 12x</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 glass p-4 rounded-xl border border-dark-border">
                    <CreditCardIcon className="h-8 w-8 text-dark-text-secondary" />
                    <div>
                        <p className="font-semibold text-white">Nenhum cartão salvo</p>
                        <p className="text-sm text-dark-text-secondary">Adicione um cartão para pagamentos rápidos.</p>
                    </div>
                </div>
                <button className="mt-4 text-sm font-semibold text-brand-primary hover:text-brand-secondary flex items-center gap-1 transition-colors">
                    <span>+</span> Adicionar novo cartão
                </button>
            </div>

            {/* Garantia */}
            <div className="glass rounded-2xl border border-green-500/20 p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-4xl">🛡️</span>
                    <div>
                        <h4 className="font-bold text-white mb-1">Garantia Total</h4>
                        <p className="text-green-300 text-sm">
                            Seus créditos nunca expiram. Compre com tranquilidade e use quando precisar.
                            Pagamento 100% seguro com PIX ou Cartão.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserBillingPage;
