import { shell } from "electron";

export interface OAuthConfig {
  clientId: string;
  authorizationEndpoint: string;
  tokenEndpoint: string;
  scopes: string[];
  accessType: 'offline';
  includeGrantedScopes: boolean;
  prompt: string;
  responseType: 'code';
  codeChallengeMethod: 'S256';
  redirectUrl: string;
}

export const GOOGLE_OAUTH_CONFIG: OAuthConfig = {
  clientId:'developement',
  authorizationEndpoint:
    'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint:
    'https://oauth2.googleapis.com/token',
  scopes: [
    'https://www.googleapis.com/auth/contacts'
  ],
  accessType: 'offline',
  includeGrantedScopes: true,
  prompt: 'consent',
  responseType: 'code',
  codeChallengeMethod: 'S256',
  redirectUrl: 'http://127.0.0.1:37288/oauth/callback'
};


export function buildAuthorizationUrl(
  state: string,
  codeChallenge: string
): string {

  const params = new URLSearchParams({
    client_id: GOOGLE_OAUTH_CONFIG.clientId,
    redirect_uri: GOOGLE_OAUTH_CONFIG.redirectUrl,
    response_type: GOOGLE_OAUTH_CONFIG.responseType,
    scope: GOOGLE_OAUTH_CONFIG.scopes.join(' '),
    access_type: GOOGLE_OAUTH_CONFIG.accessType,
    include_granted_scopes:
      GOOGLE_OAUTH_CONFIG.includeGrantedScopes.toString(),
    prompt: GOOGLE_OAUTH_CONFIG.prompt,
    state,
    code_challenge: codeChallenge,
    code_challenge_method:
    GOOGLE_OAUTH_CONFIG.codeChallengeMethod
  });
  return `${GOOGLE_OAUTH_CONFIG.authorizationEndpoint}?${params}`;
}

export async function generatePkceCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);

  const digest = await crypto.subtle.digest('SHA-256', data);

  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function generatePkceCodeVerifier(length = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const random = new Uint8Array(length);

  crypto.getRandomValues(random);

  return Array.from(random)
    .map((byte) => chars[byte % chars.length])
    .join('');
}

export async function login() {
  const codeVerifier = generatePkceCodeVerifier();
  const codeChallenge = await generatePkceCodeChallenge(codeVerifier);
  const state = crypto.randomUUID();
  const authUrl = buildAuthorizationUrl(state, codeChallenge);

  await shell.openExternal(authUrl);

  return {
    codeVerifier,
    state,
  };
}
