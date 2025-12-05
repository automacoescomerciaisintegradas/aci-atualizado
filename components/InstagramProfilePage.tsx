import React, { useState, useCallback, FormEvent } from 'react';
import { analyzeInstagramProfileFromApi, InstagramProfileAnalysis } from '../services/geminiService';
import { InstagramIcon, SpinnerIcon, AlertTriangleIcon, UserIcon, TrendingUpIcon, MagicWandIcon, SparklesIcon } from './Icons';

export const InstagramProfilePage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [analysis, setAnalysis] = useState<InstagramProfileAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = useCallback(async (e: FormEvent) => {
        e.preventDefault();
        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
            setError('Por favor, digite um nome de usuário para analisar.');
            return;
        }

        // Instagram username validation
        const invalidCharRegex = /[^a-z0-9._]/i;
        if (trimmedUsername.length > 30 || invalidCharRegex.test(trimmedUsername)) {
            setError("Nome de usuário inválido. Use apenas letras, números, pontos e underscores, com no máximo 30 caracteres.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzeInstagramProfileFromApi(trimmedUsername);
            if (result.error) {
                setError(result.error);
                setAnalysis(null);
            } else {
                setAnalysis(result);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Ocorreu um erro ao analisar o perfil. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    }, [username]);
    
    const SkeletonLoader: React.FC = () => (
        <div className="mt-10 animate-pulse-fast">
            <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="h-32 w-32 bg-slate-700 rounded-full flex-shrink-0"></div>
                <div className="w-full space-y-4">
                    <div className="h-8 bg-slate-700 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-700 rounded w-full"></div>
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="flex gap-6 pt-2">
                        <div className="h-6 bg-slate-700 rounded w-20"></div>
                        <div className="h-6 bg-slate-700 rounded w-20"></div>
                        <div className="h-6 bg-slate-700 rounded w-20"></div>
                    </div>
                </div>
            </div>
             <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-dark-card rounded-xl border border-dark-border p-6 space-y-3">
                    <div className="h-6 w-1/3 bg-slate-700 rounded"></div>
                    <div className="h-4 w-full bg-slate-700 rounded"></div>
                    <div className="h-4 w-5/6 bg-slate-700 rounded"></div>
                </div>
                 <div className="bg-dark-card rounded-xl border border-dark-border p-6 space-y-3">
                    <div className="h-6 w-1/3 bg-slate-700 rounded"></div>
                    <div className="h-4 w-full bg-slate-700 rounded"></div>
                    <div className="h-4 w-5/6 bg-slate-700 rounded"></div>
                </div>
            </div>
             <div className="mt-8 bg-dark-card rounded-xl border border-dark-border p-6 space-y-4">
                <div className="h-6 w-1/2 bg-slate-700 rounded"></div>
                <div className="p-4 bg-slate-800/50 rounded-lg space-y-2">
                    <div className="h-4 w-3/4 bg-slate-700 rounded"></div>
                    <div className="h-3 w-full bg-slate-700 rounded"></div>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg space-y-2">
                    <div className="h-4 w-2/3 bg-slate-700 rounded"></div>
                    <div className="h-3 w-full bg-slate-700 rounded"></div>
                </div>
            </div>
        </div>
    );
    
    return (
        <>
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Análise de Perfil - Instagram</h1>
                <p className="text-md text-dark-text-secondary">Obtenha uma análise de IA sobre qualquer perfil público do Instagram.</p>
            </div>

            <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8 mb-10">
                <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <span className="text-dark-text-secondary">@</span>
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-8 bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                            placeholder="ex: cristiano"
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || !username}
                        className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300 shadow-lg shadow-indigo-500/30"
                    >
                        {isLoading ? <SpinnerIcon /> : <InstagramIcon className="h-5 w-5" />}
                        <span>Analisar Perfil</span>
                    </button>
                </form>
            </div>

            {error && (
                <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-center gap-3 mb-8">
                    <AlertTriangleIcon />
                    <p>{error}</p>
                </div>
            )}
            
            {isLoading && <SkeletonLoader />}

            {!isLoading && analysis && (
                <div className="mt-10 animate-fade-in">
                    {/* Profile Header */}
                    <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-8 flex flex-col md:flex-row items-center gap-8">
                        <img src={analysis.profile_image_url} alt={analysis.profile_name} className="h-32 w-32 rounded-full object-cover border-4 border-slate-700 flex-shrink-0 bg-slate-800" />
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-dark-text-primary">{analysis.profile_name}</h2>
                            <p className="text-md text-purple-400">@{analysis.username}</p>
                            <p className="text-sm text-dark-text-secondary mt-2 max-w-lg">{analysis.bio}</p>
                            <div className="flex items-center justify-center md:justify-start gap-6 mt-4 text-dark-text-primary">
                                <div><span className="font-bold">{analysis.posts}</span> <span className="text-sm text-dark-text-secondary">posts</span></div>
                                <div><span className="font-bold">{analysis.followers}</span> <span className="text-sm text-dark-text-secondary">seguidores</span></div>
                                <div><span className="font-bold">{analysis.following}</span> <span className="text-sm text-dark-text-secondary">seguindo</span></div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Analysis Details */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="bg-dark-card rounded-xl border border-dark-border p-6">
                            <h3 className="font-semibold text-lg text-dark-text-primary flex items-center gap-2 mb-3"><TrendingUpIcon className="h-5 w-5 text-brand-secondary"/> Análise de Conteúdo</h3>
                            <p className="text-sm text-dark-text-secondary mb-2"><span className="font-semibold text-dark-text-primary">Nicho Principal:</span> {analysis.niche}</p>
                            <p className="text-sm text-dark-text-secondary whitespace-pre-wrap">{analysis.content_analysis}</p>
                         </div>
                         <div className="bg-dark-card rounded-xl border border-dark-border p-6">
                            <h3 className="font-semibold text-lg text-dark-text-primary flex items-center gap-2 mb-3"><MagicWandIcon className="h-5 w-5 text-brand-secondary"/> Sugestões da IA</h3>
                            <p className="text-sm text-dark-text-secondary whitespace-pre-wrap">{analysis.suggestions}</p>
                         </div>
                    </div>

                    {/* Content Ideas */}
                    {analysis.content_ideas && analysis.content_ideas.length > 0 && (
                        <div className="mt-8 bg-dark-card rounded-xl border border-dark-border p-6">
                            <h3 className="font-semibold text-lg text-dark-text-primary flex items-center gap-2 mb-4">
                                <SparklesIcon className="h-5 w-5 text-brand-secondary"/> Ideias de Conteúdo da IA
                            </h3>
                            <div className="space-y-4">
                                {analysis.content_ideas.map((idea, index) => (
                                    <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-dark-border transition-all hover:border-slate-600">
                                        <div className="flex justify-between items-start gap-2">
                                            <h4 className="font-semibold text-dark-text-primary">{idea.title}</h4>
                                            <span className="flex-shrink-0 text-xs font-bold text-dark-text-secondary bg-slate-700 px-2 py-1 rounded-full">{idea.format}</span>
                                        </div>
                                        <p className="text-sm text-dark-text-secondary mt-1">{idea.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};