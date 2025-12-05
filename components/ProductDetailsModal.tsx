import React, { useState, useEffect } from 'react';
import { Product, generateShopeeLinkFromApi, generateAmazonLinkFromApi, generateMercadoLivreLinkFromApi } from '../services/geminiService';
import { XIcon, LinkIcon, SpinnerIcon, CopyIcon, CheckIcon } from './Icons';
import { useSettings } from '../hooks/useSettings';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  platform: 'shopee' | 'amazon' | 'mercado-livre';
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({ isOpen, onClose, product, platform }) => {
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    if (isOpen) {
      setGeneratedLink('');
      setError(null);
      setIsLoading(false);
      setIsCopied(false);
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleGenerateClick = async () => {
    if (!product) return;
    
    let affiliateId: string;
    switch (platform) {
        case 'shopee': affiliateId = settings.shopeeAffiliateId; break;
        case 'amazon': affiliateId = settings.amazonAffiliateId; break;
        case 'mercado-livre': affiliateId = settings.mercadoLivreAffiliateId; break;
        default: affiliateId = '';
    }

    if (!affiliateId) {
        setError(`Configure seu ID de afiliado para ${platform} no Painel Admin.`);
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedLink('');
    setIsCopied(false);
    try {
      let result;
      if (platform === 'shopee') {
        result = await generateShopeeLinkFromApi(product.product_url, affiliateId, []);
      } else if (platform === 'amazon') {
        result = await generateAmazonLinkFromApi(product.product_url, affiliateId);
      } else { // mercado-livre
        result = await generateMercadoLivreLinkFromApi(product.product_url, affiliateId);
      }
      setGeneratedLink(result);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao gerar o link.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };
  
  let affiliateIdToCheck: string;
    switch (platform) {
        case 'shopee': affiliateIdToCheck = settings.shopeeAffiliateId; break;
        case 'amazon': affiliateIdToCheck = settings.amazonAffiliateId; break;
        case 'mercado-livre': affiliateIdToCheck = settings.mercadoLivreAffiliateId; break;
        default: affiliateIdToCheck = '';
    }


  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
    >
      <div 
        className="bg-dark-card rounded-xl shadow-2xl border border-dark-border w-full max-w-md relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-dark-text-secondary hover:text-dark-text-primary transition-colors z-10">
          <XIcon className="h-6 w-6" />
        </button>
        <div>
          <img src={product.image_url} alt={product.title} className="w-full h-64 object-cover rounded-t-xl bg-slate-800" />
          <div className="p-6">
            <h2 className="text-xl font-bold text-dark-text-primary mb-2 line-clamp-2">{product.title}</h2>
            <p className="text-2xl font-bold text-purple-400 mb-6">{product.price}</p>
            
            {generatedLink ? (
              <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-2">Seu link de afiliado:</label>
                <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-dark-border">
                  <p className="text-purple-400 break-all flex-1 px-2 text-sm">{generatedLink}</p>
                  <button onClick={handleCopy} className="flex-shrink-0 text-sm bg-slate-700 hover:bg-slate-600 text-dark-text-secondary font-medium py-2 px-3 rounded-md">
                    {isCopied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerateClick}
                disabled={isLoading || !affiliateIdToCheck}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary/90 transition-opacity duration-300 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!affiliateIdToCheck ? `Configure seu ID de afiliado para ${platform} no Painel Admin` : "Gerar Link de Afiliado"}
              >
                {isLoading ? <SpinnerIcon /> : <LinkIcon className="h-5 w-5" />}
                {isLoading ? 'Gerando...' : 'Gerar Link de Afiliado'}
              </button>
            )}
            {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
