# Eagle Maritime OS — Repository & As-Built Architecture

## 1. GitHub repository

The project is synced with:

- `**devicuser57-tech/eagle-maritime-os**` (branch `main`, status Connected)
-  Clone URL: `https://github.com/deviceuser57-tech/eagle-maritime-os.git`

Note: inside the build sandbox the Git remotes point to Lovable's internal mirror (`git.private.lovable-gcp.code.storage/8bb86506-...` and `s3://lovable-repositories/8bb86506-...`), which is why the GitHub URL is not visible from `git remote`. The GitHub link lives at the platform level and syncs both ways — your pushes to `main` land here, and Lovable's commits are pushed back.  
  
its important to update the project from github repo  
fetch the changes from the repo (clone and update the project here 

## 2. As-built architecture (current code state)  
Before starting with the below , you must to ensure that the project get all the updates from the repo first 

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