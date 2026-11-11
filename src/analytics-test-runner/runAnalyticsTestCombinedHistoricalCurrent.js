import { isoDaysAgo } from './config/periodBuckets.js';
import { runAnalyticsTestVolume } from './runAnalyticsTestVolume.js';

/**
 * Build a deterministic event plan containing both backdated and current data.
 * Current entries receive an explicit zero-day timestamp so a supplied
 * reference date is applied consistently by both the API and the ledger.
 *
 * @param {{ historicalCount?: number, currentCount?: number, historicalOffsetsDays?: number[], now?: Date }} [options]
 */
export function generateCombinedHistoricalCurrentPlan(options = {}) {
  const historicalCount = Math.max(1, Math.floor(Number(options.historicalCount) || 10));
  const currentCount = Math.max(1, Math.floor(Number(options.currentCount) || 5));
  const offsets = Array.isArray(options.historicalOffsetsDays) && options.historicalOffsetsDays.length
    ? options.historicalOffsetsDays
    : [8, 40];
  const now = options.now instanceof Date ? options.now : new Date();

  const validOffsets = offsets.map(Number);
  if (validOffsets.some((offset) => !Number.isFinite(offset) || offset <= 0)) {
    throw new Error('Historical offsets must be positive numbers of days ago');
  }

  return [
    ...Array.from({ length: historicalCount }, (_, index) => {
      const offsetDays = validOffsets[index % validOffsets.length];
      return {
        index,
        offsetDays,
        occurredAt: isoDaysAgo(offsetDays, now),
        dataKind: 'historical',
      };
    }),
    ...Array.from({ length: currentCount }, (_, index) => ({
      index: historicalCount + index,
      offsetDays: 0,
      occurredAt: isoDaysAgo(0, now),
      dataKind: 'current',
    })),
  ];
}

/**
 * Test a metric with historical and current updates in one cleared dataset.
 * This delegates triggering, ledger construction, ingest polling, refresh, and
 * DOM/API assertions to the volume runner.
 *
 * @param {{
 *   testCaseKey?: string,
 *   historicalCount?: number,
 *   currentCount?: number,
 *   historicalOffsetsDays?: number[],
 *   referenceDate?: string,
 * }} [options]
 */
export async function runAnalyticsTestCombinedHistoricalCurrent(options = {}) {
  const referenceNow = options.referenceDate ? new Date(options.referenceDate) : undefined;
  const plan = generateCombinedHistoricalCurrentPlan({
    ...options,
    now: referenceNow && !Number.isNaN(referenceNow.getTime()) ? referenceNow : options.now,
  });

  const result = await runAnalyticsTestVolume({
    testCaseKey: options.testCaseKey || 'newSubscription',
    uniqueFans: options.uniqueFans !== false,
    datedEvents: plan,
    historical: true,
    referenceDate: options.referenceDate,
  });

  return {
    ...result,
    scenario: 'combinedHistoricalCurrent',
    requestedHistoricalRecords: plan.filter((event) => event.dataKind === 'historical').length,
    requestedCurrentRecords: plan.filter((event) => event.dataKind === 'current').length,
  };
}

if (typeof window !== 'undefined') {
  window.runAnalyticsTestCombinedHistoricalCurrent = runAnalyticsTestCombinedHistoricalCurrent;
}
