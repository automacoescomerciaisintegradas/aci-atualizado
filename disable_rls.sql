-- DESABILITAR RLS (Row Level Security)
-- Isso permite que o frontend (usando a chave Anon) leia e escreva na tabela 'users'
-- sem precisar de uma sessão de autenticação do Supabase.
-- Necessário porque estamos usando Login Google no frontend sem trocar tokens com o Supabase ainda.

alter table public.users disable row level security;

-- Opcional: Se preferir manter RLS, use esta política permissiva para 'anon':
/*
create policy "Acesso total para anon"
  on public.users for all
  using ( true )
  with check ( true );
*/
