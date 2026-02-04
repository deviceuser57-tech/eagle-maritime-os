
# High Priority: Fix Data Persistence Issues

## Overview
This plan addresses the three critical issues:
1. **SetupPage data persistence** - Currently uses local React state (data lost on refresh)
2. **Protected routes/authentication enforcement** - Dashboard is accessible without login
3. **Remove all remaining hardcoded/mock data** - Several components still have static data

---

## Phase 1: Database Schema for Setup Configuration

Create a new migration with tables to store all setup configuration data:

### Tables to Create

```text
+---------------------------+------------------------------------------+
| Table Name                | Purpose                                  |
+---------------------------+------------------------------------------+
| setup_companies           | Owner, Operator, Technical, ISM managers |
| setup_crew_ranks          | Crew ranks and departments               |
| setup_nationalities       | Countries and codes                      |
| setup_contract_types      | Crew contract types                      |
| setup_currencies          | Currency codes and symbols               |
| setup_audit_types         | Audit type definitions                   |
| setup_finding_types       | Finding types with severity              |
| setup_finding_statuses    | Status workflow definitions              |
| setup_root_causes         | Root cause categories                    |
| setup_classification_soc  | Classification societies                 |
| setup_flag_states         | Flag states with risk levels             |
| setup_certificate_types   | All certificate type definitions         |
+---------------------------+------------------------------------------+
```

Each table will have:
- `id` (UUID primary key)
- `user_id` (foreign key for RLS)
- `category` (to differentiate subtypes like "owner" vs "operator" company)
- Relevant data fields
- `created_at`, `updated_at` timestamps
- RLS policies for authenticated users

---

## Phase 2: Setup Data Hooks

Create custom hooks for each setup table following the existing pattern:

### Hooks to Create
- `useSetupCompanies.ts` - CRUD for companies (owner, operator, technical, ISM, DOC)
- `useSetupCrewConfig.ts` - Ranks, nationalities, contracts, currencies
- `useSetupAuditConfig.ts` - Audit types, finding types, statuses, root causes
- `useSetupClassification.ts` - Classification societies, flag states
- `useSetupCertificates.ts` - All certificate type definitions

Each hook will:
- Use `useAuth()` for user context
- Implement `useQuery` for fetching
- Implement `useMutation` for add/update/delete
- Show toast notifications on success/error

---

## Phase 3: Connect SetupPage to Database

Refactor `SetupPage.tsx` to:
1. Import the new hooks
2. Replace local `useState` with database queries
3. Wire up Add/Edit/Delete buttons to mutations
4. Add loading states while fetching
5. Show empty state messages when no data configured

---

## Phase 4: Protected Routes & Authentication Enforcement

### Current Flow (Problem)
```text
User visits / 
    --> Shows FrontPage (public)
    --> Clicks "Enter Dashboard"
    --> Shows Dashboard (NO LOGIN REQUIRED!)
```

### New Flow (Solution)
```text
User visits /
    --> Shows FrontPage (public)
    --> Clicks "Enter Dashboard"
    --> If NOT authenticated: Redirect to AuthPage
    --> If authenticated: Show Dashboard
```

### Implementation Changes

**1. Update `Index.tsx`:**
```typescript
// After clicking "Enter Dashboard":
if (!user) {
  // Show AuthPage instead of dashboard
  return <AuthPage onAuthSuccess={() => setShowFrontPage(false)} />;
}
// Only show dashboard if authenticated
return <Dashboard />;
```

**2. Add sign-out button to Sidebar:**
- Display current user email/name
- Add "Sign Out" button that calls `signOut()` and returns to FrontPage

**3. Update AuthPage:**
- Add `onAuthSuccess` callback prop
- After successful login/signup, call the callback to navigate to dashboard
- Add proper redirect after authentication

---

## Phase 5: Remove Remaining Hardcoded Data

### Components with Mock Data

| Component | Current State | Solution |
|-----------|---------------|----------|
| `SafetyManagement.tsx` | Hardcoded `smsElements` array | Connect to existing `audits` and `incidents` tables for real stats |
| `DigitalCompliance.tsx` | Hardcoded `complianceAreas` array | Calculate from `vessel_certifications` and `audits` tables |
| `RulesRegulations.tsx` | Hardcoded `regulations` array | Create `setup_regulations` table or make static (reference data) |
| `InteractiveClosure.tsx` | Hardcoded `pendingClosures` array | Connect to `corrective_actions` and `audit_findings` tables |

### For each component:
1. Import relevant hooks (`useAudits`, `useCorrectiveActions`, etc.)
2. Replace hardcoded arrays with database queries
3. Calculate stats dynamically from real data
4. Add loading and empty states

---

## Technical Details

### Database Migration SQL (Summarized)

```sql
-- Setup companies table (for owner, operator, technical, ISM, DOC)
CREATE TABLE setup_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  company_type TEXT NOT NULL, -- 'owner', 'operator', 'technical', 'ism', 'doc'
  name TEXT NOT NULL,
  contact_person TEXT,
  title TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Similar pattern for other setup tables...

-- Enable RLS on all tables
ALTER TABLE setup_companies ENABLE ROW LEVEL SECURITY;

-- RLS policies for each table
CREATE POLICY "Users can manage own data" ON setup_companies
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Protected Route Logic

```typescript
// In IndexContent component
const IndexContent = () => {
  const { user, loading } = useAuth();
  const [showFrontPage, setShowFrontPage] = useState(true);
  const [showAuthPage, setShowAuthPage] = useState(false);

  const handleEnterDashboard = () => {
    if (!user) {
      setShowAuthPage(true); // Redirect to auth
    } else {
      setShowFrontPage(false); // Show dashboard
    }
  };

  if (loading) return <LoadingSpinner />;
  if (showFrontPage) return <FrontPage onEnterDashboard={handleEnterDashboard} />;
  if (showAuthPage || !user) return <AuthPage onAuthSuccess={() => setShowAuthPage(false)} />;
  return <Dashboard />; // Only accessible when authenticated
};
```

---

## Implementation Order

1. **Migration** - Create all setup tables with RLS
2. **Hooks** - Build useSetup* hooks for new tables  
3. **SetupPage** - Connect to database
4. **Auth Flow** - Add protected routes
5. **SafetyManagement** - Connect to real data
6. **DigitalCompliance** - Connect to real data
7. **InteractiveClosure** - Connect to real data
8. **RulesRegulations** - Connect or keep as static reference
9. **Testing** - Verify end-to-end flow

---

## Expected Outcome

After implementation:
- All setup configuration data persists in the database
- Users must authenticate before accessing the dashboard
- All components display real data from the database
- Zero hardcoded mock data in production components
- Sign out functionality returns users to landing page
