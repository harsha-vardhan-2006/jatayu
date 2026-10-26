# Integration and Device Strategy — MedIntel Nexus

**Status:** Design document for Round 1 · v0.9 · 2026-10-27
**Headline:** **Nothing is integrated today.** This document describes adapters we would
build and the contracts they must satisfy. No hospital system, device, or third-party
service is connected to this repository's prototype.

---

## 1. Principles

1. **Adapters at the edge, one validation gate.** Every external source — device, EHR,
   file import — feeds the same observation/validation pipeline. Source-specific logic
   lives in the adapter, never in the clinical layer.
2. **Standards where they help.** HL7 FHIR for clinical data exchange, DICOM for imaging,
   IEEE 11073 / vendor SDKs for device data — adopted only when a real counterpart exists.
3. **Provenance travels with data.** Source system, device ID, observation time, ingest
   time, units and patient correlation are mandatory fields, not optional metadata.
4. **No claim of connectivity.** The word "integrated" never appears without the word
   "planned" in this repository.

## 2. Adapter inventory

| Adapter | Standard / format | Status | Notes |
|---|---|---|---|
| Simulated vital-sign stream | Internal JSON observation schema | **Implemented (prototype)** | Carries timestamp, units, source, freshness, quality verdict |
| Monitor / bedside device adapter | Vendor SDK or IEEE 11073 point-of-care data | Planned | Would normalise into the observation schema |
| EHR read adapter | HL7 FHIR R4 (`Patient`, `Encounter`, `Observation`, `Condition`) | Planned | Read-only in the first instance; mapping documented below |
| Imaging pathway | DICOM (study list + image retrieval) | Out of Round 1 scope | Needs a dataset and PACS; no honest demo possible now |
| Order / result write-back | FHIR `ServiceRequest` / `DiagnosticReport` | Future | Any write-back requires institutional approval |
| HL7 v2 feeds (legacy wards) | MLLP / ADT^A01 etc. | Future | Translate to FHIR-shaped internal events at the edge |

## 3. FHIR mapping sketch (planned, read-only)

| Internal entity | FHIR resource | Notes |
|---|---|---|
| Patient | `Patient` | Identifier mapping keeps our internal ID as the correlation key |
| Encounter | `Encounter` | Drives timeline sections |
| Observation (vitals) | `Observation` | `effectiveDateTime` = device time; `meta.lastUpdated` = ingest time — kept distinct to preserve freshness |
| Condition / diagnosis | `Condition` | Suggestion evidence links point at these |
| Clinical decision | `Provenance` | Records which clinician reviewed which suggestion |

Consent/privacy: FHIR queries would be scoped to the same policy engine — the adapter is
a *data source*, never an authorization bypass.

## 4. Device ingestion contract (what any adapter must emit)

```json
{
  "schema": "observation.v1",
  "patientId": "SYN-P-0042",
  "deviceId": "SIM-MON-01",
  "metric": "heart_rate",
  "value": 84,
  "unit": "bpm",
  "observedAt": "2026-10-27T10:00:00Z",
  "receivedAt": "2026-10-27T10:00:02Z",
  "correlationId": "SYN-P-0042",
  "synthetic": true
}
```

Validation order: schema → unit → freshness → plausibility → patient correlation.
Failures produce flags (`STALE`, `IMPLAUSIBLE`, `PATIENT_MISMATCH`) rather than
rejection-with-silence — except schema/unit failures, which are rejected with a logged
error.

## 5. Why these are not built in Round 1

| Reason | Consequence |
|---|---|
| No hospital system, device, or PACS available to the team | Any "integration" would be simulated — so it is described, not claimed |
| FHIR endpoint requires credentials and a data partner | Contract documented; test doubles would prove nothing about real interoperability |
| DICOM needs real imaging datasets | Explicitly out of scope |
| Round 1 format and scoring unknown (R-13, R-18) | Effort prioritised toward required submission artifacts |

## 6. Verification path for later stages

1. Obtain a sandbox FHIR server (e.g. public FHIR test server) and a synthetic FHIR
   fixture set → read adapter tests against `Patient`/`Observation` round-trip.
2. Run device adapter against vendor simulator → compare normalised output against the
   `observation.v1` contract.
3. Only after both: claim "FHIR-compatible read integration" — with the test evidence
   attached.
