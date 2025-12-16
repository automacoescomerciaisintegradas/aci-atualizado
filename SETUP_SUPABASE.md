# 🔧 Configuração do Supabase - Banco de Dados

## ❌ Erro Atual
```
Database error saving new user
```

Isso acontece porque a tabela `profiles` não está configurada ou o trigger não existe.

---

## ✅ Solução: Configure o Banco de Dados

### 1. Acesse o Painel do Supabase
1. Vá para: https://app.supabase.com/
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral)

### 2. Execute este SQL

Copie e cole o código abaixo no SQL Editor e clique em **RUN**:

```sql
-- ============================================
-- TABELA DE PERFIS (PROFILES)
-- ============================================

-- Criar a tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  credits INTEGER DEFAULT 100,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS DE SEGURANÇA (RLS POLICIES)
-- ============================================

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Permitir inserção durante signup
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- TRIGGER PARA CRIAR PERFIL AUTOMATICAMENTE
-- ============================================

-- Função que cria o perfil quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    display_name,
    phone,
    role,
    credits,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Usuário ACI'),
    COALESCE(new.raw_user_meta_data->>'name', 'Usuário'),
    COALESCE(new.raw_user_meta_data->>'phone', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    100, -- 100 créditos de boas-vindas
    NOW(),
    NOW()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ATUALIZAR TIMESTAMP AUTOMATICAMENTE
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- VERIFICAR SE TUDO ESTÁ OK
-- ============================================

-- Listar todas as colunas da tabela profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

---

## 3. Verificar se funcionou

Após executar o SQL, você deve ver:

```
✅ Table created
✅ RLS enabled
✅ Policies created
✅ Trigger created
```

---

## 4. Testar o Cadastro

Agora volte para a aplicação e tente criar uma conta novamente:

1. Acesse: http://localhost:3000
2. Clique em "Começar Agora"
3. Preencha:
   - **Nome**: Seu Nome Completo
   - **Email**: seu@email.com
   - **Telefone**: (11) 99999-9999
   - **Senha**: 123456
4. Clique em "Criar Minha Conta"

**Deve funcionar!** ✅

---

## 5. Verificar Dados no Banco

Para ver se o perfil foi criado:

1. No Supabase, vá em **Table Editor**
2. Selecione a tabela `profiles`
3. Você deve ver seu usuário com:
   - ✅ Email
   - ✅ Nome
   - ✅ Telefone
   - ✅ 100 créditos
   - ✅ Role: user
   - ✅ Status: active

---

## 🔧 Troubleshooting

### Problema: "relation 'profiles' already exists"
**Solução**: A tabela já existe. Execute apenas os triggers:

```sql
-- Recriar apenas o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Problema: "permission denied for table profiles"
**Solução**: Execute as políticas de RLS novamente.

### Problema: Continua dando erro de database
**Solução**: 
1. Vá em **Table Editor**
2. Delete a tabela `profiles`
3. Execute o SQL completo novamente

---

## 📞 Precisa de Ajuda?

Se continuar com erro, me mande:
1. A mensagem de erro completa
2. Print do Table Editor mostrando a tabela `profiles`

---

**Desenvolvido por**: Automações Comerciais Integradas ⚙️
**Data**: 05/12/2024
