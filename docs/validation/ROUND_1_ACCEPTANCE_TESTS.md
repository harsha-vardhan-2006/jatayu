# Round 1 Acceptance Tests — MedIntel Nexus

**Status:** EXECUTED — results below are real outputs of the commands shown
**Run date:** 2026-10-27
**Environment:** Windows 10 (Git Bash), Node.js v24.19.0, no third-party dependencies

---

## 1. How to reproduce

```bash
cd prototype
npm test          # = node --test "test/*.test.js"
```

## 2. Actual result summary (recorded from the run)

```
ℹ tests 25
ℹ suites 0
ℹ pass 25
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms ~930
```

**25 of 25 tests passed, 0 failed.** No tests were skipped, skipped-over, or weakened to
make the suite green. Additional manual verification (live HTTP against a running server)
is recorded in §5.

## 3. Test catalogue

Suffixed tests (e.g. AT-07b) are sub-checks of the same requirement.

| ID | Requirement | What the test does | Result |
|---|---|---|---|
| AT-01 | TR-01/TR-02 | Assigned doctor `GET /api/patients/SYN-P-0042/timeline` → 200 with entries, synthetic marker | ✅ PASS |
| AT-02 | TR-02 | Matching `allow` audit row exists with actor, resource, reason, requestId | ✅ PASS |
| AT-03 | TR-03/TR-12 | Doctor reads unassigned `SYN-P-0044` → 403 `no_patient_assignment` + deny audit row | ✅ PASS |
| AT-04 | TR-03 | Nurse writes an observation → 201, audit row attributed to `U-NUR-01` (role nurse) | ✅ PASS |
| AT-05 | TR-04 (adjacent) | Nurse attempts `record.amend` → 403 `permission_not_granted` (cannot modify doctor-owned records) | ✅ PASS |
| AT-06 | TR-04 | Admin reads clinical timeline → 403 `admin_clinical_separation`; admin patient list is empty | ✅ PASS |
| AT-07 | TR-05 | Observation carries patientId, device, metric, value, unit, observedAt, receivedAt, verdict, synthetic flag, threshold provenance | ✅ PASS |
| AT-07b | TR-05 | Missing fields → `INVALID`; wrong unit → `UNIT_MISMATCH` | ✅ PASS |
| AT-08 | TR-06 | Observation older than the freshness window → verdict `STALE`; device time ≠ ingest time | ✅ PASS |
| AT-09 | TR-06 | Value outside demo bounds → verdict `IMPLAUSIBLE` | ✅ PASS |
| AT-10 | TR-06 | `correlationId` ≠ `patientId` → verdict `PATIENT_MISMATCH`, quarantined, absent from patient view | ✅ PASS |
| AT-11 | TR-07 | Admin refused the stream (403); assigned doctor receives SSE `connected` then a live observation pushed by a nurse write | ✅ PASS |
| AT-11b | TR-11 | Every audit row has actor.type, action, decision (allow/deny), reason, timestamp, synthetic flag | ✅ PASS |
| AT-12 | TR-08 | Suggestion starts `suggested` with disclaimer + evidence; nurse cannot decide (403); doctor records decision → `reviewed`; second decision → 400 `already_finalised` | ✅ PASS |
| AT-12b | TR-04/TR-08 | Admin cannot record clinical decisions → 403 `admin_clinical_separation` | ✅ PASS |
| AT-12c | TR-03 | Doctor cannot request suggestions for an unassigned patient → 403 | ✅ PASS |
| AT-13 | TR-09 | Agent with a grant reads the granted patient's timeline (200); agent `cds.decide` → 403 `deny_list` | ✅ PASS |
| AT-13b | TR-09 | Unregistered agent identity → 403 `agent_not_registered` | ✅ PASS |
| AT-14 | TR-10 | Agent cross-patient read → 403 `patient_not_in_grant`; unknown tool → 403 `tool_not_in_policy`; deny audit row present | ✅ PASS |
| AT-14b | TR-10 | Mismatched agent identity header → 401 before evaluation | ✅ PASS |
| AT-15 | TR-11 | All agent decisions (allow and deny) logged; `/api/audit` readable by admin, 403 for doctor | ✅ PASS |
| AT-16 | TR-13 | Amendment creates version+1 with author, reason and `previousVersion` text preserved; audited | ✅ PASS |
| AT-17 | TR-14 | Agent `egress.export` without a grant → 403 `egress_not_granted` + deny audit row | ✅ PASS |
| AT-18 | TR-15 | Patients, timeline, suggestions and every audit row are marked synthetic; suggestion disclaimer matched | ✅ PASS |
| sanity | — | Unauthenticated request → 401 `authentication_required` | ✅ PASS |

**Coverage vs. traceability:** every row in
`docs/strategy/REQUIREMENT_TO_FEATURE_TRACEABILITY.md` marked "Implemented" maps to at
least one passing test above. Requirements marked deferred (TR-20…TR-24) have **no tests
and no claims**.

## 4. What these tests do NOT prove

- They prove control behaviour on synthetic data, **not** clinical validity.
- They are functional acceptance tests — not a security audit, not a load test, not a
  penetration test.
- They do not exercise real devices, real FHIR endpoints, or real identities (none exist).

## 5. Manual live-server verification (also executed)

```bash
PORT=4199 node src/server.js
# login as doctor-demo -> token issued (36 chars)
curl /api/patients/SYN-P-0042/timeline  -> 200, synthetic timeline returned
curl /api/patients/SYN-P-0044/timeline  -> 403 {"error":"forbidden","reason":"no_patient_assignment"}
curl POST /api/agents/SYN-AGENT-01/invoke {"tool":"egress.export",...}
                                          -> 403 {"denied":true,"reason":"egress_not_granted"}
```

Observed outcomes match the expected values exactly. The server was stopped after the
check.
