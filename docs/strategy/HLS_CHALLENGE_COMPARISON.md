# HLS Challenge Comparison — Jatayu Season 6 (Provisional)

**Status:** PROVISIONAL. The official Season 6 HLS challenge statements could not be
retrieved (see `docs/competition/ROUND_1_REQUIREMENTS_REGISTER.md`, item R-19). The five
candidate challenges below are **provisional problem statements** derived from publicly
documented Healthcare & Life Sciences industry problems. They are **not** Virtusa challenge
statements and must not be presented as such. When the official packet arrives, each row
must be re-evaluated against the exact official wording.

**Method:** each candidate is scored 1–5 on six criteria (Problem fit, Target user
clarity, Expected outcome, Feasibility in a student Round 1 window, Differentiating value,
Evidence we can demonstrate). Scores are judgements, not measurements.

---

## Candidates

| ID | Provisional challenge | Problem (one line) | Primary user | Expected outcome |
|---|---|---|---|---|
| C-1 | Longitudinal patient intelligence + clinician-supervised decision support | Clinicians piece together fragmented patient history across wards, devices and notes at the point of care | Ward doctor / nurse | Faster, better-grounded clinical review with traceable data |
| C-2 | AI-agent governance for healthcare (Agent Trust Layer) | Hospitals adopt AI agents that can read/transfer PHI with no permission model or audit trail | Hospital IT / compliance | Every agent action authorised, logged and revocable |
| C-3 | Remote chronic-disease monitoring with escalation | Post-discharge patients are monitored sporastically; deterioration is detected late | Care coordinator | Earlier escalation of deteriorating patients |
| C-4 | Medical imaging worklist prioritisation | Radiology backlogs delay reporting of urgent findings | Radiologist | Triage of worklists by clinical urgency |
| C-5 | Hospital operational throughput (bed/OT scheduling) | Beds and operating theatres are misallocated, causing delays | Hospital operations manager | Reduced idle time and waiting |

## Scoring matrix (1 = weak, 5 = strong)

| Criterion | C-1 | C-2 | C-3 | C-4 | C-5 |
|---|---|---|---|---|---|
| Problem fit with our existing MedIntel foundation | 5 | 5 | 3 | 2 | 2 |
| Clarity of target user | 5 | 4 | 4 | 4 | 4 |
| Expected outcome measurable in Round 1 | 4 | 5 | 3 | 2 | 3 |
| Feasibility without hospital access / devices | 4 | 5 | 3 | 2 | 3 |
| Differentiating value vs. generic "chatbot for doctors" | 4 | 5 | 3 | 3 | 3 |
| Evidence we can honestly demonstrate now (synthetic + tests) | 5 | 5 | 3 | 1 | 2 |
| **Total /30** | **27** | **29** | **19** | **14** | **17** |

## Comparison notes

- **C-1 vs C-2:** they are complementary rather than rivals. C-2 alone risks reading as a
  pure security tool with no clinical story; C-1 alone risks reading as yet another EHR
  dashboard. **The submission combines them**: C-1 is the user-facing value, C-2 is the
  differentiator that makes AI-assisted care trustworthy. Combined scope is still one
  coherent product (MedIntel Nexus) with one architecture.
- **C-3 (remote monitoring)** requires patient-side devices, connectivity and clinical
  partnerships we do not have; a simulation would be weaker and less credible.
- **C-4 (imaging)** needs real DICOM datasets and a PACS connection; evidence we can
  demonstrate honestly is near zero.
- **C-5 (operations)** is measurable but disconnected from our MedIntel clinical
  decision-support foundation and from the Agent Trust Layer.

## Decision

**Selected: C-1 as the primary challenge, with C-2 embedded as the trust and security
differentiator.** Rationale and the final framing are in
`docs/strategy/SELECTED_CHALLENGE_AND_RATIONALE.md`.

> **Binding condition:** this selection is provisional until the official HLS challenge
> packet is obtained. If the official packet does not contain a matching challenge, the
> matrix must be rebuilt against the official statements before submission.
