import { useState } from 'react';
import { Settings } from '../../hooks/useSettings.js';
import { supabase } from '../../services/supabaseClient.js';

export const useAdminSave = (settings: Settings, saveSettings: (newSettings: Settings) => void) => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');

  const handleSave = async (localConfig: Settings) => {
    try {
      setSaveStatus('loading');
      
      // Save to Local Storage (legacy/fallback)
      saveSettings(localConfig);

      // Save to Supabase if connected
      if (supabase) {
        // 1. Save API Keys
        const apiKeysToSave = [
          { provider: 'openai', key_value: localConfig.openaiApiKey },
          { provider: 'anthropic', key_value: localConfig.anthropicApiKey },
          { provider: 'groq', key_value: localConfig.groqApiKey },
          { provider: 'ollama', key_value: localConfig.ollamaApiKey },
          { provider: 'gemini', key_value: localConfig.geminiApiKey },
        ].filter(k => k.key_value); // Only save if value exists

        for (const key of apiKeysToSave) {
          // Check if exists
          const { data: existing } = await supabase.from('api_keys').select('id').eq('provider', key.provider).single();

          if (existing) {
            await supabase.from('api_keys').update({ key_value: key.key_value, updated_at: new Date().toISOString() }).eq('id', existing.id);
          } else {
            await supabase.from('api_keys').insert({ provider: key.provider, key_value: key.key_value, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
          }
        }

        // 2. Save WordPress Connection
        if (localConfig.wordpressUrl) {
          const { data: existingWp } = await supabase.from('wordpress_connections').select('id').limit(1).single();

          if (existingWp) {
            await supabase.from('wordpress_connections').update({
              url: localConfig.wordpressUrl,
              username: localConfig.wordpressUsername,
              app_password: localConfig.wordpressAppPassword,
              updated_at: new Date().toISOString()
            }).eq('id', existingWp.id);
          } else {
            await supabase.from('wordpress_connections').insert({
              url: localConfig.wordpressUrl,
              username: localConfig.wordpressUsername,
              app_password: localConfig.wordpressAppPassword,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }
        
        // 3. Save Telegram Connection
        if (localConfig.telegramBotToken || localConfig.telegramChatId) {
          const { data: existingTg } = await supabase.from('telegram_connections').select('id').limit(1).single();

          if (existingTg) {
            await supabase.from('telegram_connections').update({
              bot_token: localConfig.telegramBotToken,
              chat_id: localConfig.telegramChatId,
              updated_at: new Date().toISOString()
            }).eq('id', existingTg.id);
          } else {
            await supabase.from('telegram_connections').insert({
              bot_token: localConfig.telegramBotToken,
              chat_id: localConfig.telegramChatId,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }
        
        // 4. Save Affiliate IDs
        const { data: existingAff } = await supabase.from('affiliate_ids').select('id').limit(1).single();

        if (existingAff) {
          await supabase.from('affiliate_ids').update({
            shopee_id: localConfig.shopeeAffiliateId,
            amazon_id: localConfig.amazonAffiliateId,
            mercado_livre_id: localConfig.mercadoLivreAffiliateId,
            updated_at: new Date().toISOString()
          }).eq('id', existingAff.id);
        } else {
          await supabase.from('affiliate_ids').insert({
            shopee_id: localConfig.shopeeAffiliateId,
            amazon_id: localConfig.amazonAffiliateId,
            mercado_livre_id: localConfig.mercadoLivreAffiliateId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch (error) {
      setSaveStatus('error');
      console.error("Failed to save settings:", error);
      setTimeout(() => setSaveStatus('idle'), 2500);
    }
  };

  return { saveStatus, handleSave };
};