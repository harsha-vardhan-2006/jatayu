// MedIntel Nexus prototype API - a single enforcement boundary for humans and agents.
// Run: node src/server.js   |   Tests: node --test test/
// SYNTHETIC DEMO ONLY: all data is synthetic; no real patient data is accepted.

import http from 'node:http';
import { URL, pathToFileURL } from 'node:url';
import crypto from 'node:crypto';
import { login, resolveToken } from './auth.js';
import { decide, bindAssignmentCheck } from './policy.js';
import { auditLog, getPatient, isAssigned, patientIdsFor, amendTimelineEntry, patients } from './store.js';
import { ingest, observationsFor, quarantinedObservations } from './observations.js';
import * as cds from './cds.js';
import { invoke as agentInvoke } from './agents.js';

bindAssignmentCheck(isAssigned);

const SSE_LISTENERS = new Map(); // patientId -> Set<res>

export function notifyObservation(obs) {
  const set = SSE_LISTENERS.get(obs.patientId);
  if (!set) return;
  const frame = `data: ${JSON.stringify({ type: 'observation', observation: obs })}\n\n`;
  for (const res of set) res.write(frame);
}

function json(res, status, body) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(payload);
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
    if (chunks.join('').length > 1_000_000) throw new Error('payload_too_large');
  }
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error('invalid_json');
  }
}

function principalOf(req) {
  const header = req.headers['authorization'] ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.headers['x-session-token'];
  return resolveToken(token);
}

function agentIdOf(req) {
  return req.headers['x-agent-id'] ?? null;
}

/** Audit helper: log a human route decision and return the decision. */
function authorize(principal, action, resource, requestId) {
  const decision = decide(principal, action, resource);
  auditLog.append({
    actor: { type: 'user', id: principal?.id ?? 'anonymous', role: principal?.role ?? 'none' },
    action,
    resource: { type: resource.patientId ? 'patient' : 'system', id: resource.patientId ?? action },
    decision: decision.allowed ? 'allow' : 'deny',
    reason: decision.reason,
    requestId,
  });
  return decision;
}

