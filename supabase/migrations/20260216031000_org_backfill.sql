-- =====================================================
-- DATA BACKFILL: MIGRATE USERS TO DEFAULT ORGS
-- =====================================================

DO $$
DECLARE
    user_record RECORD;
    new_org_id UUID;
    admin_role_id UUID;
BEGIN
    -- Loop through all unique users who have created vessels
    FOR user_record IN (SELECT DISTINCT user_id FROM public.vessels) LOOP
        
        -- 1. Create a default organization for this user
        INSERT INTO public.organizations (name, slug, plan_id)
        VALUES (
            'Default Fleet (' || SUBSTRING(user_record.user_id::text, 1, 8) || ')',
            'org-' || user_record.user_id::text,
            (SELECT id FROM public.subscription_plans WHERE name = 'Starter')
        )
        RETURNING id INTO new_org_id;

        -- 2. Create the Super Admin role for this organization
        INSERT INTO public.org_roles (org_id, name, permissions)
        VALUES (
            new_org_id,
            'Super Admin',
            '["*"]' -- Full permissions
        )
        RETURNING id INTO admin_role_id;

        -- 3. Add the user as the Super Admin of the new organization
        INSERT INTO public.organization_members (org_id, user_id, role_id)
        VALUES (new_org_id, user_record.user_id, admin_role_id);

        -- 4. Update the user's vessels to point to this organization
        UPDATE public.vessels
        SET org_id = new_org_id
        WHERE user_id = user_record.user_id;

        -- 5. Update the user's cii_records to point to this organization
        UPDATE public.cii_records
        SET org_id = new_org_id
        WHERE user_id = user_record.user_id;

    END LOOP;
END $$;

-- After backfill, we can make org_id NOT NULL for future security
-- ALTER TABLE public.vessels ALTER COLUMN org_id SET NOT NULL;
-- ALTER TABLE public.cii_records ALTER COLUMN org_id SET NOT NULL;
