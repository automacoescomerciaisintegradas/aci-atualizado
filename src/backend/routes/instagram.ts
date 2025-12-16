import { Router } from 'express';
import axios from 'axios';
import { prisma } from '../prisma';
import { authMiddleware } from '../auth';

const router = Router();

const FACEBOOK_API_VERSION = process.env.META_API_VERSION || 'v19.0';
const APP_ID = process.env.META_APP_ID;
const APP_SECRET = process.env.META_APP_SECRET;
const REDIRECT_URI = process.env.META_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// 1. Iniciar Login - Retorna a URL para o frontend redirecionar
router.get('/auth', authMiddleware, (req: any, res) => {
    if (!APP_ID || !REDIRECT_URI) {
        return res.status(500).json({ error: 'Configurações do Facebook não encontradas no servidor.' });
    }

    const scopes = [
        'public_profile',
        'instagram_basic',
        'instagram_manage_comments',
        'pages_show_list',
        'pages_read_engagement',
        'pages_manage_metadata',
        'instagram_manage_messages',
        'instagram_content_publish',
        'instagram_manage_insights',
        'business_management'
    ].join(',');

    // Passamos o userId no state para recuperar no callback
    const state = req.user.id;

    const url = `https://www.facebook.com/${FACEBOOK_API_VERSION}/dialog/oauth?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scopes}&state=${state}&response_type=code`;

    res.json({ url });
});

// 2. Callback - Recebe o code e troca por tokens
router.get('/callback', async (req: any, res) => {
    const { code, state, error, error_reason, error_description } = req.query;

    if (error) {
        console.error('Erro retornado pelo Facebook:', error, error_reason, error_description);
        return res.redirect(`${FRONTEND_URL}?instagram_status=error&message=${encodeURIComponent(error_description as string || 'Erro ao conectar Instagram')}`);
    }

    if (!code || !state) {
        return res.redirect(`${FRONTEND_URL}?instagram_status=error&message=${encodeURIComponent('Código ou estado ausente')}`);
    }

    try {
        // A. Trocar Code por Short-Lived Token
        const tokenResponse = await axios.get(`https://graph.facebook.com/${FACEBOOK_API_VERSION}/oauth/access_token`, {
            params: {
                client_id: APP_ID,
                redirect_uri: REDIRECT_URI,
                client_secret: APP_SECRET,
                code,
            },
        });

        const shortLivedToken = tokenResponse.data.access_token;

        // B. Trocar Short-Lived Token por Long-Lived Token (60 dias)
        const longLivedTokenResponse = await axios.get(`https://graph.facebook.com/${FACEBOOK_API_VERSION}/oauth/access_token`, {
            params: {
                grant_type: 'fb_exchange_token',
                client_id: APP_ID,
                client_secret: APP_SECRET,
                fb_exchange_token: shortLivedToken,
            },
        });

        const longLivedToken = longLivedTokenResponse.data.access_token;

        // C. Buscar Páginas do Usuário
        const pagesResponse = await axios.get(`https://graph.facebook.com/${FACEBOOK_API_VERSION}/me/accounts`, {
            params: {
                access_token: longLivedToken,
            },
        });

        const pages = pagesResponse.data.data;
        let connectedCount = 0;

        for (const page of pages) {
            // D. Verificar se a página tem Instagram vinculado
            try {
                const igResponse = await axios.get(`https://graph.facebook.com/${FACEBOOK_API_VERSION}/${page.id}`, {
                    params: {
                        fields: 'instagram_business_account',
                        access_token: longLivedToken,
                    },
                });

                if (igResponse.data.instagram_business_account) {
                    const igId = igResponse.data.instagram_business_account.id;

                    // E. Pegar detalhes do Instagram
                    const igDetails = await axios.get(`https://graph.facebook.com/${FACEBOOK_API_VERSION}/${igId}`, {
                        params: {
                            fields: 'username,profile_picture_url,name',
                            access_token: longLivedToken,
                        },
                    });

                    // F. Salvar no Banco
                    // Verifica se já existe para atualizar
                    const existingIntegration = await prisma.integration.findFirst({
                        where: {
                            userId: state as string,
                            provider: 'INSTAGRAM',
                            // Podemos usar o instagramId dentro do JSON para identificar unicamente, 
                            // mas o prisma não busca fácil dentro do JSON. 
                            // Vamos assumir que o nome (username) é único por provider para esse usuário ou criar um novo.
                            // Melhor: Buscar todas do user e filtrar no código ou confiar na criação de novas.
                            // Vamos criar uma nova ou atualizar se tivermos um ID de integração passado (não temos aqui).
                            // Vamos tentar buscar pelo 'name' que estamos definindo como username.
                            name: igDetails.data.username
                        }
                    });

                    if (existingIntegration) {
                        await prisma.integration.update({
                            where: { id: existingIntegration.id },
                            data: {
                                credentials: {
                                    accessToken: longLivedToken,
                                    instagramId: igId,
                                    pageId: page.id,
                                    pageName: page.name,
                                    profilePicture: igDetails.data.profile_picture_url
                                },
                                status: 'ACTIVE',
                                updatedAt: new Date()
                            }
                        });
                    } else {
                        await prisma.integration.create({
                            data: {
                                userId: state as string,
                                provider: 'INSTAGRAM',
                                name: igDetails.data.username,
                                credentials: {
                                    accessToken: longLivedToken,
                                    instagramId: igId,
                                    pageId: page.id,
                                    pageName: page.name,
                                    profilePicture: igDetails.data.profile_picture_url
                                },
                                status: 'ACTIVE',
                            },
                        });
                    }
                    connectedCount++;
                }
            } catch (pageError) {
                console.error(`Erro ao processar página ${page.name}:`, pageError);
                // Continua para a próxima página
            }
        }

        if (connectedCount === 0) {
            return res.redirect(`${FRONTEND_URL}?instagram_status=warning&message=${encodeURIComponent('Nenhuma conta Instagram Business encontrada')}`);
        }

        // Sucesso - Redirecionar para home com mensagem de sucesso
        res.redirect(`${FRONTEND_URL}?instagram_status=success&message=${encodeURIComponent(`${connectedCount} conta(s) Instagram conectada(s) com sucesso!`)}`);

    } catch (error: any) {
        console.error('Erro no callback do Instagram:', error.response?.data || error.message);
        res.redirect(`${FRONTEND_URL}?instagram_status=error&message=${encodeURIComponent('Erro ao conectar Instagram. Tente novamente.')}`);
    }
});

