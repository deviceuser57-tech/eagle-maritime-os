# COMPLIANCE ENGINE - MANUAL EXECUTION GUIDE

**IMPORTANT:** Since automated browser access is unavailable, follow these manual steps to complete the validation demo.

---

## STEP 1: APPLY DATABASE MIGRATIONS

### Method 1: Via Supabase Dashboard (Recommended)

1. **Open Supabase SQL Editor:**
   - Navigate to: https://supabase.com/dashboard/project/mdcjfjfzxoxrgyaraubm/sql
   - Login if required

2. **Apply Migrations in Order:**

#### Migration 1: Regulatory Intelligence
```sql
-- File: supabase/migrations/20260217210000_regulatory_intelligence.sql
-- Copy the entire file contents and paste into SQL Editor
-- Click "Run" or press Ctrl+Enter
```

#### Migration 2: Compliance Engine Core
```sql
-- File: supabase/migrations/20260217220000_compliance_engine_core.sql
-- Copy the entire file contents and paste into SQL Editor
-- Click "Run" or press Ctrl+Enter
```

#### Migration 3: Compliance Scoring Logic
```sql
-- File: supabase/migrations/20260217221000_compliance_scoring_logic.sql
-- Copy the entire file contents and paste into SQL Editor
-- Click "Run" or press Ctrl+Enter
```

#### Migration 4: Compliance Fleet Logic
```sql
-- File: supabase/migrations/20260217222000_compliance_fleet_logic.sql
-- Copy the entire file contents and paste into SQL Editor
-- Click "Run" or press Ctrl+Enter
```

3. **Verify Migrations Applied:**
```sql
-- Run this query to verify tables exist:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'vessel_compliance_scores',
  'vessel_compliance_history',
  'regulatory_matrix',
  'setup_certificate_types'
);

-- Expected: Should return 4 rows
```

---

## STEP 2: CREATE TEST DATA

### Option A: Via UI (Easiest)

1. **Navigate to Application:**
   - Open: http://localhost:8082
   - Click "LAUNCH SYSTEM" (trial mode - no login)

2. **Create Organization:**
   - Click "⚙️ Setup" in sidebar
   - Scroll to "Organization Management"
   - Click "Add Organization"
   - Enter: "Eagle Maritime Demo"
   - Click "Save"

3. **Add Test Vessels:**
   - Click "⚓ Vessels" in sidebar
   - Click "Register New Vessel"
   - Fill in details:
     ```
     Vessel Name: MV COMPLIANCE ALPHA
     IMO Number: IMO9999001
     Vessel Type: Bulk Carrier
     Gross Tonnage: 50000
     Flag State: Panama
     Trading Area: International
     ```
   - Click "Register Vessel"
   - Repeat for 2-3 more vessels

4. **Add Certificates:**
   - Click "📜 Vessel Certification" in sidebar
   - Click "Issue Certificate"
   - Select vessel: MV COMPLIANCE ALPHA
   - Fill in certificate details:
     ```
     Document Name: Safety Management Certificate
     Classification: SMC
     Issuing Authority: Class Society
     Issue Date: [6 months ago]
     Expiry Date: [18 months from now]
     Status: Valid
     ```
   - Click "Issue Certificate"
   - Add at least 2-3 certificates per vessel

### Option B: Via SQL (Faster)

```sql
-- Create test organization
INSERT INTO public.organizations (name, created_at)
VALUES ('Eagle Maritime Demo', now())
RETURNING id;
-- Note the returned ID for next steps

-- Create test vessels (replace <org_id> with ID from above)
INSERT INTO public.vessels (org_id, name, imo_number, vessel_type, gross_tonnage, flag_state, trading_area)
VALUES 
  ('<org_id>', 'MV COMPLIANCE ALPHA', 'IMO9999001', 'Bulk Carrier', 50000, 'Panama', 'International'),
  ('<org_id>', 'MV COMPLIANCE BETA', 'IMO9999002', 'Container', 75000, 'Liberia', 'International'),
  ('<org_id>', 'MV COMPLIANCE GAMMA', 'IMO9999003', 'Tanker', 60000, 'Marshall Islands', 'International');

-- Add certificates for each vessel
INSERT INTO public.vessel_certifications (vessel_id, org_id, certificate_name, certificate_type, status, issue_date, expiry_date)
SELECT 
  v.id,
  v.org_id,
  'Safety Management Certificate',
  'SMC',
  'valid',
  CURRENT_DATE - INTERVAL '6 months',
  CURRENT_DATE + INTERVAL '18 months'
FROM public.vessels v
WHERE v.imo_number IN ('IMO9999001', 'IMO9999002', 'IMO9999003');

INSERT INTO public.vessel_certifications (vessel_id, org_id, certificate_name, certificate_type, status, issue_date, expiry_date)
SELECT 
  v.id,
  v.org_id,
  'Document of Compliance',
  'DOC',
  'valid',
  CURRENT_DATE - INTERVAL '6 months',
  CURRENT_DATE + INTERVAL '18 months'
FROM public.vessels v
WHERE v.imo_number IN ('IMO9999001', 'IMO9999002', 'IMO9999003');

INSERT INTO public.vessel_certifications (vessel_id, org_id, certificate_name, certificate_type, status, issue_date, expiry_date)
SELECT 
  v.id,
  v.org_id,
  'ISPS Certificate',
  'ISPS',
  'valid',
  CURRENT_DATE - INTERVAL '6 months',
  CURRENT_DATE + INTERVAL '18 months'
FROM public.vessels v
WHERE v.imo_number IN ('IMO9999001', 'IMO9999002', 'IMO9999003');

-- Verify data created
SELECT v.name, v.imo_number, COUNT(vc.id) as cert_count
FROM public.vessels v
LEFT JOIN public.vessel_certifications vc ON v.id = vc.vessel_id
GROUP BY v.id, v.name, v.imo_number;
```

