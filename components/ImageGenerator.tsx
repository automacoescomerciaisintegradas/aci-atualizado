import React, { useState, useCallback, FormEvent } from 'react';
import { generateImageFromApi } from '../services/geminiService';
import { ImageIcon, SpinnerIcon, AlertTriangleIcon } from './Icons';

export const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Por favor, digite uma descrição para a imagem.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateImageFromApi(prompt);
      setGeneratedImage(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao gerar a imagem. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);
  
  const SkeletonLoader = () => (
      <div className="mt-8 animate-pulse-fast">
          <div className="aspect-square bg-slate-700 rounded-xl w-full"></div>
      </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-dark-text-primary mb-2">
          Gerador de Imagem com IA
        </h1>
        <p className="text-md text-dark-text-secondary">
          Descreva em detalhes a imagem que você deseja criar e nossa IA dará vida à sua ideia.
        </p>
      </div>

      <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-dark-text-secondary mb-2">
                Sua Ideia (em detalhes)
              </label>
              <textarea
                id="prompt"
                name="prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                placeholder="Ex: um astronauta surfando em uma onda cósmica em um estilo synthwave, com nebulosas e planetas ao fundo..."
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading || !prompt}
              className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300 shadow-lg shadow-indigo-500/30"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon />
                  Gerando Imagem...
                </>
              ) : (
                <>
                  <ImageIcon className="h-5 w-5" />
                  Gerar Imagem
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-center gap-3">
          <AlertTriangleIcon />
          <p>{error}</p>
        </div>
      )}
      
      <div className="mt-8 max-w-lg mx-auto">
        {isLoading && <SkeletonLoader />}

        {!isLoading && generatedImage && (
          <div>
              <h2 className="text-xl font-semibold text-dark-text-primary mb-4 text-center">Sua imagem gerada:</h2>
              <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-2">
                  <img 
                      src={generatedImage} 
                      alt={prompt} 
                      className="rounded-lg w-full h-auto" 
                  />
                  <a 
                      href={generatedImage} 
                      download={`aci-imagem-gerada.jpg`}
                      className="mt-4 w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-500 transition-colors"
                  >
                      Baixar Imagem
                  </a>
              </div>
          </div>
        )}
      </div>
    </div>
  );
};