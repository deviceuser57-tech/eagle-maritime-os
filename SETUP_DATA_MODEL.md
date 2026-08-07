<!--
Project Name   : Eagle Maritime OS
File Name      : SETUP_DATA_MODEL.md
Creation Date  : 2026-07-28 UTC
Created By     : AI Engineering Agent
Agent          : TRAE
Purpose        : Document the Platform Setup / Master Data tables, schema, relationships, RLS posture, and CRUD usage across the repository.
Last Modified  : 2026-07-28 UTC
Modified By    : AI Engineering Agent
Change Summary : Initial creation of the setup data model inventory based on repository-wide read-only analysis.
-->

# Eagle Maritime OS
## Platform Setup Data Model

**Evidence sources used**
- Supabase migrations in `supabase/migrations`
- Generated database types in `src/integrations/supabase/types.ts`
- CRUD hooks in `src/hooks`
- Setup registry UI in `src/components/SetupPage.tsx`
- Downstream consumers in vessel, audit, crew, certification, and regulation flows

---

## Table: `setup_companies`

### Purpose
Stores reusable company master data for owner, operator, technical manager, ISM manager, and DOC issuer records.

### Schema
| Column | Type | Nullable | Default | PK | FK | Enum Values |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Yes |  |  |
| `user_id` | `uuid` | No |  |  |  |  |
| `org_id` | `uuid` | Yes |  |  | `organizations.id` |  |
| `company_type` | `text` | No |  |  |  | `owner`, `operator`, `technical`, `ism`, `doc` |
| `name` | `text` | No |  |  |  |  |
| `contact_person` | `text` | Yes |  |  |  |  |
| `title` | `text` | Yes |  |  |  |  |
| `phone` | `text` | Yes |  |  |  |  |
| `email` | `text` | Yes |  |  |  |  |
| `address` | `text` | Yes |  |  |  |  |
| `remarks` | `text` | Yes |  |  |  |  |
| `created_at` | `timestamptz` | No | `now()` |  |  |  |
| `updated_at` | `timestamptz` | No | `now()` |  |  |  |

### Relationships
- References: `organizations(id)` via `org_id`
- Referenced by: `vessels.owner_company_id`, `vessels.operator_company_id`, `vessels.technical_manager_id`, `vessels.ism_manager_id`

### RLS
- RLS enabled
- Original policies were user-scoped: view/create/update/delete where `auth.uid() = user_id`
- Later multitenancy migrations add `org_id` and intend org-scoped access through `organization_members`
- Current intent is org-scoped; historical user-scoped policies may still coexist on some environments because the multitenancy migration drops policy names that do not match the original human-readable names

### Used By
- Direct CRUD: `src/hooks/useSetupCompanies.ts`
- Setup registry UI: `src/components/SetupPage.tsx`
- Downstream consumer: `src/components/VesselManagement.tsx`

---

## Table: `setup_crew_ranks`

### Purpose
Stores crew rank master data used to standardize rank names, departments, ordering, and officer classification.

### Schema
| Column | Type | Nullable | Default | PK | FK | Enum Values |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Yes |  |  |
| `user_id` | `uuid` | No |  |  |  |  |
| `org_id` | `uuid` | Yes |  |  | `organizations.id` |  |
| `rank_name` | `text` | No |  |  |  |  |
| `department` | `text` | Yes |  |  |  |  |
| `rank_order` | `integer` | Yes | `0` |  |  |  |
| `is_officer` | `boolean` | Yes | `false` |  |  |  |
| `created_at` | `timestamptz` | No | `now()` |  |  |  |
| `updated_at` | `timestamptz` | No | `now()` |  |  |  |

### Relationships
- References: `organizations(id)` via `org_id`
- Referenced by: no database foreign keys found in generated types

### RLS
- RLS enabled
- Original policies were user-scoped on `user_id`
- Current intended scope is org-scoped after `org_id` addition and multitenancy recovery

### Used By
- Direct CRUD: `src/hooks/useSetupCrewConfig.ts`
- Setup registry UI: `src/components/SetupPage.tsx`

---

## Table: `setup_nationalities`

### Purpose
Stores nationality master data for crew-related workflows.

### Schema
| Column | Type | Nullable | Default | PK | FK | Enum Values |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Yes |  |  |
| `user_id` | `uuid` | No |  |  |  |  |
| `org_id` | `uuid` | Yes |  |  | `organizations.id` |  |
| `country_name` | `text` | No |  |  |  |  |
| `country_code` | `text` | Yes |  |  |  |  |
| `created_at` | `timestamptz` | No | `now()` |  |  |  |
| `updated_at` | `timestamptz` | No | `now()` |  |  |  |

