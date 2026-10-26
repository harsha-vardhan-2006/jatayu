# Requirement → Feature → Acceptance Test Traceability

**Status:** Provisional (requirements source is the provisional challenge; see
`docs/strategy/SELECTED_CHALLENGE_AND_RATIONALE.md`)
**Rule:** every feature row must point to at least one acceptance test, and every
acceptance test must point back to a requirement. Test IDs match
`docs/validation/ROUND_1_ACCEPTANCE_TESTS.md`.

## Traceability matrix

| Req ID | Requirement (provisional challenge) | Implemented as | Where | Acceptance test | Status |
|---|---|---|---|---|---|
| TR-01 | A clinician can review a patient's longitudinal history and timeline | Synthetic patient records with dated events served by the API | `prototype/src/store.js`, `GET /api/patients/:id/timeline` | AT-01 | Implemented |
| TR-02 | Access is scoped to the clinician's assigned patients | Assignment-based authorization on every patient route | `prototype/src/policy.js` | AT-02, AT-03 | Implemented |
| TR-03 | Roles differ: doctor, nurse, admin have different capabilities | Role model with explicit permission matrix | `prototype/src/policy.js` | AT-04, AT-05 | Implemented |
| TR-04 | An administrator's account management right must not imply clinical data access | Separation of `admin:*` privileges from `clinical:read` | `prototype/src/policy.js` | AT-06 | Implemented |
| TR-05 | Incoming vital signs carry timestamp, units, source and freshness | Observation schema enforced at ingestion | `prototype/src/vitals.js` | AT-07 | Implemented |
| TR-06 | Stale, implausible or misattributed observations are flagged, never silently accepted | Quality gate producing `STALE`, `IMPLAUSIBLE`, `PATIENT_MISMATCH` flags | `prototype/src/observations.js` | AT-08, AT-09, AT-10 | Implemented |
| TR-07 | Simulated vital updates reach the authorized dashboard in real time | Polling/SSE stream scoped to authorized viewers | `prototype/src/server.js` | AT-11 | Implemented |
| TR-08 | Clinical suggestions require clinician review before any recorded decision | `suggested → reviewed` state machine; no auto-accept path | `prototype/src/cds.js` | AT-12 | Implemented |
| TR-09 | AI-agent tool calls are checked at a server-side enforcement boundary | Agent Trust Layer authorizing every agent tool call | `prototype/src/agents.js` | AT-13 | Implemented |
| TR-10 | Unapproved agent actions are blocked and produce an audit record | Deny-by-default agent policy + append-only audit log | `prototype/src/agents.js`, `prototype/src/store.js` (audit log) | AT-14 | Implemented |
| TR-11 | Every security decision is logged with actor, action, target and reason | Audit event schema written for allow and deny outcomes | `prototype/src/store.js` (audit log), `prototype/src/server.js` | AT-15 | Implemented |
| TR-12 | Unauthorized cross-patient access is denied | Route-level patient isolation check | `prototype/src/policy.js` | AT-03 | Implemented |
| TR-13 | Clinical records are amended with provenance, not silently overwritten | Append-only amendment events | `prototype/src/store.js` | AT-16 | Implemented (prototype level) |
| TR-14 | Outbound transfer of patient data by an agent requires explicit grant | `egress` permission class in agent policy | `prototype/src/agents.js` | AT-17 | Implemented |
| TR-15 | Demo data must be unmistakably synthetic | Synthetic markers in every record + disclaimer banner | `prototype/src/store.js` (synthetic seeds), `docs/DEMO_GUIDE.md` | AT-18 | Implemented |

## Requirements not implemented in Round 1 (documented as planned)

| Req ID | Requirement | Why deferred | Where documented |
|---|---|---|---|
| TR-20 | HL7 FHIR export for authorized integration | No hospital system to integrate with; adapter documented only | `docs/architecture/INTEGRATION_AND_DEVICE_STRATEGY.md` |
| TR-21 | DICOM imaging pathway | No dataset or PACS; out of Round 1 scope | `docs/architecture/INTEGRATION_AND_DEVICE_STRATEGY.md` |
| TR-22 | Real device ingestion adapters | Requires hardware; simulation only | `docs/architecture/INTEGRATION_AND_DEVICE_STRATEGY.md` |
| TR-23 | Break-glass emergency access workflow | Design documented, not implemented | `docs/security/AUTHORIZATION_AND_AUDIT.md` |
| TR-24 | Clinical validation of CDS suggestions | Impossible without a clinical study | `docs/clinical/AI_VALIDATION_PLAN.md` |
