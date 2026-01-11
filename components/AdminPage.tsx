import React, { useState } from 'react';
import { useSettings, Settings } from '../hooks/useSettings.js';
import type { Page } from '../App.js';
import { TabButton } from './AdminPageComponents/TabButton.js';
import { ApiKeysTab } from './AdminPageComponents/ApiKeysTab.js';
import { IntegrationsTab } from './AdminPageComponents/IntegrationsTab.js';
import { AiTab } from './AdminPageComponents/AiTab.js';
import { CronTab } from './AdminPageComponents/CronTab.js';
import { AutomationTab } from './AdminPageComponents/AutomationTab.js';
import { useAdminValidations } from './AdminPageComponents/useAdminValidations.js';
import { useAdminSave } from './AdminPageComponents/useAdminSave.js';
import { useExternalValidations } from './AdminPageComponents/useExternalValidations.js';
import { ChevronLeftIcon, SettingsIcon } from './Icons.js';
import { Card, Button } from './AdminPageComponents/StyledComponents.js';

type AdminTab = 'apiKeys' | 'integrations' | 'ai' | 'cron' | 'automation';

export const AdminPage: React.FC<{ onBack?: () => void; onNavigate: (page: Page, context?: { from: Page }) => void; }> = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('apiKeys');
  const { settings, saveSettings, isLoading } = useSettings();
  const [localConfig, setLocalConfig] = useState<Settings>(settings);

  const {
    tokenValidation,
    setTokenValidation,
    chatValidation,
    setChatValidation,
    wpValidation,
    setWpValidation,
    shopeeValidation,
    setShopeeValidation,
    amazonValidation,
    setAmazonValidation,
    mlValidation,
    setMlValidation,
    clientIdValidation,
    setClientIdValidation,
    redirectUriValidation,
    setRedirectUriValidation
  } = useAdminValidations(localConfig);

  const { saveStatus, handleSave: handleSaveConfig } = useAdminSave(settings, saveSettings);
  const {
    validateTelegramToken,
    validateTelegramChatId,
    validateWordPressConnection,
    validateShopeeId,
    validateAmazonId,
    validateMercadoLivreId
  } = useExternalValidations();

  // Validation Wrappers
  const handleValidateTelegramToken = async () => {
    if (!localConfig.telegramBotToken) {
      setTokenValidation({ status: 'invalid', message: 'Por favor, insira um token do Telegram.' });
      return;
    }
    setTokenValidation({ status: 'loading', message: 'Verificando...' });
    const result = await validateTelegramToken(localConfig.telegramBotToken);
    setTokenValidation(result);
  };

  const handleValidateTelegramChatId = async () => {
    if (!localConfig.telegramBotToken) {
      setChatValidation({ status: 'invalid', message: 'Token do bot é necessário para verificar o chat.' });
      return;
    }
    if (!localConfig.telegramChatId) {
      setChatValidation({ status: 'invalid', message: 'Por favor, insira um ID de chat.' });
      return;
    }
    setChatValidation({ status: 'loading', message: 'Verificando...' });
    const result = await validateTelegramChatId(localConfig.telegramBotToken, localConfig.telegramChatId);
    setChatValidation(result);
  };

  const handleValidateWordPress = async () => {
    if (!localConfig.wordpressUrl || !localConfig.wordpressUsername || !localConfig.wordpressAppPassword) {
      setWpValidation({ status: 'invalid', message: 'Preencha todos os campos do WordPress.' });
      return;
    }
    setWpValidation({ status: 'loading', message: 'Verificando...' });
    const result = await validateWordPressConnection(localConfig.wordpressUrl, localConfig.wordpressUsername, localConfig.wordpressAppPassword);
    setWpValidation(result);
  };

  const handleValidateShopee = () => {
    setShopeeValidation({ status: 'loading', message: 'Verificando...' });
    setTimeout(() => { // Simulando delay para feedback visual
      const result = validateShopeeId(localConfig.shopeeAffiliateId);
      setShopeeValidation(result);
    }, 500);
  };

  const handleValidateAmazon = () => {
    setAmazonValidation({ status: 'loading', message: 'Verificando...' });
    setTimeout(() => {
      const result = validateAmazonId(localConfig.amazonAffiliateId);
      setAmazonValidation(result);
    }, 500);
  };

  const handleValidateML = () => {
    setMlValidation({ status: 'loading', message: 'Verificando...' });
    setTimeout(() => {
      const result = validateMercadoLivreId(localConfig.mercadoLivreAffiliateId);
      setMlValidation(result);
    }, 500);
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    // ... restante da função handleInputChange existente ...
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
      {/* ... (mantendo o JSX anterior até o IntegrationsTab) ... */}
      <div className="flex items-center gap-4 mb-8">
        {onBack && (
          <Button variant="icon-only" onClick={onBack} className="glass hover:bg-white/10 transition-all">
            <ChevronLeftIcon className="h-6 w-6" />
          </Button>
        )}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
            <SettingsIcon className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
            <p className="text-sm text-dark-text-secondary">Gerencie suas chaves de API, integrações e configurações de IA.</p>
          </div>
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
            <TabButton active={activeTab === 'automation'} onClick={() => setActiveTab('automation')} tabType="automation">
              Automação n8n
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
                wpValidation={wpValidation}
                shopeeValidation={shopeeValidation}
                amazonValidation={amazonValidation}
                mlValidation={mlValidation}
                clientIdValidation={clientIdValidation}
                redirectUriValidation={redirectUriValidation}
                validateTelegramToken={handleValidateTelegramToken}
                validateTelegramChatId={handleValidateTelegramChatId}
                validateWordPressConnection={handleValidateWordPress}
                validateShopeeId={handleValidateShopee}
                validateAmazonId={handleValidateAmazon}
                validateMercadoLivreId={handleValidateML}
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

            {activeTab === 'automation' && (
              <AutomationTab
                onSave={handleSave}
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