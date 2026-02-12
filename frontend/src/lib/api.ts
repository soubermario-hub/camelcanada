import { supabase } from './supabase';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

let recoverSession: null | (() => Promise<boolean>) = null;
let forceSignOut: null | (() => Promise<void>) = null;
let inFlightRecovery: Promise<boolean> | null = null;

export function bindAuthActions(actions: { recoverSession: () => Promise<boolean>; signOut: () => Promise<void> }) {
  recoverSession = actions.recoverSession;
  forceSignOut = actions.signOut;
}

async function authHeader() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {};
}

export const api = {
  async get(path: string) {
    return request(path, { method: 'GET' });
  },
  async post(path: string, body: unknown) {
    return request(path, { method: 'POST', body: JSON.stringify(body) });
  }
};

async function request(path: string, init: RequestInit) {
  const headers = { 'Content-Type': 'application/json', ...(await authHeader()) };
  let response = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (response.status === 401 && recoverSession) {
    inFlightRecovery ??= recoverSession();
    const ok = await inFlightRecovery;
    inFlightRecovery = null;

    if (ok) {
      response = await fetch(`${BASE_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(await authHeader()) } });
    } else if (forceSignOut) {
      await forceSignOut();
    }
  }

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}
