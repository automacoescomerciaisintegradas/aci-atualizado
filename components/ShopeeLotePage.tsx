import React, { useState, useCallback, FormEvent, useMemo, useEffect } from 'react';
import { searchShopeeProductsFromApi, generateShopeeOfferMessageFromApi, generateShopeeLinkFromApi, Product } from '../services/geminiService';
import { SearchIcon, SpinnerIcon, AlertTriangleIcon, TelegramIcon, XIcon, SettingsIcon, ClockIcon } from './Icons';
import { useSettings, Settings } from '../hooks/useSettings';

interface BatchSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentSettings: Settings;
    onSave: (newSettings: Settings) => void;
}

const BatchSettingsModal: React.FC<BatchSettingsModalProps> = ({ isOpen, onClose, currentSettings, onSave }) => {
    const [localSettings, setLocalSettings] = useState<Settings>(currentSettings);

    useEffect(() => {
        if (isOpen) {
            setLocalSettings(currentSettings);
        }
    }, [isOpen, currentSettings]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value, type } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            [id]: type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in">
            <div className="bg-dark-card rounded-xl shadow-2xl border border-dark-border w-full max-w-lg relative animate-scale-in">
                <div className="p-6 border-b border-dark-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-dark-text-primary">Preferências de Envio em Lote</h2>
                    <button onClick={onClose} className="text-dark-text-secondary hover:text-dark-text-primary transition-colors">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label htmlFor="sendInterval" className="block text-sm font-medium text-dark-text-secondary mb-2 flex items-center gap-2">
                            <ClockIcon className="h-4 w-4" />
                            Intervalo entre envios (segundos)
                        </label>
                        <input
                            type="number"
                            id="sendInterval"
                            name="sendInterval"
                            value={localSettings.sendInterval}
                            onChange={handleInputChange}
                            className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary"
                        />
                        <p className="text-xs text-dark-text-secondary mt-1">Tempo de espera para evitar bloqueios. Recomendado: 5s ou mais.</p>
                    </div>
                    <div>
                        <label htmlFor="telegramChatId" className="block text-sm font-medium text-dark-text-secondary mb-2 flex items-center gap-2">
                           <TelegramIcon className="h-4 w-4" />
                           ID do Canal/Chat de Destino
                        </label>
                         <input
                            type="text"
                            id="telegramChatId"
                            name="telegramChatId"
                            value={localSettings.telegramChatId}
                            onChange={handleInputChange}
                            className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary"
                            placeholder="@seu_canal ou -100123..."
                        />
                         <p className="text-xs text-dark-text-secondary mt-1">Atenção: Esta é uma configuração global e afetará outras ferramentas que usam o Telegram.</p>
                    </div>
                </div>
                <div className="p-6 bg-slate-900/50 border-t border-dark-border flex justify-end gap-4">
                     <button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-dark-text-primary font-bold py-2 px-4 rounded-lg">
                        Cancelar
                    </button>
                    <button onClick={handleSave} className="bg-brand-primary hover:bg-brand-primary/90 text-white font-bold py-2 px-4 rounded-lg">
                        Salvar Preferências
                    </button>
                </div>
            </div>
        </div>
    );
};


