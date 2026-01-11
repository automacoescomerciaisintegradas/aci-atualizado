# 📋 Plano do Projeto ACI - Automações Comerciais Integradas

> **Gerado em:** 2026-01-10  
> **Status:** Em desenvolvimento ativo  
> **Última análise:** Completa

---

## 📖 Visão Geral

A **ACI (Automações Comerciais Integradas)** é uma plataforma completa de automação inteligente para afiliados e marketing digital, que integra **Inteligência Artificial** com as principais plataformas de e-commerce e redes sociais.

### 🎯 Objetivo Principal
Fornecer uma solução pay-per-use para automação de marketing digital, permitindo que afiliados e empreendedores digitais criem conteúdo, publiquem automaticamente e gerenciem múltiplas plataformas de um único lugar.

---

## 🏗️ Arquitetura do Projeto

### Estrutura de Diretórios

```
c:\projeto telegram\aci-automacoes\
├── 📁 api/                          # APIs e Webhooks
│   └── webhooks/
│       └── mercadopago.ts           # Webhook MercadoPago (16KB)
│
├── 📁 apps/                         # Aplicações
│   └── legacy-client/               # Cliente legado (8 arquivos)
│
├── 📁 components/                   # Componentes React (89 arquivos)
│   ├── AdminPage.tsx                # Painel administrativo
│   ├── AuthPage.tsx                 # Autenticação (42KB)
│   ├── BlogCreator.tsx              # Criador de blogs (52KB)
│   ├── CreditsPage.tsx              # Sistema de créditos (23KB)
│   ├── InstagramCaptionGenerator.tsx # Gerador IA Instagram
│   ├── MultiChannelPublisher.tsx    # Publicação multi-canal (44KB)
│   ├── PricingPage.tsx              # Página de preços
│   ├── ProfilePage.tsx              # Perfil do usuário (42KB)
│   ├── ShopeeSearch.tsx             # Busca Shopee (17KB)
│   ├── SuperAdminPage.tsx           # Super Admin (16KB)
│   ├── TelegramPage.tsx             # Integração Telegram
│   ├── ui/                          # Componentes de UI base
│   └── ...                          # + 60 componentes
│
├── 📁 src/                          # Código fonte principal
│   ├── api/                         # Controllers e rotas (14 subpastas)
│   │   ├── admin/                   # Endpoints administrativos
│   │   ├── auth/                    # Autenticação (4 arquivos)
│   │   ├── content/                 # Conteúdo IA
│   │   ├── integrations/            # APIs externas
│   │   ├── scheduler/               # Agendamento
│   │   ├── storage/                 # Armazenamento
│   │   └── wallet/                  # Carteira/créditos (3 arquivos)
│   │
│   ├── backend/                     # Lógica de negócio (15 arquivos)
│   │   ├── server.ts                # Servidor Express (9KB)
│   │   ├── auth.ts                  # Autenticação
│   │   ├── creditLedger.ts          # Registro de créditos
│   │   ├── costGuard.ts             # Controle de custos
│   │   ├── emailService.ts          # Serviço de email (8KB)
│   │   └── routes/                  # Rotas backend
│   │
│   ├── services/                    # Serviços internos
│   ├── common/                      # Código compartilhado
│   ├── styles/                      # Estilos SCSS/CSS
│   ├── types/                       # TypeScript types
│   └── utils/                       # Utilitários
│
├── 📁 services/                     # Serviços principais (7 arquivos)
│   ├── creditService.ts             # Sistema de créditos (53KB)
│   ├── geminiService.ts             # Integração Google Gemini (37KB)
│   ├── wordpressService.ts          # Integração WordPress (22KB)
│   ├── pixPaymentService.ts         # Pagamentos PIX (22KB)
│   ├── newsletterService.ts         # Newsletter (7KB)
│   ├── emailService.ts              # Emails transacionais
│   └── supabaseClient.ts            # Cliente Supabase
│
├── 📁 supabase/                     # Configuração Supabase
│   ├── config.toml                  # Configuração
│   ├── functions/                   # Edge Functions (3)
│   │   ├── create-checkout/         # Checkout de pagamento
│   │   ├── payment-webhook/         # Webhook de pagamentos
│   │   └── send-welcome-email/      # Email de boas-vindas
│   └── migrations/                  # Migrações SQL (8 arquivos)
│
├── 📁 hooks/                        # React Hooks personalizados
│   ├── useCredits.ts                # Hook de créditos (17KB)
│   ├── usePixPayment.ts             # Hook PIX (5KB)
│   ├── useProfile.ts                # Hook de perfil (10KB)
│   └── useSettings.ts               # Hook de configurações
│
├── 📁 migrations/                   # Migrações locais SQL
│   ├── 0001_initial_schema.sql      # Schema inicial
│   ├── 0002_user_sessions.sql       # Sessões de usuário
│   ├── 0003_password_reset.sql      # Reset de senha
│   └── 0004_add_password_hash.sql   # Hash de senha
│
├── 📁 prisma/                       # ORM Prisma
│   └── schema.prisma                # Schema do banco (7KB)
│
├── 📁 docs/                         # Documentação (16 arquivos)
│   ├── PIX_PAYMENT_SYSTEM.md        # Sistema PIX
│   ├── NEWSLETTER_SETUP.md          # Setup Newsletter
│   ├── INSTAGRAM_SETUP.md           # Setup Instagram
│   ├── SMTP_SETUP.md                # Configuração SMTP
│   ├── ai_workflow_plan.md          # Workflow IA
│   └── ...
│
├── 📁 config/                       # Configurações (1 arquivo)
├── 📁 public/                       # Arquivos públicos (4 arquivos)
├── 📁 scripts/                      # Scripts utilitários (3 arquivos)
├── 📁 designs/                      # Designs/mockups (1 arquivo)
└── 📁 types/                        # Types globais (2 arquivos)
```

