# Change Management Procedure Document

## Purpose
This document defines the formal change management process for the Eagle Maritime Operating System (EMOS) architecture. It establishes workflow, roles, approvals, impact assessment, and post‑implementation activities required to introduce, modify, or retire architectural artifacts in a controlled, auditable manner, ensuring compliance with TOGAF Phase G and ISO 27001 Change Management controls.

## Scope
The procedure applies to all architectural changes that affect any of the following artifacts or underlying platforms:
- Architecture viewpoints (e.g., Security, Event, Integration)
- Application and technology component specifications
- Service contracts, APIs, and data models
- Infrastructure and deployment configurations (Kubernetes, IAM, networking)
- Governance policies, ADRs, and repository metadata
- Supporting documentation (e.g., manuals, run‑books)

## References
| Ref | Description |
|-----|-------------|
| `Architecture_Governance_Framework.md` | Provides the overall governance structure and defines the Architecture Review Board (ARB). |
| `Traceability_Matrix.md` | Links each change request to the affected findings and compliance items. |
| `Architecture_Decision_Records.md` | Records ADRs that may be created or updated as part of a change. |
| `TOGAF_Architecture_Artifacts.md` | Maps change activities to TOGAF ADM Phase G (Implementation Governance). |
| `ISO_42010_Architecture_Description.md` | Aligns change management with ISO 42010 stakeholder‑concern handling. |
| `Security_Architecture.md` | Example of an artifact that may be subject to change. |

## Roles & Responsibilities
| Role | Responsibility |
|------|----------------|
| **Change Initiator** | Submits Change Request (CR) with description, rationale, and preliminary impact. |
| **Architecture Review Board (ARB)** | Reviews and approves/rejects CRs, ensures alignment with strategic objectives. |
| **Change Manager** | Coordinates workflow, schedules CAB meetings, tracks CR status, and maintains the Change Log. |
| **Subject Matter Expert (SME)** | Provides technical impact analysis, risk assessment, and mitigation recommendations. |
| **Configuration Manager** | Updates repository metadata, version numbers, and ensures artifact integrity. |
| **Quality Assurance (QA)** | Validates that the change meets acceptance criteria and updates test suites. |
| **Operations/SOC** | Reviews operational impact and updates monitoring/incident response procedures. |

## Change Request Workflow
1. **Create CR** – Initiator completes the `Change_Request_Form.md` (linked in the Change Log) and registers the request in the Change Management tool.
2. **Initial Triage** – Change Manager validates completeness, assigns a unique CR ID, and determines the change type (Standard, Normal, Emergency).
3. **Impact Assessment** – SME completes the **Impact Assessment Matrix** (see Table below) covering technical, security, business, and compliance dimensions.
4. **Risk Evaluation** – Populate the **Risk Register** (see `Risk_Management_Register.md`) with identified risks and mitigation actions.
5. **CAB Review** – Change Advisory Board (CAB) meeting reviews the CR, impact matrix, and risk register. Decision recorded as **Approved**, **Rejected**, or **Deferred**.
6. **Implementation Planning** – Approved changes receive a **Implementation Plan** (tasks, schedule, rollback steps) documented in `Implementation_Plan_<CR_ID>.md`.
7. **Execution** – Changes are applied to the designated environment (Dev → Test → Prod) following the plan.
8. **Verification** – QA verifies acceptance criteria; results logged in `Change_Verification_Report_<CR_ID>.md`.
9. **Post‑Implementation Review (PIR)** – Conducted after a 7‑day stabilization period; lessons learned captured.
10. **Documentation Update** – All affected artifacts (e.g., architecture views, ADRs) are updated. Traceability links added to `Traceability_Matrix.md`.
11. **Closure** – Change Manager updates the Change Log, marks CR as **Closed**, and archives related documents.

## Impact Assessment Matrix
| Impact Area | Description | Rating (Low/Med/High) |
|------------|-------------|-----------------------|
| **Technical** | Scope of code/configuration changes, regression risk. |
| **Security** | Potential impact on confidentiality, integrity, availability, compliance. |
| **Business** | Effect on operational processes, cost, service level agreements. |
| **Compliance** | Alignment with TOGAF, ISO 27001, IMO SOLAS, other regulatory requirements. |
| **Schedule** | Estimated effort and timeline, dependencies on other changes. |

## Change Types
| Type | Definition |
|------|------------|
| **Standard** | Pre‑approved, low‑risk changes with documented procedure (e.g., minor doc update). |
| **Normal** | Changes requiring full impact analysis and CAB approval (most architectural updates). |
| **Emergency** | Changes needed to address a critical outage or security incident; expedited CAB review (max 4 hours). |

## Change Log (Excerpt)
| CR ID | Title | Type | Status | Owner | Approval Date |
|-------|-------|------|--------|-------|----------------|
| CR‑001 | Update Security Controls for New Cloud Provider | Normal | Closed | Jane Doe | 2026‑07‑15 |
| CR‑002 | Add Event Taxonomy to Event Architecture | Standard | Open | John Smith | — |

## Documentation & Traceability
- Each change updates the **Traceability Matrix** with a link to the CR ID and affected findings (e.g., F007 – Security Architecture missing).
- Related ADRs are referenced (e.g., ADR‑S‑001 `Zero‑Trust Adoption` updated in CR‑001).
- TOGAF ADM Phase **G – Implementation Governance** is explicitly referenced for all change activities.
- ISO/IEC/IEEE 42010 **Concern** linking is maintained via the traceability entries.

## Governance Alignment
- **Governance Framework** (`Architecture_Governance_Framework.md`) mandates that all changes pass through this procedure.
- **Metrics & KPIs** – Change success rate, mean time to approve (MTTA), mean time to implement (MTTI), and post‑implementation defect rate are tracked in the Governance Dashboard.

## Related Documents
- `Architecture_Governance_Framework.md`
- `Security_Architecture.md`
- `Event_Architecture.md`
- `Integration_Architecture.md`
- `Risk_Management_Register.md`
- `Traceability_Matrix.md`
- `Architecture_Decision_Records.md`

---
*Document generated on 2026‑08‑07.*
