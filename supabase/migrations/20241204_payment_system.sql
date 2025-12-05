-- =========================================
-- ACI - Sistema de Pagamento PIX
-- Migration: Tabelas de Créditos e Pagamentos
-- Data: 2024-12-04
-- =========================================

-- ==========================================
-- 1. TABELA: user_credits
-- Saldo de créditos do usuário
-- ==========================================
CREATE TABLE IF NOT EXISTS user_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Saldos
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
    bonus_credits DECIMAL(15, 2) NOT NULL DEFAULT 0,
    reserved_credits DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- Totais históricos
    total_purchased DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_used DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_bonus DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- Estatísticas do mês
    current_month_purchased DECIMAL(15, 2) NOT NULL DEFAULT 0,
    current_month_used DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- Configurações
    low_balance_threshold DECIMAL(15, 2) NOT NULL DEFAULT 50,
    auto_recharge_enabled BOOLEAN NOT NULL DEFAULT false,
    auto_recharge_amount DECIMAL(15, 2),
    auto_recharge_threshold DECIMAL(15, 2),
    
    -- Timestamps
    last_transaction_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id),
    CHECK (balance >= 0),
    CHECK (bonus_credits >= 0),
    CHECK (reserved_credits >= 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_balance ON user_credits(balance);

-- RLS Policies (drop existing first)
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
DROP POLICY IF EXISTS "System can manage credits" ON user_credits;

CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage credits" ON user_credits
    FOR ALL USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- 2. TABELA: payment_transactions
-- Transações de pagamento (PIX, Cartão, etc)
-- ==========================================
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Método de pagamento
    payment_method VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(50) NOT NULL,
    gateway_transaction_id VARCHAR(255),
    
    -- Valores
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'BRL',
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    status_message TEXT,
    
    -- PIX específico
    pix_code TEXT,
    pix_qr_code TEXT,
    pix_expires_at TIMESTAMPTZ,
    
    -- Pacote de créditos
    package_id VARCHAR(100),
    
    -- Metadados
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Timestamps
    paid_at TIMESTAMPTZ,
    refunded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_id ON payment_transactions(gateway_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_payment_method ON payment_transactions(payment_method);

-- RLS Policies (drop existing first)
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Users can create own transactions" ON payment_transactions;
DROP POLICY IF EXISTS "System can update transactions" ON payment_transactions;

CREATE POLICY "Users can view own transactions" ON payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update transactions" ON payment_transactions
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- 3. TABELA: credit_transactions
-- Transações de créditos (uso, recarga, bônus)
-- ==========================================
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Tipo e status
    type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    
    -- Valores
    amount DECIMAL(15, 2) NOT NULL,
    credits_amount DECIMAL(15, 2) NOT NULL,
    balance_after DECIMAL(15, 2) NOT NULL,
    
    -- Detalhes
    description TEXT NOT NULL,
    service_type VARCHAR(100),
    
    -- Referências
    payment_transaction_id UUID REFERENCES payment_transactions(id),
    parent_transaction_id UUID REFERENCES credit_transactions(id),
    external_id VARCHAR(255),
    
    -- Metadados
    metadata JSONB NOT NULL DEFAULT '{}',
    
    -- Timestamps
    processed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status ON credit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_service_type ON credit_transactions(service_type);

-- RLS Policies (drop existing first)
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own credit transactions" ON credit_transactions;
DROP POLICY IF EXISTS "System can manage credit transactions" ON credit_transactions;

CREATE POLICY "Users can view own credit transactions" ON credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage credit transactions" ON credit_transactions
    FOR ALL USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- 4. TABELA: credit_packages
-- Pacotes de créditos disponíveis para compra
-- ==========================================
CREATE TABLE IF NOT EXISTS credit_packages (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Valores
    credits INTEGER NOT NULL,
    bonus_credits INTEGER NOT NULL DEFAULT 0,
    price DECIMAL(15, 2) NOT NULL,
    price_per_credit DECIMAL(15, 4) NOT NULL,
    
    -- Desconto
    discount_percent INTEGER NOT NULL DEFAULT 0,
    original_price DECIMAL(15, 2),
    
    -- Características
    features JSONB NOT NULL DEFAULT '[]',
    highlighted BOOLEAN NOT NULL DEFAULT false,
    badge VARCHAR(100),
    
    -- Limites
    validity_days INTEGER,
    purchase_limit INTEGER,
    
    -- Flags
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_promo BOOLEAN NOT NULL DEFAULT false,
    promo_ends_at TIMESTAMPTZ,
    
    -- Ordenação
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_credit_packages_is_active ON credit_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_credit_packages_sort_order ON credit_packages(sort_order);

-- RLS Policies (drop existing first)
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active packages" ON credit_packages;
DROP POLICY IF EXISTS "Admins can manage packages" ON credit_packages;

CREATE POLICY "Anyone can view active packages" ON credit_packages
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage packages" ON credit_packages
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ==========================================
-- 5. TABELA: webhook_logs
-- Logs de webhooks recebidos
-- ==========================================
CREATE TABLE IF NOT EXISTS webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Provedor e evento
    provider VARCHAR(100) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    
    -- Dados
    payload JSONB NOT NULL DEFAULT '{}',
    headers JSONB DEFAULT '{}',
    
    -- Processamento
    status VARCHAR(50) NOT NULL DEFAULT 'received',
    error_message TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    
    -- IP e segurança
    ip_address VARCHAR(45),
    signature_valid BOOLEAN
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_webhook_logs_provider ON webhook_logs(provider);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_received_at ON webhook_logs(received_at DESC);

-- RLS Policies (drop existing first)
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view webhook logs" ON webhook_logs;
DROP POLICY IF EXISTS "System can insert webhook logs" ON webhook_logs;

CREATE POLICY "Admins can view webhook logs" ON webhook_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can insert webhook logs" ON webhook_logs
    FOR INSERT WITH CHECK (true);

-- ==========================================
-- 6. TRIGGERS: Atualização automática
-- ==========================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop triggers se existirem e recriar
DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
DROP TRIGGER IF EXISTS update_credit_packages_updated_at ON credit_packages;

CREATE TRIGGER update_user_credits_updated_at
    BEFORE UPDATE ON user_credits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at
    BEFORE UPDATE ON payment_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credit_packages_updated_at
    BEFORE UPDATE ON credit_packages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- 7. DADOS INICIAIS: Pacotes de créditos
-- ==========================================

INSERT INTO credit_packages (id, name, description, credits, bonus_credits, price, price_per_credit, discount_percent, features, highlighted, badge, sort_order)
VALUES 
    ('starter', 'Starter', 'Pacote ideal para começar', 100, 0, 29.90, 0.299, 0, '["100 créditos", "Válido para sempre", "Suporte por email", "Todas as ferramentas"]'::jsonb, false, NULL, 1),
    ('pro', 'Pro', 'Melhor custo-benefício', 500, 75, 99.90, 0.174, 42, '["500 créditos", "+75 bônus grátis", "Válido para sempre", "Suporte prioritário", "Todas as ferramentas"]'::jsonb, true, 'Mais Popular', 2),
    ('business', 'Business', 'Para uso profissional', 1000, 200, 179.90, 0.150, 50, '["1000 créditos", "+200 bônus grátis", "Válido para sempre", "Suporte VIP", "Acesso antecipado"]'::jsonb, false, 'Melhor Valor', 3),
    ('enterprise', 'Enterprise', 'Para grandes operações', 2500, 750, 399.90, 0.123, 59, '["2500 créditos", "+750 bônus grátis", "Válido para sempre", "Suporte VIP 24/7", "Consultoria inclusa", "API dedicada"]'::jsonb, false, NULL, 4)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    credits = EXCLUDED.credits,
    bonus_credits = EXCLUDED.bonus_credits,
    price = EXCLUDED.price,
    price_per_credit = EXCLUDED.price_per_credit,
    discount_percent = EXCLUDED.discount_percent,
    features = EXCLUDED.features,
    highlighted = EXCLUDED.highlighted,
    badge = EXCLUDED.badge,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ==========================================
-- 8. FUNÇÃO: Criar saldo de créditos inicial
-- ==========================================

CREATE OR REPLACE FUNCTION create_user_credits_on_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_credits (user_id, balance)
    VALUES (NEW.id, 10)
    ON CONFLICT (user_id) DO NOTHING;
    
    INSERT INTO credit_transactions (
        user_id, 
        type, 
        status, 
        amount, 
        credits_amount, 
        balance_after, 
        description,
        processed_at
    )
    VALUES (
        NEW.id, 
        'bonus', 
        'completed', 
        0, 
        10, 
        10, 
        'Bônus de boas-vindas - Ganhe R$ 10 em créditos!',
        NOW()
    );
    
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Drop e recriar trigger
DROP TRIGGER IF EXISTS create_credits_on_profile_insert ON profiles;

CREATE TRIGGER create_credits_on_profile_insert
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_user_credits_on_signup();

-- ==========================================
-- 9. VIEW: Resumo de créditos do usuário
-- ==========================================

DROP VIEW IF EXISTS v_user_credits_summary;

CREATE VIEW v_user_credits_summary AS
SELECT 
    uc.user_id,
    p.email,
    p.full_name,
    uc.balance,
    uc.bonus_credits,
    uc.balance + uc.bonus_credits as total_available,
    uc.total_purchased,
    uc.total_used,
    uc.total_bonus,
    uc.current_month_purchased,
    uc.current_month_used,
    uc.last_transaction_at
FROM user_credits uc
JOIN profiles p ON p.id = uc.user_id;

-- ==========================================
-- 10. GRANT Permissions
-- ==========================================

GRANT ALL ON user_credits TO service_role;
GRANT ALL ON payment_transactions TO service_role;
GRANT ALL ON credit_transactions TO service_role;
GRANT ALL ON credit_packages TO service_role;
GRANT ALL ON webhook_logs TO service_role;

-- Comentários
COMMENT ON TABLE user_credits IS 'Saldo de créditos de cada usuário';
COMMENT ON TABLE payment_transactions IS 'Transações de pagamento (PIX, cartão, etc)';
COMMENT ON TABLE credit_transactions IS 'Histórico de uso e recarga de créditos';
COMMENT ON TABLE credit_packages IS 'Pacotes de créditos disponíveis para compra';
COMMENT ON TABLE webhook_logs IS 'Logs de webhooks recebidos de gateways de pagamento';

-- ==========================================
-- FIM DA MIGRAÇÃO
-- ==========================================
