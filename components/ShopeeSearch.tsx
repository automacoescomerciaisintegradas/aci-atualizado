
import React, { useState, useCallback, FormEvent, useMemo } from 'react';
import { searchShopeeProductsFromApi, searchAmazonProductsFromApi, searchMercadoLivreProductsFromApi, getShopeeProductDetailsFromUrl, Product } from '../services/geminiService';
import { SearchIcon, SpinnerIcon, AlertTriangleIcon, ChevronLeftIcon, ChevronRightIcon, ShopeeIcon, AmazonIcon, MercadoLivreIcon, LinkIcon, FileTextIcon, CheckIcon } from './Icons';
import { ProductDetailsModal } from './ProductDetailsModal';
import { useSettings } from '../hooks/useSettings';

type Platform = 'shopee' | 'amazon' | 'mercado-livre';
type SearchMode = 'keyword' | 'url';
const ITEMS_PER_PAGE = 8;

// Main search component
export const ProductSearchPage: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('shopee');
  const [searchMode, setSearchMode] = useState<SearchMode>('keyword');
  const [keyword, setKeyword] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { settings } = useSettings();

  const handleSearch = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    setIsLoading(true);
    setError(null);
    setProducts([]);

    if (searchMode === 'keyword') {
      if (!keyword.trim()) {
        setError('Por favor, digite uma palavra-chave para pesquisar.');
        setIsLoading(false);
        return;
      }
      try {
        let results;
        if (platform === 'shopee') {
            results = await searchShopeeProductsFromApi(keyword);
        } else if (platform === 'amazon') {
            results = await searchAmazonProductsFromApi(keyword);
        } else { // mercado-livre
            results = await searchMercadoLivreProductsFromApi(keyword);
        }
        setProducts(results);
        if(results.length === 0){
          setError("Nenhum produto encontrado. Tente outra palavra-chave.");
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao buscar os produtos. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    } else { // searchMode === 'url' (Only for Shopee for now)
      const trimmedInput = productUrl.trim();
      let finalUrl = '';

      const idFormatRegex = /^\d+\.\d+$/;
      const fullUrlRegex = /-i\.(\d+\.\d+)/;

      if (idFormatRegex.test(trimmedInput)) {
        finalUrl = `https://shopee.com.br/--i.${trimmedInput}`;
      } else if (trimmedInput.includes('shopee.com.br')) {
        const match = trimmedInput.match(fullUrlRegex);
        if (match && match[1]) {
          finalUrl = `https://shopee.com.br/--i.${match[1]}`;
        }
      }

      if (!finalUrl) {
        setError('URL ou ID inválido. Use um link completo da Shopee (que contenha "-i.shopId.itemId") ou apenas o ID no formato "shopId.itemId".');
        setIsLoading(false);
        return;
      }
      
      try {
        const result = await getShopeeProductDetailsFromUrl(finalUrl);
        if (result.error) {
          setError(result.error);
        } else {
          setProducts([result]);
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'Ocorreu um erro ao buscar os detalhes do produto. Verifique o link e tente novamente.');
      } finally {
        setIsLoading(false);
      }
    }
  }, [keyword, productUrl, searchMode, platform]);

  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
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
        <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Busca de Produtos</h1>
        <p className="text-md text-dark-text-secondary">Encontre produtos em diversas plataformas para promover como afiliado.</p>
      </div>

      <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-6 md:p-8 mb-10">
        
        {/* Platform Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <button 
                type="button" 
                onClick={() => setPlatform('shopee')} 
                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                    platform === 'shopee' 
                    ? 'bg-orange-500/10 border-orange-500 text-orange-500 ring-2 ring-orange-500/30 ring-offset-2 ring-offset-dark-card' 
                    : 'bg-slate-800 border-dark-border text-dark-text-secondary hover:border-slate-600 hover:bg-slate-700/50 opacity-75 hover:opacity-100'
                }`}
            >
                {platform === 'shopee' && (
                    <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-0.5">
                        <CheckIcon className="h-3 w-3" />
                    </div>
                )}
                <ShopeeIcon className={`h-10 w-10 mb-3 ${platform === 'shopee' ? 'text-orange-500' : 'text-dark-text-secondary'}`}/> 
                <span className="font-bold text-lg">Shopee</span>
            </button>
            <button 
                type="button" 
                onClick={() => setPlatform('amazon')} 
                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                    platform === 'amazon' 
                    ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500 ring-2 ring-yellow-500/30 ring-offset-2 ring-offset-dark-card' 
                    : 'bg-slate-800 border-dark-border text-dark-text-secondary hover:border-slate-600 hover:bg-slate-700/50 opacity-75 hover:opacity-100'
                }`}
            >
                 {platform === 'amazon' && (
                    <div className="absolute top-3 right-3 bg-yellow-500 text-white rounded-full p-0.5">
                        <CheckIcon className="h-3 w-3" />
                    </div>
                )}
                <AmazonIcon className={`h-10 w-10 mb-3 ${platform === 'amazon' ? 'text-yellow-500' : 'text-dark-text-secondary'}`}/> 
                <span className="font-bold text-lg">Amazon</span>
            </button>
            <button 
                type="button" 
                onClick={() => setPlatform('mercado-livre')} 
                className={`relative flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 active:scale-[0.98] ${
                    platform === 'mercado-livre' 
                    ? 'bg-blue-500/10 border-blue-500 text-blue-500 ring-2 ring-blue-500/30 ring-offset-2 ring-offset-dark-card' 
                    : 'bg-slate-800 border-dark-border text-dark-text-secondary hover:border-slate-600 hover:bg-slate-700/50 opacity-75 hover:opacity-100'
                }`}
            >
                 {platform === 'mercado-livre' && (
                    <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-0.5">
                        <CheckIcon className="h-3 w-3" />
                    </div>
                )}
                <MercadoLivreIcon className={`h-10 w-10 mb-3 ${platform === 'mercado-livre' ? 'fill-blue-500' : 'text-dark-text-secondary fill-current'}`}/> 
                <span className="font-bold text-lg">Mercado Livre</span>
            </button>
        </div>

        {/* Search Mode Toggle (Segmented Control) */}
        <div className="flex justify-center mb-8">
            <div className="bg-slate-900 p-1.5 rounded-full inline-flex border border-dark-border shadow-inner">
                <button 
                    onClick={() => setSearchMode('keyword')}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                        searchMode === 'keyword' 
                        ? 'bg-slate-700 text-white shadow-sm ring-1 ring-white/10' 
                        : 'text-dark-text-secondary hover:text-dark-text-primary'
                    }`}
                >
                    <SearchIcon className="h-4 w-4" />
                    Palavra-Chave
                </button>
                {platform === 'shopee' && (
                    <button 
                        onClick={() => setSearchMode('url')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                            searchMode === 'url' 
                            ? 'bg-slate-700 text-white shadow-sm ring-1 ring-white/10' 
                            : 'text-dark-text-secondary hover:text-dark-text-primary'
                        }`}
                    >
                        <LinkIcon className="h-4 w-4" />
                        Link / ID
                    </button>
                )}
            </div>
        </div>

        <form onSubmit={handleSearch}>
          {searchMode === 'keyword' ? (
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="flex-grow bg-slate-800 border border-dark-border rounded-xl p-4 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-lg"
                placeholder={`Pesquisar na ${platform.replace('-', ' ')}...`}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !keyword}
                className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-95"
              >
                {isLoading ? <SpinnerIcon /> : <SearchIcon className="h-5 w-5" />}
                <span>Pesquisar</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                className="flex-grow bg-slate-800 border border-dark-border rounded-xl p-4 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 text-lg"
                placeholder="Cole o link do produto Shopee ou o ID"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !productUrl}
                className="flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-95"
              >
                {isLoading ? <SpinnerIcon /> : <SearchIcon className="h-5 w-5" />}
                <span>Buscar Produto</span>
              </button>
            </div>
          )}
        </form>
      </div>

      {!affiliateId && (
         <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-300 p-4 rounded-lg flex items-center gap-3 mb-8">
            <AlertTriangleIcon />
            <p>Seu ID de Afiliado para <span className="font-bold capitalize">{platform.replace('-', ' ')}</span> não está configurado. Por favor, adicione-o no <span className="font-bold">Painel Administrativo</span> para gerar links.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-center gap-3 mb-8">
          <AlertTriangleIcon />
          <p>{error}</p>
        </div>
      )}

      {isLoading && renderSkeletons()}

      {!isLoading && products.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product, index) => (
              <div 
                  key={index} 
                  className="bg-dark-card border border-dark-border rounded-xl p-4 flex flex-col group transition-all duration-300 hover:shadow-2xl hover:border-brand-primary/50 cursor-pointer active:scale-[0.98] active:shadow-lg hover:-translate-y-1"
                  onClick={() => handleOpenDetails(product)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleOpenDetails(product)}
              >
                <div className="relative overflow-hidden rounded-lg mb-4 bg-slate-800 aspect-square">
                    <img src={product.image_url} alt={product.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-sm font-semibold text-dark-text-primary flex-grow mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">{product.title}</h3>
                <p className="text-lg font-bold text-purple-400 mb-4">{product.price}</p>
                <div 
                  className="w-full text-center bg-slate-700 text-dark-text-secondary font-bold py-2 px-4 rounded-lg group-hover:bg-brand-primary group-hover:text-white transition-colors duration-200 mt-auto flex items-center justify-center gap-2"
                >
                  <FileTextIcon className="h-4 w-4"/>
                  Ver Detalhes
                </div>
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
      
      <ProductDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        product={selectedProduct}
        platform={platform}
      />
    </div>
  );
};
