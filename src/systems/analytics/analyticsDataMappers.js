export function getContributorsListForPeriod(source, periodKey) {
  if (!source) return []
  if (Array.isArray(source)) return source 
  return source[periodKey]?.length ? source[periodKey] : (source['alltime'] || [])
}

export function mapContributorToPreviewRow(arr, enrichedUsers = {}) {
  if (!Array.isArray(arr)) return [];
  return arr.map((c, index) => {
    if (!c) return null;
    const fanIdKey = String(c.fanId || '');
    const enriched = enrichedUsers[fanIdKey];
    const orders = Number(c.orders || 0);
    const tokenEarnings = Number(c.tokenEarningsUSD || c.tokens || 0);
    const computedTotal = orders + tokenEarnings;
    return {
      ...c,
      id: index + 1,
      rank: index + 1,
      name: (enriched && enriched.displayName) || c.name || '',
      handle: (enriched && enriched.username) || c.handle || '',
      avatar: (enriched && enriched.avatarUrl) || c.avatar || null,
      total: computedTotal,
      rawTotal: computedTotal
    };
  }).filter(Boolean);
}
