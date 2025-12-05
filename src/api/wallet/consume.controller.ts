import { Router } from "express";

const router = Router();

// TODO: Implementar lógica de consumo de créditos
router.post("/", async (req, res) => {
    return res.status(501).json({
        error: "Endpoint não implementado",
        message: "A funcionalidade de consumo será implementada em breve"
    });
});

export default router;
