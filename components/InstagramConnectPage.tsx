import React, { useState, useEffect } from 'react';
import { InstagramIcon, AlertTriangleIcon, CheckCircleIcon, ChevronLeftIcon, SpinnerIcon, HelpCircleIcon, SettingsIcon, TrashIcon, RefreshCwIcon } from './Icons';
import { useSettings } from '../hooks/useSettings';
import { apiClient } from '../src/services/apiClient';
import type { Page } from '../App';

// Templates de Respostas
const PUBLIC_REPLY_TEMPLATES = [
    {
        id: 'friendly',
        name: 'Público • Direto e Amigável',
        template: '👋 Oi, {FIRST_NAME}! Te enviei o link no privado. Se não aparecer, olha em Solicitações ou me manda um oi no direct 😉'
    },
    {
        id: 'formal',
        name: 'Público • Formal',
        template: 'Olá {FIRST_NAME}! Enviamos as informações no seu Direct. Confira sua caixa de mensagens.'
    },
    {
        id: 'urgency',
        name: 'Público • Com Urgência',
        template: '🔥 {FIRST_NAME}, corri lá e mandei o link por DM! Corre que é oferta relâmpago! ⚡'
    },
];

const PRIVATE_REPLY_TEMPLATES = [
    {
        id: 'humanized',
        name: 'Humanizado Amigável',
        template: `Olá {FIRST_NAME}! 😊 Aqui está o link do produto que você pediu:
{AFFILIATE_LINK}
{PRODUCT_NAME}
Qualquer dúvida, pode me chamar por aqui 💬`
    },
    {
        id: 'detailed',
        name: 'Detalhado com Benefícios',
        template: `Oi {FIRST_NAME}! 🎁

Aqui está o produto:
📦 {PRODUCT_NAME}
🔗 {AFFILIATE_LINK}

✅ Frete grátis em muitos produtos
✅ Cashback garantido
✅ Cupons exclusivos

Aproveita! 🚀`
    },
    {
        id: 'minimal',
        name: 'Minimalista',
        template: `{PRODUCT_NAME}
{AFFILIATE_LINK}`
    },
];

interface ConnectedAccount {
    id: string;
    username: string;
    platform: 'instagram' | 'facebook';
    expiresIn: number;
    status: 'active' | 'expired' | 'pending';
    createdAt: string;
}

const ConsentWarningModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void }> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="glass-card rounded-2xl max-w-md w-full overflow-hidden shadow-2xl transform transition-all scale-100 animate-scale-in">
                <div className="p-6">
                    <div className="flex items-center justify-center w-16 h-16 mx-auto gradient-instagram rounded-2xl mb-5 glow-instagram animate-float">
                        <InstagramIcon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-center text-white mb-2">
                        Conectar conta do Instagram
                    </h3>
                    <div className="text-sm text-dark-text-secondary space-y-4 mb-6">
                        <p>
                            Para usar este recurso a conta deve ser <strong className="text-white">Instagram Profissional (Empresa ou Criador)</strong>. Para responder comentários e enviar mensagens no Direct, a conta precisa estar <strong className="text-white">vinculada a uma Página do Facebook</strong>.
                        </p>
                        <div className="glass p-4 rounded-xl border border-brand-primary/20">
                            <p className="font-medium text-white mb-2 text-xs flex items-center gap-2">
                                <span className="status-dot online"></span>
                                Permissões Meta solicitadas:
                            </p>
                            <code className="text-xs text-brand-secondary font-mono block break-words leading-relaxed">
                                public_profile, instagram_basic, instagram_manage_comments, pages_show_list, pages_read_engagement, pages_manage_metadata, instagram_manage_messages, instagram_content_publish, instagram_manage_insights
                            </code>
                        </div>
                        <p className="text-xs">
                            Essas permissões permitem conectar sua conta, publicar posts orgânicos, responder comentários e mensagens, e exibir métricas de desempenho diretamente pelo painel.
                        </p>
                        <p className="text-xs text-dark-text-secondary/70 italic">
                            Você poderá desconectar sua conta Meta a qualquer momento nas configurações.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-3 text-dark-text-secondary glass hover:bg-white/10 rounded-xl font-medium transition-all duration-300"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-4 py-3 text-white gradient-instagram hover:brightness-110 rounded-xl font-medium transition-all duration-300 glow-instagram"
                        >
                            Continuar para Facebook
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const InstagramConnectPage: React.FC<{ onBack?: () => void; onNavigate?: (page: Page) => void }> = ({ onBack, onNavigate }) => {
    const { settings, saveSettings } = useSettings();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [showConsentModal, setShowConsentModal] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [activeTab, setActiveTab] = useState<'connect' | 'accounts' | 'autoresponder'>('connect');

    // Estados para respostas automáticas
    const [selectedPublicTemplate, setSelectedPublicTemplate] = useState(PUBLIC_REPLY_TEMPLATES[0].id);
    const [selectedPrivateTemplate, setSelectedPrivateTemplate] = useState(PRIVATE_REPLY_TEMPLATES[0].id);
    const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);

    // Mock de contas conectadas (substituir por API real)
    const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
        // Mock data - substituir por chamada API
    ]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('status');
        const message = params.get('message');
        const count = params.get('count');

        if (status === 'success') {
            setSuccessMessage(`Conexão realizada com sucesso! ${count ? `${count} conta(s) vinculada(s).` : ''}`);
            setActiveTab('accounts');
            window.history.replaceState({}, document.title, window.location.pathname);
        } else if (status === 'error' || status === 'warning') {
            setError(decodeURIComponent(message || 'Erro desconhecido ao conectar.'));
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleConnectClick = () => {
        setShowConsentModal(true);
    };

    const proceedToConnect = async () => {
        setShowConsentModal(false);
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('authToken');
            if (!token) {
                throw new Error('Usuário não autenticado. Faça login novamente.');
            }

            const data = await apiClient['request']<{ success: boolean; url?: string }>('/api/integrations/instagram/auth');

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('URL de autenticação não recebida do servidor.');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Erro ao conectar com o servidor.");
            setIsLoading(false);
        }
    };

    const handleSaveAutoReply = async () => {
        try {
            // Salvar nas configurações do usuário
            await saveSettings({
                ...settings,
                instagramAutoReplyEnabled: autoReplyEnabled,
                instagramPublicTemplate: selectedPublicTemplate,
                instagramPrivateTemplate: selectedPrivateTemplate,
            } as any);
            setSuccessMessage('Configurações de resposta automática salvas!');
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Erro ao salvar configurações.');
        }
    };

    const getPublicTemplatePreview = () => {
        return PUBLIC_REPLY_TEMPLATES.find(t => t.id === selectedPublicTemplate)?.template || '';
    };

    const getPrivateTemplatePreview = () => {
        return PRIVATE_REPLY_TEMPLATES.find(t => t.id === selectedPrivateTemplate)?.template || '';
    };

    return (
        <div className="animate-fade-in text-dark-text-primary">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                {onBack ? (
                    <button onClick={onBack} className="glass hover:bg-white/10 p-2.5 rounded-xl text-dark-text-secondary transition-all duration-300">
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                ) : onNavigate && (
                    <button onClick={() => onNavigate('home')} className="glass hover:bg-white/10 p-2.5 rounded-xl text-dark-text-secondary transition-all duration-300">
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                )}
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 gradient-instagram rounded-2xl flex items-center justify-center glow-instagram">
                        <InstagramIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Instagram</h1>
                        <p className="text-sm text-dark-text-secondary">Gerencie sua integração com Instagram</p>
                    </div>
                </div>
                {onNavigate && (
                    <button
                        onClick={() => onNavigate('facebook-integration-tutorial')}
                        className="ml-auto flex items-center gap-2 text-sm text-brand-primary hover:text-white transition-all duration-300 glass px-4 py-2.5 rounded-xl"
                    >
                        <HelpCircleIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Guia de Integração</span>
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveTab('connect')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'connect'
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'glass text-dark-text-secondary hover:text-white'
                        }`}
                >
                    Conectar Conta
                </button>
                <button
                    onClick={() => setActiveTab('accounts')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'accounts'
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'glass text-dark-text-secondary hover:text-white'
                        }`}
                >
                    Contas Conectadas
                </button>
                <button
                    onClick={() => setActiveTab('autoresponder')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === 'autoresponder'
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                            : 'glass text-dark-text-secondary hover:text-white'
                        }`}
                >
                    Respostas Automáticas
                </button>
            </div>

            {/* Mensagens de Erro/Sucesso */}
            {error && (
                <div className="badge-danger p-4 rounded-xl flex items-start gap-3 mb-6 border border-red-500/30">
                    <AlertTriangleIcon className="flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}
            {successMessage && (
                <div className="badge-success p-4 rounded-xl flex items-start gap-3 mb-6 border border-green-500/30 glow-success">
                    <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{successMessage}</p>
                </div>
            )}

            {/* Tab Content */}
            {activeTab === 'connect' && (
                <div className="card-premium p-6">
                    {isLoading ? (
                        <div className="text-center py-10">
                            <SpinnerIcon className="mx-auto h-10 w-10 text-brand-primary animate-spin" />
                            <p className="mt-4 text-dark-text-secondary">Redirecionando para o Facebook...</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-sm text-dark-text-secondary space-y-4">
                                <p>Para usar este recurso a conta deve ser <strong className="text-white">Instagram Profissional (Empresa ou Criador de Conteúdo)</strong>. Para responder comentários e enviar mensagens no Direct, a conta precisa estar <strong className="text-white">vinculada a uma Página do Facebook</strong>.</p>

                                <div className="p-4 bg-slate-800/50 rounded-lg border border-dark-border">
                                    <p className="font-semibold text-dark-text-primary mb-2">Permissões Meta solicitadas:</p>
                                    <code className="text-xs text-slate-400 font-mono bg-dark-bg p-2 rounded-md block break-words">public_profile, instagram_basic, instagram_manage_comments, pages_show_list, pages_read_engagement, pages_manage_metadata, instagram_manage_messages, instagram_content_publish, instagram_manage_insights</code>
                                </div>

                                <p>Essas permissões permitem conectar sua conta, publicar posts orgânicos, responder comentários e mensagens, e exibir métricas de desempenho diretamente pelo painel.</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5">
                                <label htmlFor="confirm-checkbox" className="flex items-start gap-3 cursor-pointer group p-3 rounded-xl hover:bg-white/5 transition-colors">
                                    <input
                                        id="confirm-checkbox"
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => setIsChecked(!isChecked)}
                                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-primary bg-slate-800 border-brand-primary/30 rounded-md focus:ring-brand-primary cursor-pointer"
                                    />
                                    <span className="text-sm text-dark-text-secondary group-hover:text-white transition-colors">
                                        Confirmo que a conta é (ou será) profissional e entendo os requisitos acima.
                                    </span>
                                </label>

                                <button
                                    onClick={handleConnectClick}
                                    disabled={!isChecked}
                                    className={`mt-6 w-full flex items-center justify-center gap-3 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 ${isChecked
                                        ? 'gradient-instagram glow-instagram hover:brightness-110'
                                        : 'bg-slate-700/50 opacity-50 cursor-not-allowed'
                                        }`}
                                >
                                    <InstagramIcon className="h-5 w-5" />
                                    <span>Conectar com Facebook/Instagram</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}

            {activeTab === 'accounts' && (
                <div className="card-premium p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Contas Conectadas</h3>
                        <button
                            onClick={handleConnectClick}
                            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:brightness-110 transition-all"
                        >
                            + Adicionar Conta
                        </button>
                    </div>

                    {connectedAccounts.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 mx-auto mb-4 bg-slate-800/50 rounded-2xl flex items-center justify-center">
                                <InstagramIcon className="h-10 w-10 text-slate-600" />
                            </div>
                            <h4 className="text-lg font-medium text-white mb-2">Nenhuma conta conectada</h4>
                            <p className="text-dark-text-secondary text-sm mb-6">
                                Conecte sua conta do Instagram para começar a usar os recursos de automação.
                            </p>
                            <button
                                onClick={() => setActiveTab('connect')}
                                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium rounded-xl hover:brightness-110 transition-all"
                            >
                                Conectar Primeira Conta
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-800/50 text-slate-400 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-3">Conta</th>
                                        <th className="px-4 py-3">Conexões</th>
                                        <th className="px-4 py-3">Vence em</th>
                                        <th className="px-4 py-3">Situação</th>
                                        <th className="px-4 py-3">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {connectedAccounts.map((account) => (
                                        <tr key={account.id} className="hover:bg-slate-800/30">
                                            <td className="px-4 py-3 font-medium text-white">{account.username}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-pink-400">IG</span>
                                                {account.platform === 'facebook' && <span className="ml-2 text-blue-400">Page</span>}
                                            </td>
                                            <td className="px-4 py-3">{account.expiresIn} dias</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${account.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                        account.status === 'expired' ? 'bg-red-500/20 text-red-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {account.status === 'active' ? 'Ativo' : account.status === 'expired' ? 'Expirado' : 'Pendente'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors" title="Atualizar">
                                                        <RefreshCwIcon className="h-4 w-4 text-slate-400" />
                                                    </button>
                                                    <button className="p-2 hover:bg-red-500/20 rounded-lg transition-colors" title="Remover">
                                                        <TrashIcon className="h-4 w-4 text-red-400" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'autoresponder' && (
                <div className="space-y-6">
                    {/* Toggle de Ativação */}
                    <div className="card-premium p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-1">Respostas Automáticas</h3>
                                <p className="text-sm text-dark-text-secondary">Responda automaticamente a comentários com links de afiliado</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={autoReplyEnabled}
                                    onChange={(e) => setAutoReplyEnabled(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-pink-500 peer-checked:to-purple-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Resposta Pública */}
                    <div className="card-premium p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            💬 Resposta Pública Automática
                        </h3>
                        <p className="text-sm text-dark-text-secondary mb-4">
                            Esta mensagem será postada como resposta pública ao comentário do usuário.
                        </p>

                        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                            Selecione o modelo de resposta pública
                        </label>
                        <select
                            value={selectedPublicTemplate}
                            onChange={(e) => setSelectedPublicTemplate(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white mb-4"
                        >
                            {PUBLIC_REPLY_TEMPLATES.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>

                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <p className="text-xs text-slate-400 mb-2">Pré-visualização</p>
                            <p className="text-sm text-white whitespace-pre-wrap">{getPublicTemplatePreview()}</p>
                        </div>
                    </div>

                    {/* Resposta Privada */}
                    <div className="card-premium p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            ✉️ Resposta Privada Automática
                        </h3>
                        <p className="text-sm text-dark-text-secondary mb-4">
                            Esta mensagem será enviada via Direct Message para o usuário.
                        </p>

                        <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                            Selecione o modelo de resposta privada
                        </label>
                        <select
                            value={selectedPrivateTemplate}
                            onChange={(e) => setSelectedPrivateTemplate(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white mb-4"
                        >
                            {PRIVATE_REPLY_TEMPLATES.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>

                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                            <p className="text-xs text-slate-400 mb-2">Pré-visualização</p>
                            <p className="text-sm text-white whitespace-pre-wrap">{getPrivateTemplatePreview()}</p>
                        </div>
                    </div>

                    {/* Variáveis Disponíveis */}
                    <div className="card-premium p-6">
                        <h4 className="text-md font-semibold text-white mb-3">📝 Variáveis Disponíveis</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                                <code className="px-2 py-1 bg-slate-800 rounded text-pink-400">{'{FIRST_NAME}'}</code>
                                <span className="text-dark-text-secondary">Nome do usuário</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="px-2 py-1 bg-slate-800 rounded text-pink-400">{'{AFFILIATE_LINK}'}</code>
                                <span className="text-dark-text-secondary">Link de afiliado</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="px-2 py-1 bg-slate-800 rounded text-pink-400">{'{PRODUCT_NAME}'}</code>
                                <span className="text-dark-text-secondary">Nome do produto</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <code className="px-2 py-1 bg-slate-800 rounded text-pink-400">{'{PRODUCT_PRICE}'}</code>
                                <span className="text-dark-text-secondary">Preço do produto</span>
                            </div>
                        </div>
                    </div>

                    {/* Botão Salvar */}
                    <button
                        onClick={handleSaveAutoReply}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl hover:brightness-110 transition-all glow-instagram"
                    >
                        Salvar Configurações de Resposta Automática
                    </button>
                </div>
            )}

            <ConsentWarningModal
                isOpen={showConsentModal}
                onClose={() => setShowConsentModal(false)}
                onConfirm={proceedToConnect}
            />
        </div>
    );
};