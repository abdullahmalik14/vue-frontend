/**
 * Provider-agnostic profile attribute helpers for onboarding, KYC, and metadata updates.
 * Accepts legacy custom:* keys and canonical keys (role, username, etc.).
 */

const LEGACY_CUSTOM_KEY_MAP = {
  'custom:role': 'role',
  'custom:username': 'username',
  'custom:kyc': 'kycPassed',
  'custom:onboardingPassed': 'onboardingPassed',
  'custom:preferred_locale': 'preferredLocale',
};

function toBoolean(value) {
  return value === true || value === 'true';
}

/**
 * @param {Record<string, unknown>} attributes
 * @returns {Record<string, unknown>}
 */
export function normalizeProfileAttributes(attributes = {}) {
  const normalized = {};

  for (const [key, value] of Object.entries(attributes)) {
    const canonical = LEGACY_CUSTOM_KEY_MAP[key] || key;

    if (canonical === 'kycPassed' || canonical === 'onboardingPassed') {
      normalized[canonical] = toBoolean(value);
      continue;
    }

    normalized[canonical] = value;
  }

  return normalized;
}

/**
 * @param {{ role: string, username: string, displayName?: string }} params
 * @returns {{ role: string, username: string, name?: string, onboardingPassed: boolean }}
 */
export function buildOnboardingProfileAttributes({ role, username, displayName }) {
  return {
    role,
    username,
    ...(displayName != null && displayName !== '' ? { name: displayName } : {}),
    onboardingPassed: true,
  };
}

/**
 * @returns {{ kycPassed: boolean }}
 */
export function buildKycCompleteProfileAttributes() {
  return {
    kycPassed: true,
  };
}

/**
 * Local store updates to apply immediately before remote metadata sync (dirty state).
 *
 * @param {{ role?: string, username?: string, displayName?: string }} params
 * @returns {Record<string, unknown>}
 */
export function buildOnboardingLocalUpdates({ role, username, displayName }) {
  return {
    role,
    username,
    ...(displayName != null && displayName !== '' ? { name: displayName } : {}),
    onboardingPassed: true,
  };
}

/**
 * @returns {{ kycPassed: boolean }}
 */
export function buildKycLocalUpdates() {
  return {
    kycPassed: true,
  };
}
