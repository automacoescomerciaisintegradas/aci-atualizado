import React, { useState, useCallback, FormEvent } from 'react';
import { generateShopeeLinkFromApi, generateAmazonLinkFromApi, generateMercadoLivreLinkFromApi } from '../services/geminiService';
import { LinkIcon, SpinnerIcon, AlertTriangleIcon, CopyIcon, CheckIcon, ShopeeIcon, AmazonIcon, MercadoLivreIcon } from './Icons';
import { useSettings } from '../hooks/useSettings';

type Platform = 'shopee' | 'amazon' | 'mercado-livre';

export const LinkGenerator: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('shopee');
  const [productUrl, setProductUrl] = useState('');
  const [subIds, setSubIds] = useState<string[]>(Array(5).fill(''));
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { settings } = useSettings();

  const handleSubIdChange = (index: number, value: string) => {
    const newSubIds = [...subIds];
    newSubIds[index] = value;
    setSubIds(newSubIds);
  };

  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    if (!productUrl.trim()) {
      setError('Por favor, insira o link do produto.');
      return;
    }

    const affiliateId = platform === 'shopee' ? settings.shopeeAffiliateId : platform === 'amazon' ? settings.amazonAffiliateId : settings.mercadoLivreAffiliateId;
    if (!affiliateId) {
        setError(`Por favor, configure seu ID de afiliado para ${platform} no Painel Administrativo.`);
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedLink('');
    setIsCopied(false);

    try {
      let result;
      if (platform === 'shopee') {
        result = await generateShopeeLinkFromApi(productUrl, affiliateId, subIds);
      } else if (platform === 'amazon') {
        result = await generateAmazonLinkFromApi(productUrl, affiliateId);
      } else {
        result = await generateMercadoLivreLinkFromApi(productUrl, affiliateId);
      }
      setGeneratedLink(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao gerar o link. Por favor, verifique os dados e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [productUrl, subIds, platform, settings]);

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-dark-text-primary mb-2">
          Gerador de Link de Afiliado
        </h1>
        <p className="text-md text-dark-text-secondary">
          Selecione a plataforma, cole o link do produto e crie um link rastreável.
        </p>
      </div>

      <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8">
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                Selecione a Plataforma
              </label>
              <div className="flex border-b border-dark-border">
                  <button type="button" onClick={() => setPlatform('shopee')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${platform === 'shopee' ? 'border-b-2 border-brand-primary text-dark-text-primary' : 'text-dark-text-secondary hover:text-dark-text-primary'}`}>
                      <ShopeeIcon className="h-5 w-5"/> Shopee
                  </button>
                  <button type="button" onClick={() => setPlatform('amazon')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${platform === 'amazon' ? 'border-b-2 border-brand-primary text-dark-text-primary' : 'text-dark-text-secondary hover:text-dark-text-primary'}`}>
                      <AmazonIcon className="h-5 w-5"/> Amazon
                  </button>
                  <button type="button" onClick={() => setPlatform('mercado-livre')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${platform === 'mercado-livre' ? 'border-b-2 border-brand-primary text-dark-text-primary' : 'text-dark-text-secondary hover:text-dark-text-primary'}`}>
                      <MercadoLivreIcon className="h-5 w-5"/> Mercado Livre
                  </button>
              </div>
            </div>

            <div>
              <label htmlFor="productUrl" className="block text-sm font-medium text-dark-text-secondary mb-2">
                Cole aqui o link do produto
              </label>
              <textarea
                id="productUrl"
                name="productUrl"
                rows={3}
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                placeholder={`https://${platform}.com.br/...`}
                disabled={isLoading}
              />
            </div>

            {platform === 'shopee' && (
              <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                  Sub_IDs de Rastreamento <span className="text-xs">(Opcional)</span>
                </label>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {subIds.map((subId, index) => (
                    <input
                      key={index}
                      type="text"
                      value={subId}
                      onChange={(e) => handleSubIdChange(index, e.target.value)}
                      className="w-full bg-slate-800 border border-dark-border rounded-lg p-2 text-sm text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary"
                      placeholder={`Sub_id ${index + 1}`}
                      disabled={isLoading}
                    />
                  ))}
                </div>
                 <p className="text-xs text-dark-text-secondary mt-2">Use para rastrear a origem dos cliques (ex: 'instagram_stories', 'oferta_natal').</p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              type="submit"
              disabled={isLoading || !productUrl}
              className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300 shadow-lg shadow-indigo-500/30"
            >
              {isLoading ? (
                <>
                  <SpinnerIcon />
                  Gerando...
                </>
              ) : (
                <>
                  <LinkIcon className="h-5 w-5" />
                  Gerar Link
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
      
      {isLoading && (
          <div className="mt-8 bg-dark-card border border-dark-border rounded-xl p-6">
             <div className="space-y-4 animate-pulse-fast">
                <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                <div className="h-10 bg-slate-800 rounded w-full"></div>
            </div>
          </div>
      )}

      {!isLoading && generatedLink && (
        <div className="mt-8 bg-dark-card border border-dark-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-dark-text-primary mb-3">
            Seu link de afiliado está pronto:
          </h2>
          <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-dark-border">
            <p className="text-purple-400 break-all flex-1 px-2">
              {generatedLink}
            </p>
            <button
              onClick={handleCopy}
              className="flex-shrink-0 flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-dark-text-secondary font-medium py-2 px-3 rounded-md transition-colors"
            >
              {isCopied ? <CheckIcon className="text-green-400 h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
              {isCopied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};