-- =====================================================
-- MARITIME CYBERSECURITY (IMO MSC.428(98))
-- =====================================================

BEGIN;

-- 1. Vessel Cyber Assets (IT/OT Inventory)
CREATE TABLE IF NOT EXISTS public.vessel_cyber_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
    asset_name TEXT NOT NULL,
    asset_category TEXT NOT NULL, -- 'OT-Bridge', 'OT-Engine', 'OT-Cargo', 'IT-Admin', 'IT-Crew'
    system_type TEXT, -- 'ECDIS', 'RADAR', 'VDR', 'PMS', 'CCTV'
    manufacturer TEXT,
    model TEXT,
    firmware_version TEXT,
    installation_date DATE,
    last_update_date DATE,
    criticality_level TEXT DEFAULT 'Medium', -- 'Low', 'Medium', 'High', 'Critical'
    network_segment TEXT, -- 'CDBN', 'Crew-LAN', 'Admin-LAN'
    status TEXT DEFAULT 'Operational',
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Vessel Cyber Assessments (Risk & Compliance)
CREATE TABLE IF NOT EXISTS public.vessel_cyber_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
    assessment_type TEXT NOT NULL, -- 'Risk Assessment', 'Vulnerability Scan', 'Compliance Audit'
    standard TEXT DEFAULT 'MSC.428(98)',
    status TEXT NOT NULL DEFAULT 'Planned', -- 'Planned', 'In-Progress', 'Completed'
    assessor TEXT,
    scheduled_date DATE,
    completion_date DATE,
    overall_risk_score INTEGER, -- 1-100
    executive_summary TEXT,
    recommendations TEXT,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Vessel Cyber Vulnerabilities
CREATE TABLE IF NOT EXISTS public.vessel_cyber_vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
    asset_id UUID REFERENCES public.vessel_cyber_assets(id) ON DELETE CASCADE,
    cve_id TEXT,
    vulnerability_title TEXT NOT NULL,
    severity TEXT NOT NULL, -- 'Low', 'Medium', 'High', 'Critical'
    status TEXT DEFAULT 'Open', -- 'Open', 'Under-Investigation', 'Patched', 'Mitigated'
    discovery_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_remediation_date DATE,
    remediation_details TEXT,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Vessel Cyber Incidents
CREATE TABLE IF NOT EXISTS public.vessel_cyber_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_id UUID NOT NULL REFERENCES public.vessels(id) ON DELETE CASCADE,
    incident_type TEXT NOT NULL, -- 'Malware', 'Unauthorized Access', 'DoS', 'Phishing'
    incident_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    severity TEXT NOT NULL, -- 'Minor', 'Moderate', 'Major', 'Critical'
    status TEXT DEFAULT 'Active', -- 'Active', 'Contained', 'Resolved'
    detection_method TEXT,
    description TEXT,
    affected_assets JSONB DEFAULT '[]',
    recovery_actions TEXT,
    org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Enable RLS and Org-scoped Policies
DO $$
DECLARE
    table_name_var TEXT;
    target_tables TEXT[] := ARRAY[
        'vessel_cyber_assets', 'vessel_cyber_assessments', 
        'vessel_cyber_vulnerabilities', 'vessel_cyber_incidents'
    ];
BEGIN
    FOR table_name_var IN SELECT UNNEST(target_tables) LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name_var);
        
        EXECUTE format('
            DROP POLICY IF EXISTS "Org-scoped access" ON public.%I;
            CREATE POLICY "Org-scoped access" ON public.%I
            FOR ALL TO authenticated
            USING (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))
            WITH CHECK (org_id IN (SELECT org_id FROM public.organization_members WHERE user_id = auth.uid()))', 
            table_name_var, table_name_var);
    END LOOP;
END $$;

-- 6. Cyber Health Score View
CREATE OR REPLACE VIEW public.vw_vessel_cyber_health AS
SELECT 
    v.id AS vessel_id,
    v.name AS vessel_name,
    v.org_id,
    
    -- Asset Inventory Stats
    COUNT(DISTINCT a.id) AS total_assets,
    COUNT(DISTINCT CASE WHEN a.asset_category IN ('OT-Bridge', 'OT-Engine') THEN a.id END) AS total_ot_assets,
    
    -- Vulnerability Stats
    COUNT(DISTINCT v_vuln.id) FILTER (WHERE v_vuln.status = 'Open') AS open_vulnerabilities,
    COUNT(DISTINCT v_vuln.id) FILTER (WHERE v_vuln.status = 'Open' AND v_vuln.severity IN ('High', 'Critical')) AS critical_vulnerabilities,
    
    -- Incident Stats
    COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'Active') AS active_incidents,
    
    -- Health Score Logic (0-100)
    GREATEST(0, LEAST(100, 
        100 
        - (COUNT(DISTINCT v_vuln.id) FILTER (WHERE v_vuln.status = 'Open' AND v_vuln.severity = 'Critical') * 25)
        - (COUNT(DISTINCT v_vuln.id) FILTER (WHERE v_vuln.status = 'Open' AND v_vuln.severity = 'High') * 10)
        - (COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'Active') * 40)
    )) AS cyber_health_score,

    -- Status Flagging
    CASE 
        WHEN COUNT(DISTINCT i.id) FILTER (WHERE i.status = 'Active') > 0 THEN 'EMERGENCY: ACTIVE INCIDENT'
        WHEN COUNT(DISTINCT v_vuln.id) FILTER (WHERE v_vuln.status = 'Open' AND v_vuln.severity IN ('High', 'Critical')) > 2 THEN 'HIGH RISK: CRITICAL VULNS'
        WHEN COUNT(DISTINCT v_vuln.id) FILTER (WHERE v_vuln.status = 'Open') > 0 THEN 'MODERATE RISK'
        ELSE 'SECURE'
    END AS cyber_security_status

FROM public.vessels v
LEFT JOIN public.vessel_cyber_assets a ON v.id = a.vessel_id
LEFT JOIN public.vessel_cyber_vulnerabilities v_vuln ON v.id = v_vuln.vessel_id AND v_vuln.status = 'Open'
LEFT JOIN public.vessel_cyber_incidents i ON v.id = i.vessel_id AND i.status = 'Active'
WHERE v.status = 'active'
GROUP BY v.id, v.name, v.org_id;

-- 7. Triggers for updated_at
DO $$
DECLARE
    t_name TEXT;
    target_tables TEXT[] := ARRAY[
        'vessel_cyber_assets', 'vessel_cyber_assessments', 
        'vessel_cyber_vulnerabilities', 'vessel_cyber_incidents'
    ];
BEGIN
    FOR t_name IN SELECT UNNEST(target_tables) LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I;
            CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I
            FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', 
            t_name, t_name, t_name, t_name);
    END LOOP;
END $$;

COMMIT;
