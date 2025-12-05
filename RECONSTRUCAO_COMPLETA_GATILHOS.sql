-- RECONSTRUÇÃO COMPLETA DO SISTEMA DE GATILHOS
-- Versão robusta com tratamento completo de erros

-- 1. Remover gatilhos e funções existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.handle_user_login();

-- 2. Verificar e garantir extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. Criar função de tratamento de erro melhorada
CREATE OR REPLACE FUNCTION public.safe_extract_metadata(metadata JSONB, key TEXT)
RETURNS TEXT AS $$
BEGIN
    IF metadata IS NULL THEN
        RETURN NULL;
    END IF;
    
    RETURN metadata->>key;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar nova versão da função handle_new_user com tratamento robusto de erros
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    welcome_credits DECIMAL(12, 2) := 10.00;
    generated_referral_code TEXT;
    user_full_name TEXT;
    user_display_name TEXT;
    user_avatar_url TEXT;
    user_phone TEXT;
    user_utm_source TEXT;
    user_utm_medium TEXT;
    user_utm_campaign TEXT;
    user_provider TEXT;
BEGIN
    -- Logging inicial
    RAISE LOG 'handle_new_user iniciado para usuário: %', NEW.id;
    
    -- Gerar código de referência com tratamento de erro
    BEGIN
        generated_referral_code := 'ACI' || UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 8));
    EXCEPTION WHEN OTHERS THEN
        generated_referral_code := 'ACI' || UPPER(SUBSTRING(REPLACE(NEW.id::TEXT, '-', '') FROM 1 FOR 8));
        RAISE WARNING 'Usando método alternativo para referral_code: %', generated_referral_code;
    END;
    
    -- Extrair metadados com segurança
    user_full_name := COALESCE(
        public.safe_extract_metadata(NEW.raw_user_meta_data, 'full_name'),
        public.safe_extract_metadata(NEW.raw_user_meta_data, 'name'),
        SPLIT_PART(COALESCE(NEW.email, 'sem-email@exemplo.com'), '@', 1),
        'Usuário ACI'
    );
    
    user_display_name := COALESCE(
        public.safe_extract_metadata(NEW.raw_user_meta_data, 'display_name'),
        public.safe_extract_metadata(NEW.raw_user_meta_data, 'name'),
        SPLIT_PART(COALESCE(NEW.email, 'sem-email@exemplo.com'), '@', 1),
        user_full_name,
        'Usuário ACI'
    );
    
    user_avatar_url := public.safe_extract_metadata(NEW.raw_user_meta_data, 'avatar_url');
    user_phone := public.safe_extract_metadata(NEW.raw_user_meta_data, 'phone');
    user_utm_source := public.safe_extract_metadata(NEW.raw_user_meta_data, 'utm_source');
    user_utm_medium := public.safe_extract_metadata(NEW.raw_user_meta_data, 'utm_medium');
    user_utm_campaign := public.safe_extract_metadata(NEW.raw_user_meta_data, 'utm_campaign');
    user_provider := COALESCE(
        public.safe_extract_metadata(NEW.raw_app_meta_data, 'provider'),
        'email'
    );
    
    -- Logging dos valores extraídos
    RAISE LOG 'Metadados extraídos - Nome: %, Email: %, Provider: %', user_full_name, NEW.email, user_provider;
    
    -- Criar perfil do usuário com tratamento de erro
    BEGIN
        INSERT INTO public.profiles (
            id,
            email,
            full_name,
            display_name,
            avatar_url,
            phone,
            referral_code,
            utm_source,
            utm_medium,
            utm_campaign,
            role,
            status,
            last_login_at,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            COALESCE(NEW.email, 'sem-email-' || NEW.id::TEXT || '@exemplo.com'),
            user_full_name,
            user_display_name,
            user_avatar_url,
            user_phone,
            generated_referral_code,
            user_utm_source,
            user_utm_medium,
            user_utm_campaign,
            'user',
            'active',
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE LOG 'Perfil criado com sucesso para usuário: %', NEW.id;
    EXCEPTION WHEN unique_violation THEN
        RAISE WARNING 'Perfil já existe para usuário %: %', NEW.id, SQLERRM;
        -- Atualizar perfil existente
        BEGIN
            UPDATE public.profiles 
            SET 
                email = COALESCE(NEW.email, email),
                full_name = user_full_name,
                display_name = user_display_name,
                avatar_url = COALESCE(user_avatar_url, avatar_url),
                phone = COALESCE(user_phone, phone),
                last_login_at = NOW(),
                updated_at = NOW()
            WHERE id = NEW.id;
            
            RAISE LOG 'Perfil atualizado para usuário: %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Falha ao atualizar perfil para usuário %: %', NEW.id, SQLERRM;
        END;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar/atualizar perfil para usuário %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    END;
    
    -- Criar créditos do usuário com tratamento de erro
    BEGIN
        INSERT INTO public.user_credits (
            user_id,
            balance,
            bonus_credits,
            total_bonus,
            last_transaction_at,
            created_at,
            updated_at
        )
        VALUES (
            NEW.id,
            welcome_credits,
            welcome_credits,
            welcome_credits,
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE LOG 'Créditos criados com sucesso para usuário: %', NEW.id;
    EXCEPTION WHEN unique_violation THEN
        RAISE WARNING 'Créditos já existem para usuário %: %', NEW.id, SQLERRM;
        -- Atualizar créditos existentes
        BEGIN
            UPDATE public.user_credits 
            SET 
                balance = balance + welcome_credits,
                bonus_credits = bonus_credits + welcome_credits,
                total_bonus = total_bonus + welcome_credits,
                last_transaction_at = NOW(),
                updated_at = NOW()
            WHERE user_id = NEW.id;
            
            RAISE LOG 'Créditos atualizados para usuário: %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Falha ao atualizar créditos para usuário %: %', NEW.id, SQLERRM;
        END;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar/atualizar créditos para usuário %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    END;
    
    -- Registrar transação de boas-vindas com tratamento de erro
    BEGIN
        INSERT INTO public.credit_transactions (
            user_id,
            type,
            status,
            amount,
            credits_amount,
            balance_after,
            description,
            metadata,
            processed_at,
            created_at
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
                'email', COALESCE(NEW.email, 'email-desconhecido'),
                'provider', user_provider,
                'timestamp', NOW()
            ),
            NOW(),
            NOW()
        );
        
        RAISE LOG 'Transação de boas-vindas criada para usuário: %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar transação de boas-vindas para usuário %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    END;
    
    RAISE LOG 'handle_new_user finalizado para usuário: %', NEW.id;
    RETURN NEW;
    
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro crítico no handle_new_user para usuário %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    -- Mesmo com erro crítico, não falhar o registro do usuário
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar gatilho para novos usuários
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 6. Adicionar comentários para documentação
COMMENT ON FUNCTION public.handle_new_user IS 'Cria perfil e créditos de boas-vindas quando usuário se registra - Versão robusta com tratamento completo de erros';
COMMENT ON FUNCTION public.safe_extract_metadata IS 'Função auxiliar para extrair metadados com tratamento seguro de erros';

-- 7. Conceder permissões necessárias
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;
GRANT EXECUTE ON FUNCTION public.safe_extract_metadata(JSONB, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_extract_metadata(JSONB, TEXT) TO anon;

-- 8. Verificação final
SELECT 'Gatilho reconstruído com sucesso!' as status;