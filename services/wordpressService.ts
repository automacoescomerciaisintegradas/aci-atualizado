import type { Settings } from '../hooks/useSettings.js';

// Helper to sanitize credentials
const sanitizeCredentials = (settings: { wordpressUrl: string; wordpressUsername: string; wordpressAppPassword: string }) => {
    let cleanUrl = settings.wordpressUrl.trim().replace(/\/+$/, "");
    if (!cleanUrl.startsWith('http')) {
        cleanUrl = 'https://' + cleanUrl;
    }
    const cleanPassword = settings.wordpressAppPassword.replace(/\s+/g, '');
    return { cleanUrl, cleanPassword };
};

// Helper to try JWT authentication
const tryGetJwtToken = async (url: string, username: string, password: string): Promise<string | null> => {
    try {
        console.log("Tentando autenticação JWT...");
        const response = await fetch(`${url}/wp-json/jwt-auth/v1/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            return data.token || null;
        }
    } catch (e) {
        console.warn("Falha ao obter token JWT:", e);
    }
    return null;
};

export const validateWordPressCredentials = async (settings: { wordpressUrl: string; wordpressUsername: string; wordpressAppPassword: string }): Promise<{ success: boolean; message: string }> => {
    if (!settings.wordpressUrl || !settings.wordpressUsername || !settings.wordpressAppPassword) {
        return { success: false, message: "Credenciais incompletas." };
    }

    const { cleanUrl, cleanPassword } = sanitizeCredentials(settings);
    const basicAuth = btoa(`${settings.wordpressUsername}:${cleanPassword}`);

    try {
        // 1. Try Basic Auth
        let response = await fetch(`${cleanUrl}/wp-json/wp/v2/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
            },
        });

        // 2. Fallback to JWT if 401
        if (response.status === 401) {
            const token = await tryGetJwtToken(cleanUrl, settings.wordpressUsername, cleanPassword);
            if (token) {
                response = await fetch(`${cleanUrl}/wp-json/wp/v2/users/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });
            }
        }

        if (!response.ok) {
            const data = await response.json().catch(() => ({ code: 'unknown', message: response.statusText }));
            let errorMessage = '';

            if (data.code === 'rest_cannot_edit') {
                errorMessage = "Usuário não tem permissão para editar posts.";
            } else if (data.code === 'rest_not_logged_in' || response.status === 401) {
                errorMessage = "⛔ Falha na Autenticação: O servidor recusou as credenciais.\n1. Tente remover espaços da senha.\n2. Se usa Nginx/Easypanel, o header Authorization está sendo bloqueado.\n3. Tente usar a senha de login real em vez da senha de aplicativo (para teste JWT).";
            } else if (data.code === 'rest_user_invalid_id') {
                errorMessage = "Usuário inválido.";
            }

            return { success: false, message: errorMessage || `Erro na conexão: ${data.message || response.statusText}` };
        }

        const userData = await response.json();
        return { success: true, message: `Conectado com sucesso como ${userData.name || userData.slug}!` };

    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro de rede ou URL inválida.' };
    }
};

// Function to test WordPress REST API connection
export const testWordPressApiConnection = async (settings: { wordpressUrl: string; wordpressUsername: string; wordpressAppPassword: string }): Promise<{ success: boolean; message: string }> => {
    if (!settings.wordpressUrl || !settings.wordpressUsername || !settings.wordpressAppPassword) {
        return { success: false, message: "Credenciais incompletas." };
    }

    const { cleanUrl, cleanPassword } = sanitizeCredentials(settings);
    const basicAuth = btoa(`${settings.wordpressUsername}:${cleanPassword}`);

    try {
        // Test connection to WordPress REST API
        const response = await fetch(`${cleanUrl}/wp-json/wp/v2/posts?per_page=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const data = await response.json().catch(() => ({ code: 'unknown', message: response.statusText }));
            let errorMessage = '';

            if (data.code === 'rest_cannot_edit') {
                errorMessage = "Usuário não tem permissão para editar posts.";
            } else if (data.code === 'rest_not_logged_in' || response.status === 401) {
                errorMessage = "⛔ Falha na Autenticação: O servidor recusou as credenciais.\n1. Tente remover espaços da senha.\n2. Se usa Nginx/Easypanel, o header Authorization está sendo bloqueado.\n3. Tente usar a senha de login real em vez da senha de aplicativo (para teste JWT).";
            } else if (data.code === 'rest_user_invalid_id') {
                errorMessage = "Usuário inválido.";
            }

            return { success: false, message: errorMessage || `Erro na conexão: ${data.message || response.statusText}` };
        }

        return { success: true, message: "Conexão com a API do WordPress estabelecida com sucesso!" };

    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro de rede ou URL inválida.' };
    }
};

