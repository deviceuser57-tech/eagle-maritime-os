
CREATE OR REPLACE FUNCTION public.fn_encrypt_credential()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
BEGIN
    NEW.encrypted_value := pgp_sym_encrypt(convert_from(NEW.encrypted_value, 'utf8'), NEW.org_id::text);
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW;
END;
$$;
