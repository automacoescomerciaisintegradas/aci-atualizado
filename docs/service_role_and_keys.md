# Service Role Key — obtenção e armazenagem segura

1) Obter Service Role Key no Supabase:
   - Vá para `Settings > API` no painel do projeto (https://app.supabase.com)
   - Copie `Service Role` key (sempre trate como segredo)

2) Armazenar com segurança:
   - Nunca comite a `SERVICE_ROLE_KEY` ao repositório.
   - Use variáveis de ambiente no servidor (ex: `SUPABASE_SERVICE_ROLE_KEY`) ou um secret manager.
   - Em deploys (Vercel/Netlify/Cloud Run), adicione a chave como secret/env var.

3) Quando usar:
   - Inserções administrativas, migrações e operações que precisam ignorar RLS devem usar a Service Role Key no servidor.
   - Para chamadas do cliente (browser), use sempre `anon` key.

4) Rotina de rotação:
   - Caso vaze a chave, gere nova no painel do Supabase e atualize no servidor, revogando tokens/credenciais conforme necessário.

