import {
  bindStartButton,
  bindVolumeButton,
  ensureTestRunnerPanel,
  ensureLauncherButton,
  setTestRunnerPanelOpen,
  renderRunnerPanel,
  getSelectedTestCaseKey,
  getVolumeRunOptions,
  setRepeatCountInput,
  setHistoricalModeInput,
  getReferenceDate,
} from './ui/panel.js';
import { runAnalyticsTestCase } from './runAnalyticsTestCase.js';
import { runAnalyticsTestBatch } from './runAnalyticsTestBatch.js';
import { runAnalyticsTestMixedBatch } from './runAnalyticsTestMixedBatch.js';
import { runAnalyticsTestRandomBatch } from './runAnalyticsTestRandomBatch.js';
import { runAnalyticsTestVolume } from './runAnalyticsTestVolume.js';
import { runAnalyticsTestVolumeSuite } from './runAnalyticsTestVolumeSuite.js';
import { runAnalyticsTestHistoricalSeed } from './runAnalyticsTestHistoricalSeed.js';
import { runAnalyticsTestCombinedHistoricalCurrent } from './runAnalyticsTestCombinedHistoricalCurrent.js';
import { isBatchRunSelection } from './config/testCaseRegistry.js';
import { isMixedBatchKey } from './config/mixedBatchScenarios.js';
import { isRandomBatchKey } from './config/testCaseRegistry.js';
import { isVolumeScenarioKey, resolveVolumeScenario } from './config/volumeScenarios.js';
import { initPageBootGuard } from './refresh/verifyRefresh.js';
import router from '@/router/index.js';
import { ANALYTICS_TEST_RUNNER_TEMP_ENABLED } from './enabled.js';

let startHandlerBound = false;

export function isAnalyticsTestRunnerRoute(location = window.location) {
  if (!ANALYTICS_TEST_RUNNER_TEMP_ENABLED) return false;

  const path = location.pathname || '';
  const search = location.search || '';
  const params = new URLSearchParams(search);
  const debugFlag = params.get('debug-test-runner') === 'true';
  if (debugFlag) return true;
  return /analytics/i.test(path) || /creator=/.test(search);
}

function hideTestRunnerUi() {
  const launcher = document.querySelector('[data-analytics-test-runner-launcher]');
  const panel = document.querySelector('[data-analytics-test-runner]');
  if (launcher) launcher.hidden = true;
  if (panel) panel.hidden = true;
}

async function startFromPanel({ forceVolume = false } = {}) {
  setTestRunnerPanelOpen(true);
  const selected = getSelectedTestCaseKey();
  const volumeOpts = getVolumeRunOptions();
  const referenceDate = getReferenceDate();

  if (isBatchRunSelection(selected)) {
    if (forceVolume) {
      await runAnalyticsTestVolume({
        testCaseKey: 'newSubscription',
        count: volumeOpts.count,
        uniqueFans: true,
        historical: volumeOpts.historical,
        referenceDate,
      });
      return;
    }
    await runAnalyticsTestBatch({ referenceDate });
    return;
  }
  if (isMixedBatchKey(selected)) {
    if (forceVolume) {
      await runAnalyticsTestVolume({
        testCaseKey: 'newSubscription',
        count: volumeOpts.count,
        uniqueFans: true,
        historical: volumeOpts.historical,
        referenceDate,
      });
      return;
    }
    await runAnalyticsTestMixedBatch(selected, { referenceDate });
    return;
  }
  if (isRandomBatchKey(selected)) {
    await runAnalyticsTestRandomBatch({
      count: volumeOpts.count,
      referenceDate,
    });
    return;
  }

  if (isVolumeScenarioKey(selected)) {
    const scenario = resolveVolumeScenario(selected);
    setRepeatCountInput(scenario.count);
    if (scenario.datedOffsetsDays?.length) setHistoricalModeInput(true);
    await runAnalyticsTestVolume({
      testCaseKey: scenario.testCaseKey,
      count: scenario.count,
      uniqueFans: true,
      datedOffsetsDays: scenario.datedOffsetsDays,
      historical: !!scenario.datedOffsetsDays?.length,
      referenceDate,
    });
    return;
  }

  const selectedDateIsHistorical =
    referenceDate &&
    new Date(`${referenceDate}T00:00:00`).getTime() <
      new Date(new Date().toDateString()).getTime();

  if (selectedDateIsHistorical) {
    await runAnalyticsTestCase(selected, { referenceDate });
    return;
  }
  
  const useVolume = forceVolume || volumeOpts.count > 1 || volumeOpts.historical;
  if (useVolume) {
    await runAnalyticsTestVolume({
      testCaseKey: selected,
      count: volumeOpts.count,
      uniqueFans: true,
      historical: volumeOpts.historical,
      referenceDate,
    });
    return;
  }

  await runAnalyticsTestCase(selected, { referenceDate });
}

export function bootstrapAnalyticsTestRunner() {
  if (!ANALYTICS_TEST_RUNNER_TEMP_ENABLED) return;
  if (!(import.meta.env.DEV || import.meta.env.VITE_ENABLE_ANALYTICS_RUNNER === 'true')) return;

  if (!isAnalyticsTestRunnerRoute()) {
    hideTestRunnerUi();
    return;
  }

  initPageBootGuard();
  ensureLauncherButton();
  ensureTestRunnerPanel();

  if (!startHandlerBound) {
    startHandlerBound = true;
    bindStartButton(async () => {
      try {
        await startFromPanel({ forceVolume: false });
      } catch (error) {
        console.error('[AnalyticsTestRunner]', error);
      }
    });
    bindVolumeButton(async () => {
      try {
        await startFromPanel({ forceVolume: true });
      } catch (error) {
        console.error('[AnalyticsTestRunner]', error);
      }
    });
  }

  setTestRunnerPanelOpen(false);
  renderRunnerPanel();
  console.info('[AnalyticsTestRunner] Ready — click the Test Runner button (bottom-right)');
}

export function registerAnalyticsTestRunnerNavigation(routerInstance = router) {
  if (!ANALYTICS_TEST_RUNNER_TEMP_ENABLED) return;
  if (!import.meta.env.DEV && import.meta.env.VITE_ENABLE_ANALYTICS_RUNNER !== 'true') return;

  routerInstance.afterEach(() => {
    bootstrapAnalyticsTestRunner();
  });
}

if (ANALYTICS_TEST_RUNNER_TEMP_ENABLED && (import.meta.env.DEV || import.meta.env.VITE_ENABLE_ANALYTICS_RUNNER === 'true')) {
  const runBootstrap = () => bootstrapAnalyticsTestRunner();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runBootstrap);
  } else {
    runBootstrap();
  }

  router.isReady().then(() => {
    registerAnalyticsTestRunnerNavigation();
    bootstrapAnalyticsTestRunner();
  });
}

if (
  ANALYTICS_TEST_RUNNER_TEMP_ENABLED &&
  (import.meta.env.DEV || import.meta.env.VITE_ENABLE_ANALYTICS_RUNNER === 'true') &&
  typeof window !== 'undefined'
) {
  window.bootstrapAnalyticsTestRunner = bootstrapAnalyticsTestRunner;
  window.runAnalyticsTestVolumeSuite = runAnalyticsTestVolumeSuite;
  window.runAnalyticsTestHistoricalSeed = runAnalyticsTestHistoricalSeed;
  window.runAnalyticsTestCombinedHistoricalCurrent = runAnalyticsTestCombinedHistoricalCurrent;
}
