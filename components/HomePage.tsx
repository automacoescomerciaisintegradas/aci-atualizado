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
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <FeaturesSection onNavigate={onNavigate} />
        </div>
        <div>
          <SecuritySection onNavigate={onNavigate} />
        </div>
      </div>

      <FeaturedProductSection affiliateLink={affiliateLink} images={images} />

      <OffersSection />

      <HomeFooter />
    </div>
  );
};