---

## STEP 3: RUN VALIDATION SUITE

### Execute Automated Validation

1. **Open Supabase SQL Editor:**
   - Navigate to: https://supabase.com/dashboard/project/mdcjfjfzxoxrgyaraubm/sql

2. **Copy Validation Suite:**
   - Open file: `supabase/migrations/99999999999999_VALIDATION_SUITE.sql`
   - Copy entire contents (Ctrl+A, Ctrl+C)

3. **Execute in SQL Editor:**
   - Paste into SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Wait ~30 seconds

4. **Review Results:**
   - Look for "PASS" or "FAIL" in the Messages panel
   - All 5 scenarios should show ✓ PASS

**Expected Output:**
```
========================================
SCENARIO 1: BASELINE VALIDATION
========================================
✓ PASS: Layer scores are balanced and high
✓ PASS: Fleet index is within realistic high range
✓ PASS: No false statutory breach flags
SCENARIO 1: COMPLETE

[... scenarios 2-5 ...]

========================================
COMPLIANCE ENGINE VALIDATION COMPLETE
========================================
```

---

## STEP 4: RUN API VALIDATION SCRIPT

### Execute Node.js Demo

1. **Open Terminal:**
   - Navigate to project directory

2. **Run Script:**
   ```bash
   cd "d:\NEW VESSELS COMPLIANCE 2026\eagle-vessels"
   node validation-demo.mjs
   ```

3. **Review Output:**
   - Should show compliance calculations
   - Fleet index should display
   - Vessel scores should be listed

**Expected Output:**
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
  "layers": { "admin": 100, "coverage": 85, ... }
}

📊 STEP 2: Testing Fleet Compliance Index
✅ Fleet Index: 82.45%
Total Vessels: 3
Assets at Risk: 0

[... more output ...]
```

---

## STEP 5: VERIFY DASHBOARD

### Manual Dashboard Check

1. **Open Application:**
   - Navigate to: http://localhost:8082
   - Click "LAUNCH SYSTEM"

2. **Check Dashboard:**
   - Click "📊 Dashboard" in sidebar
   - Verify these components:

   **Fleet Status Cards:**
   - [ ] Total Vessels count matches test data
   - [ ] Fleet Compliance Index displays (should be 80-95%)
   - [ ] Assets at Risk count shows
   - [ ] Certificates Expiring count shows

   **Compliance Trends Chart:**
   - [ ] Line chart renders without errors
   - [ ] Shows historical data (if available)

   **Priority Alerts:**
   - [ ] Table displays vessels
   - [ ] Scores shown correctly
   - [ ] No console errors

3. **Calculate Compliance Scores:**
   - If scores don't show, manually trigger calculation:
   ```sql
   -- In Supabase SQL Editor, run for each vessel:
   SELECT public.rpc_calculate_vessel_compliance('<vessel_id>');
   
   -- Or run for all vessels:
   DO $$
   DECLARE
     v_vessel RECORD;
   BEGIN
     FOR v_vessel IN SELECT id FROM public.vessels LOOP
       PERFORM public.rpc_calculate_vessel_compliance(v_vessel.id);
     END LOOP;
   END $$;
   ```

---

## STEP 6: GENERATE PDF REPORT

### Test Report Generation

1. **Navigate to Reports:**
   - Click "📄 Reports" in sidebar

2. **Generate Report:**
   - Click "Generate Fleet Compliance Dossier"
   - Wait for PDF generation (~5 seconds)
   - PDF should auto-download

3. **Verify PDF Contents:**
   - [ ] Cover page with organization name
   - [ ] Fleet summary with compliance index
   - [ ] Vessel details table
   - [ ] Layer breakdown charts
   - [ ] Regulatory references section
   - [ ] All data matches dashboard

---

## STEP 7: TEST EXTERNAL API

### cURL Testing

1. **Get Organization ID:**
   ```sql
   SELECT id, name FROM public.organizations LIMIT 1;
   ```

2. **Test Fleet Compliance Index:**
   ```bash
   curl -X POST 'https://mdcjfjfzxoxrgyaraubm.supabase.co/rest/v1/rpc/rpc_get_fleet_compliance_index' \
     -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kY2pmamZ6eG94cmd5YXJhdWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjUwNzIsImV4cCI6MjA4MDgwMTA3Mn0.4kPW9veIyTbsVG09b6XIBfN0s2k0q9KfC3DIetRfNQw" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kY2pmamZ6eG94cmd5YXJhdWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyMjUwNzIsImV4cCI6MjA4MDgwMTA3Mn0.4kPW9veIyTbsVG09b6XIBfN0s2k0q9KfC3DIetRfNQw" \
     -H "Content-Type: application/json" \
     -d '{"p_org_id": "<your-org-id>"}'
   ```

3. **Expected Response:**
   ```json
   {
     "success": true,
     "fleet_compliance_index": 82.45,
     "vessel_count": 3,
     "at_risk_count": 0,
     "is_weighted": true
   }
   ```

---

## VALIDATION CHECKLIST

### Pre-Execution
- [ ] All 4 compliance migrations applied
- [ ] Test organization created
- [ ] 3 test vessels added
- [ ] 9 certificates added (3 per vessel)
- [ ] Dev server running

### Execution
- [ ] Validation suite executed (all 5 scenarios PASS)
- [ ] API script ran successfully
- [ ] Dashboard displays correct data
- [ ] PDF report generated
- [ ] External API tested via cURL

### Verification
- [ ] All scores consistent across systems
- [ ] Fleet index matches calculations
- [ ] Assets at risk count accurate
- [ ] No errors in logs or console
- [ ] PDF matches dashboard data

---

## QUICK START COMMANDS

### All-in-One SQL Setup
```sql
-- Run this in Supabase SQL Editor after applying migrations

