
-- Custom regulations table for user-added rules
CREATE TABLE public.custom_regulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  version TEXT,
  link TEXT,
  file_url TEXT,
  file_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.custom_regulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own regulations" ON public.custom_regulations
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_custom_regulations_updated_at
  BEFORE UPDATE ON public.custom_regulations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Regulation-vessel junction table
CREATE TABLE public.regulation_vessels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  regulation_id UUID NOT NULL REFERENCES public.custom_regulations(id) ON DELETE CASCADE,
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  compliance_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(regulation_id, vessel_id)
);

ALTER TABLE public.regulation_vessels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own regulation vessels" ON public.regulation_vessels
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.custom_regulations cr
    WHERE cr.id = regulation_vessels.regulation_id AND cr.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.custom_regulations cr
    WHERE cr.id = regulation_vessels.regulation_id AND cr.user_id = auth.uid()
  ));

-- Project-vessel junction table with planned audit date
CREATE TABLE public.project_vessels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
  planned_audit_date DATE,
  audit_type TEXT DEFAULT 'Internal Audit',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, vessel_id)
);

ALTER TABLE public.project_vessels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own project vessels" ON public.project_vessels
  FOR ALL TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_vessels.project_id AND p.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects p
    WHERE p.id = project_vessels.project_id AND p.user_id = auth.uid()
  ));

-- Add more fields to projects table
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS budget NUMERIC,
  ADD COLUMN IF NOT EXISTS actual_cost NUMERIC,
  ADD COLUMN IF NOT EXISTS project_manager TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Storage bucket for regulation files
INSERT INTO storage.buckets (id, name, public) VALUES ('regulations', 'regulations', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload regulation files" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'regulations' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own regulation files" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'regulations' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own regulation files" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'regulations' AND auth.uid()::text = (storage.foldername(name))[1]);
