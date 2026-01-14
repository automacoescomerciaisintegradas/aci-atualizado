# ACI - Automações Comerciais Integradas - Conteúdo Completo para NotebookLM

## Descrição Geral
A ACI é uma plataforma completa de automação inteligente para afiliados, que integra Inteligência Artificial com as principais plataformas de e-commerce e marketing digital.

## Funcionalidades de IA e Geração de Conteúdo
- Geração de Conteúdo com IA (GPT-4, Gemini)
- Geração de Texto: R$ 0,012 por palavra
- Geração de Imagem (DALL-E 3): R$ 0,99 por imagem
- Tipos de Conteúdo: Artigos de blog, reviews de produtos, legendas para Instagram, descrições de produtos, e-books

## Automações Disponíveis
- Automação Instagram (Posts, Comentários, DM)
- Automação Telegram (Envio em massa, Canais)
- Integração Shopee (Busca produtos, Links de afiliado)
- Publicação WordPress (Artigos automáticos)
- Integração WooCommerce (Produtos, Reviews)

## Sistema de Créditos
- Sem mensalidades: Pague apenas pelo que usar
- Créditos não expiram
- Transparência total nos custos
- Bônus de R$ 3,00 (3.000 créditos) para novos usuários

## Configuração de API
- Requer OpenAI API Key para funcionalidades de IA
- Configuração via variáveis de ambiente
- Suporte a diferentes provedores de IA (GPT-4, Gemini)

## Exemplos de Uso
1. Publicar Produto da Shopee no Instagram (custo total ~R$ 0,70)
2. Criar Artigo de Blog com Produto (custo total ~R$ 0,80)
3. Adicionar Produto à Loja WooCommerce (custo total ~R$ 1,00)

## Níveis de Acesso
- Usuário Comum: Acesso total ao painel Admin
- Super Administrador: Acesso extra a configurações globais e gerenciamento de usuários

---

# Guia de Importação em Massa (CSV) para Blog

## Estrutura do Arquivo CSV

A primeira linha do arquivo deve conter os cabeçalhos exatos abaixo:

```
nome_produto,descricao,link_afiliado,tom_de_voz,publico_alvo
```

### Detalhes das Colunas:

1. **nome_produto** (Obrigatório): O nome principal do produto.
2. **descricao** (Obrigatório): Detalhes do produto, características, benefícios. Quanto mais detalhes, melhor o post.
3. **link_afiliado** (Opcional): O link para onde o botão de compra deve apontar.
4. **tom_de_voz** (Opcional): Ex: "persuasivo", "técnico", "divertido". Se vazio, usa o padrão.
5. **publico_alvo** (Opcional): Ex: "gamers", "donas de casa", "estudantes". Se vazio, usa o padrão.

## Exemplo de Conteúdo

```
nome_produto,descricao,link_afiliado,tom_de_voz,publico_alvo
"Smartphone XYZ","Tela AMOLED 120Hz, Câmera 108MP, Bateria 5000mAh","https://shopee.com.br/produto123","entusiasta","amantes de tecnologia"
"Fone Bluetooth Pro","Cancelamento de ruído ativo, 30h de bateria","https://amazon.com.br/fone123","profissional","trabalhadores remotos"
```

---

# Guia de Configuração - Variáveis de Ambiente

## Obrigatórias

### OPENAI_API_KEY (Geração de Conteúdo com IA)

Chave de API da OpenAI para usar GPT-4, GPT-3.5 e DALL-E.

**Como obter:**
1. Acesse: https://platform.openai.com/api-keys
2. Faça login (ou crie conta)
3. Clique em "Create new secret key"
4. Dê um nome: "ACI Platform"
5. Copie a chave (formato: `sk-proj-xxxxxxxxxx`)

### JWT_SECRET (Autenticação)

Chave secreta usada para assinar tokens JWT de autenticação.

**Como gerar:**
Use uma chave aleatória e segura (mínimo 32 caracteres):

