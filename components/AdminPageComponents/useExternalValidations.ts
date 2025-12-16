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
      const result = await response.json() as any;
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
      const result = await response.json() as any;
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

  const validateShopeeId = (id: string) => {
    if (!id) return { status: 'idle', message: '' } as ValidationState;
    // Shopee ID geralmente é numérico ou alfanumérico curto.
    // Ex: 18372150411
    if (/^\d+$/.test(id)) {
      return { status: 'valid', message: 'Formato válido (numérico).' } as ValidationState;
    }
    return { status: 'invalid', message: 'ID Shopee deve conter apenas números.' } as ValidationState;
  };

  const validateAmazonId = (id: string) => {
    if (!id) return { status: 'idle', message: '' } as ValidationState;
    // Amazon ID geralmente termina com -20 (Brasil)
    // Ex: automacoesc01-20
    if (/^[a-zA-Z0-9.-]+-20$/.test(id)) {
      return { status: 'valid', message: 'Formato válido (Tag de Associados BR).' } as ValidationState;
    }
    if (/^[a-zA-Z0-9.-]+$/.test(id)) {
      return { status: 'valid', message: 'Formato válido (Atenção: verifique se termina com -20 para Brasil).' } as ValidationState;
    }
    return { status: 'invalid', message: 'Formato inválido para ID Amazon.' } as ValidationState;
  };

  const validateMercadoLivreId = (id: string) => {
    if (!id) return { status: 'idle', message: '' } as ValidationState;
    // ML App ID é numérico
    // Ex: 3064531609380417
    if (/^\d+$/.test(id)) {
      return { status: 'valid', message: 'Formato válido (App ID numérico).' } as ValidationState;
    }
    return { status: 'invalid', message: 'ID de App ML deve conter apenas números.' } as ValidationState;
  };

  return {
    validateTelegramToken,
    validateTelegramChatId,
    validateWordPressConnection,
    testWordPressApi,
    validateShopeeId,
    validateAmazonId,
    validateMercadoLivreId
  };
};