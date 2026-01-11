import React, { useState, useEffect } from 'react';
import { apiClient } from '../src/services/apiClient';
import { CreditCardIcon, PlusIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from './Icons';

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  created_at: string;
}

export const PaymentMethodsPage: React.FC = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    name: ''
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const userId = apiClient.getUserId();
      if (!userId) {
        setLoading(false);
        return;
      }

      // TODO: Implementar endpoint /api/payment-methods no Worker
      // Por enquanto, retornar lista vazia
      console.log('📦 Buscando métodos de pagamento para:', userId);
      setPaymentMethods([]);
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userId = apiClient.getUserId();
      if (!userId) {
        alert('Você precisa estar logado para adicionar um cartão');
        setLoading(false);
        return;
      }

      // TODO: Implementar endpoint /api/payment-methods no Worker
      // Em produção, usar gateway de pagamento (Stripe, Mercado Pago, etc)
      console.log('💳 Adicionando cartão para:', userId);

      // Simular adição de cartão
      const cardData: PaymentMethod = {
        id: crypto.randomUUID(),
        type: 'card',
        last4: newCard.number.slice(-4),
        expiry_month: parseInt(newCard.expiry_month),
        expiry_year: parseInt(newCard.expiry_year),
        is_default: paymentMethods.length === 0,
        created_at: new Date().toISOString()
      };

      setPaymentMethods([...paymentMethods, cardData]);

      // Reset form
      setNewCard({
        number: '',
        expiry_month: '',
        expiry_year: '',
        cvv: '',
        name: ''
      });
      setShowAddForm(false);
      alert('Cartão adicionado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao adicionar cartão:', error);
      alert('Erro ao adicionar cartão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este método de pagamento?')) return;

    try {
      // TODO: Implementar endpoint DELETE /api/payment-methods/:id
      setPaymentMethods(paymentMethods.filter(m => m.id !== id));
      alert('Método de pagamento removido com sucesso!');
    } catch (error: any) {
      console.error('Erro ao remover método de pagamento:', error);
      alert('Erro ao remover método de pagamento. Tente novamente.');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // TODO: Implementar endpoint PUT /api/payment-methods/:id/default
      setPaymentMethods(paymentMethods.map(m => ({
        ...m,
        is_default: m.id === id
      })));
    } catch (error: any) {
      console.error('Erro ao definir método padrão:', error);
      alert('Erro ao definir método padrão. Tente novamente.');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center glow-primary">
          <CreditCardIcon className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Métodos de Pagamento</h1>
          <p className="text-sm text-dark-text-secondary">
            Gerencie seus métodos de pagamento para recargas de créditos. Pague somente pelo que usar.
          </p>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className="card-premium p-6 md:p-8 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Métodos Salvos</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Adicionar Novo
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
            <p className="text-dark-text-secondary mt-2">Carregando métodos de pagamento...</p>
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="space-y-6">
            <div className="text-center py-8">
              <CreditCardIcon className="w-12 h-12 text-dark-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nenhum método de pagamento salvo</h3>
              <p className="text-dark-text-secondary mb-4">Adicione um método para futuras recargas de créditos</p>
            </div>

            {/* Opções de pagamento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h4 className="font-bold text-white mb-3">Cartão de Crédito</h4>
                <p className="text-dark-text-secondary text-sm mb-4">Adicione um cartão para recargas automáticas de créditos</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  Adicionar Cartão
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${method.is_default
                  ? 'bg-blue-900/20 border-blue-700'
                  : 'bg-dark-card border-dark-border'
                  }`}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-slate-700 p-3 rounded-lg">
                    <CreditCardIcon className="w-6 h-6 text-dark-text-secondary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {method.type === 'card' ? 'Cartão de Crédito' : method.type}
                      </span>
                      {method.is_default && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="text-dark-text-secondary text-sm">
                      Terminado em {method.last4} • {method.expiry_month.toString().padStart(2, '0')}/{method.expiry_year}
                    </p>
                    <p className="text-dark-text-secondary text-xs">
                      Adicionado em {new Date(method.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!method.is_default && (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      Tornar padrão
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteCard(method.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Payment Method Form - Inline */}
        {showAddForm && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-6 mt-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Adicionar Cartão</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-dark-text-secondary hover:text-white"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                  Nome no Cartão
                </label>
                <input
                  type="text"
                  value={newCard.name}
                  onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                  className="w-full bg-slate-800 border border-dark-border rounded-lg px-4 py-2 text-dark-text-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  value={newCard.number}
                  onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                  className="w-full bg-slate-800 border border-dark-border rounded-lg px-4 py-2 text-dark-text-primary"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                    Validade (Mês)
                  </label>
                  <input
                    type="text"
                    value={newCard.expiry_month}
                    onChange={(e) => setNewCard({ ...newCard, expiry_month: e.target.value })}
                    className="w-full bg-slate-800 border border-dark-border rounded-lg px-4 py-2 text-dark-text-primary"
                    placeholder="MM"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                    Validade (Ano)
                  </label>
                  <input
                    type="text"
                    value={newCard.expiry_year}
                    onChange={(e) => setNewCard({ ...newCard, expiry_year: e.target.value })}
                    className="w-full bg-slate-800 border border-dark-border rounded-lg px-4 py-2 text-dark-text-primary"
                    placeholder="AAAA"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-text-secondary mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={newCard.cvv}
                  onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                  className="w-full bg-slate-800 border border-dark-border rounded-lg px-4 py-2 text-dark-text-primary"
                  placeholder="123"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-dark-text-primary py-2.5 px-4 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adicionando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Informações sobre o modelo pay-per-use */}
      <div className="mt-12 bg-slate-800/50 border border-dark-border rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Como funciona nosso modelo Pay-Per-Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dark-card p-4 rounded-lg">
            <div className="text-brand-primary text-2xl mb-2">1</div>
            <h4 className="font-semibold text-white mb-2">Pague Somente pelo que Usa</h4>
            <p className="text-dark-text-secondary text-sm">Você compra créditos e só paga quando realmente utiliza nossas ferramentas.</p>
          </div>
          <div className="bg-dark-card p-4 rounded-lg">
            <div className="text-brand-primary text-2xl mb-2">2</div>
            <h4 className="font-semibold text-white mb-2">Transações Individuais</h4>
            <p className="text-dark-text-secondary text-sm">Cada ação (publicação, geração de conteúdo, etc.) consome créditos individualmente.</p>
          </div>
          <div className="bg-dark-card p-4 rounded-lg">
            <div className="text-brand-primary text-2xl mb-2">3</div>
            <h4 className="font-semibold text-white mb-2">Sem Compromissos</h4>
            <p className="text-dark-text-secondary text-sm">Sem planos mensais ou anuais. Compre créditos conforme sua necessidade.</p>
          </div>
        </div>
      </div>
    </div>
  );
};