import { analyticsTestState, resetAnalyticsTestState } from './state.js';
import { validateAllVisibleChartContracts } from './scanners/chartContractScanner.js';
import { EVENT_EXPECTATIONS } from './config/eventExpectations.js';
import { buildTestExpectations } from './config/buildTestExpectations.js';
import {
  createEmptyExpectationState,
  applyMasterEvent,
  rebuildExpectationStateAsSameDay,
} from './config/expectationState.js';
import { resolveTestCreatorId } from './config/testCreator.js';
import { resolveFanIdForRepeat } from './config/testCaseRegistry.js';
import { resolveSeedForTestCase } from './config/eventSeeds.js';
import {
  DEFAULT_HISTORICAL_OFFSETS_DAYS,
  isFanScopedTestCase,
} from './config/volumeScenarios.js';
import {
  attachEventTimestamps,
  splitCountAcrossOffsets,
} from './config/periodBuckets.js';
import { resetTestDatabase, triggerMasterEvent, fetchChartsPayload } from './api/endpoints.js';
import { refreshAnalyticsWithoutPageReload } from './refresh/trigger.js';
import {
  initPageBootGuard,
  markRefreshSession,
  captureMainAnalyticsSnapshot,
  readApiMetricForTestCase,
  buildRefreshVerificationChecks,
} from './refresh/verifyRefresh.js';
import { validateChartsPayloadContract } from './validation/contractValidator.js';
import { validatePlanColors } from './validation/planColorValidator.js';
import { validatePeriodTotals } from './validation/periodTotalValidator.js';
import { compareExpectedToFound } from './compare/index.js';
import { buildRunReport, formatRunReportSummary } from './compare/runReport.js';
import { executeExpectedScan, executePopupScanBatch } from './scanners/executeScan.js';
import { renderRunnerPanel, setTestRunnerPanelOpen } from './ui/panel.js';
import { setRunnerStep, logActivity } from './ui/activityLog.js';
import { lockPageForDomScan, unlockPageAfterDomScan } from './ui/pageLock.js';
import { waitForDomScanContinue } from './ui/scanPause.js';
import { sleep } from './utils/sleep.js';
import { acquireRunnerLock } from './runnerLock.js';
import { waitForChartsIngest, ingestHonorsHistoricalDates } from './ingest/pollChartsIngest.js';

let volumeInFlight = false;

function formatDomScanLabel(expected) {
  const kind = expected.valueKind || (expected.source === 'api' ? 'api' : 'singular');
  const where = expected.location || expected.view || 'Main';
  return `${kind.toUpperCase()} · ${where} · ${expected.metric}`;
}

function recordTriggerFailure({ testCaseKey, eventIndex, masterEventType, result, blocked, message }) {
  const entry = {
    id: `${testCaseKey}.trigger.${eventIndex}`,
    testCaseKey,
    eventIndex,
    masterEventType,
    response: result?.response,
    status: result?.status,
    blocked: !!blocked,
    knownGap: !!blocked,
    severity: blocked ? 'BLOCKED' : 'ERROR',
    message:
      message ||
      `Trigger failed (${result?.status ?? 'error'}): ${JSON.stringify(result?.response)}`,
  };
  analyticsTestState.triggerFailures.push(entry);
  analyticsTestState.issueRows.push({
    id: entry.id,
    testCaseKey,
    repeatCount: analyticsTestState.repeatCount,
    eventIndex,
    view: 'Trigger',
    location: '/api/events/trigger',
    metric: masterEventType,
    period: null,
    surface: 'api',
    expected: 'HTTP 2xx',
    found: result?.response,
    pass: false,
    knownGap: !!blocked,
    severity: entry.severity,
    message: entry.message,
    scanType: 'apiPath',
  });
  logActivity(entry.message, 'trigger');
}

function seedFieldsFor(seedConfig) {
  if (seedConfig.useTestCase) {
    const seedCase = EVENT_EXPECTATIONS[seedConfig.useTestCase];
    if (!seedCase) throw new Error(`Unknown seed test case: ${seedConfig.useTestCase}`);
    return {
      testCaseKey: seedConfig.useTestCase,
      masterEventType: seedCase.trigger.masterEventType,
      fields: { ...seedCase.trigger.fields },
    };
  }
  return {
    testCaseKey: seedConfig.fanIdKey || 'newSubscription',
    masterEventType: seedConfig.masterEventType,
    fields: { ...seedConfig.fields },
  };
}

