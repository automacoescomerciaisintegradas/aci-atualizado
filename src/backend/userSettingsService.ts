// Serviço simples para gerenciar configurações de usuário
// Em produção, isso seria salvo em um banco de dados

interface UserSettings {
    shopeeAffiliateId?: string;
    telegramBotToken?: string;
    telegramBotUsername?: string;
    instagramToken?: string;
    instagramUsername?: string;
}

class UserSettingsService {
    private settings: Map<string, UserSettings> = new Map();

    // Obter configurações do usuário
    getSettings(userId: string): UserSettings {
        return this.settings.get(userId) || {};
    }

    // Salvar ID de Afiliado Shopee
    saveShopeeAffiliateId(userId: string, affiliateId: string): boolean {
        try {
            const currentSettings = this.getSettings(userId);
            this.settings.set(userId, {
                ...currentSettings,
                shopeeAffiliateId: affiliateId
            });
            console.log(`✅ ID de Afiliado Shopee salvo para ${userId}: ${affiliateId}`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar ID de Afiliado:', error);
            return false;
        }
    }

    // Validar ID de Afiliado Shopee
    validateShopeeAffiliateId(affiliateId: string): { valid: boolean; error?: string } {
        // Validações básicas
        if (!affiliateId || affiliateId.trim() === '') {
            return { valid: false, error: 'ID de afiliado não pode estar vazio' };
        }

        // ID deve ter pelo menos 5 caracteres
        if (affiliateId.length < 5) {
            return { valid: false, error: 'ID de afiliado muito curto (mínimo 5 caracteres)' };
        }

        // ID deve conter apenas números e letras
        if (!/^[a-zA-Z0-9]+$/.test(affiliateId)) {
            return { valid: false, error: 'ID de afiliado deve conter apenas letras e números' };
        }

        return { valid: true };
    }

    // Salvar configurações do Telegram
    saveTelegramSettings(userId: string, botToken: string, botUsername: string): boolean {
        try {
            const currentSettings = this.getSettings(userId);
            this.settings.set(userId, {
                ...currentSettings,
                telegramBotToken: botToken,
                telegramBotUsername: botUsername
            });
            console.log(`✅ Configurações do Telegram salvas para ${userId}`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar configurações do Telegram:', error);
            return false;
        }
    }

    // Salvar configurações do Instagram
    saveInstagramSettings(userId: string, token: string, username: string): boolean {
        try {
            const currentSettings = this.getSettings(userId);
            this.settings.set(userId, {
                ...currentSettings,
                instagramToken: token,
                instagramUsername: username
            });
            console.log(`✅ Configurações do Instagram salvas para ${userId}`);
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar configurações do Instagram:', error);
            return false;
        }
    }
}

export const userSettingsService = new UserSettingsService();
