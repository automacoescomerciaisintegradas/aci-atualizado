-- =====================================================
-- ACI - Sistema de Usuários e Créditos
-- Migração Completa para Supabase
-- =====================================================

-- =====================================================
-- 1. TABELA DE PERFIS DE USUÁRIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informações básicas
    email TEXT,
    full_name TEXT,
    display_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    
    -- Informações de negócio
    company_name TEXT,
    company_document TEXT, -- CNPJ
    personal_document TEXT, -- CPF
    
    -- Endereço
    address_street TEXT,
    address_number TEXT,
    address_complement TEXT,
    address_neighborhood TEXT,
    address_city TEXT,
    address_state TEXT,
    address_zip TEXT,
    address_country TEXT DEFAULT 'BR',
    
    -- Preferências
    preferred_language TEXT DEFAULT 'pt-BR',
    timezone TEXT DEFAULT 'America/Sao_Paulo',
    notification_email BOOLEAN DEFAULT TRUE,
    notification_push BOOLEAN DEFAULT TRUE,
    notification_sms BOOLEAN DEFAULT FALSE,
    
    -- Nível e status
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
    
    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,
    
    -- Integrações conectadas (cache)
    integrations_connected JSONB DEFAULT '[]'::jsonb,
    
    -- Estatísticas (cache)
    total_credits_purchased DECIMAL(12, 2) DEFAULT 0,
    total_credits_used DECIMAL(12, 2) DEFAULT 0,
    total_content_generated INTEGER DEFAULT 0,
    total_publications INTEGER DEFAULT 0,
    
    -- Ref e UTM
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.profiles(id),
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Metadados
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    last_login_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON public.profiles(tier);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);

-- =====================================================
-- 2. TABELA DE CRÉDITOS (ATUALIZADA)
-- =====================================================

-- Remover tabela existente se houver conflito de schema
DROP TABLE IF EXISTS public.user_credits CASCADE;

CREATE TABLE public.user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Saldos
    balance DECIMAL(12, 2) DEFAULT 0 NOT NULL CHECK (balance >= 0),
    reserved_credits DECIMAL(12, 2) DEFAULT 0 NOT NULL CHECK (reserved_credits >= 0),
    bonus_credits DECIMAL(12, 2) DEFAULT 0 NOT NULL CHECK (bonus_credits >= 0),
    
    -- Histórico total
    total_purchased DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    total_used DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    total_bonus DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    
    -- Configurações
    low_balance_threshold DECIMAL(12, 2) DEFAULT 10 NOT NULL,
    auto_recharge_enabled BOOLEAN DEFAULT FALSE,
    auto_recharge_amount DECIMAL(12, 2),
    auto_recharge_threshold DECIMAL(12, 2),
    
    -- Estatísticas do mês atual
    current_month_usage DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    current_month_purchased DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    
    -- Última transação
    last_transaction_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    UNIQUE(user_id)
);

-- Índices para user_credits
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_balance ON public.user_credits(balance);

-- =====================================================
-- 3. TABELA DE TRANSAÇÕES DE CRÉDITOS
-- =====================================================

DROP TABLE IF EXISTS public.credit_transactions CASCADE;

CREATE TABLE public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Tipo e status
    type TEXT NOT NULL CHECK (type IN ('debit', 'credit', 'bonus', 'refund', 'adjustment', 'welcome')),
    status TEXT DEFAULT 'completed' NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    
    -- Valores
    amount DECIMAL(12, 2) NOT NULL,
    credits_amount DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    
    -- Serviço relacionado
    service_type TEXT,
    service_name TEXT,
    
    -- Detalhes
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    
    -- Referências
    external_id TEXT,
    parent_transaction_id UUID REFERENCES public.credit_transactions(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ
);

