-- =====================================================
-- EMERGENCY FIX: ENSURE ORGANIZATION INVITATIONS TABLE
-- Addresses the "Table not found in schema cache" error
-- =====================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organization_invitations') THEN
        CREATE TABLE public.organization_invitations (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            role TEXT DEFAULT 'Member',
            token UUID DEFAULT gen_random_uuid(),
            invited_by UUID REFERENCES auth.users(id),
            status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
            UNIQUE(org_id, email)
        );

        -- Enable RLS
        ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

        -- Policies
        DROP POLICY IF EXISTS "Org members can view invitations" ON public.organization_invitations;
        CREATE POLICY "Org members can view invitations" ON public.organization_invitations
            FOR SELECT TO authenticated
            USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

        DROP POLICY IF EXISTS "Admins can manage invitations" ON public.organization_invitations;
        CREATE POLICY "Admins can manage invitations" ON public.organization_invitations
            FOR ALL TO authenticated
            USING (EXISTS (
                SELECT 1 FROM public.organization_members om
                JOIN public.org_roles r ON om.role_id = r.id
                WHERE om.user_id = auth.uid() 
                AND om.org_id = organization_invitations.org_id 
                AND r.name IN ('Super Admin', 'Admin')
            ));
            
        -- Explicit Grants (Safety first)
        GRANT ALL ON public.organization_invitations TO authenticated;
        GRANT ALL ON public.organization_invitations TO service_role;
    END IF;
END $$;
