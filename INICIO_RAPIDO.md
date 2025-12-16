# 🚀 Início Rápido - ACI com Cloudflare D1

## Parar o servidor atual e começar:

### 1️⃣ Autenticar no Cloudflare
```bash
wrangler login
```
Isso abrirá seu navegador para você fazer login.

### 2️⃣ Executar migração no banco remoto
```bash
wrangler d1 execute aci-db --remote --file=./migrations/0001_initial_schema.sql
```

### 3️⃣ Copiar variáveis de ambiente
```bash
# Windows PowerShell
Copy-Item .env.example .env

# E edite o .env se necessário
```

### 4️⃣ Iniciar Worker (Terminal 1)
```bash
wrangler dev
```
✅ Vai rodar em: `http://localhost:8787`

### 5️⃣ Iniciar React (Terminal 2)
```bash
npm run dev
```
✅ Vai rodar em: `http://localhost:5173`

## 🧪 Testar a API

### Healthcheck
```bash
curl http://localhost:8787/api/health
```

### Criar conta
```powershell
Invoke-WebRequest -Uri "http://localhost:8787/api/auth/signup" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"teste@aci.com","password":"123456","metadata":{"full_name":"Usuario Teste","phone":"11987654321"}}'
```

### Fazer login
```powershell
Invoke-WebRequest -Uri "http://localhost:8787/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"teste@aci.com","password":"123456"}'
```

## ✅ Checklist

- [ ] Autenticado no Wrangler
- [ ] Migração executada no banco remoto
- [ ] Arquivo `.env` criado
- [ ] Worker rodando (`wrangler dev`)
- [ ] React rodando (`npm run dev`)
- [ ] API respondendo (teste com healthcheck)
- [ ] Login funcionando no React

## 🆘 Problemas Comuns

### Worker não inicia
```bash
# Verificar se não há outro processo na porta 8787
netstat -ano | findstr :8787

# Matar processo se necessário
taskkill /PID <PID> /F
```

### React não conecta com Worker
Verifique se o `.env` tem:
```
VITE_API_URL=http://localhost:8787
```

### Erro de CORS
O Worker já está configurado com CORS. Se ainda tiver problema, verifique se o `src/utils/http.ts` está correto.

## 📱 Testar no React

1. Abra `http://localhost:5173`
2. Clique em "Login" ou "Começar Agora"
3. Tente criar uma conta
4. Verifique se o login funciona

## 🎉 Próximos Passos

Depois que tudo estiver funcionando:
1. Implementar hash de senhas (bcrypt)
2. Adicionar JWT tokens
3. Implementar reset de senha
4. Adicionar middleware de autenticação
5. Deploy para produção
