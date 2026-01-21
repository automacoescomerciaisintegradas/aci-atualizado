import React, { useState } from 'react';
import {
    MagicWandIcon, ChevronLeftIcon, SparklesIcon,
    CheckCircleIcon, AlertTriangleIcon, LoaderIcon,
    FileTextIcon, BrainCircuitIcon, ClipboardIcon,
    ExternalLinkIcon
} from './Icons';
import { generateOptimizedAeoContent, AeoOptimizedContent } from '../services/geminiService';
import { useSettings } from '../hooks/useSettings';
import type { Page } from '../App';

interface AeoOptimizerPageProps {
    onNavigate: (page: Page) => void;
}

export const AeoOptimizerPage: React.FC<AeoOptimizerPageProps> = ({ onNavigate }) => {
    const [rawText, setRawText] = useState('');
    const [contentType, setContentType] = useState<'blog' | 'product' | 'general'>('blog');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [result, setResult] = useState<AeoOptimizedContent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const { settings } = useSettings();
    const activeModel = settings.aiTextModel || 'gemini-2.0-flash';

    const getNeededKey = () => {
        if (activeModel.includes('gpt')) return { name: 'OpenAI', key: settings.openaiApiKey };
        if (activeModel.includes('claude')) return { name: 'Anthropic', key: settings.anthropicApiKey };
        if (activeModel.includes('groq') || activeModel.includes('llama')) return { name: 'Groq', key: settings.groqApiKey };
        return { name: 'Gemini', key: settings.geminiApiKey };
    };

    const neededKey = getNeededKey();
    const hasNeededKey = !!neededKey.key;

    const handleOptimize = async () => {
        if (!rawText.trim()) return;

        setIsOptimizing(true);
        setError(null);
        try {
            const data = await generateOptimizedAeoContent(rawText, contentType);
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Erro ao otimizar conteúdo.');
        } finally {
            setIsOptimizing(false);
        }
    };

    const copyToClipboard = () => {
        if (!result) return;
        navigator.clipboard.writeText(result.optimizedContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="animate-fade-in max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => onNavigate('home')}
                    className="glass hover:bg-white/10 p-2.5 rounded-xl text-dark-text-secondary transition-all"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg glow-primary">
                        <MagicWandIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Otimizador AEO</h1>
                        <p className="text-sm text-dark-text-secondary">Transforme seu conteúdo em respostas perfeitas para IA</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="card-premium p-6">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-sm font-bold text-slate-300 uppercase tracking-wider">Conteúdo Original</label>
                            <select
                                value={contentType}
                                onChange={(e) => setContentType(e.target.value as any)}
                                className="bg-slate-800 border-none rounded-lg text-xs font-bold text-blue-400 px-3 py-1.5 focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="blog">📝 Post de Blog</option>
                                <option value="product">🛍️ Descrição de Produto</option>
                                <option value="general">📄 Conteúdo Geral</option>
                            </select>
                        </div>

                        <textarea
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder="Cole seu texto aqui para ser otimizado..."
                            className="w-full h-80 bg-slate-900/50 border border-white/5 rounded-xl p-4 text-slate-300 placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 outline-none transition-all resize-none font-sans"
                        />

                        <button
                            onClick={handleOptimize}
                            disabled={isOptimizing || !rawText.trim()}
                            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isOptimizing ? (
                                <>
                                    <LoaderIcon className="animate-spin h-5 w-5" />
                                    <span>Analisando e Otimizando...</span>
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="h-5 w-5" />
                                    <span>Otimizar para Resposta Zero</span>
                                </>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 animate-slide-up">
                            <AlertTriangleIcon className="h-5 w-5" />
                            <div className="flex-1">
                                <p className="text-sm font-bold">Erro na Otimização</p>
                                <p className="text-xs opacity-80">{error}</p>
                            </div>
                        </div>
                    )}

                    {!hasNeededKey && (
                        <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-3">
                            <div className="flex items-center gap-3 text-amber-500">
                                <AlertTriangleIcon className="h-6 w-6" />
                                <p className="text-sm font-bold uppercase tracking-wider">Configuração Necessária</p>
                            </div>
                            <p className="text-sm text-amber-200/70">
                                O modelo ativo é <strong>{activeModel}</strong>, mas a chave <strong>{neededKey.name}</strong> não foi configurada. Sem ela, o processamento não é possível.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => onNavigate('admin')}
                                    className="flex-1 py-2.5 bg-amber-500 text-slate-900 text-[10px] font-black rounded-xl hover:bg-amber-400 transition-all uppercase tracking-widest shadow-lg shadow-amber-500/20"
                                >
                                    Configurar no Painel
                                </button>
                                {neededKey.name === 'Gemini' && (
                                    <a
                                        href="https://aistudio.google.com/app/apikey"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-2.5 bg-white/5 border border-amber-500/30 text-amber-500 text-[10px] font-bold rounded-xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
                                    >
                                        Obter Chave Grátis <ExternalLinkIcon className="h-3 w-3" />
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="card-premium p-6 border-blue-500/10 bg-blue-500/5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-bold text-white mb-1">Precisa de configurações avançadas?</h4>
                                <p className="text-xs text-slate-500">Acesse o painel completo para gerenciar modelos e parâmetros.</p>
                            </div>
                            <button
                                onClick={() => onNavigate('admin')}
                                className="flex items-center gap-2 text-xs font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest transition-all"
                            >
                                Painel Completo <ExternalLinkIcon className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Result Section */}
                <div className="space-y-6">
                    {!result && !isOptimizing && (
                        <div className="h-full min-h-[400px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-8 text-slate-600">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <BrainCircuitIcon className="h-10 w-10 opacity-20" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Aguardando seu conteúdo</h3>
                            <p className="text-sm max-w-xs">Nossa IA irá estruturar seu texto para dominar as buscas semânticas e mecanismos de resposta.</p>
                        </div>
                    )}

                    {isOptimizing && (
                        <div className="h-full min-h-[400px] card-premium p-8 animate-pulse flex flex-col justify-center items-center text-center">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full mb-6 flex items-center justify-center">
                                <SparklesIcon className="h-8 w-8 text-blue-400 animate-bounce" />
                            </div>
                            <h3 className="text-blue-400 font-bold mb-2">Engenharia de Prompt em Ação</h3>
                            <p className="text-slate-500 text-sm">Estruturando dados, detectando entidades e gerando FAQs...</p>
                        </div>
                    )}

                    {result && (
                        <div className="animate-fade-in space-y-6">
                            {/* Direct Answer Alert */}
                            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6">
                                <h4 className="flex items-center gap-2 text-green-400 font-bold mb-2 text-sm uppercase tracking-widest">
                                    <CheckCircleIcon className="h-4 w-4" /> Resposta Direta (Snippet)
                                </h4>
                                <p className="text-slate-300 text-sm leading-relaxed italic">
                                    "{result.directAnswer}"
                                </p>
                            </div>

                            {/* Main Content */}
                            <div className="card-premium p-0 overflow-hidden">
                                <div className="flex justify-between items-center p-4 border-b border-white/5 bg-white/5">
                                    <h4 className="text-white font-bold text-sm">Conteúdo Otimizado</h4>
                                    <button
                                        onClick={copyToClipboard}
                                        className="flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300"
                                    >
                                        {copied ? <CheckCircleIcon className="h-4 w-4" /> : <ClipboardIcon className="h-4 w-4" />}
                                        {copied ? 'Copiado!' : 'Copiar Markdown'}
                                    </button>
                                </div>
                                <div className="p-6 prose prose-invert prose-sm max-w-none prose-headings:text-white prose-strong:text-blue-400">
                                    <pre className="whitespace-pre-wrap font-sans text-slate-300 text-sm leading-relaxed">
                                        {result.optimizedContent}
                                    </pre>
                                </div>
                            </div>

                            {/* Entities & Schema */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="card-premium p-5 bg-blue-500/5">
                                    <h5 className="text-[10px] text-blue-400 font-black uppercase mb-3 tracking-widest">Entidades Detectadas</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {result.entitiesDetected.map((ent, i) => (
                                            <span key={i} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-white">
                                                {ent}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="card-premium p-5 bg-purple-500/5">
                                    <h5 className="text-[10px] text-purple-400 font-black uppercase mb-3 tracking-widest">Sugestão de Schema</h5>
                                    <p className="text-[11px] text-slate-400">{result.schemaSuggestions}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
