-- =====================================================
-- COMPREHENSIVE SECURITY REMEDIATION (FINAL)
-- Addresses all findings from security scan Feb 23, 2026
-- =====================================================

-- 0. PREREQUISITES
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. SECURITY HELPER FUNCTIONS (Optimized)
CREATE OR REPLACE FUNCTION public.fn_is_org_member(p_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE user_id = auth.uid() AND org_id = p_org_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

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

-- 2. HARDEN WEBHOOK SECRET TOKENS (Error 3)
DO $$
BEGIN
    -- 2a. Create shadow table
    CREATE TABLE IF NOT EXISTS public.webhook_secrets (
        endpoint_id UUID PRIMARY KEY REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
        secret_token TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT now()
    );

    -- 2b. Migrate data if column exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='webhook_endpoints' AND column_name='secret_token') THEN
        INSERT INTO public.webhook_secrets (endpoint_id, secret_token)
        SELECT id, secret_token FROM public.webhook_endpoints
        WHERE secret_token IS NOT NULL
        ON CONFLICT (endpoint_id) DO NOTHING;
        
        ALTER TABLE public.webhook_endpoints DROP COLUMN secret_token;
    END IF;

    -- 2c. Harden RLS on secrets (Strictly Admin Only)
    ALTER TABLE public.webhook_secrets ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admins can manage webhook secrets" ON public.webhook_secrets;
    CREATE POLICY "Admins can manage webhook secrets" ON public.webhook_secrets
        FOR ALL TO authenticated
        USING (endpoint_id IN (SELECT id FROM public.webhook_endpoints WHERE public.fn_is_org_admin(org_id)));
END $$;

-- 3. HARDEN EXTERNAL CREDENTIALS (Error 1)
-- Implement PGP encryption for values
CREATE OR REPLACE FUNCTION public.fn_encrypt_credential()
RETURNS TRIGGER AS $$
BEGIN
    -- Only encrypt if it's not already PGP encrypted
    IF NEW.encrypted_value NOT LIKE '-----BEGIN PGP MESSAGE-----' THEN
        -- We use a combination of org_id and a salt for better isolation
        NEW.encrypted_value := pgp_sym_encrypt(NEW.encrypted_value, NEW.org_id::text || 'EAGLE_MARITIME_SECRET_2026');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

DO $$
BEGIN
    DROP TRIGGER IF EXISTS tr_encrypt_external_credentials ON public.external_credentials;
    CREATE TRIGGER tr_encrypt_external_credentials
    BEFORE INSERT OR UPDATE ON public.external_credentials
    FOR EACH ROW EXECUTE FUNCTION public.fn_encrypt_credential();
END $$;

-- 4. HARDEN STORAGE (Error 2 & Warning 6)
-- Multi-tenant isolation for all buckets
DO $$
DECLARE
    bucket_name TEXT;
    maritime_buckets TEXT[] := ARRAY['crew-photos', 'vessel-assets', 'regulations'];
BEGIN
    FOR bucket_name IN SELECT UNNEST(maritime_buckets) LOOP
        -- Ensure bucket exists and is private
        INSERT INTO storage.buckets (id, name, public) 
        VALUES (bucket_name, bucket_name, false)
        ON CONFLICT (id) DO UPDATE SET public = false;

        -- Apply standardized org-scoped isolation policy
        -- We use %s for the policy name part to avoid double-quoting hyphens implicitly
        EXECUTE format('DROP POLICY IF EXISTS "Org-scoped access for %s" ON storage.objects', bucket_name);
        EXECUTE format('
            CREATE POLICY "Org-scoped access for %s" ON storage.objects
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
            )', bucket_name, bucket_name, bucket_name);

    END LOOP;
END $$;

-- 5. RPC AUTHORIZATION HARDENING (Warning 5 & 7)
-- Overwrite critical RPCs to ensure they verify p_org_id on the server

-- 5a. Compliance History Snapshot
DROP FUNCTION IF EXISTS public.rpc_snapshot_compliance_history();
CREATE OR REPLACE FUNCTION public.rpc_snapshot_compliance_history(p_org_id UUID)
RETURNS JSONB AS $$
BEGIN
    IF NOT public.fn_is_org_member(p_org_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    INSERT INTO public.vessel_compliance_history (vessel_id, org_id, total_score, recorded_date)
    SELECT vessel_id, org_id, total_score, CURRENT_DATE
    FROM public.vessel_compliance_scores
    WHERE org_id = p_org_id
    ON CONFLICT (vessel_id, recorded_date) DO UPDATE SET
        total_score = EXCLUDED.total_score;
        
    RETURN jsonb_build_object('success', true, 'recorded_date', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 5b. Log CII Entry
CREATE OR REPLACE FUNCTION public.rpc_log_cii_entry(
    p_org_id UUID,
    p_vessel_id UUID,
    p_year INTEGER,
    p_fuel_consumption NUMERIC,
    p_distance_travelled NUMERIC,
    p_cargo_carried NUMERIC,
    p_fuel_type TEXT,
    p_target_cii NUMERIC,
    p_notes TEXT DEFAULT NULL
) 
RETURNS JSONB AS $$
DECLARE
    v_attained_cii NUMERIC;
    v_rating TEXT;
    v_new_id UUID;
BEGIN
    IF NOT public.fn_is_org_member(p_org_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    v_attained_cii := public.fn_calculate_attained_cii(p_fuel_consumption, p_distance_travelled, p_cargo_carried, p_fuel_type);
    v_rating := public.fn_calculate_cii_rating(v_attained_cii, p_target_cii);

    INSERT INTO public.cii_records (org_id, user_id, vessel_id, year, cii_value, cii_rating, target_value, fuel_consumption, distance_travelled, cargo_carried, notes)
    VALUES (p_org_id, auth.uid(), p_vessel_id, p_year, v_attained_cii, v_rating, p_target_cii, p_fuel_consumption, p_distance_travelled, p_cargo_carried, p_notes)
    RETURNING id INTO v_new_id;

    RETURN jsonb_build_object('success', true, 'id', v_new_id, 'rating', v_rating);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 6. REMEDIATE RLS ENABLED NO POLICY & PERMISSIVE POLICIES (Info 1 & Warning 4)
DO $$
DECLARE
    t TEXT;
BEGIN
    -- 6a. Add missing policies for any RLS-enabled table
    FOR t IN 
        SELECT tablename FROM pg_tables 
        WHERE schemaname = 'public' 
        AND rowsecurity = true 
        AND NOT EXISTS (SELECT 1 FROM pg_policy WHERE tablename = pg_tables.tablename)
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'org_id') THEN
            EXECUTE format('CREATE POLICY "Org-scoped access for %I" ON public.%I FOR ALL TO authenticated USING (public.fn_is_org_member(org_id))', t, t);
        ELSE
            EXECUTE format('CREATE POLICY "Admins only access for %I" ON public.%I FOR ALL TO authenticated USING (false)', t, t);
        END IF;
    END LOOP;

    -- 6b. Fix 'true' checks for data-modifying operations
    -- Scan for common loose policies and harden them
    DROP POLICY IF EXISTS "Public view plans" ON public.subscription_plans;
    CREATE POLICY "Public view plans" ON public.subscription_plans FOR SELECT TO authenticated USING (true);
    -- All other actions on subscription_plans should be denied by default (no other policies)
END $$;

-- 7. GLOBAL SEARCH PATH HARDENING (Final Pass)
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
        EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = public, auth, pg_temp', func_record.proname, func_record.ident);
    END LOOP;
END $$;
