/**
 * =========================================
 * ACI - Serviço Simplificado de Créditos
 * =========================================
 * 
 * Versão simplificada que funciona com o mock do Supabase
 * para resolver o problema de login rapidamente
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

// ==========================================
// SERVIÇO SIMPLIFICADO DE CRÉDITOS
// ==========================================

class SimpleCreditService {
  private balances = new Map<string, CreditBalance>();

  /**
   * Obtém o saldo atual de créditos do usuário
   */
  async getBalance(userId: string): Promise<CreditBalance | null> {
    try {
      // Primeiro tentar do cache em memória
      if (this.balances.has(userId)) {
        return this.balances.get(userId) || null;
      }

      // Se não tiver em cache, criar saldo inicial
      const initialBalance: CreditBalance = {
        user_id: userId,
        balance: 3000, // Saldo inicial padrão
        total_purchased: 3000,
        total_used: 0,
        bonus_credits: 0,
        total_bonus: 0,
        current_month_purchased: 3000,
        last_transaction_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      this.balances.set(userId, initialBalance);
      return initialBalance;
    } catch (error) {
      console.error('Erro em getBalance:', error);
      return null;
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
      let balance = await this.getBalance(userId);
      
      if (!balance) {
        // Criar novo saldo
        balance = {
          user_id: userId,
          balance: amount,
          total_purchased: amount,
          total_used: 0,
          bonus_credits: metadata?.bonus_credits || 0,
          total_bonus: metadata?.bonus_credits || 0,
          current_month_purchased: amount,
          last_transaction_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } else {
        // Atualizar saldo existente
        balance.balance += amount;
        balance.total_purchased += amount;
        balance.bonus_credits += metadata?.bonus_credits || 0;
        balance.total_bonus += metadata?.bonus_credits || 0;
        balance.current_month_purchased += amount;
        balance.last_transaction_at = new Date().toISOString();
        balance.updated_at = new Date().toISOString();
      }

      this.balances.set(userId, balance);
      console.log(`✅ Créditos adicionados: ${amount} para usuário ${userId}`);
      return balance;
    } catch (error) {
      console.error('Erro em addCredits:', error);
      throw error;
    }
  }

  /**
   * Deduz créditos da conta do usuário
   */
  async spendCredits(
    userId: string,
    amount: number,
    description: string,
    serviceName?: string,
    metadata?: Record<string, any>
  ): Promise<CreditBalance> {
    try {
      const balance = await this.getBalance(userId);
      
      if (!balance) {
        throw new Error('Usuário não encontrado');
      }

      if (balance.balance < amount) {
        throw new Error(`Saldo insuficiente. Necessário: ${amount}, Disponível: ${balance.balance}`);
      }

      // Deduzir créditos
      balance.balance -= amount;
      balance.total_used += amount;
      balance.last_transaction_at = new Date().toISOString();
      balance.updated_at = new Date().toISOString();

      this.balances.set(userId, balance);
      console.log(`✅ Créditos utilizados: ${amount} por ${userId} - ${serviceName || 'serviço'}`);
      return balance;
    } catch (error) {
      console.error('Erro em spendCredits:', error);
      throw error;
    }
  }

  /**
   * Registrar transação (mock)
   */
  async recordTransaction(
    userId: string,
    type: 'credit' | 'debit',
    amount: number,
    creditsAmount: number,
    balanceAfter: number,
    description: string,
    serviceName?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    // Mock - apenas log
    console.log(`📝 Transação registrada: ${type} ${amount} créditos para ${userId}`);
  }

  /**
   * Obter histórico de transações (mock)
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    // Mock - retornar array vazio
    return [];
  }

  /**
   * Atualizar configurações do usuário (mock)
   */
  async updateUserSettings(
    userId: string,
    updates: Partial<any>
  ): Promise<any> {
    // Mock - retornar objeto vazio
    return {};
  }

  /**
   * Processar pagamento (mock)
   */
  async processPayment(
    userId: string,
    amount: number,
    paymentMethod: string,
    metadata?: Record<string, any>
  ): Promise<any> {
    // Mock - apenas adicionar créditos
    const creditsToAdd = amount * 1000; // R$1 = 1000 créditos
    await this.addCredits(userId, creditsToAdd, `Pagamento via ${paymentMethod}`, {
      payment_method: paymentMethod,
      original_amount: amount,
      ...metadata
    });
    
    return {
      success: true,
      credits_added: creditsToAdd,
      transaction_id: `tx_${Date.now()}`
    };
  }
}

// Exportar instância singleton
export const creditService = new SimpleCreditService();

export default creditService;