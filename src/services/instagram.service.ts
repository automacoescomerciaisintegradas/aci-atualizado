/**
 * Instagram Service - Cliente Frontend
 * Comunicação com API de Instagram
 */

import { apiClient } from './apiClient';
import type {
    InstagramAccount,
    InstagramAccountListItem,
    InstagramMedia,
    ResponseTemplate,
    AutomationConfig,
    AutomationRule,
    AutomationLog,
    InstagramInsights,
    PublishResult,
    InstagramApiResponse,
} from '../types/instagram.types';

class InstagramService {
    private baseUrl = '/api/integrations/instagram';

    // ============================================
    // AUTENTICAÇÃO E CONEXÃO
    // ============================================

    /**
     * Inicia o fluxo de autenticação OAuth
     * Retorna a URL para redirecionar o usuário
     */
    async getAuthUrl(): Promise<string> {
        const response = await apiClient['request']<{ url: string }>(`${this.baseUrl}/auth`);
        return response.url;
    }

    /**
     * Desconecta uma conta do Instagram
     */
    async disconnectAccount(accountId: string): Promise<InstagramApiResponse> {
        return await apiClient['request'](`${this.baseUrl}/disconnect`, {
            method: 'POST',
            body: JSON.stringify({ accountId }),
        });
    }

    /**
     * Reconecta/atualiza token de uma conta
     */
    async refreshToken(accountId: string): Promise<InstagramApiResponse> {
        return await apiClient['request'](`${this.baseUrl}/refresh-token`, {
            method: 'POST',
            body: JSON.stringify({ accountId }),
        });
    }

    // ============================================
    // CONTAS E PERFIS
    // ============================================

    /**
     * Lista todas as contas Instagram conectadas do usuário
     */
    async getAccounts(): Promise<InstagramAccountListItem[]> {
        const response = await apiClient['request']<{ data: InstagramAccountListItem[] }>(
            `${this.baseUrl}/accounts`
        );
        return response.data || [];
    }

    /**
     * Obtém detalhes de uma conta específica
     */
    async getAccountDetails(accountId: string): Promise<InstagramAccount> {
        const response = await apiClient['request']<{ data: InstagramAccount }>(
            `${this.baseUrl}/account/${accountId}`
        );
        return response.data;
    }

    /**
     * Obtém informações do perfil e posts recentes
     */
    async getAccountInfo(accountId: string): Promise<{
        account: InstagramAccount;
        recentPosts: InstagramMedia[];
    }> {
        const response = await apiClient['request']<{
            data: { account: InstagramAccount; recentPosts: InstagramMedia[] };
        }>(`${this.baseUrl}/account/${accountId}`);
        return response.data;
    }

    // ============================================
    // PUBLICAÇÃO DE CONTEÚDO
    // ============================================

    /**
     * Publica uma imagem no Instagram
     */
    async publishPost(
        accountId: string,
        imageUrl: string,
        caption: string
    ): Promise<PublishResult> {
        const response = await apiClient['request']<{ data: PublishResult }>(
            `${this.baseUrl}/post`,
            {
                method: 'POST',
                body: JSON.stringify({ integrationId: accountId, imageUrl, caption }),
            }
        );
        return response.data;
    }

    /**
     * Publica um carrossel no Instagram
     */
    async publishCarousel(
        accountId: string,
        mediaUrls: string[],
        caption: string
    ): Promise<PublishResult> {
        const response = await apiClient['request']<{ data: PublishResult }>(
            `${this.baseUrl}/carousel`,
            {
                method: 'POST',
                body: JSON.stringify({ integrationId: accountId, mediaUrls, caption }),
            }
        );
        return response.data;
    }

    /**
     * Lista posts recentes de uma conta
     */
    async getRecentPosts(accountId: string, limit: number = 12): Promise<InstagramMedia[]> {
        const response = await apiClient['request']<{ data: InstagramMedia[] }>(
            `${this.baseUrl}/account/${accountId}/media?limit=${limit}`
        );
        return response.data || [];
    }

    // ============================================
    // COMENTÁRIOS
    // ============================================

    /**
     * Responde a um comentário
     */
    async replyToComment(
        accountId: string,
        commentId: string,
        message: string
    ): Promise<InstagramApiResponse> {
        return await apiClient['request'](`${this.baseUrl}/comment/reply`, {
            method: 'POST',
            body: JSON.stringify({ integrationId: accountId, commentId, message }),
        });
    }

    /**
     * Resposta automática a comentário com palavra-chave
     */
    async autoReplyToComment(
        accountId: string,
        commentId: string,
        commentText: string,
        username: string,
        productName?: string,
        productLink?: string
    ): Promise<InstagramApiResponse<{ replied: boolean; replyMessage?: string; cost?: number }>> {
        return await apiClient['request'](`${this.baseUrl}/comment/auto-reply`, {
            method: 'POST',
            body: JSON.stringify({
                integrationId: accountId,
                commentId,
                commentText,
                username,
                productName,
                productLink,
            }),
        });
    }

    // ============================================
    // MENSAGENS DIRETAS
    // ============================================

    /**
     * Envia mensagem direta para um usuário
     */
    async sendDirectMessage(
        accountId: string,
        recipientId: string,
        message: string
    ): Promise<InstagramApiResponse> {
        return await apiClient['request'](`${this.baseUrl}/dm/send`, {
            method: 'POST',
            body: JSON.stringify({ integrationId: accountId, recipientId, message }),
        });
    }

    /**
     * Envia resposta automática no Direct
     */
    async sendAutoDirectMessage(
        accountId: string,
        recipientId: string,
        templateId: string,
        variables: Record<string, string>
    ): Promise<InstagramApiResponse> {
        return await apiClient['request'](`${this.baseUrl}/dm/auto-send`, {
            method: 'POST',
            body: JSON.stringify({ integrationId: accountId, recipientId, templateId, variables }),
        });
    }

