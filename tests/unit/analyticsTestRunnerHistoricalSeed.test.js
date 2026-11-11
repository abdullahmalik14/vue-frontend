import { describe, expect, it } from 'vitest';
import {
  HISTORICAL_SEED_POOL,
  generateHistoricalSeedPlan,
} from '../../src/analytics-test-runner/runAnalyticsTestHistoricalSeed.js';

describe('historical analytics seed planner', () => {
  const NOW = new Date(2026, 7, 31, 15, 0, 0);

  it('creates several hundred primary records across the requested historical range', () => {
    const plan = generateHistoricalSeedPlan({ count: 500, daysBack: 365, now: NOW });

    expect(plan).toHaveLength(500);
    expect(plan[0].offsetDays).toBe(1);
    expect(plan.at(-1).offsetDays).toBe(365);
    expect(new Date(plan[0].occurredAt).getTime()).toBeLessThan(NOW.getTime());
    expect(new Set(plan.map((row) => row.offsetDays)).size).toBeGreaterThan(300);
  });

  it('round-robins only runnable cases by default', () => {
    const plan = generateHistoricalSeedPlan({ count: HISTORICAL_SEED_POOL.length * 2, now: NOW });

    expect(new Set(plan.map((row) => row.testCaseKey))).toEqual(new Set(HISTORICAL_SEED_POOL));
  });

  it('rejects blocked and unknown event types before any API request is made', () => {
    expect(() => generateHistoricalSeedPlan({ keys: ['p2vOrder'] })).toThrow('Blocked test case');
    expect(() => generateHistoricalSeedPlan({ keys: ['not-a-case'] })).toThrow('Unknown historical seed');
  });
});
