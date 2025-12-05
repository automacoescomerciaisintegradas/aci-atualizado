-- Atualização da Tabela de Usuários para permitir usuários criados pelo Admin (sem login vinculado inicialmente)

-- 1. Remover a restrição de chave estrangeira (se existir) para permitir IDs que não estão em auth.users
alter table public.users drop constraint if exists users_id_fkey;

-- 2. Garantir que a coluna ID seja do tipo UUID (já deve ser, mas por garantia)
-- Se não for possível alterar diretamente, você pode precisar recriar a tabela, mas vamos tentar alterar.
-- alter table public.users alter column id type uuid using id::uuid;

-- 3. Atualizar as políticas de RLS para serem mais permissivas para o Admin (ou desabilitar RLS temporariamente se preferir)
-- Para simplificar o desenvolvimento, vamos permitir que usuários autenticados façam tudo (CUIDADO: Em produção, refine isso!)
drop policy if exists "Perfis são visíveis por usuários autenticados" on public.users;
drop policy if exists "Usuários podem criar seu próprio perfil" on public.users;
drop policy if exists "Usuários podem atualizar seu próprio perfil" on public.users;

create policy "Acesso total para usuários autenticados"
  on public.users for all
  using ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );

-- 4. (Opcional) Se você quiser que o cadastro vincule por e-mail posteriormente:
-- O fluxo de AuthPage já tenta fazer insert. Se o e-mail já existir (criado pelo Admin), o insert falhará (chave duplicada).
-- Precisamos mudar o AuthPage para fazer UPSERT (update se existir).
