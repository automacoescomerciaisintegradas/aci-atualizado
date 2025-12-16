import axios from 'axios';

export interface WordPressCredentials {
    url: string;
    username: string;
    password: string; // Application Password
}

export interface WordPressPost {
    title: string;
    content: string;
    status?: 'publish' | 'draft' | 'pending' | 'private' | 'future';
    date?: string; // ISO 8601 date string for scheduling
    categories?: number[];
    tags?: number[];
    featured_media?: number;
    excerpt?: string;
}

export interface WordPressCategory {
    id: number;
    name: string;
    slug: string;
}

export interface WordPressTestResult {
    success: boolean;
    message: string;
    siteInfo?: {
        name: string;
        description: string;
        url: string;
        version: string;
    };
}

/**
 * Valida credenciais do WordPress testando conexão
 */
export async function testWordPressConnection(
    credentials: WordPressCredentials
): Promise<WordPressTestResult> {
    try {
        const { url, username, password } = credentials;

        // Limpar URL e garantir formato correto
        const cleanUrl = url.replace(/\/$/, '');

        // Testar autenticação e obter informações do site
        const response = await axios.get(`${cleanUrl}/wp-json`, {
            auth: {
                username,
                password,
            },
            timeout: 10000,
        });

        if (response.status === 200) {
            return {
                success: true,
                message: 'Conexão estabelecida com sucesso!',
                siteInfo: {
                    name: response.data.name || 'WordPress',
                    description: response.data.description || '',
                    url: response.data.url || cleanUrl,
                    version: response.data.version || 'unknown',
                },
            };
        }

        return {
            success: false,
            message: 'Não foi possível conectar ao WordPress',
        };
    } catch (error: any) {
        console.error('Erro ao testar conexão WordPress:', error);

        if (error.response?.status === 401) {
            return {
                success: false,
                message: 'Credenciais inválidas. Verifique o usuário e senha de aplicativo.',
            };
        }

        if (error.response?.status === 404) {
            return {
                success: false,
                message: 'WordPress REST API não encontrada. Verifique a URL do blog.',
            };
        }

        if (error.code === 'ECONNABORTED') {
            return {
                success: false,
                message: 'Tempo de conexão esgotado. Verifique a URL do blog.',
            };
        }

        return {
            success: false,
            message: error.message || 'Erro ao conectar ao WordPress',
        };
    }
}

/**
 * Publica um post no WordPress
 */
