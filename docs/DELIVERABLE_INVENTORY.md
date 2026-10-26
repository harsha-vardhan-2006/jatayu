# Deliverable Inventory — Round 1 Package

**Updated:** 2026-10-27
**Legend — Status:** ✅ complete · 🟡 complete but provisional/pending input · ⛔ blocked
**Legend — Required?** "Official-unknown" = required only if the (unretrieved) official
brief demands it; "Recommended" = chosen quality bar (P-01…P-07).

| Path | Purpose | Required? | Source requirement | Status | Validation performed | Remaining issue |
|---|---|---|---|---|---|---|
| `README.md` | Repository entry point | Recommended | P-01 | ✅ | Read-through; links resolve to existing files | — |
| `.gitignore` | Block secrets/build output | Mandatory (self-imposed) | Rule 11 | ✅ | Secret scan in final audit | — |
| `docs/audit/INITIAL_REPOSITORY_AUDIT.md` | Phase 0 record | Mandatory (task §2) | Task §2 | ✅ | Findings match verbatim git output | — |
| `docs/competition/ROUND_1_REQUIREMENTS_REGISTER.md` | Verified/unknown requirements | Mandatory (task §3) | Task §3 | 🟡 | Every row has source + status | Official packet missing (R-10…R-20) |
| `docs/competition/SOURCE_REGISTER.md` | Source traceability | Mandatory (task §3) | Task §3 | ✅ | Each URL checked for retrieval status | — |
| `docs/strategy/HLS_CHALLENGE_COMPARISON.md` | Challenge evaluation | Mandatory (task §4) | Task §4 | 🟡 | Matrix totals recomputed | Official challenge list missing |
| `docs/strategy/SELECTED_CHALLENGE_AND_RATIONALE.md` | Selection + scope | Mandatory (task §4) | Task §4 | 🟡 | Conflicts table complete | Must re-map to official wording |
| `docs/strategy/REQUIREMENT_TO_FEATURE_TRACEABILITY.md` | Req → feature → test | Mandatory (task §4) | Task §4, P-05 | ✅ | Every "Implemented" row has a passing test | Deferred rows intentionally untested |
| `submission/ROUND_1_PROPOSAL.md` | Main submission | Official-unknown (task §5/7) | Task §4 A | 🟡 | All 18 questions answered; consistent with other docs | Team block + official challenge wording |
| `submission/EXECUTIVE_SUMMARY.md` | Fast reviewer read | Recommended (P-01) | Task §4 B | ✅ | Claims cross-checked vs. proposal | — |
| `submission/ROUND_1_PRESENTATION.md` | Deck outline | Official-unknown (task §4 C) | Task §4 C | 🟡 | Slide topics map to proposal sections | Slide limit unknown (R-11); no `.pptx` produced (R-10) |
| `submission/TEAM_INFORMATION_REQUIRED.md` | Team details checklist | Official-unknown (R-16) | Task §6 | ⛔ | Explicitly marked NOT for submission | All `_TODO_` fields need the team |
| `docs/architecture/SYSTEM_ARCHITECTURE.md` | Architecture | Recommended (P-03) | Task §4 D | ✅ | Matches prototype modules | — |
| `docs/architecture/DATA_FLOW_AND_TRUST_BOUNDARIES.md` | Data flows/boundaries | Recommended (P-03) | Task §4 D | ✅ | Flows match implemented routes | — |
| `docs/architecture/ROLE_AND_PATIENT_ACCESS_MODEL.md` | Roles/permissions | Recommended (P-03) | Task §4 D | ✅ | Matrix matches `policy.js` | Break-glass designed only |
| `docs/architecture/INTEGRATION_AND_DEVICE_STRATEGY.md` | Adapters/standards | Recommended (P-03) | Task §4 D | ✅ | Explicitly "not connected" everywhere | Real integrations are future work |
| `docs/security/THREAT_MODEL.md` | Threats & controls | Recommended (P-03) | Task §4 E | ✅ | Each threat maps to control/test or is marked unimplemented | No security testing performed |
| `docs/security/AGENT_TRUST_LAYER.md` | Agent enforcement | Recommended (P-03) | Task §4 E | ✅ | Scenarios map to AT-13/14/17 | Output redaction not implemented |
| `docs/security/AUTHORIZATION_AND_AUDIT.md` | Authz & audit design | Recommended (P-03) | Task §4 E | ✅ | Properties map to AT-01…AT-17 | Audit integrity is app-level |
| `docs/security/PRIVACY_AND_DATA_GOVERNANCE.md` | Privacy/governance | Recommended (P-03) | Task §4 E | ✅ | Data inventory matches actual files | DPO/legal items need a partner |
| `docs/clinical/CLINICAL_SAFETY_AND_LIMITATIONS.md` | Safety position | Recommended (P-03) | Task §4 F | ✅ | No unsupported clinical claims found | — |
| `docs/clinical/AI_VALIDATION_PLAN.md` | Validation roadmap | Recommended (P-03) | Task §4 F | ✅ | Clearly labelled "not executed" | — |
| `docs/clinical/SENSOR_DATA_QUALITY.md` | Data quality rules | Recommended (P-03) | Task §4 F | ✅ | Thresholds match `observations.js` and are labelled illustrative | Clinically unapproved |
| `docs/validation/ROUND_1_ACCEPTANCE_TESTS.md` | Test spec + results | Recommended (P-05) | Task §4 G | ✅ | Run executed: 25/25 pass recorded | — |
| `docs/validation/IMPACT_METRICS.md` | Metrics plan | Recommended (P-05) | Task §4 G | ✅ | Every metric labelled target-not-result | No pilot data |
| `docs/validation/KNOWN_LIMITATIONS.md` | Limitations register | Recommended (P-06) | Task §4 G | ✅ | Cross-checked against actual state | — |
| `docs/DEMO_GUIDE.md` | Reproducible run guide | Recommended (task §7) | Task §7 | ✅ | Commands executed successfully | — |
| `docs/DEMO_SCENARIOS.md` | Scripted demos | Recommended (task §7) | Task §7 | ✅ | Each step names its covering test | — |
| `prototype/` (source + tests) | Demonstration | Conditional (R-18 unknown) | Task §7 | ✅ | 25/25 tests pass; manual HTTP run verified | Scope intentionally minimal |
| `THIRD_PARTY_NOTICES.md` | Asset/license register | Mandatory-if-relevant (task §6) | Task §6 | ✅ | Lists zero runtime deps (verified by empty `node_modules`/lockfile) | — |
| `docs/DELIVERABLE_INVENTORY.md` | This inventory | Mandatory (task §9) | Task §9 | ✅ | Self-referential row included | — |
| `docs/audit/FINAL_QUALITY_AUDIT.md` | QA record | Mandatory (task §10) | Task §10 | ✅ | See file for the executed checks | — |
| `docs/audit/FINAL_GIT_AND_RELEASE_REPORT.md` | Release record | Mandatory (task §11) | Task §11 | ✅ | See file for hashes and push status | — |

## Artifacts deliberately NOT produced

| Artifact | Reason |
|---|---|
| `submission/ROUND_1_PRESENTATION.pptx` | Official format unknown (R-10) **and** no conversion toolchain on this machine (no Python/LibreOffice/pandoc). Markdown outline is the editable source. |
| PDF/DOCX proposal | Same reason as above |
| Real-patient anything | Prohibited (Rule 10) |
| Signed declarations | Cannot sign on behalf of team members (Task §6) |
