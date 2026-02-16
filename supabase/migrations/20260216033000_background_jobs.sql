-- =====================================================
-- BACKGROUND JOB INFRASTRUCTURE & OUTBOX
-- =====================================================

-- 1. Job Queue Table
CREATE TABLE public.background_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id),
  job_type TEXT NOT NULL, -- 'provisioning', 'compliance_calc', 'webhook_dispatch'
  payload JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  locked_at TIMESTAMPTZ,
  locked_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Transactional Outbox (For event-driven reliability)
CREATE TABLE public.transactional_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Automatic Vessel Change Outbox Trigger
CREATE OR REPLACE FUNCTION public.log_vessel_change_to_outbox()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.transactional_outbox (org_id, event_type, payload)
    VALUES (
        NEW.org_id, 
        'vessel.' || TG_OP, 
        jsonb_build_object(
            'id', NEW.id,
            'name', NEW.name,
            'action', LOWER(TG_OP)
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_vessel_change_outbox
AFTER INSERT OR UPDATE ON public.vessels
FOR EACH ROW EXECUTE FUNCTION public.log_vessel_change_to_outbox();

-- Enable RLS (Internal tables, usually restricted to service roles)
ALTER TABLE public.background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactional_outbox ENABLE ROW LEVEL SECURITY;

-- Only admins/service roles should see these in a real app
CREATE POLICY "Admins can view jobs" ON public.background_jobs
FOR SELECT TO authenticated
USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));
