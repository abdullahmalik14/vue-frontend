import {
  PERIOD_KEYS,
  resolveChildUpdates,
  resolveMasterEventFromTestCase,
} from './masterEventChildMap.js';
import { TIMESTAMP_FIELD_KEYS } from './periodBuckets.js';

function emptyPeriodBuckets() {
  const buckets = {};
  PERIOD_KEYS.forEach((key) => {
    buckets[key] = [{ period: key }, { period: key }];
  });
  return buckets;
}

/**
 * Domain-partitioned internal ledger (source of truth for test expectations).
 */
export function createEmptyExpectationState() {
  return {
    fans: emptyPeriodBuckets(),
    subscriptions: emptyPeriodBuckets(),
    earnings: emptyPeriodBuckets(),
    likes: emptyPeriodBuckets(),
    countries: Object.fromEntries(PERIOD_KEYS.map((k) => [k, []])),
    contributors: {
      byFanId: {},
      byPeriod: Object.fromEntries(PERIOD_KEYS.map((k) => [k, {}])),
    },
    trendsMedia: Object.fromEntries(PERIOD_KEYS.map((k) => [k, []])),
    trendsMerch: Object.fromEntries(PERIOD_KEYS.map((k) => [k, []])),
    trendsTags: Object.fromEntries(PERIOD_KEYS.map((k) => [k, []])),
    eventHistory: [],
  };
}

/**
 * @param {ReturnType<typeof createEmptyExpectationState>} state
 * @param {{ testCaseKey?: string, masterEventType?: string, fields?: Record<string, unknown>, fanId?: number|string, fanLabel?: string, earningsCreditField?: string, seedSubscriptionAmount?: number, seedPlanId?: number, occurredAt?: Date|string|number, multiplier?: number, periodKeys?: string[], now?: Date }} event
 */
export function applyMasterEvent(state, event) {
  const resolved = event.testCaseKey
    ? resolveMasterEventFromTestCase(event.testCaseKey, event.fields || {})
    : { masterEventType: event.masterEventType, fields: event.fields || {} };

  const occurredAt =
    event.occurredAt !== undefined
      ? event.occurredAt
      : event.fields?.occurredAt ?? event.fields?.createdAt;
  const multiplier = Math.max(1, Number(event.multiplier ?? 1) || 1);

  const ctx = {
    fanId: event.fanId,
    fanLabel: event.fanLabel || (event.fanId != null ? `Fan ${event.fanId}` : undefined),
    earningsCreditField:
      event.earningsCreditField ||
      resolved.earningsCreditField ||
      event.fields?.earningsCreditField,
    seedSubscriptionAmount: event.seedSubscriptionAmount,
    seedPlanId: event.seedPlanId,
    occurredAt,
    multiplier,
    periodKeys: event.periodKeys,
    now: event.now,
  };

  const updates = resolveChildUpdates(resolved.masterEventType, resolved.fields, ctx);
  updates.forEach(({ apply }) => {
    apply(state, resolved.fields, ctx);
  });

  state.eventHistory.push({
    testCaseKey: event.testCaseKey,
    masterEventType: resolved.masterEventType,
    fields: { ...resolved.fields },
    fanId: event.fanId,
    occurredAt: occurredAt ?? null,
    multiplier,
    at: new Date().toISOString(),
  });

  return state;
}

function sortedContributors(byFanId) {
  return Object.values(byFanId).sort((a, b) => num(b.usdSpent) - num(a.usdSpent) || num(b.tokens) - num(a.tokens));
}

function num(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function mapSubscriptionsPeriod(arr) {
  return (arr || []).map((item) => ({
    period: item.period,
    newSubscriber: num(item.newSubscriber),
    recurringSubscriber: num(item.recurringSubscriber),
    tier1: num(item.tier1),
    tier2: num(item.tier2),
    tier3: num(item.tier3),
    tier4: num(item.tier4),
    tier5: num(item.tier5),
    free: num(item.free),
  }));
}

/**
 * Materialize charts-compatible projection for scanners and path reads.
 * @param {ReturnType<typeof createEmptyExpectationState>} state
 */
export function projectStateToChartPaths(state) {
  const contributorPeriods = Object.fromEntries(
    PERIOD_KEYS.map((k) => {
      const bag =
        state.contributors.byPeriod && k in state.contributors.byPeriod
          ? state.contributors.byPeriod[k]
          : state.contributors.byFanId;
      const topContributors = sortedContributors(bag || {});
      return [k, topContributors.map((c) => ({ ...c, amount: c.usdSpent }))];
    }),
  );

  return {
    subscriptions: Object.fromEntries(
      PERIOD_KEYS.map((k) => [k, mapSubscriptionsPeriod(state.subscriptions[k])]),
    ),
    earnings: Object.fromEntries(PERIOD_KEYS.map((k) => [k, [...(state.earnings[k] || [])]])),
    fanInsights: Object.fromEntries(PERIOD_KEYS.map((k) => [k, [...(state.fans[k] || [])]])),
    likes: Object.fromEntries(PERIOD_KEYS.map((k) => [k, [...(state.likes[k] || [])]])),
    trendingCountries: { ...state.countries },
    contributors: {
      topContributors: contributorPeriods,
    },
    trendingsMedia: { ...state.trendsMedia },
    trendingMerch: { ...state.trendsMerch },
    trendingTags: { ...state.trendsTags },
  };
}

/**
 * Apply a sequence of test events to a fresh state.
 * @param {Array<{ testCaseKey: string, fields?: object, fanId?: number|string, occurredAt?: Date|string|number, multiplier?: number }>} events
 */
export function buildExpectationStateFromEvents(events) {
  const state = createEmptyExpectationState();
  events.forEach((event) => applyMasterEvent(state, event));
  return state;
}

/**
 * Replay history as same-day events (backend ignored occurredAt / createdAt).
 * @param {Array<{ testCaseKey?: string, masterEventType?: string, fields?: object, fanId?: number|string, fanLabel?: string, seedSubscriptionAmount?: number, seedPlanId?: number, multiplier?: number }>} events
 */
export function rebuildExpectationStateAsSameDay(events) {
  const state = createEmptyExpectationState();
  (events || []).forEach((event) => {
    const fields = { ...(event.fields || {}) };
    TIMESTAMP_FIELD_KEYS.forEach((key) => {
      delete fields[key];
    });
    applyMasterEvent(state, {
      testCaseKey: event.testCaseKey,
      masterEventType: event.masterEventType,
      fields,
      fanId: event.fanId,
      fanLabel: event.fanLabel,
      earningsCreditField: event.earningsCreditField,
      seedSubscriptionAmount: event.seedSubscriptionAmount,
      seedPlanId: event.seedPlanId,
      occurredAt: null,
      multiplier: event.multiplier,
    });
  });
  return state;
}

/**
 * Last-slot numeric metric from a domain period bucket.
 * @param {object} domainStore
 * @param {string} periodKey
 * @param {string} field
 */
export function lastPeriodMetric(domainStore, periodKey, field) {
  const arr = domainStore?.[periodKey] || [];
  const last = arr[arr.length - 1] || {};
  const n = Number(last[field]);
  return Number.isFinite(n) ? n : 0;
}
