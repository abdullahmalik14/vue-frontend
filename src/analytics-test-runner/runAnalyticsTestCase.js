import { analyticsTestState, resetAnalyticsTestState } from './state.js';
import { validateAllVisibleChartContracts } from './scanners/chartContractScanner.js';
import { EVENT_EXPECTATIONS } from './config/eventExpectations.js';
import { buildTestExpectations } from './config/buildTestExpectations.js';
import { createEmptyExpectationState, applyMasterEvent } from './config/expectationState.js';
import { resolveTestCreatorId } from './config/testCreator.js';
import { resolveFanIdForTestCase } from './config/testCaseRegistry.js';
import { resolveSeedForTestCase } from './config/eventSeeds.js';
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
import { executeExpectedScan, executePopupScanBatch } from './scanners/executeScan.js';
import { renderRunnerPanel, setTestRunnerPanelOpen } from './ui/panel.js';
import { setRunnerStep, logActivity } from './ui/activityLog.js';
import { lockPageForDomScan, unlockPageAfterDomScan } from './ui/pageLock.js';
import { waitForDomScanContinue } from './ui/scanPause.js';
import { sleep } from './utils/sleep.js';
import { acquireRunnerLock } from './runnerLock.js';
import { buildRunReport, formatRunReportSummary } from './compare/runReport.js';

function formatDomScanLabel(expected) {
  const kind = expected.valueKind || (expected.source === 'api' ? 'api' : 'singular');
  const where = expected.location || expected.view || 'Main';
  return `${kind.toUpperCase()} · ${where} · ${expected.metric}`;
}

async function runSeedEvent(creatorId, seedConfig, log, expectationState, occurredAt) {
  let masterEventType;
  let seedFields;
  let fanId;
  let testCaseKey;

  if (seedConfig.useTestCase) {
    testCaseKey = seedConfig.useTestCase;
    const seedCase = EVENT_EXPECTATIONS[seedConfig.useTestCase];
    if (!seedCase) throw new Error(`Unknown seed test case: ${seedConfig.useTestCase}`);
    masterEventType = seedCase.trigger.masterEventType;
    seedFields = { ...seedCase.trigger.fields };
    fanId = resolveFanIdForTestCase(seedConfig.useTestCase);
  } else {
    testCaseKey = seedConfig.fanIdKey || 'newSubscription';
    masterEventType = seedConfig.masterEventType;
    seedFields = { ...seedConfig.fields };
    fanId = resolveFanIdForTestCase(seedConfig.fanIdKey || 'newSubscription');
  }

  const data = { ...seedFields, creatorId, ...(fanId != null ? { fanId } : {}) };
  log(
    `POST /api/events/trigger (seed)\n${JSON.stringify({ masterEventType, data }, null, 2)}`,
    'trigger',
  );
  const result = await triggerMasterEvent({ masterEventType, fields: data, occurredAt });
  if (!result.ok) {
    throw new Error(`Seed event failed: ${JSON.stringify(result.response)}`);
  }

  applyMasterEvent(expectationState, {
    testCaseKey,
    fields: seedFields,
    fanId,
    fanLabel: fanId != null ? `Fan ${fanId}` : undefined,
    seedSubscriptionAmount: seedFields.amount,
    seedPlanId: seedFields.planId,
    occurredAt,
  });
  analyticsTestState.eventHistory.push({ testCaseKey, fields: seedFields, fanId, occurredAt: occurredAt ?? null });

  await sleep(6000);
}

let runnerInFlight = false;

/**
 * @param {string} testCaseKey
 * @param {{ referenceDate?: string }} [options]
 */
