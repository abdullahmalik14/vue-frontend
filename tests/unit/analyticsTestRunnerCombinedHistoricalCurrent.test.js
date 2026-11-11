import { describe, expect, it } from 'vitest';
import { generateCombinedHistoricalCurrentPlan } from '../../src/analytics-test-runner/runAnalyticsTestCombinedHistoricalCurrent.js';

describe('combined historical/current analytics plan', () => {
  const NOW = new Date(2026, 7, 31, 15, 0, 0);

  it('includes historical records and explicit current records in one plan', () => {
    const plan = generateCombinedHistoricalCurrentPlan({
      historicalCount: 4,
      currentCount: 2,
      historicalOffsetsDays: [8, 40],
      now: NOW,
    });

    expect(plan).toHaveLength(6);
    expect(plan.slice(0, 4).map((event) => event.offsetDays)).toEqual([8, 40, 8, 40]);
    expect(plan.slice(0, 4).every((event) => event.dataKind === 'historical')).toBe(true);
    expect(plan.slice(-2)).toEqual([
      expect.objectContaining({ offsetDays: 0, occurredAt: NOW.toISOString(), dataKind: 'current' }),
      expect.objectContaining({ offsetDays: 0, occurredAt: NOW.toISOString(), dataKind: 'current' }),
    ]);
  });

  it('rejects offsets that would not create historical data', () => {
    expect(() => generateCombinedHistoricalCurrentPlan({ historicalOffsetsDays: [0] }))
      .toThrow('Historical offsets must be positive');
  });
});
