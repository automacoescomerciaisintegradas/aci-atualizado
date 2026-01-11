import React from 'react';
import { AutomationSettings } from '../components/AutomationSettings';
import { SettingsIcon, ZapIcon } from '../components/Icons';

export const AutomationPage: React.FC = () => {
  return (
    <div className="animate-fade-in">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center glow-primary">
          <ZapIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Automação com n8n</h1>
          <p className="text-sm text-dark-text-secondary">
            Configure integrações com o n8n e outros serviços de automação. Cada execução consome créditos do seu saldo.
          </p>
        </div>
      </div>

      <div className="card-premium p-6 md:p-8">
        <AutomationSettings />
      </div>
    </div>
  );
};