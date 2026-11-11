/**
 * Structured run report: every non-pass row is identifiable
 * (event, repeat count, surface, period, metric, expected, found, message).
 */

function severityFromComparison(row) {
  if (row.blocked || row.severity === 'BLOCKED') return 'BLOCKED';
  if (row.knownGap) return 'GAP';
  if (row.pass) return 'PASS';
  return 'FAIL';
}

function issueFromComparison(row, meta) {
  return {
    id: row.expectedId || row.id,
    testCaseKey: row.testCaseKey || meta.testCaseKey,
    repeatCount: row.repeatCount ?? meta.repeatCount ?? 1,
    eventIndex: row.eventIndex ?? null,
    view: row.view,
    location: row.location,
    metric: row.metric,
    period: row.period,
    surface: row.scan?.surface || row.surface || row.view,
    expected: row.expectedValue,
    found: row.foundValue,
    pass: !!row.pass,
    knownGap: !!row.knownGap,
    severity: severityFromComparison(row),
    message: row.message,
    scanType: row.scanType || row.scan?.type || row.source,
  };
}

/**
 * @param {import('../state.js').analyticsTestState} state
 * @param {{ testCaseKey?: string, repeatCount?: number, historical?: boolean }} [meta]
 */
export function buildRunReport(state, meta = {}) {
  const comparisonIssues = (state.comparisonRows || []).map((row) => issueFromComparison(row, meta));

  const refreshIssues = (state.refreshVerification?.checks || [])
    .filter((check) => !check.pass)
    .map((check) => ({
      id: check.id || `refresh.${check.label}`,
      testCaseKey: meta.testCaseKey,
      repeatCount: meta.repeatCount ?? 1,
      eventIndex: null,
      view: 'Refresh',
      location: check.label,
      metric: check.id,
      period: 'day',
      surface: 'refresh',
      expected: true,
      found: false,
      pass: false,
      knownGap: false,
      severity: 'FAIL',
      message: check.message,
      scanType: 'refresh',
    }));

  const periodTotalIssues = (state.periodTotalResults?.results || [])
    .filter((r) => r.severity === 'FAIL')
    .map((r) => ({
      id: r.id || `periodTotal.${r.path || r.message}`,
      testCaseKey: meta.testCaseKey,
      repeatCount: meta.repeatCount ?? 1,
      eventIndex: null,
      view: 'Period totals',
      location: r.path || r.period,
      metric: r.path,
      period: r.period,
      surface: 'api',
      expected: r.expected,
      found: r.found,
      pass: false,
      knownGap: false,
      severity: 'FAIL',
      message: r.message,
      scanType: 'periodTotal',
      referenceDate: meta.referenceDate || null,
    }));

  const planColorIssues = (state.planColorResults?.results || [])
    .filter((r) => r.severity === 'FAIL')
    .map((r) => ({
      id: r.id || `planColor.${r.message}`,
      testCaseKey: meta.testCaseKey,
      repeatCount: meta.repeatCount ?? 1,
      eventIndex: null,
      view: 'Plan colors',
      location: r.path || r.chartId,
      metric: 'planColor',
      period: r.period,
      surface: 'chart',
      expected: r.expected,
      found: r.found,
      pass: false,
      knownGap: false,
      severity: 'FAIL',
      message: r.message,
      scanType: 'planColor',
    }));

  const triggerIssues = (state.triggerFailures || []).map((t, i) => ({
    id: t.id || `trigger.${t.eventIndex ?? i}`,
    testCaseKey: t.testCaseKey || meta.testCaseKey,
    repeatCount: meta.repeatCount ?? 1,
    eventIndex: t.eventIndex ?? i,
    view: 'Trigger',
    location: t.url || '/api/events/trigger',
    metric: t.masterEventType,
    period: t.period,
    surface: 'api',
    expected: 'HTTP 2xx',
    found: t.response,
    pass: false,
    knownGap: !!t.knownGap,
    severity: t.severity || (t.blocked ? 'BLOCKED' : 'ERROR'),
    message: t.message,
    scanType: 'apiPath',
  }));

  const errorIssues = (state.errors || []).map((err, i) => ({
    id: `error.${i}`,
    testCaseKey: meta.testCaseKey,
    repeatCount: meta.repeatCount ?? 1,
    eventIndex: null,
    view: 'Runner',
    location: 'exception',
    metric: null,
    period: null,
    surface: 'runner',
    expected: null,
    found: err,
    pass: false,
    knownGap: false,
    severity: 'ERROR',
    message: typeof err === 'string' ? err : err?.message || String(err),
    scanType: 'error',
  }));

  const extraIssues = state.issueRows || [];

  const all = [
    ...comparisonIssues,
    ...refreshIssues,
    ...periodTotalIssues,
    ...planColorIssues,
    ...triggerIssues,
    ...errorIssues,
    ...extraIssues,
  ];

  const counts = {
    pass: all.filter((i) => i.severity === 'PASS' || (i.pass && !i.knownGap && i.severity !== 'GAP')).length,
    fail: all.filter((i) => i.severity === 'FAIL').length,
    gap: all.filter((i) => i.severity === 'GAP' || i.knownGap).length,
    blocked: all.filter((i) => i.severity === 'BLOCKED').length,
    errors: all.filter((i) => i.severity === 'ERROR').length,
  };

  const failures = all.filter((i) => i.severity === 'FAIL' || i.severity === 'ERROR' || i.severity === 'BLOCKED');

  const copyPasteFailures = failures
    .map((i) => {
      const bits = [
        i.testCaseKey,
        i.repeatCount != null ? `x${i.repeatCount}` : null,
        i.surface,
        i.period,
        i.metric,
        `expected ${i.expected}`,
        `found ${formatFound(i.found)}`,
        i.message,
      ].filter((part) => part != null && part !== '');
      return bits.join(' · ');
    })
    .join('\n');

  return {
    testCaseKey: meta.testCaseKey,
    repeatCount: meta.repeatCount ?? 1,
    historical: !!meta.historical,
    counts,
    issues: all,
    failures,
    copyPasteFailures,
    generatedAt: new Date().toISOString(),
  };
}

function formatFound(value) {
  if (value == null) return '—';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function formatRunReportSummary(report) {
  if (!report) return '';
  const c = report.counts || {};
  const ref = report.referenceDate ? `\nRef date: ${report.referenceDate}` : '';
  const head = `pass ${c.pass ?? 0} · FAIL ${c.fail ?? 0} · GAP ${c.gap ?? 0} · BLOCKED ${c.blocked ?? 0} · ERROR ${c.errors ?? 0}${ref}`;
  if (!report.copyPasteFailures) return head;
  return `${head}\n\n${report.copyPasteFailures}`;
}
