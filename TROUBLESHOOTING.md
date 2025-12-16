# 🔧 Troubleshooting - Solução de Problemas

## 🚨 Problemas Comuns e Soluções

### 1. "OpenAI API key invalid"

**Erro:**
```
Error: Invalid OpenAI API key
```

**Causas Possíveis:**
- API key não configurada
- API key incorreta
- Sem créditos na conta OpenAI
- Formato inválido

**Solução:**

#### Passo 1: Obter API Key
1. Acesse: https://platform.openai.com/api-keys
2. Faça login com sua conta OpenAI
3. Clique em **"Create new secret key"**
4. Dê um nome (ex: "ACI Platform")
5. Copie a key (começa com `sk-proj-...`)
   - ⚠️ **IMPORTANTE:** Você só verá ela uma vez!

#### Passo 2: Configurar no Projeto
1. Abra o arquivo `.env` na raiz do projeto
2. Adicione ou atualize:
   ```env
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
3. Salve o arquivo
4. Reinicie o servidor:
   ```bash
   # Parar servidor atual (Ctrl+C)
   npm run dev:all
   ```

#### Passo 3: Verificar Créditos
1. Acesse: https://platform.openai.com/usage
2. Verifique se há créditos disponíveis
3. Se necessário, adicione créditos: https://platform.openai.com/account/billing

**Recursos:**
- Novos usuários ganham **$5 grátis** por 3 meses
- Após isso, é necessário adicionar cartão de crédito

---

### 2. "Cannot find module './costGuard'"

**Erro:**
```
Error: Cannot find module './costGuard'
```

**Solução:**

O arquivo `costGuard.ts` está faltando. Crie-o:

```typescript
// src/backend/costGuard.ts
export function costGuard(action: string, cost: number): boolean {
  // Implementar lógica de validação de custos
  console.log(`Action: ${action}, Cost: R$ ${cost}`);
  return true;
}
```

Ou comente a importação no `server.ts` temporariamente:
```typescript
// import { costGuard } from "./costGuard"; // Comentar esta linha
```

---

### 3. "Port 3000 already in use"

**Erro:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Causa:**
Outra aplicação está usando a porta 3000.

**Solução:**

#### Opção 1: Matar processo na porta
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [número] /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

#### Opção 2: Usar outra porta
1. Abra `vite.config.ts`
2. Altere a porta:
   ```typescript
   export default defineConfig({
     server: {
       port: 3001 // Alterar para outra porta
     }
   })
   ```

---

### 4. "Failed to fetch" ao fazer login

**Erro:**
```
Failed to fetch
TypeError: Failed to fetch
```

**Causas:**
- Backend não está rodando
- URL da API incorreta
- CORS bloqueado

**Solução:**

#### Verificar Backend
```bash
# Verificar se backend está rodando
curl http://localhost:3001/health

