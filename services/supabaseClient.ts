/**
 * Camada de compatibilidade Supabase -> D1
 * Este arquivo mantém compatibilidade temporária com código legado
 * que ainda usa imports do supabaseClient
 */

import { apiClient } from '../src/services/apiClient';

// Mock do supabase client para compatibilidade
export const supabase = {
    auth: {
        signUp: async (options: any) => {
            const { email, password, options: signUpOptions } = options;
            const metadata = signUpOptions?.data || {};
            const response = await apiClient.signup(email, password, metadata);

            return {
                data: response.success ? {
                    user: response.user,
                    session: null
                } : null,
                error: response.error ? { message: response.error } : null
            };
        },

        signInWithPassword: async (credentials: any) => {
            const { email, password } = credentials;
            const response = await apiClient.login(email, password);

            return {
                data: response.success ? {
                    user: response.user,
                    session: {}
                } : null,
                error: response.error ? { message: response.error } : null
            };
        },

        signOut: async () => {
            apiClient.logout();
            return { error: null };
        },

        getUser: async () => {
            try {
                const userId = apiClient.getUserId();
                if (!userId) {
                    return { data: { user: null }, error: null };
                }

                const response = await apiClient.getUser();
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
    },

    from: (table: string) => {
        // Mock básico do método from() do Supabase
        console.warn(`⚠️ Chamada para supabase.from('${table}') - considere migrar para apiClient`);

        return {
            select: (query?: string) => ({
                eq: (column: string, value: any) => ({
                    single: async () => ({ data: null, error: { message: 'Migre para D1 API' } }),
                    then: async (callback: any) => callback({ data: [], error: null })
                }),
                then: async (callback: any) => callback({ data: [], error: null })
            }),
            insert: (data: any) => ({
                select: () => ({
                    single: async () => ({ data: null, error: { message: 'Migre para D1 API' } }),
                    then: async (callback: any) => callback({ data: null, error: null })
                }),
                then: async (callback: any) => callback({ data: null, error: null })
            }),
            update: (data: any) => ({
                eq: (column: string, value: any) => ({
                    then: async (callback: any) => callback({ data: null, error: null })
                })
            }),
            delete: () => ({
                eq: (column: string, value: any) => ({
                    then: async (callback: any) => callback({ data: null, error: null })
                })
            }),
            upsert: (data: any, options?: any) => ({
                select: () => ({
                    then: async (callback: any) => callback({ data: null, error: null })
                }),
                then: async (callback: any) => callback({ data: null, error: null })
            })
        };
    }
};

// Para compatibilidade com código que verifica se o Supabase está configurado
export const isSupabaseConfigured = () => true;

// Mock do serviceSupabase (para admin)
export const serviceSupabase = supabase;

export const isServiceKeyConfigured = () => true;

// Type exports (vazios para compatibilidade)
export type Database = any;

// Re-exportar para outros que possam importar
export default supabase;
