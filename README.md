# 🚀 ACI - Automações Comerciais Integradas

## 📖 Sobre o Projeto

A **ACI** é uma plataforma completa de automação inteligente para afiliados, que integra **Inteligência Artificial** com as principais plataformas de e-commerce e marketing digital.

### ✨ Principais Funcionalidades

- 🤖 **Geração de Conteúdo com IA** (GPT-4, Gemini)
- 📸 **Automação Instagram** (Posts, Comentários, DM)
- 📱 **Automação Telegram** (Envio em massa, Canais)
- 🛍️ **Integração Shopee** (Busca produtos, Links de afiliado)
- 📝 **Publicação WordPress** (Artigos automáticos)
- 🛒 **Integração WooCommerce** (Produtos, Reviews)
- 💰 **Sistema de Créditos** (Pay-per-use, sem mensalidades)

---

## 🎯 Primeiros Passos

### 1️⃣ Instalar Dependências

```bash
npm install
```

### 2️⃣ Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# API
VITE_API_URL=http://localhost:3001
PORT=3001

# Super Admin Email (opcional)
VITE_ADMIN_EMAIL=seu-email@exemplo.com

# JWT Secret (obrigatório)
JWT_SECRET=sua-chave-secreta-super-segura-min-32-caracteres

# OpenAI API (obrigatório para IA)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxx

