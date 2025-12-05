import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// Detectar ambiente
const isBrowser = typeof window !== "undefined";

// Variáveis de ambiente conforme o contexto
const supabaseUrl = isBrowser
  ? import.meta.env.VITE_SUPABASE_URL
  : process.env.SUPABASE_URL;

const supabaseAnonKey = isBrowser
  ? import.meta.env.VITE_SUPABASE_ANON_KEY
  : process.env.SUPABASE_ANON_KEY;

const supabaseServiceKey = isBrowser ? null : process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validação de configuração
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase URL or Anon Key is missing in environment variables."
  );
}

// Cliente Supabase (anon/public)
export let supabase: ReturnType<typeof createClient<Database>> | null = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn(
      "Supabase URL or Anon Key is missing. Supabase client will be null."
    );
  }
} catch (error) {
  console.error("Error initializing Supabase client:", error);
}

// Cliente Supabase com Service Role (apenas no servidor/backend)
export let serviceSupabase: ReturnType<typeof createClient<Database>> | null =
  null;

if (!isBrowser && supabaseUrl && supabaseServiceKey) {
  try {
    serviceSupabase = createClient<Database>(supabaseUrl, supabaseServiceKey);
  } catch (error) {
    console.error("Error initializing Service Supabase client:", error);
  }
}

// Verificar se Supabase está configurado
export const isSupabaseConfigured = (): boolean => {
  return !!supabaseUrl && !!supabaseAnonKey;
};

// Verificar se Service Key está configurado
export const isServiceKeyConfigured = (): boolean => {
  return !isBrowser && !!supabaseUrl && !!supabaseServiceKey;
};

// Função para testar conexão com Supabase
export const checkSupabaseConnection = async (
  url?: string,
  key?: string
): Promise<{ success: boolean; message: string }> => {
  try {
    let client = supabase;
    if (url && key) {
      try {
        client = createClient<Database>(url, key);
      } catch (e: any) {
        return {
          success: false,
          message: `Erro ao criar cliente: ${e.message}`,
        };
      }
    }

    if (!client) {
      return {
        success: false,
        message:
          "Cliente Supabase não configurado. Verifique as variáveis de ambiente.",
      };
    }

    const { error } = await client
      .from("users")
      .select("*", { count: "exact", head: true });

    if (error) {
      // Se 401, são credenciais inválidas
      if (error.code === "PGRST301" || error.message?.includes("JWT")) {
        return {
          success: false,
          message: "Credenciais inválidas ou expiradas.",
        };
      }
      // Se tabela não encontrada, significa que conectamos
      if (error.code === "42P01") {
        return {
          success: true,
          message:
            'Conectado! (Tabela "users" não encontrada, mas a conexão funciona)',
        };
      }

      console.error("Supabase connection check error:", error);
      return {
        success: true,
        message: `Conectado, mas com erro: ${error.message}`,
      };
    }
    return { success: true, message: "Conectado com sucesso!" };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || "Erro desconhecido ao conectar.",
    };
  }
};

// Tipos exportados
export type SupabaseClient = ReturnType<typeof createClient<Database>>;
export type { Database };