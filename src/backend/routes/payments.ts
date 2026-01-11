/**
 * =========================================
 * ACI - Rotas de Pagamento Mercado Pago
 * =========================================
 */

import { Router } from 'express';
import { authMiddleware } from '../auth';
import { addCredits } from '../creditLedger';

const router = Router();

// Configuração do Mercado Pago
const MP_CONFIG = {
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
    publicKey: process.env.MERCADOPAGO_PUBLIC_KEY || '',
    webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
    apiUrl: 'https://api.mercadopago.com',
};

// Pacotes de créditos disponíveis (Modelo Pay-per-use)
const CREDIT_PACKAGES = [
    { id: 'pack-50', value: 50.00, credits: 50000, bonus: 5000, name: 'Valor' },
    { id: 'pack-197', value: 197.00, credits: 250000, bonus: 25000, name: 'Valor' },
    { id: 'pack-397', value: 397.00, credits: 600000, bonus: 60000, name: 'Valor' },
    { id: 'pack-697', value: 697.00, credits: 1200000, bonus: 120000, name: 'Valor' },
    { id: 'pack-999', value: 999.00, credits: 2000000, bonus: 200000, name: 'Valor' },
];

// Bônus de 10% para qualquer recarga
const BONUS_PERCENTAGE = 0.10;

// ==========================================
// CRIAR PAGAMENTO PIX
// ==========================================
router.post('/create-pix', authMiddleware, async (req: any, res) => {
    try {
        const { amount, packageId, description } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        if (!amount || amount < 50) {
            return res.status(400).json({ error: 'Valor mínimo: R$ 50,00' });
        }

        if (!MP_CONFIG.accessToken) {
            return res.status(500).json({ error: 'Integração Mercado Pago não configurada' });
        }

        // Calcular créditos baseado no valor ou pacote
        const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
        const baseCredits = pkg ? pkg.credits : Math.floor(amount * 1000); // 1000/Real se for valor personalizado
        const bonusCredits = Math.floor(baseCredits * BONUS_PERCENTAGE);
        const totalCredits = baseCredits + bonusCredits;

        // Referência externa única
        const externalReference = `ACI-${userId.substring(0, 8)}-${Date.now()}`;

        // Data de expiração (30 minutos)
        const expirationDate = new Date();
        expirationDate.setMinutes(expirationDate.getMinutes() + 30);

        // Criar pagamento no Mercado Pago
        const paymentPayload = {
            transaction_amount: amount,
            description: description || `Recarga de ${totalCredits.toLocaleString('pt-BR')} créditos ACI`,
            payment_method_id: 'pix',
            external_reference: externalReference,
            notification_url: `${process.env.API_URL || 'http://localhost:4001'}/api/payments/webhook`,
            date_of_expiration: expirationDate.toISOString(),
            payer: {
                email: req.user?.email || 'cliente@aci.com.br',
                first_name: req.user?.name?.split(' ')[0] || 'Cliente',
                last_name: req.user?.name?.split(' ').slice(1).join(' ') || 'ACI',
            },
            metadata: {
                user_id: userId,
                credits_amount: baseCredits,
                bonus_credits: bonusCredits,
                total_credits: totalCredits,
                package_id: packageId,
            },
        };

        console.log('🔄 Criando pagamento PIX:', {
            amount,
            totalCredits,
            userId: userId.substring(0, 8),
        });

        const response = await fetch(`${MP_CONFIG.apiUrl}/v1/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MP_CONFIG.accessToken}`,
                'X-Idempotency-Key': externalReference,
            },
            body: JSON.stringify(paymentPayload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Erro Mercado Pago:', data);
            return res.status(response.status).json({
                error: data.message || 'Erro ao criar pagamento PIX',
                details: data,
            });
        }

        // Extrair dados do PIX
        const pixData = data.point_of_interaction?.transaction_data;

        console.log('✅ Pagamento PIX criado:', data.id);

        // Salvar no banco (se usando Prisma ou outro ORM)
        // await prisma.paymentTransaction.create({ ... });

        res.json({
            success: true,
            payment: {
                id: data.id.toString(),
                status: data.status,
                amount: amount,
                credits: totalCredits,
                baseCredits: baseCredits,
                bonusCredits: bonusCredits,
                expiresAt: expirationDate.toISOString(),
                pix: {
                    code: pixData?.qr_code,
                    qrCodeBase64: pixData?.qr_code_base64,
                    ticketUrl: pixData?.ticket_url,
                },
            },
        });
    } catch (error: any) {
        console.error('❌ Erro interno ao criar PIX:', error);
        res.status(500).json({
            error: 'Erro interno ao processar pagamento',
            message: error.message,
        });
    }
});

// ==========================================
// CONSULTAR STATUS DO PAGAMENTO
// ==========================================
router.get('/status/:paymentId', authMiddleware, async (req: any, res) => {
    try {
        const { paymentId } = req.params;

        if (!MP_CONFIG.accessToken) {
            return res.status(500).json({ error: 'Integração não configurada' });
        }

        const response = await fetch(`${MP_CONFIG.apiUrl}/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${MP_CONFIG.accessToken}`,
            },
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Pagamento não encontrado' });
        }

        const data = await response.json();

        res.json({
            id: data.id,
            status: data.status,
            statusDetail: data.status_detail,
            amount: data.transaction_amount,
            paidAt: data.date_approved,
            metadata: data.metadata,
        });
    } catch (error: any) {
        console.error('Erro ao consultar pagamento:', error);
        res.status(500).json({ error: 'Erro ao consultar pagamento' });
    }
});

