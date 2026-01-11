import React from 'react';
import { XIcon, SparklesIcon, CheckCircleIcon, RocketIcon } from './Icons';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
}

const PRICING_ITEMS = [
    { label: 'ChatGPT 4.1', price: 'R$0,00089/palavra', icon: '🤖' },
    { label: 'GPT-4', price: 'R$0,012/palavra', icon: '🧠' },
    { label: 'DALL-E (Imagem)', price: 'R$0,99/imagem', icon: '🎨' },
    { label: 'Publicação Instagram', price: 'R$0,27/publicação', description: 'Imagem + Título + Descrição + Hashtags por IA', icon: '📸' },
    { label: 'Resposta "EU QUERO" (pública)', price: 'R$0,09', icon: '💬' },
    { label: 'Resposta "EU QUERO" (privada)', price: 'R$0,09', icon: '🔒' },
    { label: 'Envio no Telegram', price: 'R$0,09/envio', icon: '✈️' },
    { label: 'Consulta Shopee Afiliado', price: 'R$0,09/consulta', description: '50 produtos', icon: '🛒' },
    { label: 'Envio WooCommerce', price: 'R$0,27/envio', icon: '🌐' },
];

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, userName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-[#1a1f2e] to-[#0f1218] border border-slate-700/50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="relative p-6 pb-4 border-b border-slate-700/50">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-700/50"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <RocketIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                Bem-vindo{userName ? `, ${userName}` : ''}! 🎉
                            </h2>
                            <p className="text-slate-400 text-sm mt-1">
                                Sua conta foi criada com sucesso
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-700">
                    {/* Pay-per-use Banner */}
                    <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl p-5 mb-6">
                        <div className="flex items-start gap-3">
                            <SparklesIcon className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Modelo Pay-Per-Use</h3>
                                <p className="text-slate-300 text-sm leading-relaxed">
                                    Pague somente pelo que usar. <span className="text-purple-400 font-semibold">Sem mensalidades, sem planos fixos.</span> Compre créditos conforme sua necessidade.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Grid */}
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                            Créditos por uso — Você controla o quanto consome
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {PRICING_ITEMS.map((item, index) => (
                                <div
                                    key={index}
                                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="text-xl">{item.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-white font-medium text-sm truncate">{item.label}</span>
                                                <span className="text-green-400 font-bold text-sm whitespace-nowrap">{item.price}</span>
                                            </div>
                                            {item.description && (
                                                <p className="text-slate-500 text-xs mt-1">{item.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bonus Info */}
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🎁</span>
                            <div>
                                <p className="text-green-400 font-bold">Você ganhou R$ 3,00 de bônus!</p>
                                <p className="text-slate-400 text-sm">Use para testar todas as ferramentas gratuitamente.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-slate-700/50 bg-slate-900/50">
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                    >
                        <RocketIcon className="w-5 h-5" />
                        Começar Agora
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeModal;
