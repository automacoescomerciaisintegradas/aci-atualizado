# 📱 Plano de Implementação - Integração Instagram Completa

> **Versão:** 1.0  
> **Data:** 2026-01-10  
> **Status:** Em Implementação

---

## 📋 Sumário

1. [Visão Geral](#visão-geral)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Permissões Meta/Facebook](#permissões-metafacebook)
4. [Módulos a Implementar](#módulos-a-implementar)
5. [Dependências a Instalar](#dependências-a-instalar)
6. [Estrutura de Arquivos](#estrutura-de-arquivos)
7. [Roadmap de Implementação](#roadmap-de-implementação)
8. [Design de UI/UX](#design-de-uiux)

---

## 🎯 Visão Geral

### Objetivo
Implementar uma integração completa com a API do Instagram Business que permita:

1. **Conexão OAuth** - Login empresarial via Facebook/Instagram
2. **Dashboard de Contas** - Listar contas conectadas com status e métricas
3. **Publicação de Conteúdo** - Posts orgânicos (imagem, carrossel, vídeo)
4. **Automação de Comentários** - Resposta automática com templates
5. **Automação de Direct** - Mensagens privadas automáticas
6. **Insights e Métricas** - Dashboard de performance

### Funcionalidades Principais

| Funcionalidade | Descrição | Permissão Necessária |
|----------------|-----------|---------------------|
| Conectar Conta | OAuth via Facebook | `public_profile`, `instagram_basic` |
| Listar Páginas | Ver páginas do Facebook | `pages_show_list` |
| Publicar Posts | Fotos, vídeos, carrosséis | `instagram_content_publish` |
| Responder Comentários | Público e automático | `instagram_manage_comments` |
| Enviar Direct | Mensagens privadas | `instagram_manage_messages` |
| Ver Insights | Métricas e analytics | `instagram_manage_insights` |
| Ler Engajamento | Curtidas, comentários | `pages_read_engagement` |
| Gerenciar Metadata | Configurações da página | `pages_manage_metadata` |

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Instagram   │  │  Instagram   │  │  Instagram   │  │  Instagram   │ │
│  │  Connect     │  │  Dashboard   │  │  Automation  │  │  Settings    │ │
│  │  Page        │  │  Page        │  │  Page        │  │  Page        │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                 │                 │                 │         │
│         └─────────────────┼─────────────────┼─────────────────┘         │
│                           ▼                 ▼                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    instagram.service.ts                            │  │
│  │    (Cliente API para comunicação com backend)                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTP/REST
┌─────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (Express)                              │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                  routes/instagram.ts                               │  │
│  │  /api/integrations/instagram/*                                     │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│         │                                                               │
│         ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                  lib/instagram.ts                                  │  │
│  │  InstagramAPI Class - Wrapper para Graph API                       │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│         │                                                               │
│         ▼                                                               │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                  services/instagramService.ts                      │  │
│  │  Lógica de negócio, automação, webhooks                           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ HTTPS
┌─────────────────────────────────────────────────────────────────────────┐
│                     META GRAPH API (Facebook/Instagram)                  │
│  https://graph.facebook.com/v23.0/                                       │
├─────────────────────────────────────────────────────────────────────────┤
│  • OAuth 2.0 Authentication                                              │
│  • Instagram Business Account API                                        │
│  • Messaging API                                                         │
│  • Webhooks (comentários, mensagens)                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BANCO DE DADOS (Supabase)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  • integrations (tokens, config)                                         │
│  • instagram_accounts (contas conectadas)                                │
│  • instagram_automations (regras de automação)                           │
│  • instagram_templates (templates de resposta)                           │
│  • instagram_logs (histórico de ações)                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Permissões Meta/Facebook

### Permissões Solicitadas (Scopes)

```
public_profile
instagram_basic
instagram_manage_comments
pages_show_list
pages_read_engagement
pages_manage_metadata
instagram_manage_messages
instagram_content_publish
instagram_manage_insights
business_management
```

### Fluxo OAuth

```
1. Usuário clica em "Conectar Instagram"
          │
          ▼
2. Modal de consentimento com explicação das permissões
          │
          ▼
3. Redirect para Facebook OAuth Dialog
   URL: https://www.facebook.com/v23.0/dialog/oauth
   ?client_id={APP_ID}
   &redirect_uri={CALLBACK_URL}
   &scope={PERMISSIONS}
   &state={USER_ID}
   &response_type=code
          │
          ▼
4. Usuário autoriza no Facebook/Instagram
          │
          ▼
5. Callback com code
   /api/integrations/instagram/callback?code=xxx&state=userId
          │
          ▼
6. Backend troca code por Short-Lived Token (2h)
          │
          ▼
7. Backend troca Short-Lived por Long-Lived Token (60 dias)
          │
          ▼
8. Backend busca páginas do usuário e contas IG vinculadas
          │
          ▼
9. Salva tokens e dados no banco
          │
          ▼
10. Redirect para dashboard com sucesso
```

---

## 📦 Módulos a Implementar

### MÓDULO 1: Conexão e Autenticação
**Prioridade:** 🔴 Alta | **Complexidade:** Média

| Arquivo | Descrição |
|---------|-----------|
| `components/InstagramConnectPage.tsx` | ✅ Já existe - melhorar UI |
| `src/backend/routes/instagram.ts` | ✅ Já existe - expandir |
| `src/lib/instagram.ts` | ✅ Já existe - expandir |
| `services/instagramService.ts` | 🆕 Criar - lógica de negócio |

**Tarefas:**
- [ ] Melhorar modal de consentimento
- [ ] Adicionar validação de conta profissional
- [ ] Implementar refresh de token automático
- [ ] Adicionar logs de conexão

---

### MÓDULO 2: Dashboard de Contas Conectadas
**Prioridade:** 🔴 Alta | **Complexidade:** Média

| Arquivo | Descrição |
|---------|-----------|
| `components/InstagramDashboardPage.tsx` | 🆕 Página principal do Instagram |
| `components/Instagram/AccountCard.tsx` | 🆕 Card de conta conectada |
| `components/Instagram/AccountList.tsx` | 🆕 Lista de contas |
| `components/Instagram/AccountStats.tsx` | 🆕 Estatísticas da conta |

**Campos do Card de Conta:**
```typescript
interface InstagramAccount {
  id: string;
  username: string;
  profile_picture_url: string;
  followers_count: number;
  media_count: number;
  page_name: string;          // Página do Facebook vinculada
  expires_in_days: number;    // Dias até expirar token
  status: 'Ativo' | 'Expirado' | 'Erro';
  connected_at: Date;
}
```

**Layout da Tabela:**
| Conta | Conexões | Vence em (dias) | Situação | Data Cadastro | Ações |
|-------|----------|-----------------|----------|---------------|-------|
| @socialmedia | IG + Page | 89 dias | Ativo | 10/01/2026 | Ver • Editar • Desconectar |

---

### MÓDULO 3: Automação de Respostas
**Prioridade:** 🔴 Alta | **Complexidade:** Alta

| Arquivo | Descrição |
|---------|-----------|
| `components/Instagram/AutomationPage.tsx` | 🆕 Configuração de automação |
| `components/Instagram/ResponseTemplates.tsx` | 🆕 Templates de resposta |
| `components/Instagram/TemplateEditor.tsx` | 🆕 Editor de template |
| `components/Instagram/TemplatePreview.tsx` | 🆕 Preview do template |

**Templates de Resposta Pública:**
```typescript
interface PublicResponseTemplate {
  id: string;
  name: string;
  category: 'direct_friendly' | 'formal' | 'promotional' | 'custom';
  template: string;
  variables: ['FIRST_NAME', 'USERNAME', 'PRODUCT_NAME'];
  preview: string;
}

// Exemplo:
{
  name: "Público • Direto e Amigável",
  template: "👋 Oi, {FIRST_NAME}! Te enviei o link no privado. Se não aparecer, olha em Solicitações ou me manda um oi no direct 😉",
  variables: ['FIRST_NAME']
}
```

**Templates de Resposta Privada (Direct):**
```typescript
interface PrivateResponseTemplate {
  id: string;
  name: string;
  category: 'humanized' | 'direct' | 'promotional' | 'custom';
  template: string;
  variables: ['FIRST_NAME', 'AFFILIATE_LINK', 'PRODUCT_NAME', 'PRICE'];
  preview: string;
}

// Exemplo:
{
  name: "Humanizado Amigável",
  template: `Olá {FIRST_NAME}! 😊 Aqui está o link do produto que você pediu:
{AFFILIATE_LINK}
{PRODUCT_NAME}
Qualquer dúvida, pode me chamar por aqui 💬`
}
```

**Variáveis Suportadas:**
| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `{FIRST_NAME}` | Primeiro nome do usuário | "João" |
| `{USERNAME}` | @ do usuário | "@joaosilva" |
| `{FULL_NAME}` | Nome completo | "João Silva" |
| `{PRODUCT_NAME}` | Nome do produto | "Fone Bluetooth XYZ" |
| `{AFFILIATE_LINK}` | Link de afiliado | "https://shope.ee/xxx" |
| `{PRICE}` | Preço do produto | "R$ 89,90" |
| `{DISCOUNT}` | Desconto | "30% OFF" |

---

### MÓDULO 4: Webhooks e Eventos
**Prioridade:** 🟡 Média | **Complexidade:** Alta

| Arquivo | Descrição |
|---------|-----------|
| `src/backend/routes/webhook-instagram.ts` | 🆕 Receiver de webhooks |
| `services/webhookProcessor.ts` | 🆕 Processador de eventos |
| `src/jobs/commentWatcher.ts` | 🆕 Job de monitoramento |

**Eventos de Webhook:**
- `comments` - Novo comentário em post
- `messages` - Nova mensagem no Direct
- `mentions` - Menções da conta
- `story_insights` - Insights de stories

---

### MÓDULO 5: Publicação de Conteúdo
**Prioridade:** 🟡 Média | **Complexidade:** Média

| Arquivo | Descrição |
|---------|-----------|
| `components/Instagram/PublishPage.tsx` | 🆕 Página de publicação |
| `components/Instagram/PostCreator.tsx` | 🆕 Criador de posts |
| `components/Instagram/MediaUploader.tsx` | 🆕 Upload de mídia |
| `components/Instagram/PostPreview.tsx` | 🆕 Preview do post |

**Tipos de Publicação:**
- Imagem única
- Carrossel (até 10 imagens)
- Vídeo (Reels)
- Publicação agendada

---

### MÓDULO 6: Insights e Analytics
**Prioridade:** 🟢 Baixa | **Complexidade:** Média

| Arquivo | Descrição |
|---------|-----------|
| `components/Instagram/InsightsPage.tsx` | 🆕 Dashboard de métricas |
| `components/Instagram/MetricCard.tsx` | 🆕 Card de métrica |
| `components/Instagram/EngagementChart.tsx` | 🆕 Gráfico de engajamento |

**Métricas Disponíveis:**
- Impressões
- Alcance
- Engajamento (likes, comments, shares, saves)
- Crescimento de seguidores
- Melhores horários para postar

---

## 📚 Dependências a Instalar

### NPM Packages

```bash
# Core
npm install axios @tanstack/react-query

# UI Components
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tabs
npm install @radix-ui/react-tooltip @radix-ui/react-switch

# Forms
npm install react-hook-form @hookform/resolvers zod

# Tables
npm install @tanstack/react-table

# Charts (para Insights)
npm install recharts

# Date handling
npm install date-fns

# Notifications
npm install sonner

# Clipboard
npm install @radix-ui/react-slot
```

### Comando de Instalação Completo

```bash
npm install axios @tanstack/react-query \
  @radix-ui/react-dialog @radix-ui/react-dropdown-menu \
  @radix-ui/react-select @radix-ui/react-tabs \
  @radix-ui/react-tooltip @radix-ui/react-switch \
  react-hook-form @hookform/resolvers zod \
  @tanstack/react-table recharts date-fns sonner
```

---

## 📁 Estrutura de Arquivos

```
c:\projeto telegram\aci-automacoes\
│
├── components/
│   ├── Instagram/                          # 🆕 Nova pasta
│   │   ├── index.ts                        # Exports
│   │   ├── AccountCard.tsx                 # Card de conta
│   │   ├── AccountList.tsx                 # Lista de contas
│   │   ├── AccountStats.tsx                # Estatísticas
│   │   ├── AutomationConfig.tsx            # Config automação
│   │   ├── AutomationRules.tsx             # Regras
│   │   ├── EngagementChart.tsx             # Gráfico
│   │   ├── InsightsPage.tsx                # Analytics
│   │   ├── MediaUploader.tsx               # Upload
│   │   ├── MetricCard.tsx                  # Card métrica
│   │   ├── PostCreator.tsx                 # Criar post
│   │   ├── PostPreview.tsx                 # Preview
│   │   ├── PublishPage.tsx                 # Publicação
│   │   ├── ResponseTemplates.tsx           # Templates
│   │   ├── TemplateEditor.tsx              # Editor
│   │   └── TemplatePreview.tsx             # Preview template
│   │
│   ├── InstagramConnectPage.tsx            # ✅ Já existe
│   ├── InstagramDashboardPage.tsx          # 🆕 Página principal
│   ├── InstagramAutomationPage.tsx         # 🆕 Automação
│   └── InstagramProfilePage.tsx            # ✅ Já existe
│
├── src/
│   ├── backend/
│   │   ├── routes/
│   │   │   ├── instagram.ts                # ✅ Já existe - expandir
│   │   │   └── webhook-instagram.ts        # 🆕 Webhooks
│   │   └── lib/
│   │       └── instagram.ts                # ✅ Já existe - expandir
│   │
│   ├── services/
│   │   └── instagram.service.ts            # 🆕 Cliente frontend
│   │
│   └── types/
│       └── instagram.types.ts              # 🆕 TypeScript types
│
├── services/
│   └── instagramService.ts                 # 🆕 Lógica de negócio
│
└── prisma/
    └── schema.prisma                       # ✅ Atualizar
```

---

## 🗓️ Roadmap de Implementação

### Fase 1: Fundação (Semana 1)
**Objetivo:** Estrutura base e dependências

- [ ] Instalar dependências NPM
- [ ] Criar estrutura de pastas `components/Instagram/`
- [ ] Criar arquivo de types `instagram.types.ts`
- [ ] Atualizar schema Prisma com novas tabelas
- [ ] Criar service `instagram.service.ts` (frontend)
- [ ] Criar service `instagramService.ts` (backend)

### Fase 2: Dashboard de Contas (Semana 1-2)
**Objetivo:** Visualização e gestão de contas

- [ ] Criar `InstagramDashboardPage.tsx`
- [ ] Criar `AccountCard.tsx`
- [ ] Criar `AccountList.tsx`
- [ ] Implementar tabela de contas
- [ ] Adicionar status de conexão
- [ ] Implementar dias até expirar token
- [ ] Adicionar ação de desconectar

### Fase 3: Templates de Resposta (Semana 2)
**Objetivo:** Sistema de templates

- [ ] Criar `ResponseTemplates.tsx`
- [ ] Criar `TemplateEditor.tsx`
- [ ] Criar `TemplatePreview.tsx`
- [ ] Implementar variáveis dinâmicas
- [ ] Criar templates padrão
- [ ] Salvar templates no banco

### Fase 4: Automação (Semana 2-3)
**Objetivo:** Respostas automáticas

- [ ] Criar `InstagramAutomationPage.tsx`
- [ ] Criar `AutomationConfig.tsx`
- [ ] Criar `AutomationRules.tsx`
- [ ] Implementar palavras-chave trigger
- [ ] Implementar resposta pública automática
- [ ] Implementar resposta privada (Direct)
- [ ] Testar fluxo completo

### Fase 5: Webhooks (Semana 3)
**Objetivo:** Eventos em tempo real

- [ ] Criar endpoint de webhook
- [ ] Registrar webhook no Meta
- [ ] Processar evento de comentário
- [ ] Processar evento de mensagem
- [ ] Implementar queue de processamento
- [ ] Adicionar logs e retry

### Fase 6: Publicação (Semana 3-4)
**Objetivo:** Criar e publicar posts

- [ ] Criar `PublishPage.tsx`
- [ ] Criar `PostCreator.tsx`
- [ ] Criar `MediaUploader.tsx`
- [ ] Implementar upload para R2/S3
- [ ] Implementar publicação via API
- [ ] Adicionar agendamento

### Fase 7: Insights (Semana 4)
**Objetivo:** Métricas e analytics

- [ ] Criar `InsightsPage.tsx`
- [ ] Criar `MetricCard.tsx`
- [ ] Criar `EngagementChart.tsx`
- [ ] Integrar com Insights API
- [ ] Criar gráficos com Recharts
- [ ] Armazenar histórico

---

## 🎨 Design de UI/UX

### Paleta de Cores (Dark Mode)

```css
/* Background */
--dark-bg: #0f0f12;
--dark-card: #1a1a24;
--dark-border: #2a2a3a;

/* Text */
--dark-text-primary: #ffffff;
--dark-text-secondary: #a0a0b0;

/* Brand */
--brand-primary: #6366f1;    /* Indigo */
--brand-secondary: #8b5cf6;  /* Purple */

/* Status */
--status-active: #22c55e;    /* Green */
--status-warning: #eab308;   /* Yellow */
--status-error: #ef4444;     /* Red */

/* Instagram Gradient */
--instagram-gradient: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
```

### Componentes de UI

#### Card de Conta Instagram
```
┌─────────────────────────────────────────────────────────────────┐
│  ┌────┐                                                         │
│  │ 📷 │  @socialmediapesssoal                                   │
│  │    │  IG + Page Facebook                    ● Ativo          │
│  └────┘                                                         │
│                                                                 │
│  Vence em: 89 dias        Conectado: 10/01/2026                │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Configurar  │  │  Ver Posts  │  │ Desconectar │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

#### Seletor de Template
```
┌─────────────────────────────────────────────────────────────────┐
│  Resposta Pública Automática                                    │
│  ─────────────────────────────                                  │
│                                                                 │
│  Selecione o modelo de resposta pública                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Público • Direto e Amigável                        ▼   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Pré-visualização                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  👋 Oi, João! Te enviei o link no privado.              │   │
│  │  Se não aparecer, olha em Solicitações ou me manda      │   │
│  │  um oi no direct 😉                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Segurança

### Tokens
- Armazenar tokens criptografados no banco
- Implementar refresh automático antes de expirar
- Revogar tokens ao desconectar

### Webhooks
- Validar assinatura X-Hub-Signature
- Verificar VERIFY_TOKEN no setup
- Rate limiting

### Dados
- Não armazenar senhas de usuários Instagram
- Logs sem dados sensíveis
- LGPD compliance

---

## 📞 Próximos Passos

1. **Aprovação do Plano** - Revisar e aprovar arquitetura
2. **Instalação de Dependências** - npm install
3. **Iniciar Fase 1** - Estrutura base
4. **Desenvolvimento iterativo** - Módulo por módulo

---

> **Documento gerado automaticamente**  
> **Última atualização:** 2026-01-10
