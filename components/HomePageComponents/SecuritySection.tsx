import React from 'react';
import { Page } from '../../App.js';
import { ShieldIcon } from '../Icons.js';

interface SecuritySectionProps {
  onNavigate: (page: Page) => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ onNavigate }) => {
  return (
    <div className="bg-dark-card border border-dark-border rounded-2xl p-8 h-full flex flex-col justify-center items-center text-center">
      <div className="relative mb-4">
        <ShieldIcon className="h-16 w-16 text-dark-text-secondary" />
        <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-yellow-900 font-bold text-xs shadow-lg">
          !
        </span>
      </div>
      <h3 className="text-xl font-bold text-dark-text-primary mb-2">Duplo Fator (2FA)</h3>
      <p className="text-sm text-dark-text-secondary mb-1">Status: <span className="font-semibold text-yellow-400">Inativo</span></p>
      <p className="text-sm text-dark-text-secondary mb-6">Recomendamos ativar o Duplo Fator para mais segurança. Adicione uma camada extra de proteção à sua conta.</p>
      <button onClick={() => onNavigate('profile')} className="w-full bg-slate-700 hover:bg-slate-600 text-dark-text-primary font-bold py-3 px-4 rounded-lg transition-colors">
        Ativar Agora
      </button>
    </div>
  );
};