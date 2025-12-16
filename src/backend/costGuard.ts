/**
 * Middleware para verificar e deduzir créditos antes de executar uma ação
 */

import { Request, Response, NextFunction } from 'express';
import { getBalance, spendCredits } from './creditLedger';

export function costGuard(cost: number) {
    return (req: any, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        const balance = getBalance(userId);

        if (balance < cost) {
            return res.status(402).json({
                error: 'Créditos insuficientes',
                required: cost,
                current: balance
            });
        }

        // Deduzir créditos
        spendCredits(userId, cost);

        // Continuar para o próximo middleware/handler
        next();
    };
}
