# Como rodar testes RLS localmente

1) Configure variáveis de ambiente (exemplo `.env.local`):

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_for_client_tests
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_for_admin_actions
```

2) Aplique o SQL de criação de tabela/policies (no Supabase SQL Editor ou via psql):
```
-- abrir SQL editor no Supabase e executar
-- sql/create_context_history_and_policies.sql
```

3) Instale dependências e rode os testes (exemplo usando vitest):

```bash
npm install
npm test -- tests/rls/rls_test_template.js
```

4) Observações
- Ajuste `actorId` no teste para usar um `auth.uid()` real ou crie um usuário de teste no Supabase.
- Para testes automatizados inteiramente isolados, use um banco de teste separado ou transações que são revertidas.

