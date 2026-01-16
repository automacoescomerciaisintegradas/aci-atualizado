/**
 * =========================================
 * ACI - Serviço de Pagamento PIX
 * Integração com Mercado Pago
 * =========================================
 */

import { enhancedSupabase as supabase } from './enhancedSupabaseClient';
import { PaymentConfig } from '../config/payment';
import { PaymentErrorFactory, PaymentErrorHandler } from './paymentErrorHandler';
import { creditService } from './creditService';

// Declaração de tipos para variáveis de ambiente Vite
declare global {
    interface ImportMetaEnv {
        VITE_MERCADO_PAGO_ACCESS_TOKEN?: string;
        VITE_MERCADO_PAGO_PUBLIC_KEY?: string;
        VITE_MERCADO_PAGO_WEBHOOK_SECRET?: string;
        VITE_APP_URL?: string;
    }
}

// Helper para garantir que o supabase não é null
const getSupabase = () => {
    if (!supabase) {
        throw new Error('Supabase client não está inicializado');
    }
    return supabase;
};

// ==========================================
// TIPOS
// ==========================================

export interface PixPaymentRequest {
    amount: number;           // Valor em R$
    packageId?: string;       // ID do pacote de créditos
    description: string;      // Descrição do pagamento
    creditsAmount: number;    // Quantidade de créditos
    bonusCredits?: number;    // Créditos bônus
}

export interface PixPaymentResponse {
    success: boolean;
    paymentId?: string;
    transactionId?: string;
    pixCode?: string;         // Código PIX copia e cola
    pixQrCode?: string;       // QR Code base64 ou URL
    pixQrCodeBase64?: string; // QR Code em base64
    ticketUrl?: string;       // URL do ticket MP
    expiresAt?: Date;
    status?: string;
    error?: {
        code: string;
        message: string;
    };
}

export interface PaymentStatus {
    id: string;
    status: string; // Alterado de enum restrito para string para compatibilidade
    statusDetail?: string;
    amount: number;
    creditsAmount: number;
    paidAt?: Date;
    expiresAt?: Date;
}

export interface WebhookPayload {
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

// ==========================================
// TIPOS DO MERCADO PAGO
// ==========================================

interface MercadoPagoPaymentResponse {
  id: number;
  status: string;
  status_detail: string;
  transaction_amount: number;
  date_approved?: string;
  date_of_expiration?: string;
  point_of_interaction?: {
    transaction_data: {
      qr_code: string;
      qr_code_base64: string;
      ticket_url: string;
    };
  };
  metadata?: {
    user_id: string;
    credits_amount: number;
    bonus_credits: number;
    package_id?: string;
  };
}

interface MercadoPagoPaymentPayload {
  transaction_amount: number;
  description: string;
  payment_method_id: string;
  external_reference: string;
  notification_url: string;
  date_of_expiration: string;
  payer: {
    email: string;
    first_name: string;
    last_name: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  metadata: {
    user_id: string;
    credits_amount: number;
    bonus_credits: number;
    package_id?: string;
  };
}

// ==========================================
// CONFIGURAÇÃO
// ==========================================

const MERCADO_PAGO_CONFIG = {
    // Usar variáveis de ambiente com fallback seguro
    accessToken: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MERCADO_PAGO_ACCESS_TOKEN) || '',
    publicKey: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MERCADO_PAGO_PUBLIC_KEY) || '',
    webhookSecret: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MERCADO_PAGO_WEBHOOK_SECRET) || '',

    // URLs
    apiUrl: 'https://api.mercadopago.com',

    // Configurações de pagamento
    paymentExpirationMinutes: 30, // PIX expira em 30 minutos

    // Notificação URL (webhook)
    notificationUrl: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_APP_URL)
        ? `${import.meta.env.VITE_APP_URL}/api/webhooks/mercadopago`
        : 'https://seu-dominio.com/api/webhooks/mercadopago',
};

// ==========================================
// SERVIÇO DE PAGAMENTO PIX
// ==========================================

class PixPaymentService {
    private static instance: PixPaymentService;
    private accessToken: string;

    private constructor() {
        this.accessToken = MERCADO_PAGO_CONFIG.accessToken;
    }

    public static getInstance(): PixPaymentService {
        if (!PixPaymentService.instance) {
            PixPaymentService.instance = new PixPaymentService();
        }
        return PixPaymentService.instance;
    }

    // ==========================================
    // CRIAR PAGAMENTO PIX
    // ==========================================

