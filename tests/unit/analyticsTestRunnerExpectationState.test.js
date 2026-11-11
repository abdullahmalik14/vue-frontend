import { describe, expect, it } from 'vitest';
import {
  createEmptyExpectationState,
  applyMasterEvent,
  lastPeriodMetric,
  projectStateToChartPaths,
  rebuildExpectationStateAsSameDay,
} from '../../src/analytics-test-runner/config/expectationState.js';
import {
  ingestHonorsHistoricalDates,
  readPollActual,
  resolvePollSpec,
} from '../../src/analytics-test-runner/ingest/pollChartsIngest.js';
import { PERIOD_KEYS } from '../../src/analytics-test-runner/config/masterEventChildMap.js';
import {
  resolvePeriodKeysForOccurredAt,
  splitCountAcrossOffsets,
  dateDaysAgo,
} from '../../src/analytics-test-runner/config/periodBuckets.js';
import { resolveFanIdForRepeat, resolveFanIdForTestCase } from '../../src/analytics-test-runner/config/testCaseRegistry.js';
import { TEST_FAN_IDS, VOLUME_FAN_ID_BASE } from '../../src/analytics-test-runner/config/testCreator.js';
import { getApiPathValue } from '../../src/analytics-test-runner/config/apiPath.js';
import { getStateMetric } from '../../src/analytics-test-runner/config/stateMetricResolver.js';
import { attachApiFoundValues } from '../../src/analytics-test-runner/config/hydrateApiRow.js';
import { validatePlanColors } from '../../src/analytics-test-runner/validation/planColorValidator.js';
import { pickChartSlotRow } from '../../src/analytics-test-runner/charts/pickChartSlot.js';
import { getOpenTrendPopupRoot } from '../../src/analytics-test-runner/scanners/popupControls.js';
import { scanMetricSelector } from '../../src/analytics-test-runner/scanners/domScanners.js';
import { apiMetricIndicatesIngest } from '../../src/analytics-test-runner/refresh/verifyRefresh.js';
import { sanitizeTriggerFields } from '../../src/analytics-test-runner/api/endpoints.js';
import { expandTagEngagement } from '../../src/analytics-test-runner/config/rowExpanders/tagEngagement.js';
import { EVENT_EXPECTATIONS } from '../../src/analytics-test-runner/config/eventExpectations.js';

const NOW = new Date(2026, 7, 31, 15, 0, 0); // 31 Aug 2026 local

function last(store, period, field) {
  return lastPeriodMetric(store, period, field);
}

