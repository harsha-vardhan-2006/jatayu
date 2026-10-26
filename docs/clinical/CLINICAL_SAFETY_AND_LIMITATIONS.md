# Clinical Safety and Limitations — MedIntel Nexus

**Status:** Design document for Round 1 · v0.9 · 2026-10-27

---

## 1. Safety position (non-negotiable)

1. **This is clinical decision *support*. It assists clinicians. It does not replace
   them.**
2. **Differentials and suggestions are hypotheses requiring clinical verification.**
   They are never diagnoses.
3. **No autonomous diagnosis. No autonomous prescribing. No autonomous order entry.**
   There is no code path by which an AI-generated suggestion becomes a clinical decision
   without a human recording it.
4. **Nothing in this project is clinically validated, clinically certified, or
   regulator-approved.** No claim of CE marking, FDA clearance, CDSCO approval, or
   equivalent is made or implied.
5. **Demonstration data is synthetic.** A successful demo proves software behaviour, not
   clinical benefit.
6. **Prototype thresholds are illustrative** and must not be used for clinical judgement
   (`docs/clinical/SENSOR_DATA_QUALITY.md`).

## 2. Intended use and contraindications

| | |
|---|---|
| **Intended use (Round 1)** | Demonstrate a supervised workflow: quality-flagged patient data + AI-generated suggestions under human control + enforced permissions |
| **Intended users (concept)** | Licensed clinicians and nursing staff within an authorised facility |
| **Not intended for** | Patient self-triage, unsupervised AI decision-making, emergency/critical-care automation, use without clinician review |
| **Contraindicated** | Treating any output as a final diagnosis; using illustrative thresholds for patient care |

## 3. Failure modes and mitigations

| Failure mode | Clinical risk | Mitigation | Status |
|---|---|---|---|
| Suggestion accepted uncritically (automation bias) | Wrong diagnosis adopted | Mandatory review step; suggestion never pre-selected; evidence links force looking at source data | Implemented (AT-12) |
| Stale data treated as current | Decision on outdated vitals | Freshness flag blocks "current" presentation | Implemented (AT-08) |
| Implausible value accepted | Reaction to an artifact | Plausibility flag + human confirmation | Implemented (AT-09) |
| Data from the wrong patient | Cross-patient contamination | Correlation check + quarantine | Implemented (AT-10) |
| Missing data read as normal | False reassurance | Explicit "no data" state, never a silent gap | Designed; demo shows absence explicitly |
| Unauthorised access to a record | Privacy + wrong-patient error | Deny-by-default server-side policy | Implemented (AT-03…) |
| AI agent acting beyond scope | Unaccountable machine action | Agent Trust Layer, deny by default, audited | Implemented (AT-13/14/17) |
| Alert fatigue from flags | Ignored real warnings | Few, high-signal flag classes only | Designed (flag count deliberately small) |
| Clinician unavailable to review | Suggestion withers, care delayed | Deferred state remains visible; no auto-resolution | Implemented in state machine |

## 4. Human-oversight design points

- Suggestions display their evidence (which timeline entries they drew on) so review is
  verification, not faith.
- The review control requires an explicit choice plus optional rationale; there is no
  "accept all".
- The person recording the decision is identified in storage and audit — accountability
  is personal, never delegated to the system.

## 5. Explicit limitations

- No clinical study, no sensitivity/specificity/accuracy figures are reported — **because
  none were measured.**
- Evidence links in the prototype are illustrative, not the output of a validated model.
- The prototype's differential generation is a deterministic demonstration routine, not a
  trained clinical model.
- Regulatory classification (e.g., SaMD) is undetermined and requires professional
  assessment before any deployment.
- No usability/human-factors study has been conducted.

## 6. What would be required before clinical use (honest checklist)

1. Clinical partner and defined intended use with a regulatory pathway assessment.
2. Model validation on representative data with pre-registered metrics.
3. Prospective evaluation of the *workflow* (not just the model), including override
   rates and near-miss review.
4. Human-factors testing with target clinicians.
5. DPIA, security testing, incident runbooks (`docs/security/`).
6. Monitoring plan for drift and post-deployment incidents.
