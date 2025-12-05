
import React from 'react';
import { AlertTriangleIcon, SettingsIcon } from './Icons';
import { Page } from '../App';

interface ConfigurationNeededProps {
  onNavigate: (page: Page) => void;
}

export const ConfigurationNeeded: React.FC<ConfigurationNeededProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto animate-fade-in">
      <div className="bg-dark-card rounded-xl shadow-2xl shadow-black/20 border border-dark-border p-8 flex flex-col items-center gap-4">
        <AlertTriangleIcon className="h-12 w-12 text-yellow-400" />
        <h2 className="text-2xl font-bold text-dark-text-primary">Configuração Necessária</h2>
        <p className="text-md text-dark-text-secondary">
          Funcionalidades incompletas. Por favor, configure o Token do Telegram, ID do Canal e ID de Afiliado no Painel Administrativo para liberar o acesso a esta e outras ferramentas.
        </p>
        <button
          onClick={() => onNavigate('admin')}
          className="mt-4 flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-primary/90 transition-opacity duration-300 shadow-lg shadow-indigo-500/30"
        >
          <SettingsIcon className="h-5 w-5" />
          Ir para Configurações
        </button>
      </div>
    </div>
  );
};