### Relationships
- References: `organizations(id)` via `org_id`
- Referenced by: no database foreign keys found in generated types

### RLS
- RLS enabled
- Original policies were user-scoped on `user_id`
- Current intended scope is org-scoped after multitenancy migrations

### Used By
- Direct CRUD: `src/hooks/useSetupCrewConfig.ts`
- Setup registry UI: `src/components/SetupPage.tsx`
- Downstream inconsistency: `src/components/CrewManagement.tsx` still uses free-text nationality input instead of this registry

---

## Table: `setup_contract_types`

### Purpose
Stores contract master data for crew engagement terms.

### Schema
| Column | Type | Nullable | Default | PK | FK | Enum Values |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Yes |  |  |
| `user_id` | `uuid` | No |  |  |  |  |
| `org_id` | `uuid` | Yes |  |  | `organizations.id` |  |
| `contract_name` | `text` | No |  |  |  |  |
| `duration_months` | `integer` | Yes |  |  |  |  |
| `description` | `text` | Yes |  |  |  |  |
| `created_at` | `timestamptz` | No | `now()` |  |  |  |
| `updated_at` | `timestamptz` | No | `now()` |  |  |  |

### Relationships
- References: `organizations(id)` via `org_id`
- Referenced by: no database foreign keys found in generated types

### RLS
- RLS enabled
- Original policies were user-scoped on `user_id`
- Current intended scope is org-scoped after multitenancy migrations

### Used By
- Direct CRUD: `src/hooks/useSetupCrewConfig.ts`
- Setup registry UI: `src/components/SetupPage.tsx`

---

## Table: `setup_currencies`

### Purpose
Stores currency master data for commercial, certification, and vessel-related values.

### Schema
| Column | Type | Nullable | Default | PK | FK | Enum Values |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Yes |  |  |
| `user_id` | `uuid` | No |  |  |  |  |
| `org_id` | `uuid` | Yes |  |  | `organizations.id` |  |
| `currency_code` | `text` | No |  |  |  |  |
| `currency_name` | `text` | No |  |  |  |  |
| `symbol` | `text` | Yes |  |  |  |  |
| `created_at` | `timestamptz` | No | `now()` |  |  |  |
| `updated_at` | `timestamptz` | No | `now()` |  |  |  |

### Relationships
- References: `organizations(id)` via `org_id`
- Referenced by: no database foreign keys found in generated types

### RLS
- RLS enabled
- Original policies were user-scoped on `user_id`
- Current intended scope is org-scoped after multitenancy migrations

### Used By
- Direct CRUD: `src/hooks/useSetupCrewConfig.ts`
- Setup registry UI: `src/components/SetupPage.tsx`
- Downstream inconsistency: `src/components/VesselsCertification.tsx` and `src/components/VesselManagement.tsx` still expose hardcoded currency options

---

## Table: `setup_audit_types`

### Purpose
Stores audit and inspection master data used by setup, audit planning/execution, and regulatory linkage.

### Schema
| Column | Type | Nullable | Default | PK | FK | Enum Values |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Yes |  |  |
| `user_id` | `uuid` | No |  |  |  |  |
| `org_id` | `uuid` | Yes |  |  | `organizations.id` |  |
| `audit_type_name` | `text` | No |  |  |  |  |
| `description` | `text` | Yes |  |  |  |  |
| `frequency_months` | `integer` | Yes |  |  |  |  |
| `is_external` | `boolean` | Yes | `false` |  |  |  |
| `created_at` | `timestamptz` | No | `now()` |  |  |  |
| `updated_at` | `timestamptz` | No | `now()` |  |  |  |

### Relationships
- References: `organizations(id)` via `org_id`
- Referenced by: `audit_regulations.audit_type_id`
- Indirect text lookup: `audits.audit_type` values are translated back to `setup_audit_types.id` in regulation logic

### RLS
- RLS enabled
- Original policies were user-scoped on `user_id`
- Current intended scope is org-scoped after multitenancy migrations

### Used By
- Direct CRUD: `src/hooks/useSetupAuditConfig.ts`
- Additional direct select: `src/hooks/useRegulations.ts`
- Setup registry UI: `src/components/SetupPage.tsx`
- Downstream consumers: `src/components/RegulatoryManager.tsx`
- Downstream inconsistency: `src/components/AuditPlan.tsx` and `src/components/AuditExecution.tsx` still use hardcoded audit-type options

---

## Table: `setup_finding_types`

### Purpose
Stores audit finding classification master data, including severity and compliance scoring defaults.

