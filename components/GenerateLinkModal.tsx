import React, { useState, useEffect } from 'react';
import { generateShopeeLinkFromApi, generateAmazonLinkFromApi, generateMercadoLivreLinkFromApi, Product } from '../services/geminiService';
import { SpinnerIcon, CopyIcon, CheckIcon, XIcon } from './Icons';

interface GenerateLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  affiliateId: string;
  platform: 'shopee' | 'amazon' | 'mercado-livre';
}

export const GenerateLinkModal: React.FC<GenerateLinkModalProps> = ({ isOpen, onClose, product, affiliateId, platform }) => {
  const [localAffiliateId, setLocalAffiliateId] = useState('');
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Reset state when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      setLocalAffiliateId(affiliateId); // Pre-fill with saved ID
      setGeneratedLink('');
      setError(null);
      setIsLoading(false);
      setIsCopied(false);
    }
  }, [isOpen, product, affiliateId]);

  if (!isOpen || !product) return null;

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setGeneratedLink('');
    setIsCopied(false);
    try {
      let result;
      if (platform === 'shopee') {
        result = await generateShopeeLinkFromApi(product.product_url, localAffiliateId, []);
      } else if (platform === 'amazon') {
        result = await generateAmazonLinkFromApi(product.product_url, localAffiliateId);
      } else { // mercado-livre
        result = await generateMercadoLivreLinkFromApi(product.product_url, localAffiliateId);
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
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 animate-fade-in">
      <div className="bg-dark-card rounded-xl shadow-2xl border border-dark-border w-full max-w-lg relative animate-scale-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-dark-text-secondary hover:text-dark-text-primary transition-colors">
          <XIcon className="h-6 w-6" />
        </button>
        <div className="p-8">
          <h2 className="text-xl font-bold text-dark-text-primary mb-2">Gerar Link de Afiliado</h2>
          <p className="text-sm text-dark-text-secondary mb-6 line-clamp-2">{product.title}</p>

          <div className="space-y-4">
             <div>
                <label htmlFor="affiliateIdModal" className="block text-sm font-medium text-dark-text-secondary mb-2">
                  Seu ID de Afiliado <span className="text-xs">(Opcional)</span>
                </label>
                <input
                  type="text"
                  id="affiliateIdModal"
                  value={localAffiliateId}
                  onChange={(e) => setLocalAffiliateId(e.target.value)}
                  className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary"
                  placeholder="Ex: SEU_ID_DE_AFILIADO"
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50"
              >
                {isLoading ? <SpinnerIcon /> : 'Gerar Link'}
              </button>
          </div>
          
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          
          {!isLoading && generatedLink && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-dark-text-secondary mb-2">Seu link:</label>
               <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-dark-border">
                <p className="text-purple-400 break-all flex-1 px-2 text-sm">{generatedLink}</p>
                <button onClick={handleCopy} className="flex-shrink-0 text-sm bg-slate-700 hover:bg-slate-600 text-dark-text-secondary font-medium py-2 px-3 rounded-md">
                   {isCopied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <CopyIcon className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
