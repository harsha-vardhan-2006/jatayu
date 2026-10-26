// AT-13, AT-14, AT-15, AT-17, AT-18 - Agent Trust Layer enforcement and audit.
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { boot, login, get, post, DEMO } from './helpers.js';
import { auditLog } from '../src/store.js';

let ctx;
let adminToken;

before(async () => {
  ctx = await boot();
  adminToken = (await login(ctx.base, DEMO.admin.username, DEMO.admin.password)).token;
  auditLog.clear();
});

after(async () => ctx.close());

const agentPost = (path, payload) =>
  post(ctx.base, path, null, payload, { 'x-agent-id': 'SYN-AGENT-01', 'content-type': 'application/json' });

test('AT-13: an agent may call only tools explicitly present in its grant', async () => {
  const allowed = await agentPost('/api/agents/SYN-AGENT-01/invoke', {
    tool: 'patient.timeline.read',
    args: { patientId: 'SYN-P-0042' },
  });
  assert.equal(allowed.status, 200);
  assert.equal(allowed.body.allowed, true);
  assert.ok(Array.isArray(allowed.body.result.timeline));

  // Recording a clinical decision is closed to agents (deny list / human-only).
  const decide = await agentPost('/api/agents/SYN-AGENT-01/invoke', {
    tool: 'cds.decide',
    args: { patientId: 'SYN-P-0042', decision: 'accepted' },
  });
  assert.equal(decide.status, 403);
  assert.equal(decide.body.reason, 'deny_list');
});

test('AT-14: an unapproved agent action is blocked at the boundary and audited', async () => {
  const crossPatient = await agentPost('/api/agents/SYN-AGENT-01/invoke', {
    tool: 'patient.timeline.read',
    args: { patientId: 'SYN-P-0043' },
  });
  assert.equal(crossPatient.status, 403);
  assert.equal(crossPatient.body.reason, 'patient_not_in_grant');
  assert.equal(crossPatient.body.denied, true);

  const unknownTool = await agentPost('/api/agents/SYN-AGENT-01/invoke', {
    tool: 'patient.export_all',
    args: {},
  });
  assert.equal(unknownTool.status, 403);
  assert.equal(unknownTool.body.reason, 'tool_not_in_policy');

  const denyRow = auditLog
    .all()
    .find((e) => e.actor.type === 'agent' && e.decision === 'deny' && e.action === 'patient.timeline.read');
  assert.ok(denyRow, 'the blocked agent action must produce an audit record');
  assert.equal(denyRow.reason, 'patient_not_in_grant');
  assert.equal(denyRow.actor.id, 'SYN-AGENT-01');
});

test('AT-17: outbound transfer is denied without an explicit egress grant', async () => {
  const res = await agentPost('/api/agents/SYN-AGENT-01/invoke', {
    tool: 'egress.export',
    args: { destination: 'https://external-collector.example', patientId: 'SYN-P-0042' },
  });
  assert.equal(res.status, 403);
  assert.equal(res.body.reason, 'egress_not_granted');

  const row = auditLog.all().find((e) => e.action === 'egress.export' && e.decision === 'deny');
  assert.ok(row, 'egress denial must be audited');
  assert.equal(row.reason, 'egress_not_granted');
});

test('AT-15: every agent decision, allow and deny, is written to the audit log', async () => {
  const events = auditLog.all().filter((e) => e.actor.type === 'agent');
  assert.ok(events.length >= 4, `expected agent audit rows, got ${events.length}`);
  assert.ok(events.some((e) => e.decision === 'allow'), 'allowed agent reads must be logged');
  assert.ok(events.some((e) => e.decision === 'deny'), 'denied agent actions must be logged');
  for (const e of events) {
    assert.ok(e.actor.id && e.action && e.reason && e.at, 'audit rows must be complete');
    assert.equal(e.synthetic, true);
  }

  // The audit log is readable by an administrator and refused to everyone else.
  const asAdmin = await get(ctx.base, '/api/audit', adminToken);
  assert.equal(asAdmin.status, 200);
  assert.ok(asAdmin.body.events.length >= events.length);

  const doctorToken = (await login(ctx.base, DEMO.doctor.username, DEMO.doctor.password)).token;
  const asDoctor = await get(ctx.base, '/api/audit', doctorToken);
  assert.equal(asDoctor.status, 403);
});

test('AT-18: every surface is clearly marked synthetic', async () => {
  const doctorToken = (await login(ctx.base, DEMO.doctor.username, DEMO.doctor.password)).token;
  const list = await get(ctx.base, '/api/patients', doctorToken);
  assert.ok(list.body.patients.length >= 2);
  for (const p of list.body.patients) assert.equal(p.synthetic, true);

  const timeline = await get(ctx.base, '/api/patients/SYN-P-0042/timeline', doctorToken);
  assert.equal(timeline.body.patient.synthetic, true);

  const suggestion = await post(ctx.base, '/api/patients/SYN-P-0042/suggestions', doctorToken, {});
  assert.equal(suggestion.body.suggestion.synthetic, true);
  assert.match(suggestion.body.suggestion.disclaimer, /SYNTHETIC/i);

  for (const e of auditLog.all()) assert.equal(e.synthetic, true);
});

test('AT-13b: an unregistered agent identity is refused', async () => {
  const res = await post(
    ctx.base,
    '/api/agents/NOT-A-REAL-AGENT/invoke',
    null,
    { tool: 'patient.timeline.read', args: { patientId: 'SYN-P-0042' } },
    { 'x-agent-id': 'NOT-A-REAL-AGENT', 'content-type': 'application/json' },
  );
  assert.equal(res.status, 403);
  assert.equal(res.body.reason, 'agent_not_registered');
});

test('AT-14b: a mismatched agent identity header is refused before evaluation', async () => {
  const res = await post(
    ctx.base,
    '/api/agents/SYN-AGENT-01/invoke',
    null,
    { tool: 'patient.timeline.read', args: { patientId: 'SYN-P-0042' } },
    { 'x-agent-id': 'SYN-AGENT-02', 'content-type': 'application/json' },
  );
  assert.equal(res.status, 401);
  assert.equal(res.body.error, 'agent_identity_header_mismatch');
});
