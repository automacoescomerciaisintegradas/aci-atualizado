// =====================================================
// SUPABASE EDGE FUNCTION: payment-webhook
// Recebe e processa webhooks de pagamento do Mercado Pago
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
    // Aceitar apenas POST
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        const payload = await req.json()

        console.log('Webhook recebido:', payload)

        // Registrar log do webhook
        await supabase.from('webhook_logs').insert({
            provider: 'mercadopago',
            event_type: payload.type || 'unknown',
            payload,
            status: 'received'
        })

        // Validar estrutura do webhook
        if (!payload.data || !payload.data.id) {
            console.warn('Webhook inválido - dados incompletos')
            return new Response('OK', { status: 200 })
        }

        // Processar apenas eventos de pagamento
        if (payload.type === 'payment') {
            await processPaymentNotification(supabase, payload.data.id)
        }

        return new Response('OK', { status: 200 })

    } catch (error) {
        console.error('Erro ao processar webhook:', error)

        // Sempre retornar 200 para evitar reenvios desnecessários
        return new Response('OK', { status: 200 })
    }
})

// =====================================================
// PROCESSAR NOTIFICAÇÃO DE PAGAMENTO
// =====================================================

async function processPaymentNotification(supabase: any, paymentId: string) {
    try {
        console.log('Processando pagamento:', paymentId)

        // Buscar detalhes do pagamento no Mercado Pago
        const paymentDetails = await fetchPaymentDetails(paymentId)

        if (!paymentDetails) {
            console.error('Não foi possível buscar detalhes do pagamento')
            return
        }

        console.log('Detalhes do pagamento:', paymentDetails)

        // Buscar transação no banco
        const { data: transaction, error: txError } = await supabase
            .from('payment_transactions')
            .select('*')
            .eq('transaction_id', paymentId.toString())
            .single()

        if (txError || !transaction) {
            console.error('Transação não encontrada no banco:', txError)
            return
        }

        // Validar se a transação já foi processada
        if (transaction.status === 'completed') {
            console.log('Pagamento já foi processado anteriormente')
            return
        }

        // Validar status do pagamento
        if (paymentDetails.status !== 'approved') {
            console.log('Pagamento não aprovado, status:', paymentDetails.status)

            // Atualizar status se for rejeitado ou expirado
            if (['rejected', 'cancelled', 'refunded'].includes(paymentDetails.status)) {
                await supabase
                    .from('payment_transactions')
                    .update({ status: 'failed', updated_at: new Date().toISOString() })
                    .eq('id', transaction.id)
            }

            return
        }

        // Validar valor do pagamento
        const paidAmount = parseFloat(paymentDetails.transaction_amount)
        const expectedAmount = parseFloat(transaction.expected_amount)

        if (Math.abs(paidAmount - expectedAmount) > 0.01) {
            console.error('Valor pago diferente do esperado:', {
                paid: paidAmount,
                expected: expectedAmount
            })

            await supabase
                .from('payment_transactions')
                .update({
                    status: 'failed',
                    metadata: {
                        ...transaction.metadata,
                        error: 'amount_mismatch',
                        paid_amount: paidAmount
                    }
                })
                .eq('id', transaction.id)

            return
        }

        // ✅ PAGAMENTO CONFIRMADO - ADICIONAR CRÉDITOS
        console.log('Pagamento confirmado! Adicionando créditos...')

        const { error: creditsError } = await supabase.rpc('add_credits_to_user', {
            p_user_id: transaction.user_id,
            p_credits: transaction.credits,
            p_transaction_id: transaction.id
        })

        if (creditsError) {
            console.error('Erro ao adicionar créditos:', creditsError)

            // Marcar como erro mas não falhar o webhook
            await supabase
                .from('payment_transactions')
                .update({
                    metadata: {
                        ...transaction.metadata,
                        credit_error: creditsError.message
                    }
                })
                .eq('id', transaction.id)

            return
        }

        console.log('✅ Créditos adicionados com sucesso!')

        // Atualizar log do webhook como processado
        await supabase
            .from('webhook_logs')
            .update({
                status: 'processed',
                processed_at: new Date().toISOString()
            })
            .eq('payload->>id', paymentId.toString())

        // TODO: Enviar email de confirmação (opcional)
        // await sendConfirmationEmail(transaction.user_id, transaction.credits)

    } catch (error) {
        console.error('Erro ao processar notificação:', error)

        // Log de erro
        await supabase
            .from('webhook_logs')
            .update({
                status: 'failed',
                error_message: error.message,
                processed_at: new Date().toISOString()
            })
            .eq('payload->>id', paymentId.toString())
    }
}

// =====================================================
// BUSCAR DETALHES DO PAGAMENTO NO MERCADO PAGO
// =====================================================

async function fetchPaymentDetails(paymentId: string) {
    try {
        const response = await fetch(
            `https://api.mercadopago.com/v1/payments/${paymentId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
                },
            }
        )

        if (!response.ok) {
            console.error('Erro ao buscar pagamento:', response.status)
            return null
        }

        return await response.json()
    } catch (error) {
        console.error('Erro ao buscar detalhes do pagamento:', error)
        return null
    }
}
