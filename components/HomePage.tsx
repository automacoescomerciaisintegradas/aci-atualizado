import React from 'react';
import { Page } from '../App.js';
import { FeaturesSection } from './HomePageComponents/FeaturesSection.js';
import { FeaturedProductSection } from './HomePageComponents/FeaturedProductSection.js';
import { OffersSection } from './HomePageComponents/OffersSection.js';
import { SecuritySection } from './HomePageComponents/SecuritySection.js';
import { HomeFooter } from './HomePageComponents/HomeFooter.js';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const affiliateLink = 'https://shopee.com.br/product/1006215031/22596833753?af_id=18372150411';

  const images = [
    'https://down-br.img.susercontent.com/file/br-11134258-7r98o-mbpr92sw6g6132',
    'https://down-br.img.susercontent.com/file/sg-11134201-7rbl9-lmxhplptcwsl78.webp',
    'https://down-br.img.susercontent.com/file/sg-11134201-7rbkc-lmxhpkjx27xla2.webp',
    'https://down-br.img.susercontent.com/file/sg-11134201-7rbm6-lmxhpjsg6f1le8.webp',
    'https://down-br.img.susercontent.com/file/sg-11134201-7rbkm-lmxhpgy2c95lef.webp'
  ];

  return (
    <div className="animate-fade-in space-y-6 md:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 xl:gap-8">
        <div className="md:col-span-2 xl:col-span-2 2xl:col-span-3">
          <FeaturesSection onNavigate={onNavigate} />
        </div>
        <div className="md:col-span-2 xl:col-span-1">
          <SecuritySection onNavigate={onNavigate} />
        </div>
      </div>

      <FeaturedProductSection affiliateLink={affiliateLink} images={images} />

      <OffersSection />

      <HomeFooter />
    </div>
  );
};