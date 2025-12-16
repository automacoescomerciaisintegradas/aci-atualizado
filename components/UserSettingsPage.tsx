import React, { useState } from 'react';
import { Key, Send, Instagram, CreditCard, Save, Eye, EyeOff } from 'lucide-react';
import type { Page } from '../App';

interface UserSettingsPageProps {
    onBack?: () => void;
    onNavigate?: (page: Page) => void;
}

export const UserSettingsPage: React.FC<UserSettingsPageProps> = ({ onBack, onNavigate }) => {
    const [telegramToken, setTelegramToken] = useState('');
    const [telegramBotUsername, setTelegramBotUsername] = useState('');
    const [instagramToken, setInstagramToken] = useState('');
    const [instagramUsername, setInstagramUsername] = useState('');
    const [showTelegramToken, setShowTelegramToken] = useState(false);
    const [showInstagramToken, setShowInstagramToken] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSaveTelegram = async () => {
        setIsSaving(true);
        setSuccessMessage('');

        try {
            // Aqui você faria a chamada para a API para salvar os dados
            // await apiClient.saveApiKey({ service: 'telegram', token: telegramToken, username: telegramBotUsername });

            // Simulação
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSuccessMessage('Configurações do Telegram salvas com sucesso!');

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveInstagram = async () => {
        setIsSaving(true);
        setSuccessMessage('');

        try {
            // Aqui você faria a chamada para a API para salvar os dados
            // await apiClient.saveApiKey({ service: 'instagram', token: instagramToken, username: instagramUsername });

            // Simulação
            await new Promise(resolve => setTimeout(resolve, 1000));
            setSuccessMessage('Configurações do Instagram salvas com sucesso!');

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Erro ao salvar:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">⚙️ Minhas Configurações</h1>
                    <p className="text-slate-300">Configure suas integrações e APIs para usar as automações</p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
                        ✅ {successMessage}
                    </div>
                )}

                {/* Telegram Configuration */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <Send className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Telegram Bot</h2>
                            <p className="text-sm text-slate-300">Configure seu bot do Telegram</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Nome do Bot (Username)
                            </label>
                            <input
                                type="text"
                                value={telegramBotUsername}
                                onChange={(e) => setTelegramBotUsername(e.target.value)}
                                placeholder="@MeuBot"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Token do Bot
                            </label>
                            <div className="relative">
                                <input
                                    type={showTelegramToken ? 'text' : 'password'}
                                    value={telegramToken}
                                    onChange={(e) => setTelegramToken(e.target.value)}
                                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                                    className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowTelegramToken(!showTelegramToken)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showTelegramToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-slate-400">
                                💡 Obtenha seu token em: <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@BotFather</a>
                            </p>
                        </div>

                        <button
                            onClick={handleSaveTelegram}
                            disabled={isSaving || !telegramToken || !telegramBotUsername}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving ? 'Salvando...' : 'Salvar Telegram'}
                        </button>
                    </div>
                </div>

                {/* Instagram Configuration */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-pink-500/20 rounded-xl">
                            <Instagram className="w-6 h-6 text-pink-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Instagram</h2>
                            <p className="text-sm text-slate-300">Conecte sua conta profissional do Instagram</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                            <p className="text-sm text-slate-300 mb-3">
                                💡 <strong>Como conectar:</strong>
                            </p>
                            <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
                                <li>Você precisa ter uma conta Instagram Profissional ou Business</li>
                                <li>Sua conta deve estar conectada a uma Página do Facebook</li>
                                <li>Clique no botão abaixo para conectar via Facebook</li>
                            </ol>
                        </div>

                        <button
                            onClick={async () => {
                                try {
                                    // Chamar API para obter URL do OAuth
                                    const response = await fetch('/api/integrations/instagram/auth', {
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                                        }
                                    });

                                    if (response.ok) {
                                        const { url } = await response.json();
                                        // Redirecionar para Facebook OAuth
                                        window.location.href = url;
                                    } else {
                                        throw new Error('Erro ao iniciar autenticação');
                                    }
                                } catch (error) {
                                    console.error('Erro ao conectar Instagram:', error);
                                    alert('Erro ao conectar com Instagram. Tente novamente.');
                                }
                            }}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-colors"
                        >
                            <Instagram className="w-5 h-5" />
                            Conectar Instagram via Facebook
                        </button>

                        <p className="text-xs text-slate-400 text-center">
                            🔒 Suas credenciais são armazenadas com segurança e nunca são compartilhadas.
                        </p>
                    </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-500/20 rounded-xl">
                            <CreditCard className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Créditos e Pagamentos</h2>
                            <p className="text-sm text-slate-300">Gerencie seus créditos para usar as automações</p>
                        </div>
                    </div>

                    <p className="text-slate-300 mb-4">
                        Para usar as funcionalidades de postagem automática, você precisa ter créditos. Compre créditos via PIX de forma rápida e segura!
                    </p>

                    <button
                        onClick={() => onNavigate && onNavigate('precos')}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors"
                    >
                        <CreditCard className="w-5 h-5" />
                        Comprar Créditos via PIX
                    </button>
                </div>
            </div>
        </div>
    );
};
