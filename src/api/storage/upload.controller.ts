import { Router } from "express";
import multer from "multer";
import { uploadFile, getSignedDownloadUrl, deleteFile } from "../../common/utils/r2Client";
import { nanoid } from "nanoid";

const router = Router();

// Configurar multer para armazenar arquivos em memória
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
    },
});

/**
 * Upload de arquivo para o R2
 * POST /upload
 * Body: FormData com campo "file"
 */
router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "Nenhum arquivo enviado" });
        }

        const userId = (req as any).user?.id || "anonymous"; // Assumindo middleware de auth
        const fileId = nanoid();
        const ext = req.file.originalname.split(".").pop();
        const key = `uploads/${userId}/${fileId}.${ext}`;

        await uploadFile(key, req.file.buffer, req.file.mimetype);

        return res.json({
            success: true,
            fileKey: key,
            fileName: req.file.originalname,
            size: req.file.size,
            mimeType: req.file.mimetype,
        });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * Obter URL de download assinada
 * GET /download/:key
 */
router.get("/download/*", async (req, res) => {
    try {
        const key = req.params[0]; // Captura o caminho completo após /download/
        const url = await getSignedDownloadUrl(key, 3600); // 1 hora de validade

        return res.json({ url });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

/**
 * Deletar arquivo
 * DELETE /delete/:key
 */
router.delete("/delete/*", async (req, res) => {
    try {
        const key = req.params[0];
        await deleteFile(key);

        return res.json({ success: true, message: "Arquivo deletado com sucesso" });
    } catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
});

export default router;
