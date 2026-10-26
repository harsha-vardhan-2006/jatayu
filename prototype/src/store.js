// Synthetic data store for the MedIntel Nexus Round 1 demonstration.
// EVERY record in this file is synthetic. There is no real patient data here.

let auditSeq = 0;

export const auditLog = {
  /** Append-only: there is intentionally no update or delete method. */
  append(event) {
    auditSeq += 1;
    const row = Object.freeze({
      id: `A-${String(auditSeq).padStart(5, '0')}`,
      at: new Date().toISOString(),
      requestId: event.requestId ?? null,
      actor: Object.freeze({ ...event.actor }),
      action: event.action,
      resource: Object.freeze({ ...event.resource }),
      decision: event.decision, // 'allow' | 'deny'
      reason: event.reason,
      synthetic: true,
    });
    rows.push(row);
    return row;
  },
  all() {
    return [...rows];
  },
  clear() {
    // Test-support only; never reachable from the HTTP API.
    rows.length = 0;
    auditSeq = 0;
  },
};
const rows = [];

// ---------------------------------------------------------------------------
// Synthetic users (demo personas, not real people)
// ---------------------------------------------------------------------------
export const users = [
  { id: 'U-DOC-01', username: 'doctor-demo', displayName: 'Dr. Ananya Rao (synthetic persona)', role: 'doctor', synthetic: true },
  { id: 'U-NUR-01', username: 'nurse-demo', displayName: 'Nurse Balu (synthetic persona)', role: 'nurse', synthetic: true },
  { id: 'U-ADM-01', username: 'admin-demo', displayName: 'SysAdmin Chitra (synthetic persona)', role: 'admin', synthetic: true },
];

// Demo-grade credentials for a local synthetic demo only. NOT secrets, NOT reusable,
// and never valid anywhere but localhost.
export const demoPasswords = {
  'doctor-demo': 'demo-only-doctor',
  'nurse-demo': 'demo-only-nurse',
  'admin-demo': 'demo-only-admin',
};

// ---------------------------------------------------------------------------
// Synthetic patients and assignments
// ---------------------------------------------------------------------------
export const patients = [
  {
    id: 'SYN-P-0042',
    name: 'Synthetic Patient Alpha',
    age: 58,
    sex: 'F',
    department: 'general-ward',
    synthetic: true,
    timeline: [
      { at: '2026-10-20T09:15:00Z', kind: 'encounter', text: 'Admitted for elective observation (synthetic)', version: 1 },
      { at: '2026-10-21T11:00:00Z', kind: 'note', text: 'Physiotherapy review, mobilising well (synthetic)', version: 1 },
      { at: '2026-10-24T08:30:00Z', kind: 'diagnosis', text: 'Synthetic working diagnosis under review', version: 1 },
    ],
  },
  {
    id: 'SYN-P-0043',
    name: 'Synthetic Patient Beta',
    age: 44,
    sex: 'M',
    department: 'general-ward',
    synthetic: true,
    timeline: [
      { at: '2026-10-23T14:00:00Z', kind: 'encounter', text: 'Admitted after synthetic fall (synthetic)', version: 1 },
    ],
  },
  {
    id: 'SYN-P-0044',
    name: 'Synthetic Patient Gamma',
    age: 71,
    sex: 'F',
    department: 'other-ward',
    synthetic: true,
    timeline: [
      { at: '2026-10-22T07:45:00Z', kind: 'encounter', text: 'Admitted to a different ward (synthetic)', version: 1 },
    ],
  },
];

export const assignments = [
  { userId: 'U-DOC-01', patientId: 'SYN-P-0042', department: 'general-ward' },
  { userId: 'U-DOC-01', patientId: 'SYN-P-0043', department: 'general-ward' },
  { userId: 'U-NUR-01', patientId: 'SYN-P-0042', department: 'general-ward' },
];

export function getPatient(id) {
  return patients.find((p) => p.id === id) ?? null;
}

export function isAssigned(userId, patientId) {
  return assignments.some((a) => a.userId === userId && a.patientId === patientId);
}

export function patientIdsFor(userId) {
  return assignments.filter((a) => a.userId === userId).map((a) => a.patientId);
}

export function amendTimelineEntry(patientId, entryIndex, newText, author, reason) {
  const patient = getPatient(patientId);
  if (!patient) throw new Error('unknown patient');
  const entry = patient.timeline[entryIndex];
  if (!entry) throw new Error('unknown timeline entry');
  const previous = { ...entry };
  // Append-only amendment: a new version is added with provenance; the old text is kept.
  const amended = {
    at: new Date().toISOString(),
    kind: entry.kind,
    text: newText,
    version: previous.version + 1,
    amendedBy: author,
    amendmentReason: reason ?? 'unspecified',
    previousVersion: { text: previous.text, version: previous.version },
    synthetic: true,
  };
  patient.timeline[entryIndex] = amended;
  return amended;
}
