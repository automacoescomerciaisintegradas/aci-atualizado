# Implementação de Configurações de Usuário e ID de Afiliado Shopee

## 📋 Objetivo
Implementar uma página de configurações do usuário onde ele pode gerenciar suas integrações e configurar seu ID de Afiliado Shopee, seguindo o modelo da Intelyze.

## 🎯 Funcionalidades Implementadas

### 1. **Página de Configurações do Usuário** (`UserSettingsPage`)

A página de configurações agora inclui:

#### 🔵 **Telegram Bot**
- Campo para Nome do Bot (Username)
- Campo para Token do Bot (com opção de mostrar/ocultar)
- Link direto para @BotFather
- Botão para salvar configurações

#### 🟠 **Shopee Afiliado** (NOVO!)
- Campo para ID de Afiliado Shopee
- Opção de mostrar/ocultar ID
- Instruções passo a passo para obter o ID
- Link direto para o Programa de Afiliados Shopee
- Salvamento no localStorage
- Mensagem de aviso quando ID não está configurado

#### 🟣 **Instagram**
- Botão para conectar via Facebook OAuth
- Instruções para configuração
- Integração com API do Instagram

#### 💳 **Créditos e Pagamentos**
- Informações sobre créditos
- Botão para comprar créditos via PIX

### 2. **Acesso Facilitado às Configurações**

#### Menu do Usuário (Canto Superior Direito)
```
┌─────────────────────────────┐
│ 👤 Francisco                │
│    Usuário                  │
├─────────────────────────────┤
│ 💰 Crédito: R$ 36,99        │
├─────────────────────────────┤
│ 👤 Meu Perfil               │
│ 📄 Extrato                  │
│ 💵 Adicionar Crédito        │
│ 🛒 Pedidos                  │
├─────────────────────────────┤
│ ⚙️ Configurações (NOVO!)    │
├─────────────────────────────┤
│ ❓ FAQ                      │
│ 🚪 Sair                     │
└─────────────────────────────┘
```

### 3. **Validação de ID de Afiliado**

Quando o usuário tentar gerar links sem configurar o ID de Afiliado:

```
⚠️ Seu ID de Afiliado para Shopee não está configurado.
   Por favor, adicione-o nas Configurações para gerar links.
   
   [Ir para Configurações]
```

## 🔧 Arquivos Modificados

### 1. **UserSettingsPage.tsx**
- ✅ Adicionado estado para `shopeeAffiliateId`
- ✅ Adicionado estado para `showShopeeId`
- ✅ Criada função `handleSaveShopee()`
- ✅ Adicionado `useEffect` para carregar ID salvo
- ✅ Criada seção visual para Shopee Afiliado
- ✅ Corrigido erro de TypeScript na resposta da API do Instagram

### 2. **TopNavbar.tsx**
- ✅ Adicionado botão "Configurações" no menu do usuário
- ✅ Navegação para `user-settings`

### 3. **App.tsx**
- ✅ Importado `UserSettingsPage`
- ✅ Atualizada rota `user-settings` para usar `UserSettingsPage`

## 📊 Fluxo de Uso

### Para Configurar ID de Afiliado:
1. **Usuário faz login**
2. **Clica no avatar** (canto superior direito)
3. **Seleciona "Configurações"**
4. **Rola até a seção "Shopee Afiliado"**
5. **Clica no link** para acessar o Programa de Afiliados
6. **Copia seu ID** do painel Shopee
7. **Cola no campo** e clica em "Salvar"
8. **ID é salvo** no localStorage

### Quando Tentar Gerar Links Sem ID:
1. **Sistema verifica** se existe ID salvo
2. **Se não existir**, mostra mensagem de aviso
3. **Usuário clica** em "Ir para Configurações"
4. **É redirecionado** para a página de configurações
5. **Configura o ID** e pode voltar a gerar links

## 💾 Armazenamento

Por enquanto, o ID de Afiliado Shopee é salvo no **localStorage**:

```javascript
localStorage.setItem('shopeeAffiliateId', shopeeAffiliateId);
```

### Próximos Passos:
- [ ] Integrar com API backend para salvar no banco de dados
- [ ] Adicionar validação do formato do ID
- [ ] Sincronizar com outros dispositivos do usuário

## 🎨 Design

A seção de Shopee Afiliado segue o mesmo padrão visual das outras seções:

- **Cor principal**: Laranja (#FF6600 - cor da Shopee)
- **Ícone**: ShoppingBag (sacola de compras)
- **Layout**: Card com glassmorphism
- **Feedback visual**: Mensagens de sucesso/erro

## 🔐 Segurança

- ID é ocultado por padrão (tipo `password`)
- Opção de mostrar/ocultar com botão de olho
- Validação antes de salvar
- Mensagens de feedback claras

## ✅ Benefícios

1. ✨ **Experiência similar à Intelyze**
2. 🎯 **Configuração centralizada**
3. 🚀 **Fácil acesso via menu do usuário**
4. 💡 **Instruções claras e diretas**
5. 🔗 **Links diretos para recursos externos**
6. 📱 **Design responsivo e moderno**

## 🧪 Como Testar

1. **Acesse**: `http://localhost:3002`
2. **Faça login**
3. **Clique no avatar** (canto superior direito)
4. **Selecione "Configurações"**
5. **Role até "Shopee Afiliado"**
6. **Digite um ID de teste** (ex: "123456789")
7. **Clique em "Salvar ID de Afiliado"**
8. **Verifique a mensagem de sucesso**
9. **Recarregue a página** e veja se o ID foi mantido

---

**Data da Implementação**: 2026-01-20
**Versão**: 1.1.0
**Status**: ✅ Implementado e Testado
