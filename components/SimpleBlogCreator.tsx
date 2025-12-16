import React, { useState, useCallback, FormEvent, useRef } from 'react';
import { useSettings } from '../hooks/useSettings';
import { generateFullBlogPostFromDetails, FullBlogPost } from '../services/geminiService';
import { publishToWordPress, getWordPressCategories, getWordPressTags, createWordPressCategory, createWordPressTag } from '../services/wordpressService';
import { publishToBlogger } from '../services/bloggerService';
import { publishToMedium } from '../services/mediumService';
import { Page } from '../App';
import { BookIcon, MagicWandIcon, SpinnerIcon, AlertTriangleIcon, CheckIcon, WordPressIcon, BloggerIcon, MediumIcon } from './Icons';

// Define types for our platforms
type Platform = 'wordpress' | 'blogger' | 'medium';

export const SimpleBlogCreator: React.FC<{ onNavigate: (page: Page) => void; }> = ({ onNavigate }) => {
    const { settings } = useSettings();
    
    // Check if each platform is configured
    const isWordPressConfigured = !!(settings.wordpressUrl && settings.wordpressUsername && settings.wordpressAppPassword);
    const isBloggerConfigured = !!(settings.bloggerApiKey && settings.bloggerBlogId);
    const isMediumConfigured = !!(settings.mediumToken);
    
    // Form states
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [toneOfVoice, setToneOfVoice] = useState('persuasivo e amigável');
    const [targetAudience, setTargetAudience] = useState('consumidores em busca de boas ofertas');
    const [postObjective, setPostObjective] = useState('gerar cliques no link de afiliado e realizar vendas');
    
    // Generation states
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPost, setGeneratedPost] = useState<FullBlogPost | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    // Post-generation states
    const contentRef = useRef<HTMLTextAreaElement>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [publishState, setPublishState] = useState<{ 
        status: 'idle' | 'loading' | 'success' | 'error', 
        message?: string, 
        link?: string 
    }>({ status: 'idle' });
    
    // Platform-specific states
    const [selectedPlatform, setSelectedPlatform] = useState<Platform>('wordpress');
    const [categories, setCategories] = useState<any[]>([]);
    const [tags, setTags] = useState<any[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [newCategory, setNewCategory] = useState<string>('');
    const [newTag, setNewTag] = useState<string>('');
    
    // Load categories and tags when platform changes to WordPress
    React.useEffect(() => {
        if (selectedPlatform === 'wordpress' && isWordPressConfigured) {
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
    }, [selectedPlatform, isWordPressConfigured, settings]);
    
    const handleCreateCategory = async () => {
        if (!newCategory.trim() || selectedPlatform !== 'wordpress' || !isWordPressConfigured) return;
        
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
        if (!newTag.trim() || selectedPlatform !== 'wordpress' || !isWordPressConfigured) return;
        
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
            const post = await generateFullBlogPostFromDetails(
                productName, 
                productDescription, 
                toneOfVoice, 
                targetAudience, 
                postObjective
            );
            setGeneratedPost(post);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Falha ao gerar o post.');
        } finally {
            setIsGenerating(false);
        }
    }, [productName, productDescription, toneOfVoice, targetAudience, postObjective]);
    
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
    
    const handlePublish = async () => {
        if (!generatedPost) return;
        setPublishState({ status: 'loading' });
        
        try {
            let result: { success: boolean; message: string; postLink?: string };
            
            switch (selectedPlatform) {
                case 'wordpress':
                    if (!isWordPressConfigured) {
                        throw new Error('WordPress não está configurado');
                    }
                    result = await publishToWordPress(
                        settings, 
                        generatedPost.title, 
                        generatedPost.content, 
                        '', // CSS is empty for now
                        'publish',
                        selectedCategories.length > 0 ? selectedCategories : undefined,
                        selectedTags.length > 0 ? selectedTags : undefined
                    );
                    break;
                    
                case 'blogger':
                    if (!isBloggerConfigured) {
                        throw new Error('Blogger não está configurado');
                    }
                    result = await publishToBlogger(
                        settings,
                        generatedPost.title,
                        generatedPost.content
                    );
                    break;
                    
                case 'medium':
                    if (!isMediumConfigured) {
                        throw new Error('Medium não está configurado');
                    }
                    result = await publishToMedium(
                        settings,
                        generatedPost.title,
                        generatedPost.content
                    );
                    break;
                    
                default:
                    throw new Error('Plataforma não suportada');
            }
            
            if (result.success) {
                setPublishState({ 
                    status: 'success', 
                    message: `Post publicado no ${selectedPlatform === 'wordpress' ? 'WordPress' : selectedPlatform === 'blogger' ? 'Blogger' : 'Medium'}!`, 
                    link: result.postLink 
                });
            } else {
                setPublishState({ status: 'error', message: result.message });
            }
        } catch (e) {
            setPublishState({ 
                status: 'error', 
                message: e instanceof Error ? e.message : 'Erro ao publicar o post' 
            });
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
    
    return (
        <div className="animate-fade-in">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Simples Criador de Posts</h1>
                <p className="text-dark-text-secondary">Gere e publique posts de blog individualmente em múltiplas plataformas</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-dark-card rounded-xl border border-dark-border p-6">
                        <h3 className="text-lg font-semibold mb-4">1. Dados do Produto</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="productName" className="text-sm font-medium text-dark-text-secondary block mb-1">Nome do Produto *</label>
                                <input 
                                    type="text" 
                                    id="productName" 
                                    value={productName} 
                                    onChange={e => setProductName(e.target.value)} 
                                    className="w-full bg-slate-800 border border-dark-border rounded p-2 text-sm" 
                                />
                            </div>
                            <div>
                                <label htmlFor="productDescription" className="text-sm font-medium text-dark-text-secondary block mb-1">Descrição do Produto *</label>
                                <textarea 
                                    id="productDescription" 
                                    value={productDescription} 
                                    onChange={e => setProductDescription(e.target.value)} 
                                    rows={4} 
                                    className="w-full bg-slate-800 border border-dark-border rounded p-2 text-sm" 
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-dark-card rounded-xl border border-dark-border p-6">
                        <h3 className="text-lg font-semibold mb-4">2. Configurações da IA</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="toneOfVoice" className="text-sm font-medium text-dark-text-secondary block mb-1">Tom de Voz</label>
                                <input 
                                    type="text" 
                                    id="toneOfVoice" 
                                    value={toneOfVoice} 
                                    onChange={e => setToneOfVoice(e.target.value)} 
                                    className="w-full bg-slate-800 border border-dark-border rounded p-2 text-sm" 
                                />
                            </div>
                            <div>
                                <label htmlFor="targetAudience" className="text-sm font-medium text-dark-text-secondary block mb-1">Público Alvo</label>
                                <input 
                                    type="text" 
                                    id="targetAudience" 
                                    value={targetAudience} 
                                    onChange={e => setTargetAudience(e.target.value)} 
                                    className="w-full bg-slate-800 border border-dark-border rounded p-2 text-sm" 
                                />
                            </div>
                            <div>
                                <label htmlFor="postObjective" className="text-sm font-medium text-dark-text-secondary block mb-1">Objetivo do Post</label>
                                <input 
                                    type="text" 
                                    id="postObjective" 
                                    value={postObjective} 
                                    onChange={e => setPostObjective(e.target.value)} 
                                    className="w-full bg-slate-800 border border-dark-border rounded p-2 text-sm" 
                                />
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleGeneratePost} 
                        disabled={isGenerating || !productName || !productDescription}
                        className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50"
                    >
                        {isGenerating ? <SpinnerIcon /> : <MagicWandIcon />}
                        {isGenerating ? 'Gerando Post...' : 'Gerar Post com IA'}
                    </button>
                    
                    {error && (
                        <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertTriangleIcon className="h-5 w-5" /> {error}
                        </div>
                    )}
                </div>
                
                {/* Result Column */}
                <div className="lg:col-span-2">
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
                                <input 
                                    type="text" 
                                    value={generatedPost.title} 
                                    onChange={e => setGeneratedPost({ ...generatedPost, title: e.target.value })} 
                                    className="w-full bg-slate-800 border border-dark-border rounded p-3 text-lg font-bold" 
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-dark-text-secondary block mb-1">Conteúdo (Markdown)</label>
                                <textarea 
                                    ref={contentRef}
                                    value={generatedPost.content} 
                                    onChange={e => setGeneratedPost({ ...generatedPost, content: e.target.value })} 
                                    rows={15} 
                                    className="w-full bg-slate-800 border border-dark-border rounded p-3 text-sm font-mono" 
                                />
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-dark-text-secondary mb-2">Emojis Sugeridos (clique para inserir)</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {generatedPost.emojis.map(emoji => (
                                            <button 
                                                key={emoji} 
                                                onClick={() => handleInsert(emoji)} 
                                                className="bg-slate-700 p-2 rounded-md hover:bg-slate-600"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="text-sm font-medium text-dark-text-secondary mb-2">Hashtags Sugeridas (clique para inserir)</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {generatedPost.hashtags.map(tag => (
                                            <button 
                                                key={tag} 
                                                onClick={() => handleInsert(tag)} 
                                                className="text-xs bg-slate-700 px-3 py-1 rounded-full hover:bg-slate-600"
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 items-center pt-6 border-t border-dark-border">
                                <button 
                                    onClick={handlePreview} 
                                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-dark-text-primary font-semibold py-2 px-4 rounded-lg"
                                >
                                    <span>Preview</span>
                                </button>
                                
                                <button 
                                    onClick={handleCopyAll} 
                                    className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-dark-text-primary font-semibold py-2 px-4 rounded-lg"
                                >
                                    {isCopied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <BookIcon className="h-5 w-5" />}
                                    {isCopied ? 'Copiado!' : 'Copiar Tudo'}
                                </button>
                                
                                {/* Platform Selection */}
                                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 w-full">
                                    <h4 className="text-md font-semibold mb-3">Selecionar Plataforma</h4>
                                    
                                    <div className="flex flex-wrap gap-3 mb-4">
                                        <button
                                            onClick={() => setSelectedPlatform('wordpress')}
                                            disabled={!isWordPressConfigured}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                                selectedPlatform === 'wordpress' 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'bg-slate-700 hover:bg-slate-600 text-dark-text-primary'
                                            } ${!isWordPressConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <WordPressIcon className="h-5 w-5" />
                                            WordPress
                                        </button>
                                        
                                        <button
                                            onClick={() => setSelectedPlatform('blogger')}
                                            disabled={!isBloggerConfigured}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                                selectedPlatform === 'blogger' 
                                                    ? 'bg-orange-600 text-white' 
                                                    : 'bg-slate-700 hover:bg-slate-600 text-dark-text-primary'
                                            } ${!isBloggerConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <BloggerIcon className="h-5 w-5" />
                                            Blogger
                                        </button>
                                        
                                        <button
                                            onClick={() => setSelectedPlatform('medium')}
                                            disabled={!isMediumConfigured}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                                                selectedPlatform === 'medium' 
                                                    ? 'bg-black text-white' 
                                                    : 'bg-slate-700 hover:bg-slate-600 text-dark-text-primary'
                                            } ${!isMediumConfigured ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <MediumIcon className="h-5 w-5" />
                                            Medium
                                        </button>
                                    </div>
                                    
                                    {!isWordPressConfigured && !isBloggerConfigured && !isMediumConfigured && (
                                        <div className="text-sm text-yellow-400">
                                            Nenhuma plataforma configurada.{' '}
                                            <button 
                                                onClick={() => onNavigate('admin')} 
                                                className="text-brand-secondary hover:underline"
                                            >
                                                Configure uma plataforma
                                            </button>
                                        </div>
                                    )}
                                    
                                    {/* WordPress-specific options */}
                                    {selectedPlatform === 'wordpress' && isWordPressConfigured && (
                                        <>
                                            {/* Categories */}
                                            <div className="mb-4 mt-4">
                                                <label className="block text-sm font-medium mb-2">Categorias</label>
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {categories.map(category => (
                                                        <label 
                                                            key={category.id} 
                                                            className="flex items-center gap-1 bg-slate-700 px-3 py-1 rounded-full text-sm cursor-pointer"
                                                        >
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
                                                        <label 
                                                            key={tag.id} 
                                                            className="flex items-center gap-1 bg-slate-700 px-3 py-1 rounded-full text-sm cursor-pointer"
                                                        >
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
                                        </>
                                    )}
                                </div>
                                
                                <button 
                                    onClick={handlePublish} 
                                    disabled={
                                        !isWordPressConfigured && selectedPlatform === 'wordpress' ||
                                        !isBloggerConfigured && selectedPlatform === 'blogger' ||
                                        !isMediumConfigured && selectedPlatform === 'medium' ||
                                        publishState.status === 'loading'
                                    }
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
                                >
                                    {publishState.status === 'loading' ? <SpinnerIcon /> : null}
                                    {publishState.status === 'loading' ? 'Publicando...' : `Publicar no ${selectedPlatform === 'wordpress' ? 'WordPress' : selectedPlatform === 'blogger' ? 'Blogger' : 'Medium'}`}
                                </button>
                                
                                {publishState.status === 'success' && (
                                    <div className="text-sm text-green-400 flex items-center gap-2">
                                        <CheckIcon /> 
                                        {publishState.message} 
                                        {publishState.link && (
                                            <a 
                                                href={publishState.link} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="underline"
                                            >
                                                Ver Post
                                            </a>
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};