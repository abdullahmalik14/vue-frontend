import { describe, it, expect } from 'vitest';
import {
  normalizeProfileAttributes,
  buildOnboardingProfileAttributes,
  buildKycCompleteProfileAttributes,
  buildOnboardingLocalUpdates,
  buildKycLocalUpdates,
} from '../../src/dev/utils/auth/authProfileAttributes.js';

describe('authProfileAttributes', () => {
  it('normalizes legacy custom:* keys to canonical keys', () => {
    expect(
      normalizeProfileAttributes({
        'custom:role': 'creator',
        'custom:username': '@creator',
        'custom:kyc': 'true',
        'custom:onboardingPassed': 'false',
      }),
    ).toEqual({
      role: 'creator',
      username: '@creator',
      kycPassed: true,
      onboardingPassed: false,
    });
  });

  it('passes through canonical keys unchanged', () => {
    expect(
      normalizeProfileAttributes({
        role: 'fan',
        username: '@fan',
        kycPassed: false,
        onboardingPassed: true,
      }),
    ).toEqual({
      role: 'fan',
      username: '@fan',
      kycPassed: false,
      onboardingPassed: true,
    });
  });

  it('builds onboarding profile and local update payloads', () => {
    expect(
      buildOnboardingProfileAttributes({ role: 'creator', username: '@new' }),
    ).toEqual({
      role: 'creator',
      username: '@new',
      onboardingPassed: true,
    });

    expect(
      buildOnboardingLocalUpdates({ role: 'creator', username: '@new' }),
    ).toEqual({
      role: 'creator',
      username: '@new',
      onboardingPassed: true,
    });
  });

  it('builds KYC complete payloads', () => {
    expect(buildKycCompleteProfileAttributes()).toEqual({ kycPassed: true });
    expect(buildKycLocalUpdates()).toEqual({ kycPassed: true });
  });
});
