import React, { useState, useEffect } from 'react';
import {
    ChevronLeftIcon, ChevronRightIcon, TelegramIcon, InstagramIcon,
    WordPressIcon, ShoppingCartIcon, LinkIcon, CheckCircleIcon,
    AlertTriangleIcon, SpinnerIcon, SettingsIcon, ZapIcon
} from './Icons';
import type { Page } from '../App';
import { useSettings } from '../hooks/useSettings';
import { useExternalValidations } from './AdminPageComponents/useExternalValidations';

interface IntegrationsHubPageProps {
    onNavigate: (page: Page) => void;
}

interface IntegrationCard {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    page?: Page;
    configFields?: string[];
    status: 'connected' | 'disconnected' | 'partial';
}

export const IntegrationsHubPage: React.FC<IntegrationsHubPageProps> = ({ onNavigate }) => {
    const { settings, saveSettings } = useSettings();
    const { validateTelegramToken, validateWordPressConnection } = useExternalValidations();

    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [validationStatus, setValidationStatus] = useState<Record<string, { status: string; message: string }>>({});
    const [localSettings, setLocalSettings] = useState(settings);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    // Verificar status das integrações
    const getIntegrationStatus = (integration: string): 'connected' | 'disconnected' | 'partial' => {
        switch (integration) {
            case 'telegram':
                return settings.telegramBotToken && settings.telegramChatId ? 'connected' :
                    settings.telegramBotToken || settings.telegramChatId ? 'partial' : 'disconnected';
            case 'wordpress':
                return settings.wordpressUrl && settings.wordpressUsername && settings.wordpressAppPassword ? 'connected' :
                    settings.wordpressUrl ? 'partial' : 'disconnected';
            case 'instagram':
                return settings.metaClientId ? 'partial' : 'disconnected';
            case 'shopee':
                return settings.shopeeAffiliateId ? 'connected' : 'disconnected';
            default:
                return 'disconnected';
        }
    };

    const integrations: IntegrationCard[] = [
        {
            id: 'telegram',
            name: 'Telegram',
            description: 'Envie produtos e ofertas automaticamente para seus canais e grupos',
            icon: <TelegramIcon className="h-8 w-8 text-white" />,
            color: 'from-blue-500 to-blue-600',
            page: 'telegram',
            status: getIntegrationStatus('telegram'),
        },
        {
            id: 'wordpress',
            name: 'WordPress',
            description: 'Publique posts automaticamente em seus blogs WordPress',
            icon: <WordPressIcon className="h-8 w-8 text-white" />,
            color: 'from-blue-700 to-indigo-700',
            page: 'wordpress-blogs',
            status: getIntegrationStatus('wordpress'),
        },
        {
            id: 'instagram',
            name: 'Instagram',
            description: 'Conecte sua conta para publicar e gerenciar conteúdo',
            icon: <InstagramIcon className="h-8 w-8 text-white" />,
            color: 'from-pink-500 to-purple-600',
            page: 'instagram-connect',
            status: getIntegrationStatus('instagram'),
        },
        {
            id: 'shopee',
            name: 'Shopee Afiliado',
            description: 'Ganhe comissões promovendo produtos da Shopee',
            icon: <ShoppingCartIcon className="h-8 w-8 text-white" />,
            color: 'from-orange-500 to-red-500',
            page: 'shopee-affiliate',
            status: getIntegrationStatus('shopee'),
        },
        {
            id: 'whatsapp',
            name: 'WhatsApp Business',
            description: 'Envie mensagens e promoções para seus clientes',
            icon: <span className="text-3xl">📱</span>,
            color: 'from-green-500 to-green-600',
            page: 'whatsapp-business',
            status: 'disconnected',
        },
        {
            id: 'api',
            name: 'API REST',
            description: 'Integre o ACI com suas próprias aplicações',
            icon: <LinkIcon className="h-8 w-8 text-white" />,
            color: 'from-purple-600 to-indigo-600',
            page: 'api-integration',
            status: 'disconnected',
        },
        {
            id: 'n8n',
            name: 'Automação n8n',
            description: 'Crie fluxos de automação avançados com n8n',
            icon: <ZapIcon className="h-8 w-8 text-white" />,
            color: 'from-red-500 to-orange-500',
            page: 'automation',
            status: 'disconnected',
        },
    ];

    const handleInputChange = (field: string, value: string) => {
        setLocalSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveIntegration = async (integrationId: string) => {
        setSaveStatus('saving');
        try {
            await saveSettings(localSettings);
            setSaveStatus('success');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            setSaveStatus('error');
        }
    };

    const handleValidateTelegram = async () => {
        if (!localSettings.telegramBotToken) return;
        setValidationStatus(prev => ({ ...prev, telegramToken: { status: 'loading', message: 'Verificando...' } }));
        const result = await validateTelegramToken(localSettings.telegramBotToken);
        setValidationStatus(prev => ({ ...prev, telegramToken: result }));
    };

    const handleValidateWordPress = async () => {
        if (!localSettings.wordpressUrl || !localSettings.wordpressUsername || !localSettings.wordpressAppPassword) return;
        setValidationStatus(prev => ({ ...prev, wordpress: { status: 'loading', message: 'Verificando...' } }));
        const result = await validateWordPressConnection(
            localSettings.wordpressUrl,
            localSettings.wordpressUsername,
            localSettings.wordpressAppPassword
        );
        setValidationStatus(prev => ({ ...prev, wordpress: result }));
    };

    const getStatusBadge = (status: 'connected' | 'disconnected' | 'partial') => {
        switch (status) {
            case 'connected':
                return (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                        <CheckCircleIcon className="h-3 w-3" />
                        Conectado
                    </span>
                );
            case 'partial':
                return (
                    <span className="flex items-center gap-1 text-xs font-medium text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-full">
                        <AlertTriangleIcon className="h-3 w-3" />
                        Parcial
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-500/10 px-2 py-1 rounded-full">
                        Desconectado
                    </span>
                );
        }
    };

    const renderConfigForm = (integrationId: string) => {
        switch (integrationId) {
            case 'telegram':
                return (
                    <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl mt-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                                Token do Bot do Telegram
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="password"
                                    value={localSettings.telegramBotToken || ''}
                                    onChange={(e) => handleInputChange('telegramBotToken', e.target.value)}
                                    placeholder="Ex: 1234567890:ABC-DEF1234ghIkl-zyx57W2v1u123456789"
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm"
                                />
                                <button
                                    onClick={handleValidateTelegram}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
                                >
                                    Verificar
                                </button>
                            </div>
                            {validationStatus.telegramToken && (
                                <p className={`text-xs mt-1 ${validationStatus.telegramToken.status === 'valid' ? 'text-green-400' : 'text-red-400'}`}>
                                    {validationStatus.telegramToken.message}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                                ID do Chat/Canal
                            </label>
                            <input
                                type="text"
                                value={localSettings.telegramChatId || ''}
                                onChange={(e) => handleInputChange('telegramChatId', e.target.value)}
                                placeholder="@seu_canal ou -1001234567890"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm"
                            />
                        </div>
                        <button
                            onClick={() => handleSaveIntegration('telegram')}
                            className="w-full py-3 bg-brand-primary hover:bg-brand-primary/80 text-white font-medium rounded-lg transition-colors"
                        >
                            {saveStatus === 'saving' ? 'Salvando...' : 'Salvar Configurações'}
                        </button>
                    </div>
                );
            case 'wordpress':
                return (
                    <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl mt-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                                URL do Blog WordPress
                            </label>
                            <input
                                type="url"
                                value={localSettings.wordpressUrl || ''}
                                onChange={(e) => handleInputChange('wordpressUrl', e.target.value)}
                                placeholder="https://seu-blog.com"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                                Nome de Usuário WordPress
                            </label>
                            <input
                                type="text"
                                value={localSettings.wordpressUsername || ''}
                                onChange={(e) => handleInputChange('wordpressUsername', e.target.value)}
                                placeholder="Seu nome de usuário"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                                Senha de Aplicativo WordPress
                            </label>
                            <input
                                type="password"
                                value={localSettings.wordpressAppPassword || ''}
                                onChange={(e) => handleInputChange('wordpressAppPassword', e.target.value)}
                                placeholder="xxxx xxxx xxxx xxxx"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm"
                            />
                            <p className="text-xs text-dark-text-secondary mt-1">
                                Crie uma senha de aplicativo em Usuários {'>'} Perfil {'>'} Senhas de Aplicativo
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleValidateWordPress}
                                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                            >
                                Verificar Conexão
                            </button>
                            <button
                                onClick={() => handleSaveIntegration('wordpress')}
                                className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary/80 text-white font-medium rounded-lg transition-colors"
                            >
                                Salvar
                            </button>
                        </div>
                        {validationStatus.wordpress && (
                            <p className={`text-sm ${validationStatus.wordpress.status === 'valid' ? 'text-green-400' : 'text-red-400'}`}>
                                {validationStatus.wordpress.message}
                            </p>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="animate-fade-in">
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
                        <SettingsIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Central de Integrações</h1>
                        <p className="text-sm text-dark-text-secondary">Configure suas conexões com plataformas externas</p>
                    </div>
                </div>
            </div>

            {/* Grid de Integrações */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {integrations.map((integration) => (
                    <div
                        key={integration.id}
                        className={`card-premium p-0 overflow-hidden transition-all duration-300 ${expandedCard === integration.id ? 'md:col-span-2 lg:col-span-3' : ''
                            }`}
                    >
                        <div
                            className="p-5 cursor-pointer"
                            onClick={() => {
                                if (integration.page && !['telegram', 'wordpress'].includes(integration.id)) {
                                    onNavigate(integration.page);
                                } else {
                                    setExpandedCard(expandedCard === integration.id ? null : integration.id);
                                }
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${integration.color} flex items-center justify-center flex-shrink-0`}>
                                    {integration.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-semibold text-white">{integration.name}</h3>
                                        {getStatusBadge(integration.status)}
                                    </div>
                                    <p className="text-sm text-dark-text-secondary line-clamp-2">
                                        {integration.description}
                                    </p>
                                </div>
                                <ChevronRightIcon className={`h-5 w-5 text-dark-text-secondary transition-transform ${expandedCard === integration.id ? 'rotate-90' : ''
                                    }`} />
                            </div>
                        </div>

                        {/* Formulário de Configuração Expandido */}
                        {expandedCard === integration.id && renderConfigForm(integration.id)}
                    </div>
                ))}
            </div>

            {/* Link para Admin Page */}
            <div className="mt-8 p-4 glass rounded-xl border border-white/5 text-center">
                <p className="text-dark-text-secondary mb-3">
                    Precisa de configurações avançadas? Acesse o painel completo.
                </p>
                <button
                    onClick={() => onNavigate('admin')}
                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors inline-flex items-center gap-2"
                >
                    <SettingsIcon className="h-4 w-4" />
                    Painel Administrativo Completo
                </button>
            </div>
        </div>
    );
};

export default IntegrationsHubPage;
