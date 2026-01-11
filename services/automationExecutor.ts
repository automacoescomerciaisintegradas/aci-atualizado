// services/automationExecutor.ts
// Serviço para execução de automações com dedução de créditos

interface AutomationExecutionResult {
  success: boolean;
  message: string;
  creditsConsumed: number;
  error?: string;
}

export class AutomationExecutor {
  static async executeAutomation(
    webhookUrl: string, 
    payload: any, 
    userId: string,
    creditsPerExecution: number,
    webhookTimeout: number = 30,
    webhookRetries: number = 3
  ): Promise<AutomationExecutionResult> {
    // Verificar se a URL do webhook é válida
    if (!webhookUrl || !this.isValidUrl(webhookUrl)) {
      return {
        success: false,
        message: 'URL do webhook inválida',
        creditsConsumed: 0,
        error: 'Invalid webhook URL'
      };
    }

    try {
      // Fazer a chamada para o webhook do n8n
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': userId,
          'X-Automation-Credits': creditsPerExecution.toString()
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook responded with status ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        message: 'Automação executada com sucesso',
        creditsConsumed: creditsPerExecution
      };
    } catch (error: any) {
      console.error('Erro ao executar automação:', error);
      
      // Tentar novamente se configurado
      let attempts = 0;
      
      while (attempts < webhookRetries) {
        attempts++;
        try {
          // Espera exponencial entre tentativas
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts))); 
          
          const retryResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-ID': userId,
              'X-Automation-Credits': creditsPerExecution.toString()
            },
            body: JSON.stringify(payload),
          });

          if (retryResponse.ok) {
            return {
              success: true,
              message: `Automação executada com sucesso na tentativa ${attempts}`,
              creditsConsumed: creditsPerExecution
            };
          }
        } catch (retryError) {
          console.error(`Tentativa ${attempts} falhou:`, retryError);
          if (attempts >= webhookRetries) {
            return {
              success: false,
              message: `Falha ao executar automação após ${webhookRetries} tentativas`,
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

  private static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}