export const publishToWordPress = async (
    settings: Pick<Settings, 'wordpressUrl' | 'wordpressUsername' | 'wordpressAppPassword'>, 
    title: string, 
    content: string, 
    css: string, 
    status: 'draft' | 'publish' | 'future' = 'publish',
    categories?: number[],
    tags?: number[],
    featuredMedia?: number,
    scheduledDate?: string
): Promise<{ success: boolean; message: string; postLink?: string }> => {
    if (!settings.wordpressUrl || !settings.wordpressUsername || !settings.wordpressAppPassword) {
        return { success: false, message: 'Configurações do WordPress não encontradas.' };
    }

    const { cleanUrl, cleanPassword } = sanitizeCredentials(settings);
    const basicAuth = btoa(`${settings.wordpressUsername}:${cleanPassword}`);

    // Combine CSS and content
    const finalContent = css ? `<style>${css}</style>\n${content}` : content;

    // Prepare post data
    const postData: any = {
        title,
        content: finalContent,
        status,
    };

    // Add scheduled date if provided and status is future
    if (scheduledDate && status === 'future') {
        postData.date = scheduledDate;
    }

    // Add categories if provided
    if (categories && categories.length > 0) {
        postData.categories = categories;
    }

    // Add tags if provided
    if (tags && tags.length > 0) {
        postData.tags = tags;
    }

    // Add featured media if provided
    if (featuredMedia) {
        postData.featured_media = featuredMedia;
    }

    const makeRequest = async (token?: string) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            headers['Authorization'] = `Basic ${basicAuth}`;
        }

        return fetch(`${cleanUrl}/wp-json/wp/v2/posts`, {
            method: 'POST',
            headers,
            body: JSON.stringify(postData),
        });
    };

    try {
        // 1. Try Basic Auth
        let response = await makeRequest();

        // 2. Fallback to JWT if 401
        if (response.status === 401) {
            const token = await tryGetJwtToken(cleanUrl, settings.wordpressUsername, cleanPassword);
            if (token) {
                response = await makeRequest(token);
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            return { success: false, message: `Falha ao publicar: ${errorData.message}` };
        }

        const data = await response.json();
        return { 
            success: true, 
            message: status === 'draft' ? 'Post salvo como rascunho!' : 
                     status === 'future' ? 'Post agendado com sucesso!' : 
                     'Post publicado com sucesso!', 
            postLink: data.link 
        };

    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao publicar.' };
    }
};

// Function to get WordPress categories
export const getWordPressCategories = async (
    settings: Pick<Settings, 'wordpressUrl' | 'wordpressUsername' | 'wordpressAppPassword'>
): Promise<{ success: boolean; categories?: any[]; message?: string }> => {
    if (!settings.wordpressUrl || !settings.wordpressUsername || !settings.wordpressAppPassword) {
        return { success: false, message: 'Configurações do WordPress não encontradas.' };
    }

    const { cleanUrl, cleanPassword } = sanitizeCredentials(settings);
    const basicAuth = btoa(`${settings.wordpressUsername}:${cleanPassword}`);

    const makeRequest = async (token?: string) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            headers['Authorization'] = `Basic ${basicAuth}`;
        }

        return fetch(`${cleanUrl}/wp-json/wp/v2/categories?per_page=100`, {
            method: 'GET',
            headers,
        });
    };

    try {
        // 1. Try Basic Auth
        let response = await makeRequest();

        // 2. Fallback to JWT if 401
        if (response.status === 401) {
            const token = await tryGetJwtToken(cleanUrl, settings.wordpressUsername, cleanPassword);
            if (token) {
                response = await makeRequest(token);
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            return { success: false, message: `Falha ao buscar categorias: ${errorData.message}` };
        }

        const categories = await response.json();
        return { success: true, categories };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao buscar categorias.' };
    }
};