async function triggerAndApply({
  creatorId,
  testCaseKey,
  masterEventType,
  eventFields,
  fanId,
  occurredAt,
  eventIndex,
  isSeed,
  seedSubscriptionAmount,
  seedPlanId,
  applyToLedger,
  now,
}) {
  const data = attachEventTimestamps(
    {
      ...eventFields,
      creatorId,
      ...(fanId != null ? { fanId } : {}),
    },
    occurredAt,
    now,
  );

  const label = isSeed ? 'seed' : 'event';
  if (eventIndex == null || eventIndex < 3 || (eventIndex + 1) % 25 === 0) {
    logActivity(
      `POST /api/events/trigger (${label} ${eventIndex != null ? eventIndex + 1 : ''})\n${JSON.stringify({ masterEventType, data }, null, 2)}`,
      'trigger',
    );
  }

  const result = await triggerMasterEvent({ masterEventType, fields: data, data, occurredAt });
  const testCase = EVENT_EXPECTATIONS[testCaseKey];
  const blocked = testCase?.gapStatus === 'blocked';

  if (!result.ok) {
    recordTriggerFailure({
      testCaseKey,
      eventIndex,
      masterEventType,
      result,
      blocked,
    });
    return { ok: false, blocked, result };
  }

  if (applyToLedger) {
    applyMasterEvent(analyticsTestState.expectationState, {
      testCaseKey,
      fields: eventFields,
      fanId,
      fanLabel: fanId != null ? `Fan ${fanId}` : undefined,
      occurredAt,
      seedSubscriptionAmount,
      seedPlanId,
      now,
    });
    analyticsTestState.eventHistory.push({
      testCaseKey,
      fields: eventFields,
      fanId,
      occurredAt: occurredAt ?? null,
      isSeed: !!isSeed,
    });
  }

  return { ok: true, blocked: false, result };
}

function buildRepeatPlan({ count, datedEvents, datedOffsetsDays, historical, defaultOccurredAt, now }) {
  if (Array.isArray(datedEvents) && datedEvents.length) {
    return datedEvents.map((item, index) => ({
      index: item.index ?? index,
      offsetDays: item.offsetDays ?? null,
      occurredAt: item.occurredAt ?? (item.offsetDays != null ? item.offsetDays : null),
    }));
  }
  if (historical || (datedOffsetsDays && datedOffsetsDays.length)) {
    const offsets = datedOffsetsDays?.length ? datedOffsetsDays : DEFAULT_HISTORICAL_OFFSETS_DAYS;
    return splitCountAcrossOffsets(count, offsets, now);
  }
  return Array.from({ length: count }, (_, index) => ({
    index,
    offsetDays: 0,
    occurredAt: defaultOccurredAt ?? null,
  }));
}

/**
 * Fire the same master event N times after one DB clear, then one refresh + full surface scan.
 *
 * @param {{
 *   testCaseKey?: string,
 *   count?: number,
 *   uniqueFans?: boolean,
 *   datedEvents?: Array<{ occurredAt?: string, offsetDays?: number }>,
 *   datedOffsetsDays?: number[],
 *   historical?: boolean,
 *   referenceDate?: string,
 * }} [options]
 */
