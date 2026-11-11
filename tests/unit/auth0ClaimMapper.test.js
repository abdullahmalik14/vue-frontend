import { describe, it, expect } from 'vitest';
import {
  buildMockTokenClaims,
  getKycPassedFromTokenClaims,
  getOnboardingPassedFromTokenClaims,
  getPreferredLocaleFromAuthClaims,
  getRoleFromTokenClaims,
  getUsernameFromTokenClaims,
  mapTokenClaimsToUser,
} from '@/dev/utils/auth/auth0ClaimMapper.js';

describe('auth0ClaimMapper', () => {
  it('reads Auth0 namespaced role claim', () => {
    expect(
      getRoleFromTokenClaims({
        'https://fansocial.app/role': 'creator',
      })
    ).toBe('creator');
  });

  it('reads legacy custom:role claim', () => {
    expect(
      getRoleFromTokenClaims({
        'custom:role': 'fan',
      })
    ).toBe('fan');
  });

  it('derives onboarding from role + username when explicit flag is missing', () => {
    expect(
      getOnboardingPassedFromTokenClaims({
        'custom:role': 'fan',
        'custom:username': '@fanuser',
      })
    ).toBe(true);
  });

  it('reads kyc from Auth0 and legacy custom claim formats', () => {
    expect(
      getKycPassedFromTokenClaims({
        'https://fansocial.app/kyc_passed': true,
      })
    ).toBe(true);

    expect(
      getKycPassedFromTokenClaims({
        'custom:kyc': 'true',
      })
    ).toBe(true);
  });

  it('maps token claims to normalized user while preserving local dirty state', () => {
    const mapped = mapTokenClaimsToUser(
      {
        email: 'creator@test.com',
        'custom:role': 'creator',
      },
      {
        currentUser: {
          username: '@creator',
          kycPassed: true,
          onboardingPassed: true,
        },
        localOnboardingPassed: true,
      }
    );

    expect(mapped.email).toBe('creator@test.com');
    expect(mapped.role).toBe('creator');
    expect(mapped.username).toBe('@creator');
    expect(mapped.kycPassed).toBe(true);
    expect(mapped.onboardingPassed).toBe(true);
  });

  it('builds mock token claims with both Auth0 and legacy custom keys', () => {
    const claims = buildMockTokenClaims({
      sub: 'mock-1',
      email: 'fan@test.com',
      role: 'fan',
      username: '@fanuser',
      onboardingPassed: true,
      kycPassed: false,
      preferredLocale: 'en',
    });

    expect(claims['custom:role']).toBe('fan');
    expect(claims['https://fansocial.app/role']).toBe('fan');
    expect(claims['https://fansocial.app/username']).toBe('@fanuser');
    expect(getUsernameFromTokenClaims(claims)).toBe('@fanuser');
    expect(getPreferredLocaleFromAuthClaims(claims)).toBe('en');
  });
});
