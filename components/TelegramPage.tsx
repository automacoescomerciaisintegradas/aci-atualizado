import React, { useState, useCallback, useEffect } from 'react';
import { generateTelegramMessageFromApi } from '../services/geminiService';
import { TelegramIcon, MagicWandIcon, SpinnerIcon, AlertTriangleIcon } from './Icons';
import { useSettings } from '../hooks/useSettings';

export const TelegramPage: React.FC = () => {
    const { settings, isLoading: isLoadingSettings } = useSettings();

    const [botToken, setBotToken] = useState('');
    const [chatId, setChatId] = useState('');
    const [messageTopic, setMessageTopic] = useState('');
    const [message, setMessage] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (!isLoadingSettings) {
            setBotToken(settings.telegramBotToken);
            setChatId(settings.telegramChatId);
        }
    }, [settings, isLoadingSettings]);

    const handleGenerateMessage = useCallback(async () => {
        if (!messageTopic.trim()) {
            setError("Por favor, descreva o tópico para gerar a mensagem.");
            return;
        }
        setIsGenerating(true);
        setError(null);
        try {
            const generated = await generateTelegramMessageFromApi(messageTopic);
            setMessage(generated);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Ocorreu um erro ao gerar a mensagem com IA. Tente novamente.");
        } finally {
            setIsGenerating(false);
        }
    }, [messageTopic]);

    const handleSendMessage = useCallback(async () => {
        if (!botToken || !chatId || !message) {
            setError("Por favor, preencha o Token do Bot, ID do Chat e a mensagem.");
            return;
        }
        setIsSending(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                chat_id: chatId,
                text: message,
            });

            const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage?${params.toString()}`);

            const result = await response.json();
            if (!result.ok) {
                throw new Error(result.description || 'Erro desconhecido retornado pela API do Telegram.');
            }

            alert('Mensagem enviada com sucesso!');

        } catch (err) {
            console.error("Error sending Telegram message:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            if (errorMessage.toLowerCase().includes("chat not found")) {
                setError("Falha ao enviar: Chat não encontrado. Verifique o ID do Chat/Canal e se o bot é administrador do mesmo.");
            } else {
                setError(`Falha ao enviar mensagem: ${errorMessage}`);
            }
        } finally {
            setIsSending(false);
        }
    }, [botToken, chatId, message]);

    if (isLoadingSettings) {
        return (
            <div className="flex justify-center items-center h-full">
                <SpinnerIcon />
                <span className="ml-2">Carregando configurações...</span>
            </div>
        );
    }
    
    const isConfigured = settings.telegramBotToken && settings.telegramChatId;

    return (
        <div className="animate-fade-in">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Disparador Telegram</h1>
                <p className="text-md text-dark-text-secondary">Crie e visualize mensagens para enviar aos seus canais do Telegram.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Coluna de Configuração e Criação */}
                <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8 space-y-8">
                    
                    {!isConfigured ? (
                         <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-300 p-4 rounded-lg flex items-start gap-3">
                            <AlertTriangleIcon />
                            <div>
                                <h3 className="font-bold">Configuração Necessária</h3>
                                <p className="text-sm">Por favor, preencha o Token do Bot e o ID do Chat no <span className="font-bold">Painel Administrativo</span> para usar esta ferramenta.</p>
                            </div>
                        </div>
                    ) : (
                         <div className="bg-indigo-900/40 border border-indigo-700 text-indigo-300 p-4 rounded-lg">
                            <h3 className="font-bold">Configurações Carregadas</h3>
                            <p className="text-sm">O Token do Bot e o ID do Chat foram carregados do Painel Administrativo. Para alterá-los, vá para a seção de Admin.</p>
                        </div>
                    )}


                    {/* Bot Config */}
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="botToken" className="block text-sm font-medium text-dark-text-secondary mb-2">
                                Token do Bot do Telegram
                            </label>
                            <input type="password" id="botToken" value={botToken} readOnly className="w-full bg-slate-900 border border-dark-border rounded-lg p-3 text-dark-text-secondary placeholder-gray-500 cursor-not-allowed" placeholder="Configure no Painel Administrativo" />
                        </div>
                        <div>
                            <label htmlFor="chatId" className="block text-sm font-medium text-dark-text-secondary mb-2">
                                ID do Chat/Canal
                            </label>
                            <input type="text" id="chatId" value={chatId} readOnly className="w-full bg-slate-900 border border-dark-border rounded-lg p-3 text-dark-text-secondary placeholder-gray-500 cursor-not-allowed" placeholder="Configure no Painel Administrativo" />
                            <p className="text-xs text-dark-text-secondary mt-2">
                                Para canais públicos, use o formato <code className="bg-slate-700 px-1 rounded">@nome_do_canal</code>. Para privados, use o ID numérico (ex: <code className="bg-slate-700 px-1 rounded">-100123...</code>). O bot deve ser administrador do canal.
                            </p>
                        </div>
                    </div>

                    <hr className="border-dark-border" />
                    
                    {/* AI Message Generator */}
                    <div className="space-y-4">
                         <h2 className="text-lg font-semibold">Gerador de Conteúdo com IA</h2>
                         <div>
                            <label htmlFor="messageTopic" className="block text-sm font-medium text-dark-text-secondary mb-2">
                                Descreva o que você quer na mensagem
                            </label>
                            <textarea id="messageTopic" rows={2} value={messageTopic} onChange={e => setMessageTopic(e.target.value)} className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary" placeholder="Ex: promoção de fones de ouvido com 50% de desconto..." disabled={!isConfigured}></textarea>
                        </div>
                        <button onClick={handleGenerateMessage} disabled={isGenerating || !messageTopic || !isConfigured} className="w-full flex items-center justify-center gap-2 bg-brand-secondary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-brand-secondary/90 disabled:opacity-50 transition-opacity duration-300">
                           {isGenerating ? <SpinnerIcon /> : <MagicWandIcon className="h-5 w-5"/> }
                           <span>{isGenerating ? 'Gerando...' : 'Gerar com IA'}</span>
                        </button>
                         {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </div>

                     <hr className="border-dark-border" />

                    {/* Message Composer */}
                     <div>
                        <label htmlFor="message" className="block text-sm font-medium text-dark-text-secondary mb-2">
                            Mensagem
                        </label>
                        <textarea id="message" rows={8} value={message} onChange={e => setMessage(e.target.value)} className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary" disabled={!isConfigured}></textarea>
                    </div>

                </div>

                {/* Coluna de Preview */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-dark-text-primary">Pré-visualização</h2>
                    <div className="bg-[#0E1621] p-4 rounded-xl border border-dark-border h-full min-h-[400px]">
                        <div className="flex flex-col h-full">
                            <div className="flex-grow overflow-y-auto p-4">
                                <div className="flex justify-end">
                                    <div className="bg-[#2B5278] text-white rounded-l-xl rounded-t-xl p-3 max-w-sm">
                                        <p className="whitespace-pre-wrap break-words">{message || "Sua mensagem aparecerá aqui..."}</p>
                                        <div className="text-right text-xs text-gray-300 mt-2">10:30 PM</div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-auto p-2">
                                <div className="bg-[#182533] rounded-full p-2 flex items-center">
                                    <input type="text" readOnly value="Escreva uma mensagem..." className="bg-transparent text-gray-400 w-full outline-none px-2" />
                                    <button disabled className="text-blue-400 p-2 opacity-50">
                                        <TelegramIcon className="h-6 w-6 transform rotate-45"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                     <button
                        onClick={handleSendMessage}
                        disabled={isSending || !message || !botToken || !chatId}
                        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={!message ? "Escreva ou gere uma mensagem primeiro" : "Enviar mensagem para o Telegram"}
                    >
                        {isSending ? <SpinnerIcon /> : <TelegramIcon className="h-5 w-5" />}
                        <span>{isSending ? 'Enviando...' : 'Enviar Mensagem'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};