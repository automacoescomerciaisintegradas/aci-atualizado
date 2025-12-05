# 🔧 Correção da Integração Instagram - API Correta

## ❌ Problema Identificado

Você está usando a **Instagram Basic Display API** (antiga), mas precisa da **Instagram Graph API** (via Facebook) para contas Business.

### **URLs que aparecem:**
```
https://www.instagram.com/oauth/authorize/  ❌ ERRADO
client_id=1089163016219900  ❌ Instagram Basic Display
```

### **URLs corretas:**
```
https://www.facebook.com/v19.0/dialog/oauth  ✅ CORRETO
client_id=[SEU_FACEBOOK_APP_ID]  ✅ Facebook App
```

---

## ✅ Solução: Usar Facebook App para Instagram Business

### **Passo 1: Criar Facebook App (não Instagram App)**

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Clique em **Criar App**
3. Escolha tipo: **Empresa** ou **Consumidor**
4. Preencha:
   - **Nome do App**: ACI - Automações Comerciais
   - **Email de contato**: seu@email.com

### **Passo 2: Adicionar Produto Instagram**

1. No Dashboard do App, em **Produtos**
2. Encontre **Instagram Graph API**
3. Clique em **Configurar**

### **Passo 3: Configurar OAuth**

1. Vá em **Configurações** → **Básicas**
2. Copie:
   - **ID do App** (este é o Client ID)
   - **Chave Secreta do App** (guarde com segurança, nunca exponha)

3. Em **Configurações** → **Avançadas** → **URLs Válidas de Redirecionamento para OAuth**
4. Adicione:
   ```
   http://localhost:5173/instagram-connect
   https://SEU-DOMINIO.com/instagram-connect
   ```

### **Passo 4: Configurar no Painel Admin ACI**

1. Vá em **Painel Administrativo** → **Integrações**
2. Seção **Instagram Graph API**:
   ```
   Instagram Client ID: [ID do Facebook App]
   Instagram Redirect URI: http://localhost:5173/instagram-connect
   ```
3. Salve

---

## 🔑 Permissões Corretas

O código já está configurado para solicitar as permissões corretas:

```javascript
const scope = "public_profile,instagram_basic,instagram_manage_comments,pages_show_list,pages_read_engagement,pages_manage_metadata,instagram_manage_messages,instagram_content_publish,instagram_manage_insights";
```

Essas são permissões do **Instagram Graph API** (correto) ✅

---

## 📋 Checklist de Configuração

### **No Facebook Developers:**
- [ ] App criado (tipo Empresa/Consumidor)
- [ ] Produto **Instagram Graph API** adicionado
- [ ] ID do App copiado
- [ ] URLs de redirecionamento configuradas:
  - `http://localhost:5173/instagram-connect`
  - `https://SEU-DOMINIO.com/instagram-connect`

### **No Instagram:**
- [ ] Conta é **Profissional** (Empresa ou Criador)
- [ ] Conta vinculada a uma **Página do Facebook**

### **No Painel ACI:**
- [ ] Client ID = ID do Facebook App
- [ ] Redirect URI = `http://localhost:5173/instagram-connect`
- [ ] Configurações salvas

---

## 🧪 Como Testar

1. Vá em **Integrações** → **Conectar Instagram**
2. Clique em **Conectar com Facebook/Instagram**
3. A URL deve começar com:
   ```
   https://www.facebook.com/v19.0/dialog/oauth?
   client_id=[SEU_FACEBOOK_APP_ID]&
   redirect_uri=http://localhost:5173/instagram-connect
   ```

4. Autorize no Facebook
5. Selecione a Página que possui Instagram vinculado
6. Retornará para a aplicação com a lista de contas

---

## ⚠️ Diferenças Importantes

| Instagram Basic Display API ❌ | Instagram Graph API ✅ |
|--------------------------------|------------------------|
| Acesso limitado a posts        | Acesso completo Business |
| Não permite publicação         | Permite publicação |
| Não permite mensagens/comentários | Permite mensagens/comentários |
| URL: `instagram.com/oauth`     | URL: `facebook.com/v19.0/dialog` |
| Client ID do Instagram         | Client ID do Facebook App |

---

## 🔧 Se Já Criou um App Instagram Basic Display

**Opção 1 - Criar Novo (Recomendado):**
1. Crie um novo Facebook App
2. Adicione Instagram Graph API
3. Use o novo ID no ACI

**Opção 2 - Migrar:**
1. Não é possível migrar diretamente
2. Crie novo App e delete o antigo

---

## 📝 Exemplo Completo

### **Facebook App:**
```
ID do App: 123456789012345
Chave Secreta: abc123def456 (NÃO COMPARTILHE)
URLs OAuth: http://localhost:5173/instagram-connect
```

### **AdminPage (ACI):**
```
Instagram Client ID: 123456789012345
Instagram Redirect URI: http://localhost:5173/instagram-connect
```

### **URL de Autorização Resultante:**
```
https://www.facebook.com/v19.0/dialog/oauth?
  client_id=123456789012345&
  redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Finstagram-connect&
  state=abc123&
  scope=public_profile,instagram_basic,...
```

---

## 🆘 Troubleshooting

### **Erro: "URL de redirecionamento inválida"**
- Verifique se as URLs no Facebook App são EXATAMENTE iguais ao AdminPage
- Use `http://` para localhost (não https)

### **Erro: "App em modo de desenvolvimento"**
- No Facebook App, vá em **Configurações** → **Básicas**
- Em **Status do App**, pode deixar em **Desenvolvimento** para testes
- Para produção, adicione **Política de Privacidade** e **Termos de Serviço** e mude para **Ativo**

### **Nenhum perfil Instagram encontrado**
- A conta Instagram DEVE ser Profissional
- A conta Instagram DEVE estar vinculada a uma Página do Facebook
- Você DEVE ser admin da Página

---

**Criado por**: Antigravity AI  
**Data**: 2025-11-28  
**Versão**: 2.0.0