export async function runAnalyticsTestCase(testCaseKey = 'newSubscription', options = {}) {
  if (runnerInFlight) {
    throw new Error('Test runner already in progress — wait for the current run to finish');
  }

  const testCase = EVENT_EXPECTATIONS[testCaseKey];
  if (!testCase) throw new Error(`Unknown test case: ${testCaseKey}`);

  const release = acquireRunnerLock('case');
  const creatorId = resolveTestCreatorId();
  const referenceDate = options.referenceDate ? new Date(options.referenceDate) : undefined;
  const occurredAt = referenceDate && !Number.isNaN(referenceDate.getTime()) ? referenceDate : undefined;
  runnerInFlight = true;

  resetAnalyticsTestState();
  initPageBootGuard();
  analyticsTestState.activeTestCase = testCaseKey;
  analyticsTestState.referenceDate = options.referenceDate || null;
  setTestRunnerPanelOpen(true);
  setRunnerStep('reset', `Starting: ${testCase.label}${occurredAt ? ` (ref: ${options.referenceDate})` : ''}`);

  if (occurredAt) {
    logActivity(`Using reference date: ${options.referenceDate}`, 'reset');
  }

  try {
    markRefreshSession();

    // Build instructions step 2–3: clear in-memory state, then reset database (always, every run).
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
    analyticsTestState.baselinePayload = await fetchChartsPayload(creatorId, options.referenceDate);
    logActivity('Baseline charts payload captured after clear', 'fetch-api');

    const baselineSnapshot = captureMainAnalyticsSnapshot();

    const fanId = resolveFanIdForTestCase(testCaseKey);
    const seedConfig = resolveSeedForTestCase(testCaseKey);

    if (seedConfig) {
      setRunnerStep('trigger', 'Seeding prerequisite event before main test');
      await runSeedEvent(creatorId, seedConfig, logActivity, analyticsTestState.expectationState, occurredAt);
      analyticsTestState.baselinePayload = await fetchChartsPayload(creatorId, options.referenceDate);
      logActivity('Baseline updated after seed event', 'trigger');
    }

    setRunnerStep('trigger', `Triggering live event: ${testCase.trigger.masterEventType}`);

    const { fanId: _omitFan, ...eventFields } = testCase.trigger.fields;
    const fields = {
      ...eventFields,
      creatorId,
      ...(fanId != null ? { fanId } : {}),
    };

    logActivity(
      `POST /api/events/trigger\n${JSON.stringify({ masterEventType: testCase.trigger.masterEventType, data: fields }, null, 2)}`,
      'trigger',
    );

    const triggerResult = await triggerMasterEvent({
      masterEventType: testCase.trigger.masterEventType,
      fields,
      occurredAt,
    });

    if (!triggerResult.ok) {
      if (testCase.gapStatus === 'blocked') {
        const msg = `Event trigger failed (known blocked): ${JSON.stringify(triggerResult.response)}`;
        analyticsTestState.errors.push(msg);
        logActivity(msg, 'trigger');
      } else {
        throw new Error(`Event trigger failed: ${JSON.stringify(triggerResult.response)}`);
      }
    } else {
      logActivity(`Event accepted: ${JSON.stringify(triggerResult.response)}`, 'trigger');
      applyMasterEvent(analyticsTestState.expectationState, {
        testCaseKey,
        fields: eventFields,
        fanId,
        fanLabel: fanId != null ? `Fan ${fanId}` : undefined,
        seedSubscriptionAmount:
          seedConfig?.fields?.amount ?? analyticsTestState.eventHistory[0]?.fields?.amount,
        seedPlanId: seedConfig?.fields?.planId ?? analyticsTestState.eventHistory[0]?.fields?.planId,
        occurredAt,
      });
      analyticsTestState.eventHistory.push({ testCaseKey, fields: eventFields, fanId, occurredAt: occurredAt ?? null });
    }

    if (triggerResult.ok) {
      setRunnerStep('wait-backend', 'Waiting for backend processing (8s)');
      await sleep(8000);
    }

    setRunnerStep('fetch-api', 'Fetching GET /api/charts/99999 (HTTP ground truth)');
    const chartsBeforeRefresh = await fetchChartsPayload(creatorId, options.referenceDate);
    const apiMetric = readApiMetricForTestCase(testCaseKey, chartsBeforeRefresh);
    logActivity(`HTTP charts metric: ${apiMetric ?? 'n/a'}`, 'fetch-api');

    const beforeRefreshSnapshot = captureMainAnalyticsSnapshot();

    setRunnerStep('refresh', 'Clicking Refresh — waiting for Vue (NO page reload)');
    await refreshAnalyticsWithoutPageReload();

    const afterRefreshSnapshot = captureMainAnalyticsSnapshot();
    analyticsTestState.chartsPayload = await fetchChartsPayload(creatorId, options.referenceDate);

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
    if (ptSummary.fail > 0) {
      analyticsTestState.periodTotalResults.results
        .filter((r) => r.severity === 'FAIL')
        .forEach((r) => logActivity(`  FAIL: ${r.message}`, 'validate'));
    }

    analyticsTestState.planColorResults = validatePlanColors(analyticsTestState.chartsPayload);
    const pcSummary = analyticsTestState.planColorResults.summary;
    logActivity(
      `Plan colors: ${pcSummary.pass} pass, ${pcSummary.fail} fail, ${pcSummary.skip} skipped`,
      'validate',
    );
    if (pcSummary.fail > 0) {
      analyticsTestState.planColorResults.results
        .filter((r) => r.severity === 'FAIL')
        .forEach((r) => logActivity(`  FAIL: ${r.message}`, 'validate'));
    }

    analyticsTestState.expectedRows = buildTestExpectations(testCaseKey, analyticsTestState.chartsPayload, {
      fields,
      expectationState: analyticsTestState.expectationState,
      eventHistory: analyticsTestState.eventHistory,
      repeatCount: 1,
      scanDate: occurredAt,
    });
    logActivity(
      `Built ${analyticsTestState.expectedRows.length} expectations (internal state → DOM/API validation)`,
      'validate',
    );
    renderRunnerPanel();

    setTestRunnerPanelOpen(false);
    lockPageForDomScan('DOM runner starting — scanning main cards');

    setRunnerStep('scan-main', 'DOM runner: scanning main cards');
    const mainRows = analyticsTestState.expectedRows.filter(
      (row) => !row.popup && !row.validationOnly,
    );
    const popupRows = analyticsTestState.expectedRows.filter(
      (row) => row.popup && !row.validationOnly,
    );

    try {
      for (const expected of mainRows) {
        const label = formatDomScanLabel(expected);
        await waitForDomScanContinue(label);
        lockPageForDomScan(`DOM SCAN: ${label}`);
        logActivity(`DOM SCAN: ${label} (internal ${expected.expectedValue})`, 'scan-main');
        const found = await executeExpectedScan(expected, analyticsTestState.chartsPayload);
        analyticsTestState.foundRows.push(found);
        analyticsTestState.comparisonRows = compareExpectedToFound(
          analyticsTestState.expectedRows,
          analyticsTestState.foundRows,
          analyticsTestState.chartsPayload,
        );
        renderRunnerPanel();
        await sleep(400);
      }

      // Run chart contract schema validation for all currently visible charts
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

      setRunnerStep('scan-popups', 'DOM runner: opening popups — day / week / month / year / alltime');
      const popupFound = await executePopupScanBatch(popupRows, analyticsTestState.chartsPayload, {
        onProgress: async (message) => {
          await waitForDomScanContinue(message);
          lockPageForDomScan(`DOM SCAN: ${message}`);
          logActivity(`DOM SCAN: ${message}`, 'scan-popups');
        },
        treatMissingAlltimeAsGap: true,
      });
      analyticsTestState.foundRows.push(...popupFound);
      analyticsTestState.planColorResults = validatePlanColors(analyticsTestState.chartSnapshots);
      const popupPcSummary = analyticsTestState.planColorResults.summary;
      logActivity(
        `Plan colors: ${popupPcSummary.pass} pass, ${popupPcSummary.fail} fail, ${popupPcSummary.skip} skipped`,
        'scan-popups',
      );
      if (popupPcSummary.fail > 0) {
        analyticsTestState.planColorResults.results
          .filter((r) => r.severity === 'FAIL')
          .forEach((r) => logActivity(`  FAIL: ${r.message}`, 'scan-popups'));
      }
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

    const failed = analyticsTestState.comparisonRows.filter((row) => !row.pass && !row.knownGap).length;
    const refreshFailed =
      analyticsTestState.refreshVerification?.checks?.filter((check) => !check.pass).length ?? 0;
    const periodTotalFailed = analyticsTestState.periodTotalResults?.summary?.fail ?? 0;
    const planColorFailed = analyticsTestState.planColorResults?.summary?.fail ?? 0;
    const knownGaps = analyticsTestState.expectedRows.filter((row) => row.knownGap).length;
    const totalFailed = failed + refreshFailed + periodTotalFailed + planColorFailed;

    analyticsTestState.runReport = buildRunReport(analyticsTestState, {
      testCaseKey,
      repeatCount: 1,
    });
    logActivity(formatRunReportSummary(analyticsTestState.runReport), 'done');

    setRunnerStep(
      'done',
      totalFailed
        ? `Report: ${totalFailed} FAIL (${failed} comparisons, ${refreshFailed} refresh, ${periodTotalFailed} period-total, ${planColorFailed} plan-color)${knownGaps ? ` · ${knownGaps} known gaps` : ''}`
        : 'Report: all PASS (internal matches DOM/API)',
    );
  } catch (error) {
    unlockPageAfterDomScan();
    setTestRunnerPanelOpen(true);
    analyticsTestState.status = 'Error';
    analyticsTestState.currentStepId = 'done';
    analyticsTestState.errors.push(error instanceof Error ? error.message : String(error));
    logActivity(`ERROR: ${error instanceof Error ? error.message : String(error)}`, 'done');
    analyticsTestState.runReport = buildRunReport(analyticsTestState, { testCaseKey, repeatCount: 1 });
    renderRunnerPanel();
    throw error;
  } finally {
    runnerInFlight = false;
    release();
  }
}

if (typeof window !== 'undefined') {
  window.runAnalyticsTestCase = runAnalyticsTestCase;
}