describe('analytics test runner expectation state', () => {
  it('count=1 same-day new subscription fills every period bucket (legacy behavior)', () => {
    const state = createEmptyExpectationState();
    applyMasterEvent(state, {
      testCaseKey: 'newSubscription',
      fields: { amount: 29.99, planId: 2, countryId: 702 },
      fanId: 88001,
    });

    PERIOD_KEYS.forEach((period) => {
      expect(last(state.subscriptions, period, 'newSubscriber')).toBe(1);
      expect(last(state.subscriptions, period, 'tier2')).toBe(1);
      expect(last(state.earnings, period, 'total')).toBeCloseTo(29.99, 2);
      expect(last(state.earnings, period, 'subscription')).toBeCloseTo(29.99, 2);
    });
  });

  it('applyMasterEvent N times sums the single-event delta', () => {
    const state = createEmptyExpectationState();
    for (let i = 0; i < 15; i += 1) {
      applyMasterEvent(state, {
        testCaseKey: 'newSubscription',
        fields: { amount: 29.99, planId: 2, countryId: 702 },
        fanId: 88001 + i,
      });
    }

    expect(last(state.subscriptions, 'daily', 'newSubscriber')).toBe(15);
    expect(last(state.earnings, 'daily', 'total')).toBeCloseTo(15 * 29.99, 2);
    expect(last(state.earnings, 'weekly', 'total')).toBeCloseTo(15 * 29.99, 2);
    expect(Object.keys(state.contributors.byFanId)).toHaveLength(15);
  });

  it('applyMasterEvent with multiplier: 15 equals 15 single applies on metrics', () => {
    const once = createEmptyExpectationState();
    applyMasterEvent(once, {
      testCaseKey: 'newSubscription',
      fields: { amount: 29.99, planId: 2, countryId: 702 },
      fanId: 88001,
      multiplier: 15,
    });

    expect(last(once.subscriptions, 'daily', 'newSubscriber')).toBe(15);
    expect(last(once.earnings, 'daily', 'total')).toBeCloseTo(15 * 29.99, 2);
    expect(last(once.earnings, 'alltime', 'subscription')).toBeCloseTo(15 * 29.99, 2);
  });

  it('dated buckets: today vs 8 days ago vs 40 days ago', () => {
    const state = createEmptyExpectationState();
    const fields = { amount: 29.99, planId: 2, countryId: 702 };

    applyMasterEvent(state, {
      testCaseKey: 'newSubscription',
      fields,
      fanId: 88001,
      occurredAt: NOW,
      now: NOW,
    });
    applyMasterEvent(state, {
      testCaseKey: 'newSubscription',
      fields,
      fanId: 88002,
      occurredAt: dateDaysAgo(8, NOW),
      now: NOW,
    });
    applyMasterEvent(state, {
      testCaseKey: 'newSubscription',
      fields,
      fanId: 88003,
      occurredAt: dateDaysAgo(40, NOW),
      now: NOW,
    });

    expect(last(state.subscriptions, 'daily', 'newSubscriber')).toBe(1);
    expect(last(state.earnings, 'daily', 'total')).toBeCloseTo(29.99, 2);

    // 8 days ago is outside last-7-days (0..6) so weekly is today-only
    expect(last(state.subscriptions, 'weekly', 'newSubscriber')).toBe(1);
    expect(last(state.earnings, 'weekly', 'total')).toBeCloseTo(29.99, 2);

    // 8 days ago is still August 2026 → monthly includes today + 8d
    expect(last(state.subscriptions, 'monthly', 'newSubscriber')).toBe(2);
    expect(last(state.earnings, 'monthly', 'total')).toBeCloseTo(2 * 29.99, 2);

    // 40 days ago is July → yearly/alltime include all three
    expect(last(state.subscriptions, 'yearly', 'newSubscriber')).toBe(3);
    expect(last(state.subscriptions, 'alltime', 'newSubscriber')).toBe(3);
    expect(last(state.earnings, 'yearly', 'total')).toBeCloseTo(3 * 29.99, 2);
    expect(last(state.earnings, 'alltime', 'total')).toBeCloseTo(3 * 29.99, 2);
  });

  it('6 days ago lands in weekly but not daily', () => {
    const state = createEmptyExpectationState();
    applyMasterEvent(state, {
      testCaseKey: 'newSubscription',
      fields: { amount: 10, planId: 2, countryId: 702 },
      fanId: 88001,
      occurredAt: dateDaysAgo(6, NOW),
      now: NOW,
    });

    expect(last(state.subscriptions, 'daily', 'newSubscriber')).toBe(0);
    expect(last(state.subscriptions, 'weekly', 'newSubscriber')).toBe(1);
    expect(last(state.subscriptions, 'monthly', 'newSubscriber')).toBe(1);
  });

  it('token tips do not increment USD total, only tipTokens', () => {
    const state = createEmptyExpectationState();
    applyMasterEvent(state, {
      testCaseKey: 'tokenOrder',
      fields: { amount: 5, tokenCount: 5, tokenChannel: 'tip', countryId: 250 },
      fanId: 88007,
    });

    expect(last(state.earnings, 'daily', 'total')).toBe(0);
    expect(last(state.earnings, 'daily', 'tipTokens')).toBe(5);
    expect(last(state.earnings, 'daily', 'totalTokens')).toBe(5);
  });

  it('tokenCount is sent on the token order trigger config', () => {
    expect(EVENT_EXPECTATIONS.tokenOrder.trigger.fields.tokenCount).toBe(5);
  });

  it('switch subscription credits order amount ($30), not calculated_amount ($20)', () => {
    const state = createEmptyExpectationState();
    applyMasterEvent(state, {
      testCaseKey: 'switchSubscription',
      fields: EVENT_EXPECTATIONS.switchSubscription.trigger.fields,
      fanId: 88002,
    });

    expect(last(state.earnings, 'daily', 'total')).toBe(30);
    expect(last(state.earnings, 'daily', 'subscription')).toBe(30);
    expect(last(state.subscriptions, 'daily', 'newSubscriber')).toBe(1);
  });

  it('tag engagement ×15 accumulates views on the same tag', () => {
    const state = createEmptyExpectationState();
    for (let i = 0; i < 15; i += 1) {
      applyMasterEvent(state, {
        testCaseKey: 'tagEngagement',
        fields: { tagId: 'Panty_Fetish', engagementType: 'click' },
        fanId: 88010 + i,
      });
    }

    expect(getStateMetric(state, 'trendingTags.daily[tag=Panty_Fetish].views', { tagId: 'Panty_Fetish' })).toBe(15);

    const expanderRow = expandTagEngagement('tagEngagement', {
      fields: { tagId: 'Panty_Fetish' },
    })[0];
    const hydrated = attachApiFoundValues(expanderRow, state, null);
    expect(hydrated.expectedValue).toBe(15);
  });

  it('follow ×3 unique fans increments newFollowers by 3 in all same-day periods', () => {
    const state = createEmptyExpectationState();
    for (let i = 0; i < 3; i += 1) {
      applyMasterEvent(state, { testCaseKey: 'follow', fanId: 89000 + i });
    }
    expect(last(state.fans, 'daily', 'newFollowers')).toBe(3);
    expect(last(state.fans, 'alltime', 'newFollowers')).toBe(3);
  });

  it('historical contributors do not appear on daily projection', () => {
    const state = createEmptyExpectationState();
    applyMasterEvent(state, {
      testCaseKey: 'newSubscription',
      fields: { amount: 29.99, countryId: 702 },
      fanId: 88001,
      occurredAt: dateDaysAgo(40, NOW),
      now: NOW,
    });

    const projected = projectStateToChartPaths(state);
    expect(projected.contributors.topContributors.daily).toHaveLength(0);
    expect(projected.contributors.topContributors.yearly).toHaveLength(1);
    expect(projected.contributors.topContributors.alltime[0].usdSpent).toBeCloseTo(29.99, 2);
  });
});