    // ============================================
    // TEMPLATES DE RESPOSTA
    // ============================================

    /**
     * Lista todos os templates do usuário
     */
    async getTemplates(): Promise<ResponseTemplate[]> {
        const response = await apiClient['request']<{ data: ResponseTemplate[] }>(
            `${this.baseUrl}/templates`
        );
        return response.data || [];
    }

    /**
     * Lista templates por tipo (public/private)
     */
    async getTemplatesByType(type: 'public' | 'private'): Promise<ResponseTemplate[]> {
        const response = await apiClient['request']<{ data: ResponseTemplate[] }>(
            `${this.baseUrl}/templates?type=${type}`
        );
        return response.data || [];
    }

    /**
     * Cria um novo template
     */
    async createTemplate(template: Omit<ResponseTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResponseTemplate> {
        const response = await apiClient['request']<{ data: ResponseTemplate }>(
            `${this.baseUrl}/templates`,
            {
                method: 'POST',
                body: JSON.stringify(template),
            }
        );
        return response.data;
    }

    /**
     * Atualiza um template existente
     */
    async updateTemplate(templateId: string, updates: Partial<ResponseTemplate>): Promise<ResponseTemplate> {
        const response = await apiClient['request']<{ data: ResponseTemplate }>(
            `${this.baseUrl}/templates/${templateId}`,
            {
                method: 'PUT',
                body: JSON.stringify(updates),
            }
        );
        return response.data;
    }

    /**
     * Exclui um template
     */
    async deleteTemplate(templateId: string): Promise<InstagramApiResponse> {
        return await apiClient['request'](`${this.baseUrl}/templates/${templateId}`, {
            method: 'DELETE',
        });
    }

    // ============================================
    // AUTOMAÇÃO
    // ============================================

    /**
     * Obtém configuração de automação de uma conta
     */
    async getAutomationConfig(accountId: string): Promise<AutomationConfig> {
        const response = await apiClient['request']<{ data: AutomationConfig }>(
            `${this.baseUrl}/automation/${accountId}`
        );
        return response.data;
    }

    /**
     * Atualiza configuração de automação
     */
    async updateAutomationConfig(
        accountId: string,
        config: Partial<AutomationConfig>
    ): Promise<AutomationConfig> {
        const response = await apiClient['request']<{ data: AutomationConfig }>(
            `${this.baseUrl}/automation/${accountId}`,
            {
                method: 'PUT',
                body: JSON.stringify(config),
            }
        );
        return response.data;
    }

    /**
     * Ativa/desativa automação
     */
    async toggleAutomation(accountId: string, isEnabled: boolean): Promise<InstagramApiResponse> {
        return await apiClient['request'](`${this.baseUrl}/automation/${accountId}/toggle`, {
            method: 'POST',
            body: JSON.stringify({ isEnabled }),
        });
    }

    /**
     * Cria regra de automação
     */
    async createAutomationRule(accountId: string, rule: Omit<AutomationRule, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>): Promise<AutomationRule> {
        const response = await apiClient['request']<{ data: AutomationRule }>(
            `${this.baseUrl}/automation/${accountId}/rules`,
            {
                method: 'POST',
                body: JSON.stringify(rule),
            }
        );
        return response.data;
    }

    /**
     * Lista logs de automação
     */
    async getAutomationLogs(accountId: string, limit: number = 50): Promise<AutomationLog[]> {
        const response = await apiClient['request']<{ data: AutomationLog[] }>(
            `${this.baseUrl}/automation/${accountId}/logs?limit=${limit}`
        );
        return response.data || [];
    }

    // ============================================
    // INSIGHTS E MÉTRICAS
    // ============================================

    /**
     * Obtém insights da conta
     */
    async getInsights(
        accountId: string,
        period: 'day' | 'week' | 'days_28' = 'week'
    ): Promise<InstagramInsights> {
        const response = await apiClient['request']<{ data: InstagramInsights }>(
            `${this.baseUrl}/insights/${accountId}?period=${period}`
        );
        return response.data;
    }

    /**
     * Obtém insights de um post específico
     */
    async getMediaInsights(accountId: string, mediaId: string): Promise<any> {
        const response = await apiClient['request'](
            `${this.baseUrl}/insights/${accountId}/media/${mediaId}`
        );
        return response.data;
    }

    // ============================================
    // UTILITÁRIOS
    // ============================================

    /**
     * Processa variáveis em um template
     */
    processTemplate(template: string, variables: Record<string, string>): string {
        let processed = template;
        Object.entries(variables).forEach(([key, value]) => {
            processed = processed.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
        });
        return processed;
    }

    /**
     * Extrai primeiro nome de um nome completo ou username
     */
    extractFirstName(name: string): string {
        // Remove @ se for username
        const cleanName = name.startsWith('@') ? name.substring(1) : name;
        // Pega primeiro nome
        const firstName = cleanName.split(/[\s_.-]/)[0];
        // Capitaliza primeira letra
        return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    }

    /**
     * Calcula dias até expirar token
     */
    calculateExpiresInDays(expiresAt: Date | string): number {
        const expiry = new Date(expiresAt);
        const now = new Date();
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    }

    /**
     * Formata status para exibição
     */
    formatStatus(status: string, expiresInDays: number): 'Ativo' | 'Expirado' | 'Erro' {
        if (status === 'error' || status === 'revoked') return 'Erro';
        if (status === 'expired' || expiresInDays <= 0) return 'Expirado';
        return 'Ativo';
    }
}

// Singleton
export const instagramService = new InstagramService();
export default instagramService;
