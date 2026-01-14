import type { Settings } from '../hooks/useSettings.js';

// Interfaces para tipagem
interface JwtAuthResponse {
    token?: string;
    [key: string]: any;
}

interface WpApiResponse {
    code?: string;
    message?: string;
    [key: string]: any;
}

interface WpUserResponse {
    name?: string;
    slug?: string;
    [key: string]: any;
}

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
            const data: JwtAuthResponse = await response.json();
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
            const data = await response.json().catch(() => ({ code: 'unknown', message: response.statusText })) as WpApiResponse;
            
            // Verificar se data é um objeto antes de acessar propriedades
            let errorMessage = '';
            const responseData: WpApiResponse = typeof data === 'object' && data !== null ? data : { code: 'unknown', message: response.statusText };

            if (responseData.code === 'rest_cannot_edit') {
                errorMessage = "Usuário não tem permissão para editar posts.";
            } else if (responseData.code === 'rest_not_logged_in' || response.status === 401) {
                errorMessage = "⛔ Falha na Autenticação: O servidor recusou as credenciais.\n1. Tente remover espaços da senha.\n2. Verifique se você criou uma Senha de Aplicativo (não é a senha de login).\n3. Se usa Nginx/Easypanel, o header Authorization está sendo bloqueado (veja instruções na aba de Integrações).\n4. Tente usar a senha de login real em vez da senha de aplicativo (para teste JWT).";
            } else if (responseData.code === 'rest_user_invalid_id') {
                errorMessage = "Usuário inválido.";
            } else if (responseData.code === 'rest_forbidden_context') {
                errorMessage = "Acesso negado. Verifique as permissões do usuário no WordPress.";
            } else if (responseData.code === 'rest_no_route') {
                errorMessage = "Rota da API não encontrada. Verifique se o WordPress REST API está ativado.";
            }

            return { success: false, message: errorMessage || `Erro na conexão: ${responseData.message || response.statusText}` };
        }

        const userData: WpUserResponse = await response.json();
        // Verificar se userData é um objeto antes de acessar propriedades
        return { success: true, message: `Conectado com sucesso como ${userData.name || userData.slug || 'usuário'}!` };

    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return { success: false, message: 'Erro de rede: Não foi possível conectar ao servidor WordPress. Verifique a URL e sua conexão de internet.' };
        }
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao validar credenciais.' };
    }
};

// Função para testar conexão com API WordPress
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
            const data = await response.json().catch(() => ({ code: 'unknown', message: response.statusText })) as WpApiResponse;
            let errorMessage = '';

            if (data.code === 'rest_cannot_edit') {
                errorMessage = "Usuário não tem permissão para editar posts.";
            } else if (data.code === 'rest_not_logged_in' || response.status === 401) {
                errorMessage = "⛔ Falha na Autenticação: O servidor recusou as credenciais.\n1. Tente remover espaços da senha.\n2. Verifique se você criou uma Senha de Aplicativo (não é a senha de login).\n3. Se usa Nginx/Easypanel, o header Authorization está sendo bloqueado (veja instruções na aba de Integrações).\n4. Tente usar a senha de login real em vez da senha de aplicativo (para teste JWT).";
            } else if (data.code === 'rest_user_invalid_id') {
                errorMessage = "Usuário inválido.";
            } else if (data.code === 'rest_forbidden_context') {
                errorMessage = "Acesso negado. Verifique as permissões do usuário no WordPress.";
            } else if (data.code === 'rest_no_route') {
                errorMessage = "Rota da API não encontrada. Verifique se o WordPress REST API está ativado.";
            }

            return { success: false, message: errorMessage || `Erro na conexão: ${data.message || response.statusText}` };
        }

        return { success: true, message: "Conexão com a API do WordPress estabelecida com sucesso!" };

    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return { success: false, message: 'Erro de rede: Não foi possível conectar ao servidor WordPress. Verifique a URL e sua conexão de internet.' };
        }
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao validar credenciais.' };
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
            const errorData = await response.json().catch(() => ({ message: response.statusText })) as { message?: string };
            return { success: false, message: `Falha ao publicar: ${errorData.message || response.statusText}` };
        }

        const data = await response.json();
        const responseData = typeof data === 'object' && data !== null ? data : {};
        return { 
            success: true, 
            message: status === 'draft' ? 'Post salvo como rascunho!' : 
                     status === 'future' ? 'Post agendado com sucesso!' : 
                     'Post publicado com sucesso!', 
            postLink: (responseData as any).link 
        };

    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao publicar.' };
    }
};

// Função para obter categorias do WordPress
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
            const errorData = await response.json().catch(() => ({ message: response.statusText })) as { message?: string };
            return { success: false, message: `Falha ao buscar categorias: ${errorData.message || response.statusText}` };
        }

        const categories = await response.json();
        const categoriesData = Array.isArray(categories) ? categories : [];
        return { success: true, categories: categoriesData };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao buscar categorias.' };
    }
};

// Função para criar uma categoria do WordPress
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
            const errorData = await response.json().catch(() => ({ message: response.statusText })) as { message?: string };
            return { success: false, message: `Falha ao criar categoria: ${errorData.message || response.statusText}` };
        }

        const category = await response.json();
        const categoryData = typeof category === 'object' && category !== null ? category : {};
        return { success: true, categoryId: (categoryData as any).id };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao criar categoria.' };
    }
};

