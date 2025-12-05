import React, { useState } from 'react';
import { useSettings, Settings } from '../hooks/useSettings.js';
import type { Page } from '../App.js';
import { TabButton } from './AdminPageComponents/TabButton.js';
import { ApiKeysTab } from './AdminPageComponents/ApiKeysTab.js';
import { IntegrationsTab } from './AdminPageComponents/IntegrationsTab.js';
import { AiTab } from './AdminPageComponents/AiTab.js';
import { CronTab } from './AdminPageComponents/CronTab.js';
import { useAdminValidations } from './AdminPageComponents/useAdminValidations.js';
import { useAdminSave } from './AdminPageComponents/useAdminSave.js';
import { useExternalValidations } from './AdminPageComponents/useExternalValidations.js';
import { ChevronLeftIcon } from './Icons.js';
import { Card, Button } from './AdminPageComponents/StyledComponents.js';

type AdminTab = 'apiKeys' | 'integrations' | 'ai' | 'cron';

export const AdminPage: React.FC<{ onBack?: () => void; onNavigate: (page: Page, context?: { from: Page }) => void; }> = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('apiKeys');
  const { settings, saveSettings, isLoading } = useSettings();
  const [localConfig, setLocalConfig] = useState<Settings>(settings);
  
  const {
    tokenValidation,
    setTokenValidation,
    chatValidation,
    setChatValidation,
    clientIdValidation,
    setClientIdValidation,
    redirectUriValidation,
    setRedirectUriValidation
  } = useAdminValidations(localConfig);
  
  const { saveStatus, handleSave: handleSaveConfig } = useAdminSave(settings, saveSettings);
  const { validateTelegramToken, validateTelegramChatId, validateWordPressConnection } = useExternalValidations();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const target = e.target as HTMLInputElement;

    setLocalConfig(prev => ({
      ...prev,
      [id]: type === 'number' || type === 'range' ? parseFloat(value) || 0 : target.type === 'checkbox' ? target.checked : value
    }));
  };

  const handleSave = () => {
    handleSaveConfig(localConfig);
  };

  React.useEffect(() => {
    if (!isLoading) {
      setLocalConfig(settings);
    }
  }, [settings, isLoading]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        {onBack && (
          <Button variant="icon-only" onClick={onBack}>
            <ChevronLeftIcon className="h-6 w-6" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-[#ffffff]">Painel Administrativo</h1>
          <p className="text-sm text-[#b4b7bd]">Gerencie suas chaves de API, integrações e configurações de IA.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <aside className="space-y-2 sticky top-24">
            <TabButton active={activeTab === 'apiKeys'} onClick={() => setActiveTab('apiKeys')} tabType="apiKeys">
              Chaves de API
            </TabButton>
            <TabButton active={activeTab === 'integrations'} onClick={() => setActiveTab('integrations')} tabType="integrations">
              Integrações
            </TabButton>
            <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} tabType="ai">
              Inteligência Artificial
            </TabButton>
            <TabButton active={activeTab === 'cron'} onClick={() => setActiveTab('cron')} tabType="cron">
              Agendamentos (Cron)
            </TabButton>
          </aside>
        </div>

        <div className="lg:col-span-3">
          <Card className="p-6">
            {activeTab === 'apiKeys' && (
              <ApiKeysTab 
                localConfig={localConfig} 
                handleInputChange={handleInputChange} 
                handleSave={handleSave} 
                saveStatus={saveStatus} 
              />
            )}

            {activeTab === 'integrations' && (
              <IntegrationsTab 
                localConfig={localConfig} 
                handleInputChange={handleInputChange} 
                handleSave={handleSave} 
                saveStatus={saveStatus} 
                tokenValidation={tokenValidation} 
                chatValidation={chatValidation} 
                wpValidation={{ status: 'idle', message: '' }} 
                clientIdValidation={clientIdValidation} 
                redirectUriValidation={redirectUriValidation} 
                validateTelegramToken={validateTelegramToken} 
                validateTelegramChatId={validateTelegramChatId} 
                validateWordPressConnection={validateWordPressConnection} 
                onNavigate={onNavigate} 
              />
            )}

            {activeTab === 'ai' && (
              <AiTab 
                localConfig={localConfig} 
                handleInputChange={handleInputChange} 
              />
            )}

            {activeTab === 'cron' && (
              <CronTab 
                localConfig={localConfig} 
                handleInputChange={handleInputChange} 
              />
            )}
          </Card>

          <div className="mt-6 pt-4 border-t border-[#3b4253] flex justify-end items-center gap-4">
            {saveStatus === 'success' && <span className="text-sm text-[#28c76f] animate-fade-in">Configurações salvas com sucesso!</span>}
            {saveStatus === 'error' && <span className="text-sm text-[#ea5455] animate-fade-in">Falha ao salvar.</span>}
            <Button onClick={handleSave} variant="primary">
              Salvar Alterações
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};