# Deve retornar:
{"status":"ok"}
```

#### Verificar URL da API
1. Abra `.env`
2. Confirme:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

#### Verificar CORS
No `server.ts`, confirme:
```typescript
app.use(cors());
```

---

### 5. "Instagram connection failed"

**Erro:**
```
Erro ao conectar Instagram
```

**Causas:**
- Conta não é Business/Professional
- Não conectada ao Facebook
- Permissões insuficientes
- App Meta não configurado

**Solução:**

#### Passo 1: Converter conta para Business
1. Abra Instagram App
2. Vá em **Configurações** → **Conta**
3. Selecione **"Mudar para conta profissional"**
4. Escolha categoria
5. Complete o processo

#### Passo 2: Conectar ao Facebook
1. No Instagram, vá em **Configurações**
2. Selecione **"Conta do Centro de Contas"**
3. Adicione sua Página do Facebook
4. Vincule as contas

#### Passo 3: Configurar App Meta
1. Acesse: https://developers.facebook.com/
2. Crie um app
3. Adicione produto **"Instagram Graph API"**
4. Configure redirect URI
5. Adicione no `.env`:
   ```env
   META_APP_ID=seu-app-id
   META_APP_SECRET=seu-secret
   ```

---

### 6. "WordPress connection refused"

**Erro:**
```
Error: Connection refused
```

**Causas:**
- WordPress não está acessível
- URL incorreta
- Senhas de aplicativo desabilitadas
- HTTPS obrigatório

**Solução:**

#### Verificar URL
```
Correto: https://meublog.com (SEM barra no final)
Errado: https://meublog.com/
```

#### Habilitar Senhas de Aplicativo
1. Acesse seu WordPress
2. Vá em **Usuários** → **Perfil**
3. Role até **"Senhas de aplicativo"**
4. Se não aparece, adicione no `wp-config.php`:
   ```php
   define('APPLICATION_PASSWORD_ALLOWED', true);
   ```

#### Criar Senha de Aplicativo
1. Digite nome: "ACI"
2. Clique em **"Adicionar nova senha de aplicativo"**
3. Copie a senha gerada (formato: `xxxx xxxx xxxx xxxx`)
4. Use esta senha, **não** sua senha normal

---

### 7. "WooCommerce invalid signature"

**Erro:**
```
Error: Invalid signature
```

**Causas:**
- Consumer Key/Secret incorretos
- Permissões insuficientes
- HTTPS obrigatório em produção

**Solução:**

#### Criar Nova API Key
1. WordPress Admin → **WooCommerce** → **Configurações**
2. Aba **"Avançado"** → **"API REST"**
3. Clique em **"Adicionar chave"**
4. Configurações:
   - **Descrição:** ACI Platform
   - **Usuário:** Admin
   - **Permissões:** Leitura/Gravação
5. Clique em **"Gerar chave"**
6. Copie **Consumer Key** e **Consumer Secret**
7. ⚠️ **Salve imediatamente!** Não será mostrado novamente

---

### 8. Aplicação não inicia

**Erro:**
```
npm ERR! Missing script: "dev:all"
```

**Solução:**

#### Verificar package.json
Confirme que existe:
```json
{
  "scripts": {
    "dev": "vite",
    "dev:backend": "tsx watch src/backend/server.ts",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:backend\"",
  }
}
```

#### Instalar dependências
```bash
npm install
```

#### Instalar concurrently
```bash
npm install -D concurrently
```

---

### 9. "Module not found"

**Erro:**
```
Error: Cannot find module 'express'
```

**Solução:**

Instalar dependências faltantes:
```bash
# Dependências principais
npm install express cors jsonwebtoken

# Dependências de desenvolvimento  
npm install -D @types/express @types/cors @types/jsonwebtoken tsx
```

---

### 10. Créditos não aparecem após cadastro

**Problema:**
Criei conta mas não recebi os R$ 3,00 de bônus.

**Solução:**

#### Verificar Server Logs
1. Olhe o console do backend
2. Procure por:
   ```
   ✅ Novo usuário ... recebeu bônus de 3000 créditos!
   ```

#### Verificar arquivo creditLedger.ts
Confirme que existe a função `addCredits`:
```typescript
export function addCredits(userId: string, amount: number) {
  // código aqui
}
```

#### Recriar conta
Se necessário:
1. Faça logout
2. Use outro email
3. Crie nova conta
4. Verifique se bônus foi creditado

---

## 📝 Logs Úteis para Debug

### Backend (Terminal)
```bash
# Ativar logs detalhados
DEBUG=* npm run dev:backend
```

### Frontend (Console do Browser)
```javascript
// Ver chamadas de API
console.log('API URL:', import.meta.env.VITE_API_URL);

// Ver token de autenticação
console.log('Token:', localStorage.getItem('authToken'));
```

---

## 🆘 Ainda com Problemas?

### 1. Verifique versões
```bash
node --version  # Deve ser >= 18
npm --version   # Deve ser >= 9
```

### 2. Limpe cache
```bash
# Limpar node_modules
rm -rf node_modules
npm install

# Limpar cache do npm
npm cache clean --force
```

### 3. Reinicie tudo
```bash
# Parar servidor (Ctrl+C)
# Limpar terminal
# Iniciar novamente
npm run dev:all
```

### 4. Contate Suporte

Se nada funcionar:

- **Email:** contato@automacoescomerciais.com.br
- **WhatsApp:** https://chat.whatsapp.com/BSsknrWToFpJGHz3EnkDUd
- **Telegram:** https://t.me/+9cdym9gvPQ9iOWNh

**Ao reportar, inclua:**
- ✅ Mensagem de erro completa
- ✅ Logs do console
- ✅ O que estava tentando fazer
- ✅ Sistema operacional
- ✅ Versão do Node.js

---

**Última atualização:** 12/12/2024
