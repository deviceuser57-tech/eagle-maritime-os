-- =====================================================
-- PERFORMANCE OPTIMIZATION: MULTITENANT INDEXING
-- =====================================================

-- 1. Vessels Indexing
CREATE INDEX idx_vessels_org_created ON public.vessels (org_id, created_at DESC);
CREATE INDEX idx_vessels_user ON public.vessels (user_id);

-- 2. CII Records Indexing
CREATE INDEX idx_cii_org_created ON public.cii_records (org_id, created_at DESC);

-- 3. Membership Indexing (Critical for RLS performance)
CREATE INDEX idx_org_members_user_org ON public.organization_members (user_id, org_id);

-- 4. Audit Log Indexing
CREATE INDEX idx_audit_logs_org_created ON public.background_jobs (org_id, created_at DESC);
