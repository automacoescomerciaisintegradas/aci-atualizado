/**
 * WooCommerce REST API Integration
 * Documentação: https://woocommerce.github.io/woocommerce-rest-api-docs/
 */

interface WooCommerceConfig {
    storeUrl: string;
    consumerKey: string;
    consumerSecret: string;
}

interface WooCommerceProduct {
    name: string;
    type: 'simple' | 'grouped' | 'external' | 'variable';
    description: string;
    short_description?: string;
    sku?: string;
    regular_price?: string;
    sale_price?: string;
    external_url?: string;
    button_text?: string;
    categories?: Array<{ id: number }>;
    tags?: Array<{ id: number }>;
    images?: Array<{ src: string }>;
    meta_data?: Array<{ key: string; value: any }>;
}

interface WooCommerceReview {
    product_id: number;
    review: string;
    reviewer: string;
    reviewer_email: string;
    rating: number;
    verified?: boolean;
}

export class WooCommerceAPI {
    private baseUrl: string;
    private auth: string;

    constructor(config: WooCommerceConfig) {
        const cleanUrl = config.storeUrl.replace(/\/$/, '');
        this.baseUrl = `${cleanUrl}/wp-json/wc/v3`;

        // Base64 encode consumer_key:consumer_secret
        this.auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
    }

    /**
     * Testa a conexão com a loja WooCommerce
     */
    async testConnection(): Promise<{ success: boolean; message: string; storeInfo?: any }> {
        try {
            const response = await fetch(`${this.baseUrl}/system_status`, {
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
                storeInfo: {
                    environment: data.environment,
                    database: data.database,
                    activePlugins: data.active_plugins?.length || 0,
                },
            };
        } catch (error: any) {
            return {
                success: false,
                message: error.message || 'Erro ao conectar com WooCommerce',
            };
        }
    }

    /**
     * Cria um produto externo (afiliado)
     */
    async createExternalProduct(product: WooCommerceProduct): Promise<{ id: number; permalink: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/products`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...product,
                    type: 'external',
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Erro ao criar produto: ${JSON.stringify(error)}`);
            }

            const data = await response.json();

            return {
                id: data.id,
                permalink: data.permalink,
            };
        } catch (error) {
            console.error('Error creating WooCommerce product:', error);
            throw error;
        }
    }

    /**
     * Atualiza um produto existente
     */
    async updateProduct(productId: number, updates: Partial<WooCommerceProduct>): Promise<{ id: number; permalink: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Erro ao atualizar produto: ${JSON.stringify(error)}`);
            }

            const data = await response.json();

            return {
                id: data.id,
                permalink: data.permalink,
            };
        } catch (error) {
            console.error('Error updating WooCommerce product:', error);
            throw error;
        }
    }

    /**
     * Cria uma review para um produto
     */
    async createReview(review: WooCommerceReview): Promise<{ id: number; status: string }> {
        try {
            const response = await fetch(`${this.baseUrl}/products/reviews`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(review),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(`Erro ao criar review: ${JSON.stringify(error)}`);
            }

            const data = await response.json();

            return {
                id: data.id,
                status: data.status,
            };
        } catch (error) {
            console.error('Error creating WooCommerce review:', error);
            throw error;
        }
    }

    /**
     * Lista produtos da loja
     */
    async getProducts(page: number = 1, perPage: number = 10): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseUrl}/products?page=${page}&per_page=${perPage}`, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar produtos');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            throw error;
        }
    }

    /**
     * Busca um produto específico
     */
    async getProduct(productId: number): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/products/${productId}`, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar produto');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching product:', error);
            throw error;
        }
    }

    /**
     * Lista categorias de produtos
     */
    async getCategories(): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseUrl}/products/categories?per_page=100`, {
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
     * Cria uma categoria de produto
     */
    async createCategory(name: string, slug?: string, parent?: number): Promise<any> {
        try {
            const response = await fetch(`${this.baseUrl}/products/categories`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
                    parent: parent || 0,
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
     * Deleta um produto
     */
    async deleteProduct(productId: number, force: boolean = false): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/products/${productId}?force=${force}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao deletar produto');
            }

            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw error;
        }
    }

    /**
     * Lista reviews de um produto
     */
    async getProductReviews(productId: number): Promise<any[]> {
        try {
            const response = await fetch(`${this.baseUrl}/products/reviews?product=${productId}`, {
                headers: {
                    'Authorization': `Basic ${this.auth}`,
                },
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar reviews');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    }
}

/**
 * Helper para criar produto externo a partir de dados da Shopee
 */
export function createExternalProductFromShopee(
    shopeeProduct: any,
    affiliateLink: string,
    categoryId?: number
): WooCommerceProduct {
    return {
        name: shopeeProduct.name || shopeeProduct.title,
        type: 'external',
        description: shopeeProduct.description || '',
        short_description: shopeeProduct.description?.substring(0, 120) || '',
        regular_price: shopeeProduct.price?.toString() || '0',
        external_url: affiliateLink,
        button_text: 'Comprar na Shopee',
        categories: categoryId ? [{ id: categoryId }] : [],
        images: shopeeProduct.images?.map((img: string) => ({ src: img })) || [],
        meta_data: [
            { key: '_shopee_product_id', value: shopeeProduct.id },
            { key: '_is_affiliate', value: 'yes' },
        ],
    };
}

/**
 * Helper para gerar review com IA
 */
export function createAIGeneratedReview(
    productId: number,
    reviewerName: string,
    reviewerEmail: string,
    rating: number,
    aiGeneratedText: string
): WooCommerceReview {
    return {
        product_id: productId,
        review: aiGeneratedText,
        reviewer: reviewerName,
        reviewer_email: reviewerEmail,
        rating: Math.min(Math.max(rating, 1), 5), // Entre 1 e 5
        verified: false,
    };
}