```
# Opção 1: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Opcionais

### META/FACEBOOK (Integração Instagram)

Credenciais do Facebook Developers para integração Instagram via Graph API.

**Como obter:**

1. **Criar App no Facebook:**
   - Acesse: https://developers.facebook.com/
   - Clique em "My Apps" → "Create App"
   - Escolha "Consumer" ou "Business"
   - Preencha informações do app

2. **Configurar Produto Instagram:**
   - Clique em "Add Product"
   - Selecione "Instagram Graph API"
   - Configure permissões e URLs de redirect

### TELEGRAM_BOT_TOKEN (Integração Telegram)

Token de autenticação do seu bot do Telegram.

**Como obter:**

1. Abra o Telegram
2. Procure por **@BotFather**
3. Envie `/newbot`
4. Siga as instruções
5. Copie o token fornecido (formato: `1234567890:ABCdefGHIjklMNO`)

---

# Nova Tela de Autenticação - Guia de Integração

## Características

Baseada no design do **Intelyze.com.br**, a nova tela de autenticação oferece:

### Funcionalidades Implementadas:
1. ✅ **OAuth2 com Google** - Login social integrado
2. ✅ **Email/Senha** - Autenticação tradicional
3. ✅ **Registro de Usuário** - Com verificação de email
4. ✅ **Recuperação de Senha** - Reset via email
5. ✅ **Verificação de Email** - Confirmação obrigatória
6. ✅ **Design Responsivo** - Mobile-first, adaptável a todos os tamanhos
7. ✅ **Feedback Visual** - Mensagens de sucesso/erro/info
8. ✅ **Loading States** - Indicadores de carregamento

## Configuração do Supabase

### Ativar Google OAuth no Supabase

1. Acesse **Supabase Dashboard** → Seu Projeto
2. Vá em **Authentication** → **Providers**
3. Ative **Google** e configure:
   - **Client ID** (do Google Cloud Console)
   - **Client Secret** (do Google Cloud Console)

### Criar OAuth App no Google Cloud

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione existente
3. Vá em **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure:
   - **Application Type**: Web Application
   - **Authorized redirect URIs**:
     ```
     https://[SEU-PROJETO].supabase.co/auth/v1/callback
     ```

---

# Sistema de Créditos e Pagamentos - Guia Completo

## Visão Geral

Sistema completo de créditos com pagamento via **PIX** (Mercado Pago) para monetizar sua plataforma ACI.

### Funcionalidades Implementadas:
- ✅ **Sistema de Créditos** - Saldo nunca expira
- ✅ **Pagamento PIX** - QR Code instantâneo
- ✅ **3 Planos** - Starter, Pro, Enterprise
- ✅ **Validação Robusta** - Múltiplas camadas de segurança
- ✅ **Webhook** - Confirmação automática de pagamento
- ✅ **Histórico** - Transações e uso de créditos
- ✅ **Bônus** - Créditos extras em planos maiores

## Estrutura do Banco de Dados

### Tabelas:

1. **`user_credits`** - Saldo de créditos de cada usuário
   - `balance` - Saldo atual
   - `total_purchased` - Total comprado historicamente
   - `total_used` - Total consumido

2. **`payment_transactions`** - Transações de pagamento
   - `transaction_id` - ID do Mercado Pago
   - `amount` - Valor pago
   - `credits` - Créditos adquiridos
   - `status` - pending, completed, failed, expired
   - `pix_qr_code` - QR Code em base64
   - `pix_copy_paste` - Código PIX Copia e Cola

3. **`credit_usage_history`** - Histórico de uso
   - `credits_used` - Quantidade consumida
   - `action` - Tipo de ação executada
   - `action_metadata` - Detalhes adicionais

## Custos de Crédito por Ação

| Ação | Créditos | Justificativa |
|------|----------|---------------|
| Post WordPress | 5 | Geração IA + Publicação API |
| Mensagem Telegram | 2 | Envio API |
| Busca Shopee | 1 | Consulta API |
| Geração Imagem | 10 | Custo alto de IA |
| Análise Instagram | 3 | Scraping + Processamento |

---

# ADR: Architecture Decision Records

## Decisão 001: Escolha do Stack Tecnológico

### Contexto
Precisamos definir o stack tecnológico para o desenvolvimento da plataforma ACI, considerando fatores como familiaridade da equipe, performance, escalabilidade e facilidade de manutenção.

### Decisão
Optamos por utilizar:
- **Frontend**: React com TypeScript e TailwindCSS
- **Backend**: Node.js com Supabase
- **Infraestrutura**: Vercel para frontend e Supabase para backend

### Justificativa
- React é amplamente adotado e tem grande comunidade
- TypeScript adiciona segurança e produtividade no desenvolvimento
- TailwindCSS permite estilização rápida e consistente
- Supabase oferece backend completo com PostgreSQL
- Vercel proporciona deploy simples e rápido

## Decisão 002: Estrutura de Pastas do Projeto

### Contexto
É necessário definir uma estrutura de pastas que facilite a manutenção, escalabilidade e compreensão do código por diferentes desenvolvedores.

### Decisão
Adotamos uma estrutura modular que separa claramente as responsabilidades:
```
.
├── components/
├── hooks/
├── services/
├── pages/
├── public/
├── styles/
├── utils/
├── types/
├── constants/
└── assets/
```

## Decisão 003: Sistema de Autenticação

### Contexto
Precisamos implementar um sistema de autenticação seguro e flexível que suporte múltiplos métodos de login.

### Decisão
Implementaremos autenticação com:
- E-mail e senha
- Google OAuth
- Telefone via SMS

Utilizando JWT para gerenciamento de sessões.

## Decisão 004: Integração com APIs Externas

### Contexto
O sistema precisa se integrar com diversas APIs externas (Instagram, Telegram, Shopee, WordPress) de forma confiável e eficiente.

### Decisão
Criaremos uma camada de serviço dedicada para cada integração, com:
- Tratamento de erros padronizado
- Logging de requisições
- Cache quando apropriado
- Rate limiting respeitando os limites das APIs

## Decisão 005: Gerenciamento de Estado

### Contexto
Precisamos gerenciar o estado da aplicação de forma eficiente, especialmente para dados que são compartilhados entre múltiplos componentes.

### Decisão
Utilizaremos:
- Context API do React para estado global simples
- Zustand ou Redux para estado mais complexo (se necessário)
- Local state do React para componentes isolados