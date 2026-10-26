// AT-01 .. AT-06 - server-side authorization and separation of duties.
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { boot, login, get, post, DEMO, auth } from './helpers.js';
import { auditLog } from '../src/store.js';

let ctx;
let doctorToken;
let nurseToken;
let adminToken;

before(async () => {
  ctx = await boot();
  doctorToken = (await login(ctx.base, DEMO.doctor.username, DEMO.doctor.password)).token;
  nurseToken = (await login(ctx.base, DEMO.nurse.username, DEMO.nurse.password)).token;
  adminToken = (await login(ctx.base, DEMO.admin.username, DEMO.admin.password)).token;
  auditLog.clear();
});

after(async () => ctx.close());

test('AT-01: an assigned doctor can read the patient timeline', async () => {
  const res = await get(ctx.base, '/api/patients/SYN-P-0042/timeline', doctorToken);
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.timeline) && res.body.timeline.length > 0);
  assert.equal(res.body.patient.synthetic, true);
});

test('AT-02: the allowed access is recorded as an explicit allow decision', async () => {
  const row = auditLog
    .all()
    .find((e) => e.action === 'patient.timeline.read' && e.decision === 'allow' && e.actor.id === 'U-DOC-01');
  assert.ok(row, 'expected an allow audit row for the doctor timeline read');
  assert.equal(row.reason, 'granted');
  assert.equal(row.resource.id, 'SYN-P-0042');
  assert.ok(row.at && row.requestId !== undefined);
});

test('AT-03: cross-patient access for an unassigned patient is denied', async () => {
  const res = await get(ctx.base, '/api/patients/SYN-P-0044/timeline', doctorToken);
  assert.equal(res.status, 403);
  assert.equal(res.body.reason, 'no_patient_assignment');
  const deny = auditLog
    .all()
    .find((e) => e.action === 'patient.timeline.read' && e.decision === 'deny' && e.resource.id === 'SYN-P-0044');
  assert.ok(deny, 'expected a deny audit row for the blocked read');
  assert.equal(deny.reason, 'no_patient_assignment');
});

test('AT-04: nurse observations are attributable to the nurse in the audit log', async () => {
  const created = await post(ctx.base, '/api/patients/SYN-P-0042/observations', nurseToken, {
    patientId: 'SYN-P-0042',
    deviceId: 'SIM-BEDSIDE-01',
    metric: 'heart_rate',
    value: 72,
    unit: 'bpm',
    observedAt: new Date().toISOString(),
    correlationId: 'SYN-P-0042',
  });
  assert.equal(created.status, 201);
  const row = auditLog
    .all()
    .find((e) => e.action === 'observation.write' && e.decision === 'allow' && e.actor.id === 'U-NUR-01');
  assert.ok(row, 'expected the nurse write to be attributed to U-NUR-01');
  assert.equal(row.actor.role, 'nurse');
});

test('AT-05: unauthorized staff cannot modify doctor-owned records', async () => {
  const res = await post(ctx.base, '/api/patients/SYN-P-0042/amendments', nurseToken, {
    entryIndex: 0,
    text: 'nurse attempt',
    reason: 'should be refused',
  });
  assert.equal(res.status, 403);
  assert.equal(res.body.reason, 'permission_not_granted');
});

test('AT-06: an administrator account cannot read clinical data', async () => {
  const res = await get(ctx.base, '/api/patients/SYN-P-0042/timeline', adminToken);
  assert.equal(res.status, 403);
  assert.equal(res.body.reason, 'admin_clinical_separation');

  const listing = await get(ctx.base, '/api/patients', adminToken);
  assert.equal(listing.status, 200);
  assert.deepEqual(listing.body.patients, [], 'admin must see no clinical records');
});

test('sanity: unauthenticated requests are refused', async () => {
  const res = await fetch(`${ctx.base}/api/patients/SYN-P-0042/timeline`);
  assert.equal(res.status, 401);
  const body = await res.json();
  assert.equal(body.error, 'authentication_required');
  assert.ok(auth(doctorToken).authorization.startsWith('Bearer '));
});
