import { Router } from 'express';
import axios from 'axios';
import { prisma } from '../prisma';
import { authMiddleware } from '../auth';

const router = Router();

const FACEBOOK_API_VERSION = process.env.META_API_VERSION || 'v19.0';
const APP_ID = process.env.META_APP_ID;
const APP_SECRET = process.env.META_APP_SECRET;
const REDIRECT_URI = process.env.META_REDIRECT_URI;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';

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
        return res.redirect(`${FRONTEND_URL}/dashboard/integrations?status=error&message=${encodeURIComponent(error_description as string)}`);
    }

    if (!code || !state) {
        return res.redirect(`${FRONTEND_URL}/dashboard/integrations?status=error&message=Codigo_ou_estado_ausente`);
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
            return res.redirect(`${FRONTEND_URL}/dashboard/integrations?status=warning&message=Nenhuma_conta_Instagram_Business_encontrada`);
        }

        // Sucesso
        res.redirect(`${FRONTEND_URL}/dashboard/integrations?status=success&count=${connectedCount}`);

    } catch (error: any) {
        console.error('Erro no callback do Instagram:', error.response?.data || error.message);
        res.redirect(`${FRONTEND_URL}/dashboard/integrations?status=error&message=Erro_interno_no_servidor`);
    }
});

export default router;
