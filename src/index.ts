/**
 * Cloudflare Worker - ACI Platform API
 * Fornece APIs REST para o frontend React acessar o D1 Database
 */

import { D1Client } from './services/d1Client';
import { D1Auth } from './services/d1Auth';
import { PasswordResetService } from './services/passwordReset';
import { handleCORS, jsonResponse, errorResponse } from './utils/http';
import { detectDeviceType, detectBrowser, detectOS } from './utils/userAgent';

export interface Env {
    DB: D1Database;
    STORAGE: R2Bucket;
    ENVIRONMENT: string;
    R2_PUBLIC_URL: string;
    SMTP_USERNAME: string;
    SMTP_PASSWORD: string;
    FRONTEND_URL: string;
    RESEND_API_KEY: string;
    FACEBOOK_APP_ID?: string;
    FACEBOOK_APP_SECRET?: string;
}

export default {
    async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
        // Handle CORS preflight
        if (request.method === 'OPTIONS') {
            return handleCORS();
        }

        const url = new URL(request.url);
        const path = url.pathname;

        try {
            // Inicializar cliente D1
            const db = new D1Client(env.DB);
            const auth = new D1Auth(db);

            // Rotas de autenticação
            if (path === '/api/auth/signup' && request.method === 'POST') {
                const { email, password, metadata } = await request.json() as any;
                const result = await auth.signUp(email, password, metadata);
                return jsonResponse(result);
            }

            if (path === '/api/auth/login' && request.method === 'POST') {
                const { email, password } = await request.json() as any;
                const result = await auth.signIn(email, password);
                return jsonResponse(result);
            }

            if (path === '/api/auth/user' && request.method === 'GET') {
                const userId = url.searchParams.get('id');
                if (!userId) {
                    return errorResponse('User ID required', 400);
                }
                const user = await auth.getUser(userId);
                return jsonResponse({ success: true, user });
            }

            if (path === '/api/auth/profile' && request.method === 'PUT') {
                const { userId, ...data } = await request.json() as any;
                const result = await auth.updateProfile(userId, data);
                return jsonResponse(result);
            }

            // ==========================================
            // ROTAS DE RESET DE SENHA
            // ==========================================

            // Solicitar reset de senha
            if (path === '/api/auth/forgot-password' && request.method === 'POST') {
                const { email } = await request.json() as any;

                if (!email) {
                    return errorResponse('Email required', 400);
                }

                const passwordReset = new PasswordResetService(db, env.FRONTEND_URL || 'http://localhost:3000', {
                    SMTP_HOST: 'smtp.gmail.com',
                    SMTP_PORT: 587,
                    SMTP_USERNAME: env.SMTP_USERNAME || 'automacoescomerciais@gmail.com',
                    SMTP_PASSWORD: env.SMTP_PASSWORD || '',
                    SMTP_SENDER: 'ACI Automações Comerciais <automacoescomerciais@gmail.com>',
                    RESEND_API_KEY: env.RESEND_API_KEY,
                });

                const result = await passwordReset.requestReset(email);
                return jsonResponse(result);
            }

            // Verificar token de reset
            if (path === '/api/auth/verify-reset-token' && request.method === 'POST') {
                const { token } = await request.json() as any;

                if (!token) {
                    return errorResponse('Token required', 400);
                }

                const passwordReset = new PasswordResetService(db, env.FRONTEND_URL || 'http://localhost:3000', {
                    SMTP_HOST: 'smtp.gmail.com',
                    SMTP_PORT: 587,
                    SMTP_USERNAME: env.SMTP_USERNAME || '',
                    SMTP_PASSWORD: env.SMTP_PASSWORD || '',
                    SMTP_SENDER: '',
                });

                const result = await passwordReset.verifyToken(token);
                return jsonResponse(result);
            }

            // Resetar senha
            if (path === '/api/auth/reset-password' && request.method === 'POST') {
                const { token, newPassword } = await request.json() as any;

                if (!token || !newPassword) {
                    return errorResponse('Token and new password required', 400);
                }

                if (newPassword.length < 6) {
                    return errorResponse('Password must be at least 6 characters', 400);
                }

                const passwordReset = new PasswordResetService(db, env.FRONTEND_URL || 'http://localhost:3000', {
                    SMTP_HOST: 'smtp.gmail.com',
                    SMTP_PORT: 587,
                    SMTP_USERNAME: env.SMTP_USERNAME || '',
                    SMTP_PASSWORD: env.SMTP_PASSWORD || '',
                    SMTP_SENDER: '',
                });

                const result = await passwordReset.resetPassword(token, newPassword);
                return jsonResponse(result);
            }

            // Rotas de créditos
            if (path === '/api/credits/balance' && request.method === 'GET') {
                const userId = url.searchParams.get('userId');
                if (!userId) {
                    return errorResponse('User ID required', 400);
                }

                const credits = await db.first(
                    'SELECT * FROM user_credits WHERE user_id = ?',
                    [userId]
                );
                return jsonResponse({ success: true, credits });
            }

            if (path === '/api/credits/transactions' && request.method === 'GET') {
                const userId = url.searchParams.get('userId');
                if (!userId) {
                    return errorResponse('User ID required', 400);
                }

                const transactions = await db.query(
                    'SELECT * FROM credit_transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
                    [userId]
                );
                return jsonResponse({ success: true, transactions });
            }

            // Rotas de pacotes
            if (path === '/api/packages' && request.method === 'GET') {
                const packages = await db.query(
                    'SELECT * FROM credit_packages WHERE is_active = 1 ORDER BY credits ASC'
                );
                return jsonResponse({ success: true, packages });
            }

            // Rotas de WordPress
            if (path === '/api/wordpress/connections' && request.method === 'GET') {
                const userId = url.searchParams.get('userId');
                if (!userId) {
                    return errorResponse('User ID required', 400);
                }

                const connections = await db.query(
                    'SELECT * FROM wordpress_connections WHERE user_id = ? ORDER BY created_at DESC',
                    [userId]
                );
                return jsonResponse({ success: true, connections });
            }

            if (path === '/api/wordpress/connection' && request.method === 'POST') {
                const { userId, name, site_url, username, application_password } = await request.json() as any;

                const id = crypto.randomUUID();
                const now = new Date().toISOString();

                await db.execute(
                    `INSERT INTO wordpress_connections (id, user_id, name, site_url, username, application_password, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [id, userId, name, site_url, username, application_password, now, now]
                );

                const connection = await db.first(
                    'SELECT * FROM wordpress_connections WHERE id = ?',
                    [id]
                );

                return jsonResponse({ success: true, connection });
            }

            // Rotas de API Keys
            if (path === '/api/keys' && request.method === 'GET') {
                const userId = url.searchParams.get('userId');
                if (!userId) {
                    return errorResponse('User ID required', 400);
                }

                const keys = await db.query(
                    'SELECT * FROM api_keys WHERE user_id = ? ORDER BY created_at DESC',
                    [userId]
                );
                return jsonResponse({ success: true, keys });
            }

            if (path === '/api/keys' && request.method === 'POST') {
                const { userId, service, key_name, api_key } = await request.json() as any;

                const id = crypto.randomUUID();
                const now = new Date().toISOString();

                await db.execute(
                    `INSERT INTO api_keys (id, user_id, service, key_name, api_key, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [id, userId, service, key_name, api_key, now, now]
                );

                const key = await db.first(
                    'SELECT * FROM api_keys WHERE id = ?',
                    [id]
                );

                return jsonResponse({ success: true, key });
            }

            // ==========================================
            // ROTAS DE AVATAR (R2)
            // ==========================================

            // Upload de avatar
            if (path === '/api/avatar/upload' && request.method === 'POST') {
                const formData = await request.formData();
                const file = formData.get('file') as File;
                const userId = formData.get('userId') as string;

                if (!file || !userId) {
                    return errorResponse('File and userId required', 400);
                }

                // Gerar nome do arquivo
                const fileExt = file.name.split('.').pop() || 'jpg';
                const fileName = `avatars/${userId}/avatar.${fileExt}`;

                // Upload para R2
                await env.STORAGE.put(fileName, file.stream(), {
                    httpMetadata: {
                        contentType: file.type,
                    },
                });

                // Gerar URL pública usando a variável de ambiente
                const avatarUrl = `${env.R2_PUBLIC_URL}/aci-storage/${fileName}`;

                // Atualizar perfil
                await db.execute(
                    'UPDATE profiles SET avatar_url = ?, updated_at = ? WHERE id = ?',
                    [avatarUrl, new Date().toISOString(), userId]
                );

                return jsonResponse({
                    success: true,
                    avatarUrl,
                    message: 'Avatar uploaded successfully'
                });
            }

            // Obter avatar
            if (path.startsWith('/api/avatar/') && request.method === 'GET') {
                const pathParts = path.split('/');
                const userId = pathParts[3];

                if (!userId) {
                    return errorResponse('User ID required', 400);
                }

                // Tentar buscar avatar
                const avatarKey = `avatars/${userId}/avatar.jpg`;
                const object = await env.STORAGE.get(avatarKey);

                if (!object) {
                    // Tentar outras extensões
                    const extensions = ['png', 'webp', 'gif'];
                    for (const ext of extensions) {
                        const altKey = `avatars/${userId}/avatar.${ext}`;
                        const altObject = await env.STORAGE.get(altKey);
                        if (altObject) {
                            const headers = new Headers();
                            altObject.writeHttpMetadata(headers);
                            headers.set('etag', altObject.httpEtag);
                            return new Response(altObject.body, { headers });
                        }
                    }
                    return errorResponse('Avatar not found', 404);
                }

                const headers = new Headers();
                object.writeHttpMetadata(headers);
                headers.set('etag', object.httpEtag);
                return new Response(object.body, { headers });
            }

            // ==========================================
            // ROTAS DE SESSÕES
            // ==========================================

            // Listar sessões
            if (path === '/api/sessions' && request.method === 'GET') {
                const userId = url.searchParams.get('userId');
                if (!userId) {
                    return errorResponse('User ID required', 400);
                }

                const sessions = await db.query(
                    `SELECT * FROM user_sessions 
                     WHERE user_id = ? 
                     ORDER BY started_at DESC 
                     LIMIT 10`,
                    [userId]
                );
                return jsonResponse({ success: true, sessions });
            }

            // Criar sessão (chamado no login)
            if (path === '/api/sessions' && request.method === 'POST') {
                const { userId, userAgent, ipAddress } = await request.json() as any;

                if (!userId) {
                    return errorResponse('User ID required', 400);
                }

                // Detectar tipo de dispositivo
                const deviceType = detectDeviceType(userAgent || '');
                const browser = detectBrowser(userAgent || '');
                const os = detectOS(userAgent || '');

                const id = crypto.randomUUID();
                const now = new Date().toISOString();

                await db.execute(
                    `INSERT INTO user_sessions 
                     (id, user_id, ip_address, user_agent, device_type, browser, os, started_at, last_activity_at, is_active)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
                    [id, userId, ipAddress || null, userAgent || null, deviceType, browser, os, now, now]
                );

                const session = await db.first(
                    'SELECT * FROM user_sessions WHERE id = ?',
                    [id]
                );

                return jsonResponse({ success: true, session });
            }

            // Atualizar atividade da sessão
            if (path === '/api/sessions/activity' && request.method === 'PUT') {
                const { sessionId } = await request.json() as any;

                if (!sessionId) {
                    return errorResponse('Session ID required', 400);
                }

                await db.execute(
                    'UPDATE user_sessions SET last_activity_at = ? WHERE id = ?',
                    [new Date().toISOString(), sessionId]
                );

                return jsonResponse({ success: true });
            }

            // Encerrar sessão
            if (path === '/api/sessions/end' && request.method === 'PUT') {
                const { sessionId } = await request.json() as any;

                if (!sessionId) {
                    return errorResponse('Session ID required', 400);
                }

                await db.execute(
                    'UPDATE user_sessions SET ended_at = ?, is_active = 0 WHERE id = ?',
                    [new Date().toISOString(), sessionId]
                );

                return jsonResponse({ success: true });
            }

            // ==========================================
            // ROTAS DE INTEGRAÇÃO INSTAGRAM
            // ==========================================

            // Iniciar conexão Instagram/Facebook
            if (path === '/api/integrations/instagram/auth' && request.method === 'GET') {
                const userId = request.headers.get('X-User-Id');

                if (!userId) {
                    return errorResponse('User ID required', 401);
                }

                // Configurações do Facebook App (você precisa criar um app em developers.facebook.com)
                const appId = env.FACEBOOK_APP_ID || '';
                const redirectUri = encodeURIComponent(`${env.FRONTEND_URL}/instagram-callback`);

                // Escopos necessários para Instagram Business
                const scopes = [
                    'public_profile',
                    'instagram_basic',
                    'instagram_manage_comments',
                    'instagram_manage_messages',
                    'instagram_content_publish',
                    'instagram_manage_insights',
                    'pages_show_list',
                    'pages_read_engagement',
                    'pages_manage_metadata'
                ].join(',');

                if (!appId) {
                    return errorResponse('Facebook App ID não configurado. Configure FACEBOOK_APP_ID no wrangler.toml', 500);
                }

                const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scopes}&state=${userId}`;

                return jsonResponse({
                    success: true,
                    url: authUrl,
                    message: 'Redirecione o usuário para esta URL'
                });
            }

            // Callback do Instagram/Facebook OAuth
            if (path === '/api/integrations/instagram/callback' && request.method === 'POST') {
                const { code, state: userId } = await request.json() as any;

                if (!code || !userId) {
                    return errorResponse('Code and user ID required', 400);
                }

                // Verificar se o usuário existe
                const user = await auth.getUser(userId);
                if (!user) {
                    return errorResponse('User not found', 404);
                }

                try {
                    // Obter tokens de acesso usando o código de autorização
                    const appId = env.FACEBOOK_APP_ID || '';
                    const appSecret = env.FACEBOOK_APP_SECRET || '';
                    const redirectUri = `${env.FRONTEND_URL}/instagram-callback`;

                    if (!appId || !appSecret) {
                        return errorResponse('Facebook App credentials not configured', 500);
                    }

                    // Primeira etapa: trocar o código por um token de acesso temporário
                    const tokenExchangeUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`;

                    const tokenResponse = await fetch(tokenExchangeUrl, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!tokenResponse.ok) {
                        const errorData = await tokenResponse.json();
                        return errorResponse(`Failed to exchange code for token: ${JSON.stringify(errorData)}`, 500);
                    }

                    const tokenData = await tokenResponse.json();
                    const shortLivedToken = tokenData.access_token;

                    // Segunda etapa: obter token de longa duração
                    const longLivedTokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${shortLivedToken}`;

                    const longLivedResponse = await fetch(longLivedTokenUrl, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!longLivedResponse.ok) {
                        const errorData = await longLivedResponse.json();
                        return errorResponse(`Failed to get long-lived token: ${JSON.stringify(errorData)}`, 500);
                    }

                    const longLivedData = await longLivedResponse.json();
                    const accessToken = longLivedData.access_token;

                    // Terceira etapa: obter informações da conta do Instagram
                    const instagramAccountUrl = `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}&fields=id,name,instagram_business_account{id,username,account_type,profile_picture_url,followers_count,media_count}`;

                    const accountResponse = await fetch(instagramAccountUrl, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });

                    if (!accountResponse.ok) {
                        const errorData = await accountResponse.json();
                        return errorResponse(`Failed to get Instagram account info: ${JSON.stringify(errorData)}`, 500);
                    }

                    const accountData = await accountResponse.json();

                    // Encontrar a conta do Instagram Business
                    let instagramAccount = null;
                    for (const account of accountData.data) {
                        if (account.instagram_business_account) {
                            // Obter informações adicionais da conta do Instagram
                            const igInfoUrl = `https://graph.facebook.com/v18.0/${account.instagram_business_account.id}?fields=username,account_type,profile_picture_url,followers_count,media_count,name&access_token=${accessToken}`;

                            const igResponse = await fetch(igInfoUrl, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            });

                            if (igResponse.ok) {
                                const igData = await igResponse.json();
                                instagramAccount = {
                                    ...account.instagram_business_account,
                                    ...igData,
                                    page_id: account.id,
                                    page_name: account.name,
                                };
                                break;
                            }
                        }
                    }

                    if (!instagramAccount) {
                        return errorResponse('No Instagram Business Account found', 404);
                    }

                    // Salvar informações da integração no banco de dados
                    const now = new Date().toISOString();

                    // Verificar se já existe uma integração para este usuário
                    const existingIntegration = await db.first(
                        'SELECT * FROM instagram_integrations WHERE user_id = ?',
                        [userId]
                    );

                    if (existingIntegration) {
                        // Atualizar integração existente
                        await db.execute(
                            `UPDATE instagram_integrations
                             SET
                                 instagram_account_id = ?,
                                 instagram_username = ?,
                                 access_token = ?,
                                 account_info = ?,
                                 last_sync_at = ?,
                                 updated_at = ?
                             WHERE user_id = ?`,
                            [
                                instagramAccount.id,
                                instagramAccount.username,
                                accessToken,
                                JSON.stringify(instagramAccount),
                                now,
                                now,
                                userId
                            ]
                        );
                    } else {
                        // Criar nova integração
                        await db.execute(
                            `INSERT INTO instagram_integrations
                             (id, user_id, instagram_account_id, instagram_username, access_token, account_info, last_sync_at, created_at, updated_at)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                            [
                                crypto.randomUUID(),
                                userId,
                                instagramAccount.id,
                                instagramAccount.username,
                                accessToken,
                                JSON.stringify(instagramAccount),
                                now,
                                now,
                                now
                            ]
                        );
                    }

                    return jsonResponse({
                        success: true,
                        message: 'Instagram integration successful',
                        instagramAccount: {
                            id: instagramAccount.id,
                            username: instagramAccount.username,
                            followers_count: instagramAccount.followers_count,
                            media_count: instagramAccount.media_count,
                            profile_picture_url: instagramAccount.profile_picture_url
                        }
                    });
                } catch (error: any) {
                    console.error('Instagram callback error:', error);
                    return errorResponse(`Instagram integration failed: ${error.message}`, 500);
                }
            }

            // Health check
            if (path === '/api/health') {
                return jsonResponse({
                    success: true,
                    status: 'healthy',
                    environment: env.ENVIRONMENT,
                    timestamp: new Date().toISOString(),
                    features: {
                        d1: true,
                        r2: !!env.STORAGE,
                    }
                });
            }

            // Rota não encontrada
            return errorResponse('Not Found', 404);

        } catch (error: any) {
            console.error('Worker error:', error);
            return errorResponse(error.message || 'Internal Server Error', 500);
        }
    },
};
