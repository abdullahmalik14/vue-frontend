import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAuth0ConnectionForProvider, AUTH0_SOCIAL_CONNECTIONS } from '../../src/dev/utils/auth/authSocialConfig.js';

describe('authSocialConfig', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('returns default Auth0 connection names', () => {
    expect(AUTH0_SOCIAL_CONNECTIONS.twitter).toBe('twitter');
    expect(AUTH0_SOCIAL_CONNECTIONS.google).toBe('google-oauth2');
    expect(getAuth0ConnectionForProvider('facebook')).toBe('facebook');
  });

  it('allows env override for connection names', () => {
    vi.stubEnv('VITE_AUTH0_TWITTER_CONNECTION', 'twitter-oauth2-custom');
    expect(getAuth0ConnectionForProvider('twitter')).toBe('twitter-oauth2-custom');
  });
});
