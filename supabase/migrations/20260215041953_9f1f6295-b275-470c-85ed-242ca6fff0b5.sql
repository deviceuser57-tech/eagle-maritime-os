
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Users can upload crew photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view crew photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete crew photos" ON storage.objects;

-- Create user-scoped policies
CREATE POLICY "Users can upload own crew photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'crew-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own crew photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'crew-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own crew photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'crew-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
