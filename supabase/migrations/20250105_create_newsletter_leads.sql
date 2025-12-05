-- =============================================
-- NEWSLETTER LEADS SYSTEM
-- =============================================
-- Tabela para armazenar emails de leads da newsletter
-- Autor: ACI Team
-- Data: 2025-01-05
-- =============================================

-- Criar tabela newsletter_leads
CREATE TABLE IF NOT EXISTS public.newsletter_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    source VARCHAR(100) DEFAULT 'landing_page',
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    welcome_email_sent BOOLEAN DEFAULT false,
    welcome_email_sent_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_newsletter_leads_email ON public.newsletter_leads(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_leads_status ON public.newsletter_leads(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_leads_subscribed_at ON public.newsletter_leads(subscribed_at DESC);

-- Habilitar RLS
ALTER TABLE public.newsletter_leads ENABLE ROW LEVEL SECURITY;

-- Política: Permitir INSERT público (para landing page)
CREATE POLICY "Allow public newsletter signup"
    ON public.newsletter_leads
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Política: Permitir SELECT público apenas do próprio email
CREATE POLICY "Allow public to check own email"
    ON public.newsletter_leads
    FOR SELECT
    TO public
    USING (email = current_setting('request.headers', true)::json->>'email');

-- Política: Permitir SELECT completo para autenticados
CREATE POLICY "Allow authenticated users to view leads"
    ON public.newsletter_leads
    FOR SELECT
    TO authenticated
    USING (true);

-- Política: Permitir UPDATE para admins
CREATE POLICY "Allow admins to update leads"
    ON public.newsletter_leads
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Política: Permitir DELETE para admins
CREATE POLICY "Allow admins to delete leads"
    ON public.newsletter_leads
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_newsletter_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_newsletter_leads_updated_at
    BEFORE UPDATE ON public.newsletter_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_newsletter_leads_updated_at();

-- Função para enviar email de boas-vindas (será implementada via Edge Function)
CREATE OR REPLACE FUNCTION send_welcome_email(lead_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    lead_record RECORD;
BEGIN
    -- Buscar o lead
    SELECT * INTO lead_record
    FROM public.newsletter_leads
    WHERE email = lead_email
    AND welcome_email_sent = false
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    -- Aqui seria a chamada para a Edge Function de envio de email
    -- Por enquanto, apenas marcamos como enviado
    UPDATE public.newsletter_leads
    SET 
        welcome_email_sent = true,
        welcome_email_sent_at = NOW()
    WHERE email = lead_email;

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários
COMMENT ON TABLE public.newsletter_leads IS 'Armazena leads capturados via formulário de newsletter';
COMMENT ON COLUMN public.newsletter_leads.email IS 'Email único do lead';
COMMENT ON COLUMN public.newsletter_leads.status IS 'Status da inscrição: active, unsubscribed, bounced';
COMMENT ON COLUMN public.newsletter_leads.source IS 'Origem do lead (landing_page, popup, etc)';
COMMENT ON COLUMN public.newsletter_leads.welcome_email_sent IS 'Indica se o email de boas-vindas foi enviado';
COMMENT ON COLUMN public.newsletter_leads.metadata IS 'Dados adicionais do lead (UTM params, etc)';

-- Inserir alguns dados de exemplo (opcional - remover em produção)
-- INSERT INTO public.newsletter_leads (email, name, source) VALUES
-- ('exemplo@teste.com', 'Usuário Teste', 'landing_page')
-- ON CONFLICT (email) DO NOTHING;

-- Log de sucesso
DO $$
BEGIN
    RAISE NOTICE 'Newsletter leads table created successfully!';
END $$;
