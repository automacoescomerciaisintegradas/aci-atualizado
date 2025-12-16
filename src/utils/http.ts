/**
 * HTTP Utilities para Cloudflare Workers
 * Helpers para CORS, respostas JSON, etc.
 */

/**
 * Headers CORS padrão
 */
export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
};

/**
 * Handle CORS preflight requests
 */
export function handleCORS(): Response {
    return new Response(null, {
        status: 204,
        headers: corsHeaders,
    });
}

/**
 * Criar resposta JSON com CORS
 */
export function jsonResponse(data: any, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    });
}

/**
 * Criar resposta de erro com CORS
 */
export function errorResponse(message: string, status: number = 500): Response {
    return jsonResponse(
        {
            success: false,
            error: message,
        },
        status
    );
}

/**
 * Validar Bearer Token
 */
export function extractBearerToken(request: Request): string | null {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    return authHeader.substring(7);
}

/**
 * Validar requisição autenticada
 */
export function requireAuth(request: Request): string {
    const token = extractBearerToken(request);
    if (!token) {
        throw new Error('Authentication required');
    }
    // Aqui você implementaria a validação do token JWT
    // Por enquanto, retornamos o token como userId (simplificado)
    return token;
}
