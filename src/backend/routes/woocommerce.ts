import { Router } from 'express';
import { testWooCommerceConnection } from '../lib/woocommerce';

const router = Router();

// POST - Validar credenciais (Proxy para evitar CORS)
router.post('/validate', async (req, res) => {
    try {
        const { url, consumerKey, consumerSecret } = req.body;

        if (!url || !consumerKey || !consumerSecret) {
            return res.status(400).json({
                success: false,
                message: "Todos os campos (URL, Consumer Key, Consumer Secret) são obrigatórios"
            });
        }

        const result = await testWooCommerceConnection({
            url,
            consumerKey,
            consumerSecret
        });

        res.json(result);
    } catch (error: any) {
        console.error("Erro na validação WooCommerce:", error);
        res.status(500).json({
            success: false,
            message: "Erro interno na validação do WooCommerce"
        });
    }
});

export default router;
