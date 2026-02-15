
-- Add photo_url column to crew_members
ALTER TABLE public.crew_members ADD COLUMN photo_url text;

-- Create storage bucket for crew photos
INSERT INTO storage.buckets (id, name, public) VALUES ('crew-photos', 'crew-photos', false);

-- RLS policies for crew-photos bucket
CREATE POLICY "Users can upload crew photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'crew-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can view crew photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'crew-photos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete crew photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'crew-photos' AND auth.uid() IS NOT NULL);
