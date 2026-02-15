-- Harden handle_new_user function with input sanitization
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  safe_display_name text;
BEGIN
  -- Validate and sanitize display_name from user metadata
  safe_display_name := COALESCE(
    NULLIF(TRIM(new.raw_user_meta_data ->> 'display_name'), ''),
    'User'
  );
  
  -- Limit length to prevent abuse
  safe_display_name := LEFT(safe_display_name, 100);
  
  -- Remove potentially dangerous characters
  safe_display_name := regexp_replace(safe_display_name, '[<>"'';\\]', '', 'g');
  
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, safe_display_name);
  
  RETURN new;
END;
$$;