// Função para obter tags do WordPress
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
            const errorData = await response.json().catch(() => ({ message: response.statusText })) as { message?: string };
            return { success: false, message: `Falha ao buscar tags: ${errorData.message || response.statusText}` };
        }

        const tags = await response.json();
        const tagsData = Array.isArray(tags) ? tags : [];
        return { success: true, tags: tagsData };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao buscar tags.' };
    }
};

// Função para criar uma tag do WordPress
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
            const errorData = await response.json().catch(() => ({ message: response.statusText })) as { message?: string };
            return { success: false, message: `Falha ao criar tag: ${errorData.message || response.statusText}` };
        }

        const tag = await response.json();
        const tagData = typeof tag === 'object' && tag !== null ? tag : {};
        return { success: true, tagId: (tagData as any).id };
    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao criar tag.' };
    }
};

// Função para obter estatísticas do WordPress
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
        const recentPostsData = Array.isArray(recentPosts) ? recentPosts : [];

        return {
            success: true,
            stats: {
                totalPosts,
                totalCategories,
                totalTags,
                totalComments,
                recentPosts: recentPostsData.map((post: any) => ({
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

// Função para enviar mídia para o WordPress
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
            const errorData = await response.json().catch(() => ({ message: response.statusText })) as { message?: string };
            return { success: false, message: `Falha ao enviar mídia: ${errorData.message || response.statusText}` };
        }

        const data = await response.json();
        const mediaData = typeof data === 'object' && data !== null ? data : {};
        return { success: true, mediaId: (mediaData as any).id };

    } catch (error) {
        return { success: false, message: error instanceof Error ? error.message : 'Erro desconhecido ao enviar mídia.' };
    }
};

// Função para testar diferentes métodos de autenticação do WordPress
export const testWordPressAuthenticationMethods = async (settings: { wordpressUrl: string; wordpressUsername: string; wordpressAppPassword: string }): Promise<{ success: boolean; method: 'basic' | 'jwt' | 'none'; message: string }> => {
    if (!settings.wordpressUrl || !settings.wordpressUsername || !settings.wordpressAppPassword) {
        return { success: false, method: 'none', message: "Credenciais incompletas." };
    }

    const { cleanUrl, cleanPassword } = sanitizeCredentials(settings);
    const basicAuth = btoa(`${settings.wordpressUsername}:${cleanPassword}`);

    // Teste 1: Tentar autenticação básica
    try {
        const basicAuthResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
            },
        });

        if (basicAuthResponse.ok) {
            const userData = await basicAuthResponse.json();
            const userResponse = typeof userData === 'object' && userData !== null ? userData : {};
            return { 
                success: true, 
                method: 'basic', 
                message: `Autenticação Básica funcionando. Conectado como ${(userResponse as any).name || (userResponse as any).slug || 'usuário'}!` 
            };
        }
    } catch (error) {
        console.warn("Falha na autenticação básica:", error);
    }

    // Teste 2: Tentar autenticação JWT
    try {
        const jwtToken = await tryGetJwtToken(cleanUrl, settings.wordpressUsername, cleanPassword);
        if (jwtToken) {
            const jwtResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/users/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (jwtResponse.ok) {
                const userData = await jwtResponse.json();
                const userResponse = typeof userData === 'object' && userData !== null ? userData : {};
                return { 
                    success: true, 
                    method: 'jwt', 
                    message: `Autenticação JWT funcionando. Conectado como ${(userResponse as any).name || (userResponse as any).slug || 'usuário'}!` 
                };
            }
        }
    } catch (error) {
        console.warn("Falha na autenticação JWT:", error);
    }

    // Se ambos falharem, verificar o tipo de erro
    try {
        const basicAuthResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${basicAuth}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await basicAuthResponse.json().catch(() => ({ code: 'unknown', message: basicAuthResponse.statusText })) as WpApiResponse;
        let errorMessage = '';

        if (data.code === 'rest_cannot_edit') {
            errorMessage = "Usuário não tem permissão para editar posts.";
        } else if (data.code === 'rest_not_logged_in' || basicAuthResponse.status === 401) {
            errorMessage = "Falha na autenticação. Possíveis causas:\n1. Senha de aplicativo incorreta\n2. Servidor bloqueando cabeçalho Authorization (Apache/Nginx)\n3. Plugin de segurança bloqueando API REST\n4. Verifique as instruções na aba de Integrações";
        } else if (data.code === 'rest_user_invalid_id') {
            errorMessage = "Usuário inválido.";
        } else if (data.code === 'rest_forbidden_context') {
            errorMessage = "Acesso negado. Verifique as permissões do usuário no WordPress.";
        } else if (data.code === 'rest_no_route') {
            errorMessage = "Rota da API não encontrada. Verifique se o WordPress REST API está ativado.";
        }

        return { 
            success: false, 
            method: 'none', 
            message: errorMessage || `Erro na conexão: ${data.message || basicAuthResponse.statusText}` 
        };
    } catch (error) {
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return { 
                success: false, 
                method: 'none', 
                message: 'Erro de rede: Não foi possível conectar ao servidor WordPress. Verifique a URL e sua conexão de internet.' 
            };
        }
        return { 
            success: false, 
            method: 'none', 
            message: error instanceof Error ? error.message : 'Erro desconhecido durante o teste de autenticação.' 
        };
    }
};
