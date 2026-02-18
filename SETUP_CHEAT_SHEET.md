# 🚀 COMPLIANCE ENGINE - ONE-PAGE SETUP

## ⚡ QUICK EXECUTION (30 minutes)

### STEP 1: Apply 5 Migrations in Order

Open: https://supabase.com/dashboard/project/mdcjfjfzxoxrgyaraubm/sql

Copy each file → Paste → Run → Wait for success → Next file

```
1. supabase/migrations/20260216030000_enterprise_saas_core.sql       ← Creates organizations table
2. supabase/migrations/20260217210000_regulatory_intelligence.sql    ← Certificate types & matrix
3. supabase/migrations/20260217220000_compliance_engine_core.sql     ← Compliance score tables
4. supabase/migrations/20260217221000_compliance_scoring_logic.sql   ← RPC calculation functions
5. supabase/migrations/20260217222000_compliance_fleet_logic.sql     ← Fleet aggregation
```

---

### STEP 2: Create Test Data

Run this SQL (replace `<org_id>` after first INSERT):

```sql
-- Create organization
INSERT INTO public.organizations (name, slug, plan_id) 
VALUES ('Eagle Maritime Demo', 'eagle-demo', (SELECT id FROM public.subscription_plans WHERE name = 'Professional'))
RETURNING id;  -- ← Copy this ID

-- Create vessels (replace <org_id>)
INSERT INTO public.vessels (org_id, name, imo_number, vessel_type, gross_tonnage, flag_state, trading_area) VALUES 
  ('<org_id>', 'MV COMPLIANCE ALPHA', 'IMO9999001', 'Bulk Carrier', 50000, 'Panama', 'International'),
  ('<org_id>', 'MV COMPLIANCE BETA', 'IMO9999002', 'Container', 75000, 'Liberia', 'International'),
  ('<org_id>', 'MV COMPLIANCE GAMMA', 'IMO9999003', 'Tanker', 60000, 'Marshall Islands', 'International');

-- Add certificates
INSERT INTO public.vessel_certifications (vessel_id, org_id, certificate_name, certificate_type, status, issue_date, expiry_date)
SELECT v.id, v.org_id, cert.name, cert.type, 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months'
FROM public.vessels v
CROSS JOIN (VALUES ('Safety Management Certificate', 'SMC'), ('Document of Compliance', 'DOC'), ('ISPS Certificate', 'ISPS')) AS cert(name, type)
WHERE v.imo_number IN ('IMO9999001', 'IMO9999002', 'IMO9999003');

-- Calculate compliance
DO $$ DECLARE v_vessel RECORD; BEGIN
  FOR v_vessel IN SELECT id FROM public.vessels WHERE imo_number LIKE 'IMO9999%' LOOP
    PERFORM public.rpc_calculate_vessel_compliance(v_vessel.id);
  END LOOP;
END $$;

-- Verify
SELECT v.name, COUNT(vc.id) as certs, vcs.total_score FROM public.vessels v
LEFT JOIN public.vessel_certifications vc ON v.id = vc.vessel_id
LEFT JOIN public.vessel_compliance_scores vcs ON v.id = vcs.vessel_id
WHERE v.imo_number LIKE 'IMO9999%' GROUP BY v.id, v.name, vcs.total_score;
```

---

### STEP 3: Run Validation

**A. Validation Suite:**
- Copy: `supabase/migrations/99999999999999_VALIDATION_SUITE.sql`
- Run in SQL Editor
- Look for "✓ PASS" (all 5 scenarios)

**B. API Test:**
```bash
node validation-demo.mjs
```

**C. Dashboard:**
- Open: http://localhost:8082
- Click "LAUNCH SYSTEM"
- Go to Dashboard
- Verify Fleet Index ~87.5%

---

## ✅ SUCCESS CHECKLIST

- [ ] 5 migrations applied
- [ ] 3 vessels created
- [ ] 9 certificates added
- [ ] Compliance scores calculated
- [ ] Validation suite: all PASS
- [ ] API script: success
- [ ] Dashboard: shows data
- [ ] Fleet Index: ~87.5%

---

## 🚨 COMMON ERRORS

| Error | Solution |
|-------|----------|
| "organizations does not exist" | Apply migration #1 first |
| "syntax error near ```" | Remove markdown code fences |
| "syntax error near RAISE" | Use individual migration files, not COMPLIANCE_SETUP_PART1.sql |
| "No vessels found" | Complete Step 2 |

---

**START:** Open Supabase SQL Editor → Apply migration #1 → Continue in order
