import { useSettings } from '../hooks/useSettings';

interface AutomationExecutionResult {
  success: boolean;
  message: string;
  creditsConsumed: number;
  error?: string;
}

export class AutomationService {
  private static instance: AutomationService;
  private { settings, saveSettings } = useSettings();

  private constructor() {}

  public static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }

  async executeAutomation(userId: string, webhookUrl: string, payload: any): Promise<AutomationExecutionResult> {
    const { settings, saveSettings } = this.getSettingsContext();
    
    // Verificar se automação está habilitada
    if (!settings.automationEnabled) {
      return {
        success: false,
        message: 'Automação não está habilitada para esta conta',
        creditsConsumed: 0,
        error: 'Automation disabled'
      };
    }

    // Verificar se o usuário tem créditos suficientes
    const creditsNeeded = settings.automationCreditsPerExecution || 5;
    if (settings.credits < creditsNeeded) {
      return {
        success: false,
        message: `Créditos insuficientes. São necessários ${creditsNeeded} créditos para executar esta automação.`,
        creditsConsumed: 0,
        error: 'Insufficient credits'
      };
    }

    try {
      // Fazer a chamada para o webhook do n8n
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId,
          'X-Automation-Credits': creditsNeeded.toString()
        },
        body: JSON.stringify(payload),
        timeout: (settings.webhookTimeout || 30) * 1000
      });

      if (!response.ok) {
        throw new Error(`Webhook responded with status ${response.status}`);
      }

      // Deduzir os créditos usados
      const newCredits = settings.credits - creditsNeeded;
      const updatedSettings = {
        ...settings,
        credits: newCredits,
        creditBalance: newCredits
      };
      
      saveSettings(updatedSettings);

      // Registrar a transação de crédito
      if (this.addCreditTransaction) {
        this.addCreditTransaction('usage', creditsNeeded, `Execução de automação via webhook: ${webhookUrl}`);
      }

      return {
        success: true,
        message: 'Automação executada com sucesso',
        creditsConsumed: creditsNeeded
      };
    } catch (error: any) {
      console.error('Erro ao executar automação:', error);
      
      // Tentar novamente se configurado
      const retries = settings.webhookRetries || 3;
      let attempts = 0;
      
      while (attempts < retries) {
        attempts++;
        try {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Espera crescente
          
          const retryResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-ID': userId,
              'X-Automation-Credits': creditsNeeded.toString()
            },
            body: JSON.stringify(payload),
            timeout: (settings.webhookTimeout || 30) * 1000
          });

          if (!retryResponse.ok) {
            continue; // Tenta novamente
          }

          // Deduzir os créditos usados
          const newCredits = settings.credits - creditsNeeded;
          const updatedSettings = {
            ...settings,
            credits: newCredits,
            creditBalance: newCredits
          };
          
          saveSettings(updatedSettings);

          // Registrar a transação de crédito
          if (this.addCreditTransaction) {
            this.addCreditTransaction('usage', creditsNeeded, `Execução de automação via webhook (tentativa ${attempts}): ${webhookUrl}`);
          }

          return {
            success: true,
            message: `Automação executada com sucesso na tentativa ${attempts}`,
            creditsConsumed: creditsNeeded
          };
        } catch (retryError) {
          console.error(`Tentativa ${attempts} falhou:`, retryError);
          if (attempts >= retries) {
            return {
              success: false,
              message: `Falha ao executar automação após ${retries} tentativas`,
              creditsConsumed: 0,
              error: (retryError as Error).message
            };
          }
        }
      }
    }

    return {
      success: false,
      message: 'Falha ao executar automação',
      creditsConsumed: 0,
      error: 'Webhook execution failed'
    };
  }

  // Método auxiliar para obter o contexto de settings (precisa ser injetado externamente)
  private getSettingsContext() {
    // Este método seria substituído por uma implementação adequada
    // que forneça o contexto do hook useSettings
    throw new Error('Method not implemented: getSettingsContext needs to be implemented with proper React context');
  }

  // Método auxiliar para adicionar transação de crédito (precisa ser injetado externamente)
  private addCreditTransaction(type: 'purchase' | 'usage', amount: number, description: string) {
    // Este método seria substituído por uma implementação adequada
    // que forneça acesso à função addCreditTransaction
    throw new Error('Method not implemented: addCreditTransaction needs to be implemented with proper React context');
  }
}

// Exportar uma instância singleton
export const automationService = AutomationService.getInstance();