import { fetchChartsPayload } from '../api/endpoints.js';
import { lastPeriodMetric } from '../config/expectationState.js';
import { EVENT_EXPECTATIONS } from '../config/eventExpectations.js';
import { sleep } from '../utils/sleep.js';
import { normalizeNumber } from '../utils/normalizeNumber.js';

const DOMAIN_TO_PAYLOAD = {
  fans: 'fanInsights',
  subscriptions: 'subscriptions',
  earnings: 'earnings',
  likes: 'likes',
};

/**
 * Primary ledger field used to know ingest has caught up.
 * @param {string} testCaseKey
 * @returns {{ domain: string, payloadKey: string, field: string } | { kind: 'tags'|'media', field: string, matchId?: string|number }}
 */
export function resolvePollSpec(testCaseKey) {
  const specs = {
    newSubscription: { domain: 'subscriptions', payloadKey: 'subscriptions', field: 'newSubscriber' },
    recurringSubscription: { domain: 'subscriptions', payloadKey: 'subscriptions', field: 'recurringSubscriber' },
    switchSubscription: { domain: 'subscriptions', payloadKey: 'subscriptions', field: 'newSubscriber' },
    cancelSubscription: { domain: 'subscriptions', payloadKey: 'subscriptions', field: 'newSubscriber' },
    merchOrder: { domain: 'earnings', payloadKey: 'earnings', field: 'merch' },
    p2vOrder: { domain: 'earnings', payloadKey: 'earnings', field: 'paytoview' },
    tokenOrder: { domain: 'earnings', payloadKey: 'earnings', field: 'tipTokens' },
    follow: { domain: 'fans', payloadKey: 'fanInsights', field: 'newFollowers' },
    unfollow: { domain: 'fans', payloadKey: 'fanInsights', field: 'newFollowers' },
    profileVisit: { domain: 'fans', payloadKey: 'fanInsights', field: 'profileVisits' },
    mediaLike: { domain: 'likes', payloadKey: 'likes', field: 'media' },
    mediaUnlike: { domain: 'likes', payloadKey: 'likes', field: 'media' },
    profileLike: { domain: 'likes', payloadKey: 'likes', field: 'profile' },
    profileUnlike: { domain: 'likes', payloadKey: 'likes', field: 'profile' },
    merchLike: { domain: 'likes', payloadKey: 'likes', field: 'merch' },
    merchUnlike: { domain: 'likes', payloadKey: 'likes', field: 'merch' },
    feedLike: { domain: 'likes', payloadKey: 'likes', field: 'feed' },
    feedUnlike: { domain: 'likes', payloadKey: 'likes', field: 'feed' },
    tagEngagement: { kind: 'tags', field: 'views', matchId: 'Panty_Fetish' },
    mediaView: { kind: 'media', field: 'views', matchId: 5117 },
    mediaWatchDuration: { kind: 'media', field: 'watchDurationSec', matchId: 2811 },
  };
  return specs[testCaseKey] || { domain: 'earnings', payloadKey: 'earnings', field: 'total' };
}

function numericOrZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function lastPayloadField(payload, payloadKey, periodKey, field) {
  const arr = payload?.[payloadKey]?.[periodKey];
  if (!Array.isArray(arr) || !arr.length) return 0;
  return numericOrZero(arr[arr.length - 1]?.[field]);
}

function maxAbs(...values) {
  return values.reduce((best, raw) => {
    const n = numericOrZero(raw);
    return Math.abs(n) > Math.abs(best) ? n : best;
  }, 0);
}

function matchArrayField(arr, matchKey, matchId, field) {
  if (!Array.isArray(arr)) return 0;
  const row = arr.find(
    (item) =>
      String(item?.[matchKey] ?? item?.tag ?? '').includes(String(matchId)) ||
      Number(item?.[matchKey]) === Number(matchId),
  );
  return Number(row?.[field] ?? 0) || 0;
}

/**
 * Pick the period with the largest |expected| (skip alltime — often missing in API).
 */
export function pickPollPeriod(expectationState, spec) {
  const periods = ['daily', 'weekly', 'monthly', 'yearly'];
  let best = { periodKey: 'daily', expected: 0 };
  periods.forEach((periodKey) => {
    let expected = 0;
    if (spec.kind === 'tags') {
      const arr = expectationState.trendsTags?.[periodKey] || [];
      expected = matchArrayField(arr, 'tag', spec.matchId, spec.field);
    } else if (spec.kind === 'media') {
      const arr = expectationState.trendsMedia?.[periodKey] || [];
      expected = matchArrayField(arr, 'mediaId', spec.matchId, spec.field);
    } else {
      expected = lastPeriodMetric(expectationState[spec.domain], periodKey, spec.field);
    }
    if (Math.abs(expected) >= Math.abs(best.expected)) {
      best = { periodKey, expected };
    }
  });
  return best;
}

