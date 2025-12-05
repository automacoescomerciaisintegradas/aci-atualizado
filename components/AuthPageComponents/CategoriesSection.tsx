import React from 'react';
import { InfiniteCarousel } from '../InfiniteCarousel.js';

export const CategoriesSection: React.FC = () => {
  return (
    <section id="categories" className="py-32 bg-neutrals-background_main relative">
      <div className="max-w-2xl mx-auto text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-display font-black text-white mb-4 uppercase tracking-tight">Todas as Categorias</h2>
        <p className="text-gray-400 text-lg font-light">Explore produtos das principais plataformas: Shopee, Mercado Livre e Amazon.</p>
      </div>

      {/* Infinite Carousel */}
      <InfiniteCarousel />

      <div className="container mx-auto px-6 lg:px-16 mt-12 text-center">
        <p className="text-sm text-gray-500 font-mono">
          * Ofertas atualizadas em tempo real via API oficial.
        </p>
      </div>
    </section>
  );
};