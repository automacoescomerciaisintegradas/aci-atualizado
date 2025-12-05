import { Router } from "express";

const router = Router();

// TODO: Implementar lógica de recarga de créditos
router.post("/", async (req, res) => {
    return res.status(501).json({
        error: "Endpoint não implementado",
        message: "A funcionalidade de recarga será implementada em breve"
    });
});

export default router;
