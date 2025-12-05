// Serviço para operações comuns com o Supabase
import { supabase, isSupabaseConfigured } from "@/common/utils/supabaseClient";
import { Database } from "@/common/utils/supabaseClient";

// Verifica se o Supabase está configurado
if (!isSupabaseConfigured()) {
  console.warn("Supabase não está configurado. Por favor, verifique as variáveis de ambiente.");
}

// Funções utilitárias para operações comuns

// Autenticação
export const signInWithPassword = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  return { data, error };
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Banco de dados
export const fetchTableData = async <T>(tableName: string, filters?: Record<string, any>): Promise<{ data: T[] | null; error: any }> => {
  let query = supabase.from(tableName).select("*");
  
  // Aplica filtros se fornecidos
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }
  
  const { data, error } = await query;
  
  return { data: data as T[] | null, error };
};

export const insertData = async <T>(tableName: string, data: Partial<T>) => {
  const { data: insertedData, error } = await supabase.from(tableName).insert(data).select();
  
  return { data: insertedData as T[] | null, error };
};

export const updateData = async <T>(tableName: string, id: string | number, data: Partial<T>) => {
  const { data: updatedData, error } = await supabase.from(tableName).update(data).eq("id", id).select();
  
  return { data: updatedData as T[] | null, error };
};

export const deleteData = async (tableName: string, id: string | number) => {
  const { data, error } = await supabase.from(tableName).delete().eq("id", id);
  
  return { data, error };
};

// Storage
export const uploadFile = async (bucket: string, filePath: string, file: File) => {
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
  
  return { data, error };
};

export const downloadFile = async (bucket: string, filePath: string) => {
  const { data, error } = await supabase.storage.from(bucket).download(filePath);
  
  return { data, error };
};

export const deleteFile = async (bucket: string, filePath: string) => {
  const { data, error } = await supabase.storage.from(bucket).remove([filePath]);
  
  return { data, error };
};