export function createServer() {
  return http.createServer(async (req, res) => {
    const requestId = crypto.randomUUID();
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    const method = req.method;

    try {
      // ------------------------------------------------------------------ login
      if (method === 'POST' && path === '/api/login') {
        const body = await readBody(req);
        const result = login(body.username, body.password);
        if (!result.ok) return json(res, 401, { error: result.error });
        return json(res, 200, { token: result.token, principal: { id: result.principal.id, role: result.principal.role, displayName: result.principal.displayName } });
      }

      // --------------------------------------------------------------- agent API
      if (method === 'POST' && path.startsWith('/api/agents/') && path.endsWith('/invoke')) {
        const agentId = path.split('/')[3];
        const body = await readBody(req);
        if (agentIdOf(req) !== agentId) {
          return json(res, 401, { error: 'agent_identity_header_mismatch' });
        }
        const outcome = agentInvoke({ agentId, tool: body.tool, args: body.args ?? {}, requestId });
        if (!outcome.allowed) return json(res, 403, { denied: true, reason: outcome.reason });
        return json(res, 200, { allowed: true, result: outcome.result });
      }

      // ---------------------------------------------------------- authenticated
      const principal = principalOf(req);
      if (!principal) return json(res, 401, { error: 'authentication_required' });

      if (method === 'GET' && path === '/api/me') {
        return json(res, 200, { principal, assignedPatients: patientIdsFor(principal.id) });
      }

      if (method === 'GET' && path === '/api/patients') {
        const visible = patients
          .filter((p) => decide(principal, 'patient.read', { patientId: p.id }).allowed)
          .map((p) => ({ id: p.id, name: p.name, department: p.department, synthetic: p.synthetic }));
        return json(res, 200, { patients: visible });
      }

      const timelineMatch = path.match(/^\/api\/patients\/([^/]+)\/timeline$/);
      if (method === 'GET' && timelineMatch) {
        const patientId = timelineMatch[1];
        const decision = authorize(principal, 'patient.timeline.read', { patientId }, requestId);
        if (!decision.allowed) return json(res, 403, { error: 'forbidden', reason: decision.reason });
        const patient = getPatient(patientId);
        if (!patient) return json(res, 404, { error: 'unknown_patient' });
        return json(res, 200, { patient: { id: patient.id, name: patient.name, synthetic: patient.synthetic }, timeline: patient.timeline });
      }

      const vitalsMatch = path.match(/^\/api\/patients\/([^/]+)\/vitals$/);
      if (method === 'GET' && vitalsMatch) {
        const patientId = vitalsMatch[1];
        const decision = authorize(principal, 'observation.read', { patientId }, requestId);
        if (!decision.allowed) return json(res, 403, { error: 'forbidden', reason: decision.reason });
        return json(res, 200, {
          patientId,
          observations: observationsFor(patientId),
          quarantined: quarantinedObservations().filter((o) => o.patientId === patientId),
        });
      }

      const obsMatch = path.match(/^\/api\/patients\/([^/]+)\/observations$/);
      if (method === 'POST' && obsMatch) {
        const patientId = obsMatch[1];
        const decision = authorize(principal, 'observation.write', { patientId }, requestId);
        if (!decision.allowed) return json(res, 403, { error: 'forbidden', reason: decision.reason });
        const body = await readBody(req);
        const result = ingest({ ...body, patientId });
        if (result.error) return json(res, 400, { rejected: true, error: result.error, detail: result.detail });
        auditLog.append({
          actor: { type: 'user', id: principal.id, role: principal.role },
          action: 'observation.write',
          resource: { type: 'patient', id: patientId },
          decision: 'allow',
          reason: 'granted',
          requestId,
        });
        notifyObservation(result.observation);
        return json(res, 201, { observation: result.observation });
      }

      const suggMatch = path.match(/^\/api\/patients\/([^/]+)\/suggestions$/);
      if (method === 'POST' && suggMatch) {
        const patientId = suggMatch[1];
        const decision = authorize(principal, 'cds.request', { patientId }, requestId);
        if (!decision.allowed) return json(res, 403, { error: 'forbidden', reason: decision.reason });
        const patient = getPatient(patientId);
        if (!patient) return json(res, 404, { error: 'unknown_patient' });
        const suggestion = cds.generate(patientId, patient.timeline);
        return json(res, 201, { suggestion });
      }

      const decisionMatch = path.match(/^\/api\/suggestions\/([^/]+)\/decision$/);
      if (method === 'POST' && decisionMatch) {
        const suggestion = cds.get(decisionMatch[1]);
        if (!suggestion) return json(res, 404, { error: 'unknown_suggestion' });
        const auth = authorize(principal, 'cds.decide', { patientId: suggestion.patientId }, requestId);
        if (!auth.allowed) return json(res, 403, { error: 'forbidden', reason: auth.reason });
        const body = await readBody(req);
        const outcome = cds.recordDecision(suggestion.id, {
          decision: body.decision,
          by: principal,
          rationale: body.rationale,
        });
        if (!outcome.ok) return json(res, 400, { error: outcome.error });
        return json(res, 200, { suggestion: outcome.suggestion });
      }

      const amendMatch = path.match(/^\/api\/patients\/([^/]+)\/amendments$/);
      if (method === 'POST' && amendMatch) {
        const patientId = amendMatch[1];
        const decision = authorize(principal, 'record.amend', { patientId }, requestId);
        if (!decision.allowed) return json(res, 403, { error: 'forbidden', reason: decision.reason });
        const body = await readBody(req);
        const entry = amendTimelineEntry(patientId, body.entryIndex, body.text, principal.displayName ?? principal.id, body.reason);
        auditLog.append({
          actor: { type: 'user', id: principal.id, role: principal.role },
          action: 'record.amend',
          resource: { type: 'patient', id: patientId },
          decision: 'allow',
          reason: 'granted',
          requestId,
        });
        return json(res, 200, { entry });
      }

      if (method === 'GET' && path === '/api/audit') {
        const decision = authorize(principal, 'audit.read', {}, requestId);
        if (!decision.allowed) return json(res, 403, { error: 'forbidden', reason: decision.reason });
        return json(res, 200, { events: auditLog.all() });
      }

      // --------------------------------------------------------- live vitals SSE
      const streamMatch = path.match(/^\/api\/stream\/([^/]+)$/);
      if (method === 'GET' && streamMatch) {
        const patientId = streamMatch[1];
        const decision = authorize(principal, 'observation.read', { patientId }, requestId);
        if (!decision.allowed) return json(res, 403, { error: 'forbidden', reason: decision.reason });
        res.writeHead(200, {
          'content-type': 'text/event-stream',
          'cache-control': 'no-cache',
          connection: 'keep-alive',
        });
        res.write(`data: ${JSON.stringify({ type: 'connected', patientId })}\n\n`);
        if (!SSE_LISTENERS.has(patientId)) SSE_LISTENERS.set(patientId, new Set());
        SSE_LISTENERS.get(patientId).add(res);
        const keepAlive = setInterval(() => res.write(': ping\n\n'), 15_000);
        req.on('close', () => {
          clearInterval(keepAlive);
          const set = SSE_LISTENERS.get(patientId);
          if (set) {
            set.delete(res);
            if (set.size === 0) SSE_LISTENERS.delete(patientId);
          }
        });
        return;
      }

      return json(res, 404, { error: 'not_found' });
    } catch (err) {
      return json(res, 400, { error: err.message ?? 'bad_request' });
    }
  });
}

export function start(port = 0) {
  const server = createServer();
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

const isDirectRun = Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirectRun) {
  const LISTEN_PORT = Number(process.env.PORT ?? 4173);
  start(LISTEN_PORT).then(() => {
    console.log(`MedIntel Nexus demo listening on http://127.0.0.1:${LISTEN_PORT}`);
    console.log('SYNTHETIC DEMO - no real patient data. Demo logins are in docs/DEMO_GUIDE.md');
  });
}
