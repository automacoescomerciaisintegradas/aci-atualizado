import { Router } from "express";

const router = Router();

// TODO: Implementar integração com Telegram
router.post("/connect", async (req, res) => {
    return res.status(501).json({
        error: "Endpoint não implementado",
        message: "A integração com Telegram será implementada em breve"
    });
});

router.post("/send", async (req, res) => {
    return res.status(501).json({
        error: "Endpoint não implementado",
        message: "Envio de mensagens via Telegram será implementado em breve"
    });
});

export default router;