// Function to create a WordPress category
export const createWordPressCategory = async (
    settings: Pick<Settings, 'wordpressUrl' | 'wordpressUsername' | 'wordpressAppPassword'>,
    categoryName: string
): Promise<{ success: boolean; categoryId?: number; message?: string }> => {
    if (!settings.wordpressUrl || !settings.wordpressUsername || !settings.wordpressAppPassword) {
        return { success: false, message: 'Configurações do WordPress não encontradas.' };
    }

    const { cleanUrl, cleanPassword } = sanitizeCredentials(settings);
    const basicAuth = btoa(`${settings.wordpressUsername}:${cleanPassword}`);

    const makeRequest = async (token?: string) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            headers['Authorization'] = `Basic ${basicAuth}`;
        }

        return fetch(`${cleanUrl}/wp-json/wp/v2/categories`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: categoryName }),
        });
    };

    try {
        // 1. Try Basic Auth
        let response = await makeRequest();

        // 2. Fallback to JWT if 401
        if (response.status === 401) {
            const token = await tryGetJwtToken(cleanUrl, settings.wordpressUsername, cleanPassword);
            if (token) {
                response = await makeRequest(token);
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            return { success: false, message: `Falha ao criar categoria: ${errorData.message}` };
        }

        const category = await response.json();
        return { success: true, categoryId: category.id };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao criar categoria.' };
    }
};

// Function to get WordPress tags
export const getWordPressTags = async (
    settings: Pick<Settings, 'wordpressUrl' | 'wordpressUsername' | 'wordpressAppPassword'>
): Promise<{ success: boolean; tags?: any[]; message?: string }> => {
    if (!settings.wordpressUrl || !settings.wordpressUsername || !settings.wordpressAppPassword) {
        return { success: false, message: 'Configurações do WordPress não encontradas.' };
    }

    const { cleanUrl, cleanPassword } = sanitizeCredentials(settings);
    const basicAuth = btoa(`${settings.wordpressUsername}:${cleanPassword}`);

    const makeRequest = async (token?: string) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            headers['Authorization'] = `Basic ${basicAuth}`;
        }

        return fetch(`${cleanUrl}/wp-json/wp/v2/tags?per_page=100`, {
            method: 'GET',
            headers,
        });
    };

    try {
        // 1. Try Basic Auth
        let response = await makeRequest();

        // 2. Fallback to JWT if 401
        if (response.status === 401) {
            const token = await tryGetJwtToken(cleanUrl, settings.wordpressUsername, cleanPassword);
            if (token) {
                response = await makeRequest(token);
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            return { success: false, message: `Falha ao buscar tags: ${errorData.message}` };
        }

        const tags = await response.json();
        return { success: true, tags };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao buscar tags.' };
    }
};

// Function to create a WordPress tag
export const createWordPressTag = async (
    settings: Pick<Settings, 'wordpressUrl' | 'wordpressUsername' | 'wordpressAppPassword'>,
    tagName: string
): Promise<{ success: boolean; tagId?: number; message?: string }> => {
    if (!settings.wordpressUrl || !settings.wordpressUsername || !settings.wordpressAppPassword) {
        return { success: false, message: 'Configurações do WordPress não encontradas.' };
    }

    const { cleanUrl, cleanPassword } = sanitizeCredentials(settings);
    const basicAuth = btoa(`${settings.wordpressUsername}:${cleanPassword}`);

    const makeRequest = async (token?: string) => {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            headers['Authorization'] = `Basic ${basicAuth}`;
        }

        return fetch(`${cleanUrl}/wp-json/wp/v2/tags`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: tagName }),
        });
    };

    try {
        // 1. Try Basic Auth
        let response = await makeRequest();

        // 2. Fallback to JWT if 401
        if (response.status === 401) {
            const token = await tryGetJwtToken(cleanUrl, settings.wordpressUsername, cleanPassword);
            if (token) {
                response = await makeRequest(token);
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            return { success: false, message: `Falha ao criar tag: ${errorData.message}` };
        }

        const tag = await response.json();
        return { success: true, tagId: tag.id };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao criar tag.' };
    }
};