export async function runAnalyticsTestVolume(options = {}) {
  const testCaseKey = options.testCaseKey || 'newSubscription';
  const count = Math.max(1, Math.floor(Number(options.count) || 1));
  const uniqueFans = options.uniqueFans !== false;
  const historical = !!options.historical || !!options.datedOffsetsDays?.length || !!options.datedEvents?.length;
  const referenceDate = options.referenceDate ? new Date(options.referenceDate) : undefined;
  const selectedDate = referenceDate && !Number.isNaN(referenceDate.getTime()) ? referenceDate : undefined;
  // Historical mode retains its existing "as of Ref date" behavior. For a
  // normal volume run, Ref date is the event date and buckets use real today.
  const now = historical ? selectedDate : selectedDate ? new Date() : undefined;

  if (referenceDate) {
    logActivity(`Using reference date: ${referenceDate}`, 'reset');
  }

  if (volumeInFlight) {
    throw new Error('Volume runner already in progress — wait for the current run to finish');
  }

  const testCase = EVENT_EXPECTATIONS[testCaseKey];
  if (!testCase) throw new Error(`Unknown test case: ${testCaseKey}`);

  const release = acquireRunnerLock('volume');
  const creatorId = resolveTestCreatorId();
  volumeInFlight = true;

  resetAnalyticsTestState();
  initPageBootGuard();
  analyticsTestState.activeTestCase = testCaseKey;
  analyticsTestState.repeatCount = count;
  analyticsTestState.volumeMode = true;
  analyticsTestState.historicalMode = historical;
  analyticsTestState.referenceDate = options.referenceDate || null;
  setTestRunnerPanelOpen(true);
  setRunnerStep('reset', `Volume: ${testCase.label} ×${count}${historical ? ' (historical)' : ''}${referenceDate ? ` (ref: ${referenceDate})` : ''}`);

  const plan = buildRepeatPlan({
    count,
    datedEvents: options.datedEvents,
    datedOffsetsDays: options.datedOffsetsDays,
    historical,
    defaultOccurredAt: !historical ? selectedDate : null,
    now: historical ? selectedDate : undefined,
  });
  const usesDatedEvents = plan.some((step) => step.occurredAt != null);

  let historicalBlocked = false;
  let historicalBlockReason = null;

  try {
    markRefreshSession();

    setRunnerStep('reset', `Resetting database for creator ${creatorId}`);
    const clearResult = await resetTestDatabase(creatorId);
    if (!clearResult.ok) {
      throw new Error(
        `Database reset failed (${clearResult.status ?? 'error'}). ` +
          `POST ${clearResult.url ?? '/api/events/clear'} must succeed before any event. ` +
          'Ensure dev proxy targets the Node API server (15.235.59.191), not Vercel.',
      );
    }
    logActivity(`Database cleared for creator ${creatorId}`, 'reset');
    await sleep(2000);

    analyticsTestState.expectationState = createEmptyExpectationState();
    analyticsTestState.eventHistory = [];

    setRunnerStep('refresh', 'Refreshing analytics UI after database reset');
    await refreshAnalyticsWithoutPageReload();
    logActivity('Dashboard refreshed to post-clear state (no page reload)', 'refresh');

    setRunnerStep('fetch-api', `Fetching baseline GET /api/charts/${creatorId} (post-clear)`);
   analyticsTestState.baselinePayload = await fetchChartsPayload(
  creatorId,
  options.referenceDate,
);
    logActivity('Baseline charts payload captured after clear', 'fetch-api');

    const baselineSnapshot = captureMainAnalyticsSnapshot();
    const seedConfig = resolveSeedForTestCase(testCaseKey);
    const useUniqueFans = uniqueFans && isFanScopedTestCase(testCaseKey);
    const { fanId: _omitFan, ...eventFields } = testCase.trigger.fields;

    let accepted = 0;
    let failed = 0;

    for (let i = 0; i < plan.length; i += 1) {
      const step = plan[i];
      let occurredAt = step.occurredAt;
      if (historicalBlocked && occurredAt) {
        occurredAt = null;
      }

      const fanId = useUniqueFans ? resolveFanIdForRepeat(testCaseKey, i) : resolveFanIdForRepeat(testCaseKey, 0);

      if (seedConfig) {
        const seed = seedFieldsFor(seedConfig);
        const seedFanId =
          fanId != null
            ? fanId
            : useUniqueFans
              ? resolveFanIdForRepeat(seed.testCaseKey, i)
              : resolveFanIdForRepeat(seed.testCaseKey, 0);
        const { fanId: _s, ...seedEventFields } = seed.fields;
        setRunnerStep('trigger', `Seeding [${i + 1}/${plan.length}] ${seed.testCaseKey}`);
        const seedResult = await triggerAndApply({
          creatorId,
          testCaseKey: seed.testCaseKey,
          masterEventType: seed.masterEventType,
          eventFields: seedEventFields,
          fanId: seedFanId,
          occurredAt,
          eventIndex: i,
          isSeed: true,
          applyToLedger: true,
          now,
        });
        if (!seedResult.ok && !seedResult.blocked) {
          failed += 1;
          continue;
        }
      }

      setRunnerStep('trigger', `Triggering [${i + 1}/${plan.length}] ${testCase.trigger.masterEventType}`);
      const mainResult = await triggerAndApply({
        creatorId,
        testCaseKey,
        masterEventType: testCase.trigger.masterEventType,
        eventFields,
        fanId,
        occurredAt,
        eventIndex: i,
        isSeed: false,
        seedSubscriptionAmount:
          seedConfig?.fields?.amount ?? analyticsTestState.eventHistory.find((e) => e.isSeed)?.fields?.amount,
        seedPlanId: seedConfig?.fields?.planId ?? analyticsTestState.eventHistory.find((e) => e.isSeed)?.fields?.planId,
        applyToLedger: true,
        now,
      });

      if (!mainResult.ok) {
        failed += 1;
        if (occurredAt && !historicalBlocked) {
          historicalBlocked = true;
          historicalBlockReason = `Trigger rejected timestamp fields: ${JSON.stringify(mainResult.result?.response)}`;
          analyticsTestState.issueRows.push({
            id: `${testCaseKey}.historical.blocked`,
            testCaseKey,
            repeatCount: count,
            eventIndex: i,
            view: 'Historical',
            location: '/api/events/trigger',
            metric: 'occurredAt',
            period: null,
            surface: 'api',
            expected: 'backdated ingest',
            found: mainResult.result?.response,
            pass: false,
            knownGap: false,
            severity: 'BLOCKED',
            message: `${historicalBlockReason} Remaining repeats will use same-day timestamps.`,
            scanType: 'apiPath',
          });
          logActivity(`Historical ingest BLOCKED — continuing same-day volume. ${historicalBlockReason}`, 'trigger');
          // retry this index as same-day
          const retry = await triggerAndApply({
            creatorId,
            testCaseKey,
            masterEventType: testCase.trigger.masterEventType,
            eventFields,
            fanId,
            occurredAt: null,
            eventIndex: i,
            isSeed: false,
            seedSubscriptionAmount: seedConfig?.fields?.amount,
            seedPlanId: seedConfig?.fields?.planId,
            applyToLedger: true,
            now,
          });
          if (retry.ok) {
            accepted += 1;
            failed -= 1;
          }
        }
        if (testCase.gapStatus === 'blocked') {
          logActivity(`Event trigger failed (known blocked) — continuing volume run`, 'trigger');
        }
      } else {
        accepted += 1;
      }

      if ((i + 1) % 25 === 0 || i === plan.length - 1) {
        logActivity(`Progress: ${i + 1}/${plan.length} triggered (${accepted} ok, ${failed} failed)`, 'trigger');
        renderRunnerPanel();
      }
    }

    if (usesDatedEvents && !historicalBlocked && accepted > 0) {
      setRunnerStep('wait-backend', 'Checking whether ingest honored backdated timestamps');
      const honorProbe = await fetchChartsPayload(
  creatorId,
  options.referenceDate,
);
      if (
        !ingestHonorsHistoricalDates({
          payload: honorProbe,
          testCaseKey,
          expectationState: analyticsTestState.expectationState,
        })
      ) {
        historicalBlocked = true;
        historicalBlockReason =
          'Trigger accepted timestamp fields but ingest stored every event as now (occurredAt ignored). Ledger rebuilt as same-day.';
        analyticsTestState.issueRows.push({
          id: `${testCaseKey}.historical.blocked`,
          testCaseKey,
          repeatCount: count,
          eventIndex: null,
          view: 'Historical',
          location: '/api/events/trigger',
          metric: 'occurredAt',
          period: null,
          surface: 'api',
          expected: 'backdated ingest',
          found: 'all events dated now',
          pass: false,
          knownGap: false,
          severity: 'BLOCKED',
          message: historicalBlockReason,
          scanType: 'apiPath',
        });
        analyticsTestState.expectationState = rebuildExpectationStateAsSameDay(
          analyticsTestState.expectationState.eventHistory,
        );
        analyticsTestState.eventHistory = analyticsTestState.eventHistory.map((entry) => ({
          ...entry,
          occurredAt: null,
        }));
        logActivity(`Historical ingest BLOCKED — ${historicalBlockReason}`, 'trigger');
      }
    }

    setRunnerStep('wait-backend', `Polling /api/charts until ingest matches ledger (${accepted} events)`);
    const pollTimeout = count >= 100 ? 120000 : count >= 10 ? 45000 : 20000;
    const poll = await waitForChartsIngest({
      creatorId,
      testCaseKey,
      expectationState: analyticsTestState.expectationState,
      referenceDate: options.referenceDate,
      timeoutMs: pollTimeout,
      onProgress: (msg) => logActivity(msg, 'wait-backend'),
    });
    if (!poll.ok && !poll.skipped) {
      const msg = `Ingest poll timeout: ${poll.periodKey} expected ${poll.expected}, found ${poll.actual}`;
      analyticsTestState.issueRows.push({
        id: `${testCaseKey}.ingest.timeout`,
        testCaseKey,
        repeatCount: count,
        eventIndex: null,
        view: 'Ingest poll',
        location: '/api/charts',
        metric: poll.periodKey,
        period: poll.periodKey,
        surface: 'api',
        expected: poll.expected,
        found: poll.actual,
        pass: false,
        knownGap: false,
        severity: 'FAIL',
        message: msg,
        scanType: 'apiPath',
      });
      logActivity(msg, 'wait-backend');
    }

    setRunnerStep('fetch-api', 'Fetching GET /api/charts/99999 (HTTP ground truth)');
   const chartsBeforeRefresh =
  poll.payload ||
  (await fetchChartsPayload(creatorId, options.referenceDate));
    const apiMetric = readApiMetricForTestCase(testCaseKey, chartsBeforeRefresh);
    logActivity(`HTTP charts metric: ${apiMetric ?? 'n/a'}`, 'fetch-api');

    const beforeRefreshSnapshot = captureMainAnalyticsSnapshot();

    setRunnerStep('refresh', 'Clicking Refresh — waiting for Vue (NO page reload)');
    await refreshAnalyticsWithoutPageReload();

    const afterRefreshSnapshot = captureMainAnalyticsSnapshot();
analyticsTestState.chartsPayload = await fetchChartsPayload(
  creatorId,
  options.referenceDate,
);

    analyticsTestState.refreshVerification = {
      creatorId,
      testCaseKey,
      baseline: baselineSnapshot,
      beforeRefresh: beforeRefreshSnapshot,
      afterRefresh: afterRefreshSnapshot,
      apiMetric,
      chartsBeforeRefresh,
      checks: buildRefreshVerificationChecks({
        testCaseKey,
        baseline: baselineSnapshot,
        beforeRefresh: beforeRefreshSnapshot,
        afterRefresh: afterRefreshSnapshot,
        apiMetric,
        chartsPayload: analyticsTestState.chartsPayload,
        expectationState: analyticsTestState.expectationState,
      }),
    };

    setRunnerStep('validate', 'JSON contract + period total + plan color validation');
    analyticsTestState.validationResults = validateChartsPayloadContract(analyticsTestState.chartsPayload);

    analyticsTestState.periodTotalResults = validatePeriodTotals(analyticsTestState.chartsPayload);
    const ptSummary = analyticsTestState.periodTotalResults.summary;
    logActivity(
      `Period totals: ${ptSummary.pass} pass, ${ptSummary.fail} fail, ${ptSummary.skip} skipped`,
      'validate',
    );

    analyticsTestState.planColorResults = validatePlanColors(analyticsTestState.chartsPayload);
    const pcSummary = analyticsTestState.planColorResults.summary;
    logActivity(
      `Plan colors: ${pcSummary.pass} pass, ${pcSummary.fail} fail, ${pcSummary.skip} skipped`,
      'validate',
    );

    const fieldsForExpectations = {
      ...eventFields,
      creatorId,
    };
    analyticsTestState.expectedRows = buildTestExpectations(testCaseKey, analyticsTestState.chartsPayload, {
      fields: fieldsForExpectations,
      expectationState: analyticsTestState.expectationState,
      eventHistory: analyticsTestState.eventHistory,
      repeatCount: count,
      scanDate: selectedDate,
    });
    logActivity(
      `Built ${analyticsTestState.expectedRows.length} expectations (internal state ×${count} → DOM/API)`,
      'validate',
    );
    renderRunnerPanel();

    const skipScanPause = count >= 50 && !analyticsTestState.pauseDomScanBeforeEachStep;
    const skipMainSleep = count >= 50;

    setTestRunnerPanelOpen(false);
    lockPageForDomScan('Volume DOM runner starting — scanning main cards');

    setRunnerStep('scan-main', 'DOM runner: scanning main cards');
    const mainRows = analyticsTestState.expectedRows.filter((row) => !row.popup && !row.validationOnly);
    const popupRows = analyticsTestState.expectedRows.filter((row) => row.popup && !row.validationOnly);

    try {
      for (const expected of mainRows) {
        const label = formatDomScanLabel(expected);
        if (!skipScanPause) await waitForDomScanContinue(label);
        lockPageForDomScan(`DOM SCAN: ${label}`);
        logActivity(`DOM SCAN: ${label} (internal ${expected.expectedValue})`, 'scan-main');
        const found = await executeExpectedScan(expected, analyticsTestState.chartsPayload);
        analyticsTestState.foundRows.push(found);
        analyticsTestState.comparisonRows = compareExpectedToFound(
          analyticsTestState.expectedRows,
          analyticsTestState.foundRows,
          analyticsTestState.chartsPayload,
        );
        if (!skipMainSleep) {
          renderRunnerPanel();
          await sleep(400);
        }
      }

      setRunnerStep('scan-main', 'Chart contract validation');
      const contractResult = validateAllVisibleChartContracts();
      analyticsTestState.contractValidation = {
        results: contractResult.results,
        passCount: contractResult.passCount,
        failCount: contractResult.failCount,
        ranAt: new Date().toISOString(),
      };
      logActivity(
        `Chart contracts: ${contractResult.passCount} pass, ${contractResult.failCount} fail${
          contractResult.skipCount ? `, ${contractResult.skipCount} skipped (no stamps)` : ''
        }`,
        'scan-main',
      );
      renderRunnerPanel();

      setRunnerStep('scan-popups', 'DOM runner: opening popups — Daily / Weekly / Monthly / Yearly / All Time');
      const popupFound = await executePopupScanBatch(popupRows, analyticsTestState.chartsPayload, {
        onProgress: async (message) => {
          if (!skipScanPause) await waitForDomScanContinue(message);
          lockPageForDomScan(`DOM SCAN: ${message}`);
          logActivity(`DOM SCAN: ${message}`, 'scan-popups');
        },
        treatMissingAlltimeAsGap: true,
      });
      analyticsTestState.foundRows.push(...popupFound);
      analyticsTestState.planColorResults = validatePlanColors(analyticsTestState.chartSnapshots);
    } finally {
      unlockPageAfterDomScan();
      setTestRunnerPanelOpen(true);
    }

    setRunnerStep('compare', 'Final report: internal vs DOM/API');
    analyticsTestState.comparisonRows = compareExpectedToFound(
      analyticsTestState.expectedRows,
      analyticsTestState.foundRows,
      analyticsTestState.chartsPayload,
    );

    const report = buildRunReport(analyticsTestState, {
      testCaseKey,
      repeatCount: count,
      historical,
      referenceDate: options.referenceDate || analyticsTestState.referenceDate || null,
    });
    analyticsTestState.runReport = report;

    const summary = formatRunReportSummary(report);
    logActivity(summary, 'done');
    setRunnerStep(
      'done',
      report.counts.fail || report.counts.errors || report.counts.blocked
        ? `Volume ×${count}: FAIL ${report.counts.fail} · BLOCKED ${report.counts.blocked} · GAP ${report.counts.gap} · pass ${report.counts.pass}`
        : `Volume ×${count}: all PASS${report.counts.gap ? ` · ${report.counts.gap} known gaps` : ''}`,
    );
    renderRunnerPanel();
    return report;
  } catch (error) {
    unlockPageAfterDomScan();
    setTestRunnerPanelOpen(true);
    analyticsTestState.status = 'Error';
    analyticsTestState.currentStepId = 'done';
    analyticsTestState.errors.push(error instanceof Error ? error.message : String(error));
    analyticsTestState.runReport = buildRunReport(analyticsTestState, {
      testCaseKey,
      repeatCount: count,
      historical,
      referenceDate: options.referenceDate || analyticsTestState.referenceDate || null,
    });
    logActivity(`ERROR: ${error instanceof Error ? error.message : String(error)}`, 'done');
    renderRunnerPanel();
    throw error;
  } finally {
    volumeInFlight = false;
    release();
  }
}

if (typeof window !== 'undefined') {
  window.runAnalyticsTestVolume = runAnalyticsTestVolume;
}
