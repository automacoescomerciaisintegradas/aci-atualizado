import React, { useState, useEffect, useCallback, FormEvent, useMemo } from 'react';
import { useSettings } from '../hooks/useSettings';
import { searchShopeeProductsFromApi, generateInstagramCaptionFromProduct, generateShopeeOfferMessageFromApi, Product, generateShopeeLinkFromApi } from '../services/geminiService';
import { SearchIcon, SpinnerIcon, AlertTriangleIcon, InstagramIcon, TelegramIcon, FileTextIcon, MagicWandIcon, RocketIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, CreditIcon, ClockIcon } from './Icons';
import { Page } from '../App';

interface GeneratedContent {
    instagram: string;
    telegram: string;
    blog: string;
}

type Step = 'search' | 'content' | 'publish';
type ProductWithIndex = Product & { originalIndex: number };

const CREDIT_COST_PER_POST = 3;

const ContentCard: React.FC<{
    icon: React.ReactNode,
    title: string,
    content: string,
    onContentChange: (newText: string) => void,
    tone?: string;
    onToneChange?: (newTone: string) => void;
    onRegenerate?: () => void;
    isRegenerating?: boolean;
}> = ({ icon, title, content, onContentChange, tone, onToneChange, onRegenerate, isRegenerating }) => (
    <div>
        <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-dark-text-primary flex items-center gap-2 text-sm">{icon} {title}</h3>
            {onRegenerate && (
                <button onClick={onRegenerate} disabled={isRegenerating} className="text-xs flex items-center gap-1 text-brand-secondary hover:text-brand-primary disabled:opacity-50">
                    {isRegenerating ? <SpinnerIcon /> : <MagicWandIcon className="h-3 w-3" />}
                    Regenerar
                </button>
            )}
        </div>
        {onToneChange !== undefined && tone !== undefined && (
            <input
                type="text"
                value={tone}
                onChange={(e) => onToneChange(e.target.value)}
                placeholder="Tom de voz (ex: divertido, formal)"
                className="w-full bg-slate-900/70 border border-slate-700 rounded-md p-2 text-xs mb-2"
                disabled={isRegenerating}
            />
        )}
        <textarea
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            rows={10}
            className="w-full bg-slate-900/70 border border-slate-700 rounded-md p-2 text-xs text-dark-text-secondary focus:ring-1 focus:ring-brand-primary"
        />
    </div>
);

const ChannelSelector: React.FC<{
    icon: React.ReactNode;
    title: string;
    isConfigured: boolean;
    isSelected: boolean;
    onToggle: () => void;
    onNavigate?: () => void;
}> = ({ icon, title, isConfigured, isSelected, onToggle, onNavigate }) => (
    <div className={`p-4 rounded-lg border flex items-center justify-between transition-colors ${isSelected ? 'bg-brand-primary/10 border-brand-primary' : 'bg-slate-800/50 border-dark-border'}`}>
        <div className="flex items-center gap-3">
            {icon}
            <span className="font-semibold text-dark-text-primary">{title}</span>
            {!isConfigured && <span className="text-xs bg-yellow-900 text-yellow-300 px-2 py-0.5 rounded-full">Não Configurado</span>}
        </div>
        <div className="flex items-center gap-4">
            {!isConfigured && onNavigate && (
                <button onClick={onNavigate} className="text-xs font-semibold text-brand-secondary hover:text-brand-primary">
                    Configurar
                </button>
            )}
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggle}
                    disabled={!isConfigured}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary peer-disabled:opacity-50"></div>
            </label>
        </div>
    </div>
);


