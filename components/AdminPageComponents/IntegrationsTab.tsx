import React, { useState, useEffect } from 'react';
import { Settings } from '../../hooks/useSettings.js';
import { EyeIcon, EyeOffIcon, CheckIcon } from '../Icons.js';
import { FormField } from './FormField.js';
import { ValidationStatusIndicator } from './ValidationStatusIndicator.js';
import type { Page } from '../../App.js';

interface IntegrationsTabProps {
  localConfig: Settings;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSave: () => void;
  saveStatus: 'idle' | 'success' | 'error' | 'loading';
  tokenValidation: { status: 'idle' | 'loading' | 'valid' | 'invalid'; message: string };
  chatValidation: { status: 'idle' | 'loading' | 'valid' | 'invalid'; message: string };
  wpValidation: { status: 'idle' | 'loading' | 'valid' | 'invalid'; message: string };
  clientIdValidation: { status: 'idle' | 'valid' | 'invalid'; message: string };
  redirectUriValidation: { status: 'idle' | 'valid' | 'invalid'; message: string };
  validateTelegramToken: () => void;
  validateTelegramChatId: () => void;
  validateWordPressConnection: () => void;
  onNavigate: (page: Page, context?: { from: Page }) => void;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  localConfig,
  handleInputChange,
  handleSave,
  saveStatus,
  tokenValidation,
  chatValidation,
  wpValidation,
  clientIdValidation,
  redirectUriValidation,
  validateTelegramToken,
  validateTelegramChatId,
  validateWordPressConnection,
  onNavigate
}) => {
  const [showTelegramToken, setShowTelegramToken] = useState(false);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    const isLoggedIn = localConfig.instagramUser !== null;
    
    if (isLoggedIn && !hasShownWelcome) {
      const lastWelcomeTime = localStorage.getItem('lastWelcomeTime');
      const currentTime = Date.now();
      
      if (!lastWelcomeTime || (currentTime - parseInt(lastWelcomeTime)) > 3600000) {
        alert('Prezado(a) desenvolvedor(a):\nBem-vindo(a) à Plataforma Aberta de ACI - Automações Comerciais Integradas!');
        localStorage.setItem('lastWelcomeTime', currentTime.toString());
        setHasShownWelcome(true);
      }
    }
  }, [localConfig.instagramUser, hasShownWelcome]);

  const handleReturnToPlatform = () => {
    const isLoggedIn = localConfig.instagramUser !== null;
    
    if (isLoggedIn) {
      onNavigate('home', { from: 'admin' });
    } else {
      alert('Você precisa conectar sua conta do Instagram primeiro para acessar a plataforma.');
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold">Configuração de Integrações</h3>
      <p className="text-dark-text-secondary mb-8">Gerencie as chaves e IDs para integrações externas. As informações são salvas localmente no seu navegador.</p>

      {/* Telegram Section */}
      <div className="space-y-6 p-6 bg-slate-800/50 rounded-lg border border-dark-border">
        <h4 className="text-lg font-semibold text-dark-text-primary">Integração com Telegram</h4>

        <div>
          <label htmlFor="telegramBotToken" className="block text-sm font-medium text-dark-text-secondary mb-2">
            Token do Bot do Telegram
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-grow">
              <input
                type={showTelegramToken ? 'text' : 'password'}
                id="telegramBotToken"
                name="telegramBotToken"
                value={localConfig.telegramBotToken}
                onChange={handleInputChange}
                className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 pr-10"
                placeholder="Ex: 1234567890:ABC-DEF1234ghIkl-zyx57W2v1u123456789"
              />
              <button
                type="button"
                onClick={() => setShowTelegramToken(!showTelegramToken)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-text-secondary hover:text-dark-text-primary"
                aria-label={showTelegramToken ? "Esconder token" : "Mostrar token"}
              >
                {showTelegramToken ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!localConfig.telegramBotToken) {
                  setTokenValidation({ 
                    status: 'invalid', 
                    message: 'Por favor, insira um token do Telegram antes de verificar.' 
                  });
                  return;
                }
                validateTelegramToken();
              }}
              disabled={!localConfig.telegramBotToken || tokenValidation.status === 'loading'}
              className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-dark-text-secondary font-semibold py-3 px-4 rounded-full transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              Verificar
            </button>
            <ValidationStatusIndicator status={tokenValidation.status} />
          </div>
          {tokenValidation.message && (
            <p className={`text-xs mt-2 ${tokenValidation.status === 'valid' ? 'text-green-400' : 'text-red-400'}`}>
              {tokenValidation.message}
            </p>
          )}
          <p className="text-xs text-dark-text-secondary mt-2">Seu token secreto fornecido pelo @BotFather no Telegram. Mantenha-o seguro.</p>
        </div>

        <div>
          <label htmlFor="telegramChatId" className="block text-sm font-medium text-dark-text-secondary mb-2">
            ID do Chat/Canal do Telegram
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              id="telegramChatId"
              name="telegramChatId"
              value={localConfig.telegramChatId}
              onChange={handleInputChange}
              className="flex-grow w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
              placeholder="@seu_canal_publico ou -1001234567890"
            />
            <button
              type="button"
              onClick={() => {
                if (!localConfig.telegramBotToken) {
                  setChatValidation({ 
                    status: 'invalid', 
                    message: 'Por favor, insira um token do Telegram antes de verificar o chat.' 
                  });
                  return;
                }
                if (!localConfig.telegramChatId) {
                  setChatValidation({ 
                    status: 'invalid', 
                    message: 'Por favor, insira um ID de chat/canal do Telegram antes de verificar.' 
                  });
                  return;
                }
                validateTelegramChatId();
              }}
              disabled={!localConfig.telegramChatId || !localConfig.telegramBotToken || chatValidation.status === 'loading'}
              className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-dark-text-secondary font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              Verificar
            </button>
            <ValidationStatusIndicator status={chatValidation.status} />
          </div>
          {chatValidation.message && (
            <p className={`text-xs mt-2 ${chatValidation.status === 'valid' ? 'text-green-400' : 'text-red-400'}`}>
              {chatValidation.message}
            </p>
          )}
          <p className="text-xs text-dark-text-secondary mt-2">Para canais públicos, use @username. Para privados, use o ID numérico (geralmente começa com -100). O bot DEVE ser administrador do canal.</p>
        </div>
      </div>

      {/* WordPress Section */}
      <div className="mt-6 space-y-6 p-6 bg-slate-800/50 rounded-lg border border-dark-border">
        <h4 className="text-lg font-semibold text-dark-text-primary">Integração com WordPress</h4>
        <FormField
          label="URL do Blog WordPress"
          id="wordpressUrl"
          placeholder="https://seu-blog.com"
          value={localConfig.wordpressUrl}
          onChange={handleInputChange}
          description="Inclua http:// ou https://. Exemplo: https://meusite.com"
        />
        <FormField
          label="Nome de Usuário WordPress"
          id="wordpressUsername"
          placeholder="Seu nome de usuário"
          value={localConfig.wordpressUsername}
          onChange={handleInputChange}
        />
        <div>
          <FormField
            label="Senha de Aplicativo WordPress"
            id="wordpressAppPassword"
            isSecret
            placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
            value={localConfig.wordpressAppPassword}
            onChange={handleInputChange}
            description="Crie uma senha de aplicativo no seu perfil do WordPress (Usuários > Perfil > Senhas de Aplicativo). É mais seguro que usar sua senha principal."
          />

          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800 rounded-lg text-sm text-blue-200">
            <p className="font-bold mb-2 flex items-center gap-2"> Solução de Problemas de Conexão:</p>
            <ul className="list-disc list-inside space-y-1 text-xs text-blue-300">
              <li><strong>Erro "Você não está logado":</strong> Seu servidor pode estar bloqueando o cabeçalho de autorização.</li>
              <li><strong>Correção:</strong> Adicione esta linha ao seu arquivo <code>.htaccess</code> no servidor:
                <code className="block bg-black/30 p-1 mt-1 rounded text-green-400 font-mono">SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1</code>
              </li>
              <li>Certifique-se de usar uma <strong>Senha de Aplicativo</strong> (não sua senha de login).</li>
              <li>Verifique se plugins de segurança (Wordfence, etc) não estão bloqueando a API REST.</li>
            </ul>
          </div>

          <div className="flex items-center gap-2 mt-4 justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!localConfig.wordpressUrl) {
                    alert('Por favor, insira a URL do WordPress antes de verificar a conexão.');
                    return;
                  }
                  if (!localConfig.wordpressUsername) {
                    alert('Por favor, insira o nome de usuário do WordPress antes de verificar a conexão.');
                    return;
                  }
                  if (!localConfig.wordpressAppPassword) {
                    alert('Por favor, insira a senha de aplicativo do WordPress antes de verificar a conexão.');
                    return;
                  }
                  validateWordPressConnection();
                }}
                disabled={!localConfig.wordpressUrl || !localConfig.wordpressUsername || !localConfig.wordpressAppPassword || wpValidation.status === 'loading'}
                className="flex-shrink-0 bg-slate-700 hover:bg-slate-600 text-dark-text-secondary font-semibold py-2 px-4 rounded-full transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                Verificar Conexão
              </button>
              <ValidationStatusIndicator status={wpValidation.status} />
              {wpValidation.message && (
                <p className={`text-xs ${wpValidation.status === 'valid' ? 'text-green-400' : 'text-red-400'}`}>
                  {wpValidation.message}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                // Show a confirmation message before saving
                alert('Configurações salvas com sucesso!');
                handleSave();
              }}
              className="bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2 rounded-full font-semibold transition-colors flex items-center gap-2"
            >
              {saveStatus === 'success' ? <CheckIcon className="h-5 w-5" /> : null}
              {saveStatus === 'loading' ? 'Salvando...' : saveStatus === 'success' ? 'Salvo!' : 'Salvar Integração'}
            </button>
          </div>
        </div>
      </div>

      {/* Affiliate IDs Section */}
      <div className="mt-6 space-y-6 p-6 bg-slate-800/50 rounded-lg border border-dark-border">
        <h4 className="text-lg font-semibold text-dark-text-primary">IDs de Afiliado</h4>
        <FormField
          label="ID de Afiliado Shopee"
          id="shopeeAffiliateId"
          placeholder="Seu ID de afiliado da Shopee"
          value={localConfig.shopeeAffiliateId}
          onChange={handleInputChange}
        />
        <FormField
          label="ID de Associado Amazon (tag)"
          id="amazonAffiliateId"
          placeholder="ex: seutag-20"
          value={localConfig.amazonAffiliateId}
          onChange={handleInputChange}
          description="Seu Tracking ID do programa de associados Amazon."
        />
        <FormField
          label="ID de Afiliado Mercado Livre"
          id="mercadoLivreAffiliateId"
          placeholder="Seu ID de afiliado do Mercado Livre"
          value={localConfig.mercadoLivreAffiliateId}
          onChange={handleInputChange}
        />
      </div>

      {/* Instagram Section */}
      <div className="mt-6 space-y-6 p-6 bg-slate-800/50 rounded-lg border border-dark-border">
        <h4 className="text-lg font-semibold text-dark-text-primary">Integração com Instagram (Meta)</h4>

        {localConfig.instagramUser ? (
          <div className="bg-green-900/40 border border-green-700 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={localConfig.instagramUser.profilePictureUrl} alt={localConfig.instagramUser.username} className="h-10 w-10 rounded-full bg-slate-700" />
              <div>
                <p className="text-sm font-semibold text-green-200">Conectado como @{localConfig.instagramUser.username}</p>
                <p className="text-xs text-green-300">A integração está ativa.</p>
              </div>
            </div>
            <button
              onClick={() => {
                const newConfig = { ...localConfig };
                // @ts-ignore
                newConfig.instagramUser = null;
                handleInputChange({ target: { id: 'instagramUser', value: null } } as any);
              }}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 font-semibold"
            >
              Desconectar
            </button>
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-dark-border p-4 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-dark-text-primary">Status: Não Conectado</p>
              <p className="text-sm text-dark-text-secondary">Conecte sua conta para habilitar a publicação e gerenciamento.</p>
            </div>
            <button
              onClick={() => onNavigate('instagram-connect', { from: 'admin' })}
              disabled={!localConfig.instagramClientId || !localConfig.instagramRedirectUri}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-primary text-white font-bold py-2.5 px-5 rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              title={(!localConfig.instagramClientId || !localConfig.instagramRedirectUri) ? 'Preencha o Client ID e a URI de Redirecionamento primeiro' : 'Conectar com Instagram'}
            >
              Conectar Conta
            </button>
          </div>
        )}

        <div className="space-y-6 pt-6 border-t border-dark-border">
          <h5 className="text-md font-semibold text-dark-text-primary">Configuração de Credenciais</h5>
          <p className="text-xs text-dark-text-secondary -mt-4">Essas informações são encontradas no painel de desenvolvedores da Meta do seu aplicativo.</p>

          <div>
            <label htmlFor="instagramClientId" className="block text-sm font-medium text-dark-text-secondary mb-2">
              Client ID do App da Meta
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="instagramClientId"
                name="instagramClientId"
                value={localConfig.instagramClientId}
                onChange={handleInputChange}
                className="flex-grow w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                placeholder="Seu Client ID do App da Meta"
              />
              <ValidationStatusIndicator status={clientIdValidation.status as 'idle' | 'loading' | 'valid' | 'invalid'} />
            </div>
            {clientIdValidation.message && (
              <p className={`text-xs mt-2 ${clientIdValidation.status === 'valid' ? 'text-green-400' : 'text-red-400'}`}>
                {clientIdValidation.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="instagramRedirectUri" className="block text-sm font-medium text-dark-text-secondary mb-2">
              URI de Redirecionamento OAuth Válida
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                id="instagramRedirectUri"
                name="instagramRedirectUri"
                value={localConfig.instagramRedirectUri}
                onChange={handleInputChange}
                className="flex-grow w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary placeholder-gray-500 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200"
                placeholder="http://localhost:5173/instagram-connect"
              />
              <ValidationStatusIndicator status={redirectUriValidation.status as 'idle' | 'loading' | 'valid' | 'invalid'} />
            </div>
            {redirectUriValidation.message && (
              <p className={`text-xs mt-2 ${redirectUriValidation.status === 'valid' ? 'text-green-400' : 'text-red-400'}`}>
                {redirectUriValidation.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Automation Section */}
      <div className="mt-6 space-y-6 p-6 bg-slate-800/50 rounded-lg border border-dark-border">
        <h4 className="text-lg font-semibold text-dark-text-primary">Configurações de Automação</h4>
        <FormField
          label="URL do Webhook do WhatsApp (Opcional)"
          id="whatsappWebhookUrl"
          placeholder="https://seuservico.com/webhook/123"
          value={localConfig.whatsappWebhookUrl}
          onChange={handleInputChange}
          description="Use para enviar notificações para o WhatsApp através de serviços como n8n, Make ou Zapier."
        />
        <FormField
          label="Intervalo entre Envios em Lote (segundos)"
          id="sendInterval"
          type="number"
          placeholder="5"
          value={localConfig.sendInterval}
          onChange={handleInputChange}
          description="Tempo de espera em segundos entre cada mensagem no modo 'Envio em Lote'. Ajuda a evitar bloqueios por spam. Recomendado: 5 segundos ou mais."
        />
      </div>

      {/* Return to Platform Section */}
      <div className="mt-6 space-y-6 p-6 bg-slate-800/50 rounded-lg border border-dark-border">
        <h4 className="text-lg font-semibold text-dark-text-primary">Retornar à Plataforma</h4>
        <div className="bg-slate-900/50 border border-dark-border p-4 rounded-lg">
          <p className="text-sm text-dark-text-secondary mb-4">
            Após configurar suas integrações, retorne à plataforma principal para continuar suas automações sem necessidade de login novamente.
          </p>
          <button
            onClick={handleReturnToPlatform}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-5 rounded-lg transition-colors"
          >
            Retornar à Plataforma
          </button>
        </div>
      </div>
    </div>
  );
};