### Schema
| Column | Type | Nullable | Default | PK | FK | Enum Values |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Yes |  |  |
| `user_id` | `uuid` | No |  |  |  |  |
| `org_id` | `uuid` | Yes |  |  | `organizations.id` |  |
| `finding_type_name` | `text` | No |  |  |  |  |
| `severity` | `text` | Yes | `'minor'` |  |  | `minor`, `major`, `critical` |
| `description` | `text` | Yes |  |  |  |  |
| `default_deduction` | `numeric` | Yes | `10` |  |  |  |
| `created_at` | `timestamptz` | No | `now()` |  |  |  |
| `updated_at` | `timestamptz` | No | `now()` |  |  |  |

### Relationships
- References: `organizations(id)` via `org_id`
- Referenced by: no database foreign keys found in generated types

### RLS
- RLS enabled
- Original policies were user-scoped on `user_id`
- Current intended scope is org-scoped after multitenancy migrations

### Used By
- Direct CRUD: `src/hooks/useSetupAuditConfig.ts`
- Setup registry UI: `src/components/SetupPage.tsx`
- Schema drift note: `default_deduction` exists in migration `20260217230000_compliance_hardening.sql` but is absent from generated Supabase types and the local `FindingType` interface

---

## Table: `setup_finding_statuses`

### Purpose
Stores finding lifecycle status master data with ordering and display metadata.

### Schema
| Column | Type | Nullable | Default | PK | FK | Enum Values |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Yes |  |  |
| `user_id` | `uuid` | No |  |  |  |  |
| `org_id` | `uuid` | Yes |  |  | `organizations.id` |  |
| `status_name` | `text` | No |  |  |  |  |
| `status_order` | `integer` | Yes | `0` |  |  |  |
| `is_closed` | `boolean` | Yes | `false` |  |  |  |
| `color` | `text` | Yes |  |  |  |  |
| `created_at` | `timestamptz` | No | `now()` |  |  |  |
| `updated_at` | `timestamptz` | No | `now()` |  |  |  |

### Relationships
- References: `organizations(id)` via `org_id`
- Referenced by: no database foreign keys found in generated types

### RLS
- RLS enabled
- Original policies were user-scoped on `user_id`
- Current intended scope is org-scoped after multitenancy migrations

### Used By
- Direct CRUD: `src/hooks/useSetupAuditConfig.ts`
- Setup registry UI: `src/components/SetupPage.tsx`

---

## Table: `setup_root_causes`

### Purpose
Stores reusable root-cause master data for audit and corrective-action analysis.

### Schema
| Column | Type | Nullable | Default | PK | FK | Enum Values |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Yes |  |  |
| `user_id` | `uuid` | No |  |  |  |  |
| `org_id` | `uuid` | Yes |  |  | `organizations.id` |  |
| `cause_name` | `text` | No |  |  |  |  |
| `category` | `text` | Yes |  |  |  |  |
| `description` | `text` | Yes |  |  |  |  |
| `created_at` | `timestamptz` | No | `now()` |  |  |  |
| `updated_at` | `timestamptz` | No | `now()` |  |  |  |

### Relationships
- References: `organizations(id)` via `org_id`
- Referenced by: no database foreign keys found in generated types

### RLS
- RLS enabled
- Original policies were user-scoped on `user_id`
- Current intended scope is org-scoped after multitenancy migrations

### Used By
- Direct CRUD: `src/hooks/useSetupAuditConfig.ts`
- Setup registry UI: `src/components/SetupPage.tsx`

---

## Table: `setup_classification_societies`

### Purpose
Stores classification society master data used by vessel setup and vessel management.

### Schema
| Column | Type | Nullable | Default | PK | FK | Enum Values |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Yes |  |  |
| `user_id` | `uuid` | No |  |  |  |  |
| `org_id` | `uuid` | Yes |  |  | `organizations.id` |  |
| `society_name` | `text` | No |  |  |  |  |
| `abbreviation` | `text` | Yes |  |  |  |  |
| `website` | `text` | Yes |  |  |  |  |
| `created_at` | `timestamptz` | No | `now()` |  |  |  |
| `updated_at` | `timestamptz` | No | `now()` |  |  |  |

### Relationships
- References: `organizations(id)` via `org_id`
- Referenced by: no database foreign keys found in generated types for setup tables; consumed by vessel management UI

### RLS
- RLS enabled
- Original policies were user-scoped on `user_id`
- Current intended scope is org-scoped after multitenancy migrations

