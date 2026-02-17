-- Add missing technical fields to vessels table to support extended registry features
ALTER TABLE public.vessels
ADD COLUMN IF NOT EXISTS previous_yard TEXT,
ADD COLUMN IF NOT EXISTS remaining_tasks TEXT,
ADD COLUMN IF NOT EXISTS vessel_photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS vessel_brochure TEXT,
ADD COLUMN IF NOT EXISTS painting_details TEXT,
ADD COLUMN IF NOT EXISTS navigation_equipment TEXT,
ADD COLUMN IF NOT EXISTS accommodations_pax TEXT;

-- Update RLS if needed (usually not needed if policies are broad, but good to check)
COMMENT ON COLUMN public.vessels.previous_yard IS 'The yard where the vessel last underwent drydocking.';
COMMENT ON COLUMN public.vessels.remaining_tasks IS 'Outstanding items or special conditions from the last drydocking.';
