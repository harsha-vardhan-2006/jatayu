# Role and Patient Access Model — MedIntel Nexus

**Status:** Design document for Round 1 · v0.9 · 2026-10-27

---

## 1. Authorization formula

Every protected operation is decided by:

```
decision = f(role, patient assignment, department, record type, requested action, context)
```

Evaluated **server-side, per request, deny by default.** A missing decision is a deny.

## 2. Roles and permission classes

| Role | Intended capability | Explicitly NOT granted |
|---|---|---|
| `doctor` | Read timeline/vitals, request CDS suggestions, record clinical decisions, write notes for **assigned** patients | Access to unassigned patients; admin functions |
| `nurse` | Read assigned patients, write observations and task records, read clinical timeline | Recording clinical decisions, changing assignments |
| `admin` | Provision users, manage assignments and department metadata | **Any clinical data read/write** — admin rights are account-management rights only |
| `agent` (non-human) | Tool calls within a registered, explicitly granted scope | Anything outside its grant; all egress unless separately granted |

### Permission classes used by the prototype

`patient.read`, `patient.timeline.read`, `observation.read`, `observation.write`,
`cds.request`, `cds.decide`, `record.amend`, `admin.users`, `admin.assignments`,
`agent.invoke`, `egress.export`.

> `admin.users` and `clinical:*` are **disjoint sets by design**. Holding one never
> implies the other (verified by test AT-06).

## 3. Patient assignment

- Assignments are data: `(user, patient, department, valid_from, valid_to)`.
- Assignment is the primary scoping key: a doctor with no assignment to patient *P* is
  denied every operation on *P*, regardless of role (AT-03).
- Revoking an assignment takes effect on the next request — no cached entitlements.

## 4. Role × action matrix (server-enforced)

| Action | doctor (assigned) | doctor (unassigned) | nurse (assigned) | admin | agent (granted) | agent (not granted) |
|---|---|---|---|---|---|---|
| `patient.read` | ✅ | ❌ | ✅ | ❌ | ✅ if in scope | ❌ |
| `patient.timeline.read` | ✅ | ❌ | ✅ | ❌ | ✅ if in scope | ❌ |
| `observation.read` | ✅ | ❌ | ✅ | ❌ | ✅ if in scope | ❌ |
| `observation.write` | ✅ | ❌ | ✅ (assigned) | ❌ | ❌ (unless granted) | ❌ |
| `cds.request` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `cds.decide` | ✅ | ❌ | ❌ | ❌ | ❌ **always** | ❌ |
| `record.amend` | ✅ | ❌ | ❌ (prototype) | ❌ | ❌ | ❌ |
| `admin.users` | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `egress.export` | ❌ (not used) | ❌ | ❌ | ❌ | ✅ only if explicitly granted | ❌ |

Tests: AT-02 … AT-06, AT-12, AT-13, AT-17 in
`docs/validation/ROUND_1_ACCEPTANCE_TESTS.md`.

## 5. Record types and minimum necessary

Record types are enumerated (demographics, timeline event, observation, note, CDS
decision). Grants name record types explicitly; a grant to `observation.read` does not
imply `note.read`. This encodes the *minimum necessary* principle in the policy itself
rather than in policy documents alone.

## 6. Amendments and provenance

- Clinical records are versioned: an edit writes `(record, version, author, timestamp,
  reason, new content)`.
- Readers see the current version with a "history" affordance; prior versions are
  retrievable.
- Nothing in the API accepts an unattributed write: principal identity comes from the
  session, never from the request body.

## 7. Emergency (break-glass) access — DESIGNED, NOT IMPLEMENTED

Design: a clinician may request emergency access to an unassigned patient; the request
requires a reason code, is granted for a short TTL, is visible in real time to
administrators, and produces a prominent audit event flagged for post-hoc review.
**Status in Round 1: documented only** (TR-23). Implementing it without an operational
review process would create the appearance of a control that nobody monitors.

## 8. Known limitations of this model

1. No attribute-based context yet (time-of-day, location, patient consent flags) — the
   signature allows adding them without breaking callers.
2. Delegation ("cover for Dr X") is not modelled.
3. The prototype demonstrates the model; hardening (rate limiting, session revocation,
   MFA) belongs to a production auth provider.
