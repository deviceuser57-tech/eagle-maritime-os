# ✅ COMPLIANCE ENGINE - READY TO EXECUTE

## 🎯 QUICK START (3 STEPS)

### STEP 1: Apply Database Migrations (10 min)

**Open Supabase SQL Editor:**
https://supabase.com/dashboard/project/mdcjfjfzxoxrgyaraubm/sql

**Execute these 4 files in order:**

1. **Regulatory Intelligence** (File: `20260217210000_regulatory_intelligence.sql`)
2. **Compliance Engine Core** (File: `20260217220000_compliance_engine_core.sql`)  
3. **Compliance Scoring Logic** (File: `20260217221000_compliance_scoring_logic.sql`)
4. **Compliance Fleet Logic** (File: `20260217222000_compliance_fleet_logic.sql`)

**How to execute:**
- Open each file in your editor
- Copy entire contents (Ctrl+A, Ctrl+C)
- Paste into Supabase SQL Editor
- Click "Run" or press Ctrl+Enter
- Wait for "Success" message
- Repeat for next file

---

### STEP 2: Create Test Data (5 min)

**Copy and run this SQL in Supabase SQL Editor:**

```sql
-- Create test organization
INSERT INTO public.organizations (name) VALUES ('Eagle Maritime Demo') RETURNING id;
-- ⚠️ IMPORTANT: Note the returned ID and replace <org_id> below

-- Create 3 test vessels (replace <org_id> with the ID from above)
INSERT INTO public.vessels (org_id, name, imo_number, vessel_type, gross_tonnage, flag_state, trading_area) VALUES 
  ('<org_id>', 'MV COMPLIANCE ALPHA', 'IMO9999001', 'Bulk Carrier', 50000, 'Panama', 'International'),
  ('<org_id>', 'MV COMPLIANCE BETA', 'IMO9999002', 'Container', 75000, 'Liberia', 'International'),
  ('<org_id>', 'MV COMPLIANCE GAMMA', 'IMO9999003', 'Tanker', 60000, 'Marshall Islands', 'International');

-- Add 9 certificates (3 per vessel)
INSERT INTO public.vessel_certifications (vessel_id, org_id, certificate_name, certificate_type, status, issue_date, expiry_date)
SELECT v.id, v.org_id, cert.name, cert.type, 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months'
FROM public.vessels v
CROSS JOIN (VALUES 
  ('Safety Management Certificate', 'SMC'),
  ('Document of Compliance', 'DOC'),
  ('ISPS Certificate', 'ISPS')
) AS cert(name, type)
WHERE v.imo_number IN ('IMO9999001', 'IMO9999002', 'IMO9999003');

-- Calculate compliance scores for all vessels
DO $$
DECLARE v_vessel RECORD;
BEGIN
  FOR v_vessel IN SELECT id FROM public.vessels WHERE imo_number LIKE 'IMO9999%' LOOP
    PERFORM public.rpc_calculate_vessel_compliance(v_vessel.id);
  END LOOP;
END $$;

-- Verify everything is set up correctly
SELECT 
  v.name,
  v.imo_number,
  COUNT(vc.id) as certificates,
  vcs.total_score as compliance_score,
  vcs.has_statutory_breach as has_breach
FROM public.vessels v
LEFT JOIN public.vessel_certifications vc ON v.id = vc.vessel_id
LEFT JOIN public.vessel_compliance_scores vcs ON v.id = vcs.vessel_id
WHERE v.imo_number LIKE 'IMO9999%'
GROUP BY v.id, v.name, v.imo_number, vcs.total_score, vcs.has_statutory_breach
ORDER BY v.name;
```

**Expected output:**
```
name                    | imo_number  | certificates | compliance_score | has_breach
------------------------|-------------|--------------|------------------|------------
MV COMPLIANCE ALPHA     | IMO9999001  | 3            | 87.50            | false
MV COMPLIANCE BETA      | IMO9999002  | 3            | 87.50            | false
MV COMPLIANCE GAMMA     | IMO9999003  | 3            | 87.50            | false
```

---

### STEP 3: Run Validation & Testing (15 min)

#### A. Run Automated Validation Suite

**In Supabase SQL Editor, execute:**
- File: `99999999999999_VALIDATION_SUITE.sql`
- Copy entire file and run
- Wait ~30 seconds
- Look for "✓ PASS" messages for all 5 scenarios

#### B. Run API Validation Script

**In your terminal:**
```bash
cd "d:\NEW VESSELS COMPLIANCE 2026\eagle-vessels"
node validation-demo.mjs
```

