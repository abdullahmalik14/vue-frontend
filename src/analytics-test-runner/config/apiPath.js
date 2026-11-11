export const PERIOD_API_KEY = {
  day: 'daily',
  week: 'weekly',
  month: 'monthly',
  year: 'yearly',
  alltime: 'alltime',
};

const PERIOD_SEGMENTS = new Set(['daily', 'weekly', 'monthly', 'yearly', 'alltime']);

const VALUE_ALIASES = {
  usdSpent: ['usdSpent', 'orders', 'subscription', 'amount', 'totalSpent'],
};

function looksLikeContributorRows(arr) {
  if (!Array.isArray(arr) || !arr.length) return false;
  const row = arr[0];
  return (
    row
    && typeof row === 'object'
    && (row.fanId != null || row.name != null || row.orders != null || row.usdSpent != null)
  );
}

export function getApiPathValue(payload, path) {
  return String(path || '').split('.').reduce((acc, key) => {
    if (acc == null) return undefined;
    if (Array.isArray(acc) && PERIOD_SEGMENTS.has(key)) {
      return acc;
    }
    if (key === '-1' && Array.isArray(acc)) {
      // Period bucket arrays: last slot. Contributor lists: top row (index 0).
      return looksLikeContributorRows(acc) ? acc[0] : acc[acc.length - 1];
    }
    if (acc && typeof acc === 'object' && !Array.isArray(acc) && Object.prototype.hasOwnProperty.call(acc, key)) {
      return acc[key];
    }
    if (acc && typeof acc === 'object' && VALUE_ALIASES[key]) {
      for (const alt of VALUE_ALIASES[key]) {
        if (acc[alt] != null) return acc[alt];
      }
    }
    return acc?.[key];
  }, payload);
}

