# Privacy and Data Governance — MedIntel Nexus

**Status:** Design document for Round 1 · v0.9 · 2026-10-27

---

## 1. Data inventory

| Dataset | Contains | Origin | Round 1 status | Production classification |
|---|---|---|---|---|
| Patient demographics | Name, age, sex, IDs | Synthetic generator | **Synthetic, labelled** | PHI |
| Timeline events | Encounters, notes, diagnoses | Synthetic | **Synthetic, labelled** | PHI |
| Observations (vitals) | Metric, value, unit, device, time | Simulated stream | **Synthetic, labelled** | PHI |
| CDS suggestions + decisions | Differential, evidence, clinician ID | Generated in-app | Synthetic data + real user identity (in production) | PHI + professional record |
| User accounts | Name, role, assignment | Seeded | Demo accounts only | Personal data |
| Audit log | Who did what, when, decision, reason | App-generated | Contains demo identities | Security/audit record |

**No real patient data exists anywhere in this repository.** Every record carries a
`synthetic: true` marker and demo surfaces display a synthetic-data banner.

## 2. Principles applied

1. **Lawful-basis and purpose limitation (design-level).** Access is granted per role,
   patient and record type; the model records *why* a principal could act (assignment),
   supporting purpose limitation. Legal-basis determination for a real deployment is a
   partner-organisation responsibility and is explicitly not addressed here.
2. **Minimum necessary.** Encoded in policy, not only in procedure (record-type-scoped
   grants).
3. **Storage limitation.** Retention policy below; prototype data is disposable by design.
4. **Integrity and confidentiality.** Encryption in transit (TLS in deployment) and at
   rest (managed DB encryption in deployment). The localhost demo uses neither — stated.
5. **Accountability.** Audit coverage of privileged operations; see
   `docs/security/AUTHORIZATION_AND_AUDIT.md`.

## 3. Retention and deletion (designed policy)

| Data | Proposed retention | Deletion method |
|---|---|---|
| Clinical records | Per organisational policy + local law (to be defined with partner) | Cascading hard delete with a tombstone audit event |
| Observations | Rolling window (e.g. raw high-frequency data 90 days, aggregates longer) | Automated partition drop |
| Audit log | Longest of the above (audit must outlive the data it describes, subject to law) | No in-app deletion; retention by archival |
| Demo datasets | Indefinite, but synthetic and non-sensitive | Trivial: delete the file |

Deletion requests ("right to be forgotten") conflict with clinical-record retention
obligations — flagged for the partner's DPO, not solved unilaterally by the product.

## 4. De-identification posture

- Round 1 uses **synthetic** data, which is stronger than de-identified data: there is no
  real subject to re-identify.
- If a future pilot uses real records, the required steps (pseudonymisation, key
  separation, access logging, disclosure review) must be completed **before** any data
  enters the system — this repository's pipeline accepts a `synthetic` flag and should
  refuse non-synthetic sources until that review exists.

## 5. Secrets and credential handling

- No secrets are required to run or build this project.
- `.gitignore` blocks `.env*`, private keys, credential files.
- No API keys appear in source, documents, or commits (verified in
  `docs/audit/FINAL_QUALITY_AUDIT.md`).
- Demo credentials are fixed, obviously-fake, and local-only; they must be replaced by an
  auth provider before any shared deployment.

## 6. Cross-border / third-party processing

None in Round 1: no cloud services, no analytics, no telemetry, no external API calls.
Any future introduction of a third-party service (LLM API, hosting, analytics) requires a
documented data-flow review and, for PHI, a contractual basis — recorded here so the
default stays "nothing leaves the box".

## 7. Governance gaps to close before any real use

1. Data-protection impact assessment (DPIA) with the partner organisation.
2. Defined retention periods aligned with applicable law.
3. Named data controller/processor roles — not determinable by this team alone.
4. Breach-notification runbook (summary in `docs/security/THREAT_MODEL.md` remediation).
5. Consent/notice text for patients, if applicable.

## 8. Incident response (summary)

`detect → contain → preserve audit evidence → assess → notify per policy → remediate →
post-mortem`. Prototype support: the append-only audit log is the primary evidence source;
there is **no automated alerting** in Round 1 — an operational gap, stated as such.