-- 1. Create organization
INSERT INTO public.organizations (name) VALUES ('Eagle Maritime Demo') RETURNING id;
-- Note the ID: <org_id>

-- 2. Create vessels (replace <org_id>)
INSERT INTO public.vessels (org_id, name, imo_number, vessel_type, gross_tonnage, flag_state, trading_area) VALUES 
  ('<org_id>', 'MV COMPLIANCE ALPHA', 'IMO9999001', 'Bulk Carrier', 50000, 'Panama', 'International'),
  ('<org_id>', 'MV COMPLIANCE BETA', 'IMO9999002', 'Container', 75000, 'Liberia', 'International'),
  ('<org_id>', 'MV COMPLIANCE GAMMA', 'IMO9999003', 'Tanker', 60000, 'Marshall Islands', 'International');

-- 3. Add certificates
INSERT INTO public.vessel_certifications (vessel_id, org_id, certificate_name, certificate_type, status, issue_date, expiry_date)
SELECT v.id, v.org_id, cert.name, cert.type, 'valid', CURRENT_DATE - INTERVAL '6 months', CURRENT_DATE + INTERVAL '18 months'
FROM public.vessels v
CROSS JOIN (VALUES 
  ('Safety Management Certificate', 'SMC'),
  ('Document of Compliance', 'DOC'),
  ('ISPS Certificate', 'ISPS')
) AS cert(name, type)
WHERE v.imo_number IN ('IMO9999001', 'IMO9999002', 'IMO9999003');

-- 4. Calculate compliance for all vessels
DO $$
DECLARE v_vessel RECORD;
BEGIN
  FOR v_vessel IN SELECT id FROM public.vessels LOOP
    PERFORM public.rpc_calculate_vessel_compliance(v_vessel.id);
  END LOOP;
END $$;

-- 5. Verify setup
SELECT 
  v.name,
  v.imo_number,
  COUNT(vc.id) as certs,
  vcs.total_score,
  vcs.has_statutory_breach
FROM public.vessels v
LEFT JOIN public.vessel_certifications vc ON v.id = vc.vessel_id
LEFT JOIN public.vessel_compliance_scores vcs ON v.id = vcs.vessel_id
GROUP BY v.id, v.name, v.imo_number, vcs.total_score, vcs.has_statutory_breach;
```

---

## TROUBLESHOOTING

### "Table not found" errors
**Solution:** Apply all 4 compliance migrations in order

### "No vessels found"
**Solution:** Create test data using SQL or UI

### API returns empty results
**Solution:** Run compliance calculations manually

### Dashboard shows no data
**Solution:** Hard refresh (Ctrl+Shift+R) and verify calculations ran

---

**EXECUTION TIME:** ~30 minutes total
- Migrations: 10 min
- Test data: 5 min
- Validation suite: 5 min
- API testing: 5 min
- Dashboard/PDF verification: 5 min

**START HERE:** Step 1 - Apply migrations via Supabase Dashboard
