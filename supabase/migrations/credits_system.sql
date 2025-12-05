-- =====================================================
-- SISTEMA DE CRÉDITOS E PAGAMENTOS
-- Schema completo para Supabase
-- =====================================================

-- 1. Tabela de Créditos dos Usuários
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    total_purchased INTEGER NOT NULL DEFAULT 0,
    total_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. Tabela de Transações de Pagamento
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE NOT NULL, -- ID externo (Mercado Pago, etc)
    amount DECIMAL(10, 2) NOT NULL,
    expected_amount DECIMAL(10, 2) NOT NULL,
    credits INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired', 'refunded')),
    payment_method TEXT NOT NULL DEFAULT 'pix',
    pix_qr_code TEXT,
    pix_copy_paste TEXT,
    plan_id TEXT,
    metadata JSONB DEFAULT '{}',
    paid_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Histórico de Uso de Créditos
CREATE TABLE IF NOT EXISTS credit_usage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits_used INTEGER NOT NULL,
    action TEXT NOT NULL, -- 'wordpress_post', 'telegram_message', 'ai_generation', etc.
    action_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Logs de Webhook
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL, -- 'mercadopago', 'asaas', 'pagarme', etc.
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_credit_usage_user_id ON credit_usage_history(user_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);

-- =====================================================
-- FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON user_credits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNÇÃO: Adicionar Créditos (após pagamento confirmado)
-- =====================================================

CREATE OR REPLACE FUNCTION add_credits_to_user(
    p_user_id UUID,
    p_credits INTEGER,
    p_transaction_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Inserir ou atualizar créditos do usuário
    INSERT INTO user_credits (user_id, balance, total_purchased)
    VALUES (p_user_id, p_credits, p_credits)
    ON CONFLICT (user_id) DO UPDATE
    SET 
        balance = user_credits.balance + p_credits,
        total_purchased = user_credits.total_purchased + p_credits,
        updated_at = NOW();

    -- Atualizar status da transação
    UPDATE payment_transactions
    SET 
        status = 'completed',
        paid_at = NOW(),
        updated_at = NOW()
    WHERE id = p_transaction_id;

    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Consumir Créditos
-- =====================================================

CREATE OR REPLACE FUNCTION consume_credits(
    p_user_id UUID,
    p_credits INTEGER,
    p_action TEXT,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_balance INTEGER;
BEGIN
    -- Verificar saldo atual
    SELECT balance INTO v_current_balance
    FROM user_credits
    WHERE user_id = p_user_id;

    -- Se não tem registro, criar com saldo 0
    IF v_current_balance IS NULL THEN
        INSERT INTO user_credits (user_id, balance, total_used)
        VALUES (p_user_id, 0, 0);
        
        RETURN FALSE; -- Saldo insuficiente
    END IF;

    -- Verificar se tem saldo suficiente
    IF v_current_balance < p_credits THEN
        RETURN FALSE;
    END IF;

    -- Deduzir créditos
    UPDATE user_credits
    SET 
        balance = balance - p_credits,
        total_used = total_used + p_credits,
        updated_at = NOW()
    WHERE user_id = p_user_id;

    -- Registrar no histórico
    INSERT INTO credit_usage_history (user_id, credits_used, action, action_metadata)
    VALUES (p_user_id, p_credits, p_action, p_metadata);

    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FUNÇÃO: Verificar Saldo
-- =====================================================

CREATE OR REPLACE FUNCTION check_user_balance(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_balance INTEGER;
BEGIN
    SELECT balance INTO v_balance
    FROM user_credits
    WHERE user_id = p_user_id;

    RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Ativar RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Policies para user_credits
CREATE POLICY "Usuários podem ver seus próprios créditos"
    ON user_credits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Apenas sistema pode atualizar créditos"
    ON user_credits FOR UPDATE
    USING (FALSE); -- Apenas via functions

-- Policies para payment_transactions
CREATE POLICY "Usuários podem ver suas próprias transações"
    ON payment_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode criar transações"
    ON payment_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies para credit_usage_history
CREATE POLICY "Usuários podem ver seu histórico de uso"
    ON credit_usage_history FOR SELECT
    USING (auth.uid() = user_id);

-- Policies para webhook_logs (apenas admin)
CREATE POLICY "Apenas admin pode ver logs de webhook"
    ON webhook_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View de estatísticas de créditos
CREATE OR REPLACE VIEW user_credits_stats AS
SELECT 
    uc.user_id,
    uc.balance,
    uc.total_purchased,
    uc.total_used,
    COUNT(DISTINCT pt.id) FILTER (WHERE pt.status = 'completed') as total_transactions,
    SUM(pt.amount) FILTER (WHERE pt.status = 'completed') as total_spent,
    COUNT(DISTINCT cuh.id) as total_actions
FROM user_credits uc
LEFT JOIN payment_transactions pt ON pt.user_id = uc.user_id
LEFT JOIN credit_usage_history cuh ON cuh.user_id = uc.user_id
GROUP BY uc.user_id, uc.balance, uc.total_purchased, uc.total_used;

-- =====================================================
-- DADOS INICIAIS (OPCIONAL)
-- =====================================================

-- Criar trigger para dar créditos iniciais aos novos usuários
CREATE OR REPLACE FUNCTION give_welcome_credits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_credits (user_id, balance, total_purchased)
    VALUES (NEW.id, 10, 10); -- 10 créditos de boas-vindas
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_user_created_give_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION give_welcome_credits();

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE user_credits IS 'Armazena o saldo de créditos de cada usuário';
COMMENT ON TABLE payment_transactions IS 'Registra todas as transações de pagamento';
COMMENT ON TABLE credit_usage_history IS 'Histórico de uso de créditos por ação';
COMMENT ON TABLE webhook_logs IS 'Logs de webhooks recebidos de provedores de pagamento';

COMMENT ON FUNCTION add_credits_to_user IS 'Adiciona créditos ao usuário após pagamento confirmado';
COMMENT ON FUNCTION consume_credits IS 'Consome créditos do usuário para uma ação específica';
COMMENT ON FUNCTION check_user_balance IS 'Verifica o saldo atual de créditos do usuário';
