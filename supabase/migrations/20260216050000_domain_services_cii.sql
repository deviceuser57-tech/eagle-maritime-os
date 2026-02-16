-- =====================================================
-- DOMAIN SERVICE: CARBON INTENSITY (CII)
-- =====================================================

-- 1. Function to calculate Attained CII
CREATE OR REPLACE FUNCTION public.fn_calculate_attained_cii(
    fuel_consumption NUMERIC,
    distance_travelled NUMERIC,
    capacity NUMERIC, -- DWT or GT
    fuel_type TEXT
) 
RETURNS NUMERIC AS $$
DECLARE
    cf NUMERIC;
BEGIN
    -- IMO CO2 Conversion Factors (Cf)
    cf := CASE fuel_type
        WHEN 'HFO' THEN 3.114
        WHEN 'LFO' THEN 3.151
        WHEN 'MDO' THEN 3.206
        WHEN 'LNG' THEN 2.750
        WHEN 'LPG' THEN 3.000
        ELSE 3.114
    END;

    IF (distance_travelled = 0 OR capacity = 0) THEN
        RETURN 0;
    END IF;

    -- Formula: (Fuel * Cf * 10^6) / (Dist * Cap)
    -- Result in gCO2 / t.nm
    RETURN ROUND((fuel_consumption * cf * 1000000) / (distance_travelled * capacity), 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Function to determine MARPOL Rating (Simplistic version for Phase 2B)
-- In a real enterprise app, this would query reference lines based on ship type and year
CREATE OR REPLACE FUNCTION public.fn_calculate_cii_rating(
    attained_cii NUMERIC,
    target_cii NUMERIC
) 
RETURNS TEXT AS $$
BEGIN
    IF attained_cii <= (target_cii * 0.8) THEN RETURN 'A';
    ELSIF attained_cii <= (target_cii * 0.94) THEN RETURN 'B';
    ELSIF attained_cii <= (target_cii * 1.06) THEN RETURN 'C';
    ELSIF attained_cii <= (target_cii * 1.28) THEN RETURN 'D';
    ELSE RETURN 'E';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Atomic Service: Log CII Entry
CREATE OR REPLACE FUNCTION public.rpc_log_cii_entry(
    p_org_id UUID,
    p_vessel_id UUID,
    p_year INTEGER,
    p_fuel_consumption NUMERIC,
    p_distance_travelled NUMERIC,
    p_cargo_carried NUMERIC,
    p_fuel_type TEXT,
    p_target_cii NUMERIC,
    p_notes TEXT DEFAULT NULL
) 
RETURNS JSONB AS $$
DECLARE
    v_attained_cii NUMERIC;
    v_rating TEXT;
    v_new_id UUID;
BEGIN
    -- 1. Calculate metrics on backend
    v_attained_cii := public.fn_calculate_attained_cii(
        p_fuel_consumption, 
        p_distance_travelled, 
        p_cargo_carried, 
        p_fuel_type
    );
    
    v_rating := public.fn_calculate_cii_rating(v_attained_cii, p_target_cii);

    -- 2. Insert record
    INSERT INTO public.cii_records (
        org_id,
        user_id,
        vessel_id,
        year,
        cii_value,
        cii_rating,
        target_value,
        fuel_consumption,
        distance_travelled,
        cargo_carried,
        notes
    )
    VALUES (
        p_org_id,
        auth.uid(),
        p_vessel_id,
        p_year,
        v_attained_cii,
        v_rating,
        p_target_cii,
        p_fuel_consumption,
        p_distance_travelled,
        p_cargo_carried,
        p_notes
    )
    RETURNING id INTO v_new_id;

    RETURN jsonb_build_object(
        'success', true,
        'id', v_new_id,
        'attained_cii', v_attained_cii,
        'rating', v_rating
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'code', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
