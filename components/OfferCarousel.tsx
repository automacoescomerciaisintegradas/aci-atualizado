import React from 'react';
import { offerProducts } from './OfferData';
import {
    SmartphoneIcon,
    ShirtIcon,
    HomeIcon,
    SparklesIcon,
    KeyboardIcon,
    DumbbellIcon,
    ShopeeIcon,
    MercadoLivreIcon,
    AmazonIcon
} from './Icons';

const categoryIcons: { [key: string]: React.ReactElement } = {
    'Eletrônicos': <SmartphoneIcon className="h-4 w-4" />,
    'Moda': <ShirtIcon className="h-4 w-4" />,
    'Casa': <HomeIcon className="h-4 w-4" />,
    'Beleza': <SparklesIcon className="h-4 w-4" />,
    'Informática': <KeyboardIcon className="h-4 w-4" />,
    'Esportes': <DumbbellIcon className="h-4 w-4" />,
};

const platformStyles: { [key: string]: { badgeBg: string, badgeText: string, buttonGradient: string, icon: React.ReactElement } } = {
    'Shopee': {
        badgeBg: 'bg-gradient-to-r from-orange-500 to-red-600',
        badgeText: 'text-white',
        buttonGradient: 'from-orange-500 to-red-600',
        icon: <ShopeeIcon className="h-5 w-5" />
    },
    'Mercado Livre': {
        badgeBg: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
        badgeText: 'text-[#050505]',
        buttonGradient: 'from-yellow-400 to-yellow-500',
        icon: <MercadoLivreIcon className="h-5 w-5" />
    },
    'Amazon': {
        badgeBg: 'bg-gradient-to-r from-gray-800 to-gray-900',
        badgeText: 'text-white',
        buttonGradient: 'from-orange-400 to-orange-600',
        icon: <AmazonIcon className="h-5 w-5" />
    }
};

const ProductCard: React.FC<{ product: typeof offerProducts[0] }> = ({ product }) => {
    const styles = platformStyles[product.platform] || {
        badgeBg: 'bg-gray-700',
        badgeText: 'text-white',
        buttonGradient: 'from-gray-600 to-gray-800',
        icon: <SparklesIcon className="h-5 w-5" />
    };

    return (
        <div className="flex-shrink-0 w-80 bg-[#121212] border border-white/5 rounded-2xl overflow-hidden group relative transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 flex flex-col">
            <div className="relative">
                <div className="h-64 bg-[#1a1a1a] overflow-hidden flex items-center justify-center p-4">
                    <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div className="absolute top-4 left-4">
                    <span className={`${styles.badgeBg} ${styles.badgeText} flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-lg`}>
                        {styles.icon} {product.platform}
                    </span>
                </div>
                <div className="absolute top-4 right-4">
                    <span className="bg-red-600 text-white px-4 py-2 rounded-full font-black text-lg shadow-lg">
                        - {product.discount}
                    </span>
                </div>
                <div className="absolute bottom-4 left-4">
                    <span className="backdrop-blur-sm bg-black/40 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                        {categoryIcons[product.category] || '🛍️'} {product.category}
                    </span>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-lg text-white mb-4 flex-grow line-clamp-3 leading-tight">{product.name}</h3>
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-gray-500 line-through text-xs font-bold">{product.oldPrice}</span>
                    <span className="text-3xl font-black text-green-400 tracking-tighter">{product.newPrice}</span>
                </div>

                <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full text-center py-3 rounded-xl font-black transition-all bg-gradient-to-r ${styles.buttonGradient} ${styles.badgeText} hover:opacity-90 mt-auto uppercase text-xs tracking-widest`}
                >
                    Ver Oferta →
                </a>
            </div>
        </div>
    );
};

interface OfferCarouselProps {
    filterCategory: string;
}

export const OfferCarousel: React.FC<OfferCarouselProps> = ({ filterCategory }) => {
    const filteredProducts = filterCategory === 'Todas'
        ? offerProducts
        : offerProducts.filter(p => p.category === filterCategory || p.platform === filterCategory);

    if (filteredProducts.length === 0) {
        return (
            <div className="text-center py-20 px-6 text-gray-500 font-bold uppercase tracking-widest text-xs border border-white/5 rounded-3xl bg-[#0a0a0a]">
                Nenhuma oferta encontrada para esta categoria no momento.
            </div>
        );
    }

    return (
        <div className="w-full flex flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_10%,_black_90%,transparent_100%)]">
            <ul className="flex items-stretch justify-center md:justify-start [&_li]:mx-4 animate-infinite-scroll hover:[animation-play-state:paused]">
                {filteredProducts.map((product) => (
                    <li key={product.id} className="flex">
                        <ProductCard product={product} />
                    </li>
                ))}
            </ul>
            <ul className="flex items-stretch justify-center md:justify-start [&_li]:mx-4 animate-infinite-scroll hover:[animation-play-state:paused]" aria-hidden="true">
                {filteredProducts.map((product) => (
                    <li key={`${product.id}-clone`} className="flex">
                        <ProductCard product={product} />
                    </li>
                ))}
            </ul>
        </div>
    );
};