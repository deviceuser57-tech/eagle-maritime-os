# Architecture Repository Governance Document

## Purpose
This document establishes the governance model, policies, and operational procedures for managing the **Architecture Repository** of the Eagle Maritime Operating System (EMOS). It ensures that architectural artefacts are consistently created, versioned, stored, accessed, and retired, providing traceability, reliability, and compliance with TOGAF Phase C/D/G, ISO/IEC/IEEE 42010, and ISO 27001 control A.12.1.

## Scope
The governance framework applies to all architectural artefacts listed in the repository, including but not limited to:
- Architecture viewpoints (Vision, Business, Data, Application, Technology, Security, Event, Integration, etc.)
- Architecture Decision Records (ADRs)
- Traceability matrices
- Migration and change management artefacts
- Supporting templates, models, and diagrams
- Metadata files (catalogues, indexes, ownership records)

The scope covers the **entire lifecycle** of these artefacts: creation, review, versioning, publishing, access control, archival, and disposal.

## References
| Ref | Description |
|-----|-------------|
| `Architecture_Vision.md` | Provides the high‑level vision that drives repository organization and naming conventions. |
| `Technology_Architecture.md` | Describes the underlying platform on which the repository is hosted (Git, CI/CD). |
| `Architecture_Governance_Framework.md` | Defines overall governance structure; this document adds repository‑specific policies. |
| `TOGAF_Architecture_Artifacts.md` | Maps repository artefacts to TOGAF ADM phases, reinforcing Phase C (Technology) and Phase G (Implementation Governance). |
| `ISO_42010_Architecture_Description.md` | Aligns the repository with the ISO 42010 requirement for traceability of stakeholder concerns. |
| `Traceability_Matrix.md` | Demonstrates existing traceability links that must be maintained by the repository governance process. |
| `Architecture_Decision_Records.md` | ADR catalogue that is governed by the policies defined here. |

## Governance Model
### 1. Ownership & Roles
| Role | Responsibility |
|------|----------------|
| **Repository Owner** | Ultimate accountability for repository health, policy enforcement, and compliance reporting. |
| **Metadata Steward** | Maintains the metadata schema, ensures completeness of artefact descriptors, and updates the `Metadata_Catalog.md`. |
| **Architecture Review Board (ARB)** | Approves new artefact types, major restructures, and deprecation proposals. |
| **Document Author** | Creates or updates artefacts following the documented style and template guidelines. |
| **Configuration Manager** | Handles version control, branching strategy, and release tagging. |
| **Auditor** | Periodically verifies compliance with governance policies and produces audit reports. |

### 2. Policy Hierarchy
1. **Enterprise Architecture Policy** – Sets strategic direction (refer to `Architecture_Vision.md`).
2. **Repository Governance Policy** – This document; defines concrete rules for artefact management.
3. **Artefact‑Specific Guidelines** – Individual artefact templates (e.g., Security Architecture) that must reference this governance.

## Processes
### 2.1. Artefact Creation
1. **Initiate** – Author selects the appropriate template (e.g., `Security_Architecture.md`) and adds a draft in a feature branch.
2. **Metadata Population** – Fill the required fields in the front‑matter section (Title, Owner, TOGAF Phase, ISO Viewpoint, Related ADRs, Version).
3. **Peer Review** – Submit a Pull Request; at least two reviewers from the relevant domain approve.
4. **ARB Sign‑off** – For new artefact types or major structural changes, the ARB reviews and records the decision in an ADR.
5. **Merge & Tag** – Upon approval, merge to `main` and create a semantic version tag (e.g., `v1.3.0`).

### 2.2. Versioning & Change Control
- **Semantic Versioning** (`MAJOR.MINOR.PATCH`).
  - **MAJOR** – Breaking change to the artefact structure or purpose.
  - **MINOR** – Additive content (new sections, supplemental tables) without breaking existing references.
  - **PATCH** – Minor edits, typo corrections, or clarification.
- All version increments are recorded in the **Repository Change Log** (`Repository_Change_Log.md`).
- Deprecated artefacts are marked with a **Deprecation Notice** and a sunset date; a migration path must be provided.

