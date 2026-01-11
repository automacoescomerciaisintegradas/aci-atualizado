import React, { useState } from 'react';
import { ChevronLeftIcon, ReceiptIcon, FileTextIcon, DownloadIcon, SearchIcon, FilterIcon } from './Icons';
import type { Page } from '../App';

interface Order {
    id: string;
    date: string;
    package: string;
    credits: number;
    amount: string;
    status: 'Aprovado' | 'Pendente' | 'Cancelado';
    method: 'PIX' | 'Cartão';
}

interface UserOrdersPageProps {
    onNavigate: (page: Page) => void;
}

export const UserOrdersPage: React.FC<UserOrdersPageProps> = ({ onNavigate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Dados dos pedidos (Inicia vazio para o usuário)
    const orders: Order[] = [];

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.package.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || order.status.toLowerCase() === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'Aprovado': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'Pendente': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Cancelado': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    const totalCredits = orders.filter(o => o.status === 'Aprovado').reduce((sum, o) => sum + o.credits, 0);
    const totalSpent = orders
        .filter(o => o.status === 'Aprovado')
        .reduce((sum, o) => {
            const val = parseFloat(o.amount.replace('R$ ', '').replace('.', '').replace(',', '.'));
            return sum + (isNaN(val) ? 0 : val);
        }, 0);

    return (
        <div className="animate-fade-in max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => onNavigate('home')}
                    className="glass hover:bg-white/10 p-2.5 rounded-xl text-dark-text-secondary transition-all duration-300"
                >
                    <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
                        <ReceiptIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Meus Pedidos</h1>
                        <p className="text-sm text-dark-text-secondary">Histórico de compras e faturas</p>
                    </div>
                </div>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="card-premium p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-text-secondary text-sm">Total de Pedidos</span>
                        <ReceiptIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-3xl font-bold text-white">{orders.length}</div>
                    <p className="text-xs text-dark-text-secondary mt-1">pedidos realizados</p>
                </div>

                <div className="card-premium p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-text-secondary text-sm">Créditos Comprados</span>
                        <span className="text-green-400">💎</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{totalCredits.toLocaleString('pt-BR')}</div>
                    <p className="text-xs text-dark-text-secondary mt-1">créditos totais</p>
                </div>

                <div className="card-premium p-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-dark-text-secondary text-sm">Total Investido</span>
                        <span className="text-amber-400">💰</span>
                    </div>
                    <div className="text-3xl font-bold text-white">R$ {totalSpent.toFixed(2).replace('.', ',')}</div>
                    <p className="text-xs text-dark-text-secondary mt-1">em compras</p>
                </div>
            </div>

            {/* Filtros e Busca */}
            <div className="card-premium p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Busca */}
                    <div className="relative flex-1">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-dark-text-secondary" />
                        <input
                            type="text"
                            placeholder="Buscar por ID ou pacote..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800/50 border border-dark-border rounded-xl p-3 pl-12 text-white focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                        />
                    </div>

                    {/* Filtro de Status */}
                    <div className="flex items-center gap-2">
                        <FilterIcon className="h-5 w-5 text-dark-text-secondary" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-slate-800/50 border border-dark-border rounded-xl p-3 text-white focus:border-brand-primary transition-all"
                        >
                            <option value="all">Todos os Status</option>
                            <option value="aprovado">Aprovados</option>
                            <option value="pendente">Pendentes</option>
                            <option value="cancelado">Cancelados</option>
                        </select>
                    </div>

                    {/* Botão Exportar */}
                    <button className="flex items-center gap-2 px-4 py-3 glass rounded-xl text-dark-text-secondary hover:text-white transition-colors">
                        <DownloadIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Exportar</span>
                    </button>
                </div>
            </div>

            {/* Tabela de Pedidos */}
            <div className="card-premium overflow-hidden">
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-16">
                        <ReceiptIcon className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                        <p className="text-dark-text-secondary text-lg mb-2">Nenhum pedido encontrado</p>
                        <p className="text-sm text-dark-text-secondary">
                            {searchTerm || filterStatus !== 'all'
                                ? 'Tente ajustar os filtros de busca'
                                : 'Seus pedidos aparecerão aqui após a primeira compra'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Pedido</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Data</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Pacote</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Créditos</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Valor</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Pagamento</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-dark-text-secondary uppercase tracking-wider">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-dark-border">
                                {filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm text-white">{order.id}</span>
                                        </td>
                                        <td className="px-6 py-4 text-dark-text-secondary">{order.date}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-purple-400 font-medium">{order.package}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white font-semibold">{order.credits.toLocaleString('pt-BR')}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white font-semibold">{order.amount}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-2 text-dark-text-secondary">
                                                {order.method === 'PIX' ? '💚' : '💳'}
                                                {order.method}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-brand-primary hover:text-brand-secondary text-sm font-medium transition-colors">
                                                Ver Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Paginação (simplificada) */}
            {filteredOrders.length > 0 && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-dark-text-secondary">
                        Mostrando <span className="text-white font-medium">{filteredOrders.length}</span> de <span className="text-white font-medium">{orders.length}</span> pedidos
                    </p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 glass rounded-xl text-dark-text-secondary hover:text-white transition-colors" disabled>
                            Anterior
                        </button>
                        <button className="px-4 py-2 gradient-primary text-white rounded-xl">
                            1
                        </button>
                        <button className="px-4 py-2 glass rounded-xl text-dark-text-secondary hover:text-white transition-colors" disabled>
                            Próximo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserOrdersPage;
