# Configuração OAuth — Google + Supabase

Esta página descreve passo-a-passo como configurar Google OAuth para login no projeto e integrar com Supabase.

1) No Google Cloud Console
- Crie um projeto (ou use o existente).
- Ative **APIs & Services > OAuth consent screen** e preencha as informações obrigatórias.
- Em **Credentials**, clique em **Create Credentials > OAuth client ID**.
  - Application type: `Web application`
  - Authorized JavaScript origins: `http://localhost:3000` (ou sua `VITE_PORT`)
  - Authorized redirect URIs: `http://localhost:3000` (para fluxo implícito) ou `http://localhost:4001/api/auth/google/callback` se usar backend callback
- Salve `Client ID` e `Client secret`.

2) No Supabase (opcional, se usar Supabase Auth Providers)
- Abra https://app.supabase.com > seu projeto > Authentication > Providers
- Em Google, cole `Client ID` e `Client secret` e salve.
- Configure Redirect URI em Google Console para o valor que o Supabase exige (listar no painel do Supabase).

3) Variáveis de ambiente
- No frontend (Vite): defina `VITE_GOOGLE_CLIENT_ID` e `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- No backend (Node): defina `GOOGLE_CLIENT_ID` (se o backend validar idToken), `JWT_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

4) Fluxo recomendado (implementado no projeto)
- Frontend: inicia OAuth com `response_type=token` (fluxo implícito) e obtém `access_token` (ou usa Google Identity Services para id_token).
- Frontend: envia `accessToken` para `POST /auth/google` no backend.
- Backend: verifica token com Google (`/userinfo` ou `google-auth-library`), cria JWT da aplicação e retorna.
- Backend (opcional): sincroniza/atualiza usuário na tabela `users`.

5) Dicas de debug
- Verifique `Authorized origins` e `Redirect URIs` no Google Console.
- Se usar Supabase Auth, configure o provider no painel do Supabase.
- Para desenvolvimento local, adicione `VITE_SUPABASE_*` em `.env.local`.


