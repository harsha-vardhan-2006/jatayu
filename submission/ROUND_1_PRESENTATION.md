# Round 1 Presentation — Slide-by-Slide Outline

**Status:** DRAFT — final-for-review · v0.9 · 2026-10-27
**Slide-count note:** the official deck limit is unknown (R-11). This outline is 13
slides. If the official limit is smaller, cut slides 10 and 12 first; if it is a fixed
template, re-map each heading onto the template's placeholders.

**Rules for whoever builds the deck**

- Reuse the exact wording of titles, metrics and scope from `ROUND_1_PROPOSAL.md` — no
  slide may introduce a claim the proposal does not make.
- No fabricated screenshots. Prototype screenshots may only be captured from the running
  local demo, and must carry the synthetic-data marker visible.
- Never describe the demo as a live hospital integration.

---

### Slide 1 — Title and team
- Title: *MedIntel Nexus: Secure, Connected Patient Intelligence and Clinician-Supervised
  Decision Support*
- Domain: Healthcare & Life Sciences · Virtusa Jatayu Season 6
- Team block: **[TO COMPLETE — see `TEAM_INFORMATION_REQUIRED.md`]**

### Slide 2 — Challenge and problem
- Provisional challenge statement (flagged as provisional until official packet arrives)
- Two gaps in one line each: **clinical gap** (decisions on unverified data) and **trust
  gap** (AI access with no permission model or audit)

### Slide 3 — Current gap
- Today's approach vs. why it fails: broad ward roles, UI-only restrictions, unlogged AI
  assistants, raw vitals with no quality context, silent record edits

### Slide 4 — Proposed solution
- Three layers: Clinical layer · Observation layer · Trust layer (Agent Trust Layer)
- One sentence: *one enforcement boundary for humans and AI agents*

### Slide 5 — User journey
- Doctor: open patient → timeline → quality-flagged vitals → request suggestions → review
  → record decision
- Nurse: assigned patients → bedside observations → attributable actions
- Mermaid sequence diagram from the proposal (§8)

### Slide 6 — System architecture
- Modular monolith diagram: API/policy boundary in front of store, observation pipeline,
  CDS engine, agent policy, append-only audit
- Note: PostgreSQL (prod) / SQLite (demo), session auth, server-side authorization

### Slide 7 — Innovation and differentiation
1. Shared enforcement boundary for humans and agents
2. Patient-specific authorization: `f(role, assignment, department, record type, action)`
3. Data quality as a first-class signal: `STALE` / `IMPLAUSIBLE` / `PATIENT_MISMATCH`
4. Deny-by-default agent tools with explicit egress control
5. Clinician-supervised CDS — no auto-accept path

### Slide 8 — Privacy, security and responsible AI
- Deny-by-default server-side checks, append-only audit, prompt injection cannot grant
  permissions, admin ≠ clinical access, synthetic data only
- Statement: assists clinicians, never replaces them; no autonomous diagnosis/prescribing;
  not clinically validated or regulator-approved

### Slide 9 — Prototype and evidence
- Live/scripted demo: `docs/DEMO_GUIDE.md` (two scenarios, <10 min, Node.js only)
- Automated acceptance tests AT-01…AT-18 with **recorded real results** (paste the actual
  table from `docs/validation/ROUND_1_ACCEPTANCE_TESTS.md` at build time — do not
  paraphrase or round)

### Slide 10 — Impact and evaluation
- Four target metrics with measurement methods (from `docs/validation/IMPACT_METRICS.md`),
  explicitly labelled *targets to be measured in a pilot*, not achieved results

### Slide 11 — Risks and limitations
- No real devices/hospital integration, no trained model, no clinical validation,
  provisional challenge framing, break-glass unimplemented

### Slide 12 — Roadmap and feasibility
- Round 1 (documents + tested prototype) → Stage 2 (auth provider, FHIR read adapter,
  break-glass) → Stage 3 (device adapters, pilot, validation study) → future regulatory
  assessment
- Cost: zero infrastructure for Round 1

### Slide 13 — Closing
- One-line pitch repeat
- Contact block: **[TO COMPLETE]**
- Q&A

---

**Build note (open item R-10/R-11/R-12):** no `.pptx` is committed because (a) the
official format requirement is unknown and (b) no PPTX-conversion toolchain (Python,
LibreOffice, pandoc) is installed on this machine. The Markdown outline above is the
editable source; converting it is a mechanical step once the official format is known.
