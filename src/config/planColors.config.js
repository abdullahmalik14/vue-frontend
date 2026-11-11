/**
 * Fixed color mapping for plan levels used across the dashboard.
 *
 * Plan color scheme:
 *   - Free plan -> light blue (#4CC9F0)
 *   - All other plans -> rotating tier palette
 *
 * The Free plan is identified by its plan title: "Free Plan".
 * All other plan names are resolved dynamically from subscription enrichment
 * data and use TIER_PLAN_COLORS via getPlanColor().
 */

export const FREE_PLAN_KEY = 'Free Plan';

/** @type {Record<string, string>} */
export const PLAN_COLORS = {
  [FREE_PLAN_KEY]: '#4CC9F0',
};

/**
 * The first/default color used for any plan that is not Free.
 */
export const DEFAULT_TIER_COLOR = '#4361EE';

/**
 * Rotating palette used for non-Free plans.
 */
export const TIER_PLAN_COLORS = [
  '#4361EE',
  '#3A0CA3',
  '#AE4AEF',
  '#98A2B3',
  '#F72485',
];

/**
 * The color used for the Free plan in insight charts.
 */
export const FREE_TIER_COLOR = '#4CC9F0';

/**
 * Returns true if the given plan key identifies the Free plan.
 *
 * @param {string} planKey
 * @returns {boolean}
 */
export function isFreePlan(planKey) {
  const normalized = String(planKey || '').trim().toLowerCase();
  return normalized === FREE_PLAN_KEY.toLowerCase() || normalized === 'free';
}

/**
 * Look up the color for a given plan level.
 * Returns the explicit color for Free, or a rotating palette color for all other plans.
 *
 * @param {string} planKey - e.g. "Free Plan", "free", or a dynamic plan title/id
 * @param {number} colorIndex - index used to rotate non-Free plan colors
 * @returns {string}
 */
export function getPlanColor(planKey, colorIndex = 0) {
  if (isFreePlan(planKey)) {
    return PLAN_COLORS[FREE_PLAN_KEY];
  }

  return TIER_PLAN_COLORS[colorIndex % TIER_PLAN_COLORS.length] || DEFAULT_TIER_COLOR;
}
