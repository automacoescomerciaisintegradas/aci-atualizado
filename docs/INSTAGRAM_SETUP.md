# Configuração da Integração com Instagram/Facebook

Para conectar contas do Instagram Profissional ao sistema, você precisa criar um Aplicativo na Meta (Facebook) for Developers.

## 1. Criar Aplicativo na Meta

1. Acesse [developers.facebook.com](https://developers.facebook.com/).
2. Vá em **Meus Apps** > **Criar App**.
3. Selecione a opção **Outro** > **Avançar**.
4. Selecione **Empresa** (Business) > **Avançar**.
5. Dê um nome ao app (ex: "ACI Automações") e coloque seu e-mail de contato.
6. Se tiver uma conta empresarial (Business Manager), selecione-a.
7. Clique em **Criar app**.

## 2. Configurar Produtos

Adicione o produto **Login do Facebook**:
1. No painel, procure por "Login do Facebook" e clique em **Configurar**.
2. Escolha **Web**.
3. Em **URL do Site**, coloque a URL do seu frontend: 
   - Desenvolvimento: `http://localhost:3000/`
   - Produção: `https://seu-dominio.com.br/`
4. Salve.

## 3. Configurações de Login

No menu lateral esquerdo, vá em **Login do Facebook** > **Configurações**:
1. Em **URIs de Redirecionamento do OAuth Válidos**, adicione:
   - `http://localhost:3002/api/integrations/instagram/callback` (Backend)
   - Certifique-se de que a porta `3002` é a que o backend está rodando.

## 4. Obter Credenciais

No menu lateral esquerdo, vá em **Configurações** > **Básico**:
1. Copie o **ID do Aplicativo** (`App ID`).
2. Copie a **Chave Secreta do Aplicativo** (`App Secret`) (clique em Mostrar).

## 5. Configurar no Projeto (.env)

Adicione as seguintes linhas ao seu arquivo `.env` na raiz do projeto:

```env
# Configurações do Facebook / Instagram
META_APP_ID=SEU_APP_ID_AQUI
META_APP_SECRET=SEU_APP_SECRET_AQUI
META_REDIRECT_URI=http://localhost:3002/api/integrations/instagram/callback
META_API_VERSION=v19.0
```

## 6. Permissões Necessárias (App Review)

Para uso público (fora administradores do app), você precisará solicitar a "Análise do App" (App Review) para as seguintes permissões:
- `public_profile`
- `instagram_basic`
- `instagram_manage_comments`
- `instagram_manage_messages`
- `instagram_content_publish`
- `instagram_manage_insights`
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_metadata`

*Para testes, você pode apenas adicionar sua conta do Facebook como "Tester" nas funções do aplicativo.*
