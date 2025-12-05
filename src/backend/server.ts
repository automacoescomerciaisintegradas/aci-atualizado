import express from "express";
import { authMiddleware } from "./auth";
import { costGuard } from "./costGuard";
import { addCredits, spendCredits, getBalance } from "./creditLedger";

import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Public route – health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

// Auth routes
app.post("/auth/login", (req, res) => {
    // Stub login – accepts any email, returns token
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "email required" });
    }
    const token = generateToken({ id: email, email });
    res.json({ token });
});

// Protected credit routes
app.use(authMiddleware);

app.get("/credits/balance", (req: any, res) => {
    const userId = req.user.id;
    const balance = getBalance(userId);
    res.json({ balance });
});

app.post("/credits/add", (req: any, res) => {
    const userId = req.user.id;
    const { amount } = req.body;
    if (typeof amount !== "number" || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount" });
    }
    addCredits(userId, amount);
    res.json({ balance: getBalance(userId) });
});

// Example protected action that costs credits – uses costGuard middleware
app.post("/actions/generate", costGuard(5), (req: any, res) => {
    // Here you would call AI worker etc.
    res.json({ message: "Action executed, 5 credits deducted" });
});


import blogsRouter from './routes/blogs';
import { generateArticle } from './lib/openai'; // We need to create this or mock it
import { prisma } from './prisma';

app.use('/api/blogs', blogsRouter);

// Content Generation Route (Mocked for now as per prompt request "Implementação Completa" but openai lib is missing)
// I will create a simple mock for openai lib or inline it here to satisfy the request without creating too many files if possible, 
// but the user prompt implies a full implementation.
// Let's mount the content generation route here directly or in a separate file.
// The user provided `app/api/content/generate/route.ts`. I should probably create `src/backend/routes/content.ts`.
// For now, I'll inline it to save steps, or better, create the route file.
// Let's create `src/backend/routes/content.ts` and mount it.

import contentRouter from './routes/content';
import instagramRouter from './routes/instagram';

app.use('/api/content', contentRouter);
app.use('/api/integrations/instagram', instagramRouter);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend listening on http://localhost:${PORT}`);
});


// Helper to generate token (re‑use auth.ts implementation)
import { generateToken } from "./auth";
