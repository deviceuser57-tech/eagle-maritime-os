-- Vessels table
CREATE TABLE public.vessels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  imo_number TEXT,
  call_sign TEXT,
  mmsi_number TEXT,
  vessel_type TEXT,
  flag_state TEXT,
  gross_tonnage NUMERIC,
  deadweight NUMERIC,
  year_built INTEGER,
  classification_society TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Maintenance tasks table
CREATE TABLE public.maintenance_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'preventive',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'scheduled',
  due_date DATE NOT NULL,
  completed_date DATE,
  assigned_to TEXT,
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  cost_estimate NUMERIC,
  actual_cost NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audits table
CREATE TABLE public.audits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  audit_type TEXT NOT NULL,
  auditor_name TEXT,
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  findings_count INTEGER DEFAULT 0,
  score NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit findings table
CREATE TABLE public.audit_findings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID REFERENCES public.audits(id) ON DELETE CASCADE,
  finding_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'minor',
  description TEXT NOT NULL,
  corrective_action TEXT,
  target_date DATE,
  closed_date DATE,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crew members table
CREATE TABLE public.crew_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  rank TEXT NOT NULL,
  nationality TEXT,
  certificate_number TEXT,
  certificate_expiry DATE,
  contract_start DATE,
  contract_end DATE,
  status TEXT DEFAULT 'active',
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Incidents table
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  incident_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'minor',
  title TEXT NOT NULL,
  description TEXT,
  incident_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  reported_by TEXT,
  investigation_status TEXT DEFAULT 'pending',
  root_cause TEXT,
  corrective_actions TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reports table for generated reports
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  parameters JSONB DEFAULT '{}',
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  company TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crew_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vessels
CREATE POLICY "Users can view their own vessels" ON public.vessels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own vessels" ON public.vessels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vessels" ON public.vessels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vessels" ON public.vessels FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for maintenance_tasks
CREATE POLICY "Users can view their own maintenance tasks" ON public.maintenance_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own maintenance tasks" ON public.maintenance_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own maintenance tasks" ON public.maintenance_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own maintenance tasks" ON public.maintenance_tasks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for audits
CREATE POLICY "Users can view their own audits" ON public.audits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own audits" ON public.audits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own audits" ON public.audits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own audits" ON public.audits FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for audit_findings (through audit ownership)
CREATE POLICY "Users can view findings from their audits" ON public.audit_findings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.audits WHERE audits.id = audit_findings.audit_id AND audits.user_id = auth.uid())
);
CREATE POLICY "Users can create findings for their audits" ON public.audit_findings FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.audits WHERE audits.id = audit_findings.audit_id AND audits.user_id = auth.uid())
);
CREATE POLICY "Users can update findings from their audits" ON public.audit_findings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.audits WHERE audits.id = audit_findings.audit_id AND audits.user_id = auth.uid())
);
CREATE POLICY "Users can delete findings from their audits" ON public.audit_findings FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.audits WHERE audits.id = audit_findings.audit_id AND audits.user_id = auth.uid())
);

-- RLS Policies for crew_members
CREATE POLICY "Users can view their own crew members" ON public.crew_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own crew members" ON public.crew_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own crew members" ON public.crew_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own crew members" ON public.crew_members FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for incidents
CREATE POLICY "Users can view their own incidents" ON public.incidents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own incidents" ON public.incidents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own incidents" ON public.incidents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own incidents" ON public.incidents FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for reports
CREATE POLICY "Users can view their own reports" ON public.reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own reports" ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reports" ON public.reports FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_vessels_updated_at BEFORE UPDATE ON public.vessels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_maintenance_tasks_updated_at BEFORE UPDATE ON public.maintenance_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON public.audits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_audit_findings_updated_at BEFORE UPDATE ON public.audit_findings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_crew_members_updated_at BEFORE UPDATE ON public.crew_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create handle_new_user function for auto profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  RETURN new;
END;
$$;

-- Trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();