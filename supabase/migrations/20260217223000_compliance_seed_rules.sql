-- =====================================================
-- COMPLIANCE ENGINE: REGULATORY SEED DATA
-- =====================================================

-- This script populates the regulatory_matrix with global maritime standards.
-- It assumes standard certificate names exist in setup_certificate_types.

DO $$
DECLARE
    v_cert_id UUID;
BEGIN
    -- 1. Safety Management Certificate (SMC) - Mandatory for all cargo/passenger ships > 500 GT
    SELECT id INTO v_cert_id FROM public.setup_certificate_types WHERE certificate_name ILIKE '%Safety Management Certificate%' LIMIT 1;
    IF v_cert_id IS NOT NULL THEN
        INSERT INTO public.regulatory_matrix (certificate_type_id, vessel_type_pattern, gt_min, is_mandatory)
        VALUES (v_cert_id, 'Any', 500, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 2. Document of Compliance (DOC) - Mandatory for the company operating ships > 500 GT
    SELECT id INTO v_cert_id FROM public.setup_certificate_types WHERE certificate_name ILIKE '%Document of Compliance%' LIMIT 1;
    IF v_cert_id IS NOT NULL THEN
        INSERT INTO public.regulatory_matrix (certificate_type_id, vessel_type_pattern, gt_min, is_mandatory)
        VALUES (v_cert_id, 'Any', 500, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 3. International Oil Pollution Prevention (IOPP) - Mandatory for ships > 400 GT
    SELECT id INTO v_cert_id FROM public.setup_certificate_types WHERE certificate_name ILIKE '%Oil Pollution Prevention%' LIMIT 1;
    IF v_cert_id IS NOT NULL THEN
        INSERT INTO public.regulatory_matrix (certificate_type_id, vessel_type_pattern, gt_min, is_mandatory)
        VALUES (v_cert_id, 'Any', 400, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4. International Air Pollution Prevention (IAPP) - Mandatory for ships > 400 GT
    SELECT id INTO v_cert_id FROM public.setup_certificate_types WHERE certificate_name ILIKE '%Air Pollution Prevention%' LIMIT 1;
    IF v_cert_id IS NOT NULL THEN
        INSERT INTO public.regulatory_matrix (certificate_type_id, vessel_type_pattern, gt_min, is_mandatory)
        VALUES (v_cert_id, 'Any', 400, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 5. Maritime Labour Convention (MLC) - Mandatory for ships > 500 GT
    SELECT id INTO v_cert_id FROM public.setup_certificate_types WHERE certificate_name ILIKE '%Maritime Labour Convention%' OR certificate_name ILIKE '%MLC%' LIMIT 1;
    IF v_cert_id IS NOT NULL THEN
        INSERT INTO public.regulatory_matrix (certificate_type_id, vessel_type_pattern, gt_min, is_mandatory)
        VALUES (v_cert_id, 'Any', 500, true)
        ON CONFLICT DO NOTHING;
    END IF;

    -- 6. International Load Line Certificate - Mandatory for ships > 150 GT or L > 24m
    SELECT id INTO v_cert_id FROM public.setup_certificate_types WHERE certificate_name ILIKE '%Load Line%' LIMIT 1;
    IF v_cert_id IS NOT NULL THEN
        INSERT INTO public.regulatory_matrix (certificate_type_id, vessel_type_pattern, gt_min, is_mandatory)
        VALUES (v_cert_id, 'Any', 150, true)
        ON CONFLICT DO NOTHING;
    END IF;

END $$;
