-- ==============================================================================
-- Migration: Credential Audit Logging
-- Description: Adds audit logging for credential decrypt/encrypt and any credential-related RPC.
-- ==============================================================================

-- 1. Modify fn_encrypt_credential to log encryption events
CREATE OR REPLACE FUNCTION public.fn_encrypt_credential()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private', 'pg_temp'
AS $$
DECLARE 
    v_key text;
BEGIN
    v_key := private.get_credential_key(NEW.org_id);
    IF v_key IS NULL OR length(v_key) < 32 THEN
        RAISE EXCEPTION 'Encryption master key is not configured';
    END IF;

    -- Only encrypt if not already encrypted
    IF NEW.encrypted_value NOT LIKE '-----BEGIN PGP MESSAGE-----' THEN
        NEW.encrypted_value := public.pgp_sym_encrypt(convert_from(NEW.encrypted_value, 'utf8'), v_key);
        
        -- Insert Audit Log for Encryption
        INSERT INTO public.activity_logs (
            org_id, 
            user_id, 
            action, 
            target_table, 
            target_id, 
            new_data
        ) VALUES (
            NEW.org_id, 
            auth.uid(), 
            'ENCRYPT_CREDENTIAL', 
            'external_credentials', 
            NEW.id, 
            jsonb_build_object('credential_key', NEW.credential_key)
        );
    END IF;

    RETURN NEW;
END;
$$;

-- 2. Create rpc_decrypt_credential to allow decryption and log it
CREATE OR REPLACE FUNCTION public.rpc_decrypt_credential(p_credential_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'private', 'pg_temp'
AS $$
DECLARE
    v_cred RECORD;
    v_key text;
    v_plaintext text;
BEGIN
    -- Fetch the credential
    SELECT * INTO v_cred FROM public.external_credentials WHERE id = p_credential_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Credential not found';
    END IF;

    -- Authorization: must be an admin of the org
    IF NOT public.fn_is_org_admin(v_cred.org_id) THEN
        RAISE EXCEPTION 'Unauthorized: Only Org Admins can decrypt credentials';
    END IF;

    v_key := private.get_credential_key(v_cred.org_id);
    IF v_key IS NULL OR length(v_key) < 32 THEN
        RAISE EXCEPTION 'Encryption master key is not configured';
    END IF;

    -- Decrypt
    v_plaintext := convert_from(public.pgp_sym_decrypt(v_cred.encrypted_value::bytea, v_key), 'utf8');

    -- Insert Audit Log for Decryption
    INSERT INTO public.activity_logs (
        org_id, 
        user_id, 
        action, 
        target_table, 
        target_id, 
        new_data
    ) VALUES (
        v_cred.org_id, 
        auth.uid(), 
        'DECRYPT_CREDENTIAL', 
        'external_credentials', 
        v_cred.id, 
        jsonb_build_object('credential_key', v_cred.credential_key)
    );

    RETURN v_plaintext;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_decrypt_credential(uuid) TO authenticated;

-- 3. Attach Generic Audit Trigger to external_credentials
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_external_credentials_trigger') THEN
        CREATE TRIGGER audit_external_credentials_trigger
        AFTER INSERT OR UPDATE OR DELETE ON public.external_credentials
        FOR EACH ROW EXECUTE FUNCTION public.audit_change_trigger();
    END IF;
END $$;
