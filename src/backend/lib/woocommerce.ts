import axios from 'axios';
import https from 'https';

export interface WooCommerceCredentials {
    url: string;
    consumerKey: string;
    consumerSecret: string;
}

export interface WooCommerceTestResult {
    success: boolean;
    message: string;
    storeInfo?: {
        name: string;
        url: string;
        version: string;
    };
}

/**
 * Valida credenciais do WooCommerce testando conexão
 */
export async function testWooCommerceConnection(
    credentials: WooCommerceCredentials
): Promise<WooCommerceTestResult> {
    try {
        const { url, consumerKey, consumerSecret } = credentials;

        // Limpar URL e garantir formato correto
        const cleanUrl = url.replace(/\/$/, '');
        const apiUrl = `${cleanUrl}/wp-json/wc/v3/system_status`;

        console.log(`📡 Verificando WooCommerce: ${apiUrl}`);

        // Base64 encode consumerKey:consumerSecret
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'User-Agent': 'ACI-Automacoes-App/1.0',
            },
            timeout: 30000, // Aumentado para 30s para máquinas lentas
            httpsAgent: new https.Agent({
                rejectUnauthorized: false // Permite certificados auto-assinados/letr's encrypt expirados (comum em dev)
            })
        });

        if (response.status === 200) {
            return {
                success: true,
                message: 'Conexão estabelecida com sucesso!',
                storeInfo: {
                    name: response.data.environment?.site_name || 'WooCommerce Store',
                    url: response.data.environment?.site_url || cleanUrl,
                    version: response.data.environment?.wc_version || 'unknown',
                },
            };
        }

        return {
            success: false,
            message: `Erro inesperado (Status ${response.status})`,
        };
    } catch (error: any) {
        console.error('❌ Erro WooCommerce Backend:', error.message);

        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            return { success: false, message: 'Tempo de resposta esgotado (30s). Verifique se o seu site WordPress está ativo.' };
        }

        if (error.response?.status === 401) {
            return {
                success: false,
                message: 'Credenciais inválidas. Verifique a Consumer Key e o Consumer Secret.',
            };
        }

        if (error.response?.status === 404) {
            return {
                success: false,
                message: 'WooCommerce REST API não encontrada. Verifique se o plugin WooCommerce está ativo e se a URL está correta (ex: /wp-json/wc/v3).',
            };
        }

        return {
            success: false,
            message: `Falha na conexão: ${error.message}`
        };
    }
}
