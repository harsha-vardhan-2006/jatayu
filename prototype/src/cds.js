// Clinician-supervised decision support.
// The generator is a DETERMINISTIC DEMO ROUTINE, not a trained clinical model
// (see docs/clinical/CLINICAL_SAFETY_AND_LIMITATIONS.md section 5).

const suggestions = new Map(); // id -> suggestion
let seq = 0;

const TERMINAL = new Set(['accepted', 'accepted_with_modifications', 'rejected', 'deferred']);

/** Generate a demo differential for a patient, linked to its evidence. */
export function generate(patientId, timelineEntries) {
  seq += 1;
  const id = `SUG-${String(seq).padStart(4, '0')}`;
  const suggestion = {
    id,
    patientId,
    state: 'suggested', // suggested -> reviewed -> terminal
    synthetic: true,
    disclaimer:
      'SYNTHETIC DEMONSTRATION OUTPUT - a suggestion for clinician verification, not a diagnosis.',
    differentials: [
      { label: 'Demo differential A', note: 'Deterministic placeholder output' },
      { label: 'Demo differential B', note: 'Deterministic placeholder output' },
    ],
    evidence: timelineEntries.map((e, i) => ({
      timelineIndex: i,
      at: e.at,
      kind: e.kind,
      text: e.text,
    })),
    decision: null,
  };
  suggestions.set(id, suggestion);
  return suggestion;
}

export function get(id) {
  return suggestions.get(id) ?? null;
}

export function all() {
  return [...suggestions.values()];
}

/**
 * Record a clinician's review decision.
 * Only a human clinical principal may transition state; agents are rejected by callers
 * (agents.js deny-list) and again here as defence in depth.
 */
export function recordDecision(id, { decision, by, rationale }) {
  const s = suggestions.get(id);
  if (!s) return { ok: false, error: 'unknown_suggestion' };
  if (!by || by.type !== 'user') return { ok: false, error: 'only_a_human_clinician_may_record_a_decision' };
  if (s.state !== 'suggested') return { ok: false, error: `already_finalised:${s.state}` };
  const allowedDecisions = ['accepted', 'accepted_with_modifications', 'rejected', 'deferred'];
  if (!allowedDecisions.includes(decision)) return { ok: false, error: 'unknown_decision' };

  s.state = TERMINAL.has(decision) ? (decision === 'deferred' ? 'suggested' : 'reviewed') : s.state;
  s.decision = {
    decision,
    by: { id: by.id, role: by.role, displayName: by.displayName ?? by.id },
    at: new Date().toISOString(),
    rationale: rationale ?? '',
    reviewed: true,
    synthetic: true,
  };
  if (decision === 'deferred') s.state = 'suggested'; // deferred keeps it pending, but marks the attempt
  return { ok: true, suggestion: s };
}

export function clearSuggestions() {
  // Test support only.
  suggestions.clear();
  seq = 0;
}
