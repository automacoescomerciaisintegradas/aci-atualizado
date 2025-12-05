import React, { useState } from 'react';
import { CheckIcon, CopyIcon, SpinnerIcon, WordPressIcon, AlertTriangleIcon } from './Icons';
import { Page } from '../App';

export interface GeneratedPost {
    title: string;
    html: string;
    css: string;
    error?: string;
}

interface BlogPostPreviewProps {
    post: GeneratedPost;
    onPublish: () => void;
    publishState: { status: 'idle' | 'loading' | 'success' | 'error', message?: string, link?: string };
    isWpConfigured: boolean;
    onNavigate: (page: Page) => void;
}

export const BlogPostPreview: React.FC<BlogPostPreviewProps> = ({ post, onPublish, publishState, isWpConfigured, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (post.error) {
        return (
            <div className="bg-slate-800/70 p-4 rounded-lg border border-dark-border">
                <h3 className="font-semibold text-dark-text-primary mb-2">{post.title}</h3>
                <p className="text-red-400 text-sm">{post.error}</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/70 p-4 rounded-lg border border-dark-border animate-fade-in">
            <h3 className="font-semibold text-dark-text-primary mb-4">{post.title}</h3>
            
            <div className="mb-6 p-4 bg-white rounded-md shadow-sm overflow-hidden">
                <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider border-b border-gray-200 pb-2">Visualização do Card</h4>
                {/* Scoped style for preview */}
                <style>{post.css}</style>
                <div dangerouslySetInnerHTML={{ __html: post.html }} className="text-gray-900" />
            </div>
            
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-2/3">
                    <div className="flex border-b border-slate-700 mb-2">
                        <button 
                            onClick={() => { setActiveTab('html'); setIsCopied(false); }}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'html' ? 'border-b-2 border-brand-primary text-dark-text-primary' : 'text-dark-text-secondary hover:text-dark-text-primary'}`}
                        >
                            HTML
                        </button>
                        <button 
                            onClick={() => { setActiveTab('css'); setIsCopied(false); }}
                            className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'css' ? 'border-b-2 border-brand-primary text-dark-text-primary' : 'text-dark-text-secondary hover:text-dark-text-primary'}`}
                        >
                            CSS
                        </button>
                    </div>

                    <div className="relative">
                        <pre className="bg-slate-900 rounded-md p-3 text-sm text-slate-300 overflow-x-auto max-h-48 w-full scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                            <code>
                                {activeTab === 'html' ? post.html : post.css}
                            </code>
                        </pre>
                        <button 
                            onClick={() => handleCopy(activeTab === 'html' ? post.html : post.css)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-white bg-slate-800/80 rounded p-1.5 transition-colors"
                            title="Copiar código"
                        >
                            {isCopied ? <CheckIcon className="h-4 w-4 text-green-400" /> : <CopyIcon className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
                <div className="flex flex-col justify-start lg:items-end gap-3 w-full lg:w-1/3 pt-10">
                    <button 
                        onClick={onPublish} 
                        disabled={!isWpConfigured || publishState.status === 'loading' || publishState.status === 'success'} 
                        className="w-full lg:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/20"
                        title={!isWpConfigured ? 'Configure o WordPress no Painel Admin' : ''}
                    >
                        {publishState.status === 'loading' ? <SpinnerIcon /> : <WordPressIcon className="h-5 w-5" />}
                        {publishState.status === 'success' ? 'Publicado' : 'Publicar no WordPress'}
                    </button>
                    {!isWpConfigured && (
                        <button 
                            onClick={() => onNavigate('admin')} 
                            className="text-xs text-brand-secondary hover:underline text-right"
                        >
                            Configurar Integração WordPress
                        </button>
                    )}
                    {publishState.status === 'success' && (
                        <p className="text-sm text-green-400 mt-1 text-right break-words bg-green-900/20 p-2 rounded border border-green-900/50">
                            Sucesso! <a href={publishState.link} target="_blank" rel="noopener noreferrer" className="underline font-semibold">Ver Post Publicado</a>
                        </p>
                    )}
                    {publishState.status === 'error' && (
                        <div className="text-sm text-red-400 mt-1 flex items-start gap-2 justify-end text-right bg-red-900/20 p-2 rounded border border-red-900/50">
                            <AlertTriangleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" /> 
                            <span>{publishState.message}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
