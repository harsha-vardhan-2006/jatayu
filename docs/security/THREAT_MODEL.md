# Threat Model — MedIntel Nexus

**Status:** Design document for Round 1 · v0.9 · 2026-10-27
**Method:** asset- and trust-boundary based (STRIDE-informed), scoped to the Round 1
prototype and its intended production shape. This is a design analysis, **not** a record of
penetration testing — no security testing has been performed on this codebase.

---

## 1. Assets

| Asset | Sensitivity |
|---|---|
| Patient records and timeline | Highest — PHI class in production |
| Vital-sign observations (incl. quality verdicts) | High |
| CDS suggestions and clinician decisions | High |
| Credentials / session tokens | High |
| Audit log integrity | High — it is the evidence base for everything else |
| Agent policy definitions | High — they define what AI may do |

## 2. Trust boundaries

B1 browser/agent → B2 application server → B3 external world (disconnected in Round 1).
Full detail: `docs/architecture/DATA_FLOW_AND_TRUST_BOUNDARIES.md`.

## 3. Threat actors

| Actor | Capability | Motivation |
|---|---|---|
| Malicious/curious authenticated user (insider) | Valid session, tries other patients' data | Curiosity, misuse |
| Compromised client | Full control of one browser session | Data theft |
| **AI agent under prompt injection** | Can issue tool calls; inputs may be adversarial | Data exfiltration, instruction hijack |
| Unauthorised agent registration | Tries to invoke tools without a grant | Privilege gain |
| Network attacker | Intercept/modify traffic | Data theft (mitigated by TLS in deployment; localhost demo has none) |
| Host-level attacker | Filesystem/database access | Full compromise — **out of scope for app-level controls**, stated as a limitation |
| Log tamperer | Wants to hide an action | Covering tracks |

## 4. Threats, controls, status

| ID | Threat (STRIDE) | Control | Status |
|---|---|---|---|
| T-01 | Spoofing — session token forgery | Signed/opaque tokens bound to server-side session; demo uses a server-issued token store | Implemented (demo-grade) |
| T-02 | Tampering — client-supplied identity (e.g. `patientId` or `role` in body) | Identity and role come from the session only; request bodies cannot set them | Implemented + tested |
| T-03 | Repudiation — "I never did that" | Append-only audit of every allow/deny with actor, action, target, reason, time | Implemented + tested (AT-15) |
| T-04 | Information disclosure — cross-patient read | Deny-by-default per-patient policy check before any store read (AT-03) | Implemented |
| T-05 | Information disclosure — admin reading clinical data | `admin.*` and `clinical.*` are disjoint permission sets (AT-06) | Implemented |
| T-06 | Information disclosure — agent reads beyond grant | Agent scope checked against the same policy engine (AT-13) | Implemented |
| T-07 | Information disclosure — outbound exfiltration | `egress.export` as a separate permission; default deny (AT-17) | Implemented |
| T-08 | Elevation of privilege — agent self-granting permissions | Policy is server-side and not writable by any API; prompt text can never change a grant | Implemented (design + code path) |
| T-09 | Prompt injection — instructions embedded in patient data or tool output | Agent inputs treated as untrusted data; permissions resolved only from the store; instructions from content are ignored by construction | Partially — input handling implemented; **output-side instruction filtering not implemented** |
| T-10 | Tampering — audit rows edited or deleted | Append-only store; no API path updates audit rows; application refuses mutation | Implemented at app level only (see §6) |
| T-11 | Tampering — silent overwrite of clinical records | Append-only amendment events with author and provenance (AT-16) | Implemented (prototype level) |
| T-12 | DoS — stream flooding / request floods | Not addressed in prototype | **Not implemented** — belongs to deployment hardening |
| T-13 | Secrets exposure in repo | `.gitignore` blocks `.env`, keys, credentials; demo needs no secrets | Enforced; verified in final audit |
| T-14 | Supply chain — malicious dependency | Prototype uses **zero third-party runtime dependencies** (Node standard library only) | Implemented by construction |
| T-15 | Data-quality attack — feeding plausible-looking bad vitals to influence a decision | Ingestion validation + flags surfaced to the clinician; flagged data cannot present as "current" | Implemented (AT-08…AT-10) |
| T-16 | Broken access control via UI-only checks | Enforcement is in the API; UI hiding is decorative | Implemented (all AT authz tests call the API directly) |

## 5. Agent-specific threats

| Threat | Handling |
|---|---|
| Agent tool call without grant | Deny-by-default; every tool enumerated in policy |
| Agent attempting egress | Separate permission class; default deny |
| Agent attempting `cds.decide` (act as clinician) | Denied unconditionally — agents can request suggestions, never record decisions |
| Instruction in retrieved content ("ignore your rules") | Content is data; policy evaluation is independent of content |
| Oversized tool output exfiltrating bulk data | Output-size/redaction limits **designed, not implemented** (listed in known limitations) |

## 6. Residual risks (stated openly)

1. **Audit integrity is application-level.** A host or DB admin could alter the audit
   table. Production needs WORM/immutable storage or DB-level triggers plus off-host
   replication.
2. **Demo authentication is not production-grade** — no MFA, no session revocation UI, no
   rate limiting, no TLS on localhost.
3. **No security testing performed.** No pen test, no SAST/DAST, no dependency audit was
   run (there are no third-party dependencies to audit).
4. **Output filtering for agents is unimplemented**, so a compromised agent could receive
   more text than a human would consider minimum-necessary — within its granted scope.
5. **Host compromise is out of scope** for these controls.

## 7. Remediation plan

| Priority | Item | Target stage |
|---|---|---|
| P1 | Real auth provider (sessions, revocation, MFA) | Stage 2 |
| P1 | Immutable audit storage | Stage 2 |
| P2 | Rate limiting / flood controls (T-12) | Stage 2 |
| P2 | Agent output redaction + size limits (T-09/T-05 residual) | Stage 2 |
| P3 | Automated security testing in CI (SAST, dependency audit) | Stage 2 |
| P3 | Independent review / pen test before any pilot | Stage 3 |
