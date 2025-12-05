/**
 * =========================================
 * ACI - Sistema de Créditos Pay-per-Use
 * Sidebar Avançada de Créditos
 * =========================================
 */

import React, { useState } from 'react';
import { useCredits } from '../hooks/useCredits';
import { CreditPackage } from '../types/credit';
import {
    CreditIcon,
    SparklesIcon,
    TrendingUpIcon,
    CheckCircleIcon,
    CrownIcon
} from './Icons';

// ==========================================
// TIPOS
// ==========================================

interface CreditSidebarAdvancedProps {
    onPurchaseClick?: (packageId: string) => void;
    onViewHistoryClick?: () => void;
    compact?: boolean;
    showQuickRecharge?: boolean;
}

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

export const CreditSidebarAdvanced: React.FC<CreditSidebarAdvancedProps> = ({
    onPurchaseClick,
    onViewHistoryClick,
    compact = false,
    showQuickRecharge = true,
}) => {
    const {
        balance,
        transactions,
        packages,
        isLoading,
        formatCurrency,
        formatNumber,
        addCredits,
    } = useCredits({
        autoRefresh: true,
        onLowBalance: (bal, threshold) => {
            console.log(`⚠️ Saldo baixo: ${bal} (limite: ${threshold})`);
        },
    });

    const [showPackages, setShowPackages] = useState(false);
    const [isRecharging, setIsRecharging] = useState(false);

    // Calcular estatísticas
    const totalCredits = balance?.totalCredits || 0;
    const lifetimePurchased = balance?.lifetimePurchased || 0;
    const lifetimeUsed = balance?.lifetimeUsed || 0;

    // Determinar nível do usuário
    const getUserLevel = () => {
        if (lifetimePurchased >= 500) return { name: 'Diamond', color: 'text-cyan-400', bgColor: 'bg-cyan-900/30', icon: '💎' };
        if (lifetimePurchased >= 200) return { name: 'Gold', color: 'text-yellow-400', bgColor: 'bg-yellow-900/30', icon: '🏆' };
        if (lifetimePurchased >= 50) return { name: 'Silver', color: 'text-gray-300', bgColor: 'bg-gray-900/30', icon: '🥈' };
        return { name: 'Bronze', color: 'text-orange-400', bgColor: 'bg-orange-900/30', icon: '🥉' };
    };
    const userLevel = getUserLevel();

    // Calcular porcentagem visual (baseado em um limite visual)
    const visualLimit = Math.max(500, totalCredits * 1.5);
    const usagePercentage = Math.min((totalCredits / visualLimit) * 100, 100);

    // Cor da barra de progresso
    const getProgressColor = () => {
        if (usagePercentage > 60) return 'from-green-500 to-emerald-400';
        if (usagePercentage > 30) return 'from-yellow-500 to-orange-400';
        return 'from-red-500 to-rose-400';
    };

    // Handler de recarga rápida
    const handleQuickRecharge = async (amount: number) => {
        setIsRecharging(true);
        try {
            await addCredits(amount, `Recarga rápida de ${formatCurrency(amount)}`);
        } catch (err) {
            console.error('Erro na recarga:', err);
        } finally {
            setIsRecharging(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-dark-card border border-dark-border rounded-xl p-4 animate-pulse">
                <div className="h-6 bg-slate-700 rounded w-24 mb-4"></div>
                <div className="h-10 bg-slate-700 rounded w-20 mb-2"></div>
                <div className="h-2 bg-slate-700 rounded w-full"></div>
            </div>
        );
    }

    // ==========================================
    // MODO COMPACTO
    // ==========================================

    if (compact) {
        return (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-dark-border rounded-xl p-4 shadow-lg">
                {/* Saldo Compacto */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <CreditIcon className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-sm font-medium text-dark-text-secondary">Créditos</span>
                    </div>
                    <span className="text-xl font-bold text-white">{formatCurrency(totalCredits)}</span>
                </div>

                {/* Barra de Progresso */}
                <div className="w-full bg-slate-700/50 rounded-full h-2 mb-3">
                    <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-500`}
                        style={{ width: `${usagePercentage}%` }}
                    />
                </div>

                {/* Botão Adicionar */}
                <button
                    onClick={() => setShowPackages(true)}
                    className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                    <SparklesIcon className="w-4 h-4" />
                    Adicionar Créditos
                </button>

                {/* Modal de Pacotes */}
                {showPackages && (
                    <PackagesModal
                        packages={packages}
                        formatCurrency={formatCurrency}
                        onClose={() => setShowPackages(false)}
                        onPurchase={(pkg) => {
                            setShowPackages(false);
                            onPurchaseClick?.(pkg.id);
                        }}
                    />
                )}
            </div>
        );
    }

    // ==========================================
    // MODO COMPLETO
    // ==========================================

    return (
        <div className="bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border border-dark-border rounded-xl overflow-hidden shadow-2xl shadow-black/20">
            {/* Header com Gradiente */}
            <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 p-5 border-b border-dark-border">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <CreditIcon className="w-5 h-5 text-purple-400" />
                        Seus Créditos
                    </h3>
                    <span className={`text-xs font-medium ${userLevel.color} ${userLevel.bgColor} px-2 py-1 rounded-full flex items-center gap-1`}>
                        {userLevel.icon} {userLevel.name}
                    </span>
                </div>
                <p className="text-xs text-dark-text-secondary">Sistema Pay-per-Use ACI</p>
            </div>

            {/* Saldo Principal */}
            <div className="p-5">
                <div className="flex items-end justify-between mb-4">
                    <div>
                        <p className="text-sm text-dark-text-secondary mb-1">Saldo Disponível</p>
                        <p className="text-4xl font-bold text-white">
                            {formatCurrency(totalCredits)}
                        </p>
                    </div>
                    {balance?.bonusCredits && balance.bonusCredits > 0 && (
                        <div className="text-right">
                            <p className="text-xs text-dark-text-secondary">Inclui bônus</p>
                            <p className="text-lg font-semibold text-green-400">
                                +{formatCurrency(balance.bonusCredits)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Barra de Progresso Animada */}
                <div className="relative mb-6">
                    <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-3 rounded-full bg-gradient-to-r ${getProgressColor()} transition-all duration-700 ease-out relative`}
                            style={{ width: `${usagePercentage}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                        </div>
                    </div>
                    {totalCredits < (balance?.lowBalanceThreshold || 50) && (
                        <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                            ⚠️ Saldo baixo! Adicione créditos para continuar usando.
                        </p>
                    )}
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="flex items-center gap-2 text-dark-text-secondary text-xs mb-1">
                            <TrendingUpIcon className="w-4 h-4" />
                            Total Comprado
                        </div>
                        <p className="text-lg font-bold text-white">{formatCurrency(lifetimePurchased)}</p>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <div className="flex items-center gap-2 text-dark-text-secondary text-xs mb-1">
                            <CheckCircleIcon className="w-4 h-4" />
                            Total Usado
                        </div>
                        <p className="text-lg font-bold text-white">{formatCurrency(lifetimeUsed)}</p>
                    </div>
                </div>

                {/* Transações Recentes */}
                {transactions.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-dark-text-primary mb-3">Últimas Transações</h4>
                        <div className="space-y-2">
                            {transactions.slice(0, 3).map((tx) => (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg text-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={tx.type === 'debit' ? 'text-red-400' : 'text-green-400'}>
                                            {tx.type === 'debit' ? '↓' : '↑'}
                                        </span>
                                        <span className="text-dark-text-secondary truncate max-w-[150px]">
                                            {tx.description}
                                        </span>
                                    </div>
                                    <span className={`font-medium ${tx.type === 'debit' ? 'text-red-400' : 'text-green-400'}`}>
                                        {tx.type === 'debit' ? '-' : '+'}{formatCurrency(tx.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recarga Rápida */}
                {showQuickRecharge && (
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-dark-text-primary mb-3 flex items-center gap-2">
                            <SparklesIcon className="w-4 h-4 text-purple-400" />
                            Recarga Rápida
                        </h4>
                        <div className="grid grid-cols-4 gap-2">
                            {[10, 25, 50, 100].map((amount) => (
                                <button
                                    key={amount}
                                    onClick={() => handleQuickRecharge(amount)}
                                    disabled={isRecharging}
                                    className="py-2 px-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRecharging ? '...' : `+R$${amount}`}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-dark-text-secondary mt-2 text-center">
                            Adicione créditos instantaneamente (demo)
                        </p>
                    </div>
                )}

                {/* Pacotes de Créditos */}
                <div className="space-y-3 mb-4">
                    <h4 className="text-sm font-semibold text-dark-text-primary flex items-center gap-2">
                        <CrownIcon className="w-4 h-4 text-yellow-400" />
                        Pacotes Disponíveis
                    </h4>
                    {packages.filter(p => p.highlighted || p.id === 'basic').slice(0, 2).map((pkg) => (
                        <PackageCard
                            key={pkg.id}
                            pkg={pkg}
                            formatCurrency={formatCurrency}
                            onPurchase={() => onPurchaseClick?.(pkg.id)}
                        />
                    ))}
                </div>

                {/* Ações */}
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowPackages(true)}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Ver Todos os Pacotes
                    </button>
                </div>

                {onViewHistoryClick && (
                    <button
                        onClick={onViewHistoryClick}
                        className="w-full mt-3 py-2 text-sm text-dark-text-secondary hover:text-purple-400 transition-colors"
                    >
                        Ver histórico completo →
                    </button>
                )}
            </div>

            {/* Modal de Pacotes */}
            {showPackages && (
                <PackagesModal
                    packages={packages}
                    formatCurrency={formatCurrency}
                    onClose={() => setShowPackages(false)}
                    onPurchase={(pkg) => {
                        setShowPackages(false);
                        onPurchaseClick?.(pkg.id);
                    }}
                />
            )}
        </div>
    );
};

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================

interface PackageCardProps {
    pkg: CreditPackage;
    formatCurrency: (n: number) => string;
    onPurchase: () => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ pkg, formatCurrency, onPurchase }) => (
    <div
        className={`relative flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:scale-[1.02] ${pkg.highlighted
                ? 'bg-purple-900/20 border-purple-500/50 shadow-lg shadow-purple-500/10'
                : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
            }`}
        onClick={onPurchase}
    >
        {pkg.highlighted && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-xs font-bold px-2 py-0.5 rounded-full text-white shadow-lg">
                {pkg.badge || 'Popular'}
            </div>
        )}
        <div>
            <p className="font-bold text-white">{pkg.name}</p>
            <p className="text-xs text-dark-text-secondary">
                {formatCurrency(pkg.totalCredits)} em créditos
                {pkg.bonusCredits > 0 && <span className="text-green-400 ml-1">(+{formatCurrency(pkg.bonusCredits)} bônus)</span>}
            </p>
        </div>
        <div className="text-right">
            <p className="font-bold text-purple-400">{formatCurrency(pkg.price)}</p>
            {pkg.discountPercent > 0 && (
                <p className="text-xs text-green-400">-{pkg.discountPercent}%</p>
            )}
        </div>
    </div>
);

interface PackagesModalProps {
    packages: CreditPackage[];
    formatCurrency: (n: number) => string;
    onClose: () => void;
    onPurchase: (pkg: CreditPackage) => void;
}

const PackagesModal: React.FC<PackagesModalProps> = ({
    packages,
    formatCurrency,
    onClose,
    onPurchase
}) => (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-purple-400" />
                        Pacotes de Créditos
                    </h2>
                    <p className="text-dark-text-secondary text-sm mt-1">
                        Escolha o pacote ideal para você. Créditos nunca expiram!
                    </p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-slate-800 transition-colors text-dark-text-secondary hover:text-white"
                >
                    ✕
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {packages.map((pkg) => (
                    <div
                        key={pkg.id}
                        className={`relative bg-slate-800/50 border rounded-xl p-5 transition-all hover:scale-[1.02] ${pkg.highlighted
                                ? 'border-purple-500 shadow-xl shadow-purple-500/20'
                                : 'border-slate-700 hover:border-slate-600'
                            }`}
                    >
                        {pkg.badge && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 shadow-lg">
                                <CrownIcon className="w-3 h-3" />
                                {pkg.badge}
                            </div>
                        )}

                        <div className="text-center mb-4 pt-2">
                            <h3 className="text-xl font-bold text-white">{pkg.name}</h3>
                            <div className="text-3xl font-extrabold text-white my-3">
                                {formatCurrency(pkg.price)}
                            </div>
                            <p className="text-dark-text-secondary text-xs">pagamento único</p>
                        </div>

                        <div className="bg-slate-900/50 rounded-lg p-3 mb-4 text-center">
                            <p className="text-2xl font-bold text-purple-400">
                                {formatCurrency(pkg.totalCredits)}
                            </p>
                            <p className="text-xs text-dark-text-secondary">
                                {formatCurrency(pkg.credits)} créditos
                                {pkg.bonusCredits > 0 && (
                                    <span className="text-green-400"> +{formatCurrency(pkg.bonusCredits)} bônus</span>
                                )}
                            </p>
                        </div>

                        <ul className="space-y-2 mb-6">
                            {pkg.features.slice(0, 4).map((feature, index) => (
                                <li key={index} className="flex items-center gap-2 text-sm">
                                    <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                                    <span className="text-dark-text-secondary">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <button
                            onClick={() => onPurchase(pkg)}
                            className={`w-full py-3 px-4 font-bold rounded-lg transition-all ${pkg.highlighted
                                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                                }`}
                        >
                            Comprar Agora
                        </button>

                        {pkg.discountPercent > 0 && (
                            <p className="text-center text-xs text-green-400 mt-2">
                                Economia de {pkg.discountPercent}%
                            </p>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <p className="text-blue-300 text-sm flex items-center gap-2">
                    <SparklesIcon className="w-5 h-5" />
                    <span>
                        <strong>Garantia:</strong> Seus créditos nunca expiram e podem ser usados em qualquer ferramenta da plataforma.
                    </span>
                </p>
            </div>
        </div>
    </div>
);

export default CreditSidebarAdvanced;
