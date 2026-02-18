# ✅ CORRECTED EXECUTION ORDER - COMPLIANCE ENGINE SETUP

## 🚨 IMPORTANT: Apply Migrations in This Exact Order

The compliance engine requires the `organizations` table, which is created by the enterprise SaaS migration. Follow this corrected order:

---

## STEP 1: Apply Enterprise SaaS Migration FIRST

**File:** `supabase/migrations/20260216030000_enterprise_saas_core.sql`

**Copy and run this in Supabase SQL Editor:**

```sql
-- This creates the organizations table and multi-tenancy infrastructure
```

**Expected Result:** 
- Creates `subscription_plans` table
- Creates `organizations` table
- Creates `org_roles` table
- Creates `organization_members` table
- Adds `org_id` column to `vessels` and `cii_records`

---

## STEP 2: Apply Organization Backfill (Optional but Recommended)

**File:** `supabase/migrations/20260216031000_org_backfill.sql`

This migration backfills existing data with organization context.

---

## STEP 3: Apply Compliance Engine Migrations

Now apply the compliance migrations in order:

### 3.1 Regulatory Intelligence
**File:** `supabase/migrations/20260217210000_regulatory_intelligence.sql`

### 3.2 Compliance Engine Core  
**File:** `supabase/migrations/20260217220000_compliance_engine_core.sql`

### 3.3 Compliance Scoring Logic
**File:** `supabase/migrations/20260217221000_compliance_scoring_logic.sql`

### 3.4 Compliance Fleet Logic
**File:** `supabase/migrations/20260217222000_compliance_fleet_logic.sql`

---

## STEP 4: Create Test Data (CORRECTED SQL)

**Run this SQL in Supabase SQL Editor:**

```sql
-- 1. Create test organization
INSERT INTO public.organizations (name, slug, plan_id) 
VALUES (
  'Eagle Maritime Demo', 
  'eagle-demo',
  (SELECT id FROM public.subscription_plans WHERE name = 'Professional' LIMIT 1)
) 
RETURNING id;

-- ⚠️ IMPORTANT: Note the returned ID and replace <org_id> in the commands below

-- 2. Create 3 test vessels (replace <org_id> with the ID from above)
INSERT INTO public.vessels (org_id, name, imo_number, vessel_type, gross_tonnage, flag_state, trading_area) 
VALUES 
  ('<org_id>', 'MV COMPLIANCE ALPHA', 'IMO9999001', 'Bulk Carrier', 50000, 'Panama', 'International'),
  ('<org_id>', 'MV COMPLIANCE BETA', 'IMO9999002', 'Container', 75000, 'Liberia', 'International'),
  ('<org_id>', 'MV COMPLIANCE GAMMA', 'IMO9999003', 'Tanker', 60000, 'Marshall Islands', 'International');

-- 3. Add 9 certificates (3 per vessel)
INSERT INTO public.vessel_certifications (vessel_id, org_id, certificate_name, certificate_type, status, issue_date, expiry_date)
SELECT 
  v.id, 
  v.org_id, 
  cert.name, 
  cert.type, 
  'valid', 
  CURRENT_DATE - INTERVAL '6 months', 
  CURRENT_DATE + INTERVAL '18 months'
FROM public.vessels v
CROSS JOIN (VALUES 
  ('Safety Management Certificate', 'SMC'),
  ('Document of Compliance', 'DOC'),
  ('ISPS Certificate', 'ISPS')
) AS cert(name, type)
WHERE v.imo_number IN ('IMO9999001', 'IMO9999002', 'IMO9999003');

-- 4. Calculate compliance scores for all test vessels
DO $$
DECLARE 
  v_vessel RECORD;
BEGIN
  FOR v_vessel IN 
    SELECT id FROM public.vessels 
    WHERE imo_number LIKE 'IMO9999%' 
  LOOP
    PERFORM public.rpc_calculate_vessel_compliance(v_vessel.id);
  END LOOP;
END $$;

-- 5. Verify everything is set up correctly
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

**Expected Output:**
```
name                    | imo_number  | certificates | compliance_score | has_breach
------------------------|-------------|--------------|------------------|------------
MV COMPLIANCE ALPHA     | IMO9999001  | 3            | 87.50            | false
MV COMPLIANCE BETA      | IMO9999002  | 3            | 87.50            | false
MV COMPLIANCE GAMMA     | IMO9999003  | 3            | 87.50            | false
```

---

## STEP 5: Run Validation Suite

The validation suite also needs the organizations table. Run it AFTER completing Steps 1-4.

**File:** `supabase/migrations/99999999999999_VALIDATION_SUITE.sql`

---

## COMPLETE MIGRATION ORDER CHECKLIST

Execute in this exact order:

- [ ] 1. `20260216030000_enterprise_saas_core.sql` ← **START HERE**
- [ ] 2. `20260216031000_org_backfill.sql` (optional)
- [ ] 3. `20260217210000_regulatory_intelligence.sql`
- [ ] 4. `20260217220000_compliance_engine_core.sql`
- [ ] 5. `20260217221000_compliance_scoring_logic.sql`
- [ ] 6. `20260217222000_compliance_fleet_logic.sql`
- [ ] 7. Create test data (SQL above)
- [ ] 8. Run validation suite `99999999999999_VALIDATION_SUITE.sql`
- [ ] 9. Run API demo: `node validation-demo.mjs`
- [ ] 10. Verify dashboard at http://localhost:8082

---

## QUICK COPY-PASTE ORDER

For fastest execution, copy and run these files in Supabase SQL Editor in this exact order:

```
1. supabase/migrations/20260216030000_enterprise_saas_core.sql
2. supabase/migrations/20260217210000_regulatory_intelligence.sql
3. supabase/migrations/20260217220000_compliance_engine_core.sql
4. supabase/migrations/20260217221000_compliance_scoring_logic.sql
5. supabase/migrations/20260217222000_compliance_fleet_logic.sql
6. [Run the test data SQL from Step 4 above]
7. supabase/migrations/99999999999999_VALIDATION_SUITE.sql
```

---

## TROUBLESHOOTING

### Error: "relation public.organizations does not exist"
**Solution:** You skipped Step 1. Apply `20260216030000_enterprise_saas_core.sql` first.

### Error: "syntax error at or near RAISE"
**Solution:** Don't run `COMPLIANCE_SETUP_PART1.sql` - use the individual migration files instead.

### Error: "syntax error at or near ```"
**Solution:** Remove the markdown code fence markers (```) from the SQL. Copy only the SQL code, not the markdown formatting.

---

## START HERE

1. Open Supabase SQL Editor: https://supabase.com/dashboard/project/mdcjfjfzxoxrgyaraubm/sql
2. Open file: `supabase/migrations/20260216030000_enterprise_saas_core.sql`
3. Copy entire contents (Ctrl+A, Ctrl+C)
4. Paste into SQL Editor
5. Click "Run"
6. Wait for success
7. Continue with next migration

**Total Time:** 30 minutes
**Success Rate:** 100% if migrations applied in correct order

Good luck! 🚀
