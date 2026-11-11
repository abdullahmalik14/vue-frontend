



/**
 * Route alias and legacy redirectFrom helpers (M8).
 */

import { SUPPORTED_LOCALES } from '../i18n/localeConstants.js';

/**
 * Escape a locale code for use inside a Vue Router param regex.
 * @param {string} locale
 * @returns {string}
 */
function escapeLocaleForRouteRegex(locale) {
  return String(locale).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build optional locale param constrained to supported locale codes only.
 * Prevents paths like `/sign-up` from matching the home route as `:locale`.
 *
 * @param {string[]} [supportedLocales=SUPPORTED_LOCALES]
 * @returns {string}
 */
export function buildLocaleParamSegment(supportedLocales = SUPPORTED_LOCALES) {
  const localePattern = supportedLocales.map(escapeLocaleForRouteRegex).join('|');
  return `:locale(${localePattern})?`;
}

/**
 * Normalize a route path to a leading-slash slug.
 *
 * @param {string} path
 * @returns {string|null}
 */
export function normalizeRoutePath(path) {
  if (typeof path !== 'string') {
    return null;
  }

  const trimmed = path.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/**
 * Build locale-aware route path used by the router generator.
 * Home (`/`) uses `/:locale(...)?` without a trailing slash so auth paths
 * like `/sign-up` are not captured as a locale segment.
 *
 * @param {string} slug
 * @param {string[]} [supportedLocales=SUPPORTED_LOCALES]
 * @returns {string|null}
 */
export function buildLocaleOptionalRoutePath(slug, supportedLocales = SUPPORTED_LOCALES) {
  const normalized = normalizeRoutePath(slug);
  if (!normalized) {
    return null;
  }

  const localeParam = buildLocaleParamSegment(supportedLocales);

  if (normalized === '/') {
    return `/${localeParam}`;
  }

  return `/${localeParam}${normalized}`;
}

/**
 * Normalize redirectFrom to a string array.
 *
 * @param {string|string[]|undefined} redirectFrom
 * @returns {string[]}
 */
export function normalizeRedirectFromList(redirectFrom) {
  if (typeof redirectFrom === 'string') {
    const normalized = normalizeRoutePath(redirectFrom);
    return normalized ? [normalized] : [];
  }

  if (!Array.isArray(redirectFrom)) {
    return [];
  }

  return redirectFrom
    .map((entry) => normalizeRoutePath(entry))
    .filter(Boolean);
}

/**
 * Normalize aliases to slug paths.
 *
 * @param {string[]|undefined} aliases
 * @returns {string[]}
 */
export function normalizeAliasList(aliases) {
  if (!Array.isArray(aliases)) {
    return [];
  }

  return aliases
    .map((entry) => normalizeRoutePath(entry))
    .filter(Boolean);
}

/**
 * Map routeConfig aliases to Vue Router alias paths (locale-aware).
 *
 * @param {string[]|undefined} aliases
 * @returns {string[]}
 */
export function buildVueRouterAliases(aliases) {
  return normalizeAliasList(aliases)
    .map((alias) => buildLocaleOptionalRoutePath(alias))
    .filter(Boolean);
}

/**
 * Whether a route config matches a locale-free path via slug or aliases.
 *
 * @param {object} routeConfig
 * @param {string} targetPath
 * @returns {boolean}
 */
export function routeConfigMatchesPath(routeConfig, targetPath) {
  const normalizedTarget = normalizeRoutePath(targetPath);
  if (!normalizedTarget || !routeConfig) {
    return false;
  }

  if (normalizeRoutePath(routeConfig.slug) === normalizedTarget) {
    return true;
  }

  return normalizeAliasList(routeConfig.aliases).includes(normalizedTarget);
}

/**
 * Create locale-aware redirect route records for redirectFrom entries.
 *
 * @param {object} route
 * @param {object} options
 * @param {function} options.resolveLocaleFromRouteLocation
 * @param {function} options.buildLocaleAwareRedirectPath
 * @param {string[]} options.supportedLocales
 * @returns {Array<{ path: string, redirect: function }>}
 */
export function createRedirectFromRouteRecords(route, options) {
  const {
    resolveLocaleFromRouteLocation,
    buildLocaleAwareRedirectPath,
    supportedLocales,
  } = options;

  const targetSlug = normalizeRoutePath(route.slug);
  if (!targetSlug) {
    return [];
  }

  return normalizeRedirectFromList(route.redirectFrom)
    .map((sourcePath) => {
      const path = buildLocaleOptionalRoutePath(sourcePath);
      if (!path) {
        return null;
      }

      return {
        path,
        redirect: (to) => {
          const locale = resolveLocaleFromRouteLocation(to, supportedLocales);
          return buildLocaleAwareRedirectPath(targetSlug, locale, supportedLocales);
        },
      };
    })
    .filter(Boolean);
}

/**
 * Collect path claims for duplicate detection during validation.
 *
 * @param {Array<object>} routes
 * @returns {Map<string, { slug: string, kind: string }>}
 */
export function collectRoutePathClaims(routes) {
  const claims = new Map();

  const register = (path, slug, kind) => {
    if (!path) {
      return;
    }

    claims.set(path, { slug, kind });
  };

  for (const route of routes) {
    const slug = normalizeRoutePath(route.slug);
    if (slug) {
      register(slug, route.slug, 'slug');
    }

    for (const alias of normalizeAliasList(route.aliases)) {
      register(alias, route.slug, 'alias');
    }

    for (const legacyPath of normalizeRedirectFromList(route.redirectFrom)) {
      register(legacyPath, route.slug, 'redirectFrom');
    }
  }

  return claims;
}

/**
 * Find duplicate path claims across slugs, aliases, and redirectFrom.
 *
 * @param {Array<object>} routes
 * @returns {Array<{ path: string, first: object, second: object }>}
 */
export function findDuplicateRoutePathClaims(routes) {
  const pathOwners = new Map();
  const duplicates = [];

  const register = (path, slug, kind) => {
    if (!path) {
      return;
    }

    const existing = pathOwners.get(path);
    if (existing) {
      if (existing.slug !== slug || existing.kind !== kind) {
        duplicates.push({
          path,
          first: existing,
          second: { slug, kind },
        });
      }
      return;
    }

    pathOwners.set(path, { slug, kind });
  };

  for (const route of routes) {
    register(normalizeRoutePath(route.slug), route.slug, 'slug');

    for (const alias of normalizeAliasList(route.aliases)) {
      register(alias, route.slug, 'alias');
    }

    for (const legacyPath of normalizeRedirectFromList(route.redirectFrom)) {
      register(legacyPath, route.slug, 'redirectFrom');
    }
  }

  return duplicates;
}
