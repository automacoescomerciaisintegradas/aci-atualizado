# Planejamento: Plataforma de Automações Comerciais Integradas (ACI)

## Visão Geral
Este documento descreve o plano de implementação para a plataforma ACI, focada em automação de postagens para afiliados em múltiplos canais (Telegram, Instagram, WordPress) e integração com marketplaces como Shopee. O objetivo é criar um sistema SaaS B2B que permita aos afiliados automatizar suas postagens e escalar suas comissões.

## Tech Stack
- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Node.js (potencialmente)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: OAuth2 (Google, Facebook, Instagram)
- **Infraestrutura**: Docker, Vercel (Frontend), Supabase (Backend)
- **Integrações**: Telegram API, Instagram Graph API, Shopee API, WordPress API

## Estrutura de Pastas
```
.
├── components/                 # Componentes React reutilizáveis
├── hooks/                      # Hooks personalizados
├── services/                   # Serviços de integração com APIs
├── pages/                      # Páginas da aplicação
├── public/                     # Arquivos estáticos
├── styles/                     # Estilos globais
├── utils/                      # Funções utilitárias
├── types/                      # Definições de tipos TypeScript
├── constants/                  # Constantes da aplicação
└── assets/                     # Imagens, ícones, etc.
```

## Funcionalidades Principais
1. **Autenticação e Gerenciamento de Usuários**
   - Login/Cadastro via e-mail, Google, Telefone
   - Perfil de usuário com configurações
   - Sistema de créditos e planos

2. **Integração com Redes Sociais**
   - Conexão com Instagram (via Facebook Graph API)
   - Conexão com Telegram (via Telegram Bot API)
   - Publicação automática em múltiplos canais

3. **Criação de Conteúdo com IA**
   - Gerador de legendas para Instagram
   - Criador de posts para blog
   - Gerador de imagens com IA
   - Chat com IA para assistência

4. **Busca e Publicação de Produtos**
   - Busca de produtos em marketplaces (Shopee)
   - Geração de links de afiliados
   - Envio em lote de produtos
   - Criação de postagens com produtos

5. **Análise e Métricas**
   - Dashboard com métricas de desempenho
   - Relatórios semanais
   - Análise de perfil do Instagram

## Diretrizes de Desenvolvimento
- **Responsividade**: Aplicação totalmente responsiva
- **Acessibilidade**: Seguir padrões WCAG 2.1
- **Performance**: Otimização para carregamento rápido
- **Segurança**: Proteção de dados e autenticação segura
- **Internacionalização**: Suporte a múltiplos idiomas (inicialmente Português do Brasil)
- **LGPD**: Conformidade com a Lei Geral de Proteção de Dados

## Roadmap de Implementação
1. **Fase 1**: Autenticação, Dashboard e Perfil
2. **Fase 2**: Integração com Instagram e Telegram
3. **Fase 3**: Criação de Conteúdo com IA
4. **Fase 4**: Busca e Publicação de Produtos
5. **Fase 5**: Análise e Métricas
6. **Fase 6**: Otimizações e Novas Funcionalidades