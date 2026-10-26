// Agent Trust Layer (Agent Firewall) - prototype enforcement boundary.
// Deny by default. Grants are stored data, never prompt text.
// The same policy engine used for humans is consulted here, plus agent-specific rules.

import { decide as humanDecide } from './policy.js';
import { auditLog, getPatient } from './store.js';
import { observationsFor } from './observations.js';
import * as cds from './cds.js';

export const agentPolicies = {
  'SYN-AGENT-01': {
    agentId: 'SYN-AGENT-01',
    purpose: 'Ward summary assistant (synthetic demo agent)',
    grants: [
      { tool: 'patient.timeline.read', patients: ['SYN-P-0042'], recordTypes: ['timeline', 'observation'] },
      { tool: 'observation.read', patients: ['SYN-P-0042'], recordTypes: ['observation'] },
      { tool: 'cds.request', patients: ['SYN-P-0042'], recordTypes: [] },
    ],
    deny: ['cds.decide', 'admin.users', 'admin.assignments', 'record.amend'],
    egress: { allowed: [], default: 'deny' },
    validFrom: '2026-01-01T00:00:00Z',
    validTo: '2099-01-01T00:00:00Z',
    synthetic: true,
  },
};

const TOOL_TO_ACTION = {
  'patient.timeline.read': 'patient.timeline.read',
  'observation.read': 'observation.read',
  'cds.request': 'cds.request',
  'cds.decide': 'cds.decide',
  'record.amend': 'record.amend',
  'admin.users': 'admin.users',
};

// Actions no agent may ever perform, regardless of any grant.
const HUMAN_ONLY = new Set(['cds.decide', 'record.amend']);

/**
 * Evaluate an agent tool call at the enforcement boundary.
 * Writes an audit row for BOTH allow and deny outcomes.
 */
export function invoke({ agentId, tool, args = {}, requestId = null }) {
  const actor = { type: 'agent', id: agentId, role: 'agent' };
  const resource = { type: 'tool', id: tool, patientId: args.patientId ?? null };

  const decision = evaluate(agentId, tool, args);
  auditLog.append({
    actor,
    action: tool,
    resource,
    decision: decision.allowed ? 'allow' : 'deny',
    reason: decision.reason,
    requestId,
  });
  return decision;
}

function evaluate(agentId, tool, args) {
  const policy = agentPolicies[agentId];
  if (!policy) return { allowed: false, reason: 'agent_not_registered' };

  const now = Date.now();
  if (now < Date.parse(policy.validFrom) || now > Date.parse(policy.validTo)) {
    return { allowed: false, reason: 'policy_outside_validity_window' };
  }

  // 1. Explicit deny list - a hard rule that cannot be granted around.
  if (policy.deny.includes(tool)) return { allowed: false, reason: 'deny_list' };

  // 2. Shared boundary: humans-only actions are closed to agents unconditionally.
  if (HUMAN_ONLY.has(tool)) return { allowed: false, reason: 'human_only_action' };

  // 3. Egress is its own permission class: reading is not exporting.
  if (tool === 'egress.export') {
    const dest = String(args.destination ?? '');
    if (!policy.egress.allowed.includes(dest)) {
      return { allowed: false, reason: 'egress_not_granted' };
    }
    return { allowed: true, reason: 'egress_granted', result: { exported: false } };
  }

  // 4. Deny-by-default grant lookup: an unnamed tool is refused.
  const grant = policy.grants.find((g) => g.tool === tool);
  if (!grant) return { allowed: false, reason: 'tool_not_in_policy' };
  if (args.patientId && !grant.patients.includes(args.patientId)) {
    return { allowed: false, reason: 'patient_not_in_grant' };
  }

  // 5. Cross-check with the shared human policy rules (separation of duties etc.).
  const action = TOOL_TO_ACTION[tool];
  if (!action) return { allowed: false, reason: 'unknown_tool' };
  const adminAttempt = action.startsWith('admin.');
  if (adminAttempt) return { allowed: false, reason: 'admin_clinical_separation' };

  return execute(tool, args, grant);
}

function execute(tool, args, grant) {
  const patient = args.patientId ? getPatient(args.patientId) : null;
  if (args.patientId && !patient) return { allowed: false, reason: 'unknown_patient' };

  switch (tool) {
    case 'patient.timeline.read': {
      const timeline = patient.timeline.filter(
        (e) => grant.recordTypes.length === 0 || grant.recordTypes.includes('timeline'),
      );
      return { allowed: true, reason: 'granted', result: { patientId: patient.id, timeline, synthetic: true } };
    }
    case 'observation.read':
      return {
        allowed: true,
        reason: 'granted',
        result: { patientId: patient.id, observations: observationsFor(patient.id), synthetic: true },
      };
    case 'cds.request':
      return {
        allowed: true,
        reason: 'granted',
        result: { suggestion: cds.generate(patient.id, patient.timeline) },
      };
    default:
      return { allowed: false, reason: 'unknown_tool' };
  }
}

export function agentAssignmentSummary(agentId) {
  const policy = agentPolicies[agentId];
  if (!policy) return null;
  return { agentId, grants: policy.grants, deny: policy.deny, egress: policy.egress, purpose: policy.purpose };
}

// Referenced so linters keep the import meaningful for readers of sharedPolicy docs.
export { humanDecide };
