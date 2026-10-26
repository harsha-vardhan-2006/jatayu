# System Architecture — MedIntel Nexus

**Status:** Design document for Round 1 · v0.9 · 2026-10-27
**Pattern:** modular monolith — chosen because Round 1 has no scale or team-size evidence
justifying microservices; internal module boundaries keep a later split possible.

---

## 1. Context (C4 level 1)

```mermaid
flowchart LR
    subgraph Hospital
        D[Doctor browser]
        N[Nurse browser]
        A[Admin console]
    end
    subgraph MedIntelNexus["MedIntel Nexus (modular monolith)"]
        API[API + policy engine + audit]
        UI[Web UI]
        API --- UI
    end
    AG[AI agent runtime]
    DEV[Device / monitor adapters<br/>simulated in Round 1]
    HIS[Hospital systems (EHR/PACS)<br/>not connected in Round 1]

    D --> UI
    N --> UI
    A --> UI
    AG -->|tool calls| API
    DEV -->|observations| API
    API -.->|FHIR read adapter (planned)| HIS
```

Actors and trust levels:

| Component | Trust level |
|---|---|
| Browser clients | Untrusted — all input validated server-side |
| Policy engine + audit writer | Trusted computing base — smallest possible surface |
| AI agent runtime | **Untrusted caller**, same as a hostile client |
| Device adapters | Semi-trusted — data validated at ingestion regardless |
| Hospital systems | Not connected in Round 1 |

## 2. Module decomposition

| Module | Responsibility | Must not do |
|---|---|---|
| `auth` | Authenticate, issue session bound to role + assignments | Make authorization decisions |
| `policy` | Authorize `(principal, action, resource, context)`; single decision point | Store clinical data |
| `patients` | Records, timeline, amendments with provenance | Grant permissions |
| `observations` | Ingest, validate, flag quality, serve freshness | Present unqualified data as current |
| `cds` | Generate suggestions with evidence links | Transition to "accepted" (human only) |
| `agents` | Register agents, hold tool policy, enforce scope + egress | Self-grant permissions |
| `audit` | Append-only record of every security decision | Update or delete rows |
| `ui` | Render, hide unavailable actions for usability | Enforce access |

## 3. Data stores

| Store | Contents | Round 1 implementation |
|---|---|---|
| Primary relational DB | Users, assignments, patients, timeline, observations, CDS decisions | SQLite (file) for zero-install demo; PostgreSQL DDL-compatible schema for production |
| Audit log | Append-only security decisions | Same DB, append-only table + code path guard |
| Stream channel | Authorized live observation updates | Server-Sent Events (or polling fallback) scoped per authorized viewer |

No data leaves the process in Round 1: there is no external API call, no telemetry, no
cloud dependency.

## 4. Request lifecycle

1. Client presents session token → `auth` resolves principal (role, assignments, dept).
2. Route handler declares required action + resource → `policy.decide(...)`.
3. Deny → 403 + audit entry (`deny`, reason code) and nothing is read or written.
4. Allow → audit entry (`allow`) → module executes the operation.
5. `ui` never receives data the principal could not fetch directly from the API.

**Invariant:** authorization runs inside the API process, before storage access, for every
protected route — including agent-originated calls. UI-level hiding is not a control.

## 5. Quality-gated observation path

```
adapter (simulated) → schema check → unit check → freshness check
                    → plausibility check → patient-correlation check
                    → persist with verdict → notify authorized viewers
```
Any failed check **persists the observation with a flag** (or quarantines it for patient
mismatch) — bad data is preserved as evidence, never silently dropped, never presented as
valid. Details: `docs/clinical/SENSOR_DATA_QUALITY.md`.

## 6. Deployment

| Aspect | Round 1 | Later stages |
|---|---|---|
| Topology | Single Node.js process on localhost | Containerised service behind HTTPS reverse proxy |
| DB | SQLite file | Managed PostgreSQL |
| Sessions | Signed in-memory/session store | Server-side sessions or OIDC against hospital IdP |
| Real-time | SSE | WebSocket or message broker if scale requires |
| Secrets | None required to run | Environment-injected, never in repo (`.gitignore` enforces) |

## 7. Scaling and evolution notes

- Modules communicate through narrow interfaces, so `observations` can move to a separate
  ingest service, and `cds` can move to a GPU-bound inference service, without touching
  the policy boundary.
- If the audit table becomes hot, partition by time — append-only semantics are preserved.
- Microservices are explicitly **not** introduced until a measured need exists.

## 8. Related documents

- Data flow & trust boundaries: `docs/architecture/DATA_FLOW_AND_TRUST_BOUNDARIES.md`
- Roles and patient access: `docs/architecture/ROLE_AND_PATIENT_ACCESS_MODEL.md`
- Integration & devices: `docs/architecture/INTEGRATION_AND_DEVICE_STRATEGY.md`
- Prototype mapping: `prototype/` (source), `docs/DEMO_GUIDE.md` (run instructions)
