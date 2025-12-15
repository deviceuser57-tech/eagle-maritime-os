
-- Vessel Certifications table
CREATE TABLE public.vessel_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  certificate_name TEXT NOT NULL,
  certificate_type TEXT NOT NULL,
  issuing_authority TEXT,
  issue_date DATE,
  expiry_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'valid',
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vessel_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own certifications" ON public.vessel_certifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own certifications" ON public.vessel_certifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own certifications" ON public.vessel_certifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own certifications" ON public.vessel_certifications FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_vessel_certifications_updated_at BEFORE UPDATE ON public.vessel_certifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auditors table
CREATE TABLE public.auditors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  certification_number TEXT,
  status TEXT NOT NULL DEFAULT 'available',
  audits_completed INTEGER DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.auditors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own auditors" ON public.auditors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own auditors" ON public.auditors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own auditors" ON public.auditors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own auditors" ON public.auditors FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_auditors_updated_at BEFORE UPDATE ON public.auditors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Corrective Actions table
CREATE TABLE public.corrective_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  finding_id UUID REFERENCES public.audit_findings(id) ON DELETE CASCADE,
  action_description TEXT NOT NULL,
  responsible_person TEXT,
  due_date DATE,
  completed_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  evidence_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.corrective_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own corrective actions" ON public.corrective_actions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own corrective actions" ON public.corrective_actions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own corrective actions" ON public.corrective_actions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own corrective actions" ON public.corrective_actions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_corrective_actions_updated_at BEFORE UPDATE ON public.corrective_actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Voyages table
CREATE TABLE public.voyages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  voyage_number TEXT,
  origin_port TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  departure_date TIMESTAMP WITH TIME ZONE,
  eta TIMESTAMP WITH TIME ZONE,
  arrival_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'planned',
  cargo_type TEXT,
  cargo_quantity NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.voyages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own voyages" ON public.voyages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own voyages" ON public.voyages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own voyages" ON public.voyages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own voyages" ON public.voyages FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_voyages_updated_at BEFORE UPDATE ON public.voyages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Communications table
CREATE TABLE public.communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_name TEXT,
  recipient_name TEXT,
  priority TEXT DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'unread',
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own communications" ON public.communications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own communications" ON public.communications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own communications" ON public.communications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own communications" ON public.communications FOR DELETE USING (auth.uid() = user_id);

-- Insurance Claims table
CREATE TABLE public.insurance_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE SET NULL,
  claim_number TEXT,
  claim_type TEXT NOT NULL,
  incident_date DATE,
  claim_amount NUMERIC,
  approved_amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'submitted',
  description TEXT,
  insurer_name TEXT,
  policy_number TEXT,
  submitted_date DATE,
  resolved_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.insurance_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own claims" ON public.insurance_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own claims" ON public.insurance_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own claims" ON public.insurance_claims FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own claims" ON public.insurance_claims FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_insurance_claims_updated_at BEFORE UPDATE ON public.insurance_claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  start_date DATE,
  deadline DATE,
  completed_date DATE,
  progress INTEGER DEFAULT 0,
  vessel_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CII Records table
CREATE TABLE public.cii_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  cii_value NUMERIC(5,2) NOT NULL,
  cii_rating TEXT NOT NULL,
  target_value NUMERIC(5,2),
  fuel_consumption NUMERIC,
  distance_travelled NUMERIC,
  cargo_carried NUMERIC,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.cii_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own CII records" ON public.cii_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own CII records" ON public.cii_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own CII records" ON public.cii_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own CII records" ON public.cii_records FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_cii_records_updated_at BEFORE UPDATE ON public.cii_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
