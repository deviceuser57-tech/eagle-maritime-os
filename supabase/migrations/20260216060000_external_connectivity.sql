-- =====================================================
-- CONNECTIVITY: ERP & WEBHOOK INFRASTRUCTURE
-- =====================================================

-- 1. ERP Configurations
CREATE TABLE IF NOT EXISTS public.erp_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) NOT NULL,
    name TEXT NOT NULL,
    erp_type TEXT NOT NULL CHECK (erp_type IN ('SAP', 'ORACLE', 'DYNAMICS', 'CUSTOM')),
    base_url TEXT,
    status TEXT DEFAULT 'INACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ERROR')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Secure Credential Storage (Simulated Vault)
-- In production, use Supabase Vault. Here we use an encrypted table.
CREATE TABLE IF NOT EXISTS public.external_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) NOT NULL,
    erp_config_id UUID REFERENCES public.erp_configurations(id) ON DELETE CASCADE,
    credential_key TEXT NOT NULL, -- e.g., 'API_KEY', 'CLIENT_SECRET'
    encrypted_value TEXT NOT NULL,
    iv TEXT, -- Initialization vector for encryption
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Webhook Endpoints
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) NOT NULL,
    url TEXT NOT NULL,
    secret_token TEXT DEFAULT encode(gen_random_bytes(32), 'hex'),
    events TEXT[] DEFAULT '{vessel.created, vessel.updated, cii.rated}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.erp_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
CREATE POLICY "Org members can manage ERP configs" ON public.erp_configurations
    FOR ALL USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Org members can manage external creds" ON public.external_credentials
    FOR ALL USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Org members can manage webhooks" ON public.webhook_endpoints
    FOR ALL USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

-- Performance Indices
CREATE INDEX idx_erp_org ON public.erp_configurations(org_id);
CREATE INDEX idx_webhooks_org ON public.webhook_endpoints(org_id);
