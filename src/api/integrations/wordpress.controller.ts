import { Router } from "express";
import { validateWordPressCredentials } from "../../services/wordpressService";

const router = Router();

// TODO: Implementar integração com WordPress
router.post("/connect", async (req, res) => {
    return res.status(501).json({
        error: "Endpoint não implementado",
        message: "A integração com WordPress será implementada em breve"
    });
});

router.post("/publish", async (req, res) => {
    return res.status(501).json({
        error: "Endpoint não implementado",
        message: "Publicação no WordPress será implementada em breve"
    });
});

router.post("/validate", async (req, res) => {
    try {
        const { wordpressUrl, wordpressUsername, wordpressAppPassword } = req.body;
        
        if (!wordpressUrl || !wordpressUsername || !wordpressAppPassword) {
            return res.status(400).json({
                success: false,
                message: "URL, usuário e senha de aplicativo são obrigatórios"
            });
        }
        
        const result = await validateWordPressCredentials({
            wordpressUrl,
            wordpressUsername,
            wordpressAppPassword
        });
        
        return res.json(result);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Erro desconhecido ao validar credenciais"
        });
    }
});

export default router;