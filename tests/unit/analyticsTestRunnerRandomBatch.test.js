import { describe, expect, it } from 'vitest';
import {
  generateRandomEventPlan,
  RANDOM_BATCH_POOL,
} from '../../src/analytics-test-runner/runAnalyticsTestRandomBatch.js';
import { EVENT_EXPECTATIONS } from '../../src/analytics-test-runner/config/eventExpectations.js';

describe('random analytics batch planner', () => {
  it('uses every configured event as a possible random candidate', () => {
    expect(RANDOM_BATCH_POOL).toEqual(Object.keys(EVENT_EXPECTATIONS));
  });

  it('creates one valid random event when no batch count is selected', () => {
    const plan = generateRandomEventPlan(1, () => 0);

    expect(plan).toHaveLength(1);
    expect(plan[0].useTestCase).toBeTruthy();
  });

  it('uses 15 distinct event types for a 15-event batch', () => {
    const plan = generateRandomEventPlan(15, () => 0.5);

    expect(plan).toHaveLength(15);
    expect(new Set(plan.map((event) => event.useTestCase)).size).toBe(15);
  });

  it('includes every event type before distributing remaining batch events', () => {
    const plan = generateRandomEventPlan(50, () => 0.5);

    expect(plan).toHaveLength(50);
    expect(new Set(plan.map((event) => event.useTestCase)).size).toBe(RANDOM_BATCH_POOL.length);
  });
});
