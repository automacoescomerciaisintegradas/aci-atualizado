import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import axios from "axios";
import { generateToken } from "./auth";
import { authMiddleware } from "./auth";
import { costGuard } from "./costGuard";
import { addCredits, spendCredits, getBalance } from "./creditLedger";
import { sendPasswordResetEmail, sendWelcomeEmail } from "./emailService";
import { generateResetToken, validateResetToken, markTokenAsUsed } from "./passwordResetService";
import paymentsRoutes from "./routes/payments";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servir arquivos estáticos do Frontend (Pasta dist)
app.use(express.static(path.join(__dirname, "../../dist")));

// Rotas de Pagamentos (Mercado Pago)
app.use("/api/payments", paymentsRoutes);

// Public route – health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// Auth routes
app.post("/api/auth/login", (req, res) => {
    // Stub login – accepts any email, returns token
    const { email, password } = req.body;
    if (!email) {
        return res.status(400).json({ success: false, error: "email required" });
    }
    if (!password) {
        return res.status(400).json({ success: false, error: "password required" });
    }

    // Admin emails list
    const ADMIN_EMAILS = [

        'automacoescomerciais@gmail.com',
        'contato@automacoescomerciais.com.br',
        'admin@automacoescomerciais.com.br',
        'suporte@automacoescomerciais.com.br'
    ];
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

    const token = generateToken({ id: email, email, role: isAdmin ? 'admin' : 'user' });
    res.json({
        success: true,
        token,
        user: {
            id: email,
            email,
            full_name: email.split('@')[0],
            display_name: email.split('@')[0],
            role: isAdmin ? 'admin' : 'user',
            avatar_url: ''
        }
    });
});

// Signup route
app.post("/api/auth/signup", async (req, res) => {
    const { email, password, metadata } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, error: "email required" });
    }
    if (!password) {
        return res.status(400).json({ success: false, error: "password required" });
    }

    // Validação básica de senha
    if (password.length < 6) {
        return res.status(400).json({ success: false, error: "Password must be at least 6 characters" });
    }

    // BÔNUS DE BOAS-VINDAS: R$ 3,00 = 3000 créditos
    const WELCOME_BONUS = 3000;
    addCredits(email, WELCOME_BONUS);
    console.log(`✅ Novo usuário ${email} recebeu bônus de ${WELCOME_BONUS} créditos!`);

    // Envia e-mail de boas-vindas
    const userName = metadata?.full_name || email.split('@')[0];
    sendWelcomeEmail(email, userName).catch(err => {
        console.error('❌ Erro ao enviar e-mail de boas-vindas:', err);
    });

    const token = generateToken({ id: email, email, role: metadata?.role || 'user' });
    res.json({
        success: true,
        token,
        user: {
            id: email,
            email,
            full_name: metadata?.full_name || email.split('@')[0],
            display_name: metadata?.full_name || email.split('@')[0],
            phone: metadata?.phone || '',
            role: metadata?.role || 'user',
            avatar_url: '',
            credits: WELCOME_BONUS
        },
        message: `🎉 Bem-vindo! Você ganhou R$ 3,00 de bônus para começar!`
    });
});

// Password reset routes
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, error: 'Email é obrigatório' });
    }

    try {
        // Gera token de recuperação
        const resetToken = generateResetToken(email);

        // LOG PARA DEBUG (COPIE O LINK DAQUI SE O EMAIL NÃO CHEGAR)
        const debugLink = `http://localhost:3000/reset-password?token=${resetToken}`;
        console.log('\n==================================================');
        console.log('🔑 LINK DE RECUPERAÇÃO (DEBUG):');
        console.log(debugLink);
        console.log('==================================================\n');

        // Envia e-mail
        const emailSent = await sendPasswordResetEmail(email, resetToken);

        if (!emailSent) {
            console.error('❌ Falha ao enviar e-mail de recuperação para:', email);
            return res.status(500).json({
                success: false,
                error: 'Erro ao enviar e-mail. Verifique as configurações SMTP.'
            });
        }

        console.log('✅ E-mail de recuperação enviado para:', email);

        return res.json({
            success: true,
            message: 'E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.'
        });
    } catch (error) {
        console.error('❌ Erro no processo de recuperação de senha:', error);
        return res.status(500).json({
            success: false,
            error: 'Erro interno ao processar solicitação'
        });
    }
});

