import React, { useState, useEffect } from 'react';
import {
    ChevronLeftIcon, ChevronRightIcon, TelegramIcon, InstagramIcon,
    WordPressIcon, ShoppingCartIcon, LinkIcon, CheckCircleIcon,
    AlertTriangleIcon, SpinnerIcon, SettingsIcon, ZapIcon
} from './Icons';
import type { Page } from '../App';
import { useSettings } from '../hooks/useSettings';
import { useExternalValidations } from './AdminPageComponents/useExternalValidations';
import { apiClient } from '../src/services/apiClient';

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
    const { validateTelegramToken, validateWordPressConnection, validateWooCommerceConnection } = useExternalValidations();

    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [validationStatus, setValidationStatus] = useState<Record<string, { status: string; message: string }>>({});
    const [localSettings, setLocalSettings] = useState(settings);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showIgConsent, setShowIgConsent] = useState(false);
    const [igConsentConfirmed, setIgConsentConfirmed] = useState(false);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        const message = params.get('message');
        const page = params.get('page');

        if (page === 'integrations-hub') {
            if (status === 'success') {
                setSuccessMessage(decodeURIComponent(message || 'Integração realizada com sucesso!'));
                setTimeout(() => setSuccessMessage(null), 5000);
            } else if (status === 'error' || status === 'warning') {
                setErrorMessage(decodeURIComponent(message || 'Houve um problema na integração.'));
                setTimeout(() => setErrorMessage(null), 5000);
            }
            // Limpar a URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

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
                return settings.instagramUser ? 'connected' : 'disconnected';
            case 'shopee':
                return settings.shopeeAffiliateId ? 'connected' : 'disconnected';
            case 'woocommerce':
                // Se houve uma validação expressa e falhou, marca como desconectado (vermelho)
                if (validationStatus.woocommerce?.status === 'invalid') return 'disconnected';

                return settings.woocommerceUrl && settings.woocommerceConsumerKey && settings.woocommerceConsumerSecret ? 'connected' :
                    settings.woocommerceUrl ? 'partial' : 'disconnected';
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
            id: 'woocommerce',
            name: 'WooCommerce',
            description: 'Gerencie produtos e reviews na sua loja WooCommerce',
            icon: <ShoppingCartIcon className="h-8 w-8 text-white" />,
            color: 'from-purple-500 to-indigo-600',
            status: getIntegrationStatus('woocommerce'),
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

    const handleValidateWooCommerce = async () => {
        if (!localSettings.woocommerceUrl || !localSettings.woocommerceConsumerKey || !localSettings.woocommerceConsumerSecret) return;
        setValidationStatus(prev => ({ ...prev, woocommerce: { status: 'loading', message: 'Verificando...' } }));
        const result = await validateWooCommerceConnection(
            localSettings.woocommerceUrl,
            localSettings.woocommerceConsumerKey,
            localSettings.woocommerceConsumerSecret
        );
        setValidationStatus(prev => ({ ...prev, woocommerce: result }));
    };

    const handleConnectInstagram = async () => {
        try {
            const data = await apiClient['request']<{ url: string }>('/api/integrations/instagram/auth');
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            setErrorMessage('Erro ao iniciar conexão com Instagram');
        }
    };

    const getStatusBadge = (status: 'connected' | 'disconnected' | 'partial') => {
        switch (status) {
            case 'connected':
                return (
                    <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
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
            case 'disconnected':
                return (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
                        Desconectado
                    </div>
                );
        }
    };

    const renderConfigForm = (integrationId: string) => {
        switch (integrationId) {
            case 'telegram':
                return (
                    <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl mt-4">
                        {settings.telegramBotToken && settings.telegramChatId && (
                            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 mb-2">
                                <CheckCircleIcon className="h-5 w-5" />
                                <span className="text-sm font-medium">Configuração Ativa e Conectada</span>
                            </div>
                        )}
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
                        {settings.wordpressUrl && settings.wordpressUsername && settings.wordpressAppPassword && (
                            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 mb-2">
                                <CheckCircleIcon className="h-5 w-5" />
                                <span className="text-sm font-medium">Blog Conectado com Sucesso</span>
                            </div>
                        )}
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
            case 'woocommerce':
                return (
                    <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl mt-4 text-left">
                        {settings.woocommerceUrl && settings.woocommerceConsumerKey && settings.woocommerceConsumerSecret && (
                            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 mb-2">
                                <CheckCircleIcon className="h-5 w-5" />
                                <span className="text-sm font-medium">Loja WooCommerce Conectada</span>
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                                URL da Loja WooCommerce
                            </label>
                            <input
                                type="url"
                                value={localSettings.woocommerceUrl || ''}
                                onChange={(e) => handleInputChange('woocommerceUrl', e.target.value)}
                                placeholder="https://sualoja.com.br"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                                Consumer Key (ck_...)
                            </label>
                            <input
                                type="text"
                                value={localSettings.woocommerceConsumerKey || ''}
                                onChange={(e) => handleInputChange('woocommerceConsumerKey', e.target.value)}
                                placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                                Consumer Secret (cs_...)
                            </label>
                            <input
                                type="password"
                                value={localSettings.woocommerceConsumerSecret || ''}
                                onChange={(e) => handleInputChange('woocommerceConsumerSecret', e.target.value)}
                                placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={handleValidateWooCommerce}
                                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
                            >
                                Verificar Conexão
                            </button>
                            <button
                                onClick={() => handleSaveIntegration('woocommerce')}
                                className="flex-1 py-3 bg-brand-primary hover:bg-brand-primary/80 text-white font-medium rounded-lg transition-colors"
                            >
                                Salvar
                            </button>
                        </div>
                        {validationStatus.woocommerce && (
                            <p className={`text-sm ${validationStatus.woocommerce.status === 'valid' ? 'text-green-400' : 'text-red-400'}`}>
                                {validationStatus.woocommerce.message}
                            </p>
                        )}
                    </div>
                );
            case 'instagram':
                if (settings.instagramUser) {
                    return (
                        <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl mt-4 border border-green-500/20">
                            <div className="flex items-center gap-4 p-4 bg-green-500/10 rounded-xl">
                                {settings.instagramUser.profilePictureUrl ? (
                                    <img src={settings.instagramUser.profilePictureUrl} alt={settings.instagramUser.username} className="h-12 w-12 rounded-full border-2 border-green-500" />
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center border-2 border-green-500">
                                        <InstagramIcon className="h-7 w-7 text-white" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                        @{settings.instagramUser.username}
                                        <CheckCircleIcon className="h-4 w-4 text-green-400" />
                                    </h4>
                                    <p className="text-xs text-green-400 font-medium uppercase tracking-wider">Conta Conectada</p>
                                </div>
                                <button
                                    onClick={() => {
                                        if (confirm('Deseja realmente desconectar sua conta do Instagram?')) {
                                            handleInputChange('instagramUser', '');
                                            handleSaveIntegration('instagram');
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-lg border border-red-500/20 transition-all"
                                >
                                    Desconectar
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                    <p className="text-[10px] text-dark-text-secondary uppercase mb-1">Status da API</p>
                                    <p className="text-sm text-white font-medium flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                        Ativo
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                    <p className="text-[10px] text-dark-text-secondary uppercase mb-1">Permissões</p>
                                    <p className="text-sm text-white font-medium">Full Access</p>
                                </div>
                            </div>
                        </div>
                    );
                }
                if (!showIgConsent) {
                    return (
                        <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl mt-4">
                            <div className="flex items-center gap-4 p-4 bg-pink-500/10 border border-pink-500/20 rounded-xl">
                                <InstagramIcon className="h-10 w-10 text-pink-500" />
                                <div>
                                    <h4 className="font-semibold text-white">Conectar Instagram</h4>
                                    <p className="text-sm text-dark-text-secondary">Conecte sua conta profissional para automatizar posts e respostas.</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowIgConsent(true)}
                                className="w-full px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:brightness-110 transition-all glow-instagram flex items-center justify-center gap-2"
                            >
                                <ZapIcon className="h-5 w-5" />
                                Configurar Conexão
                            </button>
                        </div>
                    );
                }
                return (
                    <div className="space-y-5 p-6 bg-slate-800/50 rounded-2xl mt-4 border border-slate-700 animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-lg font-bold text-white flex items-center gap-2">
                                <InstagramIcon className="h-6 w-6 text-pink-500" />
                                Conectar conta do Instagram
                            </h4>
                            <button onClick={() => setShowIgConsent(false)} className="text-dark-text-secondary hover:text-white text-sm">Voltar</button>
                        </div>

                        <div className="space-y-4 text-sm text-dark-text-secondary leading-relaxed">
                            <p>
                                Para usar este recurso a conta deve ser <strong className="text-white">Instagram Profissional (Empresa ou Criador)</strong>.
                                Para responder comentários e enviar mensagens no Direct, a conta precisa estar vinculada a uma <strong className="text-white">Página do Facebook</strong>.
                            </p>

                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                <p className="font-semibold text-xs text-brand-primary uppercase mb-2">Permissões Solicitadas:</p>
                                <p className="text-xs font-mono break-words">
                                    public_profile, instagram_basic, instagram_manage_comments, pages_show_list, pages_read_engagement, pages_manage_metadata, instagram_manage_messages, instagram_content_publish, instagram_manage_insights, business_management
                                </p>
                            </div>

                            <p>
                                Essas permissões permitem conectar sua conta, publicar posts orgânicos, responder comentários e mensagens, e exibir métricas de desempenho diretamente pelo painel.
                            </p>

                            <p className="text-xs italic bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                                💡 Você poderá desconectar sua conta Meta a qualquer momento nas configurações.
                            </p>

                            <label className="flex items-start gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                    type="checkbox"
                                    className="mt-1 rounded border-slate-700 bg-slate-800 text-brand-primary focus:ring-brand-primary"
                                    checked={igConsentConfirmed}
                                    onChange={(e) => setIgConsentConfirmed(e.target.checked)}
                                />
                                <span className="text-[13px] text-dark-text-primary">
                                    Confirmo que a conta é (ou será) profissional e entendo os requisitos acima.
                                </span>
                            </label>
                            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                <p className="text-[13px] font-medium text-amber-200/90 mb-1">3. Salvar no Meta:</p>
                                <p className="text-xs text-dark-text-secondary leading-relaxed">
                                    Após colar a URL acima no campo "URIs de redirecionamento OAuth válidos", você <strong className="text-white uppercase">deve clicar em "Salvar alterações"</strong> no final da página do Facebook Developers.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleConnectInstagram}
                                disabled={!igConsentConfirmed}
                                className="w-full px-4 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2 text-lg shadow-lg shadow-pink-500/20"
                            >
                                Continuar
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>

                            <button
                                onClick={() => onNavigate('instagram-connect')}
                                className="w-full px-4 py-3 glass text-white text-sm rounded-xl hover:bg-white/10 transition-all"
                            >
                                Configurações Avançadas de Testador
                            </button>
                        </div>

                        <div className="pt-4 border-t border-slate-700/50">
                            <button
                                onClick={(e) => {
                                    const code = e.currentTarget.nextElementSibling;
                                    if (code) {
                                        code.classList.toggle('hidden');
                                    }
                                }}
                                className="text-xs text-dark-text-secondary hover:text-brand-primary transition-colors flex items-center gap-1"
                            >
                                <SettingsIcon className="h-3 w-3" />
                                Ver URL de Redirecionamento (Configuração Facebook)
                            </button>
                            <div className="hidden mt-2 p-3 bg-slate-900 rounded-lg border border-slate-700 animate-fade-in">
                                <p className="text-[10px] text-dark-text-secondary mb-2 uppercase font-bold tracking-wider">URI de Redirecionamento OAuth Válido:</p>
                                <div className="flex items-center gap-2">
                                    <code className="text-[10px] text-brand-primary flex-1 break-all">
                                        https://aci.automacoescomerciais.com.br/api/integrations/instagram/callback
                                    </code>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText('https://aci.automacoescomerciais.com.br/api/integrations/instagram/callback');
                                            alert('URL copiada!');
                                        }}
                                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-white transition-colors"
                                    >
                                        Copiar
                                    </button>
                                </div>
                            </div>
                        </div>
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

            {/* Mensagens Globais */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400 animate-slide-up">
                    <CheckCircleIcon className="h-5 w-5" />
                    <p className="font-medium">{successMessage}</p>
                </div>
            )}

            {errorMessage && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 animate-slide-up">
                    <AlertTriangleIcon className="h-5 w-5" />
                    <p className="font-medium">{errorMessage}</p>
                </div>
            )}

            {/* Grid de Integrações Imagem */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {integrations.map((integration) => (
                    <div
                        key={integration.id}
                        className={`card-premium p-0 overflow-hidden transition-all duration-300 ${expandedCard === integration.id ? 'sm:col-span-2 lg:col-span-3 xl:col-span-4 2xl:col-span-5' : ''
                            }`}
                    >
                        <div
                            className="p-5 cursor-pointer"
                            onClick={() => {
                                if (integration.page && !['telegram', 'wordpress', 'woocommerce', 'instagram'].includes(integration.id)) {
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
