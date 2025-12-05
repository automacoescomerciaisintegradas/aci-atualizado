import React, { useState, useEffect } from 'react';
import { Page } from '../../App.js';
import { BrainCircuitIcon, ShoppingCartSendIcon, BookIcon } from '../Icons.js';

interface Feature {
  title: string;
  description: string;
  page: Page;
  icon: React.ReactNode;
  advantages: string[];
}

const features: Feature[] = [
  {
    title: 'Geração de Conteúdo com IA',
    description: 'Crie posts de blog profissionais com IA e produtos de afiliados.',
    page: 'aci-posts' as Page,
    icon: <BookIcon className="h-16 w-16 text-white" />,
    advantages: [
      'Conteúdo 100% gerado com IA',
      'Imagens e links automáticos',
      'Pronto para vender ou divulgar',
    ],
  },
  {
    title: 'Envio em Lote para Telegram',
    description: 'Encontre e envie múltiplas ofertas da Shopee para seus canais.',
    page: 'shopee-lote' as Page,
    icon: <ShoppingCartSendIcon className="h-16 w-16 text-white" />,
    advantages: [
      'Pesquisa de produtos integrada',
      'Seleção múltipla de ofertas',
      'Envio agendado e com intervalos',
    ],
  },
];

interface FeaturesSectionProps {
  onNavigate: (page: Page) => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onNavigate }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeFeature = features[activeIndex];

  return (
    <div 
      onClick={() => onNavigate(activeFeature.page)}
      className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-2xl shadow-indigo-500/30 flex flex-col justify-between h-full cursor-pointer group"
    >
      <div>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {React.cloneElement(features[activeIndex].icon, { className: 'h-8 w-8 text-white opacity-80' })}
              <h3 className="text-2xl font-bold">{activeFeature.title}</h3>
            </div>
            <p className="opacity-80 mb-6">{activeFeature.description}</p>
          </div>
          <div className="hidden md:block flex-shrink-0 transition-transform duration-500 group-hover:scale-110">
            {activeFeature.icon}
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="font-semibold">Vantagens:</p>
          {activeFeature.advantages.map(adv => (
            <div key={adv} className="flex items-center gap-3 text-sm">
              <BrainCircuitIcon className="h-5 w-5 text-lime-accent flex-shrink-0" />
              <span>{adv}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
            className={`h-2 w-8 rounded-full transition-colors ${activeIndex === index ? 'bg-white' : 'bg-white/30 hover:bg-white/50'}`}
            aria-label={`Ir para o slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};