// Endpoint para validar token de reset
app.post('/api/auth/validate-reset-token', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({ success: false, error: 'Token é obrigatório' });
    }

    const validation = validateResetToken(token);

    if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
    }

    return res.json({ success: true, email: validation.email });
});

// Endpoint para resetar a senha
app.post('/api/auth/reset-password', (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({
            success: false,
            error: 'Token e nova senha são obrigatórios'
        });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            success: false,
            error: 'A senha deve ter no mínimo 6 caracteres'
        });
    }

    const validation = validateResetToken(token);

    if (!validation.valid) {
        return res.status(400).json({ success: false, error: validation.error });
    }

    // Marca o token como usado
    markTokenAsUsed(token);

    // TODO: Aqui você salvaria a nova senha no banco de dados
    // Por enquanto, apenas retornamos sucesso
    console.log(`✅ Senha resetada com sucesso para: ${validation.email}`);

    return res.json({
        success: true,
        message: 'Senha alterada com sucesso! Você já pode fazer login.'
    });
});

// Redirecionar rotas do Frontend para o index.html (SPA) - DEVE VIR ANTES DO AUTH MIDDLEWARE
app.get("*", (req, res, next) => {
    // Se a rota começar com /api ou /health, deixa passar para as rotas abaixo
    if (req.path.startsWith("/api") || req.path === "/health") {
        return next();
    }
    // Caso contrário, serve o index.html do frontend
    res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

// Middleware de Autenticação - Apenas para o que vem abaixo (APIs protegidas)
app.use(authMiddleware);

app.get("/api/credits/balance", (req: any, res) => {
    const userId = req.user.id;
    const balance = getBalance(userId);
    res.json({ balance });
});

app.post("/api/credits/add", (req: any, res) => {
    const userId = req.user.id;
    const { amount } = req.body;
    if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
    }
    addCredits(userId, amount);
    res.json({ balance: getBalance(userId) });
});

// Example protected action that costs credits – uses costGuard middleware
app.post("/api/actions/generate", costGuard(5), (req: any, res) => {
    // Here you would call AI worker etc.
    res.json({ message: "Action executed, 5 credits deducted" });
});

// Import routers (comentados até serem criados)
import blogsRouter from './routes/blogs';
// import contentRouter from './routes/content';
import instagramRouter from './routes/instagram';
import settingsRouter from './routes/settings';

// ...

app.use('/api/blogs', blogsRouter);
app.use('/api/integrations/instagram', instagramRouter);
app.use('/api/settings', settingsRouter);

app.get('/api/facebook/test', async (req: any, res: any) => {
    const { id, token, path, fields } = req.query;

    if (!id || !token) {
        return res.status(400).json({ error: 'ID e Token são obrigatórios. Use ?id=...&token=...' });
    }

    try {
        const pathParam = path ? `/${path}` : '';
        const fieldsParam = fields ? `?fields=${fields}` : '?fields=status';
        // Ensure clean URL construction
        const url = `https://graph.facebook.com/v24.0/${id}${pathParam}${fieldsParam}`;

        console.log(`🔍 Testando Facebook API: ${url}`);

        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Sucesso no teste do Facebook:', response.data);
        res.json(response.data);
    } catch (error: any) {
        console.error('❌ Erro no teste do Facebook:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: 'Erro ao conectar com Facebook',
            details: error.response?.data || error.message
        });
    }
});

import { cronService } from './cronService';

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`🚀 Backend rodando em http://localhost:${PORT}`);

    // Inicia o serviço de tarefas agendadas
    cronService.start();
});
