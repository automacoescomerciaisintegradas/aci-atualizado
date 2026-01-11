import React from 'react';
import { ChevronLeftIcon, MailIcon, PhoneIcon, HelpCircleIcon, SparklesIcon, ClockIcon, CheckCircleIcon } from './Icons';
import type { Page } from '../App';

interface SupportPageProps {
    onNavigate: (page: Page) => void;
}

const WHATSAPP_NUMBER = '558894227586';
const WHATSAPP_DISPLAY = '+55 88 9215-67214';
const EMAIL = 'contato@automacoescomerciais.com.br';

const SUPPORT_FEATURES = [
    { icon: '⚡', title: 'Resposta Rápida', description: 'Tempo médio de resposta de até 2 horas' },
    { icon: '🎯', title: 'Suporte Especializado', description: 'Equipe treinada em todas as funcionalidades' },
    { icon: '📱', title: 'Multi-Canal', description: 'WhatsApp, E-mail e Chat ao vivo' },
    { icon: '🔧', title: 'Resolução Eficiente', description: 'Problemas resolvidos de forma ágil' },
];

const FAQ_ITEMS = [
    { q: 'Como funciona o sistema de créditos?', a: 'Você compra créditos e eles são consumidos conforme o uso de cada funcionalidade. Confira nossa tabela de preços em Cobrança.' },
    { q: 'Como integro com a Shopee?', a: 'Acesse Integrações > Shopee Afiliado e siga o passo a passo para se tornar um afiliado.' },
    { q: 'Posso agendar publicações?', a: 'Sim! Use o Publicador Multi-Canal ou o Criador de Post para Blog com a opção de agendamento.' },
    { q: 'Como funciona o envio automático para Telegram?', a: 'Configure seu bot do Telegram em Integrações > Telegram e depois use o publicador para enviar.' },
];

export const SupportPage: React.FC<SupportPageProps> = ({ onNavigate }) => {
    const handleWhatsAppClick = () => {
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Preciso de ajuda com o ACI.`, '_blank');
    };

    const handleEmailClick = () => {
        window.location.href = `mailto:${EMAIL}?subject=Suporte ACI`;
    };

    return (
        <div className="animate-fade-in">
            {/* Header com botão voltar */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => onNavigate('home')}
                    className="glass hover:bg-white/10 p-2.5 rounded-xl text-dark-text-secondary transition-all duration-300"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                        <HelpCircleIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Suporte Prioritário</h1>
                        <p className="text-sm text-dark-text-secondary">Estamos aqui para ajudar você</p>
                    </div>
                </div>
            </div>

            {/* Cards de Contato */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* WhatsApp */}
                <div className="card-premium p-6 hover:border-green-500/50 transition-all cursor-pointer group" onClick={handleWhatsAppClick}>
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <span className="text-3xl">📱</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">WhatsApp</h3>
                            <p className="text-dark-text-secondary text-sm mb-3">Atendimento rápido e direto</p>
                            <div className="flex items-center gap-2 text-green-400 font-semibold">
                                <PhoneIcon className="h-4 w-4" />
                                <span>{WHATSAPP_DISPLAY}</span>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                        <span>💬</span>
                        Iniciar Conversa
                    </button>
                </div>

                {/* E-mail */}
                <div className="card-premium p-6 hover:border-blue-500/50 transition-all cursor-pointer group" onClick={handleEmailClick}>
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                            <MailIcon className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">E-mail</h3>
                            <p className="text-dark-text-secondary text-sm mb-3">Para assuntos mais detalhados</p>
                            <div className="flex items-center gap-2 text-blue-400 font-semibold break-all">
                                <MailIcon className="h-4 w-4 flex-shrink-0" />
                                <span className="text-sm">{EMAIL}</span>
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                        <MailIcon className="h-5 w-5" />
                        Enviar E-mail
                    </button>
                </div>
            </div>

            {/* Banner Empresa */}
            <div className="card-premium p-6 mb-8 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30">
                <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                        <span className="text-4xl">⚙️</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-2">Automações Comerciais Integradas</h2>
                        <p className="text-dark-text-secondary">
                            Especialistas em automação de marketing digital, afiliados e gestão de conteúdo com IA.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Suporte em Português</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-400 text-sm">
                            <CheckCircleIcon className="h-4 w-4" />
                            <span>Atendimento Humanizado</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features de Suporte */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {SUPPORT_FEATURES.map((feature, index) => (
                    <div key={index} className="card-premium p-5 text-center">
                        <div className="text-3xl mb-3">{feature.icon}</div>
                        <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
                        <p className="text-dark-text-secondary text-xs">{feature.description}</p>
                    </div>
                ))}
            </div>

            {/* FAQ Rápido */}
            <div className="card-premium p-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <HelpCircleIcon className="h-5 w-5 text-purple-400" />
                    Perguntas Frequentes
                </h3>

                <div className="space-y-4">
                    {FAQ_ITEMS.map((item, index) => (
                        <div key={index} className="p-4 glass rounded-xl hover:bg-white/5 transition-colors">
                            <h4 className="font-semibold text-white mb-2">{item.q}</h4>
                            <p className="text-dark-text-secondary text-sm">{item.a}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => onNavigate('faq')}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                    >
                        Ver Todas as Perguntas →
                    </button>
                </div>
            </div>

            {/* Horário de Atendimento */}
            <div className="mt-6 p-4 glass rounded-xl border border-white/5 text-center">
                <div className="flex items-center justify-center gap-2 text-dark-text-secondary">
                    <ClockIcon className="h-5 w-5" />
                    <span>
                        <strong className="text-white">Horário de Atendimento:</strong> Segunda a Sexta, 9h às 18h (Horário de Brasília)
                    </span>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
