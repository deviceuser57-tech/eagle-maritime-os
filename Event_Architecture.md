# Event Architecture Document

## Purpose
This document defines the event‑driven architecture for the Eagle Maritime Operating System (EMOS). It establishes principles, taxonomy, lifecycle, contracts, and governance for all asynchronous communication across services, ensuring reliable, scalable, and observable event processing.

## Scope
The event architecture applies to any component that publishes, consumes, or processes events, including:
- Micro‑services and serverless functions
- Data ingestion pipelines
- Integration adapters (e.g., third‑party vessel telemetry)
- Front‑end and mobile clients interacting via WebSocket or push notifications
- Edge devices and IoT sensors transmitting telemetry

## References
| Ref | Description |
|-----|-------------|
| `Architecture_Vision.md` | Aligns event‑driven principles with enterprise digital transformation goals |
| `Technology_Architecture.md` | Provides underlying messaging infrastructure (Kafka, MQTT, EventBridge) |
| `Architecture_Governance_Framework.md` | Governs event standards, versioning, and compliance |
| `TOGAF_Architecture_Artifacts.md` | Maps event viewpoint to TOGAF ADM Phase **C (Technology)** and **D (Implementation)** |
| `ISO_42010_Architecture_Description.md` | Event viewpoint as a stakeholder concern and architectural view |
| `Traceability_Matrix.md` | Links event‑related findings to this document |

## Event‑Driven Principles
| # | Principle |
|---|-----------|
| 1 | **Loose Coupling** – Producers and consumers are decoupled via durable topics, enabling independent evolution. |
| 2 | **Schema Evolution** – Contracts are versioned; backward‑compatible changes are enforced. |
| 3 | **At‑Least‑Once Delivery** – Guarantees message processing while handling duplicates at the consumer level. |
| 4 | **Scalability** – Horizontal scaling of producers/consumers without impacting each other. |
| 5 | **Observability** – End‑to‑end tracing, metrics, and dead‑letter handling are mandated. |
| 6 | **Security** – All events are encrypted in‑flight and authenticated via service identities. |

## Event Taxonomy
| Category | Description |
|----------|-------------|
| **Domain Events** | Represent state changes within a bounded context (e.g., `VesselPositionUpdated`). |
| **Integration Events** | Bridge between external systems and EMOS (e.g., `ExternalWeatherAlert`). |
| **Command Events** | Intent to perform an action, often handled by a single consumer (e.g., `StartVoyageCommand`). |
| **Notification Events** | User‑facing notifications (e.g., `VoyageCompletedNotification`). |

## Event Lifecycle
1. **Production** – Event is created by a service, serialized using Avro schema, and published to a topic.
2. **Transport** – Durable log (Kafka) stores the event; replication factor ensures resilience.
3. **Consumption** – One or more consumer groups subscribe; offsets are committed after successful processing.
4. **Processing** – Idempotent handling, validation against schema, business logic execution.
5. **Archival** – Events older than retention period are moved to cold storage (S3) for auditability.
6. **Retirement** – Deprecated schemas are superseded; producers must migrate within defined deprecation window.

## Event Contracts & Schemas
- Schemas are stored centrally in **Confluent Schema Registry**.
- Each contract version follows **Semantic Versioning** (`MAJOR.MINOR.PATCH`).
- Compatibility rules: `BACKWARD` for producers, `FORWARD` for consumers.
- Example contract reference: `VesselPositionUpdated v1.2.0` (see `schemas/VesselPositionUpdated.avsc`).

## Producers & Consumers
| Role | Service(s) |
|------|-----------|
| **Producers** | `VesselTelemetryService`, `VoyagePlanningService`, `ExternalWeatherAdapter` |
| **Consumers** | `AnalyticsEngine`, `AlertingService`, `ComplianceMonitor`, `MobilePushGateway` |

## Topics & Queues
| Topic / Queue | Purpose | Retention | Partitioning |
|--------------|---------|-----------|--------------|
| `ems.vessel.position` | Vessel GPS updates | 30 days | Partitioned by vessel ID |
| `ems.voyage.events` | Lifecycle events of voyages | 90 days | Partitioned by voyage ID |
| `ems.external.weather` | Third‑party weather alerts | 7 days | Single partition |
| `ems.commands.*` | Command topics (e.g., `ems.commands.startVoyage`) | 2 days | Partitioned by command type |

## Ordering & Guarantees
- **Key‑based ordering** within a partition ensures deterministic processing per vessel or voyage.
- Global ordering is not required; cross‑partition ordering is handled via choreography patterns.

## Versioning & Schema Evolution
- **Major version** – breaking change; requires consumer migration plan.
- **Minor version** – additive fields; backward compatible.
- **Patch version** – non‑functional changes (metadata, documentation).
- Deprecation policy: 90‑day notice before removal; legacy consumers must migrate.

## Retry Strategy & Dead‑Letter Queue (DLQ)
- **Retry policy** – exponential back‑off with configurable max attempts (default 5).
- **DLQ** – `ems.dlq.<topic>` stores failed events for manual investigation.
- Monitoring alerts trigger when DLQ size exceeds threshold.

## Idempotency
- All consumers must implement idempotent processing using a **deduplication key** (e.g., event ID + source timestamp).
- State stores (Redis, DynamoDB) maintain processed IDs for the retention window.

## Event Governance
- **Event Registry** – Central catalog (`Event_Registry.md`) listing all events, owners, and lifecycle status.
- **Change Control** – New events require approval via the Architecture Review Board (see `Change_Management_Procedure.md`).
- **Compliance** – Events containing PII are flagged; encryption at rest is enforced.

## Event Traceability
- Each event links to related ADRs (e.g., ADR‑E‑003 `Adopt Kafka for Event Streaming`).
- Traceability matrix entries in `Traceability_Matrix.md` map findings (e.g., F008 – Event Architecture missing) to this document.
- TOGAF ADM Phase: **Phase C – Technology Architecture**, **Phase D – Opportunities & Solutions**.
- ISO/IEC/IEEE 42010 Viewpoint: **Event‑Driven Viewpoint**.

## Related Documents
- `Architecture_Vision.md`
- `Technology_Architecture.md`
- `Architecture_Governance_Framework.md`
- `ISO_42010_Architecture_Description.md`
- `Traceability_Matrix.md`

---
*Document generated on 2026‑08‑07.*
