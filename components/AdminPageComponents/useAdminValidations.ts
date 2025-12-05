import { useState, useEffect } from 'react';
import { Settings } from '../../hooks/useSettings.js';

interface ValidationState {
  status: 'idle' | 'loading' | 'valid' | 'invalid';
  message: string;
}

export const useAdminValidations = (localConfig: Settings) => {
  const [tokenValidation, setTokenValidation] = useState<ValidationState>({ status: 'idle', message: '' });
  const [chatValidation, setChatValidation] = useState<ValidationState>({ status: 'idle', message: '' });
  const [clientIdValidation, setClientIdValidation] = useState<{ status: 'idle' | 'valid' | 'invalid'; message: string }>({ status: 'idle', message: '' });
  const [redirectUriValidation, setRedirectUriValidation] = useState<{ status: 'idle' | 'valid' | 'invalid'; message: string }>({ status: 'idle', message: '' });

  useEffect(() => {
    setTokenValidation({ status: 'idle', message: '' });
  }, [localConfig.telegramBotToken]);

  useEffect(() => {
    setChatValidation({ status: 'idle', message: '' });
  }, [localConfig.telegramChatId]);

  // Real-time validation for Instagram Client ID
  useEffect(() => {
    const value = localConfig.instagramClientId;
    if (!value) {
      setClientIdValidation({ status: 'idle', message: '' });
      return;
    }
    if (/^\d+$/.test(value)) {
      setClientIdValidation({ status: 'valid', message: 'Formato válido.' });
    } else {
      setClientIdValidation({ status: 'invalid', message: 'Client ID deve conter apenas números.' });
    }
  }, [localConfig.instagramClientId]);

  // Real-time validation for Instagram Redirect URI
  useEffect(() => {
    const value = localConfig.instagramRedirectUri;
    if (!value) {
      setRedirectUriValidation({ status: 'idle', message: '' });
      return;
    }
    try {
      const url = new URL(value);
      if (url.protocol === 'http:' || url.protocol === 'https:') {
        setRedirectUriValidation({ status: 'valid', message: 'Formato de URL válido.' });
      } else {
        throw new Error('Protocolo inválido');
      }
    } catch (_) {
      setRedirectUriValidation({ status: 'invalid', message: 'Deve ser uma URL válida começando com http:// ou https://.' });
    }
  }, [localConfig.instagramRedirectUri]);

  return {
    tokenValidation,
    setTokenValidation,
    chatValidation,
    setChatValidation,
    clientIdValidation,
    setClientIdValidation,
    redirectUriValidation,
    setRedirectUriValidation
  };
};