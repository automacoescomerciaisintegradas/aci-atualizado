
# 📝 MÓDULO WORDPRESS - DOCUMENTAÇÃO COMPLETA

## Desenvolvido por Automações Comerciais Integradas ⚙️

---

## 🎯 VISÃO GERAL

Módulo completo de integração WordPress que permite:
- ✅ Gerenciar múltiplos blogs WordPress
- ✅ Validar credenciais e testar conexão
- ✅ Publicar conteúdo gerado pela IA automaticamente
- ✅ Suporte a HTML + CSS inline
- ✅ Definir status (rascunho/publicado)
- ✅ Gerenciar categorias e tags

---

## 🏗️ ARQUITETURA

### Componentes Implementados:

```
src/backend/lib/
├── wordpress.ts              # Biblioteca de integração WordPress REST API
└── crypto.ts                 # Criptografia de senhas

src/backend/routes/
├── blogs.ts                  # Rotas de gerenciamento de blogs
└── content.ts                # Rotas de geração de conteúdo

components/
├── BlogsPage.tsx             # Interface de gerenciamento
└── CreateContentPage.tsx     # Interface de criação + publicação
```

---

## 🔐 SEGURANÇA

### Criptografia de Senhas

As senhas de aplicativo do WordPress são **criptografadas** antes de serem salvas no banco de dados usando AES-256-CBC.

**Arquivo:** `src/backend/lib/crypto.ts`

```typescript
// Criptografar
const encryptedPassword = encrypt(password)

// Descriptografar
const decryptedPassword = decrypt(encryptedPassword)
```

**Variável de Ambiente Necessária:**
```env
ENCRYPTION_KEY="your-32-character-secret-key!!"
```

⚠️ **IMPORTANTE:** A chave deve ter exatamente 32 caracteres!

---

## 📡 WORDPRESS REST API

### Validação de Credenciais

**Função:** `testWordPressConnection()`

```typescript
const result = await testWordPressConnection({
  url: "https://meublog.com.br",
  username: "admin",
  password: "xxxx xxxx xxxx xxxx xxxx xxxx"
})
```

### Publicação de Conteúdo

**Função:** `publishWordPressPost()`

```typescript
const result = await publishWordPressPost(
  credentials,
  {
    title: "Título do Post",
    content: "<div>Conteúdo HTML...</div>",
    status: "draft", // ou "publish"
    categories: [1, 5],
    tags: [2, 8],
  }
)
```

---

## 💻 INTERFACE DO USUÁRIO

### Página: Gerenciamento de Blogs

**Rota:** `/user/blogs` (Acessível via menu ou navegação)

**Funcionalidades:**
- ✅ Lista todos os blogs do usuário
- ✅ Indicador de status (conectado/erro)
- ✅ Botão de testar conexão
- ✅ Adicionar novo blog (modal)
- ✅ Remover blog
- ✅ Informações: URL, usuário, última sincronização

### Página: Criar Conteúdo

**Rota:** `/user/content/create` (Acessível via menu ou navegação)

**Funcionalidades:**
- ✅ Formulário de geração de artigo
- ✅ Configurar: tema, palavras-chave, quantidade, tom, modelo
- ✅ Preview do conteúdo gerado
- ✅ Botão "Publicar no WordPress"
- ✅ Modal de seleção de blog e status
- ✅ Exibição de custo antes de publicar

---

## 🔧 CONFIGURAÇÃO DO WORDPRESS

## 💰 SISTEMA DE CUSTOS

### Custos por Ação

| Ação | Custo |
|------|-------|
| Gerar Artigo (GPT-4 Turbo) | R$ 0,00089/palavra |
| Gerar Artigo (GPT-4) | R$ 0,012/palavra |
| Publicar no WordPress | R$ 0,09 (fixo) |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] Biblioteca de integração WordPress (`src/backend/lib/wordpress.ts`)
- [x] Sistema de criptografia (`src/backend/lib/crypto.ts`)
- [x] APIs de gerenciamento de blogs (`src/backend/routes/blogs.ts`)
- [x] API de geração de conteúdo (`src/backend/routes/content.ts`)
- [x] Interface de gerenciamento de blogs (`components/BlogsPage.tsx`)
- [x] Interface de criação de conteúdo (`components/CreateContentPage.tsx`)
- [x] Integração no App.tsx
- [x] Documentação completa

---

**© 2025 Automações Comerciais Integradas - Todos os direitos reservados**
