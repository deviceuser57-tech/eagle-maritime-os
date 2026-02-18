-- Expand vessel_certifications table with additional fields for comprehensive certificate tracking

ALTER TABLE public.vessel_certifications
ADD COLUMN IF NOT EXISTS certificate_number TEXT,
ADD COLUMN IF NOT EXISTS place_of_issue TEXT,
ADD COLUMN IF NOT EXISTS survey_type TEXT,
ADD COLUMN IF NOT EXISTS surveyor_name TEXT,
ADD COLUMN IF NOT EXISTS last_annual_date DATE,
ADD COLUMN IF NOT EXISTS next_annual_date DATE,
ADD COLUMN IF NOT EXISTS last_intermediate_date DATE,
ADD COLUMN IF NOT EXISTS next_intermediate_date DATE,
ADD COLUMN IF NOT EXISTS endorsement_details TEXT,
ADD COLUMN IF NOT EXISTS limitations TEXT,
ADD COLUMN IF NOT EXISTS renewal_reminder_days INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS responsible_person TEXT,
ADD COLUMN IF NOT EXISTS cost NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_vessel_certifications_org_id ON public.vessel_certifications(org_id);
CREATE INDEX IF NOT EXISTS idx_vessel_certifications_expiry ON public.vessel_certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_vessel_certifications_status ON public.vessel_certifications(status);

-- Update RLS policies to use org_id
DROP POLICY IF EXISTS "Users can view their own certifications" ON public.vessel_certifications;
DROP POLICY IF EXISTS "Users can create their own certifications" ON public.vessel_certifications;
DROP POLICY IF EXISTS "Users can update their own certifications" ON public.vessel_certifications;
DROP POLICY IF EXISTS "Users can delete their own certifications" ON public.vessel_certifications;

CREATE POLICY "Users can view org certifications" ON public.vessel_certifications 
  FOR SELECT 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create org certifications" ON public.vessel_certifications 
  FOR INSERT 
  WITH CHECK (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update org certifications" ON public.vessel_certifications 
  FOR UPDATE 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete org certifications" ON public.vessel_certifications 
  FOR DELETE 
  USING (
    org_id IN (
      SELECT org_id 
      FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
  );

-- Add comment
COMMENT ON TABLE public.vessel_certifications IS 'Comprehensive vessel certification registry with survey tracking and compliance monitoring';
