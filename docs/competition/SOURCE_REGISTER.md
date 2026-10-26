# Source Register — Jatayu Season 6 Round 1 Preparation

**Last updated:** 2026-10-27
**Purpose:** Track every external source consulted, its retrieval status, and which
decisions it supports. No requirement, deadline, rubric, or challenge statement in this
repository may be traced to a source absent from this register.

| # | Title / description | URL | Type | Date noted | Retrieval status | Decisions supported |
|---|---|---|---|---|---|---|
| S-01 | Virtusa Jatayu Season 6 official landing page ("Jatayu S6") | https://www.virtusa.com/lp/jatayu-s6 | Official (organizer) | 2026-10-27 | ✅ Retrieved, HTTP 200. Page body is JavaScript-rendered; only the title, an ideathon description fragment, and Season 5 winner testimonials were extractable. No Round 1 rules present. | Confirms Season 6 exists and its official URL (R-01, R-02, R-03) |
| S-02 | Virtusa landing page raw HTML fetch (curl) | https://www.virtusa.com/lp/jatayu-s6 | Official | 2026-10-27 | ⚠️ Returned a 389-byte JavaScript shell — no readable content, no document links found. | Demonstrates rules are not statically published on the page |
| S-03 | Google search results for "Virtusa Jatayu Season 6 Round 1 submission guidelines" and related queries (4 searches run) | google.com search index | Secondary | 2026-10-27 | ✅ Searched; **no Season 6 Round 1 guideline document, rubric, or HLS challenge packet found anywhere publicly indexed.** | Basis for marking R-10…R-20 as ❓ Unknown |
| S-04 | "Jatayu Season 5 Stage Wise Overview" (deck copy) | https://www.scribd.com/document/994148941/5-Jatayu-Season-5-Stage-wise-overview | Secondary (previous season) | 2026-10-27 | ⚠️ Partial — snippet only; full document requires Scribd account. | Prior-season stage structure (R-04). **Not** used as an S6 requirement. |
| S-05 | Virtusa press release: "Virtusa Concludes 4th Season of Jatayu Ideathon" (mentions healthcare & life sciences among domains) | https://www.virtusa.com/news-room/press-releases/year_2025/october/virtusa-concludes-4th-season-of-jatayu-ideathon | Official (organizer, prior season) | 2026-10-27 | ⚠️ Found in search index; snippet confirms HLS was an S4 domain. | Supports HLS domain framing (R-06) as prior-season evidence only |
| S-06 | Virtusa press release: "Jatayu Season 5 Empowers India's Emerging AI Talent Through Agentic AI" | https://www.virtusa.com/news-room/press-releases/year_2026/august/jatayu-season-5-empowers-india-emerging-ai-talent-through-agentic-ai | Official (organizer, prior season) | 2026-10-27 | ⚠️ Retrieved HTTP 200 but body is JS-rendered; only headline/description extractable ("14,500+ students", Agentic AI theme). | Season 5 recency and scale context only |
| S-07 | Local workspace search (Downloads / Documents / Desktop, `*jatayu*`, `*virtusa*`) | Local filesystem | Organizer-supplied documents | 2026-10-27 | ✅ Searched — **zero files found.** | Confirms no organizer packet available locally |
| S-08 | Repository clone and inspection | https://github.com/harsha-vardhan-2006/jatayu.git | Repository | 2026-10-27 | ✅ Cloned — **empty repository, zero commits.** | Baseline recorded in `docs/audit/INITIAL_REPOSITORY_AUDIT.md` |
| S-09 | Virtusa press release: Jatayu Season 3 winners / round structure coverage | https://chennaipatrika.com/post/virtusa-announces-the-winners-of-jatayu-idea-to-industrialization-hackathon-2022-18000-students-across-65-partner-colleges-participate | Secondary (news, 2022) | 2026-10-27 | ⚠️ Not fetched in full; used only for the historical "Idea to Industrialization" framing. | Historical context (R-05) |

## Sources deliberately **not** used

- **NeuralHack Season 6** materials (Virtusa's hiring assessment) — a different program;
  explicitly excluded to avoid confusion.
- **Jatayu Seasons 1–5** rule sets — never represented as Season 6 requirements. Where they
  inform a recommendation, the row is marked 🟡 and scoped to the prior season.
- Unofficial recap blogs, student blogs, and third-party hackathon aggregators — excluded
  as proof of current-season requirements.

## Retrieval log

| Date | Action | Outcome |
|---|---|---|
| 2026-10-27 | `git clone` of target repository | Empty repo cloned to `/h/jatayu` |
| 2026-10-27 | Fetch of official S6 landing page (read_url) | HTTP 200, JS-rendered, no Round 1 rules |
| 2026-10-27 | Raw HTML fetch of S6 landing page (curl) | 389-byte JS shell, no document links |
| 2026-10-27 | Four web searches for S6 Round 1 rules, rubric, deadlines, HLS challenges | No official S6 Round 1 packet found publicly |
| 2026-10-27 | Local workspace search for organizer documents | No files found |