describe('period bucket routing', () => {
  it('null occurredAt uses every PERIOD_KEY', () => {
    expect(resolvePeriodKeysForOccurredAt(null, NOW)).toEqual(PERIOD_KEYS);
  });

  it('maps offsets to the documented period table', () => {
    expect(resolvePeriodKeysForOccurredAt(NOW, NOW)).toEqual(PERIOD_KEYS);
    expect(resolvePeriodKeysForOccurredAt(dateDaysAgo(8, NOW), NOW)).toEqual([
      'monthly',
      'yearly',
      'alltime',
    ]);
    expect(resolvePeriodKeysForOccurredAt(dateDaysAgo(40, NOW), NOW)).toEqual(['yearly', 'alltime']);
  });

  it('splits count across offsets with remainder on earlier buckets', () => {
    const plan = splitCountAcrossOffsets(15, [0, 8, 40], NOW);
    expect(plan).toHaveLength(15);
    const counts = { 0: 0, 8: 0, 40: 0 };
    plan.forEach((row) => {
      counts[row.offsetDays] += 1;
    });
    expect(counts).toEqual({ 0: 5, 8: 5, 40: 5 });
  });
});

describe('resolveFanIdForRepeat', () => {
  it('index 0 uses the dedicated TEST_FAN_IDS value', () => {
    expect(resolveFanIdForRepeat('newSubscription', 0)).toBe(TEST_FAN_IDS.primary);
    expect(resolveFanIdForRepeat('newSubscription', 0)).toBe(resolveFanIdForTestCase('newSubscription'));
  });

  it('later indexes use VOLUME_FAN_ID_BASE and never collide with 88001–88018', () => {
    expect(resolveFanIdForRepeat('newSubscription', 1)).toBe(VOLUME_FAN_ID_BASE + 1);
    expect(resolveFanIdForRepeat('newSubscription', 500)).toBe(VOLUME_FAN_ID_BASE + 500);
    expect(resolveFanIdForRepeat('mediaView', 3)).toBeNull();
  });
});