// Function to get WordPress stats
export const getWordPressStats = async (
    settings: Pick<Settings, 'wordpressUrl' | 'wordpressUsername' | 'wordpressAppPassword'>
): Promise<{ success: boolean; stats?: any; message?: string }> => {
    if (!settings.wordpressUrl || !settings.wordpressUsername || !settings.wordpressAppPassword) {
        return { success: false, message: 'Configurações do WordPress não encontradas.' };
    }

    const { cleanUrl, cleanPassword } = sanitizeCredentials(settings);
    const basicAuth = btoa(`${settings.wordpressUsername}:${cleanPassword}`);

    try {
        // Get posts count
        const postsResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/posts?per_page=1&page=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
            },
        });

        if (!postsResponse.ok) {
            throw new Error('Falha ao buscar posts');
        }

        // Get total posts count from headers
        const totalPosts = parseInt(postsResponse.headers.get('X-WP-Total') || '0');

        // Get categories count
        const categoriesResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/categories?per_page=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
            },
        });

        if (!categoriesResponse.ok) {
            throw new Error('Falha ao buscar categorias');
        }

        const totalCategories = parseInt(categoriesResponse.headers.get('X-WP-Total') || '0');

        // Get tags count
        const tagsResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/tags?per_page=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
            },
        });

        if (!tagsResponse.ok) {
            throw new Error('Falha ao buscar tags');
        }

        const totalTags = parseInt(tagsResponse.headers.get('X-WP-Total') || '0');

        // Get comments count
        const commentsResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/comments?per_page=1`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
            },
        });

        if (!commentsResponse.ok) {
            throw new Error('Falha ao buscar comentários');
        }

        const totalComments = parseInt(commentsResponse.headers.get('X-WP-Total') || '0');

        // Get recent posts for preview
        const recentPostsResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/posts?per_page=5&_embed`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
            },
        });

        if (!recentPostsResponse.ok) {
            throw new Error('Falha ao buscar posts recentes');
        }

        const recentPosts = await recentPostsResponse.json();

        return {
            success: true,
            stats: {
                totalPosts,
                totalCategories,
                totalTags,
                totalComments,
                recentPosts: recentPosts.map((post: any) => ({
                    id: post.id,
                    title: post.title?.rendered || 'Sem título',
                    date: post.date,
                    link: post.link,
                    excerpt: post.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 100) + '...' || ''
                }))
            }
        };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao buscar estatísticas.' };
    }
};

// Function to upload media to WordPress
export const uploadMediaToWordPress = async (
    settings: Pick<Settings, 'wordpressUrl' | 'wordpressUsername' | 'wordpressAppPassword'>,
    file: File
): Promise<{ success: boolean; mediaId?: number; message?: string }> => {
    if (!settings.wordpressUrl || !settings.wordpressUsername || !settings.wordpressAppPassword) {
        return { success: false, message: 'Configurações do WordPress não encontradas.' };
    }

    const { cleanUrl, cleanPassword } = sanitizeCredentials(settings);
    const basicAuth = btoa(`${settings.wordpressUsername}:${cleanPassword}`);

    const makeRequest = async (token?: string) => {
        const headers: any = {
            'Content-Disposition': `attachment; filename="${file.name}"`,
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            headers['Authorization'] = `Basic ${basicAuth}`;
        }

        // Convert file to binary data
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        return fetch(`${cleanUrl}/wp-json/wp/v2/media`, {
            method: 'POST',
            headers,
            body: uint8Array,
        });
    };

    try {
        // 1. Try Basic Auth
        let response = await makeRequest();

        // 2. Fallback to JWT if 401
        if (response.status === 401) {
            const token = await tryGetJwtToken(cleanUrl, settings.wordpressUsername, cleanPassword);
            if (token) {
                response = await makeRequest(token);
            }
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            return { success: false, message: `Falha ao enviar mídia: ${errorData.message}` };
        }

        const data = await response.json();
        return { success: true, mediaId: data.id };

    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao enviar mídia.' };
    }
};