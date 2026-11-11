/**
 * Master event → child metric routing (test-runner mirror of Node ingest mapping).
 * When server mapping changes, update this file first — unit tests guard domain isolation.
 *
 * @typedef {'fans'|'subscriptions'|'earnings'|'likes'|'countries'|'contributors'|'trendsMedia'|'trendsMerch'|'trendsTags'} MetricDomain
 */

import { EVENT_EXPECTATIONS } from './eventExpectations.js';
import { resolvePeriodKeysForOccurredAt } from './periodBuckets.js';

export const PERIOD_KEYS = ['daily', 'weekly', 'monthly', 'yearly', 'alltime'];

/**
 * @param {object} [ctx]
 * @returns {string[]}
 */
export function resolveIncrementPeriodKeys(ctx) {
  if (Array.isArray(ctx)) return ctx;
  if (Array.isArray(ctx?.periodKeys) && ctx.periodKeys.length) return ctx.periodKeys;
  if (ctx?.occurredAt != null && ctx.occurredAt !== '') {
    return resolvePeriodKeysForOccurredAt(ctx.occurredAt, ctx.now);
  }
  return PERIOD_KEYS;
}

/**
 * @param {object} [ctx]
 */
export function resolveIncrementMultiplier(ctx) {
  if (!ctx || Array.isArray(ctx)) return 1;
  const n = Number(ctx.multiplier ?? 1);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/**
 * Resolve USD credit for order events (switch uses configurable field).
 * @param {Record<string, unknown>} fields
 * @param {{ earningsCreditField?: string }} [options]
 */
export function resolveOrderCreditAmount(fields = {}, options = {}) {
  const creditField = options.earningsCreditField || fields.earningsCreditField || 'amount';
  const fromField = fields[creditField];
  if (fromField != null && Number.isFinite(Number(fromField))) {
    return Number(fromField);
  }
  return Number(fields.amount ?? 0);
}

function num(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * @param {Record<string, unknown>} fields
 * @param {{ earningsCreditField?: string }} [ctx]
 * @returns {Array<{ domain: MetricDomain, apply: (state: object, fields: object, ctx: object) => void }>}
 */
export function resolveChildUpdates(masterEventType, fields = {}, ctx = {}) {
  const orderType = String(fields.orderType ?? '');
  const isSwitch = fields.is_switch === true;

  if (masterEventType === 'newOrder') {
    if (orderType === 'new_subscription' && isSwitch) {
      return buildNewSubscriptionUpdates(fields, ctx);
    }
    if (orderType === 'new_subscription') {
      return buildNewSubscriptionUpdates(fields, ctx);
    }
    if (orderType === 'recurring_subscription') {
      return buildRecurringSubscriptionUpdates(fields, ctx);
    }
    if (orderType === 'merch') {
      return buildMerchOrderUpdates(fields, ctx);
    }
    if (orderType === 'p2v') {
      return buildP2vOrderUpdates(fields, ctx);
    }
    if (orderType === 'token') {
      return buildTokenOrderUpdates(fields, ctx);
    }
  }

  const direct = DIRECT_MASTER_MAP[masterEventType];
  if (direct) return direct(fields, ctx);
  return [];
}

/** @type {Record<string, (fields: object, ctx: object) => Array<{ domain: MetricDomain, apply: Function }>>} */
const DIRECT_MASTER_MAP = {
  follow: () => [
    {
      domain: 'fans',
      apply: (state, _fields, ctx) => {
        incrementPeriodMetric(state.fans, 'newFollowers', 1, ctx);
      },
    },
  ],
  unfollow: () => [
    {
      domain: 'fans',
      apply: (state, _fields, ctx) => {
        incrementPeriodMetric(state.fans, 'newFollowers', -1, ctx);
      },
    },
  ],
  profileVisit: () => [
    {
      domain: 'fans',
      apply: (state, _fields, ctx) => {
        incrementPeriodMetric(state.fans, 'profileVisits', 1, ctx);
      },
    },
  ],
  mediaLike: () => [
    {
      domain: 'likes',
      apply: (state, _fields, ctx) => {
        incrementPeriodMetric(state.likes, 'media', 1, ctx);
      },
    },
  ],
  mediaUnlike: () => [
    {
      domain: 'likes',
      apply: (state, _fields, ctx) => {
        incrementPeriodMetric(state.likes, 'media', -1, ctx);
      },
    },
  ],
  profileLike: () => [
    {
      domain: 'likes',
      apply: (state, _fields, ctx) => {
        incrementPeriodMetric(state.likes, 'profile', 1, ctx);
      },
    },
  ],
  profileUnlike: () => [
    {
      domain: 'likes',
      apply: (state, _fields, ctx) => {
        incrementPeriodMetric(state.likes, 'profile', -1, ctx);
      },
    },
  ],
  merchLike: () => [
    {
      domain: 'likes',
      apply: (state, _fields, ctx) => {
        incrementPeriodMetric(state.likes, 'merch', 1, ctx);
      },
    },
  ],
  merchUnlike: () => [
    {
      domain: 'likes',
      apply: (state, _fields, ctx) => {
        incrementPeriodMetric(state.likes, 'merch', -1, ctx);
      },
    },
  ],
  feedLike: () => [
    {
      domain: 'likes',
      apply: (state, _fields, ctx) => {
        incrementPeriodMetric(state.likes, 'feed', 1, ctx);
      },
    },
  ],
  feedUnlike: () => [
    {
      domain: 'likes',
      apply: (state, _fields, ctx) => {
        incrementPeriodMetric(state.likes, 'feed', -1, ctx);
      },
    },
  ],
  tagEngagement: (fields) => [
    {
      domain: 'trendsTags',
      apply: (state, _fields, ctx) => {
        const tagId = String(fields.tagId ?? 'Panty_Fetish');
        incrementTagViews(state.trendsTags, tagId, 1, ctx);
      },
    },
  ],
  subscriptionCancel: (fields, ctx) => {
    const amount = num(ctx?.seedSubscriptionAmount, 29.99);
    return [
      {
        domain: 'subscriptions',
        apply: (state, _f, applyCtx) => {
          incrementPeriodMetric(state.subscriptions, 'newSubscriber', -1, applyCtx);
          const planId = num(applyCtx?.seedPlanId ?? ctx?.seedPlanId ?? fields.planId ?? 2);
          incrementPeriodMetric(state.subscriptions, `tier${planId}`, -1, applyCtx);
        },
      },
      {
        domain: 'earnings',
        apply: (state, _f, applyCtx) => {
          incrementPeriodMetric(state.earnings, 'subscription', -amount, applyCtx);
          incrementPeriodMetric(state.earnings, 'total', -amount, applyCtx);
        },
      },
    ];
  },
  mediaView: (fields) => [
    {
      domain: 'trendsMedia',
      apply: (state, _fields, ctx) => {
        const mediaId = num(fields.mediaId, 5117);
        incrementMediaMetric(state.trendsMedia, mediaId, 'views', 1, ctx);
      },
    },
  ],
  mediaWatchDuration: (fields) => [
    {
      domain: 'trendsMedia',
      apply: (state, _fields, ctx) => {
        const mediaId = num(fields.mediaId, 2811);
        const sec = num(fields.durationMs, 50000) / 1000;
        incrementMediaMetric(state.trendsMedia, mediaId, 'watchDurationSec', sec, ctx);
      },
    },
  ],
};

function buildNewSubscriptionUpdates(fields, ctx) {
  const amount = resolveOrderCreditAmount(fields, ctx);
  const planId = num(fields.planId, 2);
  const countryId = num(fields.countryId, 702);
  const fanId = ctx.fanId;

  return [
    {
      domain: 'subscriptions',
      apply: (state, _fields, applyCtx) => {
        incrementPeriodMetric(state.subscriptions, 'newSubscriber', 1, applyCtx);
        incrementPeriodMetric(state.subscriptions, `tier${planId}`, 1, applyCtx);
      },
    },
    {
      domain: 'earnings',
      apply: (state, _fields, applyCtx) => {
        incrementPeriodMetric(state.earnings, 'subscription', amount, applyCtx);
        incrementPeriodMetric(state.earnings, 'total', amount, applyCtx);
      },
    },
    {
      domain: 'countries',
      apply: (state, _fields, applyCtx) => {
        incrementCountrySales(state.countries, countryId, amount, applyCtx);
      },
    },
    {
      domain: 'contributors',
      apply: (state, _fields, applyCtx) => {
        if (fanId != null) {
          addContributorSpend(state.contributors, fanId, amount, ctx.fanLabel, {}, applyCtx);
        }
      },
    },
  ];
}

function buildRecurringSubscriptionUpdates(fields, ctx) {
  const amount = num(fields.amount, 10);
  const countryId = num(fields.countryId, 840);
  const fanId = ctx.fanId;

  return [
    {
      domain: 'subscriptions',
      apply: (state, _fields, applyCtx) => {
        incrementPeriodMetric(state.subscriptions, 'recurringSubscriber', 1, applyCtx);
      },
    },
    {
      domain: 'earnings',
      apply: (state, _fields, applyCtx) => {
        incrementPeriodMetric(state.earnings, 'subscription', amount, applyCtx);
        incrementPeriodMetric(state.earnings, 'total', amount, applyCtx);
      },
    },
    {
      domain: 'countries',
      apply: (state, _fields, applyCtx) => {
        incrementCountrySales(state.countries, countryId, amount, applyCtx);
      },
    },
    {
      domain: 'contributors',
      apply: (state, _fields, applyCtx) => {
        if (fanId != null) {
          addContributorSpend(state.contributors, fanId, amount, ctx.fanLabel, {}, applyCtx);
        }
      },
    },
  ];
}

function buildMerchOrderUpdates(fields, ctx) {
  const amount = num(fields.amount, 15);
  const countryId = num(fields.countryId, 634);
  const merchId = num(fields.merchId, 4);
  const fanId = ctx.fanId;

  return [
    {
      domain: 'earnings',
      apply: (state, _fields, applyCtx) => {
        incrementPeriodMetric(state.earnings, 'merch', amount, applyCtx);
        incrementPeriodMetric(state.earnings, 'total', amount, applyCtx);
      },
    },
    {
      domain: 'countries',
      apply: (state, _fields, applyCtx) => {
        incrementCountrySales(state.countries, countryId, amount, applyCtx);
      },
    },
    {
      domain: 'contributors',
      apply: (state, _fields, applyCtx) => {
        if (fanId != null) {
          addContributorSpend(state.contributors, fanId, amount, ctx.fanLabel, {}, applyCtx);
        }
      },
    },
    {
      domain: 'trendsMerch',
      apply: (state, _fields, applyCtx) => {
        incrementMerchSales(state.trendsMerch, merchId, amount, applyCtx);
      },
    },
  ];
}

function buildP2vOrderUpdates(fields, ctx) {
  const amount = num(fields.amount, 15.02);
  const countryId = num(fields.countryId, 392);
  const mediaId = num(fields.mediaId, 101);
  const fanId = ctx.fanId;

  return [
    {
      domain: 'earnings',
      apply: (state, _fields, applyCtx) => {
        incrementPeriodMetric(state.earnings, 'paytoview', amount, applyCtx);
        incrementPeriodMetric(state.earnings, 'total', amount, applyCtx);
      },
    },
    {
      domain: 'countries',
      apply: (state, _fields, applyCtx) => {
        incrementCountrySales(state.countries, countryId, amount, applyCtx);
      },
    },
    {
      domain: 'contributors',
      apply: (state, _fields, applyCtx) => {
        if (fanId != null) {
          addContributorSpend(state.contributors, fanId, amount, ctx.fanLabel, {}, applyCtx);
        }
      },
    },
    {
      domain: 'trendsMedia',
      apply: (state, _fields, applyCtx) => {
        incrementMediaMetric(state.trendsMedia, mediaId, 'ppvSalesUSD', amount, applyCtx);
      },
    },
  ];
}

function buildTokenOrderUpdates(fields, ctx) {
  const amount = num(fields.tokenCount ?? fields.amount, 5);
  const countryId = num(fields.countryId, 250);
  const channel = String(fields.tokenChannel ?? 'tip');
  const tokenField = channel === 'tip' ? 'tipTokens' : `${channel}Tokens`;
  const fanId = ctx.fanId;

  return [
    {
      domain: 'earnings',
      apply: (state, _fields, applyCtx) => {
        incrementPeriodMetric(state.earnings, 'tipTokens', amount, applyCtx);
        incrementPeriodMetric(state.earnings, 'totalTokens', amount, applyCtx);
      },
    },
    {
      domain: 'countries',
      apply: (state, _fields, applyCtx) => {
        incrementCountrySales(state.countries, countryId, amount, applyCtx);
      },
    },
    {
      domain: 'contributors',
      apply: (state, _fields, applyCtx) => {
        if (fanId != null) {
          addContributorSpend(state.contributors, fanId, amount, ctx.fanLabel, { tokens: amount }, applyCtx);
        }
      },
    },
  ];
}

/** Exported for tests and expectationState */
export function incrementPeriodMetric(domainStore, metricKey, delta, ctx) {
  const periodKeys = resolveIncrementPeriodKeys(ctx);
  const amount = delta * resolveIncrementMultiplier(ctx);
  periodKeys.forEach((periodKey) => {
    if (!domainStore[periodKey]) {
      domainStore[periodKey] = [
        { period: periodKey },
        { period: periodKey },
      ];
    }
    const bucket = domainStore[periodKey];
    while (bucket.length < 2) {
      bucket.unshift({ period: periodKey });
    }
    const row = bucket[bucket.length - 1];
    row[metricKey] = num(row[metricKey]) + amount;
  });
}

export function incrementCountrySales(countriesStore, countryId, delta, ctx) {
  const code = `Country ${countryId}`;
  const periodKeys = resolveIncrementPeriodKeys(ctx);
  const amount = delta * resolveIncrementMultiplier(ctx);
  periodKeys.forEach((periodKey) => {
    if (!countriesStore[periodKey]) countriesStore[periodKey] = [];
    const arr = countriesStore[periodKey];
    let row = arr.find((item) => item.country === code || String(item.countryId) === String(countryId));
    if (!row) {
      row = { country: code, countryId, salesUSD: 0 };
      arr.push(row);
    }
    row.salesUSD = num(row.salesUSD) + amount;
  });
}

export function addContributorSpend(contributorsStore, fanId, usdDelta, fanLabel, extra = {}, ctx) {
  const tokensDelta = extra.tokens || 0;
  const periodKeys = resolveIncrementPeriodKeys(ctx);
  const mult = resolveIncrementMultiplier(ctx);
  const usd = usdDelta * mult;
  const tokens = tokensDelta * mult;
  const key = String(fanId);

  const applyTo = (bag) => {
    if (!bag[key]) {
      bag[key] = {
        fanId: key,
        name: fanLabel || `Fan ${key}`,
        usdSpent: 0,
        tokens: 0,
      };
    }
    const row = bag[key];
    row.usdSpent = num(row.usdSpent) + usd;
    row.tokens = num(row.tokens) + tokens;
  };

  if (!contributorsStore.byFanId) contributorsStore.byFanId = {};
  applyTo(contributorsStore.byFanId);

  if (!contributorsStore.byPeriod) {
    contributorsStore.byPeriod = Object.fromEntries(PERIOD_KEYS.map((k) => [k, {}]));
  }
  periodKeys.forEach((periodKey) => {
    if (!contributorsStore.byPeriod[periodKey]) contributorsStore.byPeriod[periodKey] = {};
    applyTo(contributorsStore.byPeriod[periodKey]);
  });
}

export function incrementTagViews(tagsStore, tagId, delta, ctx) {
  const periodKeys = resolveIncrementPeriodKeys(ctx);
  const amount = delta * resolveIncrementMultiplier(ctx);
  periodKeys.forEach((periodKey) => {
    if (!tagsStore[periodKey]) tagsStore[periodKey] = [];
    const arr = tagsStore[periodKey];
    let row = arr.find((t) => String(t.tag).includes(tagId));
    if (!row) {
      row = { tag: tagId, views: 0 };
      arr.push(row);
    }
    row.views = num(row.views) + amount;
  });
}

export function incrementMediaMetric(mediaStore, mediaId, field, delta, ctx) {
  const periodKeys = resolveIncrementPeriodKeys(ctx);
  const amount = delta * resolveIncrementMultiplier(ctx);
  periodKeys.forEach((periodKey) => {
    if (!mediaStore[periodKey]) mediaStore[periodKey] = [];
    const arr = mediaStore[periodKey];
    let row = arr.find((m) => Number(m.mediaId) === Number(mediaId));
    if (!row) {
      row = { mediaId, views: 0, watchDurationSec: 0, ppvSalesUSD: 0 };
      arr.push(row);
    }
    row[field] = num(row[field]) + amount;
  });
}

export function incrementMerchSales(merchStore, merchId, delta, ctx) {
  const periodKeys = resolveIncrementPeriodKeys(ctx);
  const mult = resolveIncrementMultiplier(ctx);
  const amount = delta * mult;
  periodKeys.forEach((periodKey) => {
    if (!merchStore[periodKey]) merchStore[periodKey] = [];
    const arr = merchStore[periodKey];
    let row = arr.find((m) => Number(m.merchId) === Number(merchId));
    if (!row) {
      row = { merchId, salesUSD: 0, salesCount: 0 };
      arr.push(row);
    }
    row.salesUSD = num(row.salesUSD) + amount;
    row.salesCount = num(row.salesCount) + 1 * mult;
  });
}

/**
 * Map test case key to master event dispatch context.
 * @param {string} testCaseKey
 * @param {Record<string, unknown>} fields
 */
export function resolveMasterEventFromTestCase(testCaseKey, fields = {}) {
  const fromConfig = EVENT_EXPECTATIONS[testCaseKey]?.trigger;
  const mergedFields = { ...(fromConfig?.fields || {}), ...fields };

  if (testCaseKey === 'switchSubscription') {
    return {
      masterEventType: 'newOrder',
      fields: { ...mergedFields, is_switch: true },
      earningsCreditField: mergedFields.earningsCreditField || 'amount',
    };
  }
  const fromExpectations = {
    newSubscription: { masterEventType: 'newOrder', fields: mergedFields },
    recurringSubscription: { masterEventType: 'newOrder', fields: mergedFields },
    merchOrder: { masterEventType: 'newOrder', fields: mergedFields },
    p2vOrder: { masterEventType: 'newOrder', fields: mergedFields },
    tokenOrder: { masterEventType: 'newOrder', fields: mergedFields },
    cancelSubscription: { masterEventType: 'subscriptionCancel', fields: mergedFields },
    follow: { masterEventType: 'follow', fields: mergedFields },
    unfollow: { masterEventType: 'unfollow', fields: mergedFields },
    profileVisit: { masterEventType: 'profileVisit', fields: mergedFields },
    mediaLike: { masterEventType: 'mediaLike', fields: mergedFields },
    mediaUnlike: { masterEventType: 'mediaUnlike', fields: mergedFields },
    profileLike: { masterEventType: 'profileLike', fields: mergedFields },
    profileUnlike: { masterEventType: 'profileUnlike', fields: mergedFields },
    merchLike: { masterEventType: 'merchLike', fields: mergedFields },
    merchUnlike: { masterEventType: 'merchUnlike', fields: mergedFields },
    feedLike: { masterEventType: 'feedLike', fields: mergedFields },
    feedUnlike: { masterEventType: 'feedUnlike', fields: mergedFields },
    tagEngagement: { masterEventType: 'tagEngagement', fields: mergedFields },
    mediaView: { masterEventType: 'mediaView', fields: mergedFields },
    mediaWatchDuration: { masterEventType: 'mediaWatchDuration', fields: mergedFields },
  };
  if (fromExpectations[testCaseKey]) {
    return fromExpectations[testCaseKey];
  }
  if (fromConfig) {
    return { masterEventType: fromConfig.masterEventType, fields: mergedFields };
  }
  return { masterEventType: testCaseKey, fields: mergedFields };
}