---

## 💻 Tech Stack

| Camada | Tecnologia | Versão | Descrição |
|--------|------------|--------|-----------|
| **Frontend** | React | 19.1.0 | Interface do usuário |
| **Build Tool** | Vite | 6.2.0 | Bundler e dev server |
| **Styling** | TailwindCSS | 4.1.17 | Estilos utilitários |
| **Backend** | Express | 4.18.2 | API RESTful |
| **Linguagem** | TypeScript | 5.8.2 | Type safety |
| **Banco de Dados** | PostgreSQL (Supabase) | - | Dados relacionais com RLS |
| **ORM** | Prisma | 5.10.2 | Acesso ao banco |
| **IA** | Google Gemini | @google/genai 1.8.0 | Geração de conteúdo |
| **Animações** | Motion | 12.23.26 | Animações React |
| **Ícones** | Lucide React | 0.555.0 | Biblioteca de ícones |
| **Email** | Nodemailer | 7.0.11 | Envio de emails |
| **Deploy** | Cloudflare Workers | wrangler 4.53.0 | Edge computing |
| **Testes** | Vitest | 4.0.14 | Test framework |

---

## ✨ Funcionalidades Principais

### 1. 🔐 Sistema de Autenticação
- Login com email/senha
- OAuth com Google
- Recuperação de senha via email
- Verificação de email em tempo real
- Sessões JWT com validade de 7 dias
- Row Level Security (RLS) no Supabase

### 2. 💰 Sistema de Créditos (Pay-per-use)
- Sem mensalidades - pague pelo uso
- Créditos não expiram
- Bônus de R$ 3,00 no cadastro
- Transparência total de custos
- Histórico de transações
- Integração com PIX

