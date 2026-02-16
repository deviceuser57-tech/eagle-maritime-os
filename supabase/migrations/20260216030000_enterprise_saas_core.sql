-- =====================================================
-- ENTERPRISE SaaS CORE: MULTITENANCY & RBAC
-- =====================================================

-- 1. Subscription Plans (Entitlements Layer)
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  feature_flags JSONB NOT NULL DEFAULT '{}',
  limits JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed basic plans
INSERT INTO public.subscription_plans (name, feature_flags, limits)
VALUES 
  ('Starter', '{"cii_reporting": true}', '{"vessels": 5, "users": 3}'),
  ('Professional', '{"cii_reporting": true, "advanced_analytics": true}', '{"vessels": 20, "users": 10}'),
  ('Enterprise', '{"cii_reporting": true, "advanced_analytics": true, "erp_integration": true}', '{"vessels": 1000, "users": 1000}');

-- 2. Organizations (Tenants)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Org Roles
CREATE TABLE public.org_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- 'Super Admin', 'Fleet Manager', 'Auditor'
  permissions JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, name)
);

-- 4. Organization Memberships
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.org_roles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- 5. Add org_id to existing high-level domain tables
-- We'll add nullable org_id first to allow backfill
ALTER TABLE public.vessels ADD COLUMN org_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.cii_records ADD COLUMN org_id UUID REFERENCES public.organizations(id);

-- Enable RLS on new tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Basic Policies (To be refined with specific role checks later)
CREATE POLICY "Users can view organizations they belong to" 
ON public.organizations FOR SELECT 
USING (id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can view membership of their orgs" 
ON public.organization_members FOR SELECT 
USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));
