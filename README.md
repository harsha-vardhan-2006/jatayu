# MedIntel Nexus — Virtusa Jatayu Season 6, Round 1 Package

**Unified Hospital Intelligence, Connected Monitoring & Secure Clinical Decision Support**

> **Status:** Prepared, **pending the official Round 1 brief** (challenge wording, rubric,
> deadline, submission portal), team details, and binary-format conversion if the official
> format requires it. Nothing in this repository has been submitted to Virtusa; committing
> to GitHub is not submission.

---

## What's in this repository

| Path | Contents |
|---|---|
| `submission/` | Round 1 proposal, executive summary, slide-by-slide outline, team-info checklist |
| `docs/competition/` | Requirements register (provisional) + source register |
| `docs/strategy/` | HLS challenge comparison, selection rationale, requirement→feature→test traceability |
| `docs/architecture/` | System architecture, data flow & trust boundaries, access model, integration strategy |
| `docs/security/` | Threat model, Agent Trust Layer, authorization & audit, privacy & governance |
| `docs/clinical/` | Clinical safety & limitations, AI validation plan, sensor data quality |
| `docs/validation/` | Acceptance tests (**executed: 25/25 pass**), impact metrics, known limitations |
| `docs/audit/` | Initial repository audit, final quality audit, Git/release report |
| `prototype/` | Small tested demonstration (Node.js, zero third-party dependencies, synthetic data) |
| `THIRD_PARTY_NOTICES.md` | Third-party code/data/assets register |

## Run the demonstration

```bash
cd prototype
npm test      # 25 tests, all should pass
npm start     # API on http://127.0.0.1:4173
```

Full instructions, demo logins and scripted scenarios: `docs/DEMO_GUIDE.md` and
`docs/DEMO_SCENARIOS.md`.

## The honesty rules this package follows

1. **Synthetic data only** — no real patient records, credentials, keys or `.env` files.
2. **No fabricated results** — test outcomes, where stated, were actually executed.
3. **No invented requirements** — official Season 6 Round 1 documents could not be
   retrieved; that gap is tracked openly in `docs/competition/`.
4. **No clinical claims** — decision support assists clinicians; nothing here is
   clinically validated or regulator-approved.
5. **Implemented vs. simulated vs. planned** are labelled distinctly everywhere.

## Key entry points

- Start here: `submission/ROUND_1_PROPOSAL.md`
- One-page read: `submission/EXECUTIVE_SUMMARY.md`
- What's still missing: `docs/competition/ROUND_1_REQUIREMENTS_REGISTER.md` §D
- Quality audit: `docs/audit/FINAL_QUALITY_AUDIT.md`
