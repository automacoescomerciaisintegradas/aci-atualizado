import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setPaymentMethods(data || []);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Você precisa estar logado para adicionar um cartão');
        setLoading(false);
        return;
      }

      // In a real implementation, you would tokenize the card details first
      // This is a simplified version for demonstration
      const cardData = {
        user_id: user.id,
        type: 'card',
        last4: newCard.number.slice(-4),
        expiry_month: parseInt(newCard.expiry_month),
        expiry_year: parseInt(newCard.expiry_year),
        is_default: paymentMethods.length === 0
      };

      const { error } = await supabase
        .from('payment_methods')
        .insert([cardData]);

      if (error) throw error;

      // Reset form and refresh list
      setNewCard({
        number: '',
        expiry_month: '',
        expiry_year: '',
        cvv: '',
        name: ''
      });
      setShowAddForm(false);
      fetchPaymentMethods();
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
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchPaymentMethods();
      alert('Método de pagamento removido com sucesso!');
    } catch (error: any) {
      console.error('Erro ao remover método de pagamento:', error);
      alert('Erro ao remover método de pagamento. Tente novamente.');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, unset all defaults
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Then set the new default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      fetchPaymentMethods();
    } catch (error: any) {
      console.error('Erro ao definir método padrão:', error);
      alert('Erro ao definir método padrão. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <CreditCardIcon className="w-8 h-8 text-brand-primary" />
            Métodos de Pagamento
          </h1>
          <p className="text-gray-400">
            Gerencie seus métodos de pagamento para futuras cobranças
          </p>
        </div>

        {/* Payment Methods List */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-8">
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
              <p className="text-gray-400 mt-2">Carregando métodos de pagamento...</p>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-12">
              <CreditCardIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Nenhum método de pagamento salvo</h3>
              <p className="text-gray-400 mb-4">Adicione um método para futuras cobranças</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-brand-primary hover:bg-brand-primary/90 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Adicionar método de pagamento
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    method.is_default
                      ? 'bg-blue-900/20 border-blue-700'
                      : 'bg-slate-900/50 border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-700 p-3 rounded-lg">
                      <CreditCardIcon className="w-6 h-6 text-gray-300" />
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
                      <p className="text-gray-400 text-sm">
                        Terminado em {method.last4} • {method.expiry_month.toString().padStart(2, '0')}/{method.expiry_year}
                      </p>
                      <p className="text-gray-500 text-xs">
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
        </div>

        {/* Add Payment Method Form */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Adicionar Cartão</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nome no Cartão
                  </label>
                  <input
                    type="text"
                    value={newCard.name}
                    onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Número do Cartão
                  </label>
                  <input
                    type="text"
                    value={newCard.number}
                    onChange={(e) => setNewCard({ ...newCard, number: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Validade (Mês)
                    </label>
                    <input
                      type="text"
                      value={newCard.expiry_month}
                      onChange={(e) => setNewCard({ ...newCard, expiry_month: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      placeholder="MM"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Validade (Ano)
                    </label>
                    <input
                      type="text"
                      value={newCard.expiry_year}
                      onChange={(e) => setNewCard({ ...newCard, expiry_year: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                      placeholder="AAAA"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={newCard.cvv}
                    onChange={(e) => setNewCard({ ...newCard, cvv: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white"
                    placeholder="123"
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 px-4 rounded-lg transition-colors"
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
          </div>
        )}
      </div>
    </div>
  );
};