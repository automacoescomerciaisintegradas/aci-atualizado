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
        <div className="animate-fade-in max-w-4xl mx-auto px-2 sm:px-0">
            {/* Header com botão voltar */}
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                    onClick={() => onNavigate('home')}
                    className="glass hover:bg-white/10 h-11 w-11 sm:h-12 sm:w-12 rounded-xl text-dark-text-secondary transition-all duration-300 flex items-center justify-center"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
                        {icon || <RocketIcon className="h-7 w-7 text-white" />}
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{title}</h1>
                        <p className="text-sm text-dark-text-secondary mt-1">Em desenvolvimento</p>
                    </div>
                </div>
            </div>

            {/* Conteúdo principal */}
            <div className="card-premium p-8 sm:p-12 text-center">
                <div className="flex flex-col items-center gap-5 sm:gap-6">
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
                        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3">Em Breve!</h2>
                        <p className="text-dark-text-secondary leading-relaxed text-base sm:text-lg">
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
                        className="mt-2 sm:mt-4 min-w-[220px] h-12 px-6 bg-slate-700 hover:bg-slate-600 text-white text-lg font-semibold rounded-xl transition-colors"
                    >
                        ← Voltar ao Painel
                    </button>

                    {/* Conteúdo institucional */}
                    <div className="w-full max-w-2xl mt-5 border-t border-white/10 pt-6 space-y-4 text-center">
                        <p className="text-base md:text-lg font-semibold text-white">
                            The AI that actually does things.
                        </p>
                        <p className="text-dark-text-secondary">
                            Bem-vindo(a) ao Futuro da Criação de Conteúdo! 🤖✨
                        </p>
                        <p className="text-sm text-dark-text-secondary">
                            Convidando mais pessoas, mais pessoas, mais motivação para trazer mais conteúdo.
                        </p>

                        <div className="flex flex-col items-center gap-2 pt-2">
                            <p className="text-sm text-white font-medium">
                                contato@automacoescomerciais.com.br
                            </p>
                            <a
                                href="https://wa.me/558894227586"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-2 min-w-[180px] h-10 px-4 rounded-full bg-green-500/20 border border-green-400/40 text-green-300 hover:bg-green-500/30 transition-colors"
                            >
                                📱 WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dica */}
            <div className="mt-6 p-4 glass rounded-xl border border-white/5">
                <p className="text-sm text-dark-text-secondary text-center">
                    💡 <strong className="text-white">Dica:</strong> Enquanto isso, explore outras funcionalidades disponíveis no painel.
                </p>
            </div>

            <div className="mt-5 text-center text-xs text-dark-text-secondary">
                © Automações Comerciais Integradas! 2026 ⚙️ Todos os direitos reservados.
            </div>
        </div>
    );
};

export default ComingSoonPage;
