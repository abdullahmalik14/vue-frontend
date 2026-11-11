import { getCurrentAuthMode } from '@/dev/utils/auth/authHandler.js';
import { authHandler } from '@/dev/utils/auth/authHandler.js';
import { getPreferredLocaleFromAuthClaims } from '@/dev/utils/auth/auth0ClaimMapper.js';
import { SUPPORTED_LOCALES } from './localeManager.js';
import { log } from '@/infrastructure/logging/logHandler.js';

/** Legacy custom attribute key — still used as metadata key during migration. */
export const AUTH_PREFERRED_LOCALE_ATTRIBUTE = 'custom:preferred_locale';

/**
 * Auth0 metadata sync is active when using the live Auth0 handler.
 * @returns {boolean}
 */
export function isAuthLocaleProfileSyncEnabled() {
  return getCurrentAuthMode() === 'auth0';
}

/**
 * @param {string | null | undefined} raw
 * @returns {string | null}
 */
export function normalizePreferredLocaleCode(raw) {
  const locale = typeof raw === 'string' ? raw.toLowerCase().trim() : '';
  return locale && SUPPORTED_LOCALES.includes(locale) ? locale : null;
}

/**
 * Read preferred locale from JWT claims (Auth0 namespaced or legacy custom:* keys).
 * @param {Record<string, unknown> | null | undefined} claims
 * @returns {string | null}
 */
export function getPreferredLocaleFromTokenClaims(claims) {
  if (!claims || typeof claims !== 'object') {
    return null;
  }

  const fromAuthClaims = getPreferredLocaleFromAuthClaims(claims);
  if (fromAuthClaims) {
    return normalizePreferredLocaleCode(fromAuthClaims);
  }

  const raw =
    claims[AUTH_PREFERRED_LOCALE_ATTRIBUTE] ??
    claims.preferred_locale ??
    claims.preferredLocale ??
    claims.preferred_language;

  return normalizePreferredLocaleCode(typeof raw === 'string' ? raw : null);
}

/**
 * Persist preferred locale on the auth provider user profile (Auth0 metadata).
 * @param {string} localeCode
 * @returns {Promise<boolean>}
 */
export async function savePreferredLocaleToAuthProfile(localeCode) {
  const locale = normalizePreferredLocaleCode(localeCode);
  if (!locale) {
    return false;
  }

  try {
    await authHandler.updateProfileAttributes({
      preferredLocale: locale,
      [AUTH_PREFERRED_LOCALE_ATTRIBUTE]: locale,
    });
    log('authLocaleProfile.js', 'savePreferredLocaleToAuthProfile', 'success', 'Preferred locale saved', {
      locale,
    });
    return true;
  } catch (error) {
    log('authLocaleProfile.js', 'savePreferredLocaleToAuthProfile', 'warn', 'Preferred locale save failed', {
      locale,
      error: error?.message,
    });
    return false;
  }
}
