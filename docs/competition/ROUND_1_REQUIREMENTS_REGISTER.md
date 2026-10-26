# Jatayu Season 6 — Round 1 Requirements Register (Provisional)

**Status:** PROVISIONAL — prepared pending the official challenge packet
**Created:** 2026-10-27
**Classification key:**
✅ Verified (checked against an official Season 6 source) ·
🟡 Supported by an organizer/official but not Season-6-specific source ·
⚪ Reasonable preparation recommendation (not an official requirement) ·
❓ Unknown — requires confirmation from the organizer or the team

> **Honesty statement.** The official Jatayu Season 6 Round 1 guideline document, the HLS
> (Healthcare & Life Sciences) challenge packet, the scoring rubric, the deadlines, and the
> submission portal could **not** be retrieved during preparation. No entry below invents
> their contents. Everything marked ❓ is an open item, and this package must **not** be
> described as "fully compliant" until those items are confirmed.

---

## A. Verified facts about Season 6

| ID | Requirement / fact | Source | Source type | Verified | Status | Deliverable affected | Validation method | Open question |
|---|---|---|---|---|---|---|---|---|
| R-01 | The competition exists as "Jatayu Season 6" run by Virtusa; official landing page is `https://www.virtusa.com/lp/jatayu-s6` | S-01 | Official (organizer site) | ✅ Yes | Mandatory context | All documents | Page fetched HTTP 200; page title "Jatayu S6" | — |
| R-02 | The Season 6 landing page is also described as "Jatayu Forward Deployment Engineer Challenge 2026" | S-01 (search result title for the official page) | Official page metadata (via search index) | 🟡 Partially | Unknown | Framing/title of submission | Confirm the exact official Season 6 theme wording | Is "Forward Deployment Engineer Challenge" the official S6 theme, and does it change our framing? |
| R-03 | Jatayu is Virtusa's innovation ideathon for engineering students, launched in 2021 | S-01 | Official | ✅ Yes | Context | Proposal introduction | Quoted on official page | — |
| R-04 | Jatayu seasons follow staged rounds; Season 5 was described as three stages: Problem Detailing → Solution Building → Industrialization | S-04 | Secondary (Scribd copy of a Season 5 deck) | 🟡 Season 5 only | Unknown for S6 | Proposal depth, roadmap | Needs official Season 6 stage document | Does Season 6 keep the same three-stage structure? |
| R-05 | Prior seasons have run a first round based on idea/problem-definition submission (exact format unpublished for S6) | S-06 | Secondary (press coverage of Season 3) | 🟡 Historical | Unknown for S6 | Submission package scope | Needs official S6 Round 1 brief | What exactly must Round 1 submit? |
| R-06 | Healthcare & Life Sciences (HLS) has been an official Jatayu domain in recent seasons | S-05 | Official (Virtusa press release, Season 4) | 🟡 Prior seasons | 🟡 Supported | Domain framing | Confirm S6 domain list includes HLS | Is HLS an official S6 domain, and what are its challenge statements? |

## B. Round 1 submission format (all unconfirmed)

| ID | Requirement | Source | Source type | Verified | Status | Deliverable affected | Validation method | Open question |
|---|---|---|---|---|---|---|---|---|
| R-10 | Number and format of required Round 1 documents (PDF/DOCX/MD/PPT) | — | — | ❓ No | Unknown | `submission/` | Request official template | What file formats and how many files? |
| R-11 | Slide / page / word limits | — | — | ❓ No | Unknown | `submission/ROUND_1_PRESENTATION.md` | Request official template | Is there a slide or page cap? |
| R-12 | File-size limits and naming conventions | — | — | ❓ No | Unknown | All binary outputs | Request official template | Any size cap? |
| R-13 | Official evaluation criteria and scoring rubric | — | — | ❓ No | Unknown | Entire proposal emphasis | Request rubric | What is weighted: novelty, feasibility, impact, presentation? |
| R-14 | Deadline and time zone for Round 1 | — | — | ❓ No | Unknown | Schedule | Confirm with organizer | Exact date/time |
| R-15 | Submission method / portal (email, portal, LMS, GitHub link) | — | — | ❓ No | Unknown | Release process | Confirm with organizer | Where do we submit? |
| R-16 | Team size limits, member registration, and eligibility conditions | — | — | ❓ No | Unknown | `submission/TEAM_INFORMATION_REQUIRED.md` | Confirm with organizer | Max team size; must every member be registered? |
| R-17 | Required declarations: originality, confidentiality, IP, consent | — | — | ❓ No | Unknown | Proposal closing section | Request declaration text | Exact wording; who signs? |
| R-18 | Requirements for prototype links, source code, demo video | — | — | ❓ No | Unknown | `prototype/`, `docs/DEMO_GUIDE.md` | Confirm with organizer | Is a working prototype required in Round 1? |
| R-19 | Official HLS challenge statement list (use cases) | — | — | ❓ No | Unknown | `docs/strategy/HLS_CHALLENGE_COMPARISON.md` | Request challenge packet | Exact wording of each HLS use case |
| R-20 | Whether prior-season documents (S5 decks) may be used as format guidance | — | — | ❓ No | Unknown | Format decisions | Confirm with organizer | Can we mirror the Season 5 deck structure? |

## C. Reasonable preparation recommendations (not official requirements) ⚪

These are self-imposed quality bars chosen because they are safe under any likely rubric.
They are **not** claimed to be Virtusa requirements.

| ID | Recommendation | Deliverable | Validation |
|---|---|---|---|
| P-01 | One-page executive summary a reviewer can read in 60 seconds | `submission/EXECUTIVE_SUMMARY.md` | Manual read-through |
| P-02 | Slide-by-slide outline plus a presentable deck structure | `submission/ROUND_1_PRESENTATION.md` | Outline follows proposal content |
| P-03 | Architecture, security, clinical-safety and privacy documentation of enterprise grade | `docs/architecture/`, `docs/security/`, `docs/clinical/` | Cross-document consistency check |
| P-04 | A small, reproducible, tested demonstration — only if it strengthens the submission | `prototype/` | Automated tests executed and recorded |
| P-05 | Traceability from challenge requirement → feature → acceptance test | `docs/strategy/REQUIREMENT_TO_FEATURE_TRACEABILITY.md` | Every feature row has a test ID |
| P-06 | No fabricated data, results, credentials, partnerships or clinical claims | All files | Secret/claim scan in `docs/audit/FINAL_QUALITY_AUDIT.md` |
| P-07 | All synthetic data labelled as synthetic | Prototype, proposal | Grep for disclaimer markers |

## D. Unknowns requiring the user / organizer

1. **Official Season 6 Round 1 brief** (mandatory before calling the package compliant).
2. **Official HLS challenge statement list** for Season 6.
3. **Scoring rubric, deadline, submission portal.**
4. **Team details:** names, college, department, mentor, contacts — none were found locally;
   see `submission/TEAM_INFORMATION_REQUIRED.md`.
5. **Whether a working prototype is scored in Round 1** (drives how much effort goes to
   `prototype/` vs. documents).
6. **Whether MedIntel source code exists elsewhere** — no MedIntel code was found in this
   repository or the searched workspace; it is treated as a conceptual foundation only.

## E. Stop-and-continue decision

Per the stop-and-continue rule: the official packet was not accessible, so this register is
explicitly **provisional**, general HLS preparation materials were produced, the missing
documents are named above, and the package is labelled **"prepared, pending official Round 1
brief"** everywhere it is summarized.

---

*Sources: see `docs/competition/SOURCE_REGISTER.md`.*
