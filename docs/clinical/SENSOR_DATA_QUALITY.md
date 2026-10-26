# Sensor / Observation Data Quality — MedIntel Nexus

**Status:** Design document + implemented prototype checks · v0.9 · 2026-10-27

> **Thresholds in this document are illustrative defaults for demonstration.** They are
> not clinically approved limits and must be reviewed and approved by clinicians before
> any real use.

---

## 1. Why this matters

A vital sign on a screen carries four hidden questions: *Is it recent? Is it plausible? Is
it this patient's? Is the unit what I think it is?* Today's dashboards usually answer
none of them. A clinician acting on a stale or mis-attributed value is a patient-safety
event, not a UI inconvenience.

## 2. Observation contract

Every observation persists: `patientId`, `deviceId/source`, `metric`, `value`, `unit`,
`observedAt` (device time), `receivedAt` (ingest time), `correlationId`, `verdict`,
`synthetic`.

Keeping `observedAt` and `receivedAt` separate is essential — freshness is computed from
device time, latency from the difference.

## 3. Validation pipeline (in order)

| # | Check | Failure verdict | Behaviour |
|---|---|---|---|
| 1 | Schema (required fields, types) | `INVALID` | Rejected with logged error |
| 2 | Unit in accepted set for the metric | `UNIT_MISMATCH` | Rejected with logged error |
| 3 | Freshness: `now − observedAt > freshnessWindow` | `STALE` | Persisted and displayed, marked stale, excluded from "current" |
| 4 | Plausibility bounds for the metric | `IMPLAUSIBLE` | Persisted and displayed with warning; requires human confirmation |
| 5 | Patient correlation (device/registration link) | `PATIENT_MISMATCH` | **Quarantined** — not shown as that patient's data |
| — | None of the above | `OK` | Normal display |

**Rule:** bad data is preserved as evidence with a verdict; it is never silently dropped
and never presented as valid.

## 4. Illustrative defaults (NOT clinically approved)

| Metric | Unit | Freshness window | Plausibility bounds |
|---|---|---|---|
| Heart rate | bpm | 60 s | 20–250 |
| SpO2 | % | 60 s | 50–100 |
| Systolic BP | mmHg | 120 s | 40–260 |
| Respiratory rate | /min | 120 s | 4–60 |
| Temperature | °C | 300 s | 30–43 |

A clinician-approved configuration, per device type and care setting, would replace these
before any deployment.

## 5. Missing data

- Absence of an observation is represented **explicitly** ("no data in window"), never as
  a blank chart or a zero, both of which read as "normal".
- Gaps are visible on the timeline so a monitoring outage cannot masquerade as stability.

## 6. Wrong-patient handling

Correlation mismatches are the highest-severity data-quality failure: showing another
patient's physiology under the wrong name. The pipeline therefore *quarantines* rather
than flags-and-continues. Quarantined items are reviewable by an administrator with an
audit trail (design; prototype exposes them via API).

## 7. Demonstration evidence

| Property | Test |
|---|---|
| Stale value flagged, not shown as current | AT-08 |
| Implausible value flagged | AT-09 |
| Mismatched-patient observation quarantined | AT-10 |
| Observation schema carries source/timestamp/units/quality | AT-07 |

## 8. Limitations

- No device simulation of motion artifact, dropout patterns, or calibration drift — the
  simulated stream covers the verdict classes above only.
- No statistical quality models (e.g., signal-quality index on waveforms).
- Thresholds unvalidated clinically (stated repeatedly because it is the easiest thing to
  over-claim).
