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
    title: 'Geração IA',
    description: 'Crie posts de blog e produtos com IA.',
    page: 'aci-posts' as Page,
    icon: <BookIcon className="h-12 w-12 text-white" />,
    advantages: [
      'Geração 100% autônoma',
      'Links de afiliados inclusos',
    ],
  },
  {
    title: 'Automação Telegram',
    description: 'Envio em lote para canais e grupos.',
    page: 'shopee-lote' as Page,
    icon: <ShoppingCartSendIcon className="h-12 w-12 text-white" />,
    advantages: [
      'Múltiplas ofertas Shopee',
      'Agendamento inteligente',
    ],
  },
  {
    title: 'Marketing Social',
    description: 'Gerencie Instagram e Facebook com IA.',
    page: 'instagram-connect' as Page,
    icon: <BrainCircuitIcon className="h-12 w-12 text-white" />,
    advantages: [
      'Legendas automáticas',
      'Análise de engajamento',
    ],
  },
];

interface FeaturesSectionProps {
  onNavigate: (page: Page, context?: { from?: Page; initialTab?: any }) => void;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onNavigate }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-full">
      {features.map((feature, index) => (
        <div
          key={index}
          onClick={() => onNavigate(feature.page)}
          className="card-premium card-interactive p-6 flex flex-col justify-between group cursor-pointer h-full"
        >
          <div>
            <div className="mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
              {React.cloneElement(feature.icon as React.ReactElement<any>, { className: 'h-10 w-10 text-blue-400' })}
            </div>

            <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{feature.title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">{feature.description}</p>

            <div className="space-y-3">
              {feature.advantages.map(adv => (
                <div key={adv} className="flex items-center gap-2 text-[13px] text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50" />
                  <span>{adv}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center text-blue-400 text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
            Acessar Módulo
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
};