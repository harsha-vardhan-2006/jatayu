// Server-side authorization engine. Deny by default.
// One decision point for humans AND AI agents (see agents.js).

export const PERMISSIONS = {
  doctor: [
    'patient.read',
    'patient.timeline.read',
    'observation.read',
    'observation.write',
    'cds.request',
    'cds.decide',
    'record.amend',
  ],
  nurse: ['patient.read', 'patient.timeline.read', 'observation.read', 'observation.write'],
  admin: ['admin.users', 'admin.assignments', 'audit.read'],
};

export const CLINICAL_ACTIONS = new Set([
  'patient.read',
  'patient.timeline.read',
  'observation.read',
  'observation.write',
  'cds.request',
  'cds.decide',
  'record.amend',
]);

/**
 * Decide whether a principal may perform `action` on `resource`.
 * @param {{type:string,id:string,role:string}} principal
 * @param {string} action
 * @param {{patientId?:string, recordType?:string}} resource
 * @returns {{allowed:boolean, reason:string}}
 */
export function decide(principal, action, resource = {}) {
  if (!principal || principal.type !== 'user') {
    return deny('invalid_principal');
  }
  const perms = PERMISSIONS[principal.role];
  if (!perms) return deny('unknown_role');

  // Separation of duties: account management never implies clinical access.
  if (principal.role === 'admin' && CLINICAL_ACTIONS.has(action)) {
    return deny('admin_clinical_separation');
  }

  if (!perms.includes(action)) return deny('permission_not_granted');

  // Clinical actions are patient-scoped: assignment to THIS patient is required.
  if (CLINICAL_ACTIONS.has(action)) {
    if (!resource.patientId) return deny('patient_scope_required');
    if (!isAssignedTo(principal.id, resource.patientId)) return deny('no_patient_assignment');
  }
  return { allowed: true, reason: 'granted' };
}

function deny(reason) {
  return { allowed: false, reason };
}

// Kept here so policy does not depend on the store (import wiring lives in server.js).
let assignmentCheck = () => false;
export function bindAssignmentCheck(fn) {
  assignmentCheck = fn;
}
function isAssignedTo(userId, patientId) {
  return assignmentCheck(userId, patientId);
}
