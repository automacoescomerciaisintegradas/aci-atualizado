// =====================================================
// SUPABASE EDGE FUNCTION: create-checkout
// Cria checkout PIX via Mercado Pago
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MERCADOPAGO_ACCESS_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
    // CORS headers
    if (req.method === 'OPTIONS') {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            },
        })
    }

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

        // Get user from JWT
        const authHeader = req.headers.get('Authorization')!
        const token = authHeader.replace('Bearer ', '')
        const { data: { user }, error: userError } = await supabase.auth.getUser(token)

        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Não autorizado' }),
                { status: 401, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Parse request body
        const { plan_id, credits, amount } = await req.json()

        // Validações
        if (!plan_id || !credits || !amount) {
            return new Response(
                JSON.stringify({ error: 'Dados obrigatórios não fornecidos' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        if (amount < 1 || credits < 1) {
            return new Response(
                JSON.stringify({ error: 'Valores inválidos' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            )
        }

        // Criar pagamento PIX no Mercado Pago
        const pixPayment = await createPixPayment({
            amount,
            description: `Recarga de ${credits} créditos - Plano ${plan_id}`,
            email: user.email!,
            userId: user.id,
        })

        if (!pixPayment.success) {
            throw new Error('Erro ao criar pagamento PIX')
        }

        // Armazenar transação no banco
        const { data: transaction, error: dbError } = await supabase
            .from('payment_transactions')
            .insert({
                user_id: user.id,
                transaction_id: pixPayment.id,
                amount: pixPayment.amount,
                expected_amount: amount,
                credits,
                status: 'pending',
                payment_method: 'pix',
                pix_qr_code: pixPayment.qr_code_base64,
                pix_copy_paste: pixPayment.qr_code,
                plan_id,
                expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutos
                metadata: {
                    mercadopago_id: pixPayment.id,
                    created_by: 'edge_function'
                }
            })
            .select()
            .single()

        if (dbError) {
            console.error('Erro ao salvar transação:', dbError)
            throw new Error('Erro ao salvar transação')
        }

        return new Response(
            JSON.stringify({
                success: true,
                transaction_id: transaction.id,
                qr_code: pixPayment.qr_code_base64,
                copy_paste: pixPayment.qr_code,
                amount: pixPayment.amount,
                expires_at: transaction.expires_at
            }),
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        )

    } catch (error) {
        console.error('Erro na função create-checkout:', error)
        return new Response(
            JSON.stringify({
                error: 'Erro interno do servidor',
                details: error.message
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            }
        )
    }
})

// =====================================================
// FUNÇÃO AUXILIAR: Criar Pagamento PIX no Mercado Pago
// =====================================================

async function createPixPayment({ amount, description, email, userId }: any) {
    try {
        const response = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
                transaction_amount: amount,
                description,
                payment_method_id: 'pix',
                payer: {
                    email,
                    first_name: 'Usuário',
                    last_name: 'ACI'
                },
                notification_url: `${SUPABASE_URL}/functions/v1/payment-webhook`,
                metadata: {
                    user_id: userId
                }
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('Erro do Mercado Pago:', errorData)
            return { success: false, error: errorData }
        }

        const data = await response.json()

        return {
            success: true,
            id: data.id.toString(),
            amount: data.transaction_amount,
            status: data.status,
            qr_code: data.point_of_interaction.transaction_data.qr_code,
            qr_code_base64: data.point_of_interaction.transaction_data.qr_code_base64,
        }
    } catch (error) {
        console.error('Erro ao criar pagamento PIX:', error)
        return { success: false, error: error.message }
    }
}