#### Tabela de Custos
| Ação | Custo |
|------|-------|
| Geração de Texto (GPT-4/Gemini) | R$ 0,012 por palavra |
| Geração de Imagem (DALL-E 3) | R$ 0,99 por imagem |
| Post Instagram | R$ 0,27 |
| Resposta Automática | R$ 0,09 |
| Envio Telegram | R$ 0,09 |
| Post WordPress | R$ 0,27 |
| Produto WooCommerce | R$ 0,27 |

### 3. 🤖 Geração de Conteúdo com IA
- Artigos de blog
- Reviews de produtos
- Legendas para Instagram
- Descrições de produtos
- E-books
- Integração com Google Gemini

### 4. 📸 Automação Instagram
- Publicação automática de posts
- Resposta automática a comentários com IA
- Detecção de palavras-chave ("EU QUERO")
- Envio automático de links via DM
- Análise de perfil

### 5. 📱 Automação Telegram
- Envio em massa para canais/grupos
- Formatação rica (HTML/Markdown)
- Agendamento de mensagens
- Templates personalizáveis

### 6. 🛍️ Integração Shopee
- Busca avançada de produtos
- Geração de links de afiliado
- Importação de dados
- Top vendas do dia

### 7. 📝 Integração WordPress
- Publicação automática de posts
- Criação de rascunhos
- Gerenciamento de categorias/tags
- Upload de imagens

### 8. 🛒 Integração WooCommerce
- Criação de produtos externos (afiliados)
- Geração de reviews com IA
- Atualização de descrições
- Gerenciamento de categorias

### 9. 💳 Sistema de Pagamentos
- Pagamento via PIX
- Integração MercadoPago (webhook)
- Pacotes de créditos com bônus

---

## 📊 Modelo de Dados (Prisma Schema)

### Entidades Principais

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id              │
│ email           │
│ passwordHash    │
│ name            │
│ avatarUrl       │
│ role (USER/ADMIN)
│ createdAt       │
│ updatedAt       │
└─────────────────┘
        │
        ├──────── Wallet (1:1)
        │         └── Transactions (1:N)
        │
        ├──────── Integrations (1:N)
        │         ├── Instagram
        │         ├── Telegram
        │         ├── WordPress
        │         ├── WooCommerce
        │         └── Shopee
        │
        ├──────── Blogs (1:N)
        │         └── AiContent (1:N)
        │
        ├──────── SocialPosts (1:N)
        │         └── CommentTriggers (1:N)
        │
        └──────── AffiliateProducts (1:N)
