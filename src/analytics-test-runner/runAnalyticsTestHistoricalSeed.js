import { EVENT_EXPECTATIONS } from './config/eventExpectations.js';
import { resolveSeedForTestCase } from './config/eventSeeds.js';
import { attachEventTimestamps, isoDaysAgo } from './config/periodBuckets.js';
import { resolveTestCreatorId } from './config/testCreator.js';
import { resolveFanIdForRepeat } from './config/testCaseRegistry.js';
import { createEmptyExpectationState, applyMasterEvent } from './config/expectationState.js';
import { buildTestExpectations } from './config/buildTestExpectations.js';
import { resetTestDatabase, triggerMasterEvent, fetchChartsPayload } from './api/endpoints.js';
import { refreshAnalyticsWithoutPageReload } from './refresh/trigger.js';
import {
  initPageBootGuard,
  markRefreshSession,
  captureMainAnalyticsSnapshot,
  buildRefreshVerificationChecks,
  readApiMetricForTestCase,
} from './refresh/verifyRefresh.js';
import { waitForChartsIngest } from './ingest/pollChartsIngest.js';
import { acquireRunnerLock } from './runnerLock.js';
import { analyticsTestState, resetAnalyticsTestState } from './state.js';
import { validateChartsPayloadContract } from './validation/contractValidator.js';
import { compareExpectedToFound } from './compare/index.js';
import { buildRunReport } from './compare/runReport.js';
import { executeExpectedScan, executePopupScanBatch } from './scanners/executeScan.js';
import { logActivity, setRunnerStep } from './ui/activityLog.js';
import { renderRunnerPanel, setTestRunnerPanelOpen } from './ui/panel.js';
import { lockPageForDomScan, unlockPageAfterDomScan } from './ui/pageLock.js';
import { waitForDomScanContinue } from './ui/scanPause.js';
import { sleep } from './utils/sleep.js';

/** A varied default data set, excluding cases whose trigger is known to be blocked. */
export const HISTORICAL_SEED_POOL = Object.keys(EVENT_EXPECTATIONS).filter(
  (key) => EVENT_EXPECTATIONS[key].gapStatus !== 'blocked',
);

/**
 * Build deterministic, evenly distributed historical primary-event records.
 * The first record is one day old and the last is `daysBack` days old, so a
 * seed run never accidentally changes today's dashboard values.
 *
 * @param {{ count?: number, daysBack?: number, keys?: string[], now?: Date }} [options]
 */
export function generateHistoricalSeedPlan(options = {}) {
  const count = Math.max(1, Math.floor(Number(options.count) || 500));
  const daysBack = Math.max(1, Math.floor(Number(options.daysBack) || 365));
  const keys = Array.isArray(options.keys) && options.keys.length ? options.keys : HISTORICAL_SEED_POOL;
  const now = options.now instanceof Date ? options.now : new Date();

  if (!keys.length) throw new Error('Historical seed requires at least one test case');
  keys.forEach((key) => {
    if (!EVENT_EXPECTATIONS[key]) throw new Error(`Unknown historical seed test case: ${key}`);
    if (EVENT_EXPECTATIONS[key].gapStatus === 'blocked') {
      throw new Error(`Blocked test case cannot be used for historical seeding: ${key}`);
    }
  });

  return Array.from({ length: count }, (_, index) => {
    // Use the full requested range, including both endpoints when possible.
    //const offsetDays = count === 1 ? daysBack : 1 + Math.round((index * (daysBack - 1)) / (count - 1));
    const offsetDays = count === 1 ? 0 : Math.round((index * daysBack) / (count - 1));
    return {
      index,
      testCaseKey: keys[index % keys.length],
      offsetDays,
      occurredAt: isoDaysAgo(offsetDays, now),
    };
  });
}

function resolveSeedEvent(seedConfig) {
  if (seedConfig.useTestCase) {
    const testCase = EVENT_EXPECTATIONS[seedConfig.useTestCase];
    if (!testCase) throw new Error(`Unknown historical seed prerequisite: ${seedConfig.useTestCase}`);
    return {
      testCaseKey: seedConfig.useTestCase,
      masterEventType: testCase.trigger.masterEventType,
      fields: testCase.trigger.fields,
    };
  }
  return {
    testCaseKey: seedConfig.fanIdKey || 'newSubscription',
    masterEventType: seedConfig.masterEventType,
    fields: seedConfig.fields,
  };
}

async function postHistoricalEvent({ creatorId, masterEventType, fields, fanId, occurredAt }) {
  const { fanId: _ignoredFanId, ...eventFields } = fields;
  const data = attachEventTimestamps(
    { ...eventFields, creatorId, ...(fanId != null ? { fanId } : {}) },
    occurredAt,
  );
  return triggerMasterEvent({ masterEventType, fields: data, occurredAt });
}

/**
 * Seed a mixed historical dataset, then scan the resulting dashboard by default.
 * `count` is the number of primary records; prerequisite records required by
 * unlike/unfollow/cancel cases are added automatically.
 *
 * @param {{
 *   count?: number,
 *   daysBack?: number,
 *   keys?: string[],
 *   clearFirst?: boolean,
 *   settleMs?: number,
 *   referenceDate?: string,
 *   scan?: boolean,
 * }} [options]
 */
export async function runAnalyticsTestHistoricalSeed(options = {}) {
  const count = Math.max(
    1,
    Math.floor(Number(options.count) || 500),
  );

  const daysBack = Math.max(
    1,
    Math.floor(Number(options.daysBack) || 365),
  );

  const testCaseKey = options.testCaseKey;

  const keys = testCaseKey
    ? [testCaseKey]
    : options.keys;

  const referenceDate = options.referenceDate
    ? new Date(options.referenceDate)
    : null;

  const plan = generateHistoricalSeedPlan({
    ...options,
    count,
    daysBack,
    keys,
    now:
      referenceDate && !Number.isNaN(referenceDate.getTime())
        ? referenceDate
        : options.now,
  });

  const clearFirst = options.clearFirst !== false;
  // An append cannot be compared to this run's ledger because it includes
  // prior records. Keep it seed-only unless the caller explicitly opts in.
  const shouldScan = options.scan ?? clearFirst;
  const settleMs = Math.max(0, Math.floor(Number(options.settleMs) || 2000));
  const creatorId = resolveTestCreatorId();
  const release = acquireRunnerLock('historical-seed');
  const failures = [];
  let seededPrerequisites = 0;
  let seededPrimary = 0;
  let lastAcceptedTestCaseKey = testCaseKey || null;

  resetAnalyticsTestState();
  analyticsTestState.activeTestCase = testCaseKey || 'historicalSeed';
  analyticsTestState.repeatCount = plan.length;
  analyticsTestState.historicalMode = true;
  analyticsTestState.referenceDate = options.referenceDate || null;
  setTestRunnerPanelOpen(true);

  try {
    initPageBootGuard();
    markRefreshSession();
    if (clearFirst) {
      setRunnerStep('reset', `Clearing creator ${creatorId} before historical seed`);
      const cleared = await resetTestDatabase(creatorId);
      if (!cleared.ok) throw new Error(`Database reset failed (${cleared.status ?? 'error'})`);
      logActivity(`Database cleared; seeding ${plan.length} historical primary records`, 'reset');
      await sleep(2000);
    } else {
      setRunnerStep('trigger', `Appending ${plan.length} historical primary records to creator ${creatorId}`);
    }

    analyticsTestState.expectationState = createEmptyExpectationState();
    analyticsTestState.eventHistory = [];

    for (const step of plan) {
      const testCase = EVENT_EXPECTATIONS[step.testCaseKey];
      const fanId = resolveFanIdForRepeat(step.testCaseKey, step.index + 1);
      const prerequisite = resolveSeedForTestCase(step.testCaseKey);

      if (prerequisite) {
        const seed = resolveSeedEvent(prerequisite);
        const seedFanId = fanId ?? resolveFanIdForRepeat(seed.testCaseKey, step.index + 1);
        const seeded = await postHistoricalEvent({
          creatorId,
          masterEventType: seed.masterEventType,
          fields: seed.fields,
          fanId: seedFanId,
          occurredAt: step.occurredAt,
        });
        if (!seeded.ok) {
          failures.push({ index: step.index, testCaseKey: step.testCaseKey, kind: 'prerequisite', response: seeded.response });
          continue;
        }
        seededPrerequisites += 1;
        const { fanId: _seedFanId, ...seedFields } = seed.fields;
        applyMasterEvent(analyticsTestState.expectationState, {
          testCaseKey: seed.testCaseKey,
          fields: seedFields,
          fanId: seedFanId,
          fanLabel: seedFanId != null ? `Fan ${seedFanId}` : undefined,
          occurredAt: step.occurredAt,
          now: referenceDate || undefined,
        });
        analyticsTestState.eventHistory.push({
          testCaseKey: seed.testCaseKey,
          fields: seedFields,
          fanId: seedFanId,
          occurredAt: step.occurredAt,
          isSeed: true,
        });
      }

      const result = await postHistoricalEvent({
        creatorId,
        masterEventType: testCase.trigger.masterEventType,
        fields: testCase.trigger.fields,
        fanId,
        occurredAt: step.occurredAt,
      });
      if (result.ok) {
        seededPrimary += 1;
        lastAcceptedTestCaseKey = step.testCaseKey;
        const { fanId: _eventFanId, ...eventFields } = testCase.trigger.fields;
        applyMasterEvent(analyticsTestState.expectationState, {
          testCaseKey: step.testCaseKey,
          fields: eventFields,
          fanId,
          fanLabel: fanId != null ? `Fan ${fanId}` : undefined,
          occurredAt: step.occurredAt,
          now: referenceDate || undefined,
        });
        analyticsTestState.eventHistory.push({
          testCaseKey: step.testCaseKey,
          fields: eventFields,
          fanId,
          occurredAt: step.occurredAt,
          isSeed: false,
        });
      } else {
        failures.push({ index: step.index, testCaseKey: step.testCaseKey, kind: 'primary', response: result.response });
      }

      if ((step.index + 1) % 25 === 0 || step.index === plan.length - 1) {
        setRunnerStep('trigger', `Historical seed: ${step.index + 1}/${plan.length} primary records`);
        renderRunnerPanel();
      }
    }

    if (settleMs) {
      setRunnerStep('wait-backend', `Waiting ${settleMs}ms for historical ingest`);
      await sleep(settleMs);
    }
    const refreshTestCaseKey = lastAcceptedTestCaseKey || testCaseKey || plan.at(-1).testCaseKey;
    setRunnerStep('wait-backend', 'Polling charts API until historical ingest catches up');
    const ingest = await waitForChartsIngest({
      creatorId,
      testCaseKey: refreshTestCaseKey,
      expectationState: analyticsTestState.expectationState,
      referenceDate: options.referenceDate,
      timeoutMs: plan.length >= 100 ? 120000 : 45000,
      onProgress: (message) => logActivity(message, 'wait-backend'),
    });
    if (!ingest.ok && !ingest.skipped) {
      logActivity(
        `Historical ingest poll timed out: ${ingest.periodKey} expected ${ingest.expected}, found ${ingest.actual}`,
        'wait-backend',
      );
    }
    const beforeRefresh = captureMainAnalyticsSnapshot();
    setRunnerStep('refresh', 'Refreshing analytics after historical seed');
    await refreshAnalyticsWithoutPageReload();
    const afterRefresh = captureMainAnalyticsSnapshot();
    analyticsTestState.chartsPayload = ingest.payload || await fetchChartsPayload(creatorId, options.referenceDate);

    const apiMetric = readApiMetricForTestCase(refreshTestCaseKey, analyticsTestState.chartsPayload);
    analyticsTestState.refreshVerification = {
      creatorId,
      testCaseKey: refreshTestCaseKey,
      beforeRefresh,
      afterRefresh,
      checks: buildRefreshVerificationChecks({
        testCaseKey: refreshTestCaseKey,
        beforeRefresh,
        afterRefresh,
        apiMetric,
        expectationState: analyticsTestState.expectationState,
        chartsPayload: analyticsTestState.chartsPayload,
      }),
    };
    analyticsTestState.validationResults = validateChartsPayloadContract(analyticsTestState.chartsPayload);

    if (shouldScan) {
      setRunnerStep('validate', 'Building historical expectations from seeded event ledger');
      analyticsTestState.expectedRows = buildTestExpectations(
        testCaseKey || 'historicalSeed',
        analyticsTestState.chartsPayload,
        {
          expectationState: analyticsTestState.expectationState,
          eventHistory: analyticsTestState.eventHistory,
          mixedBatch: true,
          repeatCount: plan.length,
          scanDate: referenceDate || new Date(),
        },
      );
      renderRunnerPanel();

      const mainRows = analyticsTestState.expectedRows.filter((row) => !row.popup && !row.validationOnly);
      const popupRows = analyticsTestState.expectedRows.filter((row) => row.popup && !row.validationOnly);
      setTestRunnerPanelOpen(false);
      lockPageForDomScan('Historical seed DOM scan');
      try {
        setRunnerStep('scan-main', `Scanning ${mainRows.length} main historical expectations`);
        for (const expected of mainRows) {
          const label = `${expected.metric} · ${expected.location || expected.view}`;
          if (analyticsTestState.pauseDomScanBeforeEachStep) await waitForDomScanContinue(label);
          lockPageForDomScan(`DOM SCAN: ${label}`);
          const found = await executeExpectedScan(expected, analyticsTestState.chartsPayload);
          analyticsTestState.foundRows.push(found);
        }
        setRunnerStep('scan-popups', `Scanning ${popupRows.length} popup historical expectations`);
        const popupFound = await executePopupScanBatch(popupRows, analyticsTestState.chartsPayload, {
          treatMissingAlltimeAsGap: true,
          onProgress: async (message) => {
            if (analyticsTestState.pauseDomScanBeforeEachStep) await waitForDomScanContinue(message);
            lockPageForDomScan(`DOM SCAN: ${message}`);
          },
        });
        analyticsTestState.foundRows.push(...popupFound);
      } finally {
        unlockPageAfterDomScan();
        setTestRunnerPanelOpen(true);
      }
      analyticsTestState.comparisonRows = compareExpectedToFound(
        analyticsTestState.expectedRows,
        analyticsTestState.foundRows,
        analyticsTestState.chartsPayload,
      );
    } else {
      logActivity('DOM scan skipped: append mode has no baseline ledger. Pass scan: true only when the existing dataset is known.', 'validate');
    }

    const summary = {
      creatorId,
      clearFirst,
      requestedPrimaryRecords: plan.length,
      seededPrimaryRecords: seededPrimary,
      seededPrerequisiteRecords: seededPrerequisites,
      totalSeededRecords: seededPrimary + seededPrerequisites,
      failedRecords: failures.length,
      failures,
      dateRange: { newest: plan[0].occurredAt, oldest: plan[plan.length - 1].occurredAt },
      scanned: shouldScan,
    };
    if (typeof window !== 'undefined') {
      window.__analyticsHistoricalSeedResults = summary;
    }
    analyticsTestState.runReport = buildRunReport(analyticsTestState, {
      testCaseKey: testCaseKey || 'historicalSeed',
      repeatCount: plan.length,
      historical: true,
      referenceDate: options.referenceDate,
    });
    const scanFailures = analyticsTestState.comparisonRows.filter((row) => !row.pass && !row.knownGap).length;
    setRunnerStep('done', `Historical seed complete: ${summary.totalSeededRecords} records · ${shouldScan ? `${scanFailures} scan failures` : 'scan skipped'}`);
    logActivity(JSON.stringify(summary), 'done');
    renderRunnerPanel();
    return summary;
  } finally {
    release();
  }
}

if (typeof window !== 'undefined') {
  window.runAnalyticsTestHistoricalSeed = runAnalyticsTestHistoricalSeed;
}
