import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { CreditIcon, SettingsIcon, ZapIcon, CopyIcon, CheckCircleIcon, AlertTriangleIcon, SpinnerIcon } from './Icons';
import { AutomationExecutor } from '../services/automationExecutor';

interface AutomationSettingsProps {
  onSave?: () => void;
}

export const AutomationSettings: React.FC<AutomationSettingsProps> = ({ onSave }) => {
  const { settings, saveSettings, addCreditTransaction } = useSettings();
  const [localConfig, setLocalConfig] = useState({
    n8nWebhookUrl: settings.n8nWebhookUrl || '',
    automationEnabled: settings.automationEnabled || false,
    webhookTimeout: settings.webhookTimeout || 30,
    webhookRetries: settings.webhookRetries || 3,
    automationCreditsPerExecution: settings.automationCreditsPerExecution || 5,
  });
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setLocalConfig(prev => ({
      ...prev,
      [id]: val
    }));
  };

  const handleSave = () => {
    try {
      const updatedSettings = {
        ...settings,
        n8nWebhookUrl: localConfig.n8nWebhookUrl,
        automationEnabled: localConfig.automationEnabled,
        webhookTimeout: localConfig.webhookTimeout,
        webhookRetries: localConfig.webhookRetries,
        automationCreditsPerExecution: localConfig.automationCreditsPerExecution,
      };

      saveSettings(updatedSettings);
      setSaveStatus({ type: 'success', message: 'Configurações de automação salvas com sucesso!' });

      if (onSave) onSave();

      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus({ type: 'error', message: 'Erro ao salvar configurações: ' + (error as Error).message });
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  const handleCopyWebhook = () => {
    const webhookUrl = `${window.location.origin}/api/automation/webhook/${settings.id || 'user-id'}`;
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestAutomation = async () => {
    if (!localConfig.n8nWebhookUrl) {
      setTestResult({ success: false, message: 'Por favor, configure a URL do webhook do n8n primeiro.' });
      return;
    }

    if (!localConfig.automationEnabled) {
      setTestResult({ success: false, message: 'Por favor, habilite as automações primeiro.' });
      return;
    }

    if (settings.credits < localConfig.automationCreditsPerExecution) {
      setTestResult({
        success: false,
        message: `Créditos insuficientes. São necessários ${localConfig.automationCreditsPerExecution} créditos para executar esta automação.`
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Payload de teste
      const testPayload = {
        event: 'test_automation',
        timestamp: new Date().toISOString(),
        userId: settings.id || 'test-user',
        message: 'Teste de automação via ACI'
      };

      // Executar a automação de teste
      const result = await AutomationExecutor.executeAutomation(
        localConfig.n8nWebhookUrl,
        testPayload,
        settings.id || 'test-user',
        localConfig.automationCreditsPerExecution,
        localConfig.webhookTimeout,
        localConfig.webhookRetries
      );

      if (result.success) {
        // Atualizar os créditos no estado local
        const newCredits = settings.credits - result.creditsConsumed;
        const updatedSettings = {
          ...settings,
          credits: newCredits,
          creditBalance: newCredits
        };

        saveSettings(updatedSettings);

        // Registrar a transação de crédito
        if (addCreditTransaction) {
          addCreditTransaction('usage', result.creditsConsumed, 'Execução de teste de automação via webhook do n8n');
        }

        setTestResult({
          success: true,
          message: `${result.message}. ${result.creditsConsumed} créditos foram consumidos.`
        });
      } else {
        setTestResult({
          success: false,
          message: result.message || 'Falha desconhecida ao executar a automação de teste.'
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Erro ao executar automação de teste: ' + (error as Error).message
      });
    } finally {
      setIsTesting(false);
    }
  };

  const webhookUrl = `${window.location.origin}/api/automation/webhook/${settings.id || 'user-id'}`;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-xl border border-purple-500/30 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-600/20">
            <ZapIcon className="h-6 w-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Automação com n8n</h3>
        </div>
        <p className="text-dark-text-secondary mb-4">
          Integre sua conta com o n8n para criar fluxos de automação personalizados. Cada execução de automação consome créditos do seu saldo.
        </p>
        <div className="flex items-center justify-between bg-dark-card p-4 rounded-lg border border-dark-border">
          <div className="flex-1 min-w-0">
            <p className="text-sm text-dark-text-secondary truncate">URL do seu webhook:</p>
            <p className="text-white font-mono text-sm truncate">{webhookUrl}</p>
          </div>
          <button
            onClick={handleCopyWebhook}
            className="ml-4 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-3 rounded-lg transition-colors"
          >
            {copied ? <CheckCircleIcon className="h-4 w-4 text-green-400" /> : <CopyIcon className="h-4 w-4" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-dark-card rounded-xl border border-dark-border p-6">
          <h4 className="text-lg font-semibold text-dark-text-primary mb-4 flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-purple-400" />
            Configurações de Automação
          </h4>

          <div className="space-y-4">
            <div>
              <label htmlFor="n8nWebhookUrl" className="block text-sm font-medium text-dark-text-secondary mb-2">
                URL do Webhook do n8n
              </label>
              <input
                id="n8nWebhookUrl"
                type="url"
                value={localConfig.n8nWebhookUrl}
                onChange={handleInputChange}
                placeholder="https://your-n8n-instance.com/webhook/..."
                className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary focus:ring-2 focus:ring-brand-primary"
              />
              <p className="mt-2 text-xs text-dark-text-secondary">
                A URL do seu fluxo de automação no n8n que será acionado por eventos da ACI.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="automationEnabled" className="block text-sm font-medium text-dark-text-primary">
                  Ativar Automações
                </label>
                <p className="text-xs text-dark-text-secondary">
                  Permitir execução de fluxos de automação
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="automationEnabled"
                  checked={localConfig.automationEnabled}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, automationEnabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="webhookTimeout" className="block text-sm font-medium text-dark-text-secondary mb-2">
                  Timeout (segundos)
                </label>
                <input
                  id="webhookTimeout"
                  type="number"
                  min="5"
                  max="300"
                  value={localConfig.webhookTimeout}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label htmlFor="webhookRetries" className="block text-sm font-medium text-dark-text-secondary mb-2">
                  Tentativas
                </label>
                <input
                  id="webhookRetries"
                  type="number"
                  min="0"
                  max="10"
                  value={localConfig.webhookRetries}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark-card rounded-xl border border-dark-border p-6">
          <h4 className="text-lg font-semibold text-dark-text-primary mb-4 flex items-center gap-2">
            <CreditIcon className="h-5 w-5 text-green-400" />
            Configurações de Créditos
          </h4>

          <div className="space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-dark-border">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangleIcon className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-medium text-amber-400">Importante</span>
              </div>
              <p className="text-xs text-dark-text-secondary">
                Cada execução de automação consome créditos do seu saldo. Configure o custo por execução abaixo.
              </p>
            </div>

            <div>
              <label htmlFor="automationCreditsPerExecution" className="block text-sm font-medium text-dark-text-secondary mb-2">
                Créditos por Execução
              </label>
              <div className="relative">
                <input
                  id="automationCreditsPerExecution"
                  type="number"
                  min="1"
                  max="100"
                  value={localConfig.automationCreditsPerExecution}
                  onChange={handleInputChange}
                  className="w-full bg-slate-800 border border-dark-border rounded-lg p-3 text-dark-text-primary focus:ring-2 focus:ring-brand-primary pl-12"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <CreditIcon className="h-5 w-5 text-purple-400" />
                </div>
              </div>
              <p className="mt-2 text-xs text-dark-text-secondary">
                Quantidade de créditos consumidos por execução de automação
              </p>
            </div>

            <div className="bg-slate-800/50 p-4 rounded-lg border border-dark-border">
              <p className="text-sm text-dark-text-secondary">
                <span className="font-medium text-white">Saldo atual:</span> {settings.credits?.toLocaleString('pt-BR')} créditos
              </p>
              <p className="text-sm text-dark-text-secondary mt-1">
                <span className="font-medium text-white">Custo por execução:</span> {localConfig.automationCreditsPerExecution} créditos
              </p>
              <p className="text-sm text-green-400 mt-2">
                <span className="font-medium">Estimativa:</span> Aproximadamente {Math.floor(settings.credits / localConfig.automationCreditsPerExecution).toLocaleString('pt-BR')} execuções possíveis
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Teste */}
      <div className="bg-dark-card rounded-xl border border-dark-border p-6">
        <h4 className="text-lg font-semibold text-dark-text-primary mb-4 flex items-center gap-2">
          <ZapIcon className="h-5 w-5 text-yellow-400" />
          Testar Automação
        </h4>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleTestAutomation}
            disabled={isTesting || !localConfig.n8nWebhookUrl || !localConfig.automationEnabled}
            className={`flex-1 py-3 px-6 rounded-lg font-bold flex items-center justify-center gap-2 ${
              isTesting
                ? 'bg-slate-700 text-dark-text-secondary'
                : !localConfig.n8nWebhookUrl || !localConfig.automationEnabled
                  ? 'bg-slate-800 text-dark-text-secondary cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white shadow-lg shadow-yellow-500/20'
            }`}
          >
            {isTesting ? (
              <>
                <SpinnerIcon />
                Executando...
              </>
            ) : (
              <>
                <ZapIcon className="h-5 w-5" />
                Testar Execução
              </>
            )}
          </button>
        </div>

        {testResult && (
          <div className={`mt-4 p-4 rounded-lg border ${
            testResult.success
              ? 'bg-green-900/30 border-green-700 text-green-300'
              : 'bg-red-900/30 border-red-700 text-red-300'
          }`}>
            <div className="flex items-start gap-2">
              {testResult.success ? (
                <CheckCircleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertTriangleIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-lg transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2"
        >
          <SettingsIcon className="h-5 w-5" />
          Salvar Configurações
        </button>
      </div>

      {saveStatus && (
        <div className={`p-4 rounded-lg border ${saveStatus.type === 'success' ? 'bg-green-900/30 border-green-700 text-green-300' : 'bg-red-900/30 border-red-700 text-red-300'}`}>
          {saveStatus.message}
        </div>
      )}
    </div>
  );
};