// 3. Publicar Post no Instagram
router.post('/post', authMiddleware, async (req: any, res) => {
    try {
        const { integrationId, imageUrl, caption } = req.body;
        const userId = req.user.id;

        if (!integrationId || !imageUrl || !caption) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: integrationId, imageUrl, caption'
            });
        }

        // Buscar integração do usuário
        const integration = await prisma.integration.findFirst({
            where: {
                id: integrationId,
                userId,
                provider: 'INSTAGRAM',
                status: 'ACTIVE'
            }
        });

        if (!integration) {
            return res.status(404).json({
                success: false,
                error: 'Integração Instagram não encontrada ou inativa'
            });
        }

        const credentials = integration.credentials as any;
        const { InstagramAPI } = await import('../../lib/instagram');

        const instagram = new InstagramAPI({
            accessToken: credentials.accessToken,
            instagramBusinessAccountId: credentials.instagramId
        });

        // Publicar post
        const result = await instagram.publishPost({ imageUrl, caption });

        // Deduzir créditos (R$ 0,27 por publicação)
        const COST_PER_POST = 0.27;
        console.log(`Post publicado! Custo: R$ ${COST_PER_POST}`);

        return res.json({
            success: true,
            message: 'Post publicado com sucesso!',
            data: {
                id: result.id,
                permalink: result.permalink,
                cost: COST_PER_POST
            }
        });
    } catch (error: any) {
        console.error('Error publishing Instagram post:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao publicar post'
        });
    }
});

// 4. Resposta Automática a Comentário
router.post('/comment/auto-reply', authMiddleware, async (req: any, res) => {
    try {
        const {
            integrationId,
            commentId,
            commentText,
            username,
            productName,
            productLink
        } = req.body;
        const userId = req.user.id;

        // Buscar integração
        const integration = await prisma.integration.findFirst({
            where: {
                id: integrationId,
                userId,
                provider: 'INSTAGRAM',
                status: 'ACTIVE'
            }
        });

        if (!integration) {
            return res.status(404).json({
                success: false,
                error: 'Integração não encontrada'
            });
        }

        const credentials = integration.credentials as any;
        const { InstagramAPI, detectKeywordInComment, generateAutoReply } = await import('../../lib/instagram');

        // Verificar palavra-chave
        const hasKeyword = detectKeywordInComment({ text: commentText } as any, 'EU QUERO');

        if (!hasKeyword) {
            return res.json({
                success: true,
                message: 'Comentário não contém palavra-chave',
                data: { replied: false }
            });
        }

        const instagram = new InstagramAPI({
            accessToken: credentials.accessToken,
            instagramBusinessAccountId: credentials.instagramId
        });

        // Responder publicamente
        const replyMessage = generateAutoReply(username, productName);
        await instagram.replyToComment(commentId, replyMessage);

        // Deduzir créditos
        const COST_REPLY = 0.09;
        console.log(`Resposta automática enviada! Custo: R$ ${COST_REPLY}`);

        return res.json({
            success: true,
            message: 'Resposta automática enviada!',
            data: {
                replied: true,
                replyMessage,
                cost: COST_REPLY
            }
        });
    } catch (error: any) {
        console.error('Error auto-replying:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao responder comentário'
        });
    }
});

// 5. Obter Informações da Conta
router.get('/account/:integrationId', authMiddleware, async (req: any, res) => {
    try {
        const { integrationId } = req.params;
        const userId = req.user.id;

        const integration = await prisma.integration.findFirst({
            where: {
                id: integrationId,
                userId,
                provider: 'INSTAGRAM',
                status: 'ACTIVE'
            }
        });

        if (!integration) {
            return res.status(404).json({
                success: false,
                error: 'Integração não encontrada'
            });
        }

        const credentials = integration.credentials as any;
        const { InstagramAPI } = await import('../../lib/instagram');

        const instagram = new InstagramAPI({
            accessToken: credentials.accessToken,
            instagramBusinessAccountId: credentials.instagramId
        });

        const accountInfo = await instagram.getAccountInfo();
        const recentMedia = await instagram.getRecentMedia(6);

        return res.json({
            success: true,
            data: {
                account: accountInfo,
                recentPosts: recentMedia,
                integration: {
                    id: integration.id,
                    name: integration.name,
                    connectedAt: integration.createdAt
                }
            }
        });
    } catch (error: any) {
        console.error('Error fetching account info:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar informações'
        });
    }
});

export default router;
