import { useState, useEffect, useCallback } from 'react';

export interface Settings {
    telegramBotToken: string;
    telegramChatId: string;
    shopeeAffiliateId: string;
    amazonAffiliateId: string;
    mercadoLivreAffiliateId: string;
    whatsappWebhookUrl: string;
    sendInterval: number;
    weeklyReportEnabled: boolean;
    weeklyReportCron: string;
    weeklyReportWebhook: string;
    instagramClientId: string;
    instagramRedirectUri: string;
    instagramUser: { username: string; profilePictureUrl: string; } | null;
    theme: 'dark' | 'light';
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    aiTextModel: string;
    aiImageModel: string;
    aiTemperature: number;
    credits: number;
    creditBalance: number; // Quantidade atual de créditos
    creditSpent: number; // Créditos já utilizados
    creditTransactions: Array<{id: string, date: Date, type: 'purchase' | 'usage', amount: number, description: string}>; // Histórico de transações
    n8nWebhookUrl: string; // URL do webhook do n8n
    automationEnabled: boolean; // Se as automações estão habilitadas
    webhookTimeout: number; // Timeout para chamadas de webhook em segundos
    webhookRetries: number; // Número de tentativas para chamadas de webhook
    automationCreditsPerExecution: number; // Quantidade de créditos consumidos por execução de automação
    openaiApiKey: string;
    anthropicApiKey: string;
    groqApiKey: string;
    ollamaApiKey: string; // Can be used for Base URL as well
    wordpressUrl: string;
    wordpressUsername: string;
    wordpressAppPassword: string;
    supabaseUrl: string;
    supabaseAnonKey: string;
    geminiApiKey: string;
}

const defaultSettings: Settings = {
    telegramBotToken: '',
    telegramChatId: '',
    shopeeAffiliateId: '',
    amazonAffiliateId: '',
    mercadoLivreAffiliateId: '',
    whatsappWebhookUrl: '',
    sendInterval: 5,
    weeklyReportEnabled: false,
    weeklyReportCron: '0 9 * * 1',
    weeklyReportWebhook: '',
    instagramClientId: '1089163016219900',
    instagramRedirectUri: 'https://aci.automacoescomerciais.com.br/User/Instagram/Callback',
    instagramUser: null,
    theme: 'dark',
    primaryColor: '#4f46e5',
    secondaryColor: '#7c3aed',
    fontFamily: 'Inter',
    aiTextModel: 'gemini-2.5-flash',
    aiImageModel: 'imagen-4.0-generate-001',
    aiTemperature: 0.7,
    credits: 3000,
    creditBalance: 3000,
    creditSpent: 0,
    creditTransactions: [
        {
            id: 'initial_bonus',
            date: new Date(),
            type: 'purchase',
            amount: 3000,
            description: 'Bônus de boas-vindas para novos usuários'
        }
    ],
    n8nWebhookUrl: '',
    automationEnabled: false,
    webhookTimeout: 30,
    webhookRetries: 3,
    automationCreditsPerExecution: 5,
    openaiApiKey: '',
    anthropicApiKey: '',
    groqApiKey: '',
    ollamaApiKey: '',
    wordpressUrl: '',
    wordpressUsername: '',
    wordpressAppPassword: '',
    supabaseUrl: '',
    supabaseAnonKey: '',
    geminiApiKey: '',
};

const SETTINGS_KEY = 'aci-settings';

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const storedSettings = localStorage.getItem(SETTINGS_KEY);
            if (storedSettings) {
                // Merge stored settings with defaults to ensure new keys are present
                const loadedSettings = JSON.parse(storedSettings);
                setSettings({ ...defaultSettings, ...loadedSettings });
            } else {
                setSettings(defaultSettings);
            }
        } catch (error) {
            console.error("Failed to load settings from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const saveSettings = useCallback((newSettings: Settings) => {
        try {
            // Atualizar o saldo de créditos com base nas transações
            const updatedSettings = {
                ...newSettings,
                creditBalance: newSettings.credits,
                creditSpent: newSettings.creditSpent || 0
            };

            localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
            setSettings(updatedSettings);
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
    }, []);

    const addCreditTransaction = useCallback((type: 'purchase' | 'usage', amount: number, description: string) => {
        setSettings(prev => {
            const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newTransaction = {
                id: transactionId,
                date: new Date(),
                type,
                amount,
                description
            };

            const newCreditSpent = type === 'usage' ? prev.creditSpent + amount : prev.creditSpent;
            const newCreditBalance = type === 'purchase' ? prev.creditBalance + amount : prev.creditBalance - amount;

            const updatedSettings = {
                ...prev,
                creditSpent: newCreditSpent,
                credits: newCreditBalance,
                creditBalance: newCreditBalance,
                creditTransactions: [...prev.creditTransactions, newTransaction]
            };

            localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
            return updatedSettings;
        });
    }, []);

    return { settings, saveSettings, addCreditTransaction, isLoading };
};