    /**
     * Cria um pagamento PIX no Mercado Pago
     */
    async createPixPayment(request: PixPaymentRequest): Promise<PixPaymentResponse> {
        try {
            // Validar configuração
            const configValidation = PaymentConfig.utils.validateConfig();
            if (!configValidation.isValid) {
                throw PaymentErrorFactory.configMissing(configValidation.errors.join(', '));
            }

            // Obter usuário atual
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw PaymentErrorFactory.invalidUser();
            }

            // Validar valor mínimo
            if (request.amount < PaymentConfig.security.minPaymentAmount) {
                throw PaymentErrorFactory.invalidAmount(request.amount);
            }

            // Obter perfil do usuário
            const { data: profile } = await supabase
                .from('profiles')
                .select('email, full_name, personal_document')
                .eq('id', user.id)
                .single();

            // Gerar ID único para a transação
            const externalReference = `ACI-${user.id.substring(0, 8)}-${Date.now()}`;

            // Calcular data de expiração
            const expirationDate = new Date();
            expirationDate.setMinutes(expirationDate.getMinutes() + PaymentConfig.mercadoPago.paymentExpirationMinutes);

            // Payload para o Mercado Pago
            const paymentPayload: MercadoPagoPaymentPayload = {
                transaction_amount: request.amount,
                description: request.description,
                payment_method_id: 'pix',
                external_reference: externalReference,
                notification_url: PaymentConfig.mercadoPago.webhookUrl,
                date_of_expiration: expirationDate.toISOString(),
                payer: {
                    email: profile?.email || user.email || '',
                    first_name: profile?.full_name?.split(' ')[0] || 'Cliente',
                    last_name: profile?.full_name?.split(' ').slice(1).join(' ') || 'ACI',
                    identification: profile?.personal_document ? {
                        type: 'CPF',
                        number: profile.personal_document.replace(/\D/g, ''),
                    } : undefined,
                },
                metadata: {
                    user_id: user.id,
                    credits_amount: request.creditsAmount,
                    bonus_credits: request.bonusCredits || 0,
                    package_id: request.packageId,
                },
            };

            // Fazer requisição para o Mercado Pago
            const response = await fetch(`${PaymentConfig.mercadoPago.apiUrl}/v1/payments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PaymentConfig.mercadoPago.accessToken}`,
                    'X-Idempotency-Key': externalReference,
                },
                body: JSON.stringify(paymentPayload),
            });

            const data: MercadoPagoPaymentResponse = await response.json();

            if (!response.ok) {
                console.error('Erro Mercado Pago:', data);
                throw PaymentErrorFactory.gatewayError('Mercado Pago', data);
            }

            // Extrair dados do PIX
            const pixData = data.point_of_interaction?.transaction_data;

            // Salvar transação no banco
            const { data: transaction } = await supabase
                .from('payment_transactions')
                .insert({
                    user_id: user.id,
                    payment_method: 'pix',
                    payment_gateway: 'mercadopago',
                    gateway_transaction_id: data.id.toString(),
                    amount: request.amount,
                    currency: 'BRL',
                    status: 'pending',
                    pix_code: pixData?.qr_code,
                    pix_qr_code: pixData?.qr_code_base64,
                    pix_expires_at: expirationDate.toISOString(),
                    package_id: request.packageId,
                    metadata: {
                        external_reference: externalReference,
                        credits_amount: request.creditsAmount,
                        bonus_credits: request.bonusCredits || 0,
                        mercadopago_response: {
                            id: data.id,
                            status: data.status,
                            status_detail: data.status_detail,
                        },
                    },
                })
                .select()
                .single();

            return {
                success: true,
                paymentId: data.id.toString(),
                transactionId: transaction?.id,
                pixCode: pixData?.qr_code,
                pixQrCode: pixData?.qr_code_base64
                    ? `data:image/png;base64,${pixData.qr_code_base64}`
                    : undefined,
                pixQrCodeBase64: pixData?.qr_code_base64,
                ticketUrl: data.point_of_interaction?.transaction_data?.ticket_url,
                expiresAt: expirationDate,
                status: data.status,
            };
        } catch (error: unknown) {
            const paymentError = PaymentErrorHandler.handle(error);
            PaymentErrorHandler.log(paymentError, 'createPixPayment');
            
            return {
                success: false,
                error: {
                    code: paymentError.code,
                    message: paymentError.message,
                },
            };
        }
    }

    // ==========================================
    // CONSULTAR STATUS DO PAGAMENTO
    // ==========================================

    /**
     * Consulta o status de um pagamento no Mercado Pago
     */
    async getPaymentStatus(paymentId: string): Promise<PaymentStatus | null> {
        try {
            const response = await fetch(`${PaymentConfig.mercadoPago.apiUrl}/v1/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${PaymentConfig.mercadoPago.accessToken}`,
                },
            });

            if (!response.ok) {
                console.error('Erro ao consultar pagamento:', await response.text());
                return null;
            }

            const data: MercadoPagoPaymentResponse = await response.json();

            return {
                id: data.id.toString(),
                status: data.status,
                statusDetail: data.status_detail,
                amount: data.transaction_amount,
                creditsAmount: data.metadata?.credits_amount || 0,
                paidAt: data.date_approved ? new Date(data.date_approved) : undefined,
                expiresAt: data.date_of_expiration ? new Date(data.date_of_expiration) : undefined,
            };
        } catch (error) {
            console.error('Erro ao consultar status:', error);
            return null;
        }
    }

    // ==========================================
    // PROCESSAR WEBHOOK
    // ==========================================

    /**
     * Processa webhook do Mercado Pago
     * Esta função deve ser chamada pelo endpoint de webhook do backend
     */
    async processWebhook(payload: WebhookPayload, signature?: string): Promise<boolean> {
        try {
            // Validar assinatura (em produção)
            if (MERCADO_PAGO_CONFIG.webhookSecret && signature) {
                // TODO: Implementar validação de assinatura x-signature
                // const isValid = this.validateSignature(payload, signature);
                // if (!isValid) return false;
            }

            // Processar apenas notificações de pagamento
            if (payload.type !== 'payment') {
                console.log('Webhook ignorado - tipo:', payload.type);
                return true;
            }

            // Buscar detalhes do pagamento
            const paymentId = payload.data.id;
            const status = await this.getPaymentStatus(paymentId);

            if (!status) {
                console.error('Não foi possível obter status do pagamento:', paymentId);
                return false;
            }

            // Buscar transação no banco
            const { data: transaction, error: findError } = await getSupabase()
                .from('payment_transactions')
                .select('*')
                .eq('gateway_transaction_id', paymentId)
                .single();

            if (findError || !transaction) {
                console.error('Transação não encontrada:', paymentId);
                return false;
            }

            // Se já foi processada, ignorar
            if (transaction.status === 'completed' || transaction.status === 'approved') {
                console.log('Transação já processada:', paymentId);
                return true;
            }

            // Processar baseado no status
            if (status.status === 'approved') {
                return await this.handleApprovedPayment(transaction, status);
            } else if (status.status === 'rejected' || status.status === 'cancelled') {
                return await this.handleFailedPayment(transaction, status);
            }

            // Atualizar status no banco
            await getSupabase()
                .from('payment_transactions')
                .update({
                    status: status.status,
                    status_message: status.statusDetail,
                    metadata: {
                        ...transaction.metadata,
                        last_status_check: new Date().toISOString(),
                    },
                })
                .eq('id', transaction.id);

            return true;
        } catch (error) {
            console.error('Erro ao processar webhook:', error);
            return false;
        }
    }

    // ==========================================
    // PROCESSAR PAGAMENTO APROVADO
    // ==========================================

    private async handleApprovedPayment(transaction: any, status: PaymentStatus): Promise<boolean> {
        try {
            const userId = transaction.user_id;
            const creditsAmount = transaction.metadata?.credits_amount || 0;
            const bonusCredits = transaction.metadata?.bonus_credits || 0;
            const totalCredits = creditsAmount + bonusCredits;

            // Iniciar transação no banco
            // Adicionar créditos ao usuário
            const { data: userCredits, error: creditsError } = await getSupabase()
                .from('user_credits')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (creditsError || !userCredits) {
                // Criar registro se não existir
                await getSupabase().from('user_credits').insert({
                    user_id: userId,
                    balance: totalCredits,
                    total_purchased: creditsAmount,
                    bonus_credits: bonusCredits,
                    total_bonus: bonusCredits,
                    last_transaction_at: new Date().toISOString(),
                });
            } else {
                // Atualizar saldo existente
                await getSupabase()
                    .from('user_credits')
                    .update({
                        balance: userCredits.balance + totalCredits,
                        total_purchased: userCredits.total_purchased + creditsAmount,
                        bonus_credits: userCredits.bonus_credits + bonusCredits,
                        total_bonus: userCredits.total_bonus + bonusCredits,
                        current_month_purchased: userCredits.current_month_purchased + creditsAmount,
                        last_transaction_at: new Date().toISOString(),
                    })
                    .eq('user_id', userId);
            }

            // Registrar transação de créditos
            const newBalance = (userCredits?.balance || 0) + totalCredits;
            await getSupabase().from('credit_transactions').insert({
                user_id: userId,
                type: 'credit',
                status: 'completed',
                amount: transaction.amount,
                credits_amount: totalCredits,
                balance_after: newBalance,
                description: `Recarga PIX - ${transaction.metadata?.package_id || 'Avulso'}`,
                metadata: {
                    payment_transaction_id: transaction.id,
                    gateway_transaction_id: transaction.gateway_transaction_id,
                    package_id: transaction.metadata?.package_id,
                    credits: creditsAmount,
                    bonus: bonusCredits,
                },
                processed_at: new Date().toISOString(),
            });

            // Atualizar transação de pagamento
            await getSupabase()
                .from('payment_transactions')
                .update({
                    status: 'completed',
                    paid_at: status.paidAt?.toISOString() || new Date().toISOString(),
                    metadata: {
                        ...transaction.metadata,
                        processed_at: new Date().toISOString(),
                        credits_added: totalCredits,
                    },
                })
                .eq('id', transaction.id);

            // Log de webhook
            await getSupabase().from('webhook_logs').insert({
                provider: 'mercadopago',
                event_type: 'payment.approved',
                payload: {
                    payment_id: transaction.gateway_transaction_id,
                    transaction_id: transaction.id,
                    user_id: userId,
                    amount: transaction.amount,
                    credits: totalCredits,
                },
                status: 'processed',
                processed_at: new Date().toISOString(),
            });

            console.log(`✅ Pagamento aprovado! Créditos adicionados: ${totalCredits} para usuário ${userId}`);
            return true;
        } catch (error) {
            console.error('Erro ao processar pagamento aprovado:', error);

            // Log de erro
            await getSupabase().from('webhook_logs').insert({
                provider: 'mercadopago',
                event_type: 'payment.approved',
                payload: { transaction_id: transaction.id, error: String(error) },
                status: 'failed',
                error_message: String(error),
            });

            return false;
        }
    }

    // ==========================================
    // PROCESSAR PAGAMENTO FALHOU/CANCELADO
    // ==========================================

    private async handleFailedPayment(transaction: any, status: PaymentStatus): Promise<boolean> {
        try {
            await getSupabase()
                .from('payment_transactions')
                .update({
                    status: status.status === 'rejected' ? 'failed' : 'cancelled',
                    status_message: status.statusDetail,
                    metadata: {
                        ...transaction.metadata,
                        failed_at: new Date().toISOString(),
                        failure_reason: status.statusDetail,
                    },
                })
                .eq('id', transaction.id);

            console.log(`❌ Pagamento ${status.status}: ${transaction.id}`);
            return true;
        } catch (error) {
            console.error('Erro ao processar pagamento falho:', error);
            return false;
        }
    }

    // ==========================================
    // POLLING DE STATUS
    // ==========================================

    /**
     * Verifica status do pagamento periodicamente
     * Usar como fallback caso webhook falhe
     */
    async pollPaymentStatus(
        paymentId: string,
        transactionId: string,
        intervalMs: number = 5000,
        maxAttempts: number = 60
    ): Promise<PaymentStatus | null> {
        let attempts = 0;

        return new Promise((resolve) => {
            const checkStatus = async () => {
                attempts++;

                const status = await this.getPaymentStatus(paymentId);

                if (status?.status === 'approved') {
                    // Processar pagamento aprovado
                    const { data: transaction } = await getSupabase()
                        .from('payment_transactions')
                        .select('*')
                        .eq('id', transactionId)
                        .single();

                    if (transaction && transaction.status !== 'completed') {
                        await this.handleApprovedPayment(transaction, status);
                    }

                    resolve(status);
                    return;
                }

                if (status?.status === 'rejected' || status?.status === 'cancelled') {
                    resolve(status);
                    return;
                }

                if (attempts >= maxAttempts) {
                    resolve(status);
                    return;
                }

                // Continuar verificando
                setTimeout(checkStatus, intervalMs);
            };

            checkStatus();
        });
    }

    // ==========================================
    // UTILITÁRIOS
    // ==========================================

    /**
     * Formata valor em moeda
     */
    formatCurrency(value: number): string {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    }

    /**
     * Calcula tempo restante para expiração
     */
    getTimeRemaining(expiresAt: Date): { minutes: number; seconds: number; expired: boolean } {
        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();

        if (diff <= 0) {
            return { minutes: 0, seconds: 0, expired: true };
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return { minutes, seconds, expired: false };
    }
}

// Exportar instância singleton
export const pixPaymentService = PixPaymentService.getInstance();
export default pixPaymentService;
