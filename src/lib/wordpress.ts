/**
 * WordPress REST API Integration
 * Documentação: https://developer.wordpress.org/rest-api/
 */

interface WordPressConfig {
    siteUrl: string;
    username: string;
    applicationPassword: string;
}

interface WordPressPost {
    title: string;
    content: string;
    excerpt?: string;
    status: 'publish' | 'draft' | 'pending' | 'private';
    categories?: number[];
    tags?: number[];
    featured_media?: number;
    meta?: Record<string, any>;
}

interface WordPressCategory {
    id: number;
    name: string;
    slug: string;
}

interface WordPressTag {
    id: number;
    name: string;
    slug: string;
}

interface WordPressMedia {
    id: number;
    source_url: string;
    title: {
        rendered: string;
    };
}

export class WordPressAPI {
    private siteUrl: string;
    private auth: string;
    private baseUrl: string;

    constructor(config: WordPressConfig) {
        this.siteUrl = config.siteUrl.replace(/\/$/, ''); // Remove trailing slash
        this.baseUrl = `${this.siteUrl}/wp-json/wp/v2`;

        // Base64 encode username:password for Basic Auth
        this.auth = Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64');
    }

    /**
     * Testa a conexão com o WordPress
     */
    async testConnection(): Promise<{ success: boolean; message: string; siteInfo?: any }> {
        try {
            const response = await fetch(`${this.siteUrl}/wp-json`, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            return {
                success: true,
                message: 'Conexão estabelecida com sucesso',
                siteInfo: {
                    name: data.name,
                    description: data.description,
                    url: data.url,
                    namespaces: data.namespaces,
                },
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Erro ao conectar com WordPress',
            };
        }
    }

    /**
     * Publica um post no WordPress
     */
    async createPost(post: WordPressPost): Promise<{ id: number; link: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/posts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(post),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Erro ao criar post: ${JSON.stringify(error)}`);
            }

            const data = await response.json();

            return {
                id: data.id,
                link: data.link,
            };
        } catch (error) {
            console.error('Error creating WordPress post:', error);
            throw error;
        }
    }

    /**
     * Atualiza um post existente
     */
    async updatePost(postId: number, updates: Partial<WordPressPost>): Promise<{ id: number; link: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/posts/${postId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Erro ao atualizar post: ${JSON.stringify(error)}`);
            }

            const data = await response.json();

            return {
                id: data.id,
                link: data.link,
            };
        } catch (error) {
            console.error('Error updating WordPress post:', error);
            throw error;
        }
    }

    /**
     * Lista categorias disponíveis
     */
    async getCategories(): Promise<WordPressCategory[]> {
        try {
            const response = await fetch(`${this.baseUrl}/categories?per_page=100`, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar categorias');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    }

    /**
     * Cria uma nova categoria
     */
    async createCategory(name: string, slug?: string): Promise<WordPressCategory> {
        try {
            const response = await fetch(`${this.baseUrl}/categories`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Erro ao criar categoria: ${JSON.stringify(error)}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }

    /**
     * Lista tags disponíveis
     */
    async getTags(): Promise<WordPressTag[]> {
        try {
            const response = await fetch(`${this.baseUrl}/tags?per_page=100`, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar tags');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching tags:', error);
            throw error;
        }
    }

    /**
     * Cria uma nova tag
     */
    async createTag(name: string, slug?: string): Promise<WordPressTag> {
        try {
            const response = await fetch(`${this.baseUrl}/tags`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Erro ao criar tag: ${JSON.stringify(error)}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating tag:', error);
            throw error;
        }
    }

    /**
     * Faz upload de uma imagem
     */
    async uploadMedia(imageUrl: string, title: string): Promise<WordPressMedia> {
        try {
            // Baixar imagem
            const imageResponse = await fetch(imageUrl);
            const imageBlob = await imageResponse.blob();

            // Fazer upload para WordPress
            const formData = new FormData();
            formData.append('file', imageBlob, title);

            const response = await fetch(`${this.baseUrl}/media`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Erro ao fazer upload de mídia: ${JSON.stringify(error)}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error uploading media:', error);
            throw error;
        }
    }

    /**
     * Lista posts do blog
     */
    async getPosts(page: number = 1, perPage: number = 10): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseUrl}/posts?page=${page}&per_page=${perPage}`, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar posts');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching posts:', error);
            throw error;
        }
    }

    /**
     * Deleta um post
     */
    async deletePost(postId: number): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao deletar post');
            }

            return true;
        } catch (error) {
            console.error('Error deleting post:', error);
            throw error;
        }
    }
}

/**
 * Helper para criar post com produto de afiliado
 */
export function createAffiliatePostContent(
    productName: string,
    productDescription: string,
    productPrice: string,
    productImage: string,
    affiliateLink: string,
    aiGeneratedContent?: string
): string {
    let content = `
    <div class="affiliate-product">
      <div class="product-image">
        <img src="${productImage}" alt="${productName}" />
      </div>
      <div class="product-details">
        <h2>${productName}</h2>
        ${aiGeneratedContent || `<p>${productDescription}</p>`}
        <div class="product-price">
          <span class="price">${productPrice}</span>
        </div>
        <div class="product-cta">
          <a href="${affiliateLink}" target="_blank" rel="nofollow noopener" class="btn-buy">
            🛒 Comprar Agora na Shopee
          </a>
        </div>
      </div>
    </div>
  `;

    return content;
}
