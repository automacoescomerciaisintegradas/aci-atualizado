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
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
            setSettings(newSettings);
        } catch (error) {
            console.error("Failed to save settings to localStorage", error);
        }
    }, []);

    return { settings, saveSettings, isLoading };
};