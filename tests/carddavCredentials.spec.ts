import { describe, expect, it } from "vitest";

import {
  authorizationHeader,
  encodeBasicAuth,
  resolveCredentials,
  usernameFromAuthKey
} from "src/settings/carddavCredentials";

const empty = { username: '', password: '', apiKey: '' };
const nothingSaved = { authType: 'apikey' as const, authKey: '' };

describe('encodeBasicAuth / usernameFromAuthKey', () => {
  it('matches btoa for plain ascii', () => {
    expect(encodeBasicAuth('frank', 'secret')).toBe(btoa('frank:secret'));
  });

  it('encodes characters outside Latin-1 instead of throwing', () => {
    const key = encodeBasicAuth('zoë', 'pa€€');
    expect(Buffer.from(key, 'base64').toString('utf8')).toBe('zoë:pa€€');
  });

  it('recovers the username, also from old Latin-1 keys', () => {
    expect(usernameFromAuthKey(encodeBasicAuth('zoë', 'x:y'))).toBe('zoë');
    expect(usernameFromAuthKey(btoa('zoë:secret'))).toBe('zoë');
  });

  it('returns empty for missing or broken keys', () => {
    expect(usernameFromAuthKey('')).toBe('');
    expect(usernameFromAuthKey('%%%')).toBe('');
    expect(usernameFromAuthKey(btoa('no-separator'))).toBe('');
  });
});

describe('resolveCredentials', () => {
  const savedBasic = { authType: 'basic' as const, authKey: encodeBasicAuth('frank', 'secret') };
  const savedApiKey = { authType: 'apikey' as const, authKey: 'token-123' };

  it('uses a newly entered API key', () => {
    expect(resolveCredentials({ ...empty, apiKey: 'new' }, savedBasic))
      .toEqual({ ok: true, authType: 'apikey', authKey: 'new' });
  });

  it('uses a newly entered password', () => {
    expect(resolveCredentials({ ...empty, username: 'anna', password: 'pw' }, savedBasic))
      .toEqual({ ok: true, authType: 'basic', authKey: encodeBasicAuth('anna', 'pw') });
  });

  it('keeps the saved password when the field is left empty', () => {
    expect(resolveCredentials({ ...empty, username: 'frank' }, savedBasic))
      .toEqual({ ok: true, ...savedBasic });
  });

  it('asks for a password when the username changed', () => {
    const result = resolveCredentials({ ...empty, username: 'anna' }, savedBasic);
    expect(result.ok).toBe(false);
  });

  it('keeps the saved API key when nothing is entered', () => {
    expect(resolveCredentials(empty, savedApiKey)).toEqual({ ok: true, ...savedApiKey });
  });

  it('asks for a password when switching from API key to a username', () => {
    expect(resolveCredentials({ ...empty, username: 'frank' }, savedApiKey).ok).toBe(false);
  });

  it('behaves like before when nothing is saved', () => {
    expect(resolveCredentials({ ...empty, username: 'frank' }, nothingSaved))
      .toEqual({ ok: true, authType: 'basic', authKey: btoa('frank:') });
  });
});

describe('authorizationHeader', () => {
  it('builds Basic and Bearer headers', () => {
    expect(authorizationHeader({ authType: 'basic', authKey: 'abc' })).toBe('Basic abc');
    expect(authorizationHeader({ authType: 'apikey', authKey: 'abc' })).toBe('Bearer abc');
  });
});
