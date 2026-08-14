# Integration Architecture Document

## Purpose
This document defines the integration architecture for the Eagle Maritime Operating System (EMOS). It establishes the standards, patterns, protocols, and governance required to enable reliable, secure, and performant interaction between internal services, external partners, and third‑party systems.

## Scope
The integration architecture covers all points of interaction, including:
- Service‑to‑service APIs within EMOS
- External system adapters (e.g., port authority, weather providers)
- API gateway exposure for external consumers
- Message‑based integration using the Event Bus
- Data exchange formats and contract management
- Service discovery and routing mechanisms

## References
| Ref | Description |
|-----|-------------|
| `Architecture_Vision.md` | Aligns integration goals with enterprise digital strategy |
| `Technology_Architecture.md` | Underlying infrastructure (Kubernetes, Service Mesh, API Gateway) that hosts integration services |
| `Architecture_Governance_Framework.md` | Governance processes for integration standards and versioning |
| `TOGAF_Architecture_Artifacts.md` | Maps integration viewpoint to TOGAF ADM Phase **C (Technology)** and **D (Implementation)** |
| `ISO_42010_Architecture_Description.md` | Integration viewpoint as a stakeholder concern and architectural view |
| `Event_Architecture.md` | Provides the asynchronous messaging backbone used for integration |
| `Traceability_Matrix.md` | Links integration‑related findings to this document |

## Integration Principles
| # | Principle |
|---|-----------|
| 1 | **Loose Coupling** – Services communicate through well‑defined contracts, not direct code dependencies. |
| 2 | **Standardization** – Uniform use of OpenAPI, gRPC, and Avro schemas across all interfaces. |
| 3 | **Discoverability** – Services are registered in a service registry and discoverable via DNS‑based naming. |
| 4 | **Security by Design** – Mutual TLS, OAuth 2.0, and API keys protect all integration points. |
| 5 | **Observability** – Centralized tracing, metrics, and logging for every request and message. |
| 6 | **Policy‑Driven Governance** – Integration policies enforced through an API gateway and service mesh. |

## Integration Styles Catalogue
| Style | Description | Typical Use Cases |
|-------|-------------|-------------------|
| **Synchronous REST/HTTP** | Request‑response over HTTPS using OpenAPI contracts. | CRUD operations, real‑time queries. |
| **gRPC** | Binary protocol with protobuf contracts, low latency. | High‑performance internal service calls. |
| **GraphQL** | Flexible query language with a single endpoint. | Client‑driven data fetching for UI services. |
| **Message‑Based (Pub/Sub)** | Asynchronous event publishing to Kafka or EventBridge. | Event propagation, decoupled workflows. |
| **File Transfer (SFTP/FTPS)** | Secure bulk data exchange. | Legacy system batch imports/exports. |
| **Enterprise Service Bus (ESB)** | Orchestration and transformation of heterogeneous protocols. | Legacy integration, protocol mediation. |

## API Design & Contract Management
- **Specification** – All APIs are described using OpenAPI 3.1 (REST) or protobuf (gRPC). Files are stored in `api-specs/` repository.
- **Versioning** – Semantic versioning; major versions indicate breaking changes and require Architecture Review Board approval.
- **Lifecycle** – Deprecation policy: 90‑day notice before removal; consumers must migrate.
- **Testing** – Contract tests executed in CI pipeline using **Pact** for consumer‑driven contracts.

## API Gateway & Service Mesh
- **Gateway** – **AWS API Gateway** (or Kong) provides external exposure, request validation, rate limiting, and authentication.
- **Service Mesh** – **Istio** enforces mutual TLS, traffic routing, and policy enforcement between internal services.
- **Service Discovery** – **Consul** registers services; DNS and Envoy sidecars resolve endpoints.

## Security Controls
| Layer | Control |
|-------|---------|
| **Transport** | Mutual TLS (mTLS) for all service‑to‑service traffic |
| **Authentication** | OAuth 2.0 client‑credentials flow for API calls |
| **Authorization** | Policy‑based access (OPA) with fine‑grained scopes |
| **Data Protection** | Payload encryption for sensitive messages (AES‑256‑GCM) |
| **Rate Limiting** | API gateway throttling per consumer tier |
| **Audit Logging** | Centralized request logs stored in ELK stack |

## Error Handling & Resilience
- **Retry Policies** – Exponential back‑off with jitter for transient failures.
- **Circuit Breaker** – Istio‑managed circuit breaking to isolate failing services.
- **Fallbacks** – Default responses or cached data when downstream services are unavailable.
- **Dead‑Letter Channels** – Separate queues for messages that cannot be processed after retries.

## Governance & Compliance
- **Integration Registry** – `Integration_Registry.md` lists all APIs, owners, versions, and lifecycle status.
- **Change Control** – New or modified integrations must pass the **Change Management Procedure** (see `Change_Management_Procedure.md`).
- **Compliance Mapping** – Aligns with ISO 27001 (A.12.1 Secure Development), NIST 800‑53 (SC‑8 Transmission Confidentiality), and IMO SOLAS (Electronic Data Exchange).

## Traceability
- Each integration artifact is linked to relevant ADRs (e.g., ADR‑I‑002 `Adopt Istio Service Mesh`).
- Findings in `Traceability_Matrix.md` (e.g., F009 – Integration Architecture missing) reference this document.
- TOGAF ADM Phase: **Phase C – Technology Architecture**, **Phase D – Opportunities & Solutions**.
- ISO/IEC/IEEE 42010 Viewpoint: **Integration Viewpoint**.

## Related Documents
- `Architecture_Vision.md`
- `Technology_Architecture.md`
- `Architecture_Governance_Framework.md`
- `Event_Architecture.md`
- `ISO_42010_Architecture_Description.md`
- `Traceability_Matrix.md`

---
*Document generated on 2026‑08‑07.*
