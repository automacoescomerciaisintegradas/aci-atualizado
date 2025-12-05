# ACI - Automações Comerciais Integradas

<div align="center">

![ACI Logo](https://img.shields.io/badge/ACI-Automações_Comerciais-blue?style=for-the-badge&logo=rocket)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge)

**Plataforma SaaS de automação de marketing com IA para e-commerce e afiliados**

[Documentação](#documentação) • [Instalação](#instalação) • [Funcionalidades](#funcionalidades) • [Contribuição](#contribuição)

</div>

---

## 🚀 Sobre o Projeto

O **ACI** é uma plataforma completa de automação comercial que integra:

- 🤖 **IA para geração de conteúdo** (GPT-4, DALL-E, Gemini)
- 📱 **Publicação multi-canal** (Instagram, Telegram, WordPress)
- 💳 **Sistema de créditos com PIX** (Mercado Pago)
- 🛒 **Integração com marketplaces** (Mercado Livre, Shopee, Amazon)
- 📊 **Dashboard analítico completo**

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no [Supabase](https://supabase.com)
- Chaves de API (OpenAI, Gemini, Meta, etc.)

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/aci-automacoes-comerciais.git
cd aci-automacoes-comerciais
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite o arquivo .env com suas credenciais
```

4. **Execute as migrações do Supabase**
```bash
# No Supabase Dashboard, execute os scripts em /supabase/migrations/
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

## 🎯 Funcionalidades

### 📝 Geração de Conteúdo com IA
- Blog posts otimizados para SEO
- Posts para Instagram (feed, stories, reels)
- Descrições de produtos
- E-books e materiais ricos

### 📤 Publicação Multi-Canal
- **WordPress** - Publicação direta de artigos
- **Instagram** - Posts, stories e agendamentos
- **Telegram** - Mensagens e canais
- **Threads** - Integração com Meta

### 💰 Sistema de Créditos
- Pagamento via PIX (Mercado Pago)
- Pacotes de créditos personalizáveis
- Histórico de transações
- Consumo automático por operação

### 🔗 Integrações
- **Mercado Livre** - Busca e análise de produtos
- **Shopee** - Produtos afiliados
- **Amazon** - Catálogo de produtos
- **Meta Business** - Instagram e Facebook

## 📁 Estrutura do Projeto

```
aci/
├── src/
│   ├── components/     # Componentes React
│   ├── pages/          # Páginas da aplicação
│   ├── services/       # Serviços e APIs
│   ├── hooks/          # Custom React hooks
│   └── common/         # Utilitários compartilhados
├── supabase/
│   ├── migrations/     # Scripts SQL
│   └── functions/      # Edge Functions
├── api/                # API handlers
└── docs/               # Documentação
```

## 🔐 Segurança

- Autenticação via Supabase Auth (Google, Email)
- Row Level Security (RLS) em todas as tabelas
- Chaves sensíveis apenas em `.env` (não commitado)
- Tokens criptografados no banco de dados

## 🛠️ Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | Verificação de código |

## 📖 Documentação

- [Guia de Configuração de Créditos](./CREDITS_SYSTEM_SETUP_GUIDE.md)
- [Integração do Instagram](./INSTAGRAM_API_SETUP_CORRECT.md)
- [Migração para Sistema de Créditos](./MIGRATION_TO_CREDITS_SYSTEM.md)
- [Visão Geral do Projeto](./PROJECT_OVERVIEW.md)

## 🤝 Contribuição

1. Faça um Fork do projeto
2. Crie sua Feature Branch (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a Branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato

- **Website**: [automacoescomerciais.com.br](https://automacoescomerciais.com.br)
- **Email**: contato@automacoescomerciais.com.br

---

<div align="center">
  <sub>Desenvolvido com ❤️ por ACI Team</sub>
</div>
