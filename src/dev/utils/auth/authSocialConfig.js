/**
 * Auth0 social connection names and provider routing helpers.
 */

export const AUTH0_SOCIAL_CONNECTIONS = {
  twitter: import.meta.env.VITE_AUTH0_TWITTER_CONNECTION || 'twitter',
  telegram: import.meta.env.VITE_AUTH0_TELEGRAM_CONNECTION || 'telegram',
  google: import.meta.env.VITE_AUTH0_GOOGLE_CONNECTION || 'google-oauth2',
  facebook: import.meta.env.VITE_AUTH0_FACEBOOK_CONNECTION || 'facebook',
};

/**
 * @param {'twitter'|'telegram'|'google'|'facebook'|string} provider
 * @returns {string}
 */
export function getAuth0ConnectionForProvider(provider) {
  return AUTH0_SOCIAL_CONNECTIONS[provider] || provider;
}

/**
 * Providers that use Auth0 Universal Login redirect (not legacy popup).
 * @param {string} provider
 * @returns {boolean}
 */
export function isAuth0RedirectProvider(provider) {
  return Boolean(getAuth0ConnectionForProvider(provider));
}
