-- =====================================================
-- CONNECTIVITY: WEBHOOK LOGGING & TRACEABILITY
-- =====================================================

CREATE TABLE IF NOT EXISTS public.webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) NOT NULL,
    webhook_id UUID REFERENCES public.webhook_endpoints(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status_code INTEGER,
    response_body TEXT,
    duration_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Org members can view webhook logs" ON public.webhook_logs
    FOR SELECT USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

-- Indexing for performance
CREATE INDEX idx_webhook_logs_webhook_id ON public.webhook_logs(webhook_id);
CREATE INDEX idx_webhook_logs_org_id ON public.webhook_logs(org_id);
CREATE INDEX idx_webhook_logs_created_at ON public.webhook_logs(created_at DESC);
