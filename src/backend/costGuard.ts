/**
 * Middleware para verificar e deduzir créditos antes de executar uma ação
 */

import { Request, Response, NextFunction } from 'express';
import { creditService } from '../../services/simpleCreditService';

export function costGuard(cost: number) {
    return async (req: any, res: Response, next: NextFunction) => {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado' });
        }

        try {
            const credits = await creditService.getBalance(userId);
            const balance = credits?.balance || 0;

            if (balance < cost) {
                return res.status(402).json({
                    error: 'Créditos insuficientes',
                    required: cost,
                    current: balance
                });
            }

            // Deduzir créditos
            await creditService.spendCredits(userId, cost, 'Uso de serviço', 'cost-guard');

            // Continuar para o próximo middleware/handler
            next();
        } catch (error) {
            console.error('Erro no costGuard:', error);
            return res.status(500).json({ error: 'Erro ao verificar créditos' });
        }
    };
}
