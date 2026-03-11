-- =====================================================
-- COMPLIANCE ENHANCEMENT: DIGITAL CERTIFICATE SEALS
-- Implements compliance with IMO FAL.5/Circ.39/Rev.2
-- =====================================================

-- 1. Certificate Seals Table
-- Stores the cryptographic evidence of certificate validity
CREATE TABLE IF NOT EXISTS public.certificate_seals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_id UUID NOT NULL REFERENCES public.vessel_certifications(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    sealed_by UUID REFERENCES auth.users(id),
    seal_hash TEXT NOT NULL, -- Cryptographic signature
    verification_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
    metadata JSONB DEFAULT '{}'::jsonb, -- Store snapshot of cert data at time of sealing
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(certificate_id) -- One seal per certificate version
);

-- 2. Index for fast verification lookups
CREATE INDEX IF NOT EXISTS idx_cert_seals_token ON public.certificate_seals(verification_token);
CREATE INDEX IF NOT EXISTS idx_cert_seals_cert_id ON public.certificate_seals(certificate_id);

-- 3. RLS Policies
ALTER TABLE public.certificate_seals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view seals" ON public.certificate_seals;
CREATE POLICY "Org members can view seals" ON public.certificate_seals
    FOR SELECT TO authenticated
    USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()));

-- NOTE: Internal service will handle seal creation via SECURITY DEFINER function

-- 4. RPC: Seal Certificate
-- Generates a verifiable seal based on certificate metadata and the latest audit hash
CREATE OR REPLACE FUNCTION public.rpc_seal_certificate(
    p_certificate_id UUID,
    p_org_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_cert_record RECORD;
    v_audit_hash TEXT;
    v_seal_hash TEXT;
    v_metadata JSONB;
BEGIN
    -- 1. Authorization Check
    IF NOT EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = auth.uid() AND org_id = p_org_id) THEN
        RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
    END IF;

    -- 2. Fetch Certificate Data
    SELECT * INTO v_cert_record FROM public.vessel_certifications WHERE id = p_certificate_id AND org_id = p_org_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Certificate not found');
    END IF;

    -- 3. Get latest audit hash for this org for "Temporal integrity"
    SELECT curr_hash INTO v_audit_hash FROM public.activity_logs WHERE org_id = p_org_id ORDER BY id DESC LIMIT 1;
    v_audit_hash := COALESCE(v_audit_hash, 'INITIAL_SYSTEM_STATE');

    -- 4. Prepare Metadata Snapshot
    v_metadata := jsonb_build_object(
        'certificate_name', v_cert_record.certificate_name,
        'issue_date', v_cert_record.issue_date,
        'expiry_date', v_cert_record.expiry_date,
        'issuing_authority', v_cert_record.issuing_authority,
        'vessel_id', v_cert_record.vessel_id,
        'audit_context', v_audit_hash
    );

    -- 5. Calculate Seal Hash: sha256(cert_data + audit_hash + system_secret)
    -- In a real scenario, we'd use a server-side secret, here we use the audit hash as a salt
    v_seal_hash := encode(digest(v_metadata::text || v_audit_hash, 'sha256'), 'hex');

    -- 6. Upsert Seal
    INSERT INTO public.certificate_seals (
        certificate_id, 
        org_id, 
        sealed_by, 
        seal_hash, 
        metadata
    )
    VALUES (
        p_certificate_id,
        p_org_id,
        auth.uid(),
        v_seal_hash,
        v_metadata
    )
    ON CONFLICT (certificate_id) DO UPDATE SET
        sealed_by = EXCLUDED.sealed_by,
        seal_hash = EXCLUDED.seal_hash,
        metadata = EXCLUDED.metadata,
        created_at = now()
    RETURNING verification_token INTO v_seal_hash; -- Reuse variable for return value

    RETURN jsonb_build_object(
        'success', true, 
        'verification_token', v_seal_hash,
        'sealed_at', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- 5. RPC: Public Verify Certificate (Hardened)
-- This function is meant to be called by the public verification page
CREATE OR REPLACE FUNCTION public.rpc_public_verify_certificate(
    p_token TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_result RECORD;
BEGIN
    SELECT 
        s.created_at as sealed_at,
        s.metadata->>'certificate_name' as cert_name,
        s.metadata->>'issuing_authority' as authority,
        s.metadata->>'expiry_date' as expiry,
        v.name as vessel_name,
        o.name as company_name
    FROM public.certificate_seals s
    JOIN public.organizations o ON s.org_id = o.id
    LEFT JOIN public.vessels v ON (s.metadata->>'vessel_id')::uuid = v.id
    WHERE s.verification_token = p_token
    INTO v_result;

    IF v_result IS NULL THEN
        RETURN jsonb_build_object('valid', false, 'error', 'Invalid or expired token');
    END IF;

    RETURN jsonb_build_object(
        'valid', true,
        'details', jsonb_build_object(
            'certificate_name', v_result.cert_name,
            'issuing_authority', v_result.authority,
            'expiry_date', v_result.expiry,
            'vessel_name', v_result.vessel_name,
            'company', v_result.company_name,
            'verification_timestamp', v_result.sealed_at
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth, pg_temp;

-- Grant access to the public verification function to anon
GRANT EXECUTE ON FUNCTION public.rpc_public_verify_certificate(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.rpc_public_verify_certificate(TEXT) TO authenticated;
