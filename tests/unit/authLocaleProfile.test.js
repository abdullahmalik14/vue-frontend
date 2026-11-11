import { describe, it, expect } from 'vitest';
import {
  AUTH_PREFERRED_LOCALE_ATTRIBUTE,
  getPreferredLocaleFromTokenClaims,
  normalizePreferredLocaleCode,
} from '@/systems/i18n/authLocaleProfile.js';

describe('authLocaleProfile', () => {
  it('reads custom:preferred_locale from token claims', () => {
    expect(
      getPreferredLocaleFromTokenClaims({
        [AUTH_PREFERRED_LOCALE_ATTRIBUTE]: 'vi',
      }),
    ).toBe('vi');
  });

  it('normalizes and rejects unsupported locales', () => {
    expect(normalizePreferredLocaleCode('VI')).toBe('vi');
    expect(normalizePreferredLocaleCode('xx')).toBeNull();
  });
});
