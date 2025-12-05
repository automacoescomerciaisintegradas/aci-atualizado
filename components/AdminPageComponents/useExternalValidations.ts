import { validateWordPressCredentials, testWordPressApiConnection } from '../../services/wordpressService.js';

interface ValidationState {
  status: 'idle' | 'loading' | 'valid' | 'invalid';
  message: string;
}

export const useExternalValidations = () => {
  const validateTelegramToken = async (token: string) => {
    if (!token) return { status: 'idle', message: '' } as ValidationState;
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const result = await response.json();
      if (result.ok) {
        return { status: 'valid', message: `Token válido para o bot: @${result.result.username}` } as ValidationState;
      } else {
        return { status: 'invalid', message: `Token inválido: ${result.description}` } as ValidationState;
      }
    } catch (error) {
      return { status: 'invalid', message: 'Falha na requisição. Verifique a conexão ou o formato do token.' } as ValidationState;
    }
  };

  const validateTelegramChatId = async (token: string, chatId: string) => {
    if (!token || !chatId) return { status: 'idle', message: '' } as ValidationState;
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/getChat?chat_id=${chatId}`);
      const result = await response.json();
      if (result.ok) {
        const chatType = result.result.type === 'private' ? 'Usuário' : 'Canal/Grupo';
        return { status: 'valid', message: `ID válido. Nome: ${result.result.title || result.result.first_name} (${chatType})` } as ValidationState;
      } else {
        return { status: 'invalid', message: `ID inválido ou bot não tem acesso: ${result.description}` } as ValidationState;
      }
    } catch (error) {
      return { status: 'invalid', message: 'Falha na requisição. Verifique o ID e se o token é válido.' } as ValidationState;
    }
  };

  const validateWordPressConnection = async (url: string, username: string, appPassword: string) => {
    const result = await validateWordPressCredentials({ wordpressUrl: url, wordpressUsername: username, wordpressAppPassword: appPassword });
    if (result.success) {
      return { status: 'valid', message: result.message } as ValidationState;
    } else {
      return { status: 'invalid', message: result.message } as ValidationState;
    }
  };

  const testWordPressApi = async (url: string, username: string, appPassword: string) => {
    const result = await testWordPressApiConnection({ wordpressUrl: url, wordpressUsername: username, wordpressAppPassword: appPassword });
    if (result.success) {
      return { status: 'valid', message: result.message } as ValidationState;
    } else {
      return { status: 'invalid', message: result.message } as ValidationState;
    }
  };

  return {
    validateTelegramToken,
    validateTelegramChatId,
    validateWordPressConnection,
    testWordPressApi
  };
};