/**
 * =========================================
 * ACI - Webhook Mercado Pago
 * Endpoint para receber notificações de pagamento
 * =========================================
 * 
 * Este arquivo deve ser usado como base para criar
 * um endpoint serverless (Supabase Edge Function, 
 * Vercel Serverless, ou similar)
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// ==========================================
// TIPOS
// ==========================================

interface WebhookPayload {
    id: string;
    live_mode: boolean;
    type: string;
    date_created: string;
    user_id: string;
    api_version: string;
    action: string;
    data: {
        id: string;
    };
}

interface WebhookResponse {
    success: boolean;
    message: string;
    processedAt?: string;
}

// ==========================================
// CONFIGURAÇÃO
// ==========================================

const CONFIG = {
    // Supabase
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '', // Use service key para bypass RLS

    // Mercado Pago
    mercadoPagoAccessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
    mercadoPagoWebhookSecret: process.env.MERCADO_PAGO_WEBHOOK_SECRET || '',
};

// Cliente Supabase com service role
const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

// ==========================================
// VALIDAÇÃO DE ASSINATURA
// ==========================================

function validateSignature(
    xSignature: string,
    xRequestId: string,
    dataId: string
): boolean {
    if (!CONFIG.mercadoPagoWebhookSecret) {
        console.warn('Webhook secret não configurado - pulando validação');
        return true;
    }

    try {
        // Extrair ts e v1 do header x-signature
        const parts = xSignature.split(',');
        const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1];
        const v1 = parts.find(p => p.startsWith('v1='))?.split('=')[1];

        if (!ts || !v1) {
            console.error('Assinatura inválida - ts ou v1 ausente');
            return false;
        }

        // Construir string para validação
        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

        // Criar HMAC
        const hmac = crypto.createHmac('sha256', CONFIG.mercadoPagoWebhookSecret);
        hmac.update(manifest);
        const generatedSignature = hmac.digest('hex');

        return generatedSignature === v1;
    } catch (error) {
        console.error('Erro ao validar assinatura:', error);
        return false;
    }
}

// ==========================================
// BUSCAR PAGAMENTO NO MERCADO PAGO
// ==========================================

async function getPaymentDetails(paymentId: string): Promise<any | null> {
    try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${CONFIG.mercadoPagoAccessToken}`,
            },
        });

        if (!response.ok) {
            console.error('Erro ao buscar pagamento:', await response.text());
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Erro na requisição:', error);
        return null;
    }
}

// ==========================================
// PROCESSAR PAGAMENTO APROVADO
// ==========================================

async function processApprovedPayment(
    transaction: any,
    paymentDetails: any
): Promise<boolean> {
    const userId = transaction.user_id;
    const creditsAmount = transaction.metadata?.credits_amount || 0;
    const bonusCredits = transaction.metadata?.bonus_credits || 0;
    const totalCredits = creditsAmount + bonusCredits;

    console.log(`Processando pagamento aprovado: ${transaction.id}`);
    console.log(`Usuário: ${userId}, Créditos: ${totalCredits}`);

    try {
        // Buscar saldo atual
        const { data: userCredits, error: creditsError } = await supabase
            .from('user_credits')
            .select('*')
            .eq('user_id', userId)
            .single();

        let newBalance: number;

        if (creditsError || !userCredits) {
            // Criar novo registro
            newBalance = totalCredits;
            await supabase.from('user_credits').insert({
                user_id: userId,
                balance: totalCredits,
                total_purchased: creditsAmount,
                bonus_credits: bonusCredits,
                total_bonus: bonusCredits,
                last_transaction_at: new Date().toISOString(),
            });
        } else {
            // Atualizar saldo existente
            newBalance = Number(userCredits.balance) + totalCredits;
            await supabase
                .from('user_credits')
                .update({
                    balance: newBalance,
                    total_purchased: Number(userCredits.total_purchased) + creditsAmount,
                    bonus_credits: Number(userCredits.bonus_credits) + bonusCredits,
                    total_bonus: Number(userCredits.total_bonus) + bonusCredits,
                    current_month_purchased: Number(userCredits.current_month_purchased) + creditsAmount,
                    last_transaction_at: new Date().toISOString(),
                })
                .eq('user_id', userId);
        }

        // Registrar transação de créditos
        await supabase.from('credit_transactions').insert({
            user_id: userId,
            type: 'credit',
            status: 'completed',
            amount: transaction.amount,
            credits_amount: totalCredits,
            balance_after: newBalance,
            description: `Recarga PIX - ${transaction.metadata?.package_id || 'Avulso'}`,
            service_name: 'Mercado Pago PIX',
            metadata: {
                payment_transaction_id: transaction.id,
                gateway_transaction_id: transaction.gateway_transaction_id,
                mercadopago_payment_id: paymentDetails.id,
                package_id: transaction.metadata?.package_id,
                credits: creditsAmount,
                bonus: bonusCredits,
                payer_email: paymentDetails?.payer?.email,
            },
            processed_at: new Date().toISOString(),
        });

        // Atualizar transação de pagamento
        await supabase
            .from('payment_transactions')
            .update({
                status: 'completed',
                paid_at: paymentDetails.date_approved || new Date().toISOString(),
                metadata: {
                    ...transaction.metadata,
                    processed_at: new Date().toISOString(),
                    credits_added: totalCredits,
                    mercadopago_status: paymentDetails.status,
                    mercadopago_status_detail: paymentDetails.status_detail,
                },
            })
            .eq('id', transaction.id);

        // Log de sucesso
        await supabase.from('webhook_logs').insert({
            provider: 'mercadopago',
            event_type: 'payment.approved',
            payload: {
                payment_id: transaction.gateway_transaction_id,
                transaction_id: transaction.id,
                user_id: userId,
                amount: transaction.amount,
                credits: totalCredits,
                mercadopago_id: paymentDetails.id,
            },
            status: 'processed',
            processed_at: new Date().toISOString(),
        });

        console.log(`✅ Pagamento processado com sucesso! ${totalCredits} créditos adicionados.`);
        return true;
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);

        // Log de erro
        await supabase.from('webhook_logs').insert({
            provider: 'mercadopago',
            event_type: 'payment.approved',
            payload: { transaction_id: transaction.id, payment_id: transaction.gateway_transaction_id },
            status: 'failed',
            error_message: String(error),
        });

        return false;
    }
}

// ==========================================
// PROCESSAR PAGAMENTO FALHO/CANCELADO
// ==========================================

async function processFailedPayment(
    transaction: any,
    paymentDetails: any
): Promise<boolean> {
    try {
        await supabase
            .from('payment_transactions')
            .update({
                status: paymentDetails.status === 'rejected' ? 'failed' : 'cancelled',
                status_message: paymentDetails.status_detail,
                metadata: {
                    ...transaction.metadata,
                    failed_at: new Date().toISOString(),
                    failure_reason: paymentDetails.status_detail,
                    mercadopago_status: paymentDetails.status,
                },
            })
            .eq('id', transaction.id);

        await supabase.from('webhook_logs').insert({
            provider: 'mercadopago',
            event_type: `payment.${paymentDetails.status}`,
            payload: {
                transaction_id: transaction.id,
                payment_id: transaction.gateway_transaction_id,
                status: paymentDetails.status,
                status_detail: paymentDetails.status_detail,
            },
            status: 'processed',
            processed_at: new Date().toISOString(),
        });

        console.log(`❌ Pagamento ${paymentDetails.status}: ${transaction.id}`);
        return true;
    } catch (error) {
        console.error('Erro ao processar pagamento falho:', error);
        return false;
    }
}

// ==========================================
// HANDLER PRINCIPAL
// ==========================================

export async function handleWebhook(
    request: Request
): Promise<Response> {
    const startTime = Date.now();

    try {
        // Log da requisição recebida
        console.log('Webhook recebido do Mercado Pago');

        // Obter headers
        const xSignature = request.headers.get('x-signature') || '';
        const xRequestId = request.headers.get('x-request-id') || '';

        // Parsear body
        const payload: WebhookPayload = await request.json();
        console.log('Payload:', JSON.stringify(payload, null, 2));

        // Validar assinatura
        if (!validateSignature(xSignature, xRequestId, payload.data.id)) {
            console.error('Assinatura inválida');
            return new Response(JSON.stringify({ error: 'Invalid signature' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Processar apenas notificações de pagamento
        if (payload.type !== 'payment') {
            console.log(`Tipo ignorado: ${payload.type}`);
            return new Response(JSON.stringify({ success: true, message: 'Ignored' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const paymentId = payload.data.id;

        // Buscar detalhes do pagamento no Mercado Pago
        const paymentDetails = await getPaymentDetails(paymentId);
        if (!paymentDetails) {
            console.error('Não foi possível obter detalhes do pagamento');
            return new Response(JSON.stringify({ error: 'Payment not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        console.log(`Status do pagamento: ${paymentDetails.status}`);

        // Buscar transação no banco
        const { data: transaction, error: findError } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('gateway_transaction_id', paymentId)
            .single();

        if (findError || !transaction) {
            console.error('Transação não encontrada no banco:', paymentId);

            // Salvar log mesmo assim
            await supabase.from('webhook_logs').insert({
                provider: 'mercadopago',
                event_type: `payment.${paymentDetails.status}`,
                payload: { payment_id: paymentId, not_found: true },
                status: 'failed',
                error_message: 'Transaction not found in database',
            });

            return new Response(JSON.stringify({ error: 'Transaction not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Verificar se já foi processada
        if (transaction.status === 'completed') {
            console.log('Transação já processada:', paymentId);
            return new Response(JSON.stringify({ success: true, message: 'Already processed' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Processar baseado no status
        let success = false;

        if (paymentDetails.status === 'approved') {
            success = await processApprovedPayment(transaction, paymentDetails);
        } else if (paymentDetails.status === 'rejected' || paymentDetails.status === 'cancelled') {
            success = await processFailedPayment(transaction, paymentDetails);
        } else {
            // Outros status (pending, in_process, etc)
            await supabase
                .from('payment_transactions')
                .update({
                    status: paymentDetails.status,
                    status_message: paymentDetails.status_detail,
                    metadata: {
                        ...transaction.metadata,
                        last_webhook_at: new Date().toISOString(),
                        mercadopago_status: paymentDetails.status,
                    },
                })
                .eq('id', transaction.id);
            success = true;
        }

        const duration = Date.now() - startTime;
        console.log(`Webhook processado em ${duration}ms`);

        const response: WebhookResponse = {
            success,
            message: success ? 'Processed' : 'Failed',
            processedAt: new Date().toISOString(),
        };

        return new Response(JSON.stringify(response), {
            status: success ? 200 : 500,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Erro no webhook:', error);

        // Log de erro geral
        await supabase.from('webhook_logs').insert({
            provider: 'mercadopago',
            event_type: 'error',
            payload: { error: String(error) },
            status: 'failed',
            error_message: String(error),
        });

        return new Response(JSON.stringify({ error: 'Internal server error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}

// ==========================================
// EXEMPLO DE USO COM VERCEL
// ==========================================

/*
// pages/api/webhooks/mercadopago.ts (Next.js/Vercel)

import { handleWebhook } from '@/lib/webhooks/mercadopago';

export const config = {
  api: {
    bodyParser: false, // Necessário para validar assinatura
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const response = await handleWebhook(req);
  const body = await response.json();
  
  return res.status(response.status).json(body);
}
*/

// ==========================================
// EXEMPLO DE USO COM SUPABASE EDGE FUNCTIONS
// ==========================================

/*
// supabase/functions/mercadopago-webhook/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleWebhook } from './handler.ts';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  return handleWebhook(req);
});
*/

export default handleWebhook;
