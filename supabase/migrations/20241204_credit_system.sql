-- =========================================
-- ACI - Sistema de Créditos Pay-per-Use
-- Migração do Banco de Dados Supabase
-- =========================================

-- ==========================================
-- TABELA: user_credits
-- Saldo de créditos do usuário
-- ==========================================

CREATE TABLE IF NOT EXISTS user_credits (
    -- Identificação
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Saldos
    balance DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    reserved_credits DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    bonus_credits DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    
    -- Histórico
    total_purchased DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    total_used DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    total_bonus DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    
    -- Configurações
    low_balance_threshold DECIMAL(12, 2) DEFAULT 50 NOT NULL,
    auto_recharge_enabled BOOLEAN DEFAULT FALSE,
    auto_recharge_amount DECIMAL(12, 2),
    auto_recharge_threshold DECIMAL(12, 2),
    
    -- Estatísticas do período
    current_month_usage DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    current_month_purchased DECIMAL(12, 2) DEFAULT 0 NOT NULL,
    last_transaction_at TIMESTAMPTZ,
    
    -- Datas
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    UNIQUE(user_id),
    CHECK (balance >= 0),
    CHECK (reserved_credits >= 0),
    CHECK (bonus_credits >= 0)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credits_balance ON user_credits(balance);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_user_credits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_credits_updated_at ON user_credits;
CREATE TRIGGER trigger_user_credits_updated_at
    BEFORE UPDATE ON user_credits
    FOR EACH ROW
    EXECUTE FUNCTION update_user_credits_updated_at();

-- ==========================================
-- TABELA: credit_transactions
-- Histórico de transações
-- ==========================================

CREATE TABLE IF NOT EXISTS credit_transactions (
    -- Identificação
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Tipo e status
    type VARCHAR(20) NOT NULL CHECK (type IN ('debit', 'credit', 'bonus', 'refund', 'adjustment')),
    status VARCHAR(20) DEFAULT 'completed' NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    
    -- Valores
    amount DECIMAL(12, 2) NOT NULL,
    credits_amount DECIMAL(12, 2) NOT NULL,
    balance_after DECIMAL(12, 2) NOT NULL,
    
    -- Serviço relacionado
    service_type VARCHAR(50),
    service_name VARCHAR(100),
    
    -- Detalhes
    description TEXT NOT NULL,
    metadata JSONB,
    
    -- Referências
    external_id VARCHAR(255),
    parent_transaction_id UUID REFERENCES credit_transactions(id),
    
    -- Datas
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Auditoria
    ip_address INET,
    user_agent TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status ON credit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_service_type ON credit_transactions(service_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created ON credit_transactions(user_id, created_at DESC);

-- ==========================================
-- TABELA: credit_packages
-- Pacotes de créditos disponíveis
-- ==========================================

CREATE TABLE IF NOT EXISTS credit_packages (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Valores
    credits DECIMAL(12, 2) NOT NULL,
    bonus_credits DECIMAL(12, 2) DEFAULT 0,
    price DECIMAL(12, 2) NOT NULL,
    original_price DECIMAL(12, 2),
    
    -- Características
    features JSONB DEFAULT '[]'::jsonb,
    highlighted BOOLEAN DEFAULT FALSE,
    badge VARCHAR(50),
    
    -- Validade
    validity_days INTEGER,
    
    -- Limites
    purchase_limit INTEGER,
    
    -- Flags
    is_active BOOLEAN DEFAULT TRUE,
    is_promo BOOLEAN DEFAULT FALSE,
    promo_ends_at TIMESTAMPTZ,
    
    -- Ordenação
    sort_order INTEGER DEFAULT 0,
    
    -- Datas
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ==========================================
-- TABELA: payment_transactions
-- Transações de pagamento
-- ==========================================

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credit_transaction_id UUID REFERENCES credit_transactions(id),
    package_id VARCHAR(50) REFERENCES credit_packages(id),
    
    -- Pagamento
    payment_method VARCHAR(50) NOT NULL,
    payment_gateway VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    
    -- Valores
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    status_message TEXT,
    
    -- PIX
    pix_code TEXT,
    pix_qr_code TEXT,
    pix_expires_at TIMESTAMPTZ,
    
    -- Cartão
    card_last_four VARCHAR(4),
    card_brand VARCHAR(20),
    installments INTEGER DEFAULT 1,
    
    -- Metadados
    metadata JSONB,
    
    -- Datas
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    paid_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    
    -- Auditoria
    ip_address INET,
    user_agent TEXT
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway_id ON payment_transactions(gateway_transaction_id);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Habilitar RLS
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para user_credits
DROP POLICY IF EXISTS "Users can view own credits" ON user_credits;
CREATE POLICY "Users can view own credits" ON user_credits
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own credits" ON user_credits;
CREATE POLICY "Users can update own credits" ON user_credits
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own credits" ON user_credits;
CREATE POLICY "Users can insert own credits" ON user_credits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para credit_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON credit_transactions;
CREATE POLICY "Users can view own transactions" ON credit_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own transactions" ON credit_transactions;
CREATE POLICY "Users can insert own transactions" ON credit_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para payment_transactions
DROP POLICY IF EXISTS "Users can view own payments" ON payment_transactions;
CREATE POLICY "Users can view own payments" ON payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own payments" ON payment_transactions;
CREATE POLICY "Users can insert own payments" ON payment_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own payments" ON payment_transactions;
CREATE POLICY "Users can update own payments" ON payment_transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- credit_packages é público (apenas leitura)
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view active packages" ON credit_packages;
CREATE POLICY "Anyone can view active packages" ON credit_packages
    FOR SELECT USING (is_active = true);

-- ==========================================
-- FUNÇÕES AUXILIARES
-- ==========================================

-- Função para resetar uso mensal (executar via cron job)
CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
    UPDATE user_credits
    SET 
        current_month_usage = 0,
        current_month_purchased = 0,
        updated_at = NOW()
    WHERE EXTRACT(DAY FROM NOW()) = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar créditos expirados
CREATE OR REPLACE FUNCTION check_expired_credits()
RETURNS void AS $$
BEGIN
    -- Aqui você pode implementar lógica para expirar bônus antigos
    -- Por exemplo, expirar bônus após 90 dias
    UPDATE user_credits
    SET 
        bonus_credits = 0,
        updated_at = NOW()
    WHERE bonus_credits > 0
    AND last_transaction_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- DADOS INICIAIS: Pacotes de Créditos
-- ==========================================

INSERT INTO credit_packages (id, name, description, credits, bonus_credits, price, original_price, features, highlighted, badge, sort_order)
VALUES
    ('starter', 'Starter', 'Ideal para começar a testar a plataforma', 10, 0, 10.00, NULL, 
     '["R$ 10 em créditos", "Válido para sempre", "Acesso a todas as ferramentas", "Suporte por email"]'::jsonb, 
     false, NULL, 1),
    ('basic', 'Básico', 'Para uso regular da plataforma', 30, 3, 29.90, 33.00, 
     '["R$ 30 em créditos", "+R$ 3 bônus (10%)", "Válido para sempre", "Suporte prioritário"]'::jsonb, 
     false, NULL, 2),
    ('pro', 'Pro', 'Melhor custo-benefício para profissionais', 100, 20, 89.90, 120.00, 
     '["R$ 100 em créditos", "+R$ 20 bônus (20%)", "Válido para sempre", "Suporte VIP", "Acesso antecipado"]'::jsonb, 
     true, 'Mais Popular', 3),
    ('business', 'Business', 'Para equipes e uso intensivo', 250, 75, 199.90, 325.00, 
     '["R$ 250 em créditos", "+R$ 75 bônus (30%)", "Válido para sempre", "Suporte VIP 24/7", "Consultoria inclusa", "API dedicada"]'::jsonb, 
     false, 'Melhor Valor', 4),
    ('enterprise', 'Enterprise', 'Solução corporativa completa', 500, 200, 349.90, 700.00, 
     '["R$ 500 em créditos", "+R$ 200 bônus (40%)", "Válido para sempre", "Suporte VIP 24/7", "Gerente de conta dedicado", "SLA garantido", "Integrações customizadas"]'::jsonb, 
     false, NULL, 5)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    credits = EXCLUDED.credits,
    bonus_credits = EXCLUDED.bonus_credits,
    price = EXCLUDED.price,
    original_price = EXCLUDED.original_price,
    features = EXCLUDED.features,
    highlighted = EXCLUDED.highlighted,
    badge = EXCLUDED.badge,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- ==========================================
-- COMENTÁRIOS
-- ==========================================

COMMENT ON TABLE user_credits IS 'Saldo de créditos dos usuários do sistema ACI';
COMMENT ON TABLE credit_transactions IS 'Histórico de todas as transações de créditos';
COMMENT ON TABLE credit_packages IS 'Pacotes de créditos disponíveis para compra';
COMMENT ON TABLE payment_transactions IS 'Transações de pagamento (PIX, Cartão, etc)';

COMMENT ON COLUMN user_credits.balance IS 'Saldo principal disponível';
COMMENT ON COLUMN user_credits.reserved_credits IS 'Créditos reservados para operações em andamento';
COMMENT ON COLUMN user_credits.bonus_credits IS 'Créditos promocionais (bônus)';

-- ==========================================
-- GRANT PERMISSIONS (se necessário)
-- ==========================================

-- Permitir que o serviço autenticado acesse as tabelas
GRANT SELECT, INSERT, UPDATE ON user_credits TO authenticated;
GRANT SELECT, INSERT ON credit_transactions TO authenticated;
GRANT SELECT ON credit_packages TO authenticated;
GRANT SELECT, INSERT, UPDATE ON payment_transactions TO authenticated;

-- ==========================================
-- FIM DA MIGRAÇÃO
-- ==========================================
