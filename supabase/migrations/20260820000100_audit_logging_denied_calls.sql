-- Migration: Add audit logging for denied RPC calls and tighten RLS
-- File: supabase/migrations/20260820000100_audit_logging_denied_calls.sql

-- 1. Create function to log denied RPC calls
CREATE OR REPLACE FUNCTION public.log_denied_rpc(
    p_user_id uuid,
    p_routine text,
    p_reason text
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO activity_logs (user_id, event_type, details, created_at)
    VALUES (p_user_id, 'DENIED_RPC', jsonb_build_object('routine', p_routine, 'reason', p_reason), now());
END;
$$;

-- Grant execute to authenticated role (or specific role used by RPCs)
GRANT EXECUTE ON FUNCTION public.log_denied_rpc(uuid, text, text) TO authenticated;

-- 2. Ensure RLS on activity_logs (if not already enforced)
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_user_read_own_logs" ON public.activity_logs
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "auth_user_insert_logs" ON public.activity_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Ensure RLS on audit_findings (already present but reinforce)
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_findings_org_read" ON public.audit_findings
    FOR SELECT USING (auth.uid() IN (SELECT user_id FROM organization_members WHERE org_id = audits.org_id));

-- 4. Revoke any public access to RPCs that should be protected (example placeholder)
REVOKE EXECUTE ON FUNCTION public.some_sensitive_routine() FROM public;
