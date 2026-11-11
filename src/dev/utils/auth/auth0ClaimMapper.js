/**
 * Maps JWT claims from Auth0 and legacy custom:* tokens into a normalized user shape
 * consumed by useAuthStore and route guards.
 */

const DEFAULT_CLAIM_NAMESPACE = 'https://fansocial.app/';

export function getAuth0ClaimNamespace() {
  const raw = import.meta.env.VITE_AUTH0_CLAIM_NAMESPACE || DEFAULT_CLAIM_NAMESPACE;
  return raw.endsWith('/') ? raw : `${raw}/`;
}

function namespacedClaim(claims, key) {
  if (!claims || typeof claims !== 'object') return undefined;
  const ns = getAuth0ClaimNamespace();
  return claims[`${ns}${key}`];
}

function legacyCustomClaim(claims, key) {
  if (!claims || typeof claims !== 'object') return undefined;
  return claims[`custom:${key}`];
}

function readStringClaim(claims, auth0Key, legacyCustomKey = auth0Key) {
  const auth0Value = namespacedClaim(claims, auth0Key);
  if (auth0Value !== undefined && auth0Value !== null && auth0Value !== '') {
    return String(auth0Value);
  }

  const legacyValue = legacyCustomClaim(claims, legacyCustomKey);
  if (legacyValue !== undefined && legacyValue !== null && legacyValue !== '') {
    return String(legacyValue);
  }

  return undefined;
}

function readBooleanClaim(claims, auth0Key, legacyCustomKey) {
  const auth0Value = namespacedClaim(claims, auth0Key);
  if (auth0Value !== undefined) {
    return auth0Value === true || auth0Value === 'true';
  }

  const legacyValue = legacyCustomClaim(claims, legacyCustomKey);
  if (legacyValue !== undefined) {
    return legacyValue === true || legacyValue === 'true';
  }

  return undefined;
}

/**
 * @param {Record<string, unknown> | null | undefined} claims
 * @returns {string | null}
 */
export function getRoleFromTokenClaims(claims) {
  return readStringClaim(claims, 'role') ?? null;
}

/**
 * @param {Record<string, unknown> | null | undefined} claims
 * @returns {string | undefined}
 */
export function getUsernameFromTokenClaims(claims) {
  return readStringClaim(claims, 'username');
}

/**
 * @param {Record<string, unknown> | null | undefined} claims
 * @returns {boolean | undefined}
 */
export function getKycPassedFromTokenClaims(claims) {
  const auth0Value = readBooleanClaim(claims, 'kyc_passed', 'kyc');
  if (auth0Value !== undefined) return auth0Value;
  return undefined;
}

/**
 * @param {Record<string, unknown> | null | undefined} claims
 * @returns {boolean | undefined}
 */
export function getOnboardingPassedFromTokenClaims(claims) {
  const explicit = readBooleanClaim(claims, 'onboarding_passed', 'onboardingPassed');
  if (explicit !== undefined) return explicit;

  const role = getRoleFromTokenClaims(claims);
  const username = getUsernameFromTokenClaims(claims);
  if (role && username) return true;

  return undefined;
}

/**
 * @param {Record<string, unknown> | null | undefined} claims
 * @returns {string | null}
 */
export function getPreferredLocaleFromAuthClaims(claims) {
  const raw =
    readStringClaim(claims, 'preferred_locale', 'preferred_locale') ??
    (typeof claims?.preferred_locale === 'string' ? claims.preferred_locale : undefined) ??
    (typeof claims?.preferredLocale === 'string' ? claims.preferredLocale : undefined);

  if (!raw) return null;

  const locale = raw.toLowerCase().trim();
  return locale || null;
}

/**
 * Build normalized user fields from decoded JWT claims, preserving local dirty state.
 *
 * @param {Record<string, unknown>} decoded
 * @param {{
 *   currentUser?: Record<string, unknown> | null,
 *   localOnboardingPassed?: boolean,
 * }} options
 * @returns {{
 *   email?: string,
 *   role?: string,
 *   username?: string,
 *   kycPassed: boolean,
 *   onboardingPassed: boolean,
 *   preferredLocale: string | null,
 *   raw: Record<string, unknown>,
 * }}
 */
export function mapTokenClaimsToUser(decoded, options = {}) {
  const { currentUser = null, localOnboardingPassed = false } = options;

  const roleFromToken = getRoleFromTokenClaims(decoded);
  const usernameFromToken = getUsernameFromTokenClaims(decoded);
  const kycFromToken = getKycPassedFromTokenClaims(decoded);
  const onboardingFromToken = getOnboardingPassedFromTokenClaims(decoded);

  const roleResolved = roleFromToken || currentUser?.role || undefined;
  const usernameResolved = usernameFromToken || currentUser?.username || undefined;

  const kycPassedResolved =
    kycFromToken !== undefined ? kycFromToken : (currentUser?.kycPassed ?? false);

  const onboardingResolved =
    onboardingFromToken !== undefined
      ? onboardingFromToken
      : (roleFromToken && usernameFromToken)
        ? true
        : (currentUser?.onboardingPassed ?? localOnboardingPassed ?? false);

  const preferredLocaleResolved =
    getPreferredLocaleFromAuthClaims(decoded) ??
    (typeof currentUser?.preferredLocale === 'string' ? currentUser.preferredLocale : null);

  return {
    email: typeof decoded.email === 'string' ? decoded.email : currentUser?.email,
    role: roleResolved,
    username: usernameResolved,
    kycPassed: kycPassedResolved,
    onboardingPassed: onboardingResolved,
    preferredLocale: preferredLocaleResolved,
    raw: decoded,
  };
}

/**
 * Build mock JWT payload claims for dev shim tokens (Auth0 namespaced + legacy custom:* keys).
 *
 * @param {object} user
 * @returns {Record<string, unknown>}
 */
export function buildMockTokenClaims(user) {
  const ns = getAuth0ClaimNamespace();
  const role = user.role ?? null;
  const username = user.username ?? null;
  const onboardingPassed = !!user.onboardingPassed || !!(role && username);
  const kycPassed = !!user.kycPassed;
  const preferredLocale = user.preferredLocale ?? null;

  const claims = {
    sub: user.sub,
    email: user.email,
    email_verified: !!user.email_verified,
    iss: user.iss || 'https://mock-auth.local/dev',
    aud: user.aud || 'mock-auth-client',
    token_use: 'id',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    'custom:role': role,
    'custom:username': username,
    'custom:kyc': kycPassed ? 'true' : 'false',
    'custom:onboardingPassed': onboardingPassed ? 'true' : 'false',
    'custom:preferred_locale': preferredLocale,
    'custom:lastlogin': String(Math.floor(Date.now() / 1000)),
  };

  claims[`${ns}role`] = role;
  claims[`${ns}username`] = username;
  claims[`${ns}kyc_passed`] = kycPassed;
  claims[`${ns}onboarding_passed`] = onboardingPassed;
  if (preferredLocale) {
    claims[`${ns}preferred_locale`] = preferredLocale;
  }

  return claims;
}
