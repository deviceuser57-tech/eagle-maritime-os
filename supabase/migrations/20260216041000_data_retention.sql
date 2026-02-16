-- =====================================================
-- GOVERNANCE: DATA RETENTION & PURGING
-- =====================================================

-- 1. Retention Configuration Table
CREATE TABLE public.retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) UNIQUE NOT NULL,
  vessel_data_days INTEGER DEFAULT 3650, -- 10 years default
  audit_log_days INTEGER DEFAULT 2555, -- 7 years default
  cii_record_days INTEGER DEFAULT 3650,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Automated Purging Function
CREATE OR REPLACE FUNCTION public.purge_expired_data()
RETURNS void AS $$
DECLARE
    policy RECORD;
BEGIN
    FOR policy IN (SELECT * FROM public.retention_policies) LOOP
        
        -- Purge Audit Logs
        DELETE FROM public.activity_logs
        WHERE org_id = policy.org_id
        AND created_at < (now() - (policy.audit_log_days || ' days')::interval);

        -- Purge CII Records (if applicable)
        DELETE FROM public.cii_records
        WHERE org_id = policy.org_id
        AND created_at < (now() - (policy.cii_record_days || ' days')::interval);

    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 3. Note: In a production Supabase environment, you would 
-- schedule this using pg_cron:
-- SELECT cron.schedule('0 0 * * *', 'SELECT public.purge_expired_data()');

-- Enable RLS
ALTER TABLE public.retention_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage retention policies"
ON public.retention_policies FOR ALL
USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

-- Insert defaults for all existing orgs
INSERT INTO public.retention_policies (org_id)
SELECT id FROM public.organizations
ON CONFLICT (org_id) DO NOTHING;
