
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key is missing in environment variables.');
}

export let supabase: ReturnType<typeof createClient<Database>> | null = null;

try {
    if (supabaseUrl && supabaseAnonKey) {
        supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    } else {
        console.warn('Supabase URL or Anon Key is missing. Supabase client will be null.');
    }
} catch (error) {
    console.error('Error initializing Supabase client:', error);
}

export const checkSupabaseConnection = async (url?: string, key?: string) => {
    try {
        let client = supabase;
        if (url && key) {
            try {
                client = createClient(url, key);
            } catch (e: any) {
                return { success: false, message: `Erro ao criar cliente: ${e.message}` };
            }
        }

        if (!client) {
            return { success: false, message: 'Cliente Supabase não configurado. Verifique as variáveis de ambiente.' };
        }

        const { data, error } = await client.from('users').select('count', { count: 'exact', head: true });

        // Even if users table doesn't exist, a valid connection usually returns a specific error (e.g. 404 for table) rather than network error.
        // But for a generic check, let's try to list tables or just check if we get a response.
        // Actually, 'users' might not exist. Let's try a lighter check or just assume if we get a response (even error) from Supabase, it's connected.
        // However, invalid key returns 401.

        if (error) {
            // If 401, it's invalid credentials.
            if (error.code === 'PGRST301' || error.message?.includes('JWT')) {
                return { success: false, message: 'Credenciais inválidas ou expiradas.' };
            }
            // If table not found, it means we connected but table is missing.
            if (error.code === '42P01') {
                return { success: true, message: 'Conectado! (Tabela "users" não encontrada, mas a conexão funciona)' };
            }

            console.error('Supabase connection check error:', error);
            // If we got a Supabase error, we probably connected.
            return { success: true, message: `Conectado, mas com erro: ${error.message}` };
        }
        return { success: true, message: 'Conectado com sucesso!' };
    } catch (err: any) {
        return { success: false, message: err.message || 'Erro desconhecido ao conectar.' };
    }
};
