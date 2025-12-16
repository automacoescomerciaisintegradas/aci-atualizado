# 🧪 GUIA DE TESTES - ACI Platform

## ✅ Checklist de Testes

Use este guia para testar todas as funcionalidades da plataforma.

---

## 🔍 TESTE 1: Servidor Funcionando

### Passo 1: Verificar Backend
```bash
# Em um navegador ou terminal
curl http://localhost:3001/health
```

**✅ Resultado Esperado:**
```json
{"status":"ok"}
```

---

### Passo 2: Verificar Frontend

Abra: **http://localhost:3000**

**✅ Resultado Esperado:**
- Landing page carrega corretamente
- Logo "ACI" aparece
- Botão "Começar Agora" visível
- Menu de navegação funciona

---

## 🎯 TESTE 2: Criar Conta e Receber Bônus

### Passo 1: Acessar Cadastro

1. Abra: http://localhost:3000
2. Clique em **"Começar Agora"**

**✅ Resultado Esperado:**
- Página de autenticação abre
- Formulário de cadastro visível

---

### Passo 2: Criar Conta

**Preencha:**
- Email: `teste123@teste.com` (use um email diferente a cada teste)
- Senha: `123456` (ou qualquer senha com 6+ caracteres)
- Nome: (opcional)

**Clique em:** "Criar Conta" ou "Sign Up"

**✅ Resultado Esperado:**
- Redirecionamento para dashboard
- Mensagem de boas-vindas aparece
- **Saldo de créditos mostra 3.000**

---

### Passo 3: Verificar Logs do Backend

No terminal onde está rodando `npm run dev:all`, procure por:

```
✅ Novo usuário teste123@teste.com recebeu bônus de 3000 créditos!
```

**✅ Resultado Esperado:**
- Mensagem aparece no console
- Confirma que bônus foi creditado

---

## 💰 TESTE 3: Verificar Créditos

### Passo 1: Ver Saldo no Sidebar

No dashboard, olhe a sidebar (barra lateral):

**✅ Resultado Esperado:**
- Seção "Créditos" aparece
- Mostra: **3.000** créditos
- Barra de progresso visível

---

### Passo 2: Verificar via API

Abra o DevTools do navegador (F12) e execute:

```javascript
// Pegar token
const token = localStorage.getItem('authToken');

// Consultar saldo
fetch('http://localhost:3001/api/credits/balance', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(console.log);
```

**✅ Resultado Esperado:**
```json
{"balance":3000}
```

---

## 📊 TESTE 4: Menu de Navegação

### Passo 1: Testar Links do Header

No topo da landing page, clique em:
- ☑️ "Sobre"
- ☑️ "Funcionalidades"
- ☑️ "Planos"
- ☑️ "FAQ"

**✅ Resultado Esperado:**
- Cada link faz scroll suave para a seção correta
- Nenhum erro 404

---

### Passo 2: Testar Sidebar (Dashboard)

Após login, teste links do sidebar:
- ☑️ "Admin"
- ☑️ "Minha Conta"
- ☑️ "Super Admin" (se for super admin)

**✅ Resultado Esperado:**
- Cada página carrega corretamente
- URL muda para a rota correspondente

---

## 🎨 TESTE 5: Responsividade

### Desktop (>1024px)
- ☑️ Sidebar completa visível
- ☑️ 3 colunas no grid
- ☑️ Todas as features visíveis

### Tablet (768px - 1024px)
- ☑️ Sidebar funcional
- ☑️ 2 colunas no grid
- ☑️ Cards adaptam tamanho

### Mobile (<768px)
- ☑️ Menu hamburguer (se implementado)
- ☑️ 1 coluna no grid
- ☑️ Botões ocupam largura total

---

## 🔐 TESTE 6: Sistema de Autenticação

### Login
1. Faça logout (se estiver logado)
2. Clique em "Começar Agora"
3. Mude para aba "Login"
4. Entre com credenciais criadas

**✅ Resultado Esperado:**
- Login bem-sucedido
- Redirecionamento para dashboard
- Token salvo no localStorage

---

### Proteção de Rotas

Tente acessar sem estar logado:
```
http://localhost:3000/admin
```

**✅ Resultado Esperado:**
- Redirecionamento para página de login
- OU mensagem de "Faça login"

