import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';

interface Credit {
    id: number;
    date: string;
    type: string;
    description: string;
    amount: string;
    credits: string;
}

export const CreditDashboard: React.FC = () => {
    const [balance, setBalance] = useState<number | null>(null);
    const [transactions, setTransactions] = useState<Credit[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Assume userId is stored in apiClient (set after login)
                const userId = apiClient.getUserId();
                if (!userId) throw new Error('User not logged in');
                const [balanceRes, txRes] = await Promise.all([
                    apiClient.getCredits(),
                    apiClient.getCreditTransactions(),
                ]);
                // The backend returns { balance } and { transactions }
                setBalance(balanceRes?.credits?.balance ?? balanceRes?.balance ?? 0);
                setTransactions(txRes?.transactions ?? []);
            } catch (err: any) {
                setError(err.message || 'Failed to load credits');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-4">Carregando créditos...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Saldo de Créditos</h2>
            <div className="text-xl mb-6">{balance?.toLocaleString()} créditos</div>

            <h3 className="text-xl font-semibold mb-2">Histórico de Transações</h3>
            {transactions.length === 0 ? (
                <p>Nenhuma transação encontrada.</p>
            ) : (
                <table className="min-w-full bg-white dark:bg-gray-800 rounded shadow">
                    <thead>
                        <tr className="bg-gray-200 dark:bg-gray-700">
                            <th className="px-4 py-2 text-left">Data</th>
                            <th className="px-4 py-2 text-left">Tipo</th>
                            <th className="px-4 py-2 text-left">Descrição</th>
                            <th className="px-4 py-2 text-right">Créditos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="border-t">
                                <td className="px-4 py-2">{tx.date}</td>
                                <td className="px-4 py-2">{tx.type}</td>
                                <td className="px-4 py-2">{tx.description}</td>
                                <td className="px-4 py-2 text-right">{tx.credits}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};
