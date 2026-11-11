import { EVENT_EXPECTATIONS } from './eventExpectations.js';

/** Repeat-count presets shown in the panel. */
export const VOLUME_COUNT_PRESETS = [1, 15, 500];

/**
 * Default historical mix: today, 8 days ago (not daily; weekly only if last-7-days),
 * 40 days ago (year/alltime; month only if still current month).
 */
export const DEFAULT_HISTORICAL_OFFSETS_DAYS = [0, 8, 40];

/**
 * Volume presets selectable from the panel dropdown.
 * `key` is the dropdown value; Start / Run volume reads count + datedOffsetsDays.
 *
 * @type {Record<string, { key: string, label: string, testCaseKey: string, count: number, datedOffsetsDays?: number[] }>}
 */
export const VOLUME_SCENARIOS = {
  volume_newSubscription_x15: {
    key: 'volume_newSubscription_x15',
    label: 'Volume: New Subscription ×15',
    testCaseKey: 'newSubscription',
    count: 15,
  },
  volume_newSubscription_x500: {
    key: 'volume_newSubscription_x500',
    label: 'Volume: New Subscription ×500',
    testCaseKey: 'newSubscription',
    count: 500,
  },
  volume_newSubscription_historical: {
    key: 'volume_newSubscription_historical',
    label: 'Volume: New Subscription historical (today / 8d / 40d)',
    testCaseKey: 'newSubscription',
    count: 15,
    datedOffsetsDays: DEFAULT_HISTORICAL_OFFSETS_DAYS,
  },
};

export function isVolumeScenarioKey(key) {
  return key in VOLUME_SCENARIOS;
}

export function resolveVolumeScenario(key) {
  return VOLUME_SCENARIOS[key] ?? null;
}

export const VOLUME_DROPDOWN_OPTIONS = Object.values(VOLUME_SCENARIOS).map((scenario) => ({
  key: scenario.key,
  label: scenario.label,
  volume: true,
}));

/** Events that are fan-scoped and need unique fan ids for N repeats (idempotency). */
export const FAN_SCOPED_TEST_CASES = new Set([
  'newSubscription',
  'recurringSubscription',
  'switchSubscription',
  'cancelSubscription',
  'merchOrder',
  'p2vOrder',
  'tokenOrder',
  'follow',
  'unfollow',
  'profileVisit',
  'mediaLike',
  'mediaUnlike',
  'profileLike',
  'profileUnlike',
  'merchLike',
  'merchUnlike',
  'feedLike',
  'feedUnlike',
  'mediaWatchDuration',
]);

export function isFanScopedTestCase(testCaseKey) {
  return FAN_SCOPED_TEST_CASES.has(testCaseKey);
}

export function listVolumeRunnableTestCaseKeys() {
  return Object.keys(EVENT_EXPECTATIONS);
}
