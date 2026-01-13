import React, { useState, useCallback, FormEvent, useRef, useEffect } from 'react';
import { useSettings } from '../hooks/useSettings';
import { getShopeeProductDetailsFromUrl, generateFullBlogPostFromDetails, FullBlogPost } from '../services/geminiService';
import { publishToWordPress, getWordPressCategories, getWordPressTags, createWordPressCategory, createWordPressTag } from '../services/wordpressService';
import { Page } from '../App';
import { BookIcon, MagicWandIcon, SpinnerIcon, SearchIcon, AlertTriangleIcon, CheckIcon, WordPressIcon, ClipboardListIcon, ClockIcon, UploadIcon, ChevronLeftIcon } from './Icons';
import { FacebookLikeButton, FacebookShareButton, useFacebookSDK } from './FacebookPlugins';

export const BlogCreator: React.FC<{ onNavigate: (page: Page) => void; }> = ({ onNavigate }) => {
    const { settings } = useSettings();
    const isWpConfigured = !!(settings.wordpressUrl && settings.wordpressUsername && settings.wordpressAppPassword);

    // Tabs
    const [activeTab, setActiveTab] = useState<'single' | 'csv'>('single');

    // Single Post Form states
    const [shopeeUrl, setShopeeUrl] = useState('');
    const [isFetching, setIsFetching] = useState(false);
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [toneOfVoice, setToneOfVoice] = useState('persuasivo e amigável');
    const [targetAudience, setTargetAudience] = useState('consumidores em busca de boas ofertas');
    const [postObjective, setPostObjective] = useState('gerar cliques no link de afiliado e realizar vendas');

    // CSV States
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [csvProcessing, setCsvProcessing] = useState(false);
    const [csvProgress, setCsvProgress] = useState<{ current: number, total: number, logs: string[] }>({ current: 0, total: 0, logs: [] });

    // Generation states (Single)
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPost, setGeneratedPost] = useState<FullBlogPost | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Post-generation states (Single)
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [publishState, setPublishState] = useState<{ status: 'idle' | 'loading' | 'success' | 'error', message?: string, link?: string }>({ status: 'idle' });
    const [scheduledDate, setScheduledDate] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [newCategory, setNewCategory] = useState<string>('');
    const [newTag, setNewTag] = useState<string>('');
    const [featuredImage, setFeaturedImage] = useState<File | null>(null);
    const [featuredImagePreview, setFeaturedImagePreview] = useState<string>('');
    const [uploadingImage, setUploadingImage] = useState<boolean>(false);
    const [uploadedMediaId, setUploadedMediaId] = useState<number | null>(null);

    // Load categories and tags when component mounts and WordPress is configured
    useEffect(() => {
        if (isWpConfigured) {
            const loadCategoriesAndTags = async () => {
                // Load categories
                const categoriesResult = await getWordPressCategories(settings);
                if (categoriesResult.success && categoriesResult.categories) {
                    setCategories(categoriesResult.categories);
                }

                // Load tags
                const tagsResult = await getWordPressTags(settings);
                if (tagsResult.success && tagsResult.tags) {
                    setTags(tagsResult.tags);
                }
            };

            loadCategoriesAndTags();
        }
    }, [isWpConfigured, settings]);

    const handleCreateCategory = async () => {
        if (!newCategory.trim() || !isWpConfigured) return;

        const result = await createWordPressCategory(settings, newCategory.trim());
        if (result.success && result.categoryId) {
            // Reload categories
            const categoriesResult = await getWordPressCategories(settings);
            if (categoriesResult.success && categoriesResult.categories) {
                setCategories(categoriesResult.categories);
                // Select the newly created category
                setSelectedCategories([...selectedCategories, result.categoryId]);
                setNewCategory('');
            }
        } else {
            alert(result.message || 'Erro ao criar categoria');
        }
    };

    const handleCreateTag = async () => {
        if (!newTag.trim() || !isWpConfigured) return;

        const result = await createWordPressTag(settings, newTag.trim());
        if (result.success && result.tagId) {
            // Reload tags
            const tagsResult = await getWordPressTags(settings);
            if (tagsResult.success && tagsResult.tags) {
                setTags(tagsResult.tags);
                // Select the newly created tag
                setSelectedTags([...selectedTags, result.tagId]);
                setNewTag('');
            }
        } else {
            alert(result.message || 'Erro ao criar tag');
        }
    };

    const handleImageUpload = async () => {
        if (!featuredImage || !isWpConfigured) return;

        setUploadingImage(true);
        try {
            const result = await uploadMediaToWordPress(settings, featuredImage);
            if (result.success && result.mediaId) {
                // Update the publish function to include the featured media ID
                alert(`Imagem enviada com sucesso! ID: ${result.mediaId}`);
                // You would typically store this ID to use when publishing
                return result.mediaId;
            } else {
                alert(result.message || 'Erro ao enviar imagem');
                return null;
            }
        } catch (error) {
            alert('Erro ao enviar imagem');
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const handleFetchShopeeProduct = useCallback(async () => {
        if (!shopeeUrl.trim() || !shopeeUrl.startsWith('http')) return;
        setIsFetching(true);
        setError(null);
        try {
            const details = await getShopeeProductDetailsFromUrl(shopeeUrl);
            if (details.error) {
                setError(details.error);
            } else {
                setProductName(details.title);
                setProductDescription(`Produto: ${details.title}, Preço: ${details.price}. URL: ${details.product_url}`);
                if (details.image_url) {
                    setFeaturedImagePreview(details.image_url);
                }
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Falha ao buscar detalhes do produto.');
        } finally {
            setIsFetching(false);
        }
    }, [shopeeUrl]);

    // Busca automática quando o link é colado
    useEffect(() => {
        if (shopeeUrl.includes('shopee.com.br') && shopeeUrl.length > 20) {
            const timer = setTimeout(() => {
                handleFetchShopeeProduct();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [shopeeUrl, handleFetchShopeeProduct]);

    const handleGeneratePost = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!productName || !productDescription) {
            setError('Nome e Descrição do produto são obrigatórios.');
            return;
        }
        setIsGenerating(true);
        setError(null);
        setGeneratedPost(null);
        setPublishState({ status: 'idle' });
        try {
            // Passamos a URL da Shopee para gerar o link "CLIQUE AQUI" automaticamente
            const post = await generateFullBlogPostFromDetails(
                productName,
                productDescription,
                toneOfVoice,
                targetAudience,
                postObjective,
                shopeeUrl
            );
            setGeneratedPost(post);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Falha ao gerar o post.');
        } finally {
            setIsGenerating(false);
        }
    }, [productName, productDescription, toneOfVoice, targetAudience, postObjective, shopeeUrl]);

    const handleInsert = (textToInsert: string) => {
        const textarea = contentRef.current;
        if (!textarea || !generatedPost) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentText = generatedPost.content;
        const newText = `${currentText.substring(0, start)} ${textToInsert} ${currentText.substring(end)}`;

        setGeneratedPost({ ...generatedPost, content: newText });
    };

    const handleCopyAll = () => {
        if (!generatedPost) return;
        const fullContent = `# ${generatedPost.title}\n\n${generatedPost.content}\n\n${generatedPost.hashtags.join(' ')}`;
        navigator.clipboard.writeText(fullContent);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handlePublish = async (status: 'draft' | 'publish' | 'future' = 'publish') => {
        if (!generatedPost) return;
        setPublishState({ status: 'loading' });

        // Deduct credits for publishing (R$ 0,09)
        // This would typically be handled by a backend service

        // Upload featured image if selected
        let featuredMediaId: number | undefined = uploadedMediaId || undefined;

        if (!featuredMediaId && (featuredImage || (featuredImagePreview && featuredImagePreview.startsWith('http')))) {
            setPublishState({ status: 'loading', message: 'Enviando imagem destacada...' });

            try {
                let fileToUpload: File | null = featuredImage;

                // Se não tem arquivo mas tem URL (auto-fetch), tenta baixar (proxy via fetch)
                if (!fileToUpload && featuredImagePreview.startsWith('http')) {
                    try {
                        const response = await fetch(featuredImagePreview);
                        const blob = await response.blob();
                        fileToUpload = new File([blob], 'product-image.jpg', { type: 'image/jpeg' });
                    } catch (e) {
                        console.error('CORS error or failed to fetch image, proceeding without image');
                    }
                }

                if (fileToUpload) {
                    const uploadResult = await uploadMediaToWordPress(settings, fileToUpload);
                    if (uploadResult.success && uploadResult.mediaId) {
                        featuredMediaId = uploadResult.mediaId;
                        setUploadedMediaId(featuredMediaId);
                    }
                }
            } catch (imageError) {
                console.error('Error handling image upload:', imageError);
            }
        }

        setPublishState({ status: 'loading', message: status === 'draft' ? 'Salvando rascunho...' : 'Publicando...' });

        const result = await publishToWordPress(
            settings,
            generatedPost.title,
            generatedPost.content,
            '', // CSS is empty for now
            status,
            selectedCategories.length > 0 ? selectedCategories : undefined,
            selectedTags.length > 0 ? selectedTags : undefined,
            featuredMediaId, // Featured media ID
            status === 'future' ? scheduledDate : undefined // Scheduled date for future posts
        );

        if (result.success) {
            setPublishState({
                status: 'success',
                message: status === 'draft' ? 'Post salvo como rascunho!' : 'Post publicado!',
                link: result.postLink
            });
        } else {
            setPublishState({ status: 'error', message: result.message });
        }
    };

    const handlePreview = () => {
        if (!generatedPost) return;
        // Create a preview window with the formatted content
        const previewContent = `
            <html>
            <head>
                <title>Preview: ${generatedPost.title}</title>
                <style>
                    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                    h1 { color: #333; }
                    .content { margin-top: 20px; }
                </style>
            </head>
            <body>
                <h1>${generatedPost.title}</h1>
                <div class="content">${generatedPost.content}</div>
            </body>
            </html>
        `;
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            previewWindow.document.write(previewContent);
            previewWindow.document.close();
        }
    };

    // CSV Logic
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCsvFile(file);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const text = evt.target?.result as string;
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

            const data = lines.slice(1).filter(line => line.trim()).map(line => {
                // Simple CSV parser (doesn't handle commas inside quotes perfectly, but sufficient for basic usage)
                const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                const obj: any = {};
                headers.forEach((h, i) => {
                    obj[h] = values[i] || '';
                });
                return obj;
            });
            setCsvData(data);
        };
        reader.readAsText(file);
    };

    const processCsvQueue = async () => {
        if (csvData.length === 0) return;
        setCsvProcessing(true);
        setCsvProgress({ current: 0, total: csvData.length, logs: [] });

        for (let i = 0; i < csvData.length; i++) {
            const item = csvData[i];
            const logPrefix = `[${i + 1}/${csvData.length}] ${item.nome_produto || 'Item sem nome'}:`;

            try {
                // 1. Generate
                setCsvProgress(prev => ({ ...prev, logs: [...prev.logs, `${logPrefix} Gerando conteúdo...`] }));
                const post = await generateFullBlogPostFromDetails(
                    item.nome_produto,
                    item.descricao,
                    item.tom_de_voz || toneOfVoice,
                    item.publico_alvo || targetAudience,
                    postObjective
                );

                // 2. Publish
                if (isWpConfigured) {
                    setCsvProgress(prev => ({ ...prev, logs: [...prev.logs, `${logPrefix} Publicando no WordPress...`] }));
                    const result = await publishToWordPress(settings, post.title, post.content, '', 'publish');
                    if (result.success) {
                        setCsvProgress(prev => ({ ...prev, logs: [...prev.logs, `${logPrefix} ✅ Sucesso! Link: ${result.postLink}`] }));
                    } else {
                        setCsvProgress(prev => ({ ...prev, logs: [...prev.logs, `${logPrefix} ❌ Erro ao publicar: ${result.message}`] }));
                    }
                } else {
                    setCsvProgress(prev => ({ ...prev, logs: [...prev.logs, `${logPrefix} ⚠️ WordPress não configurado. Apenas gerado.`] }));
                }

            } catch (err) {
                setCsvProgress(prev => ({ ...prev, logs: [...prev.logs, `${logPrefix} ❌ Erro fatal: ${err instanceof Error ? err.message : 'Erro desconhecido'}`] }));
            }

            setCsvProgress(prev => ({ ...prev, current: i + 1 }));
        }

        setCsvProcessing(false);
    };


    return (
        <div className="animate-fade-in px-2 sm:px-0">
            {/* Header com botão voltar */}
            <div className="mb-6 sm:mb-8 flex flex-col gap-4">
                <div className="flex items-center gap-3 sm:gap-4">
                    <button
                        onClick={() => onNavigate('home')}
                        className="glass hover:bg-white/10 p-2 sm:p-2.5 rounded-xl text-dark-text-secondary transition-all duration-300 flex-shrink-0"
                    >
                        <ChevronLeftIcon className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl gradient-primary flex items-center justify-center glow-primary flex-shrink-0">
                            <BookIcon className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark-text-primary truncate">Criador de Post para Blog</h1>
                            <p className="text-xs sm:text-sm text-dark-text-secondary hidden sm:block">Gere posts completos com IA e publique automaticamente.</p>
                        </div>
                    </div>
                </div>

                {/* Tabs - responsivo */}
                <div className="flex bg-slate-800 p-1 rounded-lg w-full sm:w-auto sm:self-end">
                    <button
                        onClick={() => setActiveTab('single')}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${activeTab === 'single' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Post Único
                    </button>
                    <button
                        onClick={() => setActiveTab('csv')}
                        className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${activeTab === 'csv' ? 'bg-brand-primary text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        Em Massa (CSV)
                    </button>
                </div>
            </div>

            {activeTab === 'single' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 xl:gap-8">
                    {/* Form Column */}
                    <div className="lg:col-span-1 space-y-4 md:space-y-6">
                        <div className="bg-dark-card rounded-xl border border-dark-border p-4 md:p-6">
                            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">1. Dados do Produto</h3>
                            <div className="space-y-3 md:space-y-4">
                                <div className="p-3 bg-slate-800/50 rounded-lg border border-dark-border">
                                    <label htmlFor="shopeeUrl" className="text-sm font-medium text-dark-text-secondary block mb-2">Buscar da Shopee (Opcional)</label>
                                    <div className="flex gap-2">
                                        <input type="url" id="shopeeUrl" value={shopeeUrl} onChange={e => setShopeeUrl(e.target.value)} placeholder="Cole a URL do produto" className="flex-grow bg-slate-900 border border-slate-700 rounded p-2 text-sm" />
                                        <button onClick={handleFetchShopeeProduct} disabled={isFetching} className="p-2 bg-brand-secondary rounded hover:bg-brand-secondary/80 disabled:opacity-50">
                                            {isFetching ? <SpinnerIcon /> : <SearchIcon className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="productName" className="text-sm font-medium text-dark-text-secondary block mb-1">Nome do Produto *</label>
                                    <input type="text" id="productName" value={productName} onChange={e => setProductName(e.target.value)} className="w-full bg-slate-800 border border-dark-border rounded p-2 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="productDescription" className="text-sm font-medium text-dark-text-secondary block mb-1">Descrição do Produto *</label>
                                    <textarea id="productDescription" value={productDescription} onChange={e => setProductDescription(e.target.value)} rows={4} className="w-full bg-slate-800 border border-dark-border rounded p-2 text-sm" />
                                </div>
                            </div>
                        </div>
                        <div className="bg-dark-card rounded-xl border border-dark-border p-4 md:p-6">
                            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">2. Configurações da IA</h3>
                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <label htmlFor="toneOfVoice" className="text-sm font-medium text-dark-text-secondary block mb-1">Tom de Voz</label>
                                    <input type="text" id="toneOfVoice" value={toneOfVoice} onChange={e => setToneOfVoice(e.target.value)} className="w-full bg-slate-800 border border-dark-border rounded p-2 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="targetAudience" className="text-sm font-medium text-dark-text-secondary block mb-1">Público Alvo</label>
                                    <input type="text" id="targetAudience" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} className="w-full bg-slate-800 border border-dark-border rounded p-2 text-sm" />
                                </div>
                                <div>
                                    <label htmlFor="postObjective" className="text-sm font-medium text-dark-text-secondary block mb-1">Objetivo do Post</label>
                                    <input type="text" id="postObjective" value={postObjective} onChange={e => setPostObjective(e.target.value)} className="w-full bg-slate-800 border border-dark-border rounded p-2 text-sm" />
                                </div>
                            </div>
                        </div>
                        <button onClick={handleGeneratePost} disabled={isGenerating || !productName || !productDescription} className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50">
                            {isGenerating ? <SpinnerIcon /> : <MagicWandIcon />}
                            {isGenerating ? 'Gerando Post...' : 'Gerar Post Completo com IA'}
                        </button>
                        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg text-sm flex items-center gap-2"><AlertTriangleIcon className="h-5 w-5" /> {error}</div>}
                    </div>

                    {/* Result Column */}
                    <div className="lg:col-span-2 xl:col-span-3">
                        {isGenerating && (
                            <div className="bg-dark-card rounded-xl border border-dark-border p-6 animate-pulse-fast space-y-6">
                                <div className="h-8 bg-slate-700 rounded w-3/4"></div>
                                <div className="space-y-3">
                                    <div className="h-4 bg-slate-700 rounded"></div>
                                    <div className="h-4 bg-slate-700 rounded"></div>
                                    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                                </div>
                                <div className="h-40 bg-slate-700 rounded"></div>
                            </div>
                        )}
                        {generatedPost && (
                            <div className="bg-dark-card rounded-xl border border-dark-border p-6 space-y-6 animate-fade-in">
                                <div>
                                    <label className="text-sm font-medium text-dark-text-secondary block mb-1">Título do Post</label>
                                    <input type="text" value={generatedPost.title} onChange={e => setGeneratedPost({ ...generatedPost, title: e.target.value })} className="w-full bg-slate-800 border border-dark-border rounded p-3 text-lg font-bold" />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-dark-text-secondary block mb-1">Conteúdo (Markdown)</label>
                                    <textarea ref={contentRef} value={generatedPost.content} onChange={e => setGeneratedPost({ ...generatedPost, content: e.target.value })} rows={15} className="w-full bg-slate-800 border border-dark-border rounded p-3 text-sm font-mono" />
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-sm font-medium text-dark-text-secondary mb-2">Emojis Sugeridos (clique para inserir)</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {generatedPost.emojis.map(emoji => <button key={emoji} onClick={() => handleInsert(emoji)} className="bg-slate-700 p-2 rounded-md hover:bg-slate-600">{emoji}</button>)}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-dark-text-secondary mb-2">Hashtags Sugeridas (clique para inserir)</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {generatedPost.hashtags.map(tag => <button key={tag} onClick={() => handleInsert(tag)} className="text-xs bg-slate-700 px-3 py-1 rounded-full hover:bg-slate-600">{tag}</button>)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-4 items-center pt-6 border-t border-dark-border">
                                    <button onClick={handlePreview} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-dark-text-primary font-semibold py-2 px-4 rounded-lg">
                                        <SearchIcon className="h-5 w-5" />
                                        Preview
                                    </button>
                                    <button onClick={handleCopyAll} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-dark-text-primary font-semibold py-2 px-4 rounded-lg">
                                        {isCopied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardListIcon className="h-5 w-5" />}
                                        {isCopied ? 'Copiado!' : 'Copiar Tudo'}
                                    </button>

                                    {/* Categories and Tags section */}
                                    {isWpConfigured && (
                                        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 w-full">
                                            <h4 className="text-md font-semibold mb-3">Categorias e Tags</h4>

                                            {/* Categories */}
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium mb-2">Categorias</label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {categories.map(category => (
                                                        <label key={category.id} className="flex items-center gap-1 bg-slate-700 px-3 py-1 rounded-full text-sm cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCategories.includes(category.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedCategories([...selectedCategories, category.id]);
                                                                    } else {
                                                                        setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                                                                    }
                                                                }}
                                                                className="rounded"
                                                            />
                                                            <span>{category.name}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                {/* Add new category */}
                                                <div className="flex gap-2 mt-2">
                                                    <input
                                                        type="text"
                                                        value={newCategory}
                                                        onChange={(e) => setNewCategory(e.target.value)}
                                                        placeholder="Nova categoria"
                                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-md p-2 text-sm"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleCreateCategory();
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={handleCreateCategory}
                                                        disabled={!newCategory.trim()}
                                                        className="bg-slate-700 hover:bg-slate-600 text-white px-3 rounded-md disabled:opacity-50"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            <div>
                                                <label className="block text-sm font-medium mb-2">Tags</label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {tags.map(tag => (
                                                        <label key={tag.id} className="flex items-center gap-1 bg-slate-700 px-3 py-1 rounded-full text-sm cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedTags.includes(tag.id)}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedTags([...selectedTags, tag.id]);
                                                                    } else {
                                                                        setSelectedTags(selectedTags.filter(id => id !== tag.id));
                                                                    }
                                                                }}
                                                                className="rounded"
                                                            />
                                                            <span>{tag.name}</span>
                                                        </label>
                                                    ))}
                                                </div>

                                                {/* Add new tag */}
                                                <div className="flex gap-2 mt-2">
                                                    <input
                                                        type="text"
                                                        value={newTag}
                                                        onChange={(e) => setNewTag(e.target.value)}
                                                        placeholder="Nova tag"
                                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-md p-2 text-sm"
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                handleCreateTag();
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={handleCreateTag}
                                                        disabled={!newTag.trim()}
                                                        className="bg-slate-700 hover:bg-slate-600 text-white px-3 rounded-md disabled:opacity-50"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Featured Image section */}
                                    {isWpConfigured && (
                                        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 w-full">
                                            <h4 className="text-md font-semibold mb-3">Imagem Destacada</h4>

                                            <div className="flex flex-col sm:flex-row gap-4">
                                                {/* Image preview */}
                                                <div className="flex-1">
                                                    {featuredImagePreview ? (
                                                        <img
                                                            src={featuredImagePreview}
                                                            alt="Preview"
                                                            className="w-full h-48 object-cover rounded-lg border border-slate-700"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-48 bg-slate-700 rounded-lg border border-dashed border-slate-600 flex items-center justify-center">
                                                            <span className="text-slate-400">Nenhuma imagem selecionada</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Upload controls */}
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                setFeaturedImage(file);
                                                                setFeaturedImagePreview(URL.createObjectURL(file));
                                                            }
                                                        }}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm mb-2"
                                                    />

                                                    <button
                                                        onClick={async () => {
                                                            if (!featuredImage) {
                                                                alert('Por favor, selecione uma imagem primeiro.');
                                                                return;
                                                            }

                                                            setUploadingImage(true);
                                                            try {
                                                                const result = await uploadMediaToWordPress(settings, featuredImage);
                                                                if (result.success && result.mediaId) {
                                                                    setUploadedMediaId(result.mediaId);
                                                                    alert(`Imagem enviada com sucesso! ID: ${result.mediaId}`);
                                                                } else {
                                                                    alert(result.message || 'Erro ao enviar imagem');
                                                                }
                                                            } catch (error) {
                                                                alert('Erro ao enviar imagem');
                                                            } finally {
                                                                setUploadingImage(false);
                                                            }
                                                        }}
                                                        disabled={!featuredImage || uploadingImage}
                                                        className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-md disabled:opacity-50 flex items-center justify-center gap-2"
                                                    >
                                                        {uploadingImage ? (
                                                            <>
                                                                <SpinnerIcon className="h-4 w-4 animate-spin" />
                                                                Enviando...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UploadIcon className="h-4 w-4" />
                                                                Enviar Imagem
                                                            </>
                                                        )}
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            setFeaturedImage(null);
                                                            setFeaturedImagePreview('');
                                                            setUploadedMediaId(null);
                                                        }}
                                                        className="w-full mt-2 text-sm text-slate-400 hover:text-white"
                                                    >
                                                        Remover Imagem
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Schedule post section */}
                                    {isWpConfigured && (
                                        <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 w-full">
                                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                                                <div className="flex-1">
                                                    <label className="block text-sm font-medium mb-1">Agendar Publicação</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={scheduledDate}
                                                        onChange={(e) => setScheduledDate(e.target.value)}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-sm"
                                                        min={new Date().toISOString().slice(0, 16)}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        if (!scheduledDate) {
                                                            alert('Por favor, selecione uma data e hora para agendar.');
                                                            return;
                                                        }
                                                        handlePublish('future');
                                                    }}
                                                    disabled={!isWpConfigured || publishState.status === 'loading' || !scheduledDate}
                                                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 whitespace-nowrap"
                                                >
                                                    {publishState.status === 'loading' ? <SpinnerIcon className="h-4 w-4 animate-spin" /> : <ClockIcon className="h-5 w-5" />}
                                                    {publishState.status === 'loading' ? 'Agendando...' : 'Agendar Post'}
                                                </button>
                                            </div>
                                            {scheduledDate && (
                                                <p className="text-xs text-slate-400 mt-2">
                                                    Post será publicado em: {new Date(scheduledDate).toLocaleString('pt-BR')}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <button onClick={() => handlePublish('draft')} disabled={!isWpConfigured || publishState.status === 'loading'} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50" title={!isWpConfigured ? 'Configure o WordPress no Painel Admin' : ''}>
                                        {publishState.status === 'loading' ? <SpinnerIcon /> : <BookIcon className="h-5 w-5" />}
                                        {publishState.status === 'loading' ? 'Salvando...' : 'Salvar como Rascunho'}
                                    </button>
                                    <button onClick={() => handlePublish('publish')} disabled={!isWpConfigured || publishState.status === 'loading'} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50" title={!isWpConfigured ? 'Configure o WordPress no Painel Admin' : ''}>
                                        {publishState.status === 'loading' ? <SpinnerIcon /> : <WordPressIcon className="h-5 w-5" />}
                                        {publishState.status === 'loading' ? 'Publicando...' : 'Publicar no WordPress'}
                                    </button>
                                    {!isWpConfigured && <button onClick={() => onNavigate('admin')} className="text-xs text-brand-secondary hover:underline">Configurar WordPress</button>}
                                </div>
                                {publishState.status === 'success' && (
                                    <div className="space-y-4">
                                        <div className="text-sm text-green-400 flex items-center gap-2">
                                            <CheckIcon />
                                            {publishState.message}
                                            {publishState.link && (
                                                <a href={publishState.link} target="_blank" rel="noopener noreferrer" className="underline">
                                                    Ver Post
                                                </a>
                                            )}
                                            {/* Show cost deduction message */}
                                            {!publishState.link && (
                                                <span className="text-yellow-400">
                                                    R$ 0,09 deduzido da sua conta
                                                </span>
                                            )}
                                        </div>

                                        {/* Facebook Social Buttons */}
                                        {publishState.link && (
                                            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                                <p className="text-sm text-slate-400 mb-3">📢 Compartilhe seu post nas redes sociais:</p>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <FacebookLikeButton
                                                        href={publishState.link}
                                                        layout="button_count"
                                                        size="large"
                                                        share={false}
                                                        showFaces={false}
                                                    />
                                                    <FacebookShareButton
                                                        href={publishState.link}
                                                        layout="button_count"
                                                        size="large"
                                                    />
                                                    <a
                                                        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(publishState.link)}&text=${encodeURIComponent(generatedPost?.titulo || '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        𝕏 Tweetar
                                                    </a>
                                                    <a
                                                        href={`https://wa.me/?text=${encodeURIComponent((generatedPost?.titulo || '') + ' ' + publishState.link)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        📱 WhatsApp
                                                    </a>
                                                    <a
                                                        href={settings.telegramChatId ?
                                                            (settings.telegramChatId.startsWith('@') ? `https://t.me/${settings.telegramChatId.substring(1)}` :
                                                                settings.telegramChatId.startsWith('http') ? settings.telegramChatId :
                                                                    `https://t.me/share/url?url=${encodeURIComponent(publishState.link)}&text=${encodeURIComponent(generatedPost?.title || '')}`) :
                                                            `https://t.me/share/url?url=${encodeURIComponent(publishState.link)}&text=${encodeURIComponent(generatedPost?.title || '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2 bg-[#0088cc] hover:bg-[#0077b5] text-white text-sm font-medium rounded-lg transition-colors"
                                                    >
                                                        ✈️ Telegram
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {publishState.status === 'error' && (
                                    <div className="text-sm text-red-400 flex items-center gap-2">
                                        <AlertTriangleIcon className="h-5 w-5" />
                                        {publishState.message}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* CSV Upload Section */}
                    <div className="bg-dark-card rounded-xl border border-dark-border p-8 text-center">
                        <div className="max-w-xl mx-auto space-y-4">
                            <div className="p-4 bg-slate-800/50 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                                <span className="text-2xl">📄</span>
                            </div>
                            <h3 className="text-xl font-bold">Importar Produtos via CSV</h3>
                            <p className="text-dark-text-secondary">
                                Carregue um arquivo .csv com as colunas: <code className="bg-slate-800 px-1 rounded">nome_produto</code>, <code className="bg-slate-800 px-1 rounded">descricao</code>, <code className="bg-slate-800 px-1 rounded">link_afiliado</code>.
                            </p>
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-slate-400
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-brand-primary file:text-white
                                hover:file:bg-brand-primary/80"
                            />
                            <div className="text-xs text-slate-500">
                                <a href="#" className="underline hover:text-brand-primary">Baixar modelo de exemplo</a>
                            </div>
                        </div>
                    </div>

                    {/* CSV Preview & Actions */}
                    {csvData.length > 0 && (
                        <div className="bg-dark-card rounded-xl border border-dark-border p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Pré-visualização ({csvData.length} itens)</h3>
                                <button
                                    onClick={processCsvQueue}
                                    disabled={csvProcessing || !isWpConfigured}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50"
                                >
                                    {csvProcessing ? <SpinnerIcon /> : '🚀'}
                                    {csvProcessing ? 'Processando...' : 'Gerar e Publicar em Massa'}
                                </button>
                            </div>

                            {!isWpConfigured && (
                                <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded text-yellow-200 text-sm">
                                    ⚠️ WordPress não configurado. Os posts serão apenas gerados, mas não publicados.
                                </div>
                            )}

                            {/* Progress Bar */}
                            {csvProcessing && (
                                <div className="mb-6 space-y-2">
                                    <div className="flex justify-between text-sm text-slate-400">
                                        <span>Progresso: {csvProgress.current} de {csvProgress.total}</span>
                                        <span>{Math.round((csvProgress.current / csvProgress.total) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-2.5">
                                        <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${(csvProgress.current / csvProgress.total) * 100}%` }}></div>
                                    </div>
                                    <div className="h-32 overflow-y-auto bg-slate-900 p-2 rounded text-xs font-mono text-slate-400 space-y-1">
                                        {csvProgress.logs.map((log, i) => <div key={i}>{log}</div>)}
                                    </div>
                                </div>
                            )}

                            {/* Data Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-400">
                                    <thead className="bg-slate-800 text-slate-200 uppercase font-medium">
                                        <tr>
                                            <th className="px-4 py-3">Produto</th>
                                            <th className="px-4 py-3">Descrição (Resumo)</th>
                                            <th className="px-4 py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {csvData.map((row, i) => (
                                            <tr key={i} className="hover:bg-slate-800/50">
                                                <td className="px-4 py-3 font-medium text-white">{row.nome_produto}</td>
                                                <td className="px-4 py-3 truncate max-w-xs">{row.descricao}</td>
                                                <td className="px-4 py-3">
                                                    {i < csvProgress.current ? <span className="text-green-400">Concluído</span> : 'Pendente'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};