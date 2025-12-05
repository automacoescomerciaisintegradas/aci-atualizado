import React, { useState, useCallback, FormEvent, useRef } from 'react';
import { generateInstagramCaptionFromDetails, suggestInstagramHashtags, suggestEmojisForCaption } from '../services/geminiService';
import { MagicWandIcon, SpinnerIcon, AlertTriangleIcon, CopyIcon, CheckIcon, SparklesIcon } from './Icons';

export const InstagramCaptionGenerator: React.FC = () => {
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [toneOfVoice, setToneOfVoice] = useState('persuasivo e amigável');
    const [generatedCaption, setGeneratedCaption] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    
    const [suggestedHashtags, setSuggestedHashtags] = useState<string[] | null>(null);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isAllHashtagsCopied, setIsAllHashtagsCopied] = useState(false);
    
    const [suggestedEmojis, setSuggestedEmojis] = useState<string[] | null>(null);
    const [isSuggestingEmojis, setIsSuggestingEmojis] = useState(false);
    
    const captionTextareaRef = useRef<HTMLTextAreaElement>(null);


    const handleSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        if (!productName.trim() || !productDescription.trim()) {
            setError('Por favor, preencha o nome e a descrição do produto.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedCaption('');
        setSuggestedHashtags(null);
        setSuggestedEmojis(null);
        setIsCopied(false);

        try {
            const result = await generateInstagramCaptionFromDetails({
                name: productName,
                price: productPrice,
                description: productDescription,
                toneOfVoice: toneOfVoice,
            });
            setGeneratedCaption(result);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Ocorreu um erro ao gerar a legenda.');
        } finally {
            setIsLoading(false);
        }
    }, [productName, productPrice, productDescription, toneOfVoice]);

    const handleCopy = () => {
        if (!generatedCaption) return;
        navigator.clipboard.writeText(generatedCaption);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };
    
    const handleSuggestHashtags = useCallback(async () => {
        if (!productName || !productDescription) return;
        
        setIsSuggesting(true);
        setError(null);
        setSuggestedHashtags(null);

        try {
            const hashtags = await suggestInstagramHashtags(productName, productDescription);
            setSuggestedHashtags(hashtags);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao sugerir hashtags.');
        } finally {
            setIsSuggesting(false);
        }
    }, [productName, productDescription]);

    const handleReplaceHashtags = () => {
        if (!generatedCaption || !suggestedHashtags || suggestedHashtags.length === 0) return;

        const lines = generatedCaption.split('\n');
        let lastNonHashtagLineIndex = -1;
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i].trim();
            if (line !== '' && !line.startsWith('#')) {
                lastNonHashtagLineIndex = i;
                break;
            }
        }
        
        const mainContent = lines.slice(0, lastNonHashtagLineIndex + 1).join('\n').trim();
        const newCaption = `${mainContent}\n\n${suggestedHashtags.join(' ')}`;
        
        setGeneratedCaption(newCaption);
    };
    
    const handleCopyAllHashtags = () => {
        if (!suggestedHashtags) return;
        navigator.clipboard.writeText(suggestedHashtags.join(' '));
        setIsAllHashtagsCopied(true);
        setTimeout(() => setIsAllHashtagsCopied(false), 2000);
    };
    
    const handleSuggestEmojis = useCallback(async () => {
        if (!productName || !productDescription) return;

        setIsSuggestingEmojis(true);
        setError(null);
        setSuggestedEmojis(null);

        try {
            const emojis = await suggestEmojisForCaption(productName, productDescription);
            setSuggestedEmojis(emojis);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Falha ao sugerir emojis.');
        } finally {
            setIsSuggestingEmojis(false);
        }
    }, [productName, productDescription]);

    const handleEmojiClick = (emoji: string) => {
        const textarea = captionTextareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;

        const newText = text.substring(0, start) + emoji + text.substring(end);
        
        setGeneratedCaption(newText);

        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
            textarea.focus();
        }, 0);
    };

    return (
        <div className="animate-fade-in">
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-dark-text-primary mb-2">
                    Gerador de Legenda para Instagram
                </h1>
                <p className="text-md text-dark-text-secondary">
                    Descreva seu produto e o tom desejado para criar uma legenda com IA, incluindo hashtags e CTA.
                </p>
            </div>

            <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="productName" className="block text-sm font-medium text-dark-text-secondary mb-2">
                                Nome do Produto *
                            </label>
                            <input
                                id="productName"
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                className="w-full bg-slate-800 border border-dark-border rounded-lg p-3"
                                placeholder="Ex: Fone de Ouvido Bluetooth TWS"
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="productPrice" className="block text-sm font-medium text-dark-text-secondary mb-2">
                                Preço do Produto (Opcional)
                            </label>
                            <input
                                id="productPrice"
                                type="text"
                                value={productPrice}
                                onChange={(e) => setProductPrice(e.target.value)}
                                className="w-full bg-slate-800 border border-dark-border rounded-lg p-3"
                                placeholder="Ex: R$ 99,90"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="productDescription" className="block text-sm font-medium text-dark-text-secondary mb-2">
                                Descrição Breve do Produto *
                            </label>
                            <textarea
                                id="productDescription"
                                rows={4}
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                                className="w-full bg-slate-800 border border-dark-border rounded-lg p-3"
                                placeholder="Ex: Fone sem fio com cancelamento de ruído, bateria de 24h e case de carregamento..."
                                disabled={isLoading}
                                required
                            />
                        </div>
                         <div>
                            <label htmlFor="toneOfVoice" className="block text-sm font-medium text-dark-text-secondary mb-2">
                                Tom de Voz Desejado
                            </label>
                            <input
                                id="toneOfVoice"
                                type="text"
                                value={toneOfVoice}
                                onChange={(e) => setToneOfVoice(e.target.value)}
                                className="w-full bg-slate-800 border border-dark-border rounded-lg p-3"
                                placeholder="Ex: divertido, profissional, urgente"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={isLoading || !productName || !productDescription}
                            className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 transition-opacity"
                        >
                            {isLoading ? (
                                <><SpinnerIcon /> Gerando...</>
                            ) : (
                                <><MagicWandIcon className="h-5 w-5" /> Gerar Legenda</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-center gap-3">
                    <AlertTriangleIcon /> <p>{error}</p>
                </div>
            )}
            
            {isLoading && !generatedCaption && (
                <div className="mt-8 bg-dark-card border border-dark-border rounded-xl p-6">
                    <div className="space-y-4 animate-pulse-fast">
                        <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                        <div className="h-4 bg-slate-700 rounded w-full"></div>
                        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                    </div>
                </div>
            )}

            {!isLoading && generatedCaption && (
                <div className="mt-8 bg-dark-card border border-dark-border rounded-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-dark-text-primary">Legenda Gerada:</h2>
                        <button
                            onClick={handleCopy}
                            className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-dark-text-secondary font-medium py-2 px-3 rounded-md"
                        >
                            {isCopied ? <CheckIcon className="text-green-400"/> : <CopyIcon />}
                            {isCopied ? 'Copiado' : 'Copiar'}
                        </button>
                    </div>
                    <div className="bg-slate-800 p-4 rounded-lg border border-dark-border">
                        <textarea
                            ref={captionTextareaRef}
                            value={generatedCaption}
                            onChange={(e) => setGeneratedCaption(e.target.value)}
                            rows={8}
                            className="w-full bg-transparent text-dark-text-primary whitespace-pre-wrap border-none focus:ring-0 resize-y p-0"
                        />
                    </div>
                    <div className="mt-6 pt-6 border-t border-dark-border space-y-6">
                        {/* Hashtag Section */}
                        <div>
                            <button
                                onClick={handleSuggestHashtags}
                                disabled={isSuggesting}
                                className="flex items-center justify-center gap-2 bg-brand-secondary text-white font-bold py-2.5 px-5 rounded-lg hover:bg-brand-secondary/90 disabled:opacity-50"
                            >
                                {isSuggesting ? <SpinnerIcon/> : <SparklesIcon className="h-5 w-5"/>}
                                <span>{isSuggesting ? 'Analisando...' : 'Sugerir Hashtags'}</span>
                            </button>
                            
                            {isSuggesting && !suggestedHashtags && (
                                <div className="mt-4 p-4 bg-slate-800 rounded-lg text-center animate-pulse-fast">
                                    <div className="h-4 bg-slate-700 rounded w-1/2 mx-auto"></div>
                                </div>
                            )}
                            
                            {suggestedHashtags && (
                                <div className="mt-4 animate-fade-in">
                                    <h4 className="text-sm font-semibold text-dark-text-primary mb-2">Sugestões de Hashtags:</h4>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {suggestedHashtags.map((tag, i) => (
                                            <span key={i} className="bg-slate-700 text-dark-text-secondary text-sm px-3 py-1 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <button onClick={handleReplaceHashtags} className="text-sm bg-slate-700 hover:bg-slate-600 font-medium py-2 px-3 rounded-md">
                                            Substituir na Legenda
                                        </button>
                                        <button onClick={handleCopyAllHashtags} className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 font-medium py-2 px-3 rounded-md">
                                            {isAllHashtagsCopied ? <CheckIcon className="text-green-400"/> : <CopyIcon />}
                                            {isAllHashtagsCopied ? 'Copiadas!' : 'Copiar Todas'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Emoji Section */}
                        <div>
                             <button
                                onClick={handleSuggestEmojis}
                                disabled={isSuggestingEmojis}
                                className="flex items-center justify-center gap-2 bg-brand-secondary/80 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-brand-secondary/70 disabled:opacity-50"
                            >
                                {isSuggestingEmojis ? <SpinnerIcon/> : '🙂'}
                                <span>{isSuggestingEmojis ? 'Buscando...' : 'Sugerir Emojis'}</span>
                            </button>
                            {isSuggestingEmojis && (
                                <div className="mt-4 p-4 bg-slate-800 rounded-lg text-center animate-pulse-fast">
                                    <div className="h-4 bg-slate-700 rounded w-1/3 mx-auto"></div>
                                </div>
                            )}
                            {suggestedEmojis && (
                                <div className="mt-4 animate-fade-in">
                                    <h4 className="text-sm font-semibold text-dark-text-primary mb-2">Clique para adicionar um emoji à legenda:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedEmojis.map((emoji, i) => (
                                            <button 
                                                key={i} 
                                                onClick={() => handleEmojiClick(emoji)}
                                                className="bg-slate-700 text-dark-text-secondary text-xl px-3 py-1 rounded-full hover:bg-slate-600 transition-colors"
                                                title={`Inserir ${emoji}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};