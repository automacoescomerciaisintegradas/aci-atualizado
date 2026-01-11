import React from 'react';
import { AutomationSettings } from '../AutomationSettings';

interface AutomationTabProps {
  onSave?: () => void;
}

export const AutomationTab: React.FC<AutomationTabProps> = ({ onSave }) => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Automação com n8n</h2>
        <p className="text-dark-text-secondary">
          Configure integrações com o n8n e outros serviços de automação. Cada execução consome créditos do seu saldo.
        </p>
      </div>

      <AutomationSettings onSave={onSave} />
    </div>
  );
};