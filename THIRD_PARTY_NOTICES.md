# Third-Party Notices and Asset Register

**Last updated:** 2026-10-27
**Scope:** everything in this repository that is not original team work.

---

## 1. Runtime dependencies

| Component | Version | License | Where used |
|---|---|---|---|
| Node.js standard library (`node:http`, `node:crypto`, `node:url`, `node:test`) | v24.19.0 (system-provided) | MIT (Node.js) | `prototype/src`, `prototype/test` |

**That is the complete list.** The prototype deliberately has **zero third-party npm
dependencies** (threat T-14: no supply-chain surface, no `node_modules` to audit).

## 2. Data

| Asset | Source | License / terms | Notes |
|---|---|---|---|
| Synthetic patients, timelines, observations, personas | Written for this repository | Original work | Fictional; no real persons or records |
| Demo thresholds (freshness/plausibility) | Written for this repository | Original work | Explicitly **not** clinically approved |

**No datasets were downloaded, scraped or bundled.** No real patient data is present.

## 3. Models / AI services

| Asset | Status |
|---|---|
| Clinical model / LLM / external AI API | **None used.** The CDS routine is deterministic demo code; no external AI service is called at runtime or during development of this package. |

## 4. Code provenance

| Claim | Evidence |
|---|---|
| All prototype source was written for this repository in this preparation cycle | Fresh repository with a single commit history starting from empty (`docs/audit/INITIAL_REPOSITORY_AUDIT.md`) |
| No code was copied from the "existing MedIntel" project | **No MedIntel code exists in this repository or the searched workspace**; it is used as a conceptual reference only |
| No template/proposal text copied from other hackathon submissions | Original composition; all external facts cite `docs/competition/SOURCE_REGISTER.md` |

## 5. Fonts / media / templates

None bundled. Diagrams are Mermaid source rendered by the platform viewing them; no
stock imagery, icons, or slide templates are embedded.

## 6. To complete before submission

- [ ] If the official template requires a specific slide deck or brand assets, use only
      assets Virtusa provides for that purpose.
- [ ] If any dependency is added later, record its name, version and license here.
- [ ] Confirm the team's chosen license for their own code (currently `UNLICENSED` /
      all-rights-reserved by default in `prototype/package.json`).
