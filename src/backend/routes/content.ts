
import { Router } from 'express';
import { prisma } from '../prisma';
// import { generateArticle } from '../lib/openai'; // Mocking this for now
import { calculateWordCost } from '../lib/utils'; // Need to create this or mock

const router = Router();

// Mock generateArticle function
const generateArticle = async (params: any) => {
    return {
        content: `<h1>${params.topic}</h1><p>This is a generated article about ${params.topic}...</p>`,
        wordCount: params.wordCount || 1000
    };
};

// Mock calculateWordCost
const calculateWordCostMock = (wordCount: number, model: string) => {
    const rate = model === 'gpt-4' ? 0.012 : 0.00089;
    return wordCount * rate;
};

const requireAuth = (req: any, res: any, next: any) => {
    // Mock auth
    if (!req.user) req.user = { id: 'default-user-id' };
    next();
};

router.post('/generate', requireAuth, async (req: any, res) => {
    try {
        const userId = req.user?.id || 'default-user-id';
        const { type, topic, keywords, wordCount, tone, model } = req.body;

        if (!topic) {
            return res.status(400).json({ error: "Tema/tópico é obrigatório" });
        }

        // Ensure user exists (dev)
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            user = await prisma.user.create({
                data: { id: userId, email: 'dev@example.com', name: 'Dev User' }
            });
        }

        const estimatedCost = calculateWordCostMock(wordCount || 1000, model || 'gpt-4-turbo');

        // Check credits (using Wallet model if possible, or User credits field if schema allows)
        // The schema has Wallet. Let's try to use Wallet.
        let wallet = await prisma.wallet.findUnique({ where: { userId } });
        if (!wallet) {
            wallet = await prisma.wallet.create({ data: { userId, balance: 100 } }); // Give some free credits for dev
        }

        // @ts-ignore
        if (wallet.balance < estimatedCost) {
            return res.status(402).json({ error: "Créditos insuficientes" });
        }

        const result = await generateArticle({
            topic,
            keywords: keywords || [],
            wordCount: wordCount || 1000,
            tone: tone || 'profissional',
            model: model || 'gpt-4-turbo',
        });

        const actualCost = calculateWordCostMock(result.wordCount, model || 'gpt-4-turbo');

        // Deduct credits
        const newBalance = Number(wallet.balance) - actualCost;
        await prisma.wallet.update({
            where: { id: wallet.id },
            data: { balance: newBalance },
        });

        const content = await prisma.aiContent.create({
            data: {
                userId: user.id,
                type: 'ARTICLE', // Enum value
                title: topic,
                body: result.content,
                cost: actualCost,
                status: 'DRAFT',
                // metadata: { keywords, tone, model } // Schema doesn't have metadata on AiContent? 
                // Wait, schema has `tokensUsed`. Let's skip metadata for now or add it to schema.
                // Schema provided in step 117 has `AiContent` with `body`, `type`, `status`, `cost`.
                // It does NOT have `metadata`. I will skip metadata.
            },
        });

        // Transaction
        await prisma.transaction.create({
            data: {
                walletId: wallet.id,
                type: 'USAGE_AI',
                amount: -actualCost, // Negative for usage
                description: `Geração de artigo: ${topic.substring(0, 50)}`,
                metadata: {
                    contentId: content.id,
                    wordCount: result.wordCount,
                    model,
                },
            },
        });

        res.json({
            id: content.id,
            title: topic,
            content: result.content,
            wordCount: result.wordCount,
            cost: actualCost,
            newBalance,
            message: "Conteúdo gerado com sucesso!",
        });
    } catch (error: any) {
        console.error("Erro ao gerar conteúdo:", error);
        res.status(500).json({ error: error.message || "Erro ao gerar conteúdo" });
    }
});

export default router;