---

## 🎁 TESTE 7: Cards de Preços

### Landing Page

Role até a seção "Preços"

**Teste Botões:**
- ☑️ "Começar Gratuitamente" → Abre cadastro
- ☑️ "Comprar Créditos" → Abre cadastro/página de preços

**✅ Resultado Esperado:**
- Todos os botões funcionam
- Nenhum está desabilitado
- Hover effect funciona

---

### Página de Preços (Dashboard)

Após login:
1. Vá em "Créditos & Planos" (se disponível)
2. OU acesse: http://localhost:3000 e navegue

**Teste:**
- ☑️ Seleção de valores funciona
- ☑️ Campo personalizado aceita input
- ☑️ Cálculo de bônus está correto
- ☑️ QR Code PIX é gerado

---

## 🌐 TESTE 8: Links Externos

### Footer
- ☑️ Instagram → Abre https://instagram.com/...
- ☑️ Telegram → Abre https://t.me/...
- ☑️ WhatsApp → Abre https://chat.whatsapp.com/...
- ☑️ Email → Abre cliente de email

**✅ Resultado Esperado:**
- Todos abrem em nova aba
- URLs corretas

---

## 🔧 TESTE 9: Configurações

### Para Super Admin

Se você é super admin (emails da lista):
1. Vá em "Super Admin"
2. Verifique seções:
   - ☑️ Telegram Bot
   - ☑️ Instagram
   - ☑️ Configurações Avançadas

**✅ Resultado Esperado:**
- Página carrega corretamente
- Botões e formulários visíveis

---

### Para Usuário Comum

Se não é super admin:
- ☑️ "Super Admin" NÃO aparece no menu
- ☑️ Apenas "Admin" e "Minha Conta" visíveis

---

## 🐛 TESTE 10: Console de Erros

### Frontend

Abra DevTools (F12) → Console

**✅ Resultado Esperado:**
- Nenhum erro em vermelho
- Apenas logs informativos (se houver)
- Warnings aceitáveis (não críticos)

---

### Backend

Olhe o terminal onde está `npm run dev:all`

**✅ Resultado Esperado:**
- Nenhum erro crítico
- Apenas logs de requisições
- Confirmação de bônus ao criar conta

---

## 📝 TESTE 11: Fluxo Completo

### Cenário: Novo Usuário

```
1. Acessar http://localhost:3000
2. Ver landing page
3. Clicar "Começar Agora"  
4. Preencher formulário de cadastro
5. Clicar "Criar Conta"
6. Ver dashboard
7. Confirmar 3.000 créditos no saldo
8. Explorar menu Admin
9. Voltar para Home
10. Fazer logout
```

**⏱️ Tempo Esperado:** 2-3 minutos

**✅ Sucesso se:**
- Todos os passos funcionam
- Nenhum erro aparece
- Créditos aparecem corretamente

---

## 🎯 TESTE 12: Performance

### Tempo de Carregamento

- ☑️ Landing page: < 2 segundos
- ☑️ Dashboard após login: < 1 segundo
- ☑️ Mudança entre páginas: < 500ms

### Fluidez

- ☑️ Scroll suave
- ☑️ Animações sem travamentos
- ☑️ Hover effects responsivos

---

## 📊 Scorecard de Testes

Marque cada teste:

```
[ ] 1. Servidor Funcionando
[ ] 2. Criar Conta e Receber Bônus
[ ] 3. Verificar Créditos
[ ] 4. Menu de Navegação
[ ] 5. Responsividade
[ ] 6. Sistema de Autenticação
[ ] 7. Cards de Preços
[ ] 8. Links Externos
[ ] 9. Configurações
[ ] 10. Console de Erros
[ ] 11. Fluxo Completo
[ ] 12. Performance
```

**Meta:** 12/12 ✅

---

## 🚨 Problemas Encontrados?

### Se algo não funcionar:

1. **Anote o problema:**
   - O que estava fazendo
   - Mensagem de erro (se houver)
   - Screenshot (se possível)

2. **Consulte:**
   - [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para soluções
   - Logs do terminal backend
   - Console do navegador (F12)

3. **Reporte:**
   - Abra uma issue no GitHub
   - Ou envie para contato@automacoescomerciais.com.br

---

**Boa sorte nos testes! 🚀**
