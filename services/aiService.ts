
import type { Settings } from '../hooks/useSettings';

const getSettings = (): Partial<Settings> => {
    try {
        const storedSettings = localStorage.getItem('aci-settings');
        return storedSettings ? JSON.parse(storedSettings) : {};
    } catch (e) {
        return {};
    }
};

export interface AiRequestOptions {
    systemInstruction?: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxTokens?: number;
    responseMimeType?: 'text/plain' | 'application/json';
}

export const generateTextUnified = async (prompt: string, options: AiRequestOptions = {}): Promise<string> => {
    const settings = getSettings();
    const model = settings.aiTextModel || 'gemini-2.0-flash';

    // Check if it's a Gemini model
    if (model.includes('gemini')) {
        const { generateTextUnifiedGemini } = await import('./geminiServiceProxy');
        return generateTextUnifiedGemini(prompt, options);
    }

    // Otherwise, handle as OpenAI-compatible API
    let apiKey = '';
    let baseUrl = '';

    if (model.includes('gpt') || model.includes('openai')) {
        apiKey = settings.openaiApiKey || '';
        baseUrl = 'https://api.openai.com/v1/chat/completions';
    } else if (model.includes('claude') || model.includes('anthropic')) {
        // Anthropic has a different API, but many people use proxy or we can use fetch
        apiKey = settings.anthropicApiKey || '';
        baseUrl = 'https://api.anthropic.com/v1/messages'; // Note: Anthropic needs special handling
    } else if (model.includes('groq')) {
        apiKey = settings.groqApiKey || '';
        baseUrl = 'https://api.groq.com/openai/v1/chat/completions';
    } else if (settings.ollamaApiKey) {
        apiKey = 'ollama'; // Often not needed for local
        baseUrl = `${settings.ollamaApiKey}/v1/chat/completions`;
    }

    if (!apiKey && !model.includes('ollama')) {
        throw new Error(`Chave de API para o modelo ${model} não configurada.`);
    }

    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                // Add Anthropic specific headers if needed
                ...(model.includes('anthropic') ? { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' } : {})
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    ...(options.systemInstruction ? [{ role: 'system', content: options.systemInstruction }] : []),
                    { role: 'user', content: prompt }
                ],
                temperature: options.temperature ?? settings.aiTemperature ?? 0.7,
                max_tokens: options.maxTokens ?? settings.aiMaxOutputTokens ?? 2048,
                top_p: options.topP ?? settings.aiTopP ?? 0.95,
                ...(options.responseMimeType === 'application/json' ? { response_format: { type: 'json_object' } } : {})
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || `Erro na API do Provedor: ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (e) {
        console.error('AI Unified Error:', e);
        throw e;
    }
};