-- Índices para credit_transactions
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON public.credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status ON public.credit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_service_type ON public.credit_transactions(service_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created ON public.credit_transactions(user_id, created_at DESC);

-- =====================================================
-- 4. TABELA DE SESSÕES DE LOGIN
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informações da sessão
    ip_address INET,
    user_agent TEXT,
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    browser TEXT,
    os TEXT,
    country TEXT,
    city TEXT,
    
    -- Timestamps
    started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ended_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índice para user_sessions
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_started_at ON public.user_sessions(started_at DESC);

-- =====================================================
-- 5. FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_credits_updated_at ON public.user_credits;
CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON public.user_credits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 6. TRIGGER: CRIAR PERFIL E CRÉDITOS AO REGISTRAR
-- =====================================================

-- Função que cria perfil + créditos quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    welcome_credits DECIMAL(12, 2) := 10.00; -- R$ 10 de créditos de boas-vindas
    generated_referral_code TEXT;
BEGIN
    -- Gerar código de referência único
    generated_referral_code := 'ACI' || UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 8));
    
    -- Criar perfil do usuário
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        display_name,
        avatar_url,
        referral_code,
        utm_source,
        utm_medium,
        utm_campaign,
        last_login_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url',
        generated_referral_code,
        NEW.raw_user_meta_data->>'utm_source',
        NEW.raw_user_meta_data->>'utm_medium',
        NEW.raw_user_meta_data->>'utm_campaign',
        NOW()
    );
    
    -- Criar registro de créditos com bônus de boas-vindas
    INSERT INTO public.user_credits (
        user_id,
        balance,
        bonus_credits,
        total_bonus,
        last_transaction_at
    )
    VALUES (
        NEW.id,
        welcome_credits,
        welcome_credits,
        welcome_credits,
        NOW()
    );
    
    -- Registrar transação de boas-vindas
    INSERT INTO public.credit_transactions (
        user_id,
        type,
        status,
        amount,
        credits_amount,
        balance_after,
        description,
        metadata,
        processed_at
    )
    VALUES (
        NEW.id,
        'welcome',
        'completed',
        welcome_credits,
        welcome_credits,
        welcome_credits,
        'Créditos de boas-vindas - Bem-vindo(a) à ACI!',
        jsonb_build_object(
            'source', 'signup',
            'email', NEW.email,
            'provider', NEW.raw_app_meta_data->>'provider'
        ),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log do erro mas não falha o registro do usuário
    RAISE WARNING 'Erro ao criar perfil/créditos para usuário %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 7. TRIGGER: ATUALIZAR PERFIL NO LOGIN
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_user_login()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar último login
    UPDATE public.profiles
    SET 
        last_login_at = NOW(),
        last_activity_at = NOW(),
        -- Atualizar avatar se mudou
        avatar_url = COALESCE(NEW.raw_user_meta_data->>'avatar_url', avatar_url),
        -- Atualizar nome se mudou
        full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', full_name)
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para update (login atualiza last_sign_in_at)
DROP TRIGGER IF EXISTS on_auth_user_logged_in ON auth.users;
CREATE TRIGGER on_auth_user_logged_in
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW
    WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
    EXECUTE FUNCTION public.handle_user_login();

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Ativar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para user_credits
DROP POLICY IF EXISTS "Users can view own credits" ON public.user_credits;
CREATE POLICY "Users can view own credits" ON public.user_credits
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own credits" ON public.user_credits;
CREATE POLICY "Users can update own credits" ON public.user_credits
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own credits" ON public.user_credits;
CREATE POLICY "Users can insert own credits" ON public.user_credits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para credit_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.credit_transactions;
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON public.credit_transactions;
CREATE POLICY "Users can insert own transactions" ON public.credit_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para user_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
CREATE POLICY "Users can view own sessions" ON public.user_sessions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON public.user_sessions;
CREATE POLICY "Users can insert own sessions" ON public.user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 9. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para obter perfil completo com créditos
CREATE OR REPLACE FUNCTION public.get_user_profile(p_user_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'profile', row_to_json(p.*),
        'credits', row_to_json(c.*),
        'recent_transactions', (
            SELECT COALESCE(jsonb_agg(row_to_json(t.*)), '[]'::jsonb)
            FROM (
                SELECT * FROM public.credit_transactions
                WHERE user_id = p_user_id
                ORDER BY created_at DESC
                LIMIT 10
            ) t
        )
    )
    INTO result
    FROM public.profiles p
    LEFT JOIN public.user_credits c ON c.user_id = p.id
    WHERE p.id = p_user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar tier baseado em compras
CREATE OR REPLACE FUNCTION public.update_user_tier()
RETURNS TRIGGER AS $$
DECLARE
    total_spent DECIMAL(12, 2);
    new_tier TEXT;
BEGIN
    total_spent := NEW.total_purchased;
    
    new_tier := CASE
        WHEN total_spent >= 1000 THEN 'diamond'
        WHEN total_spent >= 500 THEN 'platinum'
        WHEN total_spent >= 200 THEN 'gold'
        WHEN total_spent >= 50 THEN 'silver'
        ELSE 'bronze'
    END;
    
    UPDATE public.profiles
    SET 
        tier = new_tier,
        total_credits_purchased = NEW.total_purchased,
        total_credits_used = NEW.total_used
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar tier quando créditos são comprados
DROP TRIGGER IF EXISTS update_user_tier_trigger ON public.user_credits;
CREATE TRIGGER update_user_tier_trigger
    AFTER UPDATE OF total_purchased ON public.user_credits
    FOR EACH ROW
    WHEN (OLD.total_purchased IS DISTINCT FROM NEW.total_purchased)
    EXECUTE FUNCTION public.update_user_tier();

-- =====================================================
-- 10. GRANT PERMISSIONS
-- =====================================================

-- Permitir acesso autenticado
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_credits TO authenticated;
GRANT SELECT, INSERT ON public.credit_transactions TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_sessions TO authenticated;

-- Permitir acesso anônimo para algumas views públicas (se necessário)
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- =====================================================
-- 11. COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE public.profiles IS 'Perfis de usuários da plataforma ACI';
COMMENT ON TABLE public.user_credits IS 'Saldo de créditos e configurações de cada usuário';
COMMENT ON TABLE public.credit_transactions IS 'Histórico de todas as transações de créditos';
COMMENT ON TABLE public.user_sessions IS 'Histórico de sessões de login dos usuários';

COMMENT ON FUNCTION public.handle_new_user IS 'Cria perfil e créditos de boas-vindas quando usuário se registra';
COMMENT ON FUNCTION public.handle_user_login IS 'Atualiza dados do perfil quando usuário faz login';
COMMENT ON FUNCTION public.get_user_profile IS 'Retorna perfil completo com créditos e transações recentes';
COMMENT ON FUNCTION public.update_user_tier IS 'Atualiza tier do usuário baseado em total de compras';

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
