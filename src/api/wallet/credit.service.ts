import { prisma } from "@/db/prisma/client";
import { CreditTxType } from "@prisma/client";

/**
 * Consome créditos da carteira do usuário de forma atômica.
 * Lança erro caso o saldo seja insuficiente.
 */
export async function consumeCredits({
    userId,
    action,
    quantity,
}: {
    userId: string;
    action: "WORD" | "POST_SEND" | "IMAGE_GENERATION";
    quantity: number;
}) {
    // Busca preço unitário
    const pricing = await prisma.pricing.findUnique({
        where: { action: action as any },
    });
    if (!pricing) throw new Error("Preço não configurado para a ação " + action);

    const totalCost = pricing.unitCostCents * quantity;

    return await prisma.$transaction(async (tx) => {
        const wallet = await tx.wallet.findUnique({
            where: { userId },
            select: { id: true, balanceCents: true },
        });
        if (!wallet) throw new Error("Carteira não encontrada");
        if (wallet.balanceCents < totalCost) {
            throw new Error("Saldo insuficiente");
        }

        // Atualiza saldo
        await tx.wallet.update({
            where: { id: wallet.id },
            data: { balanceCents: { decrement: totalCost } },
        });

        // Registra transação
        await tx.creditTransaction.create({
            data: {
                walletId: wallet.id,
                amountCents: -totalCost,
                type: CreditTxType.CONSUME,
                description: `${action} – ${quantity} unidades`,
            },
        });

        return { newBalanceCents: wallet.balanceCents - totalCost };
    });
}

/**
 * Recarrega a carteira do usuário (ex.: após pagamento PIX).
 */
export async function rechargeWallet({
    userId,
    amountCents,
}: {
    userId: string;
    amountCents: number;
}) {
    const wallet = await prisma.wallet.upsert({
        where: { userId },
        create: { userId, balanceCents: amountCents },
        update: { balanceCents: { increment: amountCents } },
    });

    await prisma.creditTransaction.create({
        data: {
            walletId: wallet.id,
            amountCents,
            type: CreditTxType.RECHARGE,
            description: "Recarga via PIX",
        },
    });

    return { newBalanceCents: wallet.balanceCents };
}