describe('historical ingest vs charts payload', () => {
  const datedState = () => {
    const state = createEmptyExpectationState();
    const fields = { amount: 29.99, planId: 2, countryId: 702 };
    applyMasterEvent(state, {
      testCaseKey: 'newSubscription',
      fields,
      fanId: 88001,
      occurredAt: NOW,
      now: NOW,
      multiplier: 167,
    });
    applyMasterEvent(state, {
      testCaseKey: 'newSubscription',
      fields,
      fanId: 88002,
      occurredAt: dateDaysAgo(8, NOW),
      now: NOW,
      multiplier: 167,
    });
    applyMasterEvent(state, {
      testCaseKey: 'newSubscription',
      fields,
      fanId: 88003,
      occurredAt: dateDaysAgo(40, NOW),
      now: NOW,
      multiplier: 166,
    });
    return state;
  };

  it('rebuildExpectationStateAsSameDay puts every historical event into daily', () => {
    const rebuilt = rebuildExpectationStateAsSameDay(datedState().eventHistory);
    expect(last(rebuilt.subscriptions, 'daily', 'newSubscriber')).toBe(500);
    expect(last(rebuilt.subscriptions, 'daily', 'tier2')).toBe(500);
    expect(last(rebuilt.subscriptions, 'yearly', 'newSubscriber')).toBe(500);
    expect(last(rebuilt.earnings, 'daily', 'total')).toBeCloseTo(500 * 29.99, 2);
  });

  it('detects when charts daily last equals full volume (timestamps ignored)', () => {
    const state = datedState();
    expect(last(state.subscriptions, 'daily', 'newSubscriber')).toBe(167);
    const payload = {
      subscriptions: {
        daily: [{ period: '2026-08-31', newSubscriber: 500 }],
        yearly: [{ period: '2026-07-31', newSubscriber: 0 }],
        grandTotal: { newSubscriber: 500 },
      },
    };
    expect(
      ingestHonorsHistoricalDates({
        payload,
        testCaseKey: 'newSubscription',
        expectationState: state,
      }),
    ).toBe(false);
  });

  it('keeps dated ledger when charts daily last matches the daily split', () => {
    const state = datedState();
    const payload = {
      subscriptions: {
        daily: [{ period: '2026-08-31', newSubscriber: 167 }],
        yearly: [{ period: '2026-08-01', newSubscriber: 500 }],
        grandTotal: { newSubscriber: 500 },
      },
    };
    expect(
      ingestHonorsHistoricalDates({
        payload,
        testCaseKey: 'newSubscription',
        expectationState: state,
      }),
    ).toBe(true);
  });

  it('readPollActual uses grandTotal/daily when yearly last slot is empty', () => {
    const spec = resolvePollSpec('newSubscription');
    const payload = {
      subscriptions: {
        daily: [{ newSubscriber: 500 }],
        yearly: [{ newSubscriber: 0 }],
        summaries: { yearly: { newSubscriber: 0 }, daily: { newSubscriber: 500 } },
        grandTotal: { newSubscriber: 500 },
      },
    };
    expect(readPollActual(payload, spec, 'yearly')).toBe(500);
  });
});

