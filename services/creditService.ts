/**
 * =========================================
 * ACI - Serviço Centralizado de Créditos
 * =========================================
 * 
 * Sistema unificado de gerenciamento de créditos usando Supabase
 * Substitui o antigo creditLedger.ts (in-memory) por persistência real
 */

import { supabase } from "./supabaseClient";

// ==========================================
// TIPOS E INTERFACES
// ==========================================

export interface CreditBalance {
  user_id: string;
  balance: number;
  total_purchased: number;
  total_used: number;
  bonus_credits: number;
  total_bonus: number;
  current_month_purchased: number;
  last_transaction_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  type: 'credit' | 'debit';
  amount: number;
  credits_amount: number;
  balance_after: number;
  description: string;
  service_name?: string;
  metadata?: Record<string, any>;
  status: 'pending' | 'completed' | 'failed';
  processed_at?: string;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  payment_method: 'pix' | 'card' | 'boleto';
  payment_gateway: 'mercadopago' | 'stripe' | 'paypal';
  gateway_transaction_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  pix_code?: string;
  pix_qr_code?: string;
  pix_expires_at?: string;
  package_id?: string;
  metadata?: Record<string, any>;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// SERVIÇO DE CRÉDITOS
// ==========================================

class CreditService {
  private supabase = supabase;

  // ==========================================
  // GERENCIAMENTO DE SALDO
  // ==========================================

