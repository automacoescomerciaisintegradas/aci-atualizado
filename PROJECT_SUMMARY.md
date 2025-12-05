# 📚 Resumo do Projeto ACI - Automações Comerciais Integradas

> **Data:** 2025-11-27  
> **Versão:** 1.0  
> **Status:** Em desenvolvimento ativo

---

## 📖 1. Páginas/Documentação (📚 Páginas/docs)

### Documentos Principais
- **PLANNING.md** - Planejamento da plataforma ACI com visão geral, tech stack, estrutura de pastas e roadmap
- **TASK.md** - Checklist de tarefas do projeto com status de conclusão
- **IMPLEMENTATION_SUMMARY.md** - Resumo das implementações realizadas
- **README.md** - Instruções para rodar a aplicação localmente
- **docs/** - Pasta com documentação adicional:
  - `global.md` - Plano de ação global de alto nível
  - `requirements_and_decisions.md` - Requisitos do produto e decisões técnicas
  - `R2_STORAGE.md` - Documentação de armazenamento
  - `ai_workflow_plan.md` - Plano de workflow com IA
  - `WORDPRESS_MODULE.md` - Documentação do módulo WordPress

### Páginas da Aplicação
1. **Autenticação**
   - `AuthPage.tsx` - Login/Cadastro com validação de email em tempo real
   
2. **Perfil do Usuário**
   - Configurações pessoais
   - Sistema de créditos
   - Opções de assinatura/planos

3. **Integrações Sociais**
   - `InstagramConnectPage.tsx` - Conexão com Instagram
   - `TelegramPage.tsx` - Integração com Telegram
   - `ShopeeLotePage.tsx` - Busca de produtos na Shopee

4. **Criação de Conteúdo**
   - Gerador de legendas para Instagram (com IA)
   - Criador de posts para blog (BlogCreator)
   - Publicador multi-canal

5. **Conformidade Legal**
   - `PrivacyPolicyPage.tsx` - Política de Privacidade (LGPD)
   - `TermsOfUsePage.tsx` - Termos de Uso

6. **Dashboard**
   - Métricas e análises básicas
   - Visualização de créditos

---

## 🔑 2. Logins OAuth (🔑 Logins OAuth)

### Implementação Atual

#### Google OAuth
**Arquivo:** `src/api/auth/login.controller.ts`

```typescript
// Configuração
- Cliente: google-auth-library
- Ambiente: GOOGLE_CLIENT_ID (via .env)
- Método: POST /api/auth/google
- Entrada: { idToken: string }
- Saída: { token: JWT com validade 7 dias }

// Fluxo:
1. Frontend captura ID Token do Google
2. Backend verifica o token com Google OAuth2Client
3. Extrai email do payload
4. Gera JWT assinado para sessão interna
5. Retorna token ao frontend
```

#### Supabase Auth
- Integração nativa com Supabase
- Suporte para múltiplos providers
- Session management automático

### OAuth Providers Configurados
- ✅ Google
- ✅ Telefone (Supabase)
- 📌 Facebook (em backlog)
- 📌 Instagram (em backlog)

### Variáveis de Ambiente Necessárias
```env
GOOGLE_CLIENT_ID=<your-google-client-id>
JWT_SECRET=<your-jwt-secret>
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-key>
```

### Fluxo de Autenticação
```
1. Usuário clica em "Login com Google"
2. Google OAuth2 flow é iniciado
3. Usuário autoriza a aplicação
4. Frontend recebe ID Token
5. POST /api/auth/google com o token
6. Backend valida e gera JWT interno
7. Usuário é autenticado na sessão
8. Perfil do usuário é criado/atualizado
```

---

## 🧪 3. Testes de Banco de Dados para Políticas de RLS (🧪 Testes de banco de dados para políticas de RLS)

### Estrutura RLS Implementada

#### Tabela: `public.users`
**Arquivo:** `supabase_schema.sql`

```sql
-- Tabela de Usuários com RLS habilitado
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  photo_url TEXT,
  role TEXT CHECK (role IN ('admin', 'user')) DEFAULT 'user',
  status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Habilitar Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### Políticas RLS Implementadas

| Política | Operação | Condição | Descrição |
|----------|----------|----------|-----------|
| `Perfis são visíveis por usuários autenticados` | SELECT | `auth.role() = 'authenticated'` | Qualquer usuário autenticado pode ver perfis |
| `Usuários podem criar seu próprio perfil` | INSERT | `auth.uid() = id` | Usuários só criam seu próprio perfil |
| `Usuários podem atualizar seu próprio perfil` | UPDATE | `auth.uid() = id` | Usuários só atualizam seu próprio perfil |

### Arquivos SQL Relacionados
- **supabase_schema.sql** - Schema completo com RLS
- **update_schema.sql** - Scripts de atualização
- **fix_schema.sql** - Correções de schema
- **disable_rls.sql** - Script para desabilitar RLS (dev)
- **list_tables.sql** - Listagem de tabelas

### Testes de RLS Necessários

#### 1. Teste de Isolamento de Dados
```sql
-- Usuario A não pode ver dados de Usuario B
SELECT * FROM public.users WHERE id != auth.uid();
-- Resultado esperado: Sem erro, mas retorna apenas perfis autenticados
```

#### 2. Teste de Inserção Própria
```sql
-- Usuário só pode inserir seu próprio perfil
INSERT INTO public.users (id, email, name) 
VALUES (auth.uid(), 'user@example.com', 'User Name');
-- Resultado esperado: Sucesso
```

#### 3. Teste de Inserção Cruzada (Deve falhar)
```sql
-- Usuário tenta inserir perfil de outro
INSERT INTO public.users (id, email, name) 
VALUES ('other-uuid', 'other@example.com', 'Other User');
-- Resultado esperado: Erro de RLS
```

#### 4. Teste de Atualização Própria
```sql
-- Usuário atualiza seu próprio perfil
UPDATE public.users SET name = 'New Name' WHERE id = auth.uid();
-- Resultado esperado: Sucesso
```

#### 5. Teste de Atualização Cruzada (Deve falhar)
```sql
-- Usuário tenta atualizar perfil de outro
UPDATE public.users SET name = 'Hacked' WHERE id != auth.uid();
-- Resultado esperado: Erro de RLS
```

### Próximas Etapas de Testes
- [ ] Implementar testes automatizados com pgTAP ou Supabase Testing
- [ ] Validar RLS policies com múltiplos usuários
- [ ] Testar cenários de Admin
- [ ] Implementar audit logging para alterações

---

## 📋 4. rule-contexto-historico

### Conceito
"rule-contexto-historico" refere-se a uma regra que mantém o contexto histórico das ações/decisões no sistema. Essa funcionalidade permite:

1. **Auditoria Completa** - Rastreamento de todas as ações do usuário
2. **Análise Histórica** - Entender padrões de uso
3. **Conformidade LGPD** - Manter logs de acesso aos dados

### Implementação Proposta

#### Tabela de Auditoria
```sql
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Habilitar RLS para auditoria
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Usuários só podem ver seu próprio histórico
CREATE POLICY "Usuários veem apenas seu histórico"
  ON public.audit_log FOR SELECT
  USING (user_id = auth.uid());
```

#### Trigger de Auditoria
```sql
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_log (user_id, action, table_name, old_data, new_data)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger na tabela users
CREATE TRIGGER users_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.users
FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

### Casos de Uso
1. **Rastreamento de Mudanças** - Quem mudou o quê e quando
2. **Recuperação de Dados** - Restaurar dados anteriores se necessário
3. **Segurança** - Detectar atividades suspeitas
4. **LGPD Compliance** - Provar acessos e processamento de dados

### Integração com RLS
- Auditoria integrada às políticas de Row Level Security
- Usuários só veem seu próprio histórico
- Admins podem ver histórico completo (com política adicional)

---

## 🏗️ Tech Stack Resumo

| Camada | Tecnologia | Descrição |
|--------|-----------|-----------|
| **Frontend** | React + TypeScript + Vite | UI responsiva e moderna |
| **Styling** | TailwindCSS + SCSS | Estilização utilitária |
| **Backend** | Node.js + Express | API RESTful |
| **Banco de Dados** | PostgreSQL (Supabase) | Dados relacionais com RLS |
| **Autenticação** | Supabase Auth + OAuth2 | Gerenciamento de sessões |
| **Integrações** | APIs externas | Google, Telegram, Shopee, etc. |
| **Deploy** | Docker + Vercel | Containerização e hosting |

---

## 🚀 Como Começar

### Instalação
```bash
# Clonar repositório
git clone <repo-url>

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Rodar servidor de desenvolvimento
npm run dev
```

### Estrutura de Diretórios
```
.
├── src/
│   ├── api/              # Controllers e rotas
│   ├── backend/          # Lógica de negócio
│   └── ...
├── components/           # Componentes React
├── hooks/               # Hooks personalizados
├── services/            # Integração com APIs
├── docs/                # Documentação
├── prisma/              # ORM (Prisma schema)
└── public/              # Arquivos estáticos
```

---

## 📝 Documentação Adicional

Para mais detalhes, consulte:
- **PLANNING.md** - Planejamento completo
- **TASK.md** - Checklist de tarefas
- **docs/global.md** - Plano de ação global
- **docs/requirements_and_decisions.md** - Requisitos e decisões técnicas

---

## 🔗 Links Úteis

- 🌐 [Website](https://aci.automacoescomerciais.com.br)
- 📧 [Contato](mailto:contato@automacoescomerciais.com.br)
- 🐙 [GitHub](https://github.com/)
- 🚀 [Deploy](https://vercel.com/)

---

## ©️ Informações Legais

© 2025 Automações Comerciais Integradas. Todos os direitos reservados.

Este projeto está em conformidade com a **Lei Geral de Proteção de Dados (LGPD)** e segue as melhores práticas de segurança de dados.

---

**Última atualização:** 2025-11-27  
**Mantido por:** Automações Comerciais Integradas
