import React from 'react';
import { SparklesIcon, ChevronRightIcon } from './Icons';

interface PayPerUseBannerProps {
    onLearnMore?: () => void;
    compact?: boolean;
}

const QUICK_PRICES = [
    { label: 'ChatGPT 4.1', price: 'R$0,00089/palavra' },
    { label: 'Imagem IA', price: 'R$0,99' },
    { label: 'Instagram', price: 'R$0,27/post' },
    { label: 'Telegram', price: 'R$0,09/envio' },
];

export const PayPerUseBanner: React.FC<PayPerUseBannerProps> = ({ onLearnMore, compact = false }) => {
    if (compact) {
        return (
            <div className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border border-purple-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-5 h-5 text-purple-400" />
                        <div>
                            <p className="text-white font-medium text-sm">Modelo Pay-Per-Use</p>
                            <p className="text-slate-400 text-xs">Pague só pelo que usar</p>
                        </div>
                    </div>
                    {onLearnMore && (
                        <button
                            onClick={onLearnMore}
                            className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1"
                        >
                            Ver preços
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-[#1a1f2e] to-[#151922] border border-slate-700/50 rounded-2xl p-6 mb-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">Modelo Pay-Per-Use</h3>
                    <p className="text-slate-400 text-sm">
                        Pague somente pelo que usar. <span className="text-purple-400">Sem mensalidades, sem planos fixos.</span> Compre créditos conforme sua necessidade.
                    </p>
                </div>
            </div>

            {/* Quick Prices */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {QUICK_PRICES.map((item, index) => (
                    <div
                        key={index}
                        className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-3 text-center"
                    >
                        <p className="text-slate-400 text-xs mb-1">{item.label}</p>
                        <p className="text-green-400 font-bold text-sm">{item.price}</p>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
                <p className="text-slate-500 text-xs">
                    💡 Você controla exatamente quanto consome
                </p>
                {onLearnMore && (
                    <button
                        onClick={onLearnMore}
                        className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                        Ver todos os preços
                        <ChevronRightIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default PayPerUseBanner;
