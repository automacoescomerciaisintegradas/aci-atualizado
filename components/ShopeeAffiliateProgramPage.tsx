import React, { useState } from 'react';
import { ChevronLeftIcon, CheckCircleIcon, TelegramIcon, ClockIcon, SparklesIcon, LinkIcon, ExternalLinkIcon, CopyIcon } from './Icons';
import type { Page } from '../App';

interface ShopeeAffiliateProgramPageProps {
    onNavigate: (page: Page) => void;
}

const AFFILIATE_LINK = 'https://s.shopee.com.br/5L5YhbRLB3';

const BENEFITS = [
    { icon: '💰', title: 'Comissões por cada venda', description: 'Ganhe uma porcentagem de cada venda realizada através do seu link' },
    { icon: <TelegramIcon className="h-5 w-5" />, title: 'Integração com Telegram', description: 'Envie produtos automaticamente para seus canais e grupos' },
    { icon: '🎯', title: 'Produtos ilimitados para promover', description: 'Milhões de produtos disponíveis para divulgação' },
    { icon: <ClockIcon className="h-5 w-5" />, title: 'Agendamentos automatizados', description: 'Programe suas publicações para o melhor horário' },
];

const FEATURES = [
    'Busca inteligente de produtos por palavra-chave',
    'Geração automática de descrições com IA',
    'Importação de produtos via URL',
    'Publicação em massa para WordPress',
    'Envio automático para Telegram',
    'Análise de comissões e conversões',
];

export const ShopeeAffiliateProgramPage: React.FC<ShopeeAffiliateProgramPageProps> = ({ onNavigate }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(AFFILIATE_LINK);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenAffiliateLink = () => {
        window.open(AFFILIATE_LINK, '_blank');
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
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                        <span className="text-2xl">🛒</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Shopee Afiliado</h1>
                        <p className="text-sm text-dark-text-secondary">Programa de afiliados oficial</p>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="card-premium p-0 overflow-hidden mb-8">
                <div className="flex flex-col lg:flex-row">
                    {/* Logo Shopee */}
                    <div className="lg:w-1/3 bg-gradient-to-br from-orange-600 to-red-600 p-8 flex items-center justify-center">
                        <div className="text-center">
                            <div className="w-32 h-32 mx-auto bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center mb-4">
                                <span className="text-7xl">🛍️</span>
                            </div>
                            <h2 className="text-3xl font-bold text-white">Shopee</h2>
                        </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="lg:w-2/3 p-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-2xl">💰</span>
                            <h3 className="text-2xl font-bold text-white">Ganhe Comissões com a Shopee</h3>
                        </div>

                        <p className="text-dark-text-secondary mb-4 leading-relaxed">
                            Transforme sua audiência em receita! Torne-se um <strong className="text-orange-400">Afiliado Oficial Shopee</strong> e promova produtos com seu link em <strong className="text-purple-400">blogs</strong>, <strong className="text-blue-400">Telegram</strong> e redes sociais.
                        </p>

                        <p className="text-dark-text-secondary mb-6">
                            A nossa plataforma cuida de tudo para você: <strong className="text-white">envio automático, agendamentos, integração com WordPress</strong> e muito mais.
                        </p>

                        {/* Benefícios Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {BENEFITS.map((benefit, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0 text-lg">
                                        {typeof benefit.icon === 'string' ? benefit.icon : benefit.icon}
                                    </div>
                                    <span className="text-dark-text-secondary text-sm">{benefit.title}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <button
                            onClick={handleOpenAffiliateLink}
                            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 text-white font-bold text-lg rounded-xl transition-all shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02]"
                        >
                            <LinkIcon className="h-5 w-5" />
                            Quero Me Tornar um Afiliado Shopee Agora
                            <ExternalLinkIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Como Funciona */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Card de Recursos */}
                <div className="card-premium p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-purple-400" />
                        O que você pode fazer no ACI
                    </h3>
                    <div className="space-y-3">
                        {FEATURES.map((feature, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <CheckCircleIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                                <span className="text-dark-text-secondary text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card de Link */}
                <div className="card-premium p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <LinkIcon className="h-5 w-5 text-blue-400" />
                        Seu Link de Cadastro
                    </h3>

                    <p className="text-dark-text-secondary text-sm mb-4">
                        Use o link abaixo para se cadastrar no programa de afiliados da Shopee:
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <code className="text-sm text-orange-400 break-all">{AFFILIATE_LINK}</code>
                        </div>
                        <button
                            onClick={handleCopyLink}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${copied
                                    ? 'bg-green-500 text-white'
                                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                                }`}
                        >
                            <CopyIcon className="h-5 w-5" />
                            {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                        <p className="text-sm text-purple-300">
                            <strong>💡 Dica:</strong> Após se cadastrar, volte aqui e comece a usar nossas ferramentas para maximizar seus ganhos!
                        </p>
                    </div>
                </div>
            </div>

            {/* Próximos Passos */}
            <div className="card-premium p-6">
                <h3 className="text-lg font-bold text-white mb-6">🚀 Próximos Passos</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center p-4 glass rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">1️⃣</span>
                        </div>
                        <h4 className="font-semibold text-white mb-2">Cadastre-se</h4>
                        <p className="text-dark-text-secondary text-sm">Clique no botão acima e faça seu cadastro na Shopee</p>
                    </div>

                    <div className="text-center p-4 glass rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">2️⃣</span>
                        </div>
                        <h4 className="font-semibold text-white mb-2">Busque Produtos</h4>
                        <p className="text-dark-text-secondary text-sm">Use nossa busca para encontrar os melhores produtos</p>
                    </div>

                    <div className="text-center p-4 glass rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">3️⃣</span>
                        </div>
                        <h4 className="font-semibold text-white mb-2">Publique e Ganhe</h4>
                        <p className="text-dark-text-secondary text-sm">Publique automaticamente e comece a ganhar comissões</p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => onNavigate('product-search')}
                        className="px-6 py-3 bg-brand-primary hover:bg-brand-primary/80 text-white font-medium rounded-xl transition-colors"
                    >
                        🔍 Buscar Produtos
                    </button>
                    <button
                        onClick={() => onNavigate('multi-channel-publisher')}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl transition-colors"
                    >
                        📢 Publicador Multi-Canal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShopeeAffiliateProgramPage;
