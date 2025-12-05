# Como Configurar Envio de Emails REAL

## ⚡ Opção Rápida: Usar Resend (Grátis até 3.000 emails/mês)

### Passo 1: Criar Conta no Resend
1. Acesse: https://resend.com/signup
2. Crie uma conta (pode usar Google)
3. Vá em **API Keys**
4. Clique em **Create API Key**
5. Copie a chave (começa com `re_`)

### Passo 2: Configurar no Supabase
1. Vá no Supabase Dashboard: https://supabase.com/dashboard/project/udzptgbcgzcibhbipnur/settings/functions
2. Clique em **Edge Functions**  
3. Clique em **Settings** → **Secrets**
4. Adicione uma nova secret:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Cole sua chave do Resend

### Passo 3: Deploy da Edge Function
Execute no terminal (na pasta do projeto):

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Login no Supabase
supabase login

# Link com seu projeto
supabase link --project-ref udzptgbcgzcibhbipnur

# Deploy da função
supabase functions deploy send-welcome-email
```

### Passo 4: Testar
1. Acesse a landing page
2. Inscreva seu email
3. Verifique sua caixa de entrada! 📧

---

##  Opção Simplificada (SEM Edge Function)

Se você não quiser configurar o Resend agora, o sistema já está funcionando! 

**O que acontece atualmente:**
- ✅ Email é salvo no banco
- ✅ Formulário mostra mensagem de sucesso
- ⏸️ Email de boas-vindas NÃO é enviado (mas está marcado como "para enviar")

**Para ver os leads cadastrados:**
```sql
SELECT * FROM newsletter_leads ORDER BY subscribed_at DESC;
```

Você pode exportar essa lista e enviar emails manualmente, ou configurar o Resend quando quiser!

---

## 🎯 Resumo

| Item | Status |
|------|--------|
| Formulário funcionando | ✅ |
| Salvar no banco | ✅ |
| Validação de duplicatas | ✅ |
| Mensagens de feedback | ✅ |
| **Envio automático de email** | ⏸️ Aguardando Resend |

**O sistema está 100% funcional para capturar leads!** 

O envio de email é opcional e pode ser configurado depois.