export async function publishWordPressPost(
    credentials: WordPressCredentials,
    post: WordPressPost
): Promise<{ success: boolean; message: string; postId?: number; postUrl?: string }> {
    try {
        const { url, username, password } = credentials;
        const cleanUrl = url.replace(/\/$/, '');
        const apiUrl = `${cleanUrl}/wp-json/wp/v2/posts`;

        // Preparar conteúdo com CSS inline
        const contentWithStyles = wrapContentWithStyles(post.content);

        const response = await axios.post(
            apiUrl,
            {
                title: post.title,
                content: contentWithStyles,
                status: post.status || 'draft',
                date: post.date, // Add scheduled date if present
                categories: post.categories || [],
                tags: post.tags || [],
                featured_media: post.featured_media,
                excerpt: post.excerpt,
            },
            {
                auth: {
                    username,
                    password,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000,
            }
        );

        if (response.status === 201) {
            return {
                success: true,
                message: 'Post publicado com sucesso!',
                postId: response.data.id,
                postUrl: response.data.link,
            };
        }

        return {
            success: false,
            message: 'Erro ao publicar post',
        };
    } catch (error: any) {
        console.error('Erro ao publicar post:', error);

        if (error.response?.status === 401) {
            return {
                success: false,
                message: 'Credenciais inválidas',
            };
        }

        if (error.response?.status === 403) {
            return {
                success: false,
                message: 'Usuário sem permissão para publicar posts',
            };
        }

        return {
            success: false,
            message: error.message || 'Erro ao publicar post',
        };
    }
}

/**
 * Busca categorias do WordPress
 */
export async function getWordPressCategories(
    credentials: WordPressCredentials
): Promise<WordPressCategory[]> {
    try {
        const { url, username, password } = credentials;
        const cleanUrl = url.replace(/\/$/, '');
        const apiUrl = `${cleanUrl}/wp-json/wp/v2/categories?per_page=100`;

        const response = await axios.get(apiUrl, {
            auth: {
                username,
                password,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        return [];
    }
}

/**
 * Cria uma nova categoria no WordPress
 */
export async function createWordPressCategory(
    credentials: WordPressCredentials,
    categoryName: string
): Promise<{ success: boolean; categoryId?: number }> {
    try {
        const { url, username, password } = credentials;
        const cleanUrl = url.replace(/\/$/, '');
        const apiUrl = `${cleanUrl}/wp-json/wp/v2/categories`;

        const response = await axios.post(
            apiUrl,
            {
                name: categoryName,
                slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
            },
            {
                auth: {
                    username,
                    password,
                },
            }
        );

        return {
            success: true,
            categoryId: response.data.id,
        };
    } catch (error) {
        console.error('Erro ao criar categoria:', error);
        return { success: false };
    }
}

/**
 * Envolve o conteúdo HTML com estilos CSS inline
 */
function wrapContentWithStyles(content: string): string {
    const styles = `
    <style>
      .wp-ai-content {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      .wp-ai-content h1, .wp-ai-content h2, .wp-ai-content h3 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
        line-height: 1.3;
      }
      .wp-ai-content h1 { font-size: 2em; color: #1a202c; }
      .wp-ai-content h2 { font-size: 1.5em; color: #2d3748; }
      .wp-ai-content h3 { font-size: 1.25em; color: #4a5568; }
      .wp-ai-content p {
        margin-bottom: 1em;
      }
      .wp-ai-content ul, .wp-ai-content ol {
        margin-left: 1.5em;
        margin-bottom: 1em;
      }
      .wp-ai-content li {
        margin-bottom: 0.5em;
      }
      .wp-ai-content a {
        color: #3182ce;
        text-decoration: none;
      }
      .wp-ai-content a:hover {
        text-decoration: underline;
      }
      .wp-ai-content blockquote {
        border-left: 4px solid #e2e8f0;
        padding-left: 1em;
        margin: 1em 0;
        font-style: italic;
        color: #4a5568;
      }
      .wp-ai-content img {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
      }
      .wp-ai-content pre {
        background: #f7fafc;
        padding: 1em;
        border-radius: 4px;
        overflow-x: auto;
      }
      .wp-ai-content code {
        font-family: 'Courier New', Courier, monospace;
        background: #f7fafc;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-size: 0.9em;
      }
    </style>
  `;

    return `${styles}<div class="wp-ai-content">${content}</div>`;
}

/**
 * Busca posts do WordPress
 */
export async function getWordPressPosts(
    credentials: WordPressCredentials,
    params?: {
        page?: number
        perPage?: number
        status?: string
    }
): Promise<any[]> {
    try {
        const { url, username, password } = credentials;
        const cleanUrl = url.replace(/\/$/, '');

        const queryParams = new URLSearchParams({
            page: String(params?.page || 1),
            per_page: String(params?.perPage || 10),
            ...(params?.status && { status: params.status }),
        });

        const apiUrl = `${cleanUrl}/wp-json/wp/v2/posts?${queryParams}`;

        const response = await axios.get(apiUrl, {
            auth: {
                username,
                password,
            },
        });

        return response.data;
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        return [];
    }
}

/**
 * Atualiza um post existente
 */
export async function updateWordPressPost(
    credentials: WordPressCredentials,
    postId: number,
    post: Partial<WordPressPost>
): Promise<{ success: boolean; message: string }> {
    try {
        const { url, username, password } = credentials;
        const cleanUrl = url.replace(/\/$/, '');
        const apiUrl = `${cleanUrl}/wp-json/wp/v2/posts/${postId}`;

        const updateData: any = {};
        if (post.title) updateData.title = post.title;
        if (post.content) updateData.content = wrapContentWithStyles(post.content);
        if (post.status) updateData.status = post.status;
        if (post.categories) updateData.categories = post.categories;
        if (post.tags) updateData.tags = post.tags;

        const response = await axios.post(apiUrl, updateData, {
            auth: {
                username,
                password,
            },
        });

        return {
            success: true,
            message: 'Post atualizado com sucesso!',
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Erro ao atualizar post',
        };
    }
}

/**
 * Deleta um post
 */
export async function deleteWordPressPost(
    credentials: WordPressCredentials,
    postId: number
): Promise<{ success: boolean; message: string }> {
    try {
        const { url, username, password } = credentials;
        const cleanUrl = url.replace(/\/$/, '');
        const apiUrl = `${cleanUrl}/wp-json/wp/v2/posts/${postId}?force=true`;

        await axios.delete(apiUrl, {
            auth: {
                username,
                password,
            },
        });

        return {
            success: true,
            message: 'Post deletado com sucesso!',
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Erro ao deletar post',
        };
    }
}
