# Authorization and Audit — MedIntel Nexus

**Status:** Design document + implemented prototype enforcement · v0.9 · 2026-10-27

---

## 1. Authorization principles

1. **Server-side, every request, deny by default.** A 404/403 is produced before any data
   is read when the decision is deny.
2. **Decisions are computed, never requested.** Clients declare *what* they want; the
   server derives *who they are* from the session and decides.
3. **UI restrictions are cosmetic.** Hiding a button is usability; the API still refuses.
4. **Separation of duties.** Administrative privilege never implies clinical access
   (`admin.*` ∩ `clinical.*` = ∅).
5. **Minimum necessary.** Grants name record types; broader access must be requested and
   approved explicitly.
6. **Patient scoping.** Assignment to the specific patient is required, not just the right
   role.

## 2. Decision inputs

| Input | Source | Trust |
|---|---|---|
| Principal identity | Session (server-side) | Trusted |
| Roles | Session | Trusted |
| Patient assignments | Store, read fresh | Trusted |
| Department | Store | Trusted |
| Requested action | Route declaration (server code) | Trusted |
| Resource (patient, record type) | Route parameters, validated | Validated |
| Context (time window, agent grant) | Store / clock | Trusted |

Client-supplied fields such as a body-level `role` or `patientId` override nothing
(test T-02).

## 3. Evaluation order

```
authenticate → resolve principal (role, assignments, department)
            → check deny rules (explicit deny list, admin/clinical separation, agent deny list)
            → check grant (action ∈ permissions(role) AND patient ∈ assignments(principal))
            → context checks (agent validity window, record type in grant)
            → ALLOW or DENY(default) → write audit event → proceed or 403
```

## 4. Audit event schema

```json
{
  "id": "uuid",
  "at": "2026-10-27T10:00:00.000Z",
  "actor": { "type": "user|agent|system", "id": "U-001", "role": "doctor" },
  "action": "patient.timeline.read",
  "resource": { "type": "patient", "id": "SYN-P-0042" },
  "decision": "allow|deny",
  "reason": "assigned_clinician|not_in_grant|deny_list|no_assignment|egress_not_granted|...",
  "requestId": "uuid",
  "synthetic": true
}
```

**Both outcomes are logged.** An audit log that records only allows cannot answer "what
was blocked and why", and an audit log that records only denies cannot answer "who touched
this patient".

## 5. Integrity controls

| Control | Level | Notes |
|---|---|---|
| Single write path (`audit.append`) | Application | No other module writes audit rows |
| No update/delete API | Application | Prototype exposes append + read only |
| Monotonic IDs + timestamps | Application | Ordering evidence |
| Tamper-evident hash chaining | **Not implemented** | Design: each row carries `hash = H(prev_hash || row)` |
| WORM / immutable storage, off-host replication | **Not implemented** | Required before any real pilot |

**Honest statement:** in Round 1, audit integrity is an application-level guarantee. A host
administrator could modify the database. This is documented rather than glossed over
(`docs/security/THREAT_MODEL.md` §6).

## 6. Access review and accountability

- Every privileged operation resolves to a named principal or a registered agent — there
  are no shared "service doctor" identities in the model.
- Nurses' and doctors' actions are attributable individually (AT-04, AT-15).
- Break-glass review is designed (`docs/architecture/ROLE_AND_PATIENT_ACCESS_MODEL.md`
  §7) but not implemented.

## 7. Verification

| Property | Test |
|---|---|
| Assigned doctor can read their patient | AT-01, AT-02 |
| Unassigned access denied | AT-03 |
| Nurse actions attributable, nurse cannot decide clinically | AT-04, AT-05 |
| Admin cannot read clinical data | AT-06 |
| Unauthorized record modification denied | AT-05 |
| Agent scope enforced, agent cannot decide | AT-13, AT-14 |
| Egress denied without grant | AT-17 |
| Every decision logged | AT-15 |
| Suggestion requires clinician review | AT-12 |

Actual results: `docs/validation/ROUND_1_ACCEPTANCE_TESTS.md`.
