import React, { useState } from 'react';
import { X, Check, Zap, TrendingUp, Shield, ChevronLeft } from 'lucide-react';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPackage?: (id: string, price: number, credits: number, bonus: number, total: number) => void;
}

const pricingPackages = [
    {
        id: 'pack-50',
        price: 50,
        credits: 50000,
        bonus: 5000,
        total: 55000,
        popular: false
    },
    {
        id: 'basic-custom', // Pacote de 99 inserido manualmente (1k/R$)
        price: 99,
        credits: 99000,
        bonus: 9900,
        total: 108900,
        popular: false
    },
    {
        id: 'pack-197',
        price: 197,
        credits: 250000,
        bonus: 25000,
        total: 275000,
        popular: true
    },
    {
        id: 'pack-397',
        price: 397,
        credits: 600000,
        bonus: 60000,
        total: 660000,
        popular: false
    },
    {
        id: 'pack-697',
        price: 697,
        credits: 1200000,
        bonus: 120000,
        total: 1320000,
        popular: false
    },
    {
        id: 'pack-999',
        price: 999,
        credits: 2000000,
        bonus: 200000,
        total: 2200000,
        popular: false
    }
];

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, onSelectPackage }) => {
    if (!isOpen) return null;

    const formatNumber = (num: number) => {
        return num.toLocaleString('pt-BR');
    };

    const handleSelectPackage = (pkg: typeof pricingPackages[0]) => {
        if (onSelectPackage) {
            onSelectPackage(pkg.id, pkg.price, pkg.credits, pkg.bonus, pkg.total);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0b0d]/90 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-6xl my-8 bg-[#16181d] rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.6)] border border-white/5 overflow-hidden">
                {/* Header with Close and Back Buttons */}
                <div className="sticky top-0 z-20 flex items-center justify-between p-6 bg-[#16181d]/80 backdrop-blur-xl border-b border-white/5">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all font-bold text-sm"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Voltar</span>
                    </button>

                    <div className="absolute left-1/2 -translate-x-1/2 text-white font-black tracking-tighter text-xl mt-1">
                        CENTRAL DE CRÉDITOS
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 lg:p-16">
                    {/* Hero Section */}
                    <div className="text-center mb-16 relative">
                        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none"></div>

                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full mb-6">
                            <Zap className="w-4 h-4 text-blue-400 fill-current" />
                            <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Modelo Pay-per-Use</span>
                        </div>

                        <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6 tracking-tighter">
                            Turbine sua <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Operação com IA</span>
                        </h2>
                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
                            Pague apenas pelo que utilizar. Sem mensalidades, sem taxas fixas. Seus créditos nunca expiram.
                        </p>
                    </div>

                    {/* How it Works cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                        {[
                            { step: '01', title: 'Compre Créditos', desc: 'Adicione saldo à sua conta via PIX ou Cartão em segundos.' },
                            { step: '02', title: 'Execute Ações', desc: 'Cada post, busca ou automação consome créditos individuais.' },
                            { step: '03', title: 'Escalabilidade', desc: 'Aumente ou reduza seu uso conforme a demanda do seu negócio.' }
                        ].map((item, i) => (
                            <div key={i} className="card-premium p-8 relative group overflow-hidden">
                                <span className="absolute -right-4 -bottom-8 text-8xl font-black text-white/[0.02] group-hover:text-blue-500/[0.05] transition-colors">{item.step}</span>
                                <h3 className="text-xl font-bold text-white mb-3 relative z-10">{item.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed relative z-10">{item.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Packages */}
                    <div className="mb-20">
                        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-4 no-scrollbar">
                            <div className="text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Pacotes Disponíveis</div>
                            <div className="h-px flex-1 bg-white/5 min-w-[100px]"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {pricingPackages.map((pkg) => (
                                <div
                                    key={pkg.id}
                                    className={`card-premium p-8 flex flex-col justify-between group transition-all duration-300 hover:scale-[1.03] ${pkg.popular
                                        ? 'ring-2 ring-blue-500/50 shadow-2xl shadow-blue-500/10'
                                        : 'hover:border-white/20'
                                        }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-blue-500/10 transition-colors">
                                                <TrendingUp className={`w-6 h-6 ${pkg.popular ? 'text-blue-400' : 'text-slate-500'}`} />
                                            </div>
                                            {pkg.popular && (
                                                <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-tighter">
                                                    Melhor Custo
                                                </span>
                                            )}
                                        </div>

                                        <div className="mb-8">
                                            <div className="text-sm font-black text-slate-500 uppercase mb-2">Preço Único</div>
                                            <div className="text-5xl font-black text-white tracking-tighter mb-2">
                                                <span className="text-xl align-top mr-1">R$</span>{pkg.price}
                                            </div>
                                            <div className="text-slate-400 font-bold flex items-center gap-2">
                                                <Check className="w-4 h-4 text-blue-500" />
                                                {formatNumber(pkg.credits)} créditos base
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-10 p-5 bg-white/[0.03] rounded-2xl border border-white/5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-black text-slate-500 uppercase">Bônus Extra</span>
                                                <span className="text-emerald-400 font-black">+{formatNumber(pkg.bonus)}</span>
                                            </div>
                                            <div className="h-px bg-white/5"></div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-white">Total Final</span>
                                                <span className="text-blue-400 font-black text-xl">
                                                    {formatNumber(pkg.total)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleSelectPackage(pkg)}
                                        className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all ${pkg.popular
                                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-500/20'
                                            : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                            }`}
                                    >
                                        Selecionar Pacote
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Features List */}
                    <div className="card-premium p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full"></div>
                        <h4 className="text-2xl font-black text-white mb-10 tracking-tighter text-center md:text-left">
                            Vantagens Inclusas
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                            {[
                                'Acesso a todas as ferramentas de IA',
                                'Suporte VIP via WhatsApp',
                                'Créditos Vitalícios (não expiram)',
                                'Novos módulos incluídos grátis',
                                'Relatórios avançados de performance',
                                'Garantia de segurança ACI'
                            ].map((feat, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="mt-1 p-1 bg-emerald-500/10 rounded-lg">
                                        <Check className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <span className="text-slate-300 font-medium text-sm leading-relaxed">{feat}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