describe('charts API path and plan color runner reads', () => {
  it('reads top contributor from a flat topContributors list', () => {
    const payload = {
      contributors: {
        topContributors: [
          { name: 'Fan 88001', fanId: 88001, orders: 29.99, subscription: 29.99 },
          { name: 'Fan 89001', fanId: 89001, orders: 29.99, subscription: 29.99 },
        ],
      },
    };
    expect(getApiPathValue(payload, 'contributors.topContributors.daily.-1.usdSpent')).toBe(29.99);
    expect(getApiPathValue(payload, 'contributors.topContributors.weekly.-1.usdSpent')).toBe(29.99);
  });

  it('resolves subscribers.tier2 from the ledger, not the UI bundle alias', () => {
    const state = createEmptyExpectationState();
    applyMasterEvent(state, {
      testCaseKey: 'newSubscription',
      fields: { amount: 29.99, planId: 2, countryId: 702 },
      fanId: 88001,
      multiplier: 15,
    });
    expect(getStateMetric(state, 'ui.subsChart.daily.tier2')).toBe(15);
  });

  it('overrides hardcoded expander expectedValue=1 with ledger ×15 for profile visits', () => {
    const state = createEmptyExpectationState();
    applyMasterEvent(state, {
      testCaseKey: 'profileVisit',
      fields: { countryId: 643 },
      fanId: 88012,
      multiplier: 15,
    });
    expect(getStateMetric(state, 'ui.fans.daily.profileVisit')).toBe(15);
    expect(last(state.fans, 'daily', 'profileVisits')).toBe(15);

    const attached = attachApiFoundValues(
      {
        expectedValue: 1,
        apiPath: 'ui.fans.daily.profileVisit',
        scan: { type: 'apiPath', path: 'fanInsights.daily.-1.profileVisits' },
      },
      state,
      { fanInsights: { daily: [{ profileVisits: 15 }] } },
    );
    expect(attached.expectedValue).toBe(15);
  });

  it('does not treat chart series "Total" as a paid plan color', () => {
    const result = validatePlanColors({
      chartId: 'tiers-weekly-bar',
      seriesStyles: {
        Total: { name: 'Total', color: '#4CC9F0' },
        'Tier 2': { name: 'Tier 2', color: '#4361EE' },
      },
    });
    expect(result.results.some((row) => row.plan === 'Total')).toBe(false);
    expect(result.summary.fail).toBe(0);
  });
});

describe('chart slot picker and popup targeting', () => {
  it('picks today when the series includes it', () => {
    const now = new Date(2026, 7, 31, 15, 0, 0);
    const picked = pickChartSlotRow(
      [
        { period: '2026-08-30 00:00:00', sub: 0 },
        { period: '2026-08-31 00:00:00', sub: 15 },
      ],
      now,
    );
    expect(picked.currentPeriodMissing).toBe(false);
    expect(picked.row.sub).toBe(15);
  });

  it('picks the requested historical day when a Ref date is selected', () => {
    const refDate = new Date(2026, 7, 29, 15, 0, 0);
    const picked = pickChartSlotRow(
      [
        { period: '2026-08-28 00:00:00', sub: 0 },
        { period: '2026-08-29 00:00:00', sub: 7 },
        { period: '2026-08-31 00:00:00', sub: 0 },
      ],
      refDate,
    );

    expect(picked.currentPeriodMissing).toBe(false);
    expect(picked.row.sub).toBe(7);
  });

  it('flags a gap when the last bar is before today', () => {
    const now = new Date(2026, 7, 31, 15, 0, 0);
    const picked = pickChartSlotRow(
      [
        { period: '2026-08-28 00:00:00', sub: 0 },
        { period: '2026-08-29 00:00:00', sub: 0 },
        { period: '2026-08-30 00:00:00', sub: 0 },
      ],
      now,
    );
    expect(picked.currentPeriodMissing).toBe(true);
    expect(picked.row.sub).toBe(0);
  });

  it('targets the visible popup dropdown, not a v-show=false sibling', () => {
    document.body.innerHTML = `
      <div class="fixed" style="display:none">
        <div class="close-button" style="display:none;width:0;height:0"></div>
        <div class="select-dropdown" data-owner="subscribers"></div>
      </div>
      <div class="fixed" role="dialog">
        <div class="close-button" style="width:10px;height:10px">x</div>
        <div class="select-dropdown" data-owner="earnings"></div>
      </div>
    `;
    const root = getOpenTrendPopupRoot();
    expect(root?.getAttribute('role')).toBe('dialog');
    expect(root?.querySelector('.select-dropdown')?.getAttribute('data-owner')).toBe('earnings');
  });
});