export const ShopeeLotePage: React.FC = () => {
    const { settings, saveSettings } = useSettings();
    const [keyword, setKeyword] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
    const [filterKeyword, setFilterKeyword] = useState('');
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [isSending, setIsSending] = useState<boolean>(false);
    
    const [error, setError] = useState<string | null>(null);
    const [sendStatus, setSendStatus] = useState({ message: '', progress: 0, total: 0, errors: 0 });

    const handleSearch = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;
        setIsSearching(true);
        setError(null);
        setProducts([]);
        setSelectedProducts(new Set());
        setFilterKeyword('');
        try {
            const results = await searchShopeeProductsFromApi(keyword);
            setProducts(results);
            if (results.length === 0) setError("Nenhum produto encontrado.");
        } catch (err) {
            setError('Ocorreu um erro ao buscar os produtos.');
        } finally {
            setIsSearching(false);
        }
    }, [keyword]);

    const handleToggleSelection = (index: number) => {
        const newSelection = new Set(selectedProducts);
        if (newSelection.has(index)) {
            newSelection.delete(index);
        } else {
            newSelection.add(index);
        }
        setSelectedProducts(newSelection);
    };

    const filteredProducts = useMemo(() => {
        const productsWithOriginalIndex = products.map((p, i) => ({ ...p, originalIndex: i }));
        if (!filterKeyword.trim()) {
            return productsWithOriginalIndex;
        }
        return productsWithOriginalIndex.filter(product =>
            product.title.toLowerCase().includes(filterKeyword.toLowerCase())
        );
    }, [products, filterKeyword]);

    const handleSelectAll = () => {
        const filteredIndices = new Set(filteredProducts.map(p => p.originalIndex));
        const allFilteredSelected = Array.from(filteredIndices).every(index => selectedProducts.has(index));
        
        const newSelection = new Set(selectedProducts);
        if (allFilteredSelected) {
            filteredIndices.forEach(index => newSelection.delete(index));
        } else {
            filteredIndices.forEach(index => newSelection.add(index));
        }
        setSelectedProducts(newSelection);
    };
    
    const handleSendBatch = async () => {
        setIsSending(true);
        setError(null);
        const productsToSend = Array.from(selectedProducts).map(i => products[i]);
        setSendStatus({ message: 'Iniciando envio...', progress: 0, total: productsToSend.length, errors: 0 });

        for (let i = 0; i < productsToSend.length; i++) {
            const product = productsToSend[i];
            setSendStatus(prev => ({ ...prev, message: `Gerando oferta para: ${product.title}`, progress: i + 1 }));
            
            try {
                // 1. Generate affiliate link
                const affiliateLink = await generateShopeeLinkFromApi(product.product_url, settings.shopeeAffiliateId, []);
                
                // 2. Generate offer message
                const offerMessage = await generateShopeeOfferMessageFromApi(product);
                
                // 3. Send to Telegram
                setSendStatus(prev => ({ ...prev, message: `Enviando para Telegram... (${i+1}/${productsToSend.length})`}));
                
                const params = new URLSearchParams({
                    chat_id: settings.telegramChatId,
                    photo: product.image_url,
                    caption: offerMessage,
                    parse_mode: 'HTML',
                    reply_markup: JSON.stringify({
                        inline_keyboard: [[{ text: "Ver Oferta 🛒", url: affiliateLink }]]
                    })
                });

                const tgResponse = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendPhoto?${params.toString()}`);
                const result = await tgResponse.json();

                if (!result.ok) {
                    throw new Error(result.description || `Erro no produto: ${product.title}`);
                }

                // Wait for the specified interval if it's not the last message
                if (i < productsToSend.length - 1) {
                    setSendStatus(prev => ({ ...prev, message: `Aguardando ${settings.sendInterval}s...`}));
                    await new Promise(resolve => setTimeout(resolve, settings.sendInterval * 1000));
                }
            } catch (err) {
                console.error(`Failed to send product ${product.title}:`, err);
                setSendStatus(prev => ({ ...prev, errors: prev.errors + 1 }));
            }
        }
        
        setSendStatus(prev => ({ ...prev, message: `Envio concluído! ${prev.total - prev.errors} enviados, ${prev.errors} falhas.`}));
        setIsSending(false);
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Envio em Lote - Shopee</h1>
                <p className="text-md text-dark-text-secondary">Pesquise por produtos, selecione os que deseja e envie ofertas em massa para seu canal do Telegram.</p>
            </div>

            <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8 mb-8">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="flex-grow bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                        placeholder="Ex: 'fone de ouvido bluetooth'"
                        disabled={isSearching || isSending}
                    />
                    <button
                        type="submit"
                        disabled={isSearching || isSending || !keyword}
                        className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300"
                    >
                        {isSearching ? <SpinnerIcon /> : <SearchIcon className="h-5 w-5" />}
                        <span>Pesquisar Produtos</span>
                    </button>
                </form>
            </div>
            
            {isSending && (
                <div className="bg-dark-card rounded-xl border border-dark-border p-6 mb-8">
                    <h3 className="text-lg font-semibold text-dark-text-primary mb-3">Progresso do Envio</h3>
                    <div className="flex justify-between items-center text-sm text-dark-text-secondary mb-1">
                        <span>{sendStatus.message}</span>
                        <span>{sendStatus.progress} / {sendStatus.total}</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                        <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${(sendStatus.progress / (sendStatus.total || 1)) * 100}%` }}></div>
                    </div>
                    {sendStatus.errors > 0 && <p className="text-red-400 text-sm mt-2">{sendStatus.errors} erro(s) ocorreram.</p>}
                    {sendStatus.progress === sendStatus.total && !error && <p className="text-green-400 text-sm mt-2">{sendStatus.message}</p>}
                </div>
            )}


            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-center gap-3 mb-8">
                    <AlertTriangleIcon />
                    <p>{error}</p>
                </div>
            )}
            
            {isSearching && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-dark-card border border-dark-border rounded-xl p-4 animate-pulse-fast">
                            <div className="bg-slate-700 h-40 w-full rounded-lg mb-4"></div>
                            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                            <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
                            <div className="h-10 bg-slate-700 rounded-lg w-full"></div>
                        </div>
                    ))}
                </div>
            )}

            {!isSearching && products.length > 0 && (
                <div className="bg-dark-card rounded-xl border border-dark-border p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <div className="flex-1 w-full md:w-auto">
                            <input
                                type="text"
                                value={filterKeyword}
                                onChange={(e) => setFilterKeyword(e.target.value)}
                                className="w-full bg-slate-800 border border-dark-border rounded-lg p-2 text-sm text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary"
                                placeholder="Filtrar por nome..."
                                disabled={isSending}
                            />
                        </div>
                         <div className="flex items-center gap-4 w-full md:w-auto">
                            <button onClick={() => setIsSettingsModalOpen(true)} className="flex items-center gap-2 text-sm text-dark-text-secondary hover:text-dark-text-primary transition-colors"><SettingsIcon className="h-5 w-5"/>Preferências</button>
                            <button
                                onClick={handleSendBatch}
                                disabled={isSending || selectedProducts.size === 0}
                                className="flex-grow md:flex-grow-0 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSending ? <SpinnerIcon /> : <TelegramIcon className="h-5 w-5" />}
                                <span>Enviar {selectedProducts.size} Ofertas</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-dark-text-secondary">
                            <thead className="text-xs text-dark-text-primary uppercase bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="p-4">
                                        <input type="checkbox" onChange={handleSelectAll} checked={filteredProducts.length > 0 && filteredProducts.every(p => selectedProducts.has(p.originalIndex))} className="w-4 h-4 text-brand-primary bg-slate-800 border-dark-border rounded focus:ring-brand-primary" />
                                    </th>
                                    <th scope="col" className="px-6 py-3">Produto</th>
                                    <th scope="col" className="px-6 py-3">Preço</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => (
                                    <tr key={product.originalIndex} className={`border-b border-dark-border ${selectedProducts.has(product.originalIndex) ? 'bg-brand-primary/10' : 'hover:bg-slate-800/50'}`}>
                                        <td className="w-4 p-4">
                                            <input type="checkbox" checked={selectedProducts.has(product.originalIndex)} onChange={() => handleToggleSelection(product.originalIndex)} className="w-4 h-4 text-brand-primary bg-slate-800 border-dark-border rounded focus:ring-brand-primary" />
                                        </td>
                                        <th scope="row" className="px-6 py-4 font-medium text-dark-text-primary whitespace-nowrap flex items-center gap-3">
                                            <img src={product.image_url} alt={product.title} className="w-10 h-10 object-cover rounded-md bg-slate-700" />
                                            <span className="line-clamp-2">{product.title}</span>
                                        </th>
                                        <td className="px-6 py-4 font-semibold text-purple-400">{product.price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            
            <BatchSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                currentSettings={settings}
                onSave={saveSettings}
            />
        </div>
    );
};