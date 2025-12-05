-- Cria tabela context_history e aplica políticas RLS (rule-contexto-historico)

create extension if not exists pgcrypto;

create table if not exists public.context_history (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null,
  resource_id uuid not null,
  actor_id uuid,
  action text not null,
  payload jsonb,
  created_at timestamptz default now()
);

-- Habilita RLS
alter table public.context_history enable row level security;

-- Política SELECT: permitir se auth.role() = 'authenticated' e (actor_id = auth.uid() OR auth.role() = 'admin')
create policy if not exists context_history_select_owner_or_admin on public.context_history for select using (
  auth.role() = 'authenticated' and (actor_id::text = auth.uid() or auth.role() = 'admin')
);

-- Política INSERT: permitir apenas authenticated (ajuste conforme necessidade)
create policy if not exists context_history_insert_authenticated on public.context_history for insert with check (
  auth.role() = 'authenticated'
);

-- UPDATE/DELETE: somente admin
create policy if not exists context_history_admin_modify on public.context_history for update using (auth.role() = 'admin');
create policy if not exists context_history_admin_delete on public.context_history for delete using (auth.role() = 'admin');

-- Exemplo de teste manual (rodar como usuário autenticado para ver resultados):
-- SELECT * FROM public.context_history WHERE actor_id = auth.uid();

'teste'
