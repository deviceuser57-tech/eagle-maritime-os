# Eagle Maritime OS — Repository & As-Built Architecture

## 1. GitHub repository

This project is **not connected to any GitHub repository**. The only Git remotes configured are Lovable's internal storage:

- `origin` → `git.private.lovable-gcp.code.storage/8bb86506-1849-4a48-80a9-8c84c30bfcbf.git`
- `secondary` → `s3://lovable-repositories/8bb86506-1849-4a48-80a9-8c84c30bfcbf.git`

Both point to the Lovable project ID `8bb86506-1849-4a48-80a9-8c84c30bfcbf`, not to github.com. Earlier "changes pushed from GitHub" arrived through a sync that is no longer (or was never) reflected as a GitHub remote here. To get a real GitHub repo: chat Plus (+) menu → GitHub → Connect project.

## 2. As-built architecture (current code state)

```text
CLIENTS
  Browser user                         AI agents (Claude / ChatGPT)
      |                                            |
      v                                            v
FRONTEND (React 18 + Vite 5 + TS + Tailwind + shadcn)      MCP LAYER
  App.tsx router                                    src/lib/mcp/index.ts
    / .............. Index.tsx (app shell)            OAuth-protected, 7 tools:
    /verify ........ PublicVerify                       fleet_compliance_summary
    /.lovable/oauth/consent .. OAuthConsent              list_vessels
    * .............. NotFound                            get_vessel_profile
  AuthContext + AuthPage (JWT session)                   list_expiring_certificates
  Sidebar + UniversalSearch                              list_audit_findings
  37 feature components:                                 list_incidents
    Dashboard, Reports, SIMDashboard, CIIDashboard       report_incident
    VesselManagement, VesselsCertification, DigitalTwin
    AuditPlan/Execution/Findings, CorrectiveAction, InteractiveClosure, AuditorManagement
    CrewManagement, SafetyManagement, Incidents, Maintenance
    RegulatoryManager, RulesRegulations, PredictiveCompliance, DigitalCompliance
    Projects, Operations, InsuranceClaims, Communications, MotionRiskAnalyzer
    Organization, SetupPage, IntegrationSettings, EnterpriseAuditLog, HelpCenter, AIAssistant
  27 data hooks + TanStack Query  ->  supabase-js client
                    |                                    |
                    v                                    v
LOVABLE CLOUD (Supabase)
  Auth: JWT sessions + OAuth 2.1 issuer (used by MCP consent)
  Postgres: org-scoped domain tables + setup_* reference registries
  Security: RLS on every table, fn_is_org_admin, SECURITY DEFINER RPCs,
            GraphQL endpoint disabled for anon/authenticated
  Storage buckets (evidence/images)
  Edge functions: analyze-image | erp-adapter | mcp
                    |               |            |
                    v               v            v
EXTERNAL:   Lovable AI Gateway   ERP / class endpoints   Agent clients
```

### Key characteristics
- Single-page app; all modules render inside `Index.tsx` via sidebar state, not separate routes.
- Multi-tenancy: every query is organization-scoped; `resolveOrgId` enforces the same for MCP tools.
- MCP tools run under the signed-in user's RLS — no service-role bypass.
- Public surface: only `/verify` (certificate QR verification) and the marketing FrontPage.

## 3. Optional next step
If you want this as a rendered diagram file (Mermaid `.mmd` artifact you can download or embed in the As-Built document), approve this plan and I will generate it in build mode.
