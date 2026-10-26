# AI Validation Plan — MedIntel Nexus

**Status:** Plan (no validation has been performed) · v0.9 · 2026-10-27

> **Nothing in this document has been executed.** It is the plan we would follow. No
> accuracy, sensitivity, specificity, or safety figure is reported anywhere in this
> repository, because none was measured.

---

## 1. What "the AI" is in Round 1

The Round 1 prototype contains a **deterministic demonstration routine** that produces a
differential with evidence pointers. It is a workflow prop: it exists to exercise the
review state machine, not to demonstrate diagnostic skill. Any real model would replace
`cds.generate()` behind the same interface.

## 2. Validation stages (future work)

| Stage | Question | Method | Exit criterion (to be agreed with clinicians) |
|---|---|---|---|
| V0 — software verification | Does the workflow behave as specified? | Automated acceptance tests AT-01…AT-18 | All tests pass; results recorded |
| V1 — technical validation | Does a real model rank correct differentials? | Retrospective evaluation on representative, ethically sourced data; pre-registered metrics (top-k accuracy, calibration) | Metrics meet pre-agreed thresholds; failures analysed |
| V2 — clinical workflow validation | Does the *system* improve decisions without harming them? | Simulation/usability study with clinicians; measure override rate, time-to-decision, induced-error rate | No increase in error rate; acceptable override pattern |
| V3 — silent deployment | Does it behave on live data without influencing care? | Shadow mode: outputs logged, not shown | Stability, drift within bounds |
| V4 — controlled pilot | Is it safe and useful in practice? | Prospective pilot with ethics approval, adverse-event monitoring, rollback plan | Independent review sign-off |
| V5 — post-market monitoring | Does it stay safe? | Drift monitoring, incident review, periodic re-validation | Continuous |

Round 1 has reached **V0 only** (see `docs/validation/ROUND_1_ACCEPTANCE_TESTS.md`).

## 3. Metrics framework (to be used at V1+)

| Category | Metric | Notes |
|---|---|---|
| Discrimination | Top-k recall of the correct condition | Defined with clinicians per use case |
| Calibration | Expected-vs-observed frequency of suggested conditions | Prevents over-confident display |
| Robustness | Stability under irrelevant input perturbation | Detects shortcut learning |
| Safety | Rate of suggestions causing a wrong accepted decision in simulation | The metric that actually matters |
| Human factors | Override rate and override reasons | High override = either bad model or bad UI |
| Fairness | Performance across demographic subgroups | Required before any real use |

**Rule:** thresholds are agreed *before* evaluation, with clinicians, never chosen after
seeing results.

## 4. Data requirements

- Representative, ethically obtained, appropriately consented or governed data.
- De-identification/pseudonymisation with key separation.
- Documented ground truth (e.g., specialist-adjudicated labels).
- **None of this exists for Round 1** — which is precisely why no performance claim is
  made.

## 5. Ongoing safety controls once deployed

- Log every suggestion, its evidence, and the clinician's decision (already the schema in
  the prototype).
- Review overrides periodically; treat clusters as signals.
- Re-validate after any model or threshold change.
- Kill switch: disable suggestion generation without affecting the rest of the platform.

## 6. Explicit statement

Synthetic demonstration ≠ clinical validation. Passing AT-01…AT-18 proves the *controls*
work, not that the *medicine* is right.
