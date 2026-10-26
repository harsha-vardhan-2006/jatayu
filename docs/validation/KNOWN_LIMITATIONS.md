# Known Limitations — MedIntel Nexus

**Status:** Honest limitations register · v0.9 · 2026-10-27
**Purpose:** state plainly what this package does *not* do, so no reviewer discovers a
gap we implied away.

---

## 1. Competition-process limitations

| # | Limitation | Impact |
|---|---|---|
| L-01 | Official Season 6 Round 1 brief, HLS challenge wording, rubric, deadline and portal are **unknown** | Package is provisional; framing may need revision |
| L-02 | Team member/college/mentor details unknown | Submission documents contain placeholders (`submission/TEAM_INFORMATION_REQUIRED.md`) |
| L-03 | No `.pptx`/`.pdf`/`.docx` generated: no official format requirement known, and no conversion toolchain installed (no Python, LibreOffice, or pandoc) | Markdown sources are final-for-review; conversion is pending |

## 2. Technical limitations

| # | Limitation | Impact |
|---|---|---|
| L-04 | Single-process prototype; no horizontal scaling, no rate limiting, no DoS protection | Acceptable for demo only |
| L-05 | Demo authentication is minimal (server-issued session tokens, no MFA, no revocation UI, no TLS on localhost) | Not production-grade |
| L-06 | Audit integrity is application-level; no hash chain, no WORM storage | Host admin could tamper |
| L-07 | Zero real integrations: no FHIR endpoint, no DICOM/PACS, no device adapters | Documented as adapters only |
| L-08 | Real-time updates use SSE/polling, not a production message bus | Scale limit |
| L-09 | No automated alerting or incident detection | Operational gap |
| L-10 | Agent output redaction/size limits not implemented | Minimum-necessary not enforced on output side |
| L-11 | Break-glass emergency access designed but not implemented | Clinical workflow incomplete |
| L-12 | No security testing performed (no pen test, SAST/DAST) | Residual risk acknowledged in threat model |

## 3. Clinical / AI limitations

| # | Limitation | Impact |
|---|---|---|
| L-13 | **No clinical validation of any kind.** No model performance metrics exist | Nothing here may be used for care decisions |
| L-14 | The differential generator is a deterministic demo routine, not a trained model | Demonstrates workflow only |
| L-15 | Thresholds are illustrative, not clinically approved | Must be replaced before real use |
| L-16 | No regulatory classification assessment (SaMD pathway undetermined) | Blocks deployment |
| L-17 | Synthetic data only: no evidence the UX works with real-world data messiness | Needs a real-data phase |

## 4. Evidence limitations

| # | Limitation | Impact |
|---|---|---|
| L-18 | No screenshots of a running system are included (they would be unverifiable inside a document) | Reviewers should run the demo themselves (`docs/DEMO_GUIDE.md`) |
| L-19 | No user research, usability testing, or clinician feedback yet | Assumptions about clinician needs are unvalidated |
| L-20 | Impact metrics are targets, not results | See `docs/validation/IMPACT_METRICS.md` |

## 5. How these are handled

- Every limitation above is repeated (not hidden) in the relevant document and summarized
  in the final quality audit.
- The submission status phrase used across this repository is: **"prepared, pending the
  official Round 1 brief, team details, and binary-format conversion if required."**
