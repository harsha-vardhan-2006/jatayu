# Impact Metrics — MedIntel Nexus

**Status:** Measurement plan · v0.9 · 2026-10-27
**Rule:** every number in this file is a **target to be measured in a pilot**, not an
achieved result. This repository contains no measured impact figures, because no pilot has
been run.

---

## 1. Metric catalogue

| ID | Metric | Definition / formula | Data source | Target (to agree with partner) | Stage |
|---|---|---|---|---|---|
| M-01 | Time to chart review | Median `review_completed_at − patient_opened_at` per clinician-shift | Workflow events | Reduce vs. baseline (to be measured) | Pilot |
| M-02 | Review completeness of AI suggestions | `suggestions with decision recorded ÷ suggestions shown × 100` | CDS table | 100% (structural: no auto-accept exists) | Prototype → Pilot |
| M-03 | Silent bad-data events | Count of `STALE/IMPLAUSIBLE/MISMATCH` observations displayed as current | Observation verdicts + UI logs | 0 by construction | Prototype |
| M-04 | Flag response rate | `flags acted upon ÷ flags shown × 100` | Audit + decision linkage | Establish baseline, then improve | Pilot |
| M-05 | Audit coverage | `privileged operations with complete audit row ÷ privileged operations × 100` | Audit log | 100% | Prototype |
| M-06 | Blocked unauthorised agent actions | Count of `deny` events by reason code, per day | Audit log | Monitored, not minimised (denies are the control working) | Prototype → Pilot |
| M-07 | Unauthorized access attempts (human) | Count of `deny` on patient routes by non-assigned principals | Audit log | Monitored; investigate spikes | Pilot |
| M-08 | Unreviewed or delayed escalations | `suggestions deferred > SLA ÷ total × 100` | CDS table | Agree SLA with clinicians | Pilot |
| M-09 | Clinician trust signal | Override rate with coded reasons | CDS decisions | Interpret, don't target a number | Pilot |
| M-10 | Demo reproducibility | `fresh clone → green test suite` steps/time | CI / local run | ≤ 10 minutes, zero paid services | Round 1 |

## 2. How measurement would work

1. **Baseline first.** M-01, M-04 and M-09 need a pre-deployment baseline from the pilot
   unit; without it, improvement claims are meaningless.
2. **Instrument, don't survey where possible.** Events already exist (open, review,
   decision, flag) in the prototype schema.
3. **Pre-register targets** with the partner before seeing results (same principle as
   `docs/clinical/AI_VALIDATION_PLAN.md`).
4. **Report negatives too.** Deny counts (M-06/M-07) rising can mean the control is
   working *or* that the policy is misconfigured — both must be investigated, neither
   hidden.

## 3. What we can honestly report today

| Claim | Evidence |
|---|---|
| The controls exist and behave as specified | Test results in `docs/validation/ROUND_1_ACCEPTANCE_TESTS.md` |
| The demo runs locally with no cost and no dependencies | Run instructions in `docs/DEMO_GUIDE.md` |
| **Any clinical, operational or business impact** | **None available — no pilot, no users, no data** |