// ==========================================
// WEBHOOK DO MERCADO PAGO
// ==========================================
router.post('/webhook', async (req, res) => {
    try {
        const { type, data, action } = req.body;

        console.log(`📩 Webhook MP: ${type} | ${action || 'n/a'} | ID: ${data?.id || 'n/a'}`);

        // Responder rapidamente ao MP
        res.status(200).send('OK');

        // Processar apenas pagamentos
        if (type !== 'payment') {
            return;
        }

        const paymentId = data?.id;
        if (!paymentId) {
            console.error('❌ Webhook sem payment ID');
            return;
        }

        // Buscar detalhes do pagamento
        const paymentResponse = await fetch(`${MP_CONFIG.apiUrl}/v1/payments/${paymentId}`, {
            headers: {
                'Authorization': `Bearer ${MP_CONFIG.accessToken}`,
            },
        });

        if (!paymentResponse.ok) {
            console.error('❌ Erro ao buscar pagamento:', paymentId);
            return;
        }

        const payment = await paymentResponse.json();
        const userId = payment.metadata?.user_id;
        const totalCredits = payment.metadata?.total_credits || 0;

        console.log('💳 Pagamento:', {
            id: payment.id,
            status: payment.status,
            userId: userId?.substring(0, 8),
            credits: totalCredits,
        });

        if (payment.status === 'approved') {
            if (userId && totalCredits > 0) {
                addCredits(userId, totalCredits);
                console.log(`✅ Pagamento Aprovado: ${totalCredits.toLocaleString('pt-BR')} créditos -> ${userId.substring(0, 8)}`);
            }
        } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
            console.log(`❌ Pagamento ${payment.status}: ${paymentId}`);
        }
    } catch (error) {
        console.error('❌ Erro no webhook:', error);
    }
});

// ==========================================
// PROCESSAR PAGAMENTO COM CARTÃO (BRICK)
// ==========================================
router.post('/process_payment', authMiddleware, async (req: any, res) => {
    try {
        const paymentData = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        if (!MP_CONFIG.accessToken) {
            return res.status(500).json({ error: 'Integração Mercado Pago não configurada' });
        }

        // Recuperar amount do body (pode vir como transaction_amount ou amount)
        const amount = paymentData.transaction_amount || paymentData.amount;

        if (!amount || amount < 1) {
            return res.status(400).json({ error: 'Valor inválido' });
        }

        // Calcular créditos
        // Tenta achar pacote pelo valor exato ou similar
        const pkg = CREDIT_PACKAGES.find(p => Math.abs(p.value - amount) < 0.1);
        const baseCredits = pkg ? pkg.credits : Math.floor(amount * 1000);
        const bonusCredits = Math.floor(baseCredits * BONUS_PERCENTAGE);
        const totalCredits = baseCredits + bonusCredits;

        const externalReference = `ACI-${userId.substring(0, 8)}-${Date.now()}`;

        // Montar payload para a API do MP
        // O Brick envia a maioria dos campos necessários, mas precisamos injetar segurança e metadados
        const payload = {
            ...paymentData,
            transaction_amount: amount,
            description: paymentData.description || `Recarga de ${totalCredits.toLocaleString('pt-BR')} créditos ACI`,
            notification_url: `${process.env.API_URL || 'http://localhost:4001'}/api/payments/webhook`,
            external_reference: externalReference,
            payer: {
                ...paymentData.payer,
                email: paymentData.payer?.email || req.user?.email || 'email@desconhecido.com'
            },
            metadata: {
                user_id: userId,
                credits_amount: baseCredits,
                bonus_credits: bonusCredits,
                total_credits: totalCredits,
                package_id: pkg?.id || 'custom',
            },
            additional_info: {
                items: [
                    {
                        id: pkg?.id || 'custom',
                        title: `Créditos ACI - ${totalCredits}`,
                        quantity: 1,
                        unit_price: amount
                    }
                ]
            }
        };

        console.log('💳 Processando pagamento cartão:', {
            userId: userId.substring(0, 8),
            amount,
            method: paymentData.payment_method_id
        });

        const response = await fetch(`${MP_CONFIG.apiUrl}/v1/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MP_CONFIG.accessToken}`,
                'X-Idempotency-Key': externalReference,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Erro Mercado Pago (Cartão):', data);
            return res.status(response.status).json({
                error: data.message || 'Erro ao processar pagamento com cartão',
                details: data,
                status: 'error'
            });
        }

        console.log(`✅ Pagamento processado: ${data.status} | ID: ${data.id}`);

        // O crédito será adicionado via Webhook quando o status for 'approved'
        // Mas retornamos o status atual para o frontend mostrar feedback

        res.json({
            id: data.id,
            status: data.status,
            status_detail: data.status_detail,
            credits: totalCredits,
            amount: amount,
            payment_method_id: data.payment_method_id,
            payment_type_id: data.payment_type_id
        });

    } catch (error: any) {
        console.error('❌ Erro interno ao processar cartão:', error);
        res.status(500).json({
            error: 'Erro interno ao processar pagamento',
            message: error.message,
        });
    }
});

// ==========================================
// LISTAR PACOTES DISPONÍVEIS
// ==========================================
router.get('/packages', (req, res) => {
    res.json({
        packages: CREDIT_PACKAGES,
        bonusPercentage: BONUS_PERCENTAGE * 100,
        minValue: 50,
        conversionRate: 1000, // R$ 1 = 1000 créditos
    });
});

export default router;
