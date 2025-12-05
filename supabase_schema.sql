-- Tabela de Usuários (Perfis Públicos)
-- Esta tabela estende a tabela auth.users padrão do Supabase
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  name text,
  photo_url text,
  role text check (role in ('admin', 'user')) default 'user',
  status text check (status in ('active', 'inactive')) default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_login timestamp with time zone,
  
  constraint users_email_key unique (email)
);

-- Habilitar Row Level Security (RLS) para segurança
alter table public.users enable row level security;

-- Políticas de Segurança (RLS)

-- 1. Leitura: Permitir que qualquer usuário autenticado leia dados de usuários (necessário para o Admin e para ver o próprio perfil)
create policy "Perfis são visíveis por usuários autenticados"
  on public.users for select
  using ( auth.role() = 'authenticated' );

-- 2. Inserção: Permitir que o usuário insira seu próprio perfil durante o cadastro
create policy "Usuários podem criar seu próprio perfil"
  on public.users for insert
  with check ( auth.uid() = id );

-- 3. Atualização: Usuários podem atualizar apenas seu próprio perfil
create policy "Usuários podem atualizar seu próprio perfil"
  on public.users for update
  using ( auth.uid() = id );

-- 4. Admin: (Opcional) Se você quiser que admins possam fazer tudo, precisaria de uma política mais complexa ou usar a role de serviço do Supabase no backend.
-- Por enquanto, as políticas acima cobrem o uso básico do frontend.

-- (Opcional) Trigger para criar perfil automaticamente ao cadastrar via Auth (alternativa ao insert no frontend)
/*
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, role, status, created_at, last_login)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'name', 'Novo Usuário'), 
    'user', 
    'active', 
    now(), 
    now()
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
*/
