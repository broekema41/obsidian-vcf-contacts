import { AuthType } from "src/settings/settings";

export interface CredentialsInput {
  username: string;
  password: string;
  apiKey: string;
}

export interface StoredCredentials {
  authType: AuthType;
  authKey: string;
}

export type ResolvedCredentials =
  | { ok: true; authType: AuthType; authKey: string }
  | { ok: false; error: string };

/**
 * Base64 of "username:password" as UTF-8. Plain btoa() throws on
 * characters outside Latin-1 (e.g. "€") and mangles the rest.
 */
export function encodeBasicAuth(username: string, password: string): string {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  let binary = '';
  bytes.forEach(byte => (binary += String.fromCharCode(byte)));
  return btoa(binary);
}

/**
 * Username stored inside a basic auth key, so the settings screen can show it.
 * Keys saved by older versions were Latin-1 encoded; fall back to that.
 */
export function usernameFromAuthKey(authKey: string): string {
  if (!authKey) {
    return '';
  }
  let binary: string;
  try {
    binary = atob(authKey);
  } catch {
    return '';
  }
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  let decoded: string;
  try {
    decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    decoded = binary;
  }
  const separator = decoded.indexOf(':');
  return separator === -1 ? '' : decoded.slice(0, separator);
}

export function hasStoredCredentials(stored: StoredCredentials): boolean {
  return stored.authKey.length > 0;
}

/**
 * Decide which credentials to save. Empty secret fields mean
 * "keep what is stored", so users never have to retype them.
 */
export function resolveCredentials(input: CredentialsInput, stored: StoredCredentials): ResolvedCredentials {
  const username = input.username.trim();

  if (input.apiKey) {
    return { ok: true, authType: 'apikey', authKey: input.apiKey };
  }

  if (input.password) {
    return { ok: true, authType: 'basic', authKey: encodeBasicAuth(username, input.password) };
  }

  if (hasStoredCredentials(stored)) {
    if (stored.authType === 'apikey' && !username) {
      return { ok: true, authType: 'apikey', authKey: stored.authKey };
    }
    if (stored.authType === 'basic' && username === usernameFromAuthKey(stored.authKey)) {
      return { ok: true, authType: 'basic', authKey: stored.authKey };
    }
    return { ok: false, error: 'Please enter the password for this username.' };
  }

  // Nothing stored yet: same as before, let the server decide.
  return { ok: true, authType: 'basic', authKey: encodeBasicAuth(username, '') };
}

export function authorizationHeader(credentials: StoredCredentials): string {
  return credentials.authType === 'apikey'
    ? `Bearer ${credentials.authKey}`
    : `Basic ${credentials.authKey}`;
}
