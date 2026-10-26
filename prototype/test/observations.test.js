// AT-07 .. AT-11 - observation contract, quality flags, and live stream.
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { boot, login, get, post, DEMO } from './helpers.js';
import { validate, ingest, observationsFor, quarantinedObservations, clearObservations } from '../src/observations.js';
import { auditLog } from '../src/store.js';

let ctx;
let doctorToken;
let nurseToken;

const NOW = Date.parse('2026-10-27T10:00:00Z');

before(async () => {
  ctx = await boot();
  doctorToken = (await login(ctx.base, DEMO.doctor.username, DEMO.doctor.password)).token;
  nurseToken = (await login(ctx.base, DEMO.nurse.username, DEMO.nurse.password)).token;
  clearObservations();
  auditLog.clear();
});

after(async () => ctx.close());

test('AT-07: observations carry source, timestamp, units and a quality verdict', () => {
  const { observation } = ingest(
    {
      patientId: 'SYN-P-0042',
      deviceId: 'SIM-MON-01',
      metric: 'spo2',
      value: 97,
      unit: '%',
      observedAt: '2026-10-27T09:59:30Z',
      correlationId: 'SYN-P-0042',
    },
    NOW,
  );
  assert.equal(observation.verdict, 'OK');
  for (const field of ['patientId', 'deviceId', 'metric', 'value', 'unit', 'observedAt', 'receivedAt', 'verdict']) {
    assert.ok(observation[field] !== undefined && observation[field] !== null, `missing ${field}`);
  }
  assert.equal(observation.synthetic, true);
  assert.ok(String(observation.thresholdSource).includes('not clinically approved'));
});

test('AT-08: a stale observation is flagged STALE, not presented as current', () => {
  const { observation } = ingest(
    {
      patientId: 'SYN-P-0042',
      deviceId: 'SIM-MON-01',
      metric: 'heart_rate',
      value: 80,
      unit: 'bpm',
      observedAt: '2026-10-27T09:50:00Z', // 10 minutes old, window is 60 s
      correlationId: 'SYN-P-0042',
    },
    NOW,
  );
  assert.equal(observation.verdict, 'STALE');
  assert.ok(observation.flags.includes('STALE'));
  const current = observationsFor('SYN-P-0042').filter((o) => o.verdict === 'STALE');
  assert.equal(current.length, 1);
  assert.ok(current[0].observedAt !== current[0].receivedAt, 'device time and ingest time must stay distinct');
});

test('AT-09: an implausible value is flagged IMPLAUSIBLE', () => {
  const { observation } = ingest(
    {
      patientId: 'SYN-P-0042',
      deviceId: 'SIM-MON-01',
      metric: 'heart_rate',
      value: 400, // outside demo bounds 20-250
      unit: 'bpm',
      observedAt: '2026-10-27T10:00:00Z',
      correlationId: 'SYN-P-0042',
    },
    NOW,
  );
  assert.equal(observation.verdict, 'IMPLAUSIBLE');
  assert.ok(observation.flags.includes('IMPLAUSIBLE'));
});

test('AT-10: an observation linked to the wrong patient is quarantined', () => {
  const { observation } = ingest(
    {
      patientId: 'SYN-P-0042',
      deviceId: 'SIM-MON-01',
      metric: 'heart_rate',
      value: 75,
      unit: 'bpm',
      observedAt: '2026-10-27T10:00:00Z',
      correlationId: 'SYN-P-0043', // wrong patient
    },
    NOW,
  );
  assert.equal(observation.verdict, 'PATIENT_MISMATCH');
  assert.ok(observation.quarantined);
  assert.ok(
    !observationsFor('SYN-P-0042').some((o) => o.verdict === 'PATIENT_MISMATCH'),
    'quarantined data must not appear in the patient view',
  );
  assert.ok(quarantinedObservations().some((o) => o.correlationId === 'SYN-P-0043'));
});

test('AT-07b: schema and unit failures are rejected with a logged error', () => {
  const missing = validate({ patientId: 'SYN-P-0042' }, NOW);
  assert.equal(missing.error, 'INVALID');
  const wrongUnit = validate(
    { patientId: 'SYN-P-0042', deviceId: 'D1', metric: 'heart_rate', value: 80, unit: 'mmHg', observedAt: '2026-10-27T10:00:00Z', correlationId: 'SYN-P-0042' },
    NOW,
  );
  assert.equal(wrongUnit.error, 'UNIT_MISMATCH');
});

test('AT-11: simulated vital updates reach the authorized dashboard in real time', async () => {
  // 1. An unauthorized principal (admin) must not open the stream.
  const adminToken = (await login(ctx.base, DEMO.admin.username, DEMO.admin.password)).token;
  const denied = await fetch(`${ctx.base}/api/stream/SYN-P-0042`, { headers: { authorization: `Bearer ${adminToken}` } });
  assert.equal(denied.status, 403);

  // 2. The assigned doctor subscribes.
  const controller = new AbortController();
  const res = await fetch(`${ctx.base}/api/stream/SYN-P-0042`, {
    headers: { authorization: `Bearer ${doctorToken}` },
    signal: controller.signal,
  });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /text\/event-stream/);

  const reader = res.body.getReader();
  let buffer = '';
  const readUntil = async (needle) => {
    const deadline = Date.now() + 5000;
    while (Date.now() < deadline) {
      if (buffer.includes(needle)) return buffer;
      const { value, done } = await reader.read();
      if (done) break;
      buffer += Buffer.from(value).toString('utf8');
    }
    if (buffer.includes(needle)) return buffer;
    throw new Error(`stream did not deliver ${needle}; got: ${buffer}`);
  };

  await readUntil('"type":"connected"');

  // 3. A nurse posts a new observation; the doctor's stream must receive it.
  const posted = await post(ctx.base, '/api/patients/SYN-P-0042/observations', nurseToken, {
    patientId: 'SYN-P-0042',
    deviceId: 'SIM-BEDSIDE-02',
    metric: 'temperature',
    value: 36.8,
    unit: 'C',
    observedAt: new Date().toISOString(),
    correlationId: 'SYN-P-0042',
  });
  assert.equal(posted.status, 201);

  const seen = await readUntil('"type":"observation"');
  assert.ok(seen.includes('SIM-BEDSIDE-02'));

  controller.abort();
  await reader.cancel().catch(() => {});
});

test('AT-11b: audit records both allow and deny decisions with complete fields', async () => {
  const events = auditLog.all();
  assert.ok(events.some((e) => e.decision === 'allow'), 'expected allow rows');
  assert.ok(events.some((e) => e.decision === 'deny'), 'expected deny rows');
  for (const e of events) {
    assert.ok(e.actor && e.actor.type, 'actor.type required');
    assert.ok(e.action, 'action required');
    assert.ok(e.decision === 'allow' || e.decision === 'deny', 'decision must be allow/deny');
    assert.ok(e.reason, 'reason required');
    assert.ok(e.at, 'timestamp required');
    assert.equal(e.synthetic, true);
  }
});