### Used By
- Direct CRUD: `src/hooks/useSetupClassification.ts`
- Setup registry UI: `src/components/SetupPage.tsx`
- Downstream consumer: `src/components/VesselManagement.tsx`

---

## Table: `setup_flag_states`

### Purpose
Stores flag-state master data with registry code and risk classification.

### Schema
| Column | Type | Nullable | Default | PK | FK | Enum Values |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Yes |  |  |
| `user_id` | `uuid` | No |  |  |  |  |
| `org_id` | `uuid` | Yes |  |  | `organizations.id` |  |
| `flag_name` | `text` | No |  |  |  |  |
| `flag_code` | `text` | Yes |  |  |  |  |
| `risk_level` | `text` | Yes | `'standard'` |  |  | `low`, `standard`, `high` |
| `created_at` | `timestamptz` | No | `now()` |  |  |  |
| `updated_at` | `timestamptz` | No | `now()` |  |  |  |

### Relationships
- References: `organizations(id)` via `org_id`
- Referenced by: no database foreign keys found in generated types for setup tables; consumed by vessel management UI

### RLS
- RLS enabled
- Original policies were user-scoped on `user_id`
- Current intended scope is org-scoped after multitenancy migrations

### Used By
- Direct CRUD: `src/hooks/useSetupClassification.ts`
- Setup registry UI: `src/components/SetupPage.tsx`
- Downstream consumer: `src/components/VesselManagement.tsx`

---

## Table: `setup_certificate_types`

### Purpose
Stores certificate master data used by setup, regulatory intelligence, and compliance-matrix logic.

### Schema
| Column | Type | Nullable | Default | PK | FK | Enum Values |
| --- | --- | --- | --- | --- | --- | --- |
| `id` | `uuid` | No | `gen_random_uuid()` | Yes |  |  |
| `user_id` | `uuid` | No |  |  |  |  |
| `org_id` | `uuid` | Yes |  |  | `organizations.id` |  |
| `certificate_category` | `text` | No |  |  |  | `statutory`, `class`, `crew`, `other` |
| `certificate_name` | `text` | No |  |  |  |  |
| `issuing_authority` | `text` | Yes |  |  |  |  |
| `validity_months` | `integer` | Yes |  |  |  |  |
| `is_mandatory` | `boolean` | Yes | `true` |  |  |  |
| `created_at` | `timestamptz` | No | `now()` |  |  |  |
| `updated_at` | `timestamptz` | No | `now()` |  |  |  |

### Relationships
- References: `organizations(id)` via `org_id`
- Referenced by: `certificate_regulations.certificate_type_id`, `regulatory_matrix.certificate_type_id`

### RLS
- RLS enabled
- Original policies were user-scoped on `user_id`
- Current intended scope is org-scoped after multitenancy migrations

### Used By
- Direct CRUD: `src/hooks/useSetupCertificates.ts`
- Setup registry UI: `src/components/SetupPage.tsx`
- Downstream consumers: `src/components/RegulatoryManager.tsx`
- Downstream inconsistencies:
  - `src/components/SetupPage.tsx` exposes only `statutory` and `crew` categories, not `class` or `other`
  - `src/components/VesselsCertification.tsx` still uses hardcoded certificate classification options

---

## Summary

### Total Setup Tables Found
- `12`

### Missing TypeScript Interfaces
- No setup table is completely missing a TypeScript interface
- Incomplete interfaces were found:
  - `src/hooks/useSetupAuditConfig.ts` `FindingType` omits `default_deduction`
  - `src/hooks/useSetupAuditConfig.ts` setup interfaces omit `org_id`
  - `src/hooks/useSetupCrewConfig.ts` setup interfaces omit `org_id`
  - `src/hooks/useSetupClassification.ts` setup interfaces omit `org_id`

### Missing Hooks
- None for the 12 setup tables

### Missing UI Components
- No setup table is missing a CRUD surface in the main setup module
- `setup_certificate_types` is only partially surfaced in `src/components/SetupPage.tsx`; no setup cards exist for `class` and `other` categories

### Inconsistencies Detected
- The multitenancy migration sequence intends to replace user-scoped policies with `Org-scoped access`, but the first drop step does not match the original policy names; this creates RLS drift risk across environments
- `setup_finding_types.default_deduction` exists in migration history but is missing from generated Supabase types and local hook interfaces
- Registry-backed master data is bypassed by hardcoded or free-text UI in:
  - `src/components/CrewManagement.tsx` for nationality
  - `src/components/AuditPlan.tsx` for audit types
  - `src/components/AuditExecution.tsx` for audit types
  - `src/components/VesselsCertification.tsx` for certificate types and currencies
