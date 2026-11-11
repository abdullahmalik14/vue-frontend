import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/stores/useDashboardAnalyticsStore.js', () => ({
  useDashboardAnalyticsStore: vi.fn(),
}));

import { analyticsTestState } from '@/analytics-test-runner/state.js';
import {
  syncAnalyticsReferenceDate,
} from '@/analytics-test-runner/refresh/trigger.js';

describe('analytics test runner reference-date refresh bridge', () => {
  afterEach(() => {
    analyticsTestState.referenceDate = null;
    delete window.__ANALYTICS_REFERENCE_DATE__;
  });

  it('makes the selected reference date available before Vue refreshes', () => {
    analyticsTestState.referenceDate = '2026-08-24';

    syncAnalyticsReferenceDate();

    expect(window.__ANALYTICS_REFERENCE_DATE__).toBe('2026-08-24');
  });

  it('clears a previous reference date for an undated run', () => {
    window.__ANALYTICS_REFERENCE_DATE__ = '2026-08-24';
    analyticsTestState.referenceDate = null;

    syncAnalyticsReferenceDate();

    expect(window.__ANALYTICS_REFERENCE_DATE__).toBeUndefined();
  });
});
