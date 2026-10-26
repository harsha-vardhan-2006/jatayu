// Observation ingestion with a mandatory quality gate.
// Bad data is preserved WITH a verdict - never silently dropped, never shown as valid.
// NOTE: thresholds are illustrative demo defaults, not clinically approved limits.

export const METRICS = {
  heart_rate: { unit: 'bpm', freshnessMs: 60_000, min: 20, max: 250 },
  spo2: { unit: '%', freshnessMs: 60_000, min: 50, max: 100 },
  systolic_bp: { unit: 'mmHg', freshnessMs: 120_000, min: 40, max: 260 },
  respiratory_rate: { unit: '/min', freshnessMs: 120_000, min: 4, max: 60 },
  temperature: { unit: 'C', freshnessMs: 300_000, min: 30, max: 43 },
};

const accepted = []; // validated observations
const quarantined = []; // patient-correlation failures

const REQUIRED_FIELDS = ['patientId', 'deviceId', 'metric', 'value', 'unit', 'observedAt'];

/**
 * Validate a raw observation.
 * Check order: schema -> unit -> freshness -> plausibility -> patient correlation.
 * Verdict: PATIENT_MISMATCH always quarantines; otherwise first failing check wins.
 */
export function validate(raw, now = Date.now()) {
  if (!raw || typeof raw !== 'object') return { error: 'INVALID', detail: 'not_an_object' };
  for (const field of REQUIRED_FIELDS) {
    if (raw[field] === undefined || raw[field] === null) {
      return { error: 'INVALID', detail: `missing_field:${field}` };
    }
  }
  if (typeof raw.value !== 'number' || Number.isNaN(raw.value)) {
    return { error: 'INVALID', detail: 'value_not_numeric' };
  }

  const spec = METRICS[raw.metric];
  if (!spec) return { error: 'UNIT_MISMATCH', detail: `unknown_metric:${raw.metric}` };
  if (raw.unit !== spec.unit) {
    return { error: 'UNIT_MISMATCH', detail: `expected:${spec.unit}:got:${raw.unit}` };
  }

  const observedAt = Date.parse(raw.observedAt);
  if (Number.isNaN(observedAt)) return { error: 'INVALID', detail: 'observedAt_not_iso' };

  const flags = [];
  if (now - observedAt > spec.freshnessMs) flags.push('STALE');
  if (raw.value < spec.min || raw.value > spec.max) flags.push('IMPLAUSIBLE');
  const mismatch = Boolean(raw.correlationId) && raw.correlationId !== raw.patientId;
  if (mismatch) flags.push('PATIENT_MISMATCH');

  const verdict = mismatch ? 'PATIENT_MISMATCH' : flags[0] ?? 'OK';
  return {
    observation: {
      patientId: raw.patientId,
      deviceId: raw.deviceId,
      metric: raw.metric,
      value: raw.value,
      unit: raw.unit,
      observedAt: new Date(observedAt).toISOString(),
      receivedAt: new Date(now).toISOString(),
      correlationId: raw.correlationId ?? null,
      verdict,
      flags,
      quarantined: mismatch,
      freshnessWindowMs: spec.freshnessMs,
      bounds: { min: spec.min, max: spec.max },
      thresholdSource: 'illustrative-demo-default (not clinically approved)',
      synthetic: true,
    },
  };
}

/** Run through the quality gate and store the result. */
export function ingest(raw, now = Date.now()) {
  const result = validate(raw, now);
  if (result.error) return result;
  const obs = result.observation;
  if (obs.quarantined) quarantined.push(obs);
  else accepted.push(obs);
  return { observation: obs };
}

export function observationsFor(patientId, { includeQuarantined = false } = {}) {
  const pool = includeQuarantined ? [...accepted, ...quarantined] : accepted;
  return pool.filter((o) => o.patientId === patientId);
}

export function quarantinedObservations() {
  return [...quarantined];
}

export function clearObservations() {
  // Test support only.
  accepted.length = 0;
  quarantined.length = 0;
}
