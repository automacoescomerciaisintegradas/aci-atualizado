# Políticas RLS e `rule-contexto-historico`

Objetivo: garantir que registros com contexto histórico (ex.: auditoria, histórico de ações) sejam acessíveis apenas conforme regras de negócio.

Exemplo de tabela `context_history` (no schema `public`):

```sql
create table if not exists public.context_history (
  id uuid primary key default gen_random_uuid(),
  resource_type text not null,
  resource_id uuid not null,
  actor_id uuid,
  action text not null,
  payload jsonb,
  created_at timestamptz default now()
);
```

Regras propostas (`rule-contexto-historico`):
- SELECT: apenas usuários autenticados podem ver histórico de recursos que pertencem a contexts que eles possuem permissão (ex.: se `actor_id = auth.uid()` ou usuário tem role `admin`).
- INSERT: apenas sistemas/autorizados podem inserir (ex.: service role ou funções internas).
- DELETE/UPDATE: restrito a admins.

SQL para aplicar políticas:

```sql
-- Habilitar RLS
alter table public.context_history enable row level security;

-- Política SELECT: permitir se auth.role() = 'authenticated' e (actor_id = auth.uid() OR auth.role() = 'admin')
create policy "context_history_select_owner_or_admin" on public.context_history for select using (
  auth.role() = 'authenticated' and (actor_id::text = auth.uid() or auth.role() = 'admin')
);

-- Política INSERT: permitir apenas service_role (ex: via check on current_setting or function) ou ownering function
create policy "context_history_insert_service_or_system" on public.context_history for insert with check (
  -- allow inserts only from authenticated contexts for now; adjust if using service_role
  auth.role() = 'authenticated'
);

-- Política UPDATE/DELETE: admins only
create policy "context_history_admin_modify" on public.context_history for update using (auth.role() = 'admin');
create policy "context_history_admin_delete" on public.context_history for delete using (auth.role() = 'admin');
```

Observações:
- Se precisar que serviços backend com Service Role key insiram registros, o backend deve usar a chave de serviço (server-side) e chamadas diretas ao Postgres (ou supabase-js com service role key) — RLS não se aplica à role `postgres`/service role.
- Ajuste as políticas `using`/`with check` conforme o caso de uso: por exemplo, permitir que um `manager` veja histórico de `resource_id` correspondente aos seus recursos.

