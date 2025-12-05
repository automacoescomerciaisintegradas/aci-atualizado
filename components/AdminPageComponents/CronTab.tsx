import React from 'react';
import { Settings } from '../../hooks/useSettings.js';
import { FormField } from './FormField.js';

interface CronTabProps {
  localConfig: Settings;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const CronTab: React.FC<CronTabProps> = ({ localConfig, handleInputChange }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold">Configurações de Agendamento (Cron Jobs)</h3>
      <p className="text-dark-text-secondary mb-8">
        Configure tarefas automáticas, como relatórios semanais.
      </p>
      <div className="p-6 bg-slate-800/50 rounded-lg border border-dark-border space-y-6">
        <div className="flex items-center justify-between">
          <label htmlFor="weeklyReportEnabled" className="font-semibold text-dark-text-primary">
            Relatório Semanal de Desempenho
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="weeklyReportEnabled"
              name="weeklyReportEnabled"
              checked={localConfig.weeklyReportEnabled}
              onChange={handleInputChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-primary"></div>
          </label>
        </div>
        {localConfig.weeklyReportEnabled && (
          <div className="space-y-4 border-t border-dark-border pt-6">
            <FormField
              label="Expressão Cron para Agendamento"
              id="weeklyReportCron"
              value={localConfig.weeklyReportCron}
              onChange={handleInputChange}
              description="Padrão: '0 9 * * 1' (Toda Segunda-feira às 9h). Use um site como 'crontab.guru' para ajuda."
            />
            <FormField
              label="URL do Webhook para Envio do Relatório"
              id="weeklyReportWebhook"
              placeholder="https://seuservico.com/webhook/..."
              value={localConfig.weeklyReportWebhook}
              onChange={handleInputChange}
              description="A URL que receberá os dados do relatório (ex: n8n, Make, Zapier)."
            />
          </div>
        )}
      </div>
    </div>
  );
};