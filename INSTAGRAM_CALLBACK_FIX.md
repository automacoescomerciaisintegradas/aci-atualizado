# 🔧 Como Corrigir a Integração do Instagram

## ❌ Problema Identificado

A URL de callback do Instagram OAuth está apontando para o domínio antigo (**Domínio Antigo**):
```
https://aci.automacoescomerciais.com.br/User/Instagram/Callback
```

Isso causa erro ao tentar conectar o Instagram porque:
1. A estrutura de rotas mudou (não existe mais `/User/Instagram/Callback`)
2. O domínio pode não estar mais configurado
3. O Facebook precisa da URL exata configurada no App

---

## ✅ Solução Passo a Passo

### **1. Atualizar Configuração no Painel Admin**

1. Faça login no seu painel ACI
2. Vá em **Painel Administrativo** (ícone de engrenagem)
3. Clique na aba **Integrações**
4. Role até a seção "**Instagram Graph API**"

#### **Para Desenvolvimento Local:**
- **URI de Redirecionamento**: `http://localhost:5173/instagram-connect`

#### **Para Produção:**
- **URI de Redirecionamento**: `https://SEU-DOMINIO.com/instagram-connect`
  - Exemplo: `https://aci.automacoescomerciais.com.br/instagram-connect`

5. Clique em **Salvar Alterações**

---

### **2. Atualizar Facebook App**

Você precisa atualizar a mesma URL no Facebook Developer Console:

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Vá em **Meus Apps** → Selecione seu App
3. Em **Configurações** → **Básicas**, role até **URLs Válidas de Redirecionamento para OAuth**
4. Adicione as URLs:

**Para Desenvolvimento:**
```
http://localhost:5173/instagram-connect
```

**Para Produção:**
```
https://SEU-DOMINIO.com/instagram-connect
```

5. Clique em **Salvar Alterações**

---

### **3. Limpar Cache (Opcional)**

Se ainda houver problemas, limpe o cache do navegador:

```javascript
// Abra o Console do Navegador (F12) e execute:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

> ⚠️ **Atenção**: Isso vai deslogar você e apagar configurações salvas localmente.

---

## 📋 URLs Corretas de Callback

| Ambiente | URL Correta |
|----------|-------------|
| **Desenvolvimento (localhost)** | `http://localhost:5173/instagram-connect` |
| **Produção** | `https://SEU-DOMINIO.com/instagram-connect` |

---

## 🔍 Como Verificar se Está Funcionando

1. Vá em **Integrações** → **Conectar Instagram**
2. Clique em **Conectar com Facebook/Instagram**
3. Verifique a URL que aparece no navegador:
   ```
   https://www.facebook.com/v19.0/dialog/oauth?
   client_id=SEU_CLIENT_ID&
   redirect_uri=<-- ESTA URL DEVE ESTAR CORRETA
   ```

4. Se a `redirect_uri` estiver correta, o processo funcionará

---

## ❓ Troubleshooting

### **Erro: "URL de redirecionamento inválida"**
**Causa**: A URL no AdminPage não corresponde à configurada no Facebook App

**Solução**: 
1. Certifique-se de que as URLs são EXATAMENTE iguais (incluindo http/https)
2. Verifique se não há espaços ou caracteres extras
3. Use `http://` para localhost (não https)
4. Use `https://` para produção

### **Erro: "deleted_client"**
**Causa**: O App do Facebook foi deletado ou desativado

**Solução**:
1. Verifique se o App ainda existe em [Facebook Developers](https://developers.facebook.com/)
2. Se foi deletado, crie um novo App
3. Atualize o `Client ID` no AdminPage

### **Nenhum perfil encontrado**
**Causa**: A conta Instagram não está configurada como Profissional ou não está vinculada a uma Página do Facebook

**Solução**:
1. No Instagram, vá em **Editar Perfil**
2. Em **Trocar para conta profissional**, selecione **Empresa** ou **Criador**
3. Vincule a uma Página do Facebook

---

## 📝 Exemplo Completo de Configuração

### **No AdminPage (Integrações):**
```
Instagram Client ID: 3728761024095089
Instagram Redirect URI: http://localhost:5173/instagram-connect
```

### **No Facebook App (Configurações > Básicas):**
```
URLs Válidas de Redirecionamento para OAuth:
  - http://localhost:5173/instagram-connect
  - https://aci.automacoescomerciais.com.br/instagram-connect
```

---

## ✅ Checklist de Verificação

- [ ] URI de redirecionamento atualizada no AdminPage
- [ ] URI de redirecionamento atualizada no Facebook App
- [ ] URLs são EXATAMENTE iguais (http vs https)
- [ ] Conta Instagram é Profissional
- [ ] Conta Instagram vinculada a Página do Facebook
- [ ] Cache limpo (se necessário)
- [ ] Testado o fluxo de conexão

---

**Criado por**: Antigravity AI  
**Data**: 2025-11-28  
**Versão**: 1.0.0
