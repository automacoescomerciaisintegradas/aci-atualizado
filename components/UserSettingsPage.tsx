import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Eye, EyeOff, ShoppingBag, Send, Zap, Instagram } from 'lucide-react';
import type { Page } from '../App';

interface UserSettingsPageProps {
    onBack?: () => void;
    onNavigate?: (page: Page) => void;
}

export const UserSettingsPage: React.FC<UserSettingsPageProps> = ({ onBack, onNavigate }) => {
    const [telegramToken, setTelegramToken] = useState('');
    const [telegramBotUsername, setTelegramBotUsername] = useState('');
    const [shopeeAffiliateId, setShopeeAffiliateId] = useState('');
    const [showTelegramToken, setShowTelegramToken] = useState(false);
    const [showShopeeId, setShowShopeeId] = useState(false);

    // Estados de Loading individuais
    const [isSavingTelegram, setIsSavingTelegram] = useState(false);
    const [isSavingShopee, setIsSavingShopee] = useState(false);
    const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);

    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const savedShopeeId = localStorage.getItem('shopeeAffiliateId');
        if (savedShopeeId) setShopeeAffiliateId(savedShopeeId);
    }, []);

    const handleSaveTelegram = async () => {
        setIsSavingTelegram(true);
        setSuccessMessage('');
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSuccessMessage('Configurações do Telegram salvas!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setIsSavingTelegram(false);
        }
    };

    const handleSaveShopee = async () => {
        setIsSavingShopee(true);
        setSuccessMessage('');
        try {
            localStorage.setItem('shopeeAffiliateId', shopeeAffiliateId);
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSuccessMessage('ID Shopee sincronizado!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } finally {
            setIsSavingShopee(false);
        }
    };

    const handleInstagramConnect = async () => {
        setIsConnectingInstagram(true);
        try {
            const response = await fetch('/api/integrations/instagram/auth', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
            });
            if (response.ok) {
                const data = await response.json() as { url: string };
                window.location.href = data.url;
            } else {
                throw new Error('Erro ao iniciar autenticação');
            }
        } catch (error) {
            console.error(error);
            alert('Falha ao conectar Instagram. Tente novamente.');
        } finally {
            setIsConnectingInstagram(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1115] p-4 sm:p-8 md:p-12 lg:p-16 transition-all duration-500 overflow-x-hidden">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-14 md:mb-20 text-center md:text-left">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-white mb-8 transition-all group"
                    >
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Voltar ao Painel</span>
                    </button>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-br from-white via-slate-300 to-slate-600 bg-clip-text text-transparent tracking-tighter">
                        Configurações
                    </h1>
                    <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl leading-relaxed mx-auto md:mx-0">
                        Maximize sua produtividade configurando suas APIs de automação no padrão <span className="text-white">Pay-Per-Use</span>.
                    </p>
                </div>

                {/* Success Toast */}
                {successMessage && (
                    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/50 px-8 py-3 rounded-full text-emerald-400 font-bold shadow-[0_0_40px_rgba(16,185,129,0.15)]">
                            {successMessage}
                        </div>
                    </div>
                )}

                <div className="space-y-16 md:space-y-24">
                    {/* Shopee Section */}
                    <section className="group relative bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 hover:border-orange-500/20 transition-all duration-700 shadow-2xl hover:shadow-[0_0_60px_rgba(249,115,22,0.03)]">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                            <div className="flex items-center gap-6">
                                <div className="p-5 bg-orange-500/10 rounded-2xl border border-orange-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700 shadow-inner">
                                    <ShoppingBag className="w-10 h-10 text-orange-400" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-bold text-white mb-1">Shopee Afiliado</h2>
                                    <p className="text-slate-500 font-medium">Automatize a geração de links com seu ID</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-6">
                                <label className="block text-xs font-black text-slate-500 uppercase mb-4 tracking-[0.25em] ml-1">Seu ID de Afiliado</label>
                                <div className="relative">
                                    <input
                                        type={showShopeeId ? 'text' : 'password'}
                                        value={shopeeAffiliateId}
                                        onChange={(e) => setShopeeAffiliateId(e.target.value)}
                                        placeholder="Digite seu ID (ex: 5123456)"
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-500/40 transition-all text-lg"
                                    />
                                    <button
                                        onClick={() => setShowShopeeId(!showShopeeId)}
                                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                                    >
                                        {showShopeeId ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={handleSaveShopee}
                                disabled={isSavingShopee}
                                className="w-full h-16 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-orange-500/10 disabled:opacity-50 flex items-center justify-center gap-4 text-lg active:scale-[0.98]"
                            >
                                {isSavingShopee ? (
                                    <div className="w-7 h-7 border-4 border-slate-900/40 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Sincronizar Shopee ID
                                    </>
                                )}
                            </button>
                        </div>
                    </section>

                    {/* Instagram Section */}
                    <section className="group relative bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 hover:border-pink-500/20 transition-all duration-700 shadow-2xl hover:shadow-[0_0_60px_rgba(236,72,153,0.03)]">
                        <div className="flex items-center gap-6 mb-12">
                            <div className="p-5 bg-pink-500/10 rounded-2xl border border-pink-500/20 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-700">
                                <Instagram className="w-10 h-10 text-pink-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-1">Instagram Business</h2>
                                <p className="text-slate-500 font-medium">Conecte sua conta para posts automáticos</p>
                            </div>
                        </div>

                        <div className="p-8 bg-black/20 rounded-3xl border border-white/5 mb-8">
                            <div className="flex gap-4 mb-2">
                                <span className="text-pink-400">⚡</span>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Conecte sua Página do Facebook que gerencia sua conta do Instagram Profissional.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleInstagramConnect}
                            disabled={isConnectingInstagram}
                            className="w-full h-16 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:opacity-90 text-white font-black rounded-2xl transition-all shadow-xl shadow-pink-500/20 disabled:opacity-50 flex items-center justify-center gap-4 text-lg active:scale-[0.98]"
                        >
                            {isConnectingInstagram ? (
                                <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Instagram className="w-6 h-6" />
                                    Conectar via Facebook
                                </>
                            )}
                        </button>
                    </section>

                    {/* Telegram Section */}
                    <section className="group relative bg-white/[0.02] backdrop-blur-3xl rounded-[2.5rem] p-8 md:p-12 border border-white/5 hover:border-blue-500/20 transition-all duration-700 shadow-2xl hover:shadow-[0_0_60px_rgba(59,130,246,0.03)]">
                        <div className="flex items-center gap-6 mb-12">
                            <div className="p-5 bg-blue-500/10 rounded-2xl border border-blue-500/20 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-700">
                                <Send className="w-10 h-10 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-1">Telegram Bot</h2>
                                <p className="text-slate-500 font-medium">Configure seu bot via @BotFather</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Username (@)</label>
                                <input
                                    type="text"
                                    value={telegramBotUsername}
                                    onChange={(e) => setTelegramBotUsername(e.target.value)}
                                    placeholder="@SeuBot"
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all text-lg"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-xs font-black text-slate-600 uppercase tracking-[0.2em] ml-1">Token da API</label>
                                <div className="relative">
                                    <input
                                        type={showTelegramToken ? 'text' : 'password'}
                                        value={telegramToken}
                                        onChange={(e) => setTelegramToken(e.target.value)}
                                        placeholder="123456:ABC-DEF..."
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500/30 transition-all text-lg"
                                    />
                                    <button onClick={() => setShowTelegramToken(!showTelegramToken)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 hover:text-white transition-colors">
                                        {showTelegramToken ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSaveTelegram}
                            disabled={isSavingTelegram}
                            className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-500/10 disabled:opacity-50 flex items-center justify-center gap-4 text-lg active:scale-[0.98]"
                        >
                            {isSavingTelegram ? (
                                <div className="w-7 h-7 border-4 border-slate-900/40 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Salvar Token
                                </>
                            )}
                        </button>
                    </section>

                    {/* Pricing Info Section */}
                    <section className="group relative bg-[#111317] rounded-[3rem] p-10 md:p-14 border border-white/5 shadow-2xl overflow-hidden mb-12">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none transition-all group-hover:bg-purple-600/10"></div>

                        <div className="flex items-center gap-6 mb-12 relative z-10">
                            <div className="p-5 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                <Zap className="w-10 h-10 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-1">Pay-Per-Use</h2>
                                <p className="text-slate-500 font-medium">Custo real baseado no seu consumo</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 mb-16">
                            {[
                                { label: 'Instagram', value: 'R$0,27', detail: 'Por postagem' },
                                { label: 'Telegram', value: 'R$0,09', detail: 'Por envio' },
                                { label: 'IA Shopee', value: 'R$0,09', detail: '50 produtos' },
                                { label: 'GPT-4.1', value: 'R$0,012', detail: 'Por palavra' },
                                { label: 'DALL-E 3', value: 'R$0,99', detail: 'Por imagem' },
                                { label: 'WooComm', value: 'R$0,27', detail: 'Por envio' }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/[0.01] rounded-3xl p-6 border border-white/5 hover:bg-white/[0.03] transition-all hover:scale-[1.02] hover:border-white/10 cursor-default group/card">
                                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 group-hover/card:text-slate-400 transition-colors">{item.label}</div>
                                    <div className="text-2xl font-black text-white mb-1">{item.value}</div>
                                    <div className="text-[11px] text-slate-600 font-medium">{item.detail}</div>
                                </div>
                            ))}
                        </div>

                        <div className="relative z-10 p-1 bg-gradient-to-r from-purple-500/30 via-slate-500/10 to-transparent rounded-[2.5rem]">
                            <div className="bg-[#1a1c22]/90 backdrop-blur-md rounded-[2.4rem] p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-10">
                                <div className="text-center lg:text-left">
                                    <h4 className="text-2xl md:text-3xl font-black text-white mb-3 tracking-tight">Recarga com 10% de Bônus</h4>
                                    <p className="text-slate-500 font-medium max-w-md">Ganhe mais créditos em qualquer recarga realizada até <span className="text-white font-bold">10/02/2026</span>.</p>
                                </div>
                                <button
                                    onClick={() => onNavigate && onNavigate('precos' as Page)}
                                    className="px-14 py-6 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-3xl transition-all shadow-3xl shadow-purple-600/40 active:scale-95 text-xl relative group/btn overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-3">
                                        <Zap className="w-6 h-6 fill-current" />
                                        Recarregar Agora
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000"></div>
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default UserSettingsPage;
