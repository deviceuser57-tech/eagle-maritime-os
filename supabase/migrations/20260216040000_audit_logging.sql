-- =====================================================
-- GOVERNANCE: IMMUTABLE AUDIT LOGGING
-- =====================================================

-- 1. Activity Logs Table
CREATE TABLE public.activity_logs (
  id BIGSERIAL PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  target_table TEXT NOT NULL,
  target_id UUID NOT NULL,
  old_data JSONB,
  new_data JSONB,
  prev_hash TEXT, -- For hash-chaining
  curr_hash TEXT, -- For hash-chaining
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Prevent Updates/Deletes (Immutability)
CREATE OR REPLACE FUNCTION public.prevent_audit_log_mutation()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable. Mutations are prohibited.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_immutable_audit_logs
BEFORE UPDATE OR DELETE ON public.activity_logs
FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_mutation();

-- 3. Hash Chaining Logic
CREATE OR REPLACE FUNCTION public.calculate_audit_hash()
RETURNS TRIGGER AS $$
DECLARE
    last_hash TEXT;
BEGIN
    -- Get the hash of the previous record for this org (or 'START' if none)
    SELECT curr_hash INTO last_hash 
    FROM public.activity_logs 
    WHERE org_id = NEW.org_id 
    ORDER BY id DESC LIMIT 1;
    
    IF last_hash IS NULL THEN
        last_hash := 'START';
    END IF;

    NEW.prev_hash := last_hash;
    
    -- Calculate current hash: sha256(prev_hash + user_id + target_id + timestamp + new_data)
    -- Requires pgcrypto
    NEW.curr_hash := encode(digest(
        COALESCE(NEW.prev_hash, '') || 
        COALESCE(NEW.user_id::text, '') || 
        COALESCE(NEW.target_id::text, '') || 
        COALESCE(NEW.action, '') || 
        COALESCE(NEW.new_data::text, ''), 
    'sha256'), 'hex');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_audit_hash_chaining
BEFORE INSERT ON public.activity_logs
FOR EACH ROW EXECUTE FUNCTION public.calculate_audit_hash();

-- 4. Generic Audit Trigger Function
CREATE OR REPLACE FUNCTION public.audit_change_trigger()
RETURNS TRIGGER AS $$
DECLARE
    current_uid UUID;
    current_org_id UUID;
    target_id UUID;
BEGIN
    current_uid := auth.uid();
    
    -- Try to get org_id from the record
    IF (TG_OP = 'DELETE') THEN
        current_org_id := OLD.org_id;
        target_id := OLD.id;
    ELSE
        current_org_id := NEW.org_id;
        target_id := NEW.id;
    END IF;

    INSERT INTO public.activity_logs (
        org_id, 
        user_id, 
        action, 
        target_table, 
        target_id, 
        old_data, 
        new_data
    )
    VALUES (
        current_org_id,
        current_uid,
        TG_OP,
        TG_TABLE_NAME,
        target_id,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::jsonb ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Attach Triggers to High-Sensitivity Tables
CREATE TRIGGER audit_vessels_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.vessels
FOR EACH ROW EXECUTE FUNCTION public.audit_change_trigger();

CREATE TRIGGER audit_cii_records_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.cii_records
FOR EACH ROW EXECUTE FUNCTION public.audit_change_trigger();

-- Enable pgcrypto if not exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org members can view own audit logs"
ON public.activity_logs FOR SELECT
USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));
