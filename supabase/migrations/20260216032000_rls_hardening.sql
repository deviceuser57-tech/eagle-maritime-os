-- =====================================================
-- RLS HARDENING: TENANT ISOLATION
-- =====================================================

-- 1. Drop existing user-scoped policies for vessels
DROP POLICY IF EXISTS "Users can view own vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can insert own vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can update own vessels" ON public.vessels;
DROP POLICY IF EXISTS "Users can delete own vessels" ON public.vessels;

-- 2. Create Org-scoped policies for vessels
CREATE POLICY "Org-scoped view" ON public.vessels
FOR SELECT TO authenticated
USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Org-scoped insert" ON public.vessels
FOR INSERT TO authenticated
WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Org-scoped update" ON public.vessels
FOR UPDATE TO authenticated
USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Org-scoped delete" ON public.vessels
FOR DELETE TO authenticated
USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

-- 3. Repeat for cii_records
DROP POLICY IF EXISTS "Users can manage own cii_records" ON public.cii_records; -- Assuming current policy name

CREATE POLICY "Org-scoped management" ON public.cii_records
FOR ALL TO authenticated
USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));
