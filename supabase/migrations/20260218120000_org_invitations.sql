
CREATE TABLE IF NOT EXISTS public.organization_invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'member',
    token UUID DEFAULT gen_random_uuid(),
    invited_by UUID REFERENCES auth.users(id),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    UNIQUE(org_id, email)
);

-- RLS
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Org members can view invitations
CREATE POLICY "Org members can view invitations" ON public.organization_invitations
    FOR SELECT
    USING (
        org_id IN (
            SELECT org_id FROM public.organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Org members can create invitations
CREATE POLICY "Org members can create invitations" ON public.organization_invitations
    FOR INSERT
    WITH CHECK (
        org_id IN (
            SELECT org_id FROM public.organization_members
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Org members can delete (revoke) invitations
CREATE POLICY "Org members can revoke invitations" ON public.organization_invitations
    FOR DELETE
    USING (
        org_id IN (
            SELECT org_id FROM public.organization_members
            WHERE user_id = auth.uid()
        )
    );
