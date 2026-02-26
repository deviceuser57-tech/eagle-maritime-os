-- =====================================================
-- ULTIMATE SECURITY HARDENING: FINAL COMPLIANCE PASS
-- Addresses all remaining security scan findings
-- =====================================================

-- 1. HARDEN VESSELS RLS (Shift from User-based to Org-based)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own vessels" ON public.vessels;
    DROP POLICY IF EXISTS "Users can create their own vessels" ON public.vessels;
    DROP POLICY IF EXISTS "Users can update their own vessels" ON public.vessels;
    DROP POLICY IF EXISTS "Users can delete their own vessels" ON public.vessels;
    DROP POLICY IF EXISTS "Org-scoped access" ON public.vessels;

    CREATE POLICY "Org-scoped access" ON public.vessels
    FOR ALL TO authenticated
    USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
    WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));
END $$;

-- 2. UNIVERSAL RLS ENFORCER (Ensures EVERY table with org_id is locked down)
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND column_name = 'org_id'
        AND table_name NOT IN ('organizations', 'organization_members', 'org_roles')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Org-scoped access" ON public.%I', t);
        EXECUTE format('
            CREATE POLICY "Org-scoped access" ON public.%I
            FOR ALL TO authenticated
            USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
            WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))', t, t);
    END LOOP;
END $$;

-- 3. HARDEN PROFILES RLS (Private by default)
DO $$
BEGIN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
    
    CREATE POLICY "Profile self-access" ON public.profiles
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
END $$;

-- 4. HARDEN RPC SECURITY (Final Pass on Search Paths & Verification)
-- We ensure ALL interesting RPCs have p_org_id validation if they are SECURITY DEFINER

-- 4.1. Harden fn_is_org_admin
CREATE OR REPLACE FUNCTION public.fn_is_org_admin(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members om
        JOIN public.org_roles r ON om.role_id = r.id
        WHERE om.user_id = auth.uid() 
        AND om.org_id = p_org_id 
        AND r.name IN ('Super Admin', 'Admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 4.2. Re-verify search_path for ALL public functions
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT p.proname, n.nspname, pg_get_function_identity_arguments(p.oid) as ident
        FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public'
    LOOP
        BEGIN
            EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public, auth, pg_temp', func_record.proname, func_record.ident);
        EXCEPTION WHEN OTHERS THEN
            -- Skip if function cannot be altered (e.g. some system-generated ones)
            CONTINUE;
        END;
    END LOOP;
END $$;

-- 5. STORAGE BUCKET ISOLATION (Issue 11 Refinement)
-- Ensure 'crew-photos' and other buckets are strictly org-partitioned
-- This assumes files are stored as <org_id>/<file_name>
DO $$
DECLARE
    bn TEXT;
    policy_name TEXT;
BEGIN
    FOR bn IN SELECT UNNEST(ARRAY['crew-photos', 'vessel-assets', 'regulations']) LOOP
        policy_name := 'Org-isolated storage for ' || bn;
        
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_name);
        EXECUTE format('
            CREATE POLICY %I ON storage.objects
            FOR ALL TO authenticated
            USING (
                bucket_id = %L 
                AND (storage.foldername(name))[1] IN (
                    SELECT org_id::text FROM public.organization_members WHERE user_id = auth.uid()
                )
            )
            WITH CHECK (
                bucket_id = %L 
                AND (storage.foldername(name))[1] IN (
                    SELECT org_id::text FROM public.organization_members WHERE user_id = auth.uid()
                )
            )', policy_name, bn, bn);
    END LOOP;
END $$;

-- 6. REDACT WEBHOOK SECRETS (Final cleanup)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='webhook_endpoints' AND column_name='secret_token') THEN
        ALTER TABLE public.webhook_endpoints DROP COLUMN secret_token;
    END IF;
END $$;

-- 7. AUDIT TABLE LIST (Safety Check)
-- Ensure these tables also have RLS (even if they don't have org_id directly, they should be gated)
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public view" ON public.subscription_plans;
CREATE POLICY "Public view" ON public.subscription_plans FOR SELECT TO authenticated USING (true);
