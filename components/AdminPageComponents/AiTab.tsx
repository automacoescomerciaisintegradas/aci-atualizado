import React from 'react';
import { Settings } from '../../hooks/useSettings.js';
import { FormField } from './FormField.js';

interface AiTabProps {
  localConfig: Settings;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const AiTab: React.FC<AiTabProps> = ({ localConfig, handleInputChange }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold">Configurações de IA e Modelos</h3>
      <p className="text-dark-text-secondary mb-8">
        Ajuste os parâmetros dos modelos de IA para otimizar os resultados para suas tarefas.
      </p>

      <div className="p-6 bg-slate-800/50 rounded-lg border border-dark-border">
        <h4 className="text-lg font-semibold text-dark-text-primary">Parâmetros dos Modelos</h4>
        <div className="space-y-6 mt-4">
          <FormField
            label="Modelo de Texto Padrão"
            id="aiTextModel"
            placeholder="ex: gemini-2.5-pro, anthropic/claude-3.7-sonnet"
            value={localConfig.aiTextModel}
            onChange={handleInputChange}
            description="Modelo usado para geração de texto, chat, etc. Modelos 'pro' são mais capazes, mas mais caros. Modelos 'flash' são mais rápidos e econômicos."
          />
          <FormField
            label="Modelo de Imagem Padrão"
            id="aiImageModel"
            placeholder="ex: imagen-4.0-generate-001"
            value={localConfig.aiImageModel}
            onChange={handleInputChange}
            description="Modelo usado para a geração de imagens."
          />
          <div>
            <label htmlFor="aiTemperature" className="block text-sm font-medium text-dark-text-secondary mb-2">Temperatura (Criatividade)</label>
            <div className="flex items-center gap-4">
              <input type="range" id="aiTemperature" min="0" max="1" step="0.1" value={localConfig.aiTemperature} onChange={handleInputChange} className="w-full" />
              <span className="font-mono text-dark-text-primary bg-slate-900 px-2 py-1 rounded-md text-sm">{localConfig.aiTemperature.toFixed(1)}</span>
            </div>
            <p className="text-xs text-dark-text-secondary mt-2">Valores mais baixos (ex: 0.2) geram respostas mais diretas e consistentes. Valores mais altos (ex: 0.9) geram respostas mais criativas e diversas.</p>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-800/50 rounded-lg border border-dark-border mt-6">
        <h4 className="text-lg font-semibold text-dark-text-primary mb-4">Google AI (Gemini)</h4>
        <div className="space-y-4">
          <FormField
            label="GEMINI_API_KEY"
            id="geminiApiKey"
            isSecret
            placeholder="AIzaSyB..."
            value={localConfig.geminiApiKey || ''}
            onChange={handleInputChange}
            description="Chave de API do Google Gemini para acesso aos modelos de IA."
          />
        </div>
        <div className="mt-4 text-sm text-dark-text-secondary">
          <h5 className="font-medium">Modelos Disponíveis:</h5>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Gemini 2.5 Pro</strong>: Mais capaz, para tarefas complexas ($1.25 entrada, $10.00 saída por 1M tokens)</li>
            <li><strong>Gemini 2.5 Flash</strong>: Rápido e econômico, para tarefas simples ($0.30 entrada, $2.50 saída por 1M tokens)</li>
            <li><strong>Gemini 2.0 Flash</strong>: Mais rápido, para tarefas de baixa complexidade ($0.10 entrada, $0.40 saída por 1M tokens)</li>
          </ul>
          <p className="mt-2">Modelos 'pro' são mais precisos, mas mais caros. Modelos 'flash' são mais rápidos e econômicos.</p>
        </div>
      </div>
    </div>
  );
};