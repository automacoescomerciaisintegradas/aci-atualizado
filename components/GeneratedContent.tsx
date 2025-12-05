
import React, { useState, useEffect } from 'react';
import { CopyIcon, CheckIcon } from './Icons';

interface GeneratedContentProps {
  isLoading: boolean;
  content: string;
}

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-4 animate-pulse-fast">
    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
    <div className="h-4 bg-slate-700 rounded w-full"></div>
    <div className="h-4 bg-slate-700 rounded w-full"></div>
    <div className="h-4 bg-slate-700 rounded w-5/6"></div>
  </div>
);

export const GeneratedContent: React.FC<GeneratedContentProps> = ({ isLoading, content }) => {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setIsCopied(true);
  };

  if (isLoading) {
    return (
      <div className="mt-8 bg-dark-card border border-dark-border rounded-xl p-6">
        <h2 className="text-xl font-semibold text-dark-text-primary mb-4">Seu conteúdo está sendo gerado...</h2>
        <LoadingSkeleton />
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="mt-8 bg-dark-card border border-dark-border rounded-xl">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-dark-text-primary">Conteúdo Gerado</h2>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-dark-text-secondary font-medium py-2 px-3 rounded-lg transition-colors"
          >
            {isCopied ? <CheckIcon className="text-green-400" /> : <CopyIcon />}
            {isCopied ? 'Copiado!' : 'Copiar Texto'}
          </button>
        </div>
        <div className="prose prose-invert prose-p:text-dark-text-secondary prose-headings:text-dark-text-primary max-w-none whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
};
