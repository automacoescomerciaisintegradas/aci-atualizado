import React from 'react';
import { Settings } from '../../hooks/useSettings.js';
import { Card, Button } from './StyledComponents';

interface ApiKeysTabProps {
  localConfig: Settings;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSave: () => void;
  saveStatus: 'idle' | 'success' | 'error' | 'loading';
}

export const ApiKeysTab: React.FC<ApiKeysTabProps> = ({ localConfig, handleInputChange, handleSave, saveStatus }) => {
  // Simple input component for this specific use case
  const FormField = ({ label, id, isSecret, placeholder, value, description }: any) => (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-[#b4b7bd] mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={isSecret ? "password" : "text"}
          id={id}
          name={id}
          value={value}
          onChange={handleInputChange}
          className="w-full bg-[#2f3245] border border-[#3b4253] rounded-md px-3.5 py-2.5 text-[#d0d2d6] placeholder-[#676d7d] focus:ring-2 focus:ring-[#6d6bfb] focus:border-transparent transition duration-200"
          placeholder={placeholder}
        />
      </div>
      {description && <p className="text-xs text-[#676d7d] mt-2">{description}</p>}
    </div>
  );

  return (
    <div>
      <h3 className="text-lg font-semibold text-[#d0d2d6] mb-2">Gerenciamento de Chaves de API</h3>
      <p className="text-[#b4b7bd] text-sm mb-6">
        Adicione suas chaves de API de diferentes provedores. Elas são salvas localmente no seu navegador e nunca são enviadas para nossos servidores.
      </p>
      <div className="space-y-6">
        <Card className="p-6">
          <h4 className="text-md font-semibold text-[#d0d2d6] mb-4">Google Gemini</h4>
          <FormField 
            label="GEMINI_API_KEY" 
            id="geminiApiKey" 
            isSecret 
            placeholder="AIzaSyB..." 
            value={localConfig.geminiApiKey || ''} 
            description="Chave de API do Google Gemini para acesso aos modelos de IA."
          />
        </Card>

        {/* Other APIs */}
        <Card className="p-6 space-y-4">
          <h4 className="text-md font-semibold text-[#d0d2d6]">Outros Provedores</h4>
          <FormField label="OpenAI API Key" id="openaiApiKey" isSecret placeholder="sk-..." value={localConfig.openaiApiKey} />
          <FormField label="Anthropic API Key" id="anthropicApiKey" isSecret placeholder="sk-ant-..." value={localConfig.anthropicApiKey} />
          <FormField label="Groq API Key" id="groqApiKey" isSecret placeholder="gsk_..." value={localConfig.groqApiKey} />
          <FormField label="Ollama (Base URL)" id="ollamaApiKey" placeholder="http://localhost:11434" value={localConfig.ollamaApiKey} description="Para Ollama, insira a URL base do seu servidor local." />

          <div className="pt-4 flex justify-end">
            <Button
              onClick={handleSave}
              variant="primary"
            >
              {saveStatus === 'loading' ? 'Salvando...' : saveStatus === 'success' ? 'Salvo!' : 'Salvar Chaves'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};