### 2.3. Access Control
| Access Level | Description |
|--------------|-------------|
| **Read‑Only** | All team members can view artefacts via the Git repository or rendered portal. |
| **Contributor** | Can create and edit artefacts in feature branches; requires PR approval before merge. |
| **Maintainer** | Can merge PRs, create tags, and modify repository settings (Configuration Manager role). |
| **Admin** | Full administrative rights over the repository, including permission changes (Repository Owner). |

### 2.4. Metadata Schema
Each artefact must contain a YAML front‑matter block (example below) that captures essential governance attributes:
```yaml
---
Title: "Security Architecture"
Owner: "Security Lead"
Version: "v2.1.0"
TOGAF_Phase: "C, D"
ISO_Viewpoint: "Security Viewpoint"
Related_ADRs:
  - ADR‑S‑001
  - ADR‑S‑005
Tags:
  - security
  - architecture
  - zero-trust
---
```
The **Metadata Steward** maintains the master schema definition in `Metadata_Schema.md`.

### 2.5. Traceability Maintenance
- Every artefact must reference its **Traceability ID** (e.g., `T001‑SEC‑ARCH`) and be listed in the `Traceability_Matrix.md`.
- When an artefact is updated, the matrix entry is revised with the new version and change reason.

### 2.6. Review & Audit Cycle
| Frequency | Activity |
|-----------|----------|
| **Quarterly** | Repository health check – completeness of metadata, adherence to naming conventions, and version consistency. |
| **Annually** | Full compliance audit against TOGAF, ISO 42010, and ISO 27001. |
| **Ad‑hoc** | Spot checks triggered by high‑impact changes (e.g., security architecture amendment). |

Audit findings are recorded in `Repository_Audit_Report_<YYYY>.md` and fed back into the **Continuous Improvement** loop.

## Naming Conventions
- **File Naming**: `<Domain>_<Artifact>.md` (e.g., `Security_Architecture.md`).
- **Version Tags**: `v<MAJOR>.<MINOR>.<PATCH>` prefixed with the artefact name when necessary (e.g., `Security_Architecture_v2.1.0`).
- **Identifiers**: Unique IDs prefixed by domain (e.g., `SEC‑001`, `INT‑003`).

## Tables & Registers
### Repository Change Log (excerpt)
| Date | Artefact | Version | Change Type | Author | Summary |
|------|----------|---------|------------|--------|---------|
| 2026‑08‑07 | Security_Architecture.md | v2.1.0 | PATCH | Jane Doe | Added audit‑logging and incident‑response sections. |
| 2026‑08‑05 | Integration_Architecture.md | v1.3.0 | MINOR | John Smith | Added API‑gateway policy table. |
| 2026‑07‑30 | ADR_Catalog.md | v1.0.0 | MAJOR | Architecture Team | Initial ADR catalogue creation. |

### Deprecation Register (excerpt)
| Artefact | Deprecated Version | Sunset Date | Migration Path |
|----------|--------------------|-------------|----------------|
| Legacy_Integration.md | v1.0.0 | 2026‑12‑31 | Replace with `Integration_Architecture.md` (v1.3.0). |

## Related ADRs
- **ADR‑R‑001** – Adopt a centralized Architecture Repository with Git + Markdown. |
- **ADR‑R‑002** – Enforce semantic versioning for all architectural artefacts. |
- **ADR‑R‑003** – Introduce metadata front‑matter for traceability and governance.

## Related TOGAF ADM Phase
- **Phase C – Technology Architecture** – Repository stores the technology‑level artefacts.
- **Phase D – Opportunities & Solutions** – Governance ensures artefacts are ready for solution design.
- **Phase G – Implementation Governance** – This document provides the governance mechanisms required by Phase G.

## Related ISO/IEC/IEEE 42010 Viewpoint
- **Architecture Repository Viewpoint** – Captures the organisation, structure, and management of architectural information.

## Cross‑References
- `Architecture_Governance_Framework.md` – Overall governance structure and ARB responsibilities.
- `Traceability_Matrix.md` – Demonstrates existing links to findings and compliance requirements.
- `Architecture_Decision_Records.md` – ADRs are governed by the policies defined here.
- `Security_Architecture.md`, `Event_Architecture.md`, `Integration_Architecture.md` – Example artefacts that must comply with this governance model.

---
*Document generated on 2026‑08‑07.*
