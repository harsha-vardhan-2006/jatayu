# Selected Challenge and Rationale — MedIntel Nexus

**Status:** PROVISIONAL (pending official Season 6 HLS challenge packet)
**Date:** 2026-10-27
**Working title:** *MedIntel Nexus: Secure, Connected Patient Intelligence and
Clinician-Supervised Decision Support*

---

## 1. Selected challenge (provisional wording)

> **Clinician-supervised hospital intelligence:** ward clinicians must review a patient's
> longitudinal history, compatible monitoring signals and current care plan at the point of
> care — while every AI-assisted suggestion and every AI-agent action stays authorised,
> attributable and auditable.

**This is a provisional problem statement written by the team. It is not an official Virtusa
challenge statement.** It must be replaced by the exact official challenge ID and wording
once the Season 6 HLS packet is received (open item R-19).

## 2. Why this challenge is stronger than the alternatives

1. **It reuses what we already have.** The MedIntel clinical decision-support concept and
   the Agent Trust Layer / Agent Firewall concept map onto this challenge directly. The
   imaging candidate (C-4) and the operations candidate (C-5) would discard both.
2. **It can be evidenced honestly in Round 1.** Everything claimed can be shown with
   synthetic data, an enforceable permission layer and automated tests. Imaging (C-4)
   and remote monitoring (C-3) would require devices, datasets or hospital partnerships
   we do not have — and inventing that evidence is prohibited.
3. **It has a genuine differentiator.** "Dashboard for doctors" is a crowded idea; the
   combination of *patient-specific, server-enforced permissions* plus *an agent
   enforcement boundary that blocks unapproved AI actions* is a distinctive, demonstrable
   claim.
4. **It satisfies both halves of an enterprise healthcare brief:** clinical usefulness
   (C-1) and governance/privacy (C-2), without splitting into two unrelated projects.

## 3. Conflicts between the official brief and MedIntel Nexus

| Conflict / risk | Status | Handling |
|---|---|---|
| Official brief not yet known — framing may need to change | ⚠️ Open | Title and framing flagged as provisional; see R-19 |
| MedIntel's original focus (MSK / physiotherapy CDS) is narrower than "hospital intelligence" | Identified | Scope narrowed to a general longitudinal-record + supervised-CDS core; MSK content is out of Round 1 scope |
| No MedIntel source code exists in this repository | Identified | Treated as a conceptual foundation only; the prototype is built clean in `prototype/` with a documented integration contract |
| "Agent Firewall" could be oversold as a proven product | Identified | Described as a proposed control model with implemented prototype enforcement; no market/deployment claims |
| Live device integration is impossible in Round 1 | Identified | Vital signs are simulated and labelled synthetic; device strategy documented as adapters only |

## 4. Scope decision — minimum credible solution

**In scope for Round 1 (documents + demonstration):**

1. Synthetic patient record with a clinical timeline.
2. Doctor and nurse roles with patient assignments.
3. **Server-side, patient-specific authorization** for every protected operation.
4. A simulated vital-sign stream carrying timestamp, units, source, freshness and quality.
5. One clinician-supervised decision-support workflow (suggestion → clinician review →
   recorded decision, never auto-accepted).
6. One Agent Trust Layer scenario: an unapproved agent action is **blocked at the
   enforcement boundary** and produces an immutable audit record.
7. Automated tests covering the above, with real recorded results.

**Explicitly out of scope for Round 1:** real device integration, live hospital system
integration (HL7 FHIR / DICOM endpoints), diagnosis or prescribing automation, model
training on real patient data, mobile clients, multi-hospital federation.

## 5. Questions the proposal must answer

All eighteen questions from the execution brief (problem, users, current approach,
insufficiency, solution, innovation, end-to-end flow, data path/storage, identity &
privacy, doctor view, nurse view, review/approval, bad sensor data, unauthorized
read/write/transfer, Round 1 evidence, pilot plan, costs/risks, roadmap) are answered in
`submission/ROUND_1_PROPOSAL.md`.
