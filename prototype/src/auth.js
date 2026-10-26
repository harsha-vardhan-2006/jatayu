// Minimal demo authentication: server-issued opaque session tokens.
// Demo-grade on purpose (no MFA, no revocation UI, no TLS on localhost) - see
// docs/validation/KNOWN_LIMITATIONS.md L-05.

import crypto from 'node:crypto';
import { users, demoPasswords } from './store.js';

const sessions = new Map(); // token -> { type:'user', id, role, username, displayName }

export function login(username, password) {
  const user = users.find((u) => u.username === username);
  if (!user) return { ok: false, error: 'invalid_credentials' };
  const expected = demoPasswords[username];
  // Constant-time comparison habit, even for demo credentials.
  const a = Buffer.from(String(password));
  const b = Buffer.from(String(expected ?? ''));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, error: 'invalid_credentials' };
  }
  const token = crypto.randomUUID();
  const principal = {
    type: 'user',
    id: user.id,
    role: user.role,
    username: user.username,
    displayName: user.displayName,
  };
  sessions.set(token, principal);
  return { ok: true, token, principal };
}

export function resolveToken(token) {
  if (!token) return null;
  return sessions.get(token) ?? null;
}

export function logout(token) {
  sessions.delete(token);
}

export function clearSessions() {
  // Test support only.
  sessions.clear();
}
