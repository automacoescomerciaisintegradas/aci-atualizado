import React from 'react';
import { Page } from '../../App.js';
import { BrainCircuitIcon, ShoppingCartSendIcon, BookIcon, ShieldIcon, SparklesIcon, TrendingUpIcon } from '../Icons.js';

interface NavigationHeaderProps {
    onNavigate: (page: Page) => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({ onNavigate }) => {
    const menuItems = [
        {
            title: 'Geração de Conteúdo',
            description: 'Crie posts com IA',
            page: 'aci-posts' as Page,
            icon: <BookIcon className="h-6 w-6" />,
            color: 'from-indigo-500 to-purple-600'
        },
        {
            title: 'Envio em Lote',
            description: 'Telegram + Shopee',
            page: 'shopee-lote' as Page,
            icon: <ShoppingCartSendIcon className="h-6 w-6" />,
            color: 'from-blue-500 to-cyan-600'
        },
        {
            title: 'Instagram',
            description: 'Conectar perfil',
            page: 'instagram-connect' as Page,
            icon: <SparklesIcon className="h-6 w-6" />,
            color: 'from-pink-500 to-rose-600'
        },
        {
            title: 'Analytics',
            description: 'Métricas e insights',
            page: 'analytics' as Page,
            icon: <TrendingUpIcon className="h-6 w-6" />,
            color: 'from-emerald-500 to-teal-600'
        },
        {
            title: 'Segurança',
            description: 'Ativar 2FA',
            page: 'profile' as Page,
            icon: <ShieldIcon className="h-6 w-6" />,
            color: 'from-amber-500 to-orange-600'
        }
    ];

    return (
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mb-8 shadow-xl animate-fade-in">
            {/* Header Title */}
            <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-dark-text-primary flex items-center justify-center gap-2">
                    <BrainCircuitIcon className="h-7 w-7 text-indigo-400" />
                    Navegação Rápida
                </h2>
                <p className="text-sm text-dark-text-secondary mt-1">
                    Acesse suas ferramentas favoritas
                </p>
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {menuItems.map((item) => (
                    <button
                        key={item.page}
                        onClick={() => onNavigate(item.page)}
                        className="group relative bg-dark-bg hover:bg-dark-bg/80 border border-dark-border hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20 text-left"
                    >
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-300`}></div>

                        {/* Content */}
                        <div className="relative z-10">
                            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${item.color} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                                {React.cloneElement(item.icon, { className: 'h-6 w-6 text-white' })}
                            </div>

                            <h3 className="font-bold text-dark-text-primary text-sm mb-1 group-hover:text-indigo-400 transition-colors">
                                {item.title}
                            </h3>

                            <p className="text-xs text-dark-text-secondary">
                                {item.description}
                            </p>
                        </div>

                        {/* Hover Arrow */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </button>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t border-dark-border">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-2xl font-bold text-indigo-400">5</p>
                        <p className="text-xs text-dark-text-secondary">Ferramentas</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-emerald-400">100%</p>
                        <p className="text-xs text-dark-text-secondary">Automação</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold text-amber-400">24/7</p>
                        <p className="text-xs text-dark-text-secondary">Disponível</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
