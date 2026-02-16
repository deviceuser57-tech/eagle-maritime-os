-- =====================================================
-- FULL MULTITENANCY EXPANSION
-- =====================================================

DO $$
DECLARE
    table_name_var TEXT;
    target_tables TEXT[] := ARRAY[
        'audit_findings', 'auditors', 'audits', 'communications', 
        'corrective_actions', 'crew_members', 'custom_regulations', 
        'incidents', 'insurance_claims', 'maintenance_tasks', 
        'projects', 'project_vessels', 'reports', 'setup_audit_types', 
        'setup_certificate_types', 'setup_classification_societies', 
        'setup_companies', 'setup_contract_types', 'setup_crew_ranks', 
        'setup_currencies', 'setup_finding_statuses', 'setup_finding_types', 
        'setup_flag_states', 'setup_nationalities', 'setup_root_causes', 
        'vessel_certifications', 'voyages', 'regulation_vessels', 'cii_records'
    ];
BEGIN
    FOR table_name_var IN SELECT UNNEST(target_tables) LOOP
        -- 1. Add org_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = table_name_var 
            AND column_name = 'org_id'
        ) THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN org_id UUID REFERENCES public.organizations(id)', table_name_var);
        END IF;

        -- 2. Backfill org_id from user_id if column exists
        -- We use a subquery to find the user's primary/first organization
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = table_name_var 
            AND column_name = 'user_id'
        ) THEN
            EXECUTE format('
                UPDATE public.%I t
                SET org_id = (
                    SELECT org_id 
                    FROM public.organization_members 
                    WHERE user_id = t.user_id 
                    LIMIT 1
                )
                WHERE org_id IS NULL', table_name_var);
        END IF;

        -- 3. Enable RLS and create Org-scoped policies
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name_var);
        
        -- Drop any old user-based policies if they exist (common patterns)
        EXECUTE format('DROP POLICY IF EXISTS "Users can view own %I" ON public.%I', table_name_var, table_name_var);
        EXECUTE format('DROP POLICY IF EXISTS "Users can manage own %I" ON public.%I', table_name_var, table_name_var);
        
        -- Create the universal Org-scoped policy
        EXECUTE format('
            DROP POLICY IF EXISTS "Org-scoped access" ON public.%I;
            CREATE POLICY "Org-scoped access" ON public.%I
            FOR ALL TO authenticated
            USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
            WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))', 
            table_name_var, table_name_var);
            
    END LOOP;
END $$;
