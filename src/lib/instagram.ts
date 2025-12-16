/**
 * Instagram Graph API Integration
 * Documentação: https://developers.facebook.com/docs/instagram-api
 */

interface InstagramConfig {
    accessToken: string;
    instagramBusinessAccountId: string;
}

interface InstagramPost {
    imageUrl: string;
    caption: string;
    location?: string;
}

interface InstagramMedia {
    id: string;
    mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
    mediaUrl: string;
    permalink: string;
    caption?: string;
    timestamp: string;
}

interface InstagramComment {
    id: string;
    text: string;
    username: string;
    timestamp: string;
    from: {
        id: string;
        username: string;
    };
}

export class InstagramAPI {
    private accessToken: string;
    private accountId: string;
    private baseUrl = 'https://graph.facebook.com/v18.0';

    constructor(config: InstagramConfig) {
        this.accessToken = config.accessToken;
        this.accountId = config.instagramBusinessAccountId;
    }

    /**
     * Publica uma imagem no Instagram
     */
    async publishPost(post: InstagramPost): Promise<{ id: string; permalink: string }> {
        try {
            // Passo 1: Criar container de mídia
            const containerResponse = await fetch(
                `${this.baseUrl}/${this.accountId}/media`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        image_url: post.imageUrl,
                        caption: post.caption,
                        access_token: this.accessToken,
                    }),
                }
            );

            if (!containerResponse.ok) {
                const error = await containerResponse.json();
                throw new Error(`Failed to create media container: ${JSON.stringify(error)}`);
            }

            const { id: containerId } = await containerResponse.json();

            // Passo 2: Publicar o container
            const publishResponse = await fetch(
                `${this.baseUrl}/${this.accountId}/media_publish`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        creation_id: containerId,
                        access_token: this.accessToken,
                    }),
                }
            );

            if (!publishResponse.ok) {
                const error = await publishResponse.json();
                throw new Error(`Failed to publish media: ${JSON.stringify(error)}`);
            }

            const { id: mediaId } = await publishResponse.json();

            // Passo 3: Obter permalink
            const mediaResponse = await fetch(
                `${this.baseUrl}/${mediaId}?fields=permalink&access_token=${this.accessToken}`
            );

            const { permalink } = await mediaResponse.json();

            return {
                id: mediaId,
                permalink,
            };
        } catch (error) {
            console.error('Error publishing Instagram post:', error);
            throw error;
        }
    }

    /**
     * Obtém comentários de uma mídia
     */
    async getMediaComments(mediaId: string): Promise<InstagramComment[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/${mediaId}/comments?fields=id,text,username,timestamp,from&access_token=${this.accessToken}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch comments');
            }

            const { data } = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
    }

    /**
     * Responde a um comentário
     */
    async replyToComment(commentId: string, message: string): Promise<{ id: string }> {
        try {
            const response = await fetch(
                `${this.baseUrl}/${commentId}/replies`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message,
                        access_token: this.accessToken,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to reply to comment: ${JSON.stringify(error)}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error replying to comment:', error);
            throw error;
        }
    }

    /**
     * Envia mensagem direta (requer permissões especiais)
     */
    async sendDirectMessage(userId: string, message: string): Promise<{ success: boolean }> {
        try {
            // Nota: Esta funcionalidade requer aprovação do Instagram
            // e permissões especiais (instagram_manage_messages)
            const response = await fetch(
                `${this.baseUrl}/me/messages`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        recipient: { id: userId },
                        message: { text: message },
                        access_token: this.accessToken,
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Failed to send DM: ${JSON.stringify(error)}`);
            }

            return { success: true };
        } catch (error) {
            console.error('Error sending DM:', error);
            throw error;
        }
    }

    /**
     * Obtém informações da conta
     */
    async getAccountInfo(): Promise<{
        id: string;
        username: string;
        followersCount: number;
        mediaCount: number;
    }> {
        try {
            const response = await fetch(
                `${this.baseUrl}/${this.accountId}?fields=id,username,followers_count,media_count&access_token=${this.accessToken}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch account info');
            }

            const data = await response.json();
            return {
                id: data.id,
                username: data.username,
                followersCount: data.followers_count,
                mediaCount: data.media_count,
            };
        } catch (error) {
            console.error('Error fetching account info:', error);
            throw error;
        }
    }

    /**
     * Lista posts recentes
     */
    async getRecentMedia(limit: number = 10): Promise<InstagramMedia[]> {
        try {
            const response = await fetch(
                `${this.baseUrl}/${this.accountId}/media?fields=id,media_type,media_url,permalink,caption,timestamp&limit=${limit}&access_token=${this.accessToken}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch media');
            }

            const { data } = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching media:', error);
            throw error;
        }
    }

    /**
     * Valida se o token de acesso é válido
     */
    async validateToken(): Promise<boolean> {
        try {
            const response = await fetch(
                `${this.baseUrl}/me?access_token=${this.accessToken}`
            );
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

/**
 * Helper para processar comentários com palavra-chave
 */
export function detectKeywordInComment(comment: InstagramComment, keyword: string = 'EU QUERO'): boolean {
    return comment.text.toUpperCase().includes(keyword.toUpperCase());
}

/**
 * Gera resposta automática para comentário
 */
export function generateAutoReply(username: string, productName?: string): string {
    if (productName) {
        return `@${username} Oba! 🎉 Vou te enviar o link do ${productName} na DM agora mesmo! Confere lá! 💌`;
    }
    return `@${username} Oba! 🎉 Vou te enviar mais informações na DM agora mesmo! Confere lá! 💌`;
}

/**
 * Gera mensagem de DM com link do produto
 */
export function generateDMMessage(productName: string, productLink: string, price?: string): string {
    let message = `Olá! 👋\n\n`;
    message += `Aqui está o link do ${productName} que você pediu:\n\n`;
    message += `🔗 ${productLink}\n\n`;

    if (price) {
        message += `💰 Preço: ${price}\n\n`;
    }

    message += `Aproveita que está com desconto! 🔥\n\n`;
    message += `Qualquer dúvida, é só chamar! 😊`;

    return message;
}
