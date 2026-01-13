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

      <div className="p-6 bg-slate-800/50 rounded-lg border border-dark-border mb-6">
        <h4 className="text-lg font-semibold text-dark-text-primary mb-4">Modelos Ativos</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Modelo de Texto Padrão"
            id="aiTextModel"
            placeholder="ex: gemini-2.0-flash, gpt-4o, claude-3-5-sonnet"
            value={localConfig.aiTextModel}
            onChange={handleInputChange}
          />
          <FormField
            label="Modelo de Imagem Padrão"
            id="aiImageModel"
            placeholder="ex: imagen-4.0-generate-001"
            value={localConfig.aiImageModel}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Parâmetros Avançados */}
        <div className="p-6 bg-slate-800/50 rounded-lg border border-dark-border">
          <h4 className="text-lg font-semibold text-dark-text-primary mb-4 flex items-center gap-2">
            ⚙️ Parâmetros de Geração
          </h4>
          <div className="space-y-6">
            <div>
              <label htmlFor="aiTemperature" className="block text-sm font-medium text-dark-text-secondary mb-2">Temperatura (Criatividade)</label>
              <div className="flex items-center gap-4">
                <input type="range" id="aiTemperature" min="0" max="1" step="0.1" value={localConfig.aiTemperature} onChange={handleInputChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-primary" />
                <span className="font-mono text-dark-text-primary bg-slate-900 px-2 py-1 rounded-md text-sm">{localConfig.aiTemperature.toFixed(1)}</span>
              </div>
            </div>

            <div>
              <label htmlFor="aiTopP" className="block text-sm font-medium text-dark-text-secondary mb-2">Top P (Nucleus Sampling)</label>
              <div className="flex items-center gap-4">
                <input type="range" id="aiTopP" min="0" max="1" step="0.05" value={localConfig.aiTopP} onChange={handleInputChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-secondary" />
                <span className="font-mono text-dark-text-primary bg-slate-900 px-2 py-1 rounded-md text-sm">{localConfig.aiTopP.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label htmlFor="aiTopK" className="block text-sm font-medium text-dark-text-secondary mb-2">Top K</label>
              <div className="flex items-center gap-4">
                <input type="range" id="aiTopK" min="1" max="100" step="1" value={localConfig.aiTopK} onChange={handleInputChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                <span className="font-mono text-dark-text-primary bg-slate-900 px-2 py-1 rounded-md text-sm">{localConfig.aiTopK}</span>
              </div>
            </div>

            <FormField
              label="Máximo de Tokens de Saída"
              id="aiMaxOutputTokens"
              type="number"
              placeholder="ex: 2048"
              value={localConfig.aiMaxOutputTokens}
              onChange={handleInputChange}
              description="Limite máximo de palavras/tokens que a IA pode gerar em uma resposta."
            />
          </div>
        </div>

        {/* Provedores de API */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-800/50 rounded-lg border border-dark-border">
            <h4 className="text-lg font-semibold text-dark-text-primary mb-4 flex items-center gap-2">
              📂 Provedores e Chaves
            </h4>
            <div className="space-y-4">
              <FormField
                label="Google Gemini Key"
                id="geminiApiKey"
                isSecret
                placeholder="AIzaSy..."
                value={localConfig.geminiApiKey || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="OpenAI API Key"
                id="openaiApiKey"
                isSecret
                placeholder="sk-..."
                value={localConfig.openaiApiKey || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Anthropic Key"
                id="anthropicApiKey"
                isSecret
                placeholder="sk-ant-..."
                value={localConfig.anthropicApiKey || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Groq API Key"
                id="groqApiKey"
                isSecret
                placeholder="gsk_..."
                value={localConfig.groqApiKey || ''}
                onChange={handleInputChange}
              />
              <FormField
                label="Ollama / Local API Base"
                id="ollamaApiKey"
                placeholder="http://localhost:11434"
                value={localConfig.ollamaApiKey || ''}
                onChange={handleInputChange}
                description="URL base para Ollama ou provedores compatíveis com OpenAI."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};