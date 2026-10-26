// AT-12 - clinical suggestions require clinician review; AT-16 - amendments keep provenance.
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { boot, login, get, post, DEMO } from './helpers.js';
import { auditLog, getPatient } from '../src/store.js';

let ctx;
let doctorToken;
let nurseToken;

before(async () => {
  ctx = await boot();
  doctorToken = (await login(ctx.base, DEMO.doctor.username, DEMO.doctor.password)).token;
  nurseToken = (await login(ctx.base, DEMO.nurse.username, DEMO.nurse.password)).token;
  auditLog.clear();
});

after(async () => ctx.close());

test('AT-12: a suggestion starts as suggested and no code path pre-accepts it', async () => {
  const created = await post(ctx.base, '/api/patients/SYN-P-0042/suggestions', doctorToken, {});
  assert.equal(created.status, 201);
  assert.equal(created.body.suggestion.state, 'suggested');
  assert.equal(created.body.suggestion.decision, null);
  assert.match(created.body.suggestion.disclaimer, /SYNTHETIC/i);
  assert.ok(created.body.suggestion.evidence.length > 0, 'evidence links are required');

  const id = created.body.suggestion.id;

  // A nurse (no clinical decision privilege) cannot record a decision.
  const nurseAttempt = await post(ctx.base, `/api/suggestions/${id}/decision`, nurseToken, {
    decision: 'accepted',
    rationale: 'should be refused',
  });
  assert.equal(nurseAttempt.status, 403);
  assert.equal(nurseAttempt.body.reason, 'permission_not_granted');

  // The assigned doctor records an explicit review decision.
  const doctorDecision = await post(ctx.base, `/api/suggestions/${id}/decision`, doctorToken, {
    decision: 'accepted_with_modifications',
    rationale: 'Reviewed against timeline (synthetic demo).',
  });
  assert.equal(doctorDecision.status, 200);
  assert.equal(doctorDecision.body.suggestion.state, 'reviewed');
  assert.equal(doctorDecision.body.suggestion.decision.decision, 'accepted_with_modifications');
  assert.equal(doctorDecision.body.suggestion.decision.by.id, 'U-DOC-01');

  // A second attempt is refused: the decision is final.
  const second = await post(ctx.base, `/api/suggestions/${id}/decision`, doctorToken, {
    decision: 'rejected',
    rationale: 'change of mind',
  });
  assert.equal(second.status, 400);
  assert.match(second.body.error, /already_finalised/);
});

test('AT-16: clinical records are amended with provenance, not overwritten', async () => {
  const before = getPatient('SYN-P-0042').timeline[1];
  const originalText = before.text;

  const res = await post(ctx.base, '/api/patients/SYN-P-0042/amendments', doctorToken, {
    entryIndex: 1,
    text: 'Physiotherapy review updated after clinician review (synthetic demo amendment).',
    reason: 'documentation correction',
  });
  assert.equal(res.status, 200);
  const entry = res.body.entry;

  assert.equal(entry.version, before.version + 1);
  assert.equal(entry.amendedBy, 'Dr. Ananya Rao (synthetic persona)');
  assert.ok(entry.amendmentReason);
  assert.equal(entry.previousVersion.text, originalText, 'the previous text must be preserved');
  assert.equal(entry.previousVersion.version, before.version);

  const stored = getPatient('SYN-P-0042').timeline[1];
  assert.equal(stored.version, before.version + 1);
  assert.notEqual(stored.text, originalText);

  const audited = auditLog.all().find((e) => e.action === 'record.amend' && e.decision === 'allow');
  assert.ok(audited, 'the amendment must be audited');
});

test('AT-12b: an administrator cannot record clinical decisions either', async () => {
  const adminToken = (await login(ctx.base, DEMO.admin.username, DEMO.admin.password)).token;
  const created = await post(ctx.base, '/api/patients/SYN-P-0042/suggestions', doctorToken, {});
  const res = await post(ctx.base, `/api/suggestions/${created.body.suggestion.id}/decision`, adminToken, {
    decision: 'accepted',
  });
  assert.equal(res.status, 403);
  assert.equal(res.body.reason, 'admin_clinical_separation');
});

test('AT-12c: a doctor cannot request suggestions for an unassigned patient', async () => {
  const res = await post(ctx.base, '/api/patients/SYN-P-0044/suggestions', doctorToken, {});
  assert.equal(res.status, 403);
  assert.equal(res.body.reason, 'no_patient_assignment');
});
