-- Migration: 20260821100000_dynamic_setup.sql

CREATE TABLE IF NOT EXISTS public.dynamic_setup_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    table_name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    schema JSONB NOT NULL DEFAULT '[]'::jsonb, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, table_name)
);

CREATE TABLE IF NOT EXISTS public.dynamic_setup_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID REFERENCES public.dynamic_setup_entities(id) ON DELETE CASCADE,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
ALTER TABLE public.dynamic_setup_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dynamic_setup_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org-scoped access" ON public.dynamic_setup_entities
FOR ALL TO authenticated
USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Org-scoped access" ON public.dynamic_setup_records
FOR ALL TO authenticated
USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));
