-- =============================================
-- NEWSLETTER LEADS SYSTEM (VERSÃO CORRIGIDA)
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
DROP POLICY IF EXISTS "Allow public newsletter signup" ON public.newsletter_leads;
CREATE POLICY "Allow public newsletter signup"
    ON public.newsletter_leads
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Política: Permitir SELECT público (qualquer pessoa pode verificar)
DROP POLICY IF EXISTS "Allow public to read leads" ON public.newsletter_leads;
CREATE POLICY "Allow public to read leads"
    ON public.newsletter_leads
    FOR SELECT
    TO public
    USING (true);

-- Política: Permitir SELECT completo para autenticados
DROP POLICY IF EXISTS "Allow authenticated users to view leads" ON public.newsletter_leads;
CREATE POLICY "Allow authenticated users to view leads"
    ON public.newsletter_leads
    FOR SELECT
    TO authenticated
    USING (true);

-- Política: Permitir UPDATE para autenticados
DROP POLICY IF EXISTS "Allow authenticated to update leads" ON public.newsletter_leads;
CREATE POLICY "Allow authenticated to update leads"
    ON public.newsletter_leads
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Política: Permitir DELETE para autenticados
DROP POLICY IF EXISTS "Allow authenticated to delete leads" ON public.newsletter_leads;
CREATE POLICY "Allow authenticated to delete leads"
    ON public.newsletter_leads
    FOR DELETE
    TO authenticated
    USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_newsletter_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_newsletter_leads_updated_at ON public.newsletter_leads;
CREATE TRIGGER trigger_update_newsletter_leads_updated_at
    BEFORE UPDATE ON public.newsletter_leads
    FOR EACH ROW
    EXECUTE FUNCTION update_newsletter_leads_updated_at();

-- Função para enviar email de boas-vindas
CREATE OR REPLACE FUNCTION send_welcome_email(lead_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    lead_record RECORD;
BEGIN
    SELECT * INTO lead_record
    FROM public.newsletter_leads
    WHERE email = lead_email
    AND welcome_email_sent = false
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

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

-- Log de sucesso (dentro de bloco DO)
DO $$
BEGIN
    RAISE NOTICE 'Newsletter leads table created successfully!';
END $$;