describe('scanMetricSelector without template stamps', () => {
  it('reads main fans profile visits from existing data-value', () => {
    document.body.innerHTML = `
      <div data-analytics-card="fans">
        <span data-value="0">--</span>
        <span data-value="15">15</span>
      </div>
    `;
    const result = scanMetricSelector({
      metric: 'fans.profile-visits',
      period: 'day',
      surface: 'main',
    });
    expect(result.ok).toBe(true);
    expect(result.foundValue).toBe(15);
  });

  it('reads popup earnings total from the Total Earnings heading', () => {
    document.body.innerHTML = `
      <div class="fixed" role="dialog">
        <div class="close-button" style="width:10px;height:10px">x</div>
        <div>
          <h3>Total Earnings</h3>
          <span>449.85</span>
        </div>
      </div>
    `;
    const result = scanMetricSelector({
      metric: 'earnings.total',
      period: 'week',
      surface: 'popup-earnings',
    });
    expect(result.ok).toBe(true);
    expect(result.foundValue).toBeCloseTo(449.85, 2);
  });

  it('reads likes media % from the same column as the count (hidden sibling % does not shift index)', () => {
    document.body.innerHTML = `
      <div data-analytics-card="likes">
        <div class="flex-col">
          <span data-value="15">15</span>
          <span>100%</span>
        </div>
        <div class="flex-col">
          <span data-value="0">--</span>
        </div>
      </div>
    `;
    const result = scanMetricSelector({
      metric: 'likes.media-percentage',
      period: 'day',
      surface: 'main',
    });
    expect(result.ok).toBe(true);
    expect(result.foundValue).toBe(100);
  });

  it('marks missing vs-yesterday % as a scan gap instead of a hard fail', () => {
    document.body.innerHTML = `
      <div data-analytics-card="fans">
        <span data-value="0">--</span>
        <span data-value="15">15</span>
      </div>
    `;
    const result = scanMetricSelector({
      metric: 'fans.profile-visits-percentage',
      period: 'day',
      surface: 'main',
    });
    expect(result.ok).toBe(false);
    expect(result.knownGap).toBeTruthy();
  });

  it('reads Tokens Received from the earnings popup heading', () => {
    document.body.innerHTML = `
      <div class="fixed" role="dialog">
        <div class="close-button" style="width:10px;height:10px">x</div>
        <div>
          <h3>Tokens Received</h3>
          <span>75</span>
        </div>
      </div>
    `;
    const result = scanMetricSelector({
      metric: 'earnings.tokens-received',
      period: 'day',
      surface: 'popup-earnings',
    });
    expect(result.ok).toBe(true);
    expect(result.foundValue).toBe(75);
  });
});

describe('refresh apiHasData for net-zero events', () => {
  it('accepts API 0 when the ledger expects 0 (unlike after seed)', () => {
    expect(apiMetricIndicatesIngest(0, 0)).toBe(true);
  });

  it('rejects API 0 when the ledger expects a non-zero ingest', () => {
    expect(apiMetricIndicatesIngest(0, 15)).toBe(false);
  });

  it('rejects missing API values', () => {
    expect(apiMetricIndicatesIngest(null, 0)).toBe(false);
  });
});

describe('trigger payload sanitization', () => {
  it('strips earningsCreditField so Node ingest does not see runner-only keys', () => {
    const out = sanitizeTriggerFields({
      orderType: 'new_subscription',
      amount: 30,
      calculated_amount: 20,
      earningsCreditField: 'amount',
    });
    expect(out.amount).toBe(30);
    expect(out.calculated_amount).toBe(20);
    expect(out.earningsCreditField).toBeUndefined();
  });
});