export function readPollActual(payload, spec, periodKey) {
  if (spec.kind === 'tags') {
    return matchArrayField(payload?.trendingTags?.[periodKey], 'tag', spec.matchId, spec.field);
  }
  if (spec.kind === 'media') {
    return matchArrayField(payload?.trendingsMedia?.[periodKey], 'mediaId', spec.matchId, spec.field);
  }
  const payloadKey = spec.payloadKey || DOMAIN_TO_PAYLOAD[spec.domain] || spec.domain;
  const domain = payload?.[payloadKey];
  // Charts month/year/alltime series often omit the current UTC-shifted bucket, so
  // yearly[-1] can be 0 while daily[-1] / grandTotal already have the ingested total.
  return maxAbs(
    lastPayloadField(payload, payloadKey, periodKey, spec.field),
    domain?.summaries?.[periodKey]?.[spec.field],
    domain?.grandTotal?.[spec.field],
    lastPayloadField(payload, payloadKey, 'daily', spec.field),
    domain?.summaries?.daily?.[spec.field],
  );
}

function valuesClose(actual, expected) {
  const actualNum = numericOrZero(actual);
  const expectedNum = numericOrZero(expected);
  return Math.abs(actualNum - expectedNum) <= Math.max(0.05, Math.abs(expectedNum) * 0.001);
}

/**
 * True when charts daily (or grandTotal) still matches the ledger's dated split.
 * False when the API stored every historical event as "today" (timestamp fields ignored).
 *
 * @param {{ payload: object, testCaseKey: string, expectationState: object }} options
 * @returns {boolean}
 */
export function ingestHonorsHistoricalDates({ payload, testCaseKey, expectationState }) {
  if (!payload || !expectationState) return true;
  const spec = resolvePollSpec(testCaseKey);
  if (spec.kind === 'tags' || spec.kind === 'media') return true;

  const domain = spec.domain;
  const ledgerDaily = lastPeriodMetric(expectationState[domain], 'daily', spec.field);
  const ledgerAll =
    lastPeriodMetric(expectationState[domain], 'alltime', spec.field) ||
    lastPeriodMetric(expectationState[domain], 'yearly', spec.field);

  if (valuesClose(ledgerDaily, ledgerAll)) return true;

  const payloadKey = spec.payloadKey || DOMAIN_TO_PAYLOAD[domain] || domain;
  const apiDaily = lastPayloadField(payload, payloadKey, 'daily', spec.field);

  // Daily last slot equals the full volume → every event was stored as today.
  if (valuesClose(apiDaily, ledgerAll) && !valuesClose(ledgerDaily, ledgerAll)) {
    return false;
  }
  return true;
}

/**
 * Poll GET /api/charts until ledger totals appear (or timeout).
 * Used after a tight trigger loop instead of 8s × N.
 *
 * @param {{
 *   creatorId: number,
 *   testCaseKey: string,
 *   expectationState: object,
 *   referenceDate?: string,
 *   timeoutMs?: number,
 *   intervalMs?: number,
 *   minWaitMs?: number,
 *   onProgress?: (msg: string) => void,
 * }} options
 */
export async function waitForChartsIngest(options) {
  const {
    creatorId,
    testCaseKey,
    expectationState,
    referenceDate = null,
    timeoutMs = 45000,
    intervalMs = 400,
    minWaitMs = 400,
    onProgress,
  } = options;

  if (EVENT_EXPECTATIONS[testCaseKey]?.gapStatus === 'blocked') {
    return { ok: true, skipped: true, reason: 'blocked', payload: null };
  }

  if (minWaitMs > 0) await sleep(minWaitMs);

  const spec = resolvePollSpec(testCaseKey);
  const target = pickPollPeriod(expectationState, spec);
  const started = Date.now();
  let lastPayload = null;
  let lastActual = null;

  while (Date.now() - started < timeoutMs) {
    lastPayload = await fetchChartsPayload(creatorId, referenceDate);
    lastActual = readPollActual(lastPayload, spec, target.periodKey);
    const actualNum = normalizeNumber(lastActual) ?? Number(lastActual) ?? 0;
    const expectedNum = Number(target.expected) || 0;
    const close = Math.abs(actualNum - expectedNum) <= Math.max(0.05, Math.abs(expectedNum) * 0.001);

    if (close) {
      onProgress?.(
        `Ingest caught up: ${spec.field} ${target.periodKey} expected ${expectedNum}, found ${actualNum}`,
      );
      return { ok: true, payload: lastPayload, periodKey: target.periodKey, expected: expectedNum, actual: actualNum };
    }

    onProgress?.(
      `Waiting for ingest: ${spec.field} ${target.periodKey} expected ${expectedNum}, found ${actualNum}`,
    );
    await sleep(intervalMs);
  }

  return {
    ok: false,
    payload: lastPayload,
    periodKey: target.periodKey,
    expected: target.expected,
    actual: lastActual,
    reason: 'timeout',
  };
}