# Meta/Facebook (para Instagram)
META_APP_ID=seu-app-id
META_APP_SECRET=seu-app-secret
META_REDIRECT_URI=http://localhost:3001/api/integrations/instagram/callback
META_API_VERSION=v19.0
FRONTEND_URL=http://localhost:3000
```

### 🔧 Configurações Obrigatórias

#### OpenAI API Key (Obrigatório para IA)

1. **Acessar OpenAI Platform:**
   - Vá para: https://platform.openai.com/api-keys
   - Faça login ou crie uma conta

2. **Criar API Key:**
   - Clique em **"Create new secret key"**
   - Dê um nome: "ACI Platform"
   - Copie a chave (começa com `sk-proj-...`)
   - ⚠️ **IMPORTANTE:** Salve imediatamente! Só aparece uma vez

3. **Adicionar no .env:**
   ```env
   OPENAI_API_KEY=sk-proj-sua-chave-aqui
   ```

4. **Verificar Créditos:**
   - Acesse: https://platform.openai.com/usage
   - Novos usuários ganham **$5 grátis** por 3 meses
   - Após isso, adicione créditos em: https://platform.openai.com/account/billing

**⚠️ Troubleshooting:**
- Se aparecer "OpenAI API key invalid", veja [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)


### 3️⃣ Iniciar Aplicação

```bash
npm run dev:all
```

Isso iniciará:
- ✅ Frontend (Vite): http://localhost:3000
- ✅ Backend (Express): http://localhost:3001

---

## 👤 Criar Sua Conta

### Passo 1: Acessar Página de Cadastro

Abra seu navegador e acesse:
```
http://localhost:3000
```

Clique em **"Começar Agora"** ou **"Criar Conta"**

### Passo 2: Preencher Formulário

- **Email**: seu-email@exemplo.com
- **Senha**: Mínimo 6 caracteres
- **Nome Completo** (opcional)

### Passo 3: Receber Bônus 🎉

**Ao criar sua conta, você automaticamente recebe:**
- ✅ **R$ 3,00 de bônus** (3.000 créditos)
- ✅ Acesso a todas as ferramentas
- ✅ Suporte via comunidade

---

## 💰 Sistema de Créditos

### Como Funciona

1. **Sem Mensalidades**: Pague apenas pelo que usar
2. **Créditos Não Expiram**: Use quando quiser
3. **Transparência Total**: Veja o custo antes de cada ação

### Tabela de Custos

| Ação | Custo |
|------|-------|
| **Geração de Texto (GPT-4)** | R$ 0,012 por palavra |
| **Geração de Imagem (DALL-E 3)** | R$ 0,99 por imagem |
| **Post Instagram** | R$ 0,27 |
| **Resposta Automática** | R$ 0,09 |
| **Envio Telegram** | R$ 0,09 |
| **Post WordPress** | R$ 0,27 |
| **Produto WooCommerce** | R$ 0,27 |
| **Review WooCommerce** | R$ 0,27 |

### Como Adicionar Créditos

1. Acesse **"Créditos & Planos"** no menu
2. Escolha o valor (mínimo R$ 50,00)
3. Pague via PIX
4. Créditos são adicionados automaticamente

**Pacotes Disponíveis:**
- R$ 50,00 → 50.000 créditos + 10% bônus
- R$ 97,00 → 100.000 créditos + 10% bônus
- R$ 197,00 → 250.000 créditos + 10% bônus

---

## 🛠️ Funcionalidades Principais

### 📝 1. Geração de Conteúdo com IA

**Tipos de Conteúdo:**
- Artigos de blog
- Reviews de produtos
- Legendas para Instagram
- Descrições de produtos
- E-books

**Como Usar:**
1. Vá em **"Conteúdo IA"** → **"Criar Artigo"**
2. Digite o tema ou produto
3. Escolha o tamanho (curto, médio, longo)
4. Clique em **"Gerar"**
5. Edite e publique!

---

### 📸 2. Automação Instagram

**Requisitos:**
- Conta Instagram **Business** ou **Professional**
- Conectada a uma Página do Facebook

**Como Conectar:**
1. Acesse **"Super Admin"** (se for super admin) ou **"Admin"**
2. Clique em **"Conectar Instagram via Facebook"**
3. Autorize as permissões
4. Pronto! Sua conta está conectada

**Recursos Disponíveis:**
- ✅ Publicar posts automaticamente
- ✅ Responder comentários com IA
- ✅ Detectar "EU QUERO" e enviar link
- ✅ Análise de perfil

---

### 📱 3. Automação Telegram

**Como Usar:**
1. Crie um bot no @BotFather
2. Copie o token do bot
3. Configure em **"Admin"** → **"Telegram"**
4. Adicione o bot aos seus canais
5. Comece a enviar mensagens em massa!

**Recursos:**
- ✅ Envio para múltiplos canais/grupos
- ✅ Formatação rica (HTML/Markdown)
- ✅ Agendamento de mensagens
- ✅ Templates personalizáveis

---

### 🛍️ 4. Integração Shopee

**Como Usar:**
1. Acesse **"Shopee"** → **"Buscar Produtos"**
2. Digite termo de busca
3. Filtre por categoria, preço, etc.
4. Selecione produtos
5. Gere links de afiliado
6. Publique automaticamente!

**Recursos:**
- ✅ Busca avançada de produtos
- ✅ Links de afiliado automáticos
- ✅ Importação de dados
- ✅ Top vendas do dia

---

### 📝 5. Integração WordPress

**Como Conectar:**
1. Acesse seu WordPress
2. Vá em **"Usuários"** → **"Perfil"**
3. Role até **"Senhas de Aplicativo"**
4. Crie uma nova senha com nome "ACI"
5. Copie a senha
6. Cole na ACI em **"Admin"** → **"WordPress"**

**Recursos:**
- ✅ Publicar posts automaticamente
- ✅ Criar rascunhos
- ✅ Gerenciar categorias e tags
- ✅ Upload de imagens
- ✅ Posts de afiliados otimizados

---

### 🛒 6. Integração WooCommerce

**Como Conectar:**
1. Acesse **WooCommerce** → **"Configurações"** → **"Avançado"** → **"API REST"**
2. Clique em **"Adicionar Chave"**
3. Defina permissões: **"Leitura/Gravação"**
4. Copie **Consumer Key** e **Consumer Secret**
5. Cole na ACI

**Recursos:**
- ✅ Criar produtos externos (afiliados)
- ✅ Gerar reviews com IA
- ✅ Atualizar descrições
- ✅ Gerenciar categorias

---

## 🎓 Tutoriais e Exemplos

### Exemplo 1: Publicar Produto da Shopee no Instagram

```
1. Buscar produto na Shopee
2. Gerar legenda com IA
3. Selecionar imagem do produto
4. Publicar no Instagram
5. Monitorar comentários automaticamente
6. Responder "EU QUERO" com link
```

**Custo Total:** ~R$ 0,70

---

### Exemplo 2: Criar Artigo de Blog com Produto

```
1. Buscar produto na Shopee
2. Gerar artigo completo com IA
3. Publicar no WordPress
4. Compartilhar no Telegram
```

**Custo Total:** ~R$ 0,80

---

### Exemplo 3: Adicionar Produto à Loja WooCommerce

```
1. Buscar produto na Shopee
2. Gerar descrição com IA
3. Criar produto externo no WooCommerce
4. Gerar review com IA
```

**Custo Total:** ~R$ 1,00

---

## 🔐 Níveis de Acesso

### Usuário Comum
- ✅ Acesso total ao painel Admin
- ✅ Todas as ferramentas disponíveis
- ✅ Gerenciamento de créditos
- ✅ Histórico de ações

### Super Administrador
Emails com acesso extra:
- `admin@aci.com`
- `suporte@aci.com`
- `teste@teste.com`
- `automacoescomerciais@gmail.com`
- `contato@automacoescomerciais.com.br`
- `admin@automacoescomerciais.com.br`
- `suporte@automacoescomerciais.com.br`

**Privilégios Extras:**
- ✅ Painel "Super Admin"
- ✅ Configurações globais
- ✅ Gerenciamento de usuários
- ✅ Logs do sistema

---

## 📊 Dashboard e Estatísticas

### Visão Geral
- Saldo atual de créditos
- Gastos do mês
- Ações realizadas
- Taxa de conversão

### Histórico
- Todas as transações
- Posts publicados
- Créditos ganhos/gastos
- Exportação em CSV

---

## 🆘 Suporte

### Comunidade
- **WhatsApp:** [Grupo VIP](https://chat.whatsapp.com/BSsknrWToFpJGHz3EnkDUd)
- **Telegram:** [Canal Oficial](https://t.me/+9cdym9gvPQ9iOWNh)
- **Instagram:** [@automacoescomerciais integradas](https://www.instagram.com/automacoescomerciais integradas)

### Contato Direto
- **Email:** contato@automacoescomerciais.com.br
- **Telefone:** +55 88 99422-7586

---

## 🚀 Roadmap

### ✅ Implementado
- Sistema de autenticação
- Dashboard completo
- Integração Instagram
- Integração WordPress
- Integração WooCommerce
- Sistema de créditos
- Bônus de boas-vindas

### 🔄 Em Desenvolvimento
- Sistema de pagamentos (PIX/Stripe)
- Agendamento de posts
- Dashboard analítico
- Templates customizáveis
- Webhooks Instagram

### 📋 Planejado
- App Mobile (React Native)
- Integração TikTok
- Integração YouTube
- Sistema de afiliados
- API pública

---

## 📄 Licença

© 2024 ACI - Automações Comerciais Integradas  
CNPJ: 59.216.642/0001-75  
Todos os direitos reservados.

---

## 🎉 Comece Agora!

1. **Crie sua conta:** http://localhost:3000
2. **Ganhe R$ 3,00 de bônus**
3. **Explore as ferramentas**
4. **Comece a automatizar!**

**Boa sorte e boas vendas! 💰**
