import React from 'react';
import { ChevronLeftIcon, RocketIcon, SparklesIcon } from './Icons';
import type { Page } from '../App';

interface ComingSoonPageProps {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    onNavigate: (page: Page) => void;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
    title,
    description = 'Esta funcionalidade está em desenvolvimento e estará disponível em breve.',
    icon,
    onNavigate
}) => {
    return (
        <div className="animate-fade-in max-w-4xl mx-auto">
            {/* Header com botão voltar */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => onNavigate('home')}
                    className="glass hover:bg-white/10 p-2.5 rounded-xl text-dark-text-secondary transition-all duration-300"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
                        {icon || <RocketIcon className="h-7 w-7 text-white" />}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{title}</h1>
                        <p className="text-sm text-dark-text-secondary">Em desenvolvimento</p>
                    </div>
                </div>
            </div>

            {/* Conteúdo principal */}
            <div className="card-premium p-12 text-center">
                <div className="flex flex-col items-center gap-6">
                    {/* Ícone animado */}
                    <div className="relative">
                        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/20 to-indigo-600/20 border border-purple-500/30 flex items-center justify-center">
                            <SparklesIcon className="h-12 w-12 text-purple-400" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-lg animate-bounce">
                            🚀
                        </div>
                    </div>

                    {/* Texto */}
                    <div className="max-w-md">
                        <h2 className="text-2xl font-bold text-white mb-3">Em Breve!</h2>
                        <p className="text-dark-text-secondary leading-relaxed">
                            {description}
                        </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                        <span className="text-yellow-400 text-sm font-medium">Em Desenvolvimento</span>
                    </div>

                    {/* Botão voltar */}
                    <button
                        onClick={() => onNavigate('home')}
                        className="mt-4 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                    >
                        ← Voltar ao Painel
                    </button>
                </div>
            </div>

            {/* Dica */}
            <div className="mt-6 p-4 glass rounded-xl border border-white/5">
                <p className="text-sm text-dark-text-secondary text-center">
                    💡 <strong className="text-white">Dica:</strong> Enquanto isso, explore outras funcionalidades disponíveis no painel.
                </p>
            </div>
        </div>
    );
};

export default ComingSoonPage;
