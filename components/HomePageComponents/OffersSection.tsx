import React from 'react';
import { OfferCarousel } from '../OfferCarousel.js';

export const OffersSection: React.FC = () => {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-dark-text-primary mb-2">🔥 Ofertas Imperdíveis</h2>
      <p className="text-md text-dark-text-secondary mb-6">Confira as melhores promoções selecionadas para você de diversas plataformas.</p>
      <OfferCarousel filterCategory="Todas" />
    </div>
  );
};