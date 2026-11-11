const PERIOD_KEYS = ['daily', 'weekly', 'monthly', 'yearly'];

const TOLERANCE = 0.01;

const SECTION_SPECS = [
  {
    section: 'earnings',
    entriesKey: '',
    summariesKey: 'summaries',
    checks: [
      { field: 'total', totalField: 'totalEarningsUSD', label: 'Total Earnings' },
      { field: 'totalTokens', totalField: 'tokensReceived', label: 'Tokens Received' },
    ],
  },
  {
    section: 'subscriptions',
    entriesKey: '',
    summariesKey: 'summaries',
    checks: [
      { field: 'newSubscriber', totalField: 'newSubscriber', label: 'New Subscribers' },
      { field: 'recurringSubscriber', totalField: 'recurringSubscriber', label: 'Recurring Subscribers' },
      { field: 'totalSubscribers', totalField: 'totalSubscribers', label: 'Total Subscribers' },
    ],
  },
  {
    section: 'fanInsights',
    entriesKey: '',
    summariesKey: 'summaries',
    checks: [
      { field: 'newFollowers', totalField: 'newFollowers', label: 'New Followers' },
      { field: 'profileVisits', totalField: 'profileVisits', label: 'Profile Visits' },
    ],
  },
  {
    section: 'likes',
    entriesKey: '',
    summariesKey: 'summaries',
    checks: [
      { field: 'media', totalField: 'media', label: 'Media Likes' },
      { field: 'merch', totalField: 'merch', label: 'Merch Likes' },
      { field: 'profile', totalField: 'profile', label: 'Profile Likes' },
      { field: 'feed', totalField: 'feed', label: 'Feed Likes' },
    ],
  },
];

export function validatePeriodTotals(chartsPayload) {
  const results = [];

  for (const spec of SECTION_SPECS) {
    const sectionData = chartsPayload?.[spec.section];
    if (!sectionData) {
      results.push({
        severity: 'SKIP',
        section: spec.section,
        message: `Section "${spec.section}" missing from payload`,
      });
      continue;
    }

    for (const periodKey of PERIOD_KEYS) {
      const entries = sectionData[periodKey];
      if (!Array.isArray(entries) || entries.length === 0) {
        results.push({
          severity: 'SKIP',
          section: spec.section,
          period: periodKey,
          message: `No ${periodKey} entries to sum`,
        });
        continue;
      }

      for (const check of spec.checks) {
        const sumOfEntries = entries.reduce(
          (acc, entry) => acc + Number(entry?.[check.field] || 0),
          0,
        );

        if (spec.summariesKey && sectionData[spec.summariesKey]?.[periodKey]) {
          const statedTotal = Number(sectionData[spec.summariesKey][periodKey][check.totalField] || 0);
          const diff = Math.abs(sumOfEntries - statedTotal);
          const pass = diff <= TOLERANCE;
          results.push({
            severity: pass ? 'PASS' : 'FAIL',
            section: spec.section,
            period: periodKey,
            check: `${check.field} → summaries.${check.totalField}`,
            label: check.label,
            sumOfEntries,
            statedTotal,
            diff,
            message: pass
              ? `${check.label}: sum(${sumOfEntries}) === summaries.${statedTotal}`
              : `${check.label}: sum(${sumOfEntries}) !== summaries.${statedTotal} (diff=${diff})`,
          });
        }

        if (periodKey === 'daily' && sectionData.grandTotal) {
          const grandTotalValue = Number(
            sectionData.grandTotal[check.totalField]
              ?? sectionData.grandTotal[check.field]
              ?? 0,
          );
          const diff = Math.abs(sumOfEntries - grandTotalValue);
          const pass = diff <= TOLERANCE;
          results.push({
            severity: pass ? 'PASS' : 'FAIL',
            section: spec.section,
            period: periodKey,
            check: `${check.field} → grandTotal.${check.totalField}`,
            label: check.label,
            sumOfEntries,
            grandTotalValue,
            diff,
            message: pass
              ? `${check.label}: sum(${sumOfEntries}) === grandTotal.${grandTotalValue}`
              : `${check.label}: sum(${sumOfEntries}) !== grandTotal.${grandTotalValue} (diff=${diff})`,
          });
        }
      }
    }
  }

  const pass = results.filter((r) => r.severity === 'PASS').length;
  const fail = results.filter((r) => r.severity === 'FAIL').length;
  const skip = results.filter((r) => r.severity === 'SKIP').length;

  return {
    summary: { total: results.length, pass, fail, skip },
    results,
  };
}
