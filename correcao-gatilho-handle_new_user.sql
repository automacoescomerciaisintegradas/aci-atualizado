-- SOLUÇÃO PARA O PROBLEMA DO GATILHO handle_new_user()
-- Esta versão corrigida trata melhor os valores NULL e adiciona tratamento de erros

-- Primeiro, vamos remover o gatilho e função existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Agora, vamos criar a versão corrigida da função
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    welcome_credits DECIMAL(12, 2) := 10.00; -- R$ 10 de créditos de boas-vindas
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
    -- Registrar início do processo para debugging
    RAISE LOG 'Iniciando handle_new_user para usuário %', NEW.id;
    
    -- Gerar código de referência único (com tratamento de erro)
    BEGIN
        generated_referral_code := 'ACI' || UPPER(SUBSTRING(MD5(NEW.id::TEXT) FROM 1 FOR 8));
    EXCEPTION WHEN OTHERS THEN
        generated_referral_code := 'ACI' || UPPER(SUBSTRING(NEW.id::TEXT FROM 1 FOR 8));
    END;
    
    -- Extrair metadados do usuário com tratamento seguro de valores NULL
    user_full_name := COALESCE(
        CASE 
            WHEN NEW.raw_user_meta_data IS NOT NULL THEN NEW.raw_user_meta_data->>'full_name'
            ELSE NULL
        END,
        CASE 
            WHEN NEW.raw_user_meta_data IS NOT NULL THEN NEW.raw_user_meta_data->>'name'
            ELSE NULL
        END,
        SPLIT_PART(NEW.email, '@', 1),
        'Usuário ACI'
    );
    
    user_display_name := COALESCE(
        CASE 
            WHEN NEW.raw_user_meta_data IS NOT NULL THEN NEW.raw_user_meta_data->>'display_name'
            ELSE NULL
        END,
        CASE 
            WHEN NEW.raw_user_meta_data IS NOT NULL THEN NEW.raw_user_meta_data->>'name'
            ELSE NULL
        END,
        SPLIT_PART(NEW.email, '@', 1),
        'Usuário ACI'
    );
    
    -- Extrair outros campos com segurança
    user_avatar_url := CASE 
        WHEN NEW.raw_user_meta_data IS NOT NULL THEN NEW.raw_user_meta_data->>'avatar_url'
        ELSE NULL
    END;
    
    user_phone := CASE 
        WHEN NEW.raw_user_meta_data IS NOT NULL THEN NEW.raw_user_meta_data->>'phone'
        ELSE NULL
    END;
    
    user_utm_source := CASE 
        WHEN NEW.raw_user_meta_data IS NOT NULL THEN NEW.raw_user_meta_data->>'utm_source'
        ELSE NULL
    END;
    
    user_utm_medium := CASE 
        WHEN NEW.raw_user_meta_data IS NOT NULL THEN NEW.raw_user_meta_data->>'utm_medium'
        ELSE NULL
    END;
    
    user_utm_campaign := CASE 
        WHEN NEW.raw_user_meta_data IS NOT NULL THEN NEW.raw_user_meta_data->>'utm_campaign'
        ELSE NULL
    END;
    
    user_provider := CASE 
        WHEN NEW.raw_app_meta_data IS NOT NULL THEN NEW.raw_app_meta_data->>'provider'
        ELSE 'email'
    END;
    
    -- Registrar os valores extraídos para debugging
    RAISE LOG 'Valores extraídos - Nome: %, Email: %, Provider: %', user_full_name, NEW.email, user_provider;
    
    -- Criar perfil do usuário
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
            NEW.email,
            user_full_name,
            user_display_name,
            user_avatar_url,
            user_phone,
            generated_referral_code,
            user_utm_source,
            user_utm_medium,
            user_utm_campaign,
            'user', -- role padrão
            'active', -- status padrão
            NOW(), -- last_login_at
            NOW(), -- created_at
            NOW()  -- updated_at
        );
        
        RAISE LOG 'Perfil criado com sucesso para usuário %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar perfil para usuário %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        -- Continuar mesmo assim para não falhar o registro do usuário
    END;
    
    -- Criar registro de créditos com bônus de boas-vindas
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
        
        RAISE LOG 'Créditos criados com sucesso para usuário %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar créditos para usuário %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        -- Continuar mesmo assim para não falhar o registro do usuário
    END;
    
    -- Registrar transação de boas-vindas
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
                'email', NEW.email,
                'provider', user_provider,
                'timestamp', NOW()
            ),
            NOW(),
            NOW()
        );
        
        RAISE LOG 'Transação de boas-vindas criada com sucesso para usuário %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Erro ao criar transação de boas-vindas para usuário %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
        -- Continuar mesmo assim para não falhar o registro do usuário
    END;
    
    RAISE LOG 'Finalizando handle_new_user para usuário %', NEW.id;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log do erro mas não falha o registro do usuário
    RAISE WARNING 'Erro crítico no handle_new_user para usuário %: % (SQLSTATE: %)', NEW.id, SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o gatilho
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Adicionar comentários para documentação
COMMENT ON FUNCTION public.handle_new_user IS 'Cria perfil e créditos de boas-vindas quando usuário se registra - Versão corrigida com tratamento de erros';