# 🔧 Correção de Conexão WordPress: Erro de Autenticação

Se você está recebendo o erro **"Falha na autenticação"** ou **"Você não está logado"** mesmo usando o usuário e senha corretos, o problema é que seu servidor de hospedagem está bloqueando o envio das credenciais para o WordPress.

Isso é muito comum em hospedagens compartilhadas e servidores Nginx/Apache.

## 🚀 Solução Rápida (Para Servidores Apache / cPanel / Hostgator / Hostinger)

Você precisa editar o arquivo `.htaccess` na raiz da instalação do seu WordPress.

1. Acesse o Gerenciador de Arquivos da sua hospedagem ou use FTP.
2. Localize o arquivo `.htaccess` na pasta onde o WordPress está instalado (geralmente `public_html`).
3. Adicione as seguintes linhas **no topo do arquivo**, antes de qualquer outra regra:

```apache
RewriteEngine On
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
```

4. Salve o arquivo e tente conectar novamente no painel ACI.

---

## 🌐 Solução para Nginx (VPS / Easypanel / CloudPanel)

Se você usa Nginx (como parece ser o caso do Easypanel), você precisa adicionar a configuração para passar o header de autorização para o PHP.

No bloco de configuração do seu site (vhost) ou nas configurações de proxy reverso:

```nginx
fastcgi_pass_request_headers on;
fastcgi_param HTTP_AUTHORIZATION $http_authorization;
```

Se você não tem acesso à configuração do Nginx, entre em contato com o suporte da sua hospedagem e peça para: **"Habilitar o pass-through do cabeçalho Authorization para o PHP"**.

---

## 🔍 Por que isso acontece?

Por segurança, alguns servidores web removem o cabeçalho `Authorization` das requisições antes de enviá-las para o PHP. O WordPress precisa desse cabeçalho para validar sua Senha de Aplicativo. Sem ele, o WordPress "não vê" sua senha e retorna o erro "Você não está logado".

---

## ✅ Checklist Final

1. Você criou uma **Senha de Aplicativo** em Usuários > Perfil? (Não use sua senha de login normal).
2. Você copiou a senha sem espaços extras?
3. Você aplicou a correção no `.htaccess` ou Nginx acima?
4. Se usa plugins de segurança (Wordfence, iThemes), verifique se eles não estão bloqueando a API REST ou "Application Passwords".
