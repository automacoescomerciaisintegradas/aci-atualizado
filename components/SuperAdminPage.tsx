import React, { useState } from 'react';
import { Key, Send, Instagram, CreditCard, Save, Eye, EyeOff, Shield, Database, Users } from 'lucide-react';
import type { Page } from '../App';

interface SuperAdminPageProps {
    onBack?: () => void;
    onNavigate?: (page: Page) => void;
}

export const SuperAdminPage: React.FC<SuperAdminPageProps> = ({ onBack, onNavigate }) => {
    const [telegramToken, setTelegramToken] = useState('');
    const [telegramBotUsername, setTelegramBotUsername] = useState('');
    const [showTelegramToken, setShowTelegramToken] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleSaveTelegram = async () => {
        setIsSaving(true);
        setSuccessMessage('');

        try {
            // Save Telegram bot configuration to API
            const response = await fetch('/api/integrations/telegram/configure', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': 'super-admin'
                },
                body: JSON.stringify({
                    botToken: telegramToken,
                    botUsername: telegramBotUsername,
                    isMasterBot: true
                })
            });

            if (response.ok) {
                const data = await response.json();
                setSuccessMessage(data.message || 'Configurações do Telegram salvas com sucesso!');
                
                // Clear form after successful save
                setTelegramToken('');
                setTelegramBotUsername('');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
            }

            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            setSuccessMessage(`Erro: ${error.message || 'Falha ao salvar configurações'}`);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Shield className="w-8 h-8 text-yellow-400" />
                            <h1 className="text-3xl font-bold text-white">🔐 Super Administrador</h1>
                        </div>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                ← Voltar
                            </button>
                        )}
                    </div>
                    <p className="text-slate-300">Configurações avançadas e privilégios de super administrador</p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
                        ✅ {successMessage}
                    </div>
                )}

                {/* Super Admin Info */}
                <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-yellow-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-yellow-500/20 rounded-xl">
                            <Shield className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Privilégios de Super Admin</h2>
                            <p className="text-sm text-slate-300">Você tem acesso total ao sistema</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-white/5 rounded-lg">
                            <Users className="w-5 h-5 text-blue-400 mb-2" />
                            <h3 className="text-sm font-semibold text-white mb-1">Gerenciar Usuários</h3>
                            <p className="text-xs text-slate-400">Controle total sobre contas</p>
                        </div>

                        <div className="p-4 bg-white/5 rounded-lg">
                            <Database className="w-5 h-5 text-green-400 mb-2" />
                            <h3 className="text-sm font-semibold text-white mb-1">Banco de Dados</h3>
                            <p className="text-xs text-slate-400">Acesso direto aos dados</p>
                        </div>

                        <div className="p-4 bg-white/5 rounded-lg">
                            <Key className="w-5 h-5 text-purple-400 mb-2" />
                            <h3 className="text-sm font-semibold text-white mb-1">API Keys Master</h3>
                            <p className="text-xs text-slate-400">Configurar chaves globais</p>
                        </div>
                    </div>
                </div>

                {/* Telegram Bot Configuration */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <Send className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Telegram Bot Master</h2>
                            <p className="text-sm text-slate-300">Configure o bot principal do sistema</p>
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
                                placeholder="@ACIMasterBot"
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
                                💡 Bot master usado para notificações e logs do sistema
                            </p>
                        </div>

                        <button
                            onClick={handleSaveTelegram}
                            disabled={isSaving || !telegramToken || !telegramBotUsername}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                        >
                            <Save className="w-5 h-5" />
                            {isSaving ? 'Salvando...' : 'Salvar Configuração Master'}
                        </button>
                    </div>
                </div>

                {/* Instagram Integration */}
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
                                    // Get user ID from localStorage or use a default for super admin
                                    const userId = localStorage.getItem('userId') || 'super-admin';
                                    
                                    const response = await fetch('/api/integrations/instagram/auth', {
                                        headers: {
                                            'X-User-Id': userId
                                        }
                                    });

                                    if (response.ok) {
                                        const data: any = await response.json();
                                        if (data.success && data.url) {
                                            window.location.href = data.url;
                                        } else {
                                            throw new Error(data.message || 'Erro na resposta da API');
                                        }
                                    } else {
                                        const errorData = await response.json();
                                        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
                                    }
                                } catch (error: any) {
                                    console.error('Erro ao conectar Instagram:', error);
                                    alert(`Erro ao conectar com Instagram: ${error.message || 'Tente novamente.'}`);
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

                {/* Advanced Settings */}
                <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl p-6 border border-red-500/30">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-500/20 rounded-xl">
                            <Database className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Configurações Avançadas</h2>
                            <p className="text-sm text-slate-300">Acesso a recursos administrativos do sistema</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button 
                            onClick={() => onNavigate?.('admin')}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                        >
                            <h3 className="text-sm font-semibold text-white mb-1">Gerenciar Usuários</h3>
                            <p className="text-xs text-slate-400">Ver, editar e remover usuários</p>
                        </button>

                        <button 
                            onClick={() => alert('Funcionalidade de Logs do Sistema em desenvolvimento')}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                        >
                            <h3 className="text-sm font-semibold text-white mb-1">Logs do Sistema</h3>
                            <p className="text-xs text-slate-400">Visualizar logs e atividades</p>
                        </button>

                        <button 
                            onClick={() => onNavigate?.('analytics')}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                        >
                            <h3 className="text-sm font-semibold text-white mb-1">Estatísticas Globais</h3>
                            <p className="text-xs text-slate-400">Métricas de uso do sistema</p>
                        </button>

                        <button 
                            onClick={() => alert('Funcionalidade de Configurar Limites em desenvolvimento')}
                            className="p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors"
                        >
                            <h3 className="text-sm font-semibold text-white mb-1">Configurar Limites</h3>
                            <p className="text-xs text-slate-400">Rate limits e quotas</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