  /**
   * Obtém o saldo atual de créditos do usuário
   */
  async getBalance(userId: string): Promise<CreditBalance | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Registro não encontrado - retornar saldo zero
          return null;
        }
        throw new Error(`Erro ao buscar saldo: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro em getBalance:', error);
      throw error;
    }
  }

  /**
   * Adiciona créditos à conta do usuário
   */
  async addCredits(
    userId: string,
    amount: number,
    description: string,
    metadata?: Record<string, any>
  ): Promise<CreditBalance> {
    try {
      // Verificar se usuário existe
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!profile) {
        throw new Error('Usuário não encontrado');
      }

      // Obter saldo atual ou criar novo registro
      let userCredits = await this.getBalance(userId);

      if (!userCredits) {
        // Criar novo registro de créditos
        const { data: newCredits, error: insertError } = await this.supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            balance: amount,
            total_purchased: amount,
            total_used: 0,
            bonus_credits: metadata?.bonus_credits || 0,
            total_bonus: metadata?.bonus_credits || 0,
            current_month_purchased: amount,
            last_transaction_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          throw new Error(`Erro ao criar registro de créditos: ${insertError.message}`);
        }

        userCredits = newCredits;

        // Registrar transação
        await this.recordTransaction(
          userId,
          'credit',
          amount,
          amount,
          amount,
          description,
          'Sistema de Créditos',
          { ...metadata, action: 'create_balance' }
        );
      } else {
        // Atualizar saldo existente
        const newBalance = userCredits.balance + amount;
        const newTotalPurchased = userCredits.total_purchased + amount;
        const newBonusCredits = userCredits.bonus_credits + (metadata?.bonus_credits || 0);
        const newTotalBonus = userCredits.total_bonus + (metadata?.bonus_credits || 0);
        const newCurrentMonth = userCredits.current_month_purchased + amount;

        const { data: updatedCredits, error: updateError } = await this.supabase
          .from('user_credits')
          .update({
            balance: newBalance,
            total_purchased: newTotalPurchased,
            bonus_credits: newBonusCredits,
            total_bonus: newTotalBonus,
            current_month_purchased: newCurrentMonth,
            last_transaction_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId)
          .select()
          .single();

        if (updateError) {
          throw new Error(`Erro ao atualizar saldo: ${updateError.message}`);
        }

        userCredits = updatedCredits;

        // Registrar transação
        await this.recordTransaction(
          userId,
          'credit',
          amount,
          amount,
          newBalance,
          description,
          'Sistema de Créditos',
          { ...metadata, action: 'add_credits' }
        );
      }

      return userCredits;
    } catch (error) {
      console.error('Erro em addCredits:', error);
      throw error;
    }
  }

  /**
   * Consome/deduz créditos da conta do usuário
   */
  async spendCredits(
    userId: string,
    amount: number,
    description: string,
    serviceName?: string,
    metadata?: Record<string, any>
  ): Promise<CreditBalance> {
    try {
      const userCredits = await this.getBalance(userId);

      if (!userCredits) {
        throw new Error('Usuário não possui conta de créditos');
      }

      if (userCredits.balance < amount) {
        throw new Error(`Saldo insuficiente. Necessário: ${amount}, Disponível: ${userCredits.balance}`);
      }

      // Calcular novo saldo
      const newBalance = userCredits.balance - amount;
      const newTotalUsed = userCredits.total_used + amount;

      // Atualizar saldo
      const { data: updatedCredits, error } = await this.supabase
        .from('user_credits')
        .update({
          balance: newBalance,
          total_used: newTotalUsed,
          last_transaction_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao deduzir créditos: ${error.message}`);
      }

      // Registrar transação de débito
      await this.recordTransaction(
        userId,
        'debit',
        amount,
        amount,
        newBalance,
        description,
        serviceName,
        { ...metadata, action: 'spend_credits' }
      );

      return updatedCredits;
    } catch (error) {
      console.error('Erro em spendCredits:', error);
      throw error;
    }
  }

  // ==========================================
  // GERENCIAMENTO DE TRANSAÇÕES
  // ==========================================

  /**
   * Registra uma transação de créditos
   */
  private async recordTransaction(
    userId: string,
    type: 'credit' | 'debit',
    amount: number,
    creditsAmount: number,
    balanceAfter: number,
    description: string,
    serviceName?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          type,
          amount,
          credits_amount: creditsAmount,
          balance_after: balanceAfter,
          description,
          service_name: serviceName,
          metadata,
          status: 'completed',
          processed_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Erro ao registrar transação:', error);
        // Não lançar erro aqui para não comprometer a operação principal
      }
    } catch (error) {
      console.error('Erro em recordTransaction:', error);
      // Silencioso para não afetar operações críticas
    }
  }

  /**
   * Obtém histórico de transações do usuário
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<CreditTransaction[]> {
    try {
      const { data, error } = await this.supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Erro ao buscar histórico: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erro em getTransactionHistory:', error);
      throw error;
    }
  }

  // ==========================================
  // GERENCIAMENTO DE PAGAMENTOS
  // ==========================================

  /**
   * Registra uma transação de pagamento
   */
  async createPaymentTransaction(
    userId: string,
    paymentMethod: 'pix' | 'card' | 'boleto',
    gateway: 'mercadopago' | 'stripe' | 'paypal',
    gatewayTransactionId: string,
    amount: number,
    creditsAmount: number,
    currency: string = 'BRL',
    packageId?: string,
    metadata?: Record<string, any>
  ): Promise<PaymentTransaction> {
    try {
      const { data, error } = await this.supabase
        .from('payment_transactions')
        .insert({
          user_id: userId,
          payment_method: paymentMethod,
          payment_gateway: gateway,
          gateway_transaction_id: gatewayTransactionId,
          amount,
          currency,
          status: 'pending',
          package_id: packageId,
          metadata,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar transação de pagamento: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro em createPaymentTransaction:', error);
      throw error;
    }
  }

  /**
   * Atualiza status de transação de pagamento
   */
  async updatePaymentStatus(
    transactionId: string,
    status: 'completed' | 'failed' | 'cancelled' | 'refunded',
    additionalMetadata?: Record<string, any>
  ): Promise<PaymentTransaction> {
    try {
      const updates: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'completed') {
        updates.paid_at = new Date().toISOString();
      }

      if (additionalMetadata) {
        updates.metadata = additionalMetadata;
      }

      const { data, error } = await this.supabase
        .from('payment_transactions')
        .update(updates)
        .eq('id', transactionId)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar status: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erro em updatePaymentStatus:', error);
      throw error;
    }
  }

  // ==========================================
  // UTILITÁRIOS
  // ==========================================

  /**
   * Formata valor em moeda brasileira
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Formata quantidade de créditos
   */
  formatCredits(amount: number): string {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`;
    }
    return amount.toString();
  }
}

// Exportar instância singleton
export const creditService = new CreditService();

// Exportar funções para compatibilidade com código existente
export const addCredits = creditService.addCredits.bind(creditService);
export const spendCredits = creditService.spendCredits.bind(creditService);
export const getBalance = creditService.getBalance.bind(creditService);

export default creditService;