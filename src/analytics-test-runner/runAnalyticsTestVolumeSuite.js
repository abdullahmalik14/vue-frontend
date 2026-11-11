import { EVENT_EXPECTATIONS } from './config/eventExpectations.js';
import { runAnalyticsTestVolume } from './runAnalyticsTestVolume.js';
import { analyticsTestState } from './state.js';
import { logActivity, setRunnerStep } from './ui/activityLog.js';
import { renderRunnerPanel, setTestRunnerPanelOpen } from './ui/panel.js';

function slimReport(report) {
  if (!report) return null;
  return {
    testCaseKey: report.testCaseKey,
    repeatCount: report.repeatCount,
    historical: report.historical,
    counts: report.counts,
    copyPasteFailures: report.copyPasteFailures || '',
    generatedAt: report.generatedAt,
    failures: (report.failures || []).map((issue) => ({
      severity: issue.severity,
      surface: issue.surface,
      period: issue.period,
      metric: issue.metric,
      expected: issue.expected,
      found: (() => {
        try {
          return JSON.parse(JSON.stringify(issue.found));
        } catch {
          return String(issue.found);
        }
      })(),
      message: issue.message,
    })),
  };
}

/**
 * Run volume ×N for every master event (or `keys`) sequentially.
 * Used so the suite can be driven from the console / Playwright without
 * clicking each dropdown option.
 *
 * @param {{ count?: number, historical?: boolean, uniqueFans?: boolean, keys?: string[], referenceDate?: string }} [options]
 */
export async function runAnalyticsTestVolumeSuite(options = {}) {
  const count = Math.max(1, Math.floor(Number(options.count) || 15));
  const historical = !!options.historical;
  const uniqueFans = options.uniqueFans !== false;
  const keys = Array.isArray(options.keys) && options.keys.length
    ? options.keys
    : Object.keys(EVENT_EXPECTATIONS);

  analyticsTestState.pauseDomScanBeforeEachStep = false;
  analyticsTestState.referenceDate = options.referenceDate || null;
  setTestRunnerPanelOpen(true);
  setRunnerStep('reset', `Volume suite: ${keys.length} events ×${count}${historical ? ' (historical)' : ''}`);
  logActivity(`Volume suite starting — ${keys.length} events ×${count}`, 'reset');

  const results = [];

  for (let i = 0; i < keys.length; i += 1) {
    const key = keys[i];
    const label = EVENT_EXPECTATIONS[key]?.label || key;
    const progress = `[${i + 1}/${keys.length}]`;
    setRunnerStep('reset', `${progress} ${label} ×${count}`);
    logActivity(`${progress} Volume: ${label}`, 'trigger');

    try {
      const report = await runAnalyticsTestVolume({
        testCaseKey: key,
        count,
        uniqueFans,
        historical,
        referenceDate: options.referenceDate,
      });
      const slim = slimReport(report);
      results.push({
        key,
        label,
        ok: true,
        counts: slim?.counts || null,
        copyPasteFailures: slim?.copyPasteFailures || '',
        failures: slim?.failures || [],
      });
      const c = slim?.counts || {};
      logActivity(
        `${progress} ${label}: pass ${c.pass ?? 0} · FAIL ${c.fail ?? 0} · GAP ${c.gap ?? 0} · BLOCKED ${c.blocked ?? 0}`,
        'done',
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        key,
        label,
        ok: false,
        error: message,
        counts: analyticsTestState.runReport?.counts || null,
        copyPasteFailures: analyticsTestState.runReport?.copyPasteFailures || message,
      });
      logActivity(`${progress} ${label}: ERROR ${message}`, 'done');
    }

    renderRunnerPanel();
  }

  window.__analyticsVolumeSuiteResults = results;
  setRunnerStep('done', `Volume suite finished — ${results.length} events`);
  logActivity('Volume suite finished', 'done');
  renderRunnerPanel();
  return results;
}

if (typeof window !== 'undefined') {
  window.runAnalyticsTestVolumeSuite = runAnalyticsTestVolumeSuite;
}
