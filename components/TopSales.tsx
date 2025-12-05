import React, { useState, useCallback, FormEvent, useMemo } from 'react';
import { getTopSalesFromApi, getTopSalesAmazonFromApi, getTopSalesMercadoLivreFromApi, Product } from '../services/geminiService';
import { TrendingUpIcon, SpinnerIcon, AlertTriangleIcon, ChevronLeftIcon, ChevronRightIcon, ShopeeIcon, AmazonIcon, MercadoLivreIcon } from './Icons';
import { SHOPEE_CATEGORIES } from '../constants';
import { GenerateLinkModal } from './GenerateLinkModal';
import { useSettings } from '../hooks/useSettings';

type Platform = 'shopee' | 'amazon' | 'mercado-livre';
const ITEMS_PER_PAGE = 8;

export const TopSalesPage: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('shopee');
  const [category, setCategory] = useState<string>(SHOPEE_CATEGORIES[0].value);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { settings } = useSettings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSearch = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setProducts([]);
    setSearched(true);
    setCurrentPage(1);
    try {
      let results;
      if (platform === 'shopee') {
        results = await getTopSalesFromApi(category);
      } else if (platform === 'amazon') {
        results = await getTopSalesAmazonFromApi(category);
      } else { // mercado-livre
        results = await getTopSalesMercadoLivreFromApi(category);
      }
      setProducts(results);
      if (results.length === 0) {
        setError("Nenhum produto encontrado para esta categoria. Tente outra.");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro ao buscar os produtos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, [category, platform]);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
      const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
      return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-dark-card border border-dark-border rounded-xl p-4 animate-pulse-fast">
          <div className="bg-slate-700 h-40 w-full rounded-lg mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-slate-700 rounded-lg w-full"></div>
        </div>
      ))}
    </div>
  );

  const affiliateId = platform === 'shopee' ? settings.shopeeAffiliateId : platform === 'amazon' ? settings.amazonAffiliateId : settings.mercadoLivreAffiliateId;

  return (
    <div className="animate-fade-in">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Top Vendas</h1>
        <p className="text-md text-dark-text-secondary">Descubra os produtos mais vendidos por categoria em diversas plataformas.</p>
      </div>

      <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8 mb-10">
          <div className="flex border-b border-dark-border mb-6">
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
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            {platform === 'shopee' ? (
                <>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full appearance-none bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                    disabled={isLoading}
                >
                    {SHOPEE_CATEGORIES.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
                </>
            ) : (
                 <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                    placeholder="Digite uma categoria, ex: smartphones"
                    disabled={isLoading}
                />
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !category}
            className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-300 shadow-lg shadow-indigo-500/30"
          >
            {isLoading ? <SpinnerIcon /> : <TrendingUpIcon className="h-5 w-5" />}
            <span>Buscar Top Vendas</span>
          </button>
        </form>
      </div>
      
       {!affiliateId && searched && (
         <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-300 p-4 rounded-lg flex items-center gap-3 mb-8">
            <AlertTriangleIcon />
            <p>Seu ID de Afiliado para <span className="font-bold capitalize">{platform.replace('-', ' ')}</span> não está configurado. Por favor, adicione-o no <span className="font-bold">Painel Administrativo</span> para poder gerar links.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-center gap-3 mb-8">
          <AlertTriangleIcon />
          <p>{error}</p>
        </div>
      )}

      {isLoading && renderSkeletons()}

      {!isLoading && searched && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product, index) => (
              <div key={index} className="bg-dark-card border border-dark-border rounded-xl p-4 flex flex-col group transition-all duration-300 hover:shadow-2xl hover:border-brand-primary/50 hover:-translate-y-1">
                <img src={product.image_url} alt={product.title} className="w-full h-40 object-cover rounded-lg mb-4 bg-slate-800" />
                <h3 className="text-sm font-semibold text-dark-text-primary flex-grow mb-2 line-clamp-2">{product.title}</h3>
                <p className="text-lg font-bold text-purple-400 mb-4">{product.price}</p>
                <button
                  onClick={() => openModal(product)}
                  disabled={!affiliateId}
                  className="w-full bg-slate-700 text-dark-text-secondary font-bold py-2 px-4 rounded-lg hover:bg-brand-primary hover:text-white transition-colors duration-200 mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!affiliateId ? "Configure seu ID de afiliado primeiro" : "Gerar link de afiliado"}
                >
                  Gerar Link
                </button>
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8">
              <nav aria-label="Pagination">
                <ul className="inline-flex items-center -space-x-px text-sm">
                  <li>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center justify-center h-10 px-4 font-medium text-dark-text-secondary bg-dark-card border border-dark-border rounded-l-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                      <span className="ml-2 hidden sm:inline">Anterior</span>
                    </button>
                  </li>
                  <li>
                    <span
                      aria-current="page"
                      className="flex items-center justify-center h-10 px-4 font-semibold text-dark-text-primary bg-slate-800 border-y border-dark-border"
                    >
                      Página {currentPage} de {totalPages}
                    </span>
                  </li>
                  <li>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center justify-center h-10 px-4 font-medium text-dark-text-secondary bg-dark-card border border-dark-border rounded-r-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="mr-2 hidden sm:inline">Próxima</span>
                      <ChevronRightIcon className="h-4 w-4" />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      <GenerateLinkModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        product={selectedProduct}
        affiliateId={affiliateId}
        platform={platform}
      />
    </div>
  );
};