**Expected output:**
```
========================================
COMPLIANCE ENGINE - VALIDATION DEMO
========================================

📊 STEP 1: Testing Vessel Compliance Calculation
Testing vessel: MV COMPLIANCE ALPHA (IMO9999001)
✅ Compliance Calculation Result:
{
  "success": true,
  "total_score": 87.5,
  ...
}

📊 STEP 2: Testing Fleet Compliance Index
✅ Fleet Index: 87.5%
Total Vessels: 3
Assets at Risk: 0
```

#### C. Verify Dashboard

1. Open: http://localhost:8082
2. Click "LAUNCH SYSTEM"
3. Click "📊 Dashboard"
4. Verify:
   - Fleet Compliance Index shows ~87.5%
   - Total Vessels shows 3
   - Assets at Risk shows 0
   - Compliance charts render

#### D. Generate PDF Report

1. Click "📄 Reports" in sidebar
2. Click "Generate Fleet Compliance Dossier"
3. Verify PDF downloads with all vessel data

#### E. Test External API

**Run in terminal or Postman:**
```bash
# Get your org_id first from SQL:
# SELECT id FROM organizations WHERE name = 'Eagle Maritime Demo';

curl -X POST 'https://mdcjfjfzxoxrgyaraubm.supabase.co/rest/v1/rpc/rpc_get_fleet_compliance_index' \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kY2pmamZ6eG94cmd5YXJhdWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjUwNzIsImV4cCI6MjA4MDgwMTA3Mn0.4kPW9veIyTbsVG09b6XIBfN0s2k0q9KfC3DIetRfNQw" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kY2pmamZ6eG94cmd5YXJhdWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjUwNzIsImV4cCI6MjA4MDgwMTA3Mn0.4kPW9veIyTbsVG09b6XIBfN0s2k0q9KfC3DIetRfNQw" \
  -H "Content-Type: application/json" \
  -d '{"p_org_id": "<your-org-id>"}'
```

---

## ✅ SUCCESS CRITERIA

### All Steps Complete When:
- [ ] 4 migrations applied without errors
- [ ] 3 test vessels created
- [ ] 9 certificates added
- [ ] Compliance scores calculated
- [ ] Validation suite shows all PASS
- [ ] API script runs successfully
- [ ] Dashboard displays correct data
- [ ] PDF report generates
- [ ] External API responds correctly

---

## 📁 FILES REFERENCE

| File | Location | Purpose |
|------|----------|---------|
| Regulatory Intelligence | `supabase/migrations/20260217210000_regulatory_intelligence.sql` | Certificate types & matrix |
| Compliance Core | `supabase/migrations/20260217220000_compliance_engine_core.sql` | Score tables |
| Scoring Logic | `supabase/migrations/20260217221000_compliance_scoring_logic.sql` | RPC functions |
| Fleet Logic | `supabase/migrations/20260217222000_compliance_fleet_logic.sql` | Fleet aggregation |
| Validation Suite | `supabase/migrations/99999999999999_VALIDATION_SUITE.sql` | Automated tests |
| API Demo Script | `validation-demo.mjs` | Node.js testing |

---

## 🚨 TROUBLESHOOTING

### "Table already exists" error
**Solution:** Tables already created, skip to Step 2

### "Function does not exist" error
**Solution:** Apply migration 3 (scoring logic)

### "No vessels found" in API script
**Solution:** Complete Step 2 (create test data)

### Dashboard shows no data
**Solution:** Run compliance calculations in Step 2

### API returns 404
**Solution:** Ensure migrations 3 & 4 applied (RPC functions)

---

## 📊 EXPECTED RESULTS

### Compliance Scores
- **Admin Readiness:** 100% (all certs valid)
- **Regulatory Coverage:** 100% (all mandatory certs present)
- **Findings Severity:** 100% (no findings)
- **Operational Risk:** 100% (no CII data, defaults to 100)
- **Total Score:** ~87.5% (weighted average)

### Fleet Metrics
- **Fleet Compliance Index:** ~87.5%
- **Total Vessels:** 3
- **Assets at Risk:** 0
- **Tonnage Weighted:** Yes

---

## ⏱️ ESTIMATED TIME

- **Step 1 (Migrations):** 10 minutes
- **Step 2 (Test Data):** 5 minutes
- **Step 3 (Validation):** 15 minutes
- **Total:** 30 minutes

---

## 🎯 START HERE

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/mdcjfjfzxoxrgyaraubm/sql
2. Copy file: `supabase/migrations/20260217210000_regulatory_intelligence.sql`
3. Paste and run
4. Continue with remaining migrations

**Good luck! 🚀**
