import { Router } from "express";

const router = Router();

// TODO: Implementar agendamento de tarefas
router.post("/", async (req, res) => {
    return res.status(501).json({
        error: "Endpoint não implementado",
        message: "O agendamento de tarefas será implementado em breve"
    });
});

router.get("/", async (req, res) => {
    return res.status(501).json({
        error: "Endpoint não implementado",
        message: "Listagem de tarefas agendadas será implementada em breve"
    });
});

export default router;
