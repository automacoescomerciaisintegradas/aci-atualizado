-- Garantir que as colunas existem (caso a tabela já existisse antes)
alter table public.users add column if not exists name text;
alter table public.users add column if not exists photo_url text;
alter table public.users add column if not exists role text check (role in ('admin', 'user')) default 'user';
alter table public.users add column if not exists status text check (status in ('active', 'inactive')) default 'active';
alter table public.users add column if not exists last_login timestamp with time zone;

-- Recarregar o cache do schema (importante!)
NOTIFY pgrst, 'reload schema';
