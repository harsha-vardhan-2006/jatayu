# Demo Scenarios — MedIntel Nexus Round 1

**Two scripted walkthroughs, ~5 minutes each.** Both run against the local prototype
(`docs/DEMO_GUIDE.md`). Everything shown is synthetic.

If a reviewer cannot run the demo, the equivalent automated coverage is the test suite —
each step names the test that proves it.

---

## Scenario A — Clinician path: quality-flagged data under supervision

**Story:** a ward doctor reviews an assigned patient whose bedside monitor is behaving
badly.

| Step | Action | Expected visible outcome | Proof |
|---|---|---|---|
| A1 | Log in as `doctor-demo` | Token issued; `/api/me` lists SYN-P-0042, SYN-P-0043 | AT-01 |
| A2 | Open `SYN-P-0042` timeline | Timeline with `synthetic: true` marker on every surface | AT-18 |
| A3 | Nurse submits a fresh observation (`nurse-demo`) | 201, verdict `OK` | AT-04 |
| A4 | Submit an observation with `observedAt` 10 minutes old | Verdict **`STALE`** with device time ≠ ingest time | AT-08 |
| A5 | Submit `heart_rate: 400` | Verdict **`IMPLAUSIBLE`** | AT-09 |
| A6 | Submit an observation with the wrong `correlationId` | Verdict **`PATIENT_MISMATCH`**, quarantined, not shown in the patient's vitals | AT-10 |
| A7 | Request suggestions for the patient | Suggestion returned in state `suggested` with disclaimer and evidence links | AT-12 |
| A8 | Try to record a decision as the **nurse** | 403 `permission_not_granted` | AT-12 |
| A9 | Record `accepted_with_modifications` as the **doctor** | State → `reviewed`, decision carries doctor identity + rationale | AT-12 |
| A10 | Try to change the decision | 400 `already_finalised` — no silent overwrite of a clinical decision | AT-12 |
| A11 | Admin views the audit log | Full allow/deny trail visible to admin only | AT-15 |

**Talking point for judges:** step A6 is the one that separates a dashboard from a safety
tool — the system refuses to let a wrong-patient value look like a normal reading.

---

## Scenario B — Trust path: the Agent Trust Layer blocks and proves it

**Story:** a ward-summary AI agent starts inside its grant and then overreaches — twice.

| Step | Action | Expected visible outcome | Proof |
|---|---|---|---|
| B1 | Agent invokes `patient.timeline.read` for **SYN-P-0042** (in grant) | 200, scoped timeline returned; **allow** audit row written | AT-13, AT-15 |
| B2 | Same agent reads **SYN-P-0043** (outside grant) | 403 `patient_not_in_grant`; **deny** audit row with reason | AT-14 |
| B3 | Agent calls an unnamed tool (`patient.export_all`) | 403 `tool_not_in_policy` (deny by default) | AT-14 |
| B4 | Agent attempts `egress.export` to an external URL | 403 `egress_not_granted`; **deny** audit row | AT-17 |
| B5 | Agent attempts `cds.decide` (play clinician) | 403 `deny_list` — machines never record clinical decisions | AT-13 |
| B6 | Spoofed agent identity header (`x-agent-id` mismatch) | 401 before any evaluation | AT-14b |
| B7 | Unregistered agent identity | 403 `agent_not_registered` | AT-13b |
| B8 | Admin reads the audit log | All of B1–B7 visible, each with actor, action, target, decision, reason | AT-15 |
| B9 | Doctor tries to read the audit log | 403 — audit access is itself permission-controlled | AT-15 |

**Talking point for judges:** B2 and B4 are blocked by the *server*, not the interface.
Nothing the agent's prompt says can change the grant — prompt injection has no path to a
permission.

---

## What we deliberately do NOT demo

- Any real device, hospital system, or FHIR/DICOM endpoint (none exist — see
  `docs/architecture/INTEGRATION_AND_DEVICE_STRATEGY.md`).
- Any accuracy claim for the differential generator (it is a deterministic demo routine).
- Any clinical recommendation for a real person.
