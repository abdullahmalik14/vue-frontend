import { getCurrentAuthMode, authHandler } from '@/dev/utils/auth/authHandler.js';
import { initiateTwitterLogin } from '@/dev/utils/auth/socialAuthHandler.js';
import { initiateTelegramLogin } from '@/dev/utils/auth/telegramAuthHandler.js';

/**
 * Dev-only popup OAuth for Twitter posting / account linking demos.
 * @returns {boolean}
 */
export function usesLegacySocialPopup() {
  return getCurrentAuthMode() === 'dev';
}

/**
 * Auth0 redirect-based social login.
 * @returns {boolean}
 */
export function usesAuth0SocialRedirect() {
  return getCurrentAuthMode() === 'auth0';
}

/**
 * Dev shim instant social login (no popup).
 * @returns {boolean}
 */
export function usesDevSocialMock() {
  return getCurrentAuthMode() === 'dev';
}

/**
 * Start social login for the active auth provider.
 *
 * @param {'twitter'|'telegram'|string} provider
 * @param {{ intent?: 'login'|'signup', returnTo?: string }} [options]
 * @returns {Promise<{ redirect?: boolean, tokens?: object, popup?: Window, state?: string, provider?: string }>}
 */
export async function initiateSocialLogin(provider, { intent = 'login', returnTo = '/dashboard' } = {}) {
  const mode = getCurrentAuthMode();

  if (mode === 'auth0') {
    await authHandler.loginWithSocial(provider, { intent, returnTo });
    return { redirect: true, provider };
  }

  if (mode === 'dev') {
    const tokens = await authHandler.loginWithSocial(provider, { intent });
    return { tokens, provider, redirect: false };
  }

  throw new Error(`Social login is not configured for provider mode: ${mode}`);
}

/**
 * Open OAuth popup for Twitter/Telegram (dev demos: posting, account linking).
 *
 * @param {'twitter'|'telegram'} provider
 */
export async function initiateSocialPopup(provider) {
  if (provider === 'twitter') {
    const { popup, state } = await initiateTwitterLogin();
    return { popup, state, provider: 'twitter' };
  }

  if (provider === 'telegram') {
    const { popup, state } = await initiateTelegramLogin();
    return { popup, state, provider: 'telegram' };
  }

  throw new Error(`Unsupported social popup provider: ${provider}`);
}

/**
 * Persist tokens and navigate after successful social auth.
 *
 * @param {{ idToken: string, accessToken?: string, refreshToken?: string }} tokens
 * @param {{ authStore: object, router: object, popupNavHandler?: Function|null, destination?: string }} context
 */
export async function applySocialAuthTokens(
  tokens,
  { authStore, router, popupNavHandler = null, destination = '/dashboard' },
) {
  if (tokens.idToken) {
    localStorage.setItem('idToken', tokens.idToken);
  }
  if (tokens.accessToken) {
    localStorage.setItem('accessToken', tokens.accessToken);
  }
  if (tokens.refreshToken) {
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  authStore.setTokenAndDecode(tokens.idToken);
  authStore.startTokenRefreshLoop();

  if (popupNavHandler) {
    popupNavHandler(destination);
    return;
  }

  await router.push(destination);
}
