// Shared helpers for acceptance tests.
import { start } from '../src/server.js';

export async function boot() {
  const server = await start(0);
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  return {
    server,
    base,
    async close() {
      await new Promise((resolve) => server.close(resolve));
    },
  };
}

export async function login(base, username, password) {
  const res = await fetch(`${base}/api/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const body = await res.json();
  return { status: res.status, ...body };
}

export function auth(token) {
  return { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
}

export const DEMO = {
  doctor: { username: 'doctor-demo', password: 'demo-only-doctor' },
  nurse: { username: 'nurse-demo', password: 'demo-only-nurse' },
  admin: { username: 'admin-demo', password: 'demo-only-admin' },
};

export async function get(base, path, token) {
  const res = await fetch(`${base}${path}`, { headers: token ? auth(token) : {} });
  return { status: res.status, body: await res.json() };
}

export async function post(base, path, token, payload, extraHeaders = {}) {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: token ? { ...auth(token), ...extraHeaders } : { 'content-type': 'application/json', ...extraHeaders },
    body: JSON.stringify(payload ?? {}),
  });
  return { status: res.status, body: await res.json() };
}