```

### Enums
- **UserRole**: USER, ADMIN, SUPPORT
- **TransactionType**: DEPOSIT, USAGE_AI, USAGE_SOCIAL, REFUND, BONUS
- **ProviderType**: OPENAI, INSTAGRAM, TELEGRAM, SHOPEE, WORDPRESS, WOOCOMMERCE
- **ConnectionStatus**: ACTIVE, EXPIRED, REVOKED
- **ContentType**: ARTICLE, PRODUCT_REVIEW, SOCIAL_CAPTION, IMAGE, EBOOK
- **ContentStatus**: DRAFT, PUBLISHED, SCHEDULED
- **PostStatus**: PENDING, SCHEDULED, PUBLISHED, FAILED

---

## 🔄 Fluxos de Trabalho

### Fluxo de Autenticação
```
1. Usuário acessa /login
2. Escolhe método (email/senha ou Google OAuth)
3. Backend valida credenciais
4. Gera JWT com validade de 7 dias
5. Retorna token ao frontend
6. Frontend armazena e usa em requisições
```

### Fluxo de Publicação Instagram
```
1. Buscar produto na Shopee
2. Gerar legenda com IA (Google Gemini)
3. Selecionar imagem do produto
4. Publicar no Instagram
5. Configurar triggers para comentários
6. Sistema monitora e responde automaticamente
```

### Fluxo de Pagamento PIX
```
1. Usuário seleciona pacote de créditos
2. Sistema gera QR Code PIX
3. Usuário realiza pagamento
4. Webhook MercadoPago confirma
5. Créditos são adicionados à carteira
6. Notificação de sucesso ao usuário
```

---

## 📁 Arquivos de Configuração

| Arquivo | Descrição |
|---------|-----------|
| `package.json` | Dependências e scripts |
| `vite.config.ts` | Configuração do Vite |
| `tsconfig.json` | Configuração TypeScript |
| `tailwind.config.js` | Configuração TailwindCSS |
| `prisma/schema.prisma` | Schema do banco de dados |
| `wrangler.toml` | Configuração Cloudflare Workers |
| `docker-compose.yml` | Configuração Docker |
| `.env` | Variáveis de ambiente |

---

## 🔧 Scripts NPM

| Script | Comando | Descrição |
|--------|---------|-----------|
| `dev` | `vite` | Inicia o frontend em desenvolvimento |
| `server` | `tsx watch src/backend/server.ts` | Inicia o backend com hot reload |
| `dev:all` | `concurrently "npm run dev" "npm run server"` | Inicia frontend + backend |
| `build` | `vite build` | Build de produção |
| `preview` | `vite preview` | Preview do build |
| `test` | `vitest` | Executa testes |

---

## 📚 Documentação Existente

| Documento | Descrição |
|-----------|-----------|
| `README.md` | Guia principal do projeto |
| `PLANNING.md` | Planejamento técnico |
| `PROJECT_SUMMARY.md` | Resumo do projeto |
| `TASK.md` | Checklist de tarefas |
| `TROUBLESHOOTING.md` | Resolução de problemas |
| `CONFIG-GUIDE.md` | Guia de configuração |
| `TESTING-GUIDE.md` | Guia de testes |
| `docs/PIX_PAYMENT_SYSTEM.md` | Sistema de pagamentos |
| `docs/INSTAGRAM_SETUP.md` | Setup Instagram |
| `docs/SMTP_SETUP.md` | Configuração de emails |

---

## 🚀 Roadmap

### ✅ Implementado
- [x] Sistema de autenticação completo
- [x] Dashboard responsivo
- [x] Integração Instagram
- [x] Integração WordPress
- [x] Integração WooCommerce
- [x] Sistema de créditos
- [x] Bônus de boas-vindas
- [x] Geração de conteúdo com IA (Gemini)
- [x] Webhook MercadoPago

### 🔄 Em Desenvolvimento
- [ ] Sistema de pagamentos PIX completo
- [ ] Agendamento de posts
- [ ] Dashboard analítico avançado
- [ ] Templates customizáveis
- [ ] Webhooks Instagram

### 📋 Planejado
- [ ] App Mobile (React Native)
- [ ] Integração TikTok
- [ ] Integração YouTube
- [ ] Sistema de afiliados interno
- [ ] API pública documentada

---

## 🔐 Segurança

### Práticas Implementadas
- Row Level Security (RLS) no Supabase
- JWT para autenticação
- Senhas com hash seguro
- Variáveis de ambiente para secrets
- Validação de entrada de dados
- CORS configurado
- Helmet para headers de segurança

### Conformidade
- LGPD (Lei Geral de Proteção de Dados)
- Política de Privacidade
- Termos de Uso

---

## 📞 Contato & Suporte

- **Email:** contato@automacoescomerciais.com.br
- **Telefone:** +55 88 99422-7586
- **WhatsApp:** [Grupo VIP](https://chat.whatsapp.com/BSsknrWToFpJGHz3EnkDUd)
- **Telegram:** [Canal Oficial](https://t.me/+9cdym9gvPQ9iOWNh)
- **Instagram:** @automacoescomerciais

---

## 📄 Informações Legais

© 2024-2026 ACI - Automações Comerciais Integradas  
CNPJ: 59.216.642/0001-75  
Todos os direitos reservados.

---

> **Última atualização:** 2026-01-10  
> **Mantido por:** Automações Comerciais Integradas