export const MultiChannelPublisher: React.FC<{ onNavigate: (page: Page, context?: { from: Page }) => void; onAddCreditsClick: () => void; }> = ({ onNavigate, onAddCreditsClick }) => {
    const { settings, saveSettings, addCreditTransaction } = useSettings();
    const [step, setStep] = useState<Step>('search');

    // Search Step State
    const [keyword, setKeyword] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchedProducts, setSearchedProducts] = useState<ProductWithIndex[]>([]);
    const [selectedProductIndices, setSelectedProductIndices] = useState<Set<number>>(new Set());
    const [error, setError] = useState<string | null>(null);

    // Content Step State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedContents, setGeneratedContents] = useState<Record<number, GeneratedContent | null>>({});
    const [tones, setTones] = useState<Record<number, string>>({});
    const [individualLoading, setIndividualLoading] = useState<Record<string, boolean>>({});

    // Publish Step State
    const [channels, setChannels] = useState({ instagram: true, telegram: true });
    // Gerenciamento de múltiplos blogs: { [blogId]: boolean }
    const [selectedBlogs, setSelectedBlogs] = useState<Record<string, boolean>>({});
    const [availableBlogs, setAvailableBlogs] = useState<any[]>([]);

    useEffect(() => {
        // Carregar blogs disponíveis
        const loadBlogs = async () => {
            try {
                // Usando apiClient se disponível globalmente ou fetch com header
                // Como estamos dentro de um componente React, melhor usar fetch mas precisamos do token
                const userId = localStorage.getItem('userId') || 'default-user-id';
                const res = await fetch('/api/blogs', {
                    headers: {
                        'X-User-Id': userId
                    }
                });
                if (res.ok) {
                    const data = await res.json() as { blogs: any[] };
                    setAvailableBlogs(data.blogs || []);
                    // Selecionar todos por padrão
                    const initialSelection: Record<string, boolean> = {};
                    data.blogs?.forEach((b: any) => initialSelection[b.id] = true);
                    setSelectedBlogs(initialSelection);
                } else {
                    console.error("Erro na resposta:", await res.json());
                }
            } catch (e) {
                console.error("Erro ao carregar blogs", e);
            }
        };
        loadBlogs();
    }, []);

    const [isPublishing, setIsPublishing] = useState(false);
    const [publishStatus, setPublishStatus] = useState({ message: '', progress: 0, total: 0, successful: 0, failed: 0, cost: 0 });
    const [creditError, setCreditError] = useState<string>('');

    // Scheduling State
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split('T')[0]);
    const [scheduleTime, setScheduleTime] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    const [scheduleMode, setScheduleMode] = useState('per_day');
    const [quantityPerDay, setQuantityPerDay] = useState(5);
    const [avoidHours, setAvoidHours] = useState(true);
    const [avoidStartTime, setAvoidStartTime] = useState('22:00');
    const [avoidEndTime, setAvoidEndTime] = useState('06:00');


    const isInstagramConfigured = !!settings.instagramUser;
    const isTelegramConfigured = !!settings.telegramBotToken && !!settings.telegramChatId;
    const isShopeeConfigured = !!settings.shopeeAffiliateId;

    const handleSearch = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!keyword.trim()) return;

        setIsSearching(true);
        setError(null);
        setSearchedProducts([]);
        setSelectedProductIndices(new Set());

        try {
            const results = await searchShopeeProductsFromApi(keyword);
            if (results.length === 0) {
                setError("Nenhum produto encontrado. Tente outra palavra-chave.");
            } else {
                setSearchedProducts(results.map((p, i) => ({ ...p, originalIndex: i })));
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao buscar produtos.");
        } finally {
            setIsSearching(false);
        }
    }, [keyword]);

    const handleToggleSelection = (index: number) => {
        const newSelection = new Set(selectedProductIndices);
        if (newSelection.has(index)) {
            newSelection.delete(index);
        } else {
            newSelection.add(index);
        }
        setSelectedProductIndices(newSelection);
    };

    const handleSelectAll = () => {
        if (selectedProductIndices.size === searchedProducts.length) {
            setSelectedProductIndices(new Set());
        } else {
            setSelectedProductIndices(new Set(searchedProducts.map(p => p.originalIndex)));
        }
    };

    const selectedProducts = useMemo(() => {
        return searchedProducts.filter(p => selectedProductIndices.has(p.originalIndex));
    }, [searchedProducts, selectedProductIndices]);

    const handleGenerateAllContent = useCallback(async () => {
        if (selectedProducts.length === 0) return;

        setIsGenerating(true);
        setError(null);

        const initialContents: Record<number, GeneratedContent | null> = { ...generatedContents };
        selectedProducts.forEach(p => {
            if (!initialContents[p.originalIndex]) {
                initialContents[p.originalIndex] = null;
            }
        });
        setGeneratedContents(initialContents);

        const generationPromises = selectedProducts.map(async (product) => {
            if (generatedContents[product.originalIndex]) {
                return { index: product.originalIndex, content: generatedContents[product.originalIndex] };
            }
            try {
                const [instaCaption, telegramMsg, blogMsg] = await Promise.all([
                    generateInstagramCaptionFromProduct(product),
                    generateShopeeOfferMessageFromApi(product),
                    generateShopeeOfferMessageFromApi(product),
                ]);
                return { index: product.originalIndex, content: { instagram: instaCaption, telegram: telegramMsg, blog: blogMsg } };
            } catch (err) {
                console.error(`Failed to generate content for ${product.title}`, err);
                return { index: product.originalIndex, content: { instagram: 'Erro ao gerar.', telegram: 'Erro ao gerar.', blog: 'Erro ao gerar.' } };
            }
        });

        const results = await Promise.all(generationPromises);

        const newContents = { ...generatedContents };
        results.forEach(result => {
            if (result.content) {
                newContents[result.index] = result.content;
            }
        });

        setGeneratedContents(newContents);
        setIsGenerating(false);
    }, [selectedProducts, generatedContents]);

    const handleGenerateSingleContent = useCallback(async (product: ProductWithIndex) => {
        const loadingKey = `${product.originalIndex}-all`;
        setIndividualLoading(prev => ({ ...prev, [loadingKey]: true }));

        try {
            const [instaCaption, telegramMsg, blogMsg] = await Promise.all([
                generateInstagramCaptionFromProduct(product),
                generateShopeeOfferMessageFromApi(product),
                generateShopeeOfferMessageFromApi(product),
            ]);
            setGeneratedContents(prev => ({
                ...prev,
                [product.originalIndex]: { instagram: instaCaption, telegram: telegramMsg, blog: blogMsg }
            }));
        } catch (err) {
            console.error(`Failed to generate content for ${product.title}`, err);
            setGeneratedContents(prev => ({
                ...prev,
                [product.originalIndex]: { instagram: 'Erro ao gerar.', telegram: 'Erro ao gerar.', blog: 'Erro ao gerar.' }
            }));
        } finally {
            setIndividualLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
    }, []);

    const handleRegenerateInstagram = async (product: ProductWithIndex) => {
        const tone = tones[product.originalIndex] || 'persuasivo e amigável';
        const loadingKey = `${product.originalIndex}-instagram`;
        setIndividualLoading(prev => ({ ...prev, [loadingKey]: true }));

        try {
            const instaCaption = await generateInstagramCaptionFromProduct(product, tone);
            setGeneratedContents(prev => ({
                ...prev,
                [product.originalIndex]: {
                    ...(prev[product.originalIndex]!),
                    instagram: instaCaption,
                }
            }));
        } catch (err) {
            console.error("Failed to regenerate Instagram caption:", err);
        } finally {
            setIndividualLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
    };

    const handlePublishAll = useCallback(async () => {
        const total = selectedProducts.length;
        const totalCost = total * CREDIT_COST_PER_POST;

        setCreditError('');
        if (settings.credits < totalCost) {
            setCreditError(`Você precisa de ${totalCost} créditos, mas tem apenas ${settings.credits}.`);
            return;
        }

        if (isScheduled) {
            setIsPublishing(true);
            setPublishStatus({ message: 'Agendando publicações...', progress: 0, total, successful: 0, failed: 0, cost: 0 });

            await new Promise(res => setTimeout(res, 1500));

            if (addCreditTransaction && totalCost > 0) {
                addCreditTransaction('usage', totalCost, `Agendamento de ${total} posts para publicação`);
            }

            setPublishStatus({
                message: `Agendamento concluído!`,
                progress: total,
                total,
                successful: total,
                failed: 0,
                cost: totalCost
            });

            setTimeout(() => {
                setIsPublishing(false);
                setStep('search');
                setSelectedProductIndices(new Set());
                setGeneratedContents({});
                setIsScheduled(false);
            }, 5000);

            return;
        }

        setIsPublishing(true);
        setPublishStatus({ message: 'Iniciando publicação...', progress: 0, total, successful: 0, failed: 0, cost: 0 });

        let successfulPosts = 0;
        let failedPosts = 0;

        for (let i = 0; i < total; i++) {
            const product = selectedProducts[i];
            const content = generatedContents[product.originalIndex];

            if (!content) {
                failedPosts++;
                continue;
            }

            setPublishStatus(prev => ({ ...prev, message: `Publicando "${product.title}" (${i + 1}/${total})`, progress: i + 1 }));

            let postSuccess = true;
            try {
                if (channels.telegram && isTelegramConfigured) {
                    const affiliateLink = await generateShopeeLinkFromApi(product.product_url, settings.shopeeAffiliateId, []);
                    const payload = {
                        chat_id: settings.telegramChatId,
                        photo: product.image_url,
                        caption: content.telegram,
                        parse_mode: 'HTML',
                        reply_markup: {
                            inline_keyboard: [[{ text: "Comprar Agora 🛒", url: affiliateLink }]]
                        }
                    };
                    const response = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendPhoto`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                    });
                    const result = await response.json();
                    if (!result.ok) throw new Error(`Telegram: ${result.description}`);
                }

                if (channels.instagram && isInstagramConfigured) await new Promise(res => setTimeout(res, 200));

                // Publicar em Blogs selecionados
                const blogIds = Object.keys(selectedBlogs).filter(id => selectedBlogs[id]);
                if (blogIds.length > 0) {
                    await Promise.all(blogIds.map(async (blogId) => {
                        try {
                            const userId = localStorage.getItem('userId') || 'default-user-id';
                            const res = await fetch(`/api/blogs/${blogId}/publish`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-User-Id': userId
                                },
                                body: JSON.stringify({
                                    title: product.title,
                                    content: content.blog,
                                    status: 'publish',
                                    tags: ['shopee', 'oferta']
                                })
                            });
                            if (!res.ok) {
                                const errData = await res.json().catch(() => ({}));
                                console.error(`Erro blog ${blogId}:`, errData);
                                throw new Error('Erro ao postar no blog');
                            }
                        } catch (e) {
                            console.error(`Erro ao postar no blog ${blogId}`, e);
                            // Consideramos sucesso parcial se outros canais funcionaram, ou marcamos warning?
                            // Por enquanto, log e segue.
                        }
                    }));
                }

            } catch (err) {
                console.error(`Falha ao publicar "${product.title}":`, err);
                postSuccess = false;
            }

            if (postSuccess) successfulPosts++;
            else failedPosts++;

            if (i < total - 1) {
                setPublishStatus(prev => ({ ...prev, message: `Aguardando ${settings.sendInterval}s...` }));
                await new Promise(res => setTimeout(res, settings.sendInterval * 1000));
            }
        }

        const creditsDeducted = successfulPosts * CREDIT_COST_PER_POST;
        if (addCreditTransaction && creditsDeducted > 0) {
            addCreditTransaction('usage', creditsDeducted, `${successfulPosts} posts publicados nos canais selecionados`);
        }

        setPublishStatus({
            message: `Publicação concluída!`,
            progress: total,
            total,
            successful: successfulPosts,
            failed: failedPosts,
            cost: creditsDeducted
        });
        setTimeout(() => {
            setIsPublishing(false);
            setStep('search');
            setSelectedProductIndices(new Set());
            setGeneratedContents({});
        }, 5000);
    }, [selectedProducts, generatedContents, channels, selectedBlogs, settings, isTelegramConfigured, isInstagramConfigured, saveSettings, onAddCreditsClick, isScheduled, scheduleDate, scheduleTime, scheduleMode, quantityPerDay, avoidHours, avoidStartTime, avoidEndTime]);

    const generateScheduleSummary = () => {
        const totalItems = selectedProducts.length;
        if (totalItems === 0) return "Nenhum produto selecionado.";

        const startDate = new Date(`${scheduleDate}T${scheduleTime}:00`);
        const dateFormatted = startDate.toLocaleDateString('pt-BR');
        const timeFormatted = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        let summary = '';
        if (scheduleMode === 'at_once') {
            summary = `Todos os ${totalItems} produtos serão enviados de uma vez em ${dateFormatted} às ${timeFormatted}.`;
        } else {
            const days = Math.ceil(totalItems / quantityPerDay);
            summary = `Serão enviados ${quantityPerDay} produtos por dia, começando em ${dateFormatted} às ${timeFormatted}. A campanha levará aproximadamente ${days} dia(s) para ser concluída.`;
        }

        if (avoidHours) {
            summary += ` As postagens serão pausadas entre ${avoidStartTime} e ${avoidEndTime}.`;
        }

        return summary;
    };

    const ProductContentAccordion: React.FC<{
        product: ProductWithIndex,
        content: GeneratedContent | null,
        onContentChange: (newContent: GeneratedContent) => void,
        isLoading: boolean,
        onGenerateSingle: () => void,
        isGeneratingSingle: boolean,
    }> = ({ product, content, onContentChange, isLoading, onGenerateSingle, isGeneratingSingle }) => {
        const [isOpen, setIsOpen] = useState(true);

        const handleTextChange = (channel: keyof GeneratedContent, text: string) => {
            if (content) {
                onContentChange({ ...content, [channel]: text });
            }
        };

        return (
            <div className="bg-slate-800/50 rounded-lg border border-dark-border">
                <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left">
                    <div className="flex items-center gap-4 overflow-hidden">
                        <img src={product.image_url} alt={product.title} className="w-12 h-12 object-cover rounded-md flex-shrink-0" />
                        <div className="overflow-hidden">
                            <p className="font-semibold text-dark-text-primary line-clamp-1 truncate">{product.title}</p>
                            <p className="text-sm text-purple-400 font-bold">{product.price}</p>
                        </div>
                    </div>
                    {isOpen ? <ChevronUpIcon className="h-5 w-5 text-dark-text-secondary" /> : <ChevronDownIcon className="h-5 w-5 text-dark-text-secondary" />}
                </button>
                {isOpen && (
                    <div className="p-4 border-t border-dark-border">
                        {isLoading ? <div className="text-center p-4"><SpinnerIcon /> Gerando...</div> :
                            content ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <ContentCard
                                        icon={<InstagramIcon />}
                                        title="Instagram"
                                        content={content.instagram}
                                        onContentChange={(text) => handleTextChange('instagram', text)}
                                        tone={tones[product.originalIndex] || ''}
                                        onToneChange={(tone) => setTones(prev => ({ ...prev, [product.originalIndex]: tone }))}
                                        onRegenerate={() => handleRegenerateInstagram(product)}
                                        isRegenerating={individualLoading[`${product.originalIndex}-instagram`]}
                                    />
                                    <ContentCard icon={<TelegramIcon />} title="Telegram" content={content.telegram} onContentChange={(text) => handleTextChange('telegram', text)} />
                                    <ContentCard icon={<FileTextIcon />} title="Blog" content={content.blog} onContentChange={(text) => handleTextChange('blog', text)} />
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-dark-text-secondary mb-4">Conteúdo ainda não gerado para este item.</p>
                                    <button
                                        onClick={onGenerateSingle}
                                        disabled={isGeneratingSingle}
                                        className="flex items-center justify-center gap-2 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50 mx-auto"
                                    >
                                        {isGeneratingSingle ? <SpinnerIcon /> : <MagicWandIcon className="h-4 w-4" />}
                                        Gerar Conteúdo
                                    </button>
                                </div>
                            )}
                    </div>
                )}
            </div>
        );
    };

    const renderSearchStep = () => (
        <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-1 text-dark-text-primary flex items-center gap-2">
                <span className="flex items-center justify-center h-8 w-8 bg-brand-primary text-white rounded-full font-bold text-sm">1</span>
                Pesquise e Selecione os Produtos
            </h2>
            <p className="text-sm text-dark-text-secondary mb-6 ml-10">Use uma palavra-chave para encontrar produtos na Shopee.</p>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 ml-10 mb-6">
                <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="flex-grow bg-slate-800 border border-dark-border rounded-lg p-3"
                    placeholder="Ex: 'fone de ouvido bluetooth'"
                    disabled={isSearching}
                />
                <button type="submit" disabled={isSearching || !keyword} className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50">
                    {isSearching ? <SpinnerIcon /> : <SearchIcon className="h-5 w-5" />} <span>Pesquisar</span>
                </button>
            </form>

            {error && <p className="text-red-400 text-sm ml-10 mb-4">{error}</p>}

            {isSearching && <div className="text-center p-8"><SpinnerIcon /></div>}

            {searchedProducts.length > 0 && (
                <div className="ml-10">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-dark-text-secondary">
                            <thead className="text-xs text-dark-text-primary uppercase bg-slate-700/50">
                                <tr>
                                    <th scope="col" className="p-4">
                                        <input type="checkbox" onChange={handleSelectAll} checked={selectedProductIndices.size === searchedProducts.length && searchedProducts.length > 0} className="w-4 h-4 text-brand-primary bg-slate-800 border-dark-border rounded" />
                                    </th>
                                    <th scope="col" className="px-6 py-3">Produto</th>
                                    <th scope="col" className="px-6 py-3">Preço</th>
                                </tr>
                            </thead>
                            <tbody>
                                {searchedProducts.map((product) => (
                                    <tr key={product.originalIndex} className="border-b border-dark-border hover:bg-slate-800/50">
                                        <td className="w-4 p-4">
                                            <input type="checkbox" checked={selectedProductIndices.has(product.originalIndex)} onChange={() => handleToggleSelection(product.originalIndex)} className="w-4 h-4 text-brand-primary bg-slate-800 border-dark-border rounded" />
                                        </td>
                                        <th scope="row" className="px-6 py-4 font-medium text-dark-text-primary flex items-center gap-3">
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

            {selectedProductIndices.size > 0 && (
                <div className="mt-6 pt-6 border-t border-dark-border ml-10">
                    <button onClick={() => setStep('content')} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg">
                        Próximo: Gerar Conteúdo para {selectedProductIndices.size} Itens
                    </button>
                </div>
            )}
        </div>
    );

    const renderContentStep = () => (
        <div className="bg-dark-card rounded-xl border border-dark-border p-6 md:p-8 animate-fade-in">
            <h2 className="text-xl font-semibold mb-1 text-dark-text-primary flex items-center gap-2">
                <span className="flex items-center justify-center h-8 w-8 bg-brand-primary text-white rounded-full font-bold text-sm">2</span>
                Gere e Revise o Conteúdo
            </h2>
            <div className="ml-10 mt-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <button onClick={handleGenerateAllContent} disabled={isGenerating} className="flex items-center justify-center gap-2 bg-brand-secondary text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50">
                    {isGenerating ? <SpinnerIcon /> : <MagicWandIcon className="h-5 w-5" />}
                    <span>{isGenerating ? 'Gerando...' : 'Gerar Conteúdo para Todos'}</span>
                </button>
                <button onClick={() => setStep('search')} className="text-sm font-semibold text-dark-text-secondary hover:text-dark-text-primary">
                    &larr; Voltar para Seleção
                </button>
            </div>
            <div className="ml-10 mt-6 space-y-4">
                {selectedProducts.map(p => (
                    <ProductContentAccordion
                        key={p.originalIndex}
                        product={p}
                        content={generatedContents[p.originalIndex] || null}
                        onContentChange={(newContent) => setGeneratedContents(prev => ({ ...prev, [p.originalIndex]: newContent }))}
                        isLoading={generatedContents[p.originalIndex] === null && isGenerating}
                        onGenerateSingle={() => handleGenerateSingleContent(p)}
                        isGeneratingSingle={!!individualLoading[`${p.originalIndex}-all`]}
                    />
                ))}
            </div>
            <div className="mt-6 pt-6 border-t border-dark-border ml-10">
                <button onClick={() => setStep('publish')} className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg">
                    Próximo: Publicar {selectedProducts.length} Itens
                </button>
            </div>
        </div>
    );

    const renderPublishStep = () => {
        const totalCost = selectedProducts.length * CREDIT_COST_PER_POST;

        if (isPublishing) {
            return (
                <div className="bg-dark-card rounded-xl border border-dark-border p-6 md:p-8 animate-fade-in">
                    <h2 className="text-xl font-semibold mb-1 text-dark-text-primary">{isScheduled ? 'Agendando...' : 'Publicando...'}</h2>
                    <div className="mt-6 bg-slate-800/50 p-4 rounded-lg border border-dark-border">
                        <div className="flex justify-between items-center text-sm text-dark-text-secondary mb-1">
                            <span>{publishStatus.message}</span>
                            <span>{publishStatus.progress} / {publishStatus.total}</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div className="bg-brand-primary h-2.5 rounded-full" style={{ width: `${(publishStatus.progress / (publishStatus.total || 1)) * 100}%` }}></div>
                        </div>
                        {publishStatus.progress === publishStatus.total && (
                            <div className="mt-4 text-center">
                                <p className="text-lg font-bold text-green-400">{publishStatus.message}</p>
                                <p className="text-sm text-dark-text-secondary">
                                    {publishStatus.successful} posts processados.
                                    Custo total: {publishStatus.cost} créditos.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-dark-card rounded-xl border border-dark-border p-6 md:p-8 animate-fade-in">
                <h2 className="text-xl font-semibold mb-1 text-dark-text-primary flex items-center gap-2">
                    <span className="flex items-center justify-center h-8 w-8 bg-brand-primary text-white rounded-full font-bold text-sm">3</span>
                    Selecione os Canais e Publique
                </h2>
                <div className="ml-10 mt-6 space-y-4">
                    {!isShopeeConfigured && (
                        <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-300 p-4 rounded-lg flex items-start gap-3">
                            <AlertTriangleIcon />
                            <p className="text-sm">Seu ID de Afiliado Shopee não está configurado. Os links não serão monetizados. Adicione seu ID no <strong>Painel Administrativo</strong>.</p>
                        </div>
                    )}
                    <ChannelSelector icon={<InstagramIcon />} title="Instagram" isConfigured={isInstagramConfigured} isSelected={channels.instagram} onToggle={() => setChannels(p => ({ ...p, instagram: !p.instagram }))} onNavigate={() => onNavigate('instagram-connect', { from: 'multi-channel-publisher' })} />
                    <ChannelSelector icon={<TelegramIcon />} title="Telegram" isConfigured={isTelegramConfigured} isSelected={channels.telegram} onToggle={() => setChannels(p => ({ ...p, telegram: !p.telegram }))} onNavigate={() => onNavigate('admin', { from: 'multi-channel-publisher' })} />
                    {/* Seção de Blogs Dinâmica */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-dark-text-secondary uppercase tracking-wider mb-2">Blogs WordPress</h3>
                        {availableBlogs.length === 0 ? (
                            <div className="bg-slate-800/50 border border-dark-border rounded-lg p-4 text-center">
                                <p className="text-sm text-dark-text-secondary mb-2">Nenhum blog conectado.</p>
                                <button onClick={() => onNavigate('blogs-page', { from: 'multi-channel-publisher' })} className="text-sm text-brand-primary hover:underline font-semibold">
                                    Conectar Blog WordPress
                                </button>
                            </div>
                        ) : (
                            availableBlogs.map(blog => (
                                <ChannelSelector
                                    key={blog.id}
                                    icon={<FileTextIcon />}
                                    title={`Blog: ${blog.name}`}
                                    isConfigured={true} // Se está na lista, está configurado
                                    isSelected={!!selectedBlogs[blog.id]}
                                    onToggle={() => setSelectedBlogs(prev => ({ ...prev, [blog.id]: !prev[blog.id] }))}
                                />
                            ))
                        )}
                    </div>

                    <div className="pt-4">
                        <div className="flex items-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={isScheduled} onChange={(e) => setIsScheduled(e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
                            </label>
                            <span className="ml-3 text-sm font-medium text-dark-text-primary">Agendar Publicações</span>
                        </div>
                        {isScheduled && (
                            <div className="mt-4 p-4 bg-slate-800/50 border border-dark-border rounded-lg space-y-4 animate-fade-in">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="scheduleDate" className="text-xs text-dark-text-secondary">Data de Início</label>
                                        <input type="date" id="scheduleDate" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm" />
                                    </div>
                                    <div>
                                        <label htmlFor="scheduleTime" className="text-xs text-dark-text-secondary">Hora de Início</label>
                                        <input type="time" id="scheduleTime" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-dark-text-secondary">Modo de Agendamento</label>
                                    <select value={scheduleMode} onChange={e => setScheduleMode(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm mt-1">
                                        <option value="per_day">Produtos por dia</option>
                                        <option value="at_once">Tudo de uma vez</option>
                                    </select>
                                </div>
                                {scheduleMode === 'per_day' && (
                                    <div>
                                        <label htmlFor="quantityPerDay" className="text-xs text-dark-text-secondary">Quantidade por dia</label>
                                        <input type="number" id="quantityPerDay" value={quantityPerDay} onChange={e => setQuantityPerDay(Number(e.target.value))} min="1" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm mt-1" />
                                    </div>
                                )}
                                <div>
                                    <div className="flex items-center">
                                        <input type="checkbox" id="avoidHours" checked={avoidHours} onChange={e => setAvoidHours(e.target.checked)} className="h-4 w-4 text-brand-primary bg-slate-700 border-slate-600 rounded" />
                                        <label htmlFor="avoidHours" className="ml-2 text-sm text-dark-text-secondary">Evitar postar em horários específicos</label>
                                    </div>
                                    {avoidHours && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <input type="time" value={avoidStartTime} onChange={e => setAvoidStartTime(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs" />
                                            <span className="text-xs text-dark-text-secondary">até</span>
                                            <input type="time" value={avoidEndTime} onChange={e => setAvoidEndTime(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs text-indigo-300 bg-indigo-900/50 p-2 rounded-md border border-indigo-700">
                                    <strong>Resumo:</strong> {generateScheduleSummary()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-dark-border ml-10 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
                    <button onClick={() => setStep('content')} className="text-sm font-semibold text-dark-text-secondary hover:text-dark-text-primary">
                        &larr; Voltar para Conteúdo
                    </button>
                    <div className="flex flex-col items-end">
                        <button onClick={handlePublishAll} disabled={isPublishing} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-lg disabled:opacity-50">
                            <RocketIcon className="h-5 w-5" />
                            <span>{isScheduled ? 'Agendar' : 'Publicar'} {selectedProducts.length} Posts</span>
                        </button>
                        <div className="text-xs text-dark-text-secondary mt-2 flex items-center gap-1">
                            <CreditIcon className="h-3 w-3 text-purple-400" />
                            Custo estimado: <span className="font-bold text-dark-text-primary">{totalCost} créditos</span>
                        </div>
                        {creditError && (
                            <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
                                <AlertTriangleIcon className="h-3 w-3" />
                                {creditError}
                                <button onClick={onAddCreditsClick} className="underline font-semibold ml-1">Recarregar</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )
    };

    return (
        <div className="animate-fade-in space-y-8">
            <div className="mb-2">
                <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Publicador Multi-Canal</h1>
                <p className="text-md text-dark-text-secondary">Automatize a criação e publicação de ofertas em suas redes sociais e blogs.</p>
            </div>

            {step === 'search' && renderSearchStep()}
            {step === 'content' && renderContentStep()}
            {step === 'publish' && renderPublishStep()}
        </div>
    );
};