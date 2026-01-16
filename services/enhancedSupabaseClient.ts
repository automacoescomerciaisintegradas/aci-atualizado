/**
 * =========================================
 * ACI - Supabase Client Aprimorado
 * =========================================
 * 
 * Versão aprimorada do client Supabase mockado que retorna Promises reais
 * para compatibilidade com código assíncrono moderno
 */

import { apiClient } from '../src/services/apiClient';

// ==========================================
// TIPOS AUXILIARES
// ==========================================

interface SupabaseResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

interface QueryBuilder<T> {
  eq(column: string, value: any): QueryBuilder<T>;
  single(): Promise<SupabaseResponse<T>>;
  then(callback: (result: SupabaseResponse<T[]>) => void): Promise<SupabaseResponse<T[]>>;
}

interface TableOperations<T> {
  select(query?: string): QueryBuilder<T>;
  insert(data: Partial<T>): {
    select(): { single(): Promise<SupabaseResponse<T>> };
    then(callback: (result: SupabaseResponse<T | null>) => void): Promise<SupabaseResponse<T | null>>;
  };
  update(data: Partial<T>): {
    eq(column: string, value: any): {
      then(callback: (result: SupabaseResponse<T | null>) => void): Promise<SupabaseResponse<T | null>>;
    };
  };
  delete(): {
    eq(column: string, value: any): {
      then(callback: (result: SupabaseResponse<T | null>) => void): Promise<SupabaseResponse<T | null>>;
    };
  };
}

// ==========================================
// CLIENT SUPABASE APRIMORADO
// ==========================================

class EnhancedSupabaseClient {
  private api = apiClient;

  auth = {
    signUp: async (options: any) => {
      const { email, password, options: signUpOptions } = options;
      const metadata = signUpOptions?.data || {};
      
      try {
        const response = await this.api.signup(email, password, metadata);
        
        return {
          data: response.success ? {
            user: response.user,
            session: null
          } : null,
          error: response.error ? { message: response.error } : null
        };
      } catch (error: any) {
        return {
          data: null,
          error: { message: error.message }
        };
      }
    },

    signInWithPassword: async (credentials: any) => {
      const { email, password } = credentials;
      
      try {
        const response = await this.api.login(email, password);
        
        return {
          data: response.success ? {
            user: response.user,
            session: {}
          } : null,
          error: response.error ? { message: response.error } : null
        };
      } catch (error: any) {
        return {
          data: null,
          error: { message: error.message }
        };
      }
    },

    signOut: async () => {
      this.api.logout();
      return { error: null };
    },

    getUser: async () => {
      try {
        const userId = this.api.getUserId();
        if (!userId) {
          return { data: { user: null }, error: null };
        }

        const response = await this.api.getUser();
        return {
          data: { user: response.user },
          error: null
        };
      } catch (error: any) {
        return {
          data: { user: null },
          error: { message: error.message }
        };
      }
    }
  };

  from<T = any>(table: string): TableOperations<T> {
    console.warn(`⚠️ Chamada para supabase.from('${table}') - considere migrar para D1 API`);

    const createPromise = <T>(resolver: (resolve: (value: T) => void) => void): Promise<T> => {
      return new Promise(resolver);
    };

    return {
      select: (query?: string) => {
        const queryBuilder: QueryBuilder<T> = {
          eq: (column: string, value: any) => queryBuilder,
          single: () => createPromise(resolve => {
            resolve({
              data: null,
              error: { message: `Migre para D1 API - Tabela: ${table}` }
            });
          }),
          then: (callback) => createPromise(resolve => {
            const result = {
              data: [],
              error: null
            };
            callback(result);
            resolve(result);
          })
        };
        return queryBuilder;
      },

      insert: (data: Partial<T>) => ({
        select: () => ({
          single: () => createPromise(resolve => {
            resolve({
              data: null,
              error: { message: `Migre para D1 API - Tabela: ${table}` }
            });
          })
        }),
        then: (callback) => createPromise(resolve => {
          const result = {
            data: null,
            error: null
          };
          callback(result);
          resolve(result);
        })
      }),

      update: (data: Partial<T>) => ({
        eq: (column: string, value: any) => ({
          then: (callback) => createPromise(resolve => {
            const result = {
              data: null,
              error: null
            };
            callback(result);
            resolve(result);
          })
        })
      }),

      delete: () => ({
        eq: (column: string, value: any) => ({
          then: (callback) => createPromise(resolve => {
            const result = {
              data: null,
              error: null
            };
            callback(result);
            resolve(result);
          })
        })
      })
    };
  }
}

// Exportar instância singleton
export const enhancedSupabase = new EnhancedSupabaseClient();

// Mantendo exportações compatíveis
export const supabase = enhancedSupabase;
export const serviceSupabase = enhancedSupabase;
export const isSupabaseConfigured = () => true;
export const isServiceKeyConfigured = () => true;
export type Database = any;

export default enhancedSupabase;