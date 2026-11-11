import { analyticsTestState, resetAnalyticsTestState } from './state.js';
import { EVENT_EXPECTATIONS } from './config/eventExpectations.js';
import { buildTestExpectations } from './config/buildTestExpectations.js';
import { createEmptyExpectationState, applyMasterEvent } from './config/expectationState.js';
import { resolveTestCreatorId } from './config/testCreator.js';
import { resolveFanIdForRepeat } from './config/testCaseRegistry.js';
import { resolveSeedForTestCase } from './config/eventSeeds.js';
import { resetTestDatabase, triggerMasterEvent, fetchChartsPayload } from './api/endpoints.js';
import { refreshAnalyticsWithoutPageReload } from './refresh/trigger.js';
import {
  initPageBootGuard,
  markRefreshSession,
  captureMainAnalyticsSnapshot,
  buildRefreshVerificationChecks,
} from './refresh/verifyRefresh.js';
import { validateChartsPayloadContract } from './validation/contractValidator.js';
import { compareExpectedToFound } from './compare/index.js';
import { executeExpectedScan, executePopupScanBatch } from './scanners/executeScan.js';
import { renderRunnerPanel, setTestRunnerPanelOpen } from './ui/panel.js';
import { setRunnerStep, logActivity } from './ui/activityLog.js';
import { lockPageForDomScan, unlockPageAfterDomScan } from './ui/pageLock.js';
import { waitForDomScanContinue } from './ui/scanPause.js';
import { sleep } from './utils/sleep.js';
import { resolveRefreshExpectationFromState } from './config/stateMetricResolver.js';
import { acquireRunnerLock } from './runnerLock.js';
import { buildRunReport } from './compare/runReport.js';
import { resolvePeriodKeysForOccurredAt } from './config/periodBuckets.js';
import { ingestHonorsHistoricalDates } from './ingest/pollChartsIngest.js';

let randomBatchInFlight = false;

// Every configured event is a candidate. Seed-dependent cases are prepared
// immediately before triggering; known-blocked cases are attempted and
// reported without stopping the rest of the random batch.
export const RANDOM_BATCH_POOL = Object.keys(EVENT_EXPECTATIONS);

/**
 * Build a mixed-event plan that contains exactly `totalCount` events.
 *
 * Each batch covers as many distinct cases as its size permits: a 15-event
 * batch covers 15 different cases, while a 50-event batch covers every case
 * at least once and distributes the remainder randomly.
 *
 * @param {number} totalCount
 * @param {() => number} [random]
 */
export function generateRandomEventPlan(totalCount, random = Math.random) {
  const pool = RANDOM_BATCH_POOL;
  if (!pool.length) {
    throw new Error('No runnable test cases available for random batch');
  }

  const total = Math.max(1, Math.floor(Number(totalCount) || 1));
  const shuffled = shuffleArrayWithRandom(pool, random);
  const numTypes = Math.min(shuffled.length, total);
  const selected = shuffled.slice(0, numTypes);

  const events = [];
  let remaining = total;

  // Guarantee one occurrence of each selected type first.
  for (const key of selected) {
    events.push({ useTestCase: key, count: 1 });
    remaining -= 1;
  }

  // Assign any remaining events to selected types at random.
  while (remaining > 0) {
    const index = Math.floor(random() * events.length);
    events[index].count += 1;
    remaining -= 1;
  }

  const flat = [];
  for (const evt of events) {
    for (let j = 0; j < evt.count; j++) {
      flat.push({ useTestCase: evt.useTestCase });
    }
  }

  return shuffleArrayWithRandom(flat, random);
}

function resolveSeedEvent(seedConfig, fanId) {
  if (seedConfig.useTestCase) {
    const seedCase = EVENT_EXPECTATIONS[seedConfig.useTestCase];
    if (!seedCase) throw new Error(`Unknown random-batch seed: ${seedConfig.useTestCase}`);
    const { fanId: _omit, ...fields } = seedCase.trigger.fields;
    return {
      testCaseKey: seedConfig.useTestCase,
      masterEventType: seedCase.trigger.masterEventType,
      fields,
      fanId,
    };
  }

  const { fanId: _omit, ...fields } = seedConfig.fields;
  return {
    testCaseKey: seedConfig.fanIdKey || 'newSubscription',
    masterEventType: seedConfig.masterEventType,
    fields,
    fanId,
  };
}

async function triggerRandomBatchSeed({ creatorId, seedConfig, fanId, occurredAt, now, index, total }) {
  const seed = resolveSeedEvent(seedConfig, fanId);
  const data = {
    ...seed.fields,
    creatorId,
    ...(seed.fanId != null ? { fanId: seed.fanId } : {}),
  };
  setRunnerStep('trigger', `[${index + 1}/${total}] Seed: ${seed.testCaseKey}`);
  logActivity(
    `POST /api/events/trigger (seed)\n${JSON.stringify({ masterEventType: seed.masterEventType, data }, null, 2)}`,
    'trigger',
  );
  const result = await triggerMasterEvent({
    masterEventType: seed.masterEventType,
    fields: data,
    ...(occurredAt ? { occurredAt } : {}),
  });
  if (!result.ok) {
    throw new Error(`Seed ${seed.testCaseKey} failed: ${JSON.stringify(result.response)}`);
  }

  applyMasterEvent(analyticsTestState.expectationState, {
    testCaseKey: seed.testCaseKey,
    fields: seed.fields,
    fanId: seed.fanId,
    fanLabel: seed.fanId != null ? `Fan ${seed.fanId}` : undefined,
    occurredAt,
    now,
  });
  analyticsTestState.eventHistory.push({
    testCaseKey: seed.testCaseKey,
    fields: seed.fields,
    fanId: seed.fanId,
    occurredAt: occurredAt ?? null,
    isSeed: true,
  });
  await sleep(6000);
}

function shuffleArrayWithRandom(arr, random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Fire a randomly generated batch of master events after one DB clear, then one refresh.
 *
 * @param {{
 *   count?: number,
 *   distribution?: Record<string, number>,
 *   referenceDate?: string,
 * }} [options]
 */
export async function runAnalyticsTestRandomBatch(options = {}) {
  if (randomBatchInFlight) {
    throw new Error('Random batch runner already in progress');
  }

  // The panel also defaults to one. Keep the public runner API consistent so
  // invoking window.runAnalyticsTestRandomBatch() performs one random event.
  const count = Math.max(1, Math.floor(Number(options.count) || 1));
  const distribution = options.distribution;
  let events;

  if (distribution && Object.keys(distribution).length > 0) {
    events = [];
    for (const [key, cnt] of Object.entries(distribution)) {
      const n = Number(cnt);
      const testCase = EVENT_EXPECTATIONS[key];
      if (!testCase) {
        throw new Error(`Unknown test case in distribution: ${key}`);
      }
      if (!Number.isInteger(n) || n < 0) {
        throw new Error(`Distribution count for ${key} must be a non-negative whole number`);
      }
      // Zero is intentional: it lets callers describe a batch without having
      // to remove every event type that should be omitted for this run.
      if (n === 0) continue;
      for (let i = 0; i < n; i++) {
        events.push({ useTestCase: key });
      }
    }
    if (events.length === 0) {
      throw new Error('Distribution produced no events');
    }
  } else {
    events = generateRandomEventPlan(count);
  }

  const creatorId = resolveTestCreatorId();
  const release = acquireRunnerLock('random');
  randomBatchInFlight = true;
  const referenceDate = options.referenceDate ? new Date(options.referenceDate) : undefined;
  const occurredAt = referenceDate && !Number.isNaN(referenceDate.getTime()) ? referenceDate : undefined;
  const now = occurredAt ? new Date() : undefined;

  if (referenceDate) {
    logActivity(`Using reference date: ${referenceDate}`, 'reset');
  }

  resetAnalyticsTestState();
  initPageBootGuard();
  analyticsTestState.activeTestCase = 'randomBatch';
  analyticsTestState.referenceDate = options.referenceDate || null;
  setTestRunnerPanelOpen(true);
  setRunnerStep('reset', `Random batch: ${events.length} events${referenceDate ? ` (ref: ${referenceDate})` : ''}`);

  try {
    markRefreshSession();

    setRunnerStep('reset', `Resetting database for creator ${creatorId}`);
    const clearResult = await resetTestDatabase(creatorId);
    if (!clearResult.ok) {
      throw new Error(`Database reset failed (${clearResult.status ?? 'error'})`);
    }
    await sleep(2000);

    analyticsTestState.expectationState = createEmptyExpectationState();
    analyticsTestState.eventHistory = [];

    await refreshAnalyticsWithoutPageReload();

    let globalEventIndex = 0;

    for (let i = 0; i < events.length; i++) {
      const step = events[i];
      const testCaseKey = step.useTestCase;
      const testCase = EVENT_EXPECTATIONS[testCaseKey];
      if (!testCase) throw new Error(`Unknown event in random batch: ${testCaseKey}`);

      const fanId = resolveFanIdForRepeat(testCaseKey, globalEventIndex);
      globalEventIndex += 1;
      const { fanId: _omit, ...eventFields } = testCase.trigger.fields;
      const fields = { ...eventFields, creatorId, ...(fanId != null ? { fanId } : {}) };

      const seedConfig = resolveSeedForTestCase(testCaseKey);
      if (seedConfig) {
        await triggerRandomBatchSeed({
          creatorId,
          seedConfig,
          fanId,
          occurredAt,
          now,
          index: i,
          total: events.length,
        });
      }

      setRunnerStep('trigger', `[${i + 1}/${events.length}] ${testCase.label}`);
      logActivity(
        `POST /api/events/trigger\n${JSON.stringify({ masterEventType: testCase.trigger.masterEventType, data: fields }, null, 2)}`,
        'trigger',
      );

      const result = await triggerMasterEvent({
        masterEventType: testCase.trigger.masterEventType,
        fields,
        ...(occurredAt ? { occurredAt } : {}),
      });
      if (!result.ok) {
        if (testCase.gapStatus === 'blocked') {
          const message = `Known blocked event ${testCaseKey}: ${JSON.stringify(result.response)}`;
          analyticsTestState.triggerFailures.push({
            testCaseKey,
            eventIndex: i,
            masterEventType: testCase.trigger.masterEventType,
            response: result.response,
            message,
            knownGap: true,
            severity: 'GAP',
          });
          logActivity(message, 'trigger');
          continue;
        }
        throw new Error(`Event ${testCaseKey} failed: ${JSON.stringify(result.response)}`);
      }

      applyMasterEvent(analyticsTestState.expectationState, {
        testCaseKey,
        fields: eventFields,
        fanId,
        fanLabel: fanId != null ? `Fan ${fanId}` : undefined,
        occurredAt,
        now,
      });
      analyticsTestState.eventHistory.push({ testCaseKey, fields: eventFields, fanId, occurredAt: occurredAt ?? null });

      await sleep(8000);
    }

    setRunnerStep('refresh', 'Single refresh after all events');
    const beforeRefresh = captureMainAnalyticsSnapshot();
    await refreshAnalyticsWithoutPageReload();
    const afterRefresh = captureMainAnalyticsSnapshot();
    analyticsTestState.chartsPayload = await fetchChartsPayload(
  creatorId,
  options.referenceDate,
);
    if (occurredAt) {
      const ignoredByBackend = [...new Set(events.map((event) => event.useTestCase))].some(
        (testCaseKey) =>
          !ingestHonorsHistoricalDates({
            payload: analyticsTestState.chartsPayload,
            testCaseKey,
            expectationState: analyticsTestState.expectationState,
          }),
      );
      if (ignoredByBackend) {
        throw new Error('Backend ignored the selected Ref date; events were ingested as today.');
      }
    }

    analyticsTestState.refreshVerification = {
      creatorId,
      testCaseKey: 'randomBatch',
      beforeRefresh,
      afterRefresh,
      checks: buildRefreshVerificationChecks({
        testCaseKey: events[events.length - 1].useTestCase,
        afterRefresh,
        apiMetric: resolveRefreshExpectationFromState(
          events[events.length - 1].useTestCase,
          analyticsTestState.expectationState,
        ),
        expectationState: analyticsTestState.expectationState,
      }),
    };

    analyticsTestState.validationResults = validateChartsPayloadContract(analyticsTestState.chartsPayload);

    analyticsTestState.expectedRows = buildTestExpectations('randomBatch', analyticsTestState.chartsPayload, {
      expectationState: analyticsTestState.expectationState,
      eventHistory: analyticsTestState.eventHistory,
      mixedBatch: true,
      repeatCount: events.length,
      scanDate: occurredAt,
    });

    setTestRunnerPanelOpen(false);
    lockPageForDomScan('Random batch DOM scan');

    const mainRows = analyticsTestState.expectedRows.filter((row) => !row.popup && !row.validationOnly);
    const popupRows = analyticsTestState.expectedRows.filter((row) => row.popup && !row.validationOnly);

    try {
      for (const expected of mainRows) {
        const label = `${expected.metric} · ${expected.location}`;
        await waitForDomScanContinue(label);
        const found = await executeExpectedScan(expected, analyticsTestState.chartsPayload);
        analyticsTestState.foundRows.push(found);
      }
      const popupFound = await executePopupScanBatch(popupRows, analyticsTestState.chartsPayload, {
        treatMissingAlltimeAsGap: true,
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

    const failed = analyticsTestState.comparisonRows.filter((r) => !r.pass && !r.knownGap).length;
    analyticsTestState.runReport = buildRunReport(analyticsTestState, {
      testCaseKey: 'randomBatch',
      repeatCount: events.length,
      referenceDate: options.referenceDate || analyticsTestState.referenceDate || null,
    });
    setRunnerStep('done', failed ? `Random batch: ${failed} FAIL` : 'Random batch: all PASS');
  } catch (error) {
    unlockPageAfterDomScan();
    setTestRunnerPanelOpen(true);
    analyticsTestState.errors.push(error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    randomBatchInFlight = false;
    release();
    renderRunnerPanel();
  }
}

if (typeof window !== 'undefined') {
  window.runAnalyticsTestRandomBatch = runAnalyticsTestRandomBatch;
}
