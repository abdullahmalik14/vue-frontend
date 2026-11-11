/**
 * Dashboard translation scope. Reads and writes stay inside these section folders.
 * Auth, misc, shop, and base are outside this proof of concept.
 */

import { join } from 'node:path';
import { SUPPORTED_LOCALES } from '../../src/systems/i18n/localeConstants.js';

export const SCOPE = 'dashboard';
export const SOURCE_LOCALE = 'en';

/** Folder names under public/i18n. `section-dash` is exact; the others share a prefix. */
export const DASHBOARD_SECTION_DIRS = [
  'section-dash',
  'section-dashboard-creator',
  'section-dashboard-fan',
  'section-dashboard-global',
];

export const MODEL = 'grok-3-mini';

/**
 * Chat-completions rates used only for local estimates.
 * These are not a live account quote. Multi-string requests are not the xAI Batch API.
 */
export const PRICING = {
  model: MODEL,
  inputUsdPerMillion: 0.3,
  outputUsdPerMillion: 0.5,
  verifiedAgainstAccount: false,
  note: 'Confirm model, rates, token limits, trial credit, and Batch API discount in the xAI account before any live call.',
};

export const DEFAULT_MAX_INPUT_TOKENS = 2500;
export const DEFAULT_MAX_ATTEMPTS = 4;
export const DEFAULT_BACKOFF_MS = 400;
export const CHAT_COMPLETIONS_URL = 'https://api.x.ai/v1/chat/completions';

/**
 * @param {string} projectRoot
 */
export function createPaths(projectRoot) {
  return {
    projectRoot,
    i18nRoot: join(projectRoot, 'public', 'i18n'),
    outputDir: join(projectRoot, 'tools', 'dashboard-translate', 'output'),
    stateDir: join(projectRoot, 'tools', 'dashboard-translate', 'state'),
  };
}

/**
 * @param {string} sectionDir
 * @returns {boolean}
 */
export function isDashboardSectionDir(sectionDir) {
  return DASHBOARD_SECTION_DIRS.includes(sectionDir);
}

/**
 * @param {string} locale
 * @returns {boolean}
 */
export function isAllowedTargetLocale(locale) {
  return locale !== SOURCE_LOCALE && SUPPORTED_LOCALES.includes(locale);
}
