import React, { useState, useCallback } from 'react';
import { getShopeeProductDetailsFromUrl, generateShopeeOfferMessageFromApi, Product, generateShopeeLinkFromApi } from '../services/geminiService';
import { SearchIcon, MagicWandIcon, SpinnerIcon, AlertTriangleIcon, TelegramIcon } from './Icons';
import { useSettings } from '../hooks/useSettings';

export const TelegramShopeePage: React.FC = () => {
    const { settings, isLoading: isLoadingSettings } = useSettings();
    const [productUrl, setProductUrl] = useState('');
    const [productDetails, setProductDetails] = useState<Product | null>(null);
    const [offerMessage, setOfferMessage] = useState('');

    const [isLoadingProduct, setIsLoadingProduct] = useState(false);
    const [isLoadingMessage, setIsLoadingMessage] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const isConfigured = settings.telegramBotToken && settings.telegramChatId && settings.shopeeAffiliateId;

    const handleFetchProduct = useCallback(async () => {
        if (!productUrl.trim()) {
            setError("Por favor, insira o link do produto Shopee.");
            return;
        }
        setIsLoadingProduct(true);
        setError(null);
        setProductDetails(null);
        setOfferMessage('');
        try {
            const result = await getShopeeProductDetailsFromUrl(productUrl);
            if (result.error) {
                setError(result.error);
                setProductDetails(null);
            } else {
                setProductDetails(result);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Ocorreu um erro ao buscar os detalhes do produto. Verifique o link e tente novamente.");
            setProductDetails(null);
        } finally {
            setIsLoadingProduct(false);
        }
    }, [productUrl]);

    const handleGenerateMessage = useCallback(async () => {
        if (!productDetails) return;
        setIsLoadingMessage(true);
        setError(null);
        try {
            const generated = await generateShopeeOfferMessageFromApi(productDetails);
            setOfferMessage(generated);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Ocorreu um erro ao gerar a mensagem com IA.");
        } finally {
            setIsLoadingMessage(false);
        }
    }, [productDetails]);
    
    const handleSendOffer = useCallback(async () => {
        if (!isConfigured || !offerMessage || !productDetails) {
            setError("Preencha todos os campos, busque um produto e gere uma mensagem antes de enviar.");
            return;
        }
        setIsSending(true);
        setError(null);
        try {
            const affiliateLink = await generateShopeeLinkFromApi(productDetails.product_url, settings.shopeeAffiliateId, []);

            const payload = {
                chat_id: settings.telegramChatId,
                photo: productDetails.image_url,
                caption: offerMessage,
                parse_mode: 'HTML',
                reply_markup: {
                    inline_keyboard: [[{ text: "Comprar Agora 🛒", url: affiliateLink }]]
                }
            };

            const response = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendPhoto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!result.ok) {
                throw new Error(result.description || 'Erro desconhecido retornado pela API do Telegram.');
            }

            alert('Oferta enviada com sucesso!');

        } catch (err) {
            console.error("Error sending Telegram message:", err);
            const errorMessage = err instanceof Error ? err.message : String(err);
            if (errorMessage.toLowerCase().includes("chat not found")) {
                setError("Falha ao enviar: Chat não encontrado. Verifique o ID do Chat/Canal e se o bot é administrador do mesmo.");
            } else {
                 setError(`Falha ao enviar oferta: ${errorMessage}`);
            }
        } finally {
            setIsSending(false);
        }
    }, [settings, offerMessage, productDetails, isConfigured]);
    
    if (isLoadingSettings) {
        return (
            <div className="flex justify-center items-center h-full">
                <SpinnerIcon />
                <span className="ml-2">Carregando configurações...</span>
            </div>
        );
    }

    const renderProductDetails = () => (
        productDetails && (
            <div className="mt-6 space-y-4">
                <hr className="border-dark-border" />
                <h2 className="text-lg font-semibold">Detalhes do Produto Encontrado</h2>
                <div className="bg-slate-800 p-4 rounded-lg border border-dark-border flex items-start gap-4">
                    <img src={productDetails.image_url} alt={productDetails.title} className="w-24 h-24 object-cover rounded-md bg-slate-700" />
                    <div className="flex-1">
                        <p className="font-semibold text-dark-text-primary line-clamp-2">{productDetails.title}</p>
                        <p className="text-purple-400 font-bold text-lg mt-1">{productDetails.price}</p>
                    </div>
                </div>
                <button onClick={handleGenerateMessage} disabled={isLoadingMessage} className="w-full flex items-center justify-center gap-2 bg-brand-secondary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-brand-secondary/90 disabled:opacity-50">
                    {isLoadingMessage ? <SpinnerIcon /> : <MagicWandIcon className="h-5 w-5"/>}
                    <span>{isLoadingMessage ? 'Gerando Mensagem...' : 'Gerar Mensagem da Oferta com IA'}</span>
                </button>
            </div>
        )
    );

    const renderMessageComposer = () => (
        productDetails && (
            <div className="mt-6">
                <hr className="border-dark-border" />
                <div className="mt-6">
                    <label htmlFor="offerMessage" className="block text-sm font-medium text-dark-text-secondary mb-2">Mensagem Final</label>
                    <textarea id="offerMessage" rows={8} value={offerMessage} onChange={e => setOfferMessage(e.target.value)} className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary"></textarea>
                </div>
            </div>
        )
    );

    return (
        <div className="animate-fade-in">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Telegram - Oferta Rápida Shopee</h1>
                <p className="text-md text-dark-text-secondary">Envie ofertas de produtos específicos da Shopee para seus canais do Telegram.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls Column */}
                <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8 space-y-6">
                     {!isConfigured ? (
                         <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-300 p-4 rounded-lg flex items-start gap-3">
                            <AlertTriangleIcon />
                            <div>
                                <h3 className="font-bold">Configuração Necessária</h3>
                                <p className="text-sm">Por favor, configure o Token do Bot, ID do Chat e seu ID de Afiliado no <span className="font-bold">Painel Administrativo</span> para usar esta ferramenta.</p>
                            </div>
                        </div>
                    ) : (
                         <div className="bg-indigo-900/40 border border-indigo-700 text-indigo-300 p-4 rounded-lg">
                            <h3 className="font-bold">Configurações Carregadas</h3>
                            <p className="text-sm">As informações de Bot, Canal e Afiliado foram carregadas do Painel Administrativo. Para alterá-las, vá para a seção de Admin.</p>
                        </div>
                    )}
                    <div>
                        <label htmlFor="productUrl" className="block text-sm font-medium text-dark-text-secondary mb-2">Link do Produto Shopee</label>
                        <div className="flex gap-2">
                           <textarea id="productUrl" rows={2} value={productUrl} onChange={e => setProductUrl(e.target.value)} className="flex-grow bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary" placeholder="Cole o link do produto aqui..." disabled={!isConfigured || isSending}></textarea>
                           <button onClick={handleFetchProduct} disabled={isLoadingProduct || !isConfigured || isSending} className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-2.5 px-4 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50">
                                {isLoadingProduct ? <SpinnerIcon /> : <SearchIcon className="h-5 w-5"/>}
                           </button>
                        </div>
                    </div>

                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    
                    {isLoadingProduct && <div className="text-center text-dark-text-secondary">Buscando produto...</div>}

                    {renderProductDetails()}
                    {renderMessageComposer()}
                </div>

                {/* Preview Column */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold text-dark-text-primary">Pré-visualização</h2>
                    <div className="bg-[#0E1621] p-2 rounded-xl border border-dark-border h-full min-h-[500px] flex flex-col">
                        <div className="flex-grow p-4 overflow-y-auto">
                            <div className="flex justify-end">
                                <div className="bg-[#2B5278] text-white rounded-l-xl rounded-t-xl p-1 max-w-sm flex flex-col">
                                    {productDetails?.image_url && (
                                        <img src={productDetails.image_url} alt="Preview" className="rounded-t-lg w-full h-auto object-cover" />
                                    )}
                                    <div className="p-3">
                                      <p className="whitespace-pre-wrap break-words">{offerMessage || (productDetails ? "Clique em 'Gerar Mensagem'..." : "Aguardando detalhes do produto...")}</p>
                                      <div className="text-right text-xs text-gray-300 mt-2">10:30 PM</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto p-2">
                            <a href={productDetails?.product_url} target="_blank" rel="noopener noreferrer" className={`block w-full text-center bg-[#182533] text-blue-400 rounded-md py-3 font-semibold hover:bg-opacity-80 transition-opacity ${!productDetails && 'hidden'}`}>
                                Comprar Agora 🛒
                            </a>
                            <button
                                onClick={handleSendOffer}
                                disabled={isSending || !offerMessage || !productDetails || !isConfigured}
                                className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed mt-4 transition-colors"
                                title={!offerMessage ? "Gere uma mensagem primeiro" : "Enviar oferta para o Telegram"}
                            >
                                {isSending ? <SpinnerIcon /> : <TelegramIcon className="h-5 w-5" />}
                                <span>{isSending ? 'Enviando...' : 'Enviar Oferta'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};