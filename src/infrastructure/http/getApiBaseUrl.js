import { API_CONFIG, ALLOWED_DOMAINS } from '@/config/apiConfig.js';

/**
 * Resolve the base URL for a given service.
 *
 * @param {string} service        - Key from API_CONFIG (e.g. "events").
 * @param {string} [env]          - Optional override: "production" | "staging".
 *                                  Falls back to VITE_API_ENVIRONMENT env var.
 * @returns {string}              - Base URL with no trailing slash, or "" if not configured.
 *
 * @example
 *   getApiBaseUrl('events')               // uses VITE_API_ENVIRONMENT
 *   getApiBaseUrl('events', 'staging')    // explicit override
 */
const VALID_ENVIRONMENTS = ['production', 'staging', 'dev'];

export function getApiBaseUrl(service, env) {
  const environment = env || import.meta.env.VITE_API_ENVIRONMENT;

  if (!VALID_ENVIRONMENTS.includes(environment)) {
    throw new Error(
      `[getApiBaseUrl] Invalid environment: "${environment}". ` +
      `ENVIRONMENT must be "production", "staging", or "dev".`
    );
  }

  const config = API_CONFIG[service];

  if (!config) {
    throw new Error(
      `[getApiBaseUrl] Unknown service: "${service}". Add it to src/config/apiConfig.js.`
    );
  }

  const url = config[environment] ?? '';

  if (!url) {
    throw new Error(
      `[getApiBaseUrl] No URL configured for service "${service}" / environment "${environment}".`
    );
  }

  const trimmed = url.replace(/\/+$/, '');

  validateUrl(trimmed);

  return trimmed;
}

function validateUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`[getApiBaseUrl] URL is not valid: "${url}".`);
  }

  const isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

  if (!isLocalhost && parsed.protocol !== 'https:') {
    throw new Error(
      `[getApiBaseUrl] Insecure URL rejected: "${url}". All non-localhost endpoints must use HTTPS.`
    );
  }

  if (!isLocalhost && !ALLOWED_DOMAINS.includes(parsed.hostname)) {
    throw new Error(
      `[getApiBaseUrl] Domain not allowed: "${parsed.hostname}".`
    );
  }
}
