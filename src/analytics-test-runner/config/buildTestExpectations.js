import { EVENT_EXPECTATIONS } from './eventExpectations.js';
import { expandExpectedRows } from './expandExpectedRows.js';
import {
  buildExpectationsFromState,
  buildExpectationsFromEventHistory,
} from './buildExpectationsFromState.js';
import { attachApiFoundValues } from './hydrateApiRow.js';
import { buildApiValidationRows } from './apiValidationRows.js';

function payloadHasAlltime(chartsPayload, row) {
  if (!chartsPayload) return false;
  const path = String(row.apiPath || row.view || '');
  if (/contributor/i.test(path)) {
    return Array.isArray(chartsPayload.contributors?.topContributors?.alltime);
  }
  if (/likes/i.test(path)) return Array.isArray(chartsPayload.likes?.alltime);
  if (/fan/i.test(path)) return Array.isArray(chartsPayload.fanInsights?.alltime);
  if (/subs/i.test(path)) return Array.isArray(chartsPayload.subscriptions?.alltime);
  if (/earnings/i.test(path)) return Array.isArray(chartsPayload.earnings?.alltime);
  return (
    Array.isArray(chartsPayload.subscriptions?.alltime) ||
    Array.isArray(chartsPayload.earnings?.alltime)
  );
}

function annotateKnownGapsFromPayload(rows, chartsPayload, testCase, options = {}) {
  const repeatCount = options.repeatCount ?? 1;
  const testCaseKey = options.testCaseKey;
  rows.forEach((row) => {
    row.testCaseKey = row.testCaseKey || testCaseKey;
    row.repeatCount = row.repeatCount ?? repeatCount;

    if (row.period === 'alltime' && !payloadHasAlltime(chartsPayload, row)) {
      row.knownGap = row.knownGap || 'API often lacks *.alltime (known gap)';
    }

    const looksLikeOrders =
      String(row.view || '').includes('Orders Received') ||
      String(row.apiPath || '').includes('recentOrders') ||
      String(row.metric || '').toLowerCase().includes('recentorders');
    if (looksLikeOrders && !chartsPayload?.recentOrders) {
      row.knownGap = row.knownGap || 'recentOrders missing from /api/charts payload';
    }

    if (testCase?.gapStatus === 'blocked') {
      row.blocked = true;
      row.knownGap = row.knownGap || testCase.knownGaps?.[0] || 'Event trigger blocked at API';
    }
  });
  return rows;
}

/**
 * Build expectation rows from internal state (never from live API for expectedValue).
 *
 * @param {string} testCaseKey
 * @param {object} chartsPayload — used only for API "found" reads and contract validation
 * @param {{ fields?: Record<string, unknown>, expectationState?: object, eventHistory?: Array, mixedBatch?: boolean, repeatCount?: number, scanDate?: Date|string|null }} [options]
 */
export function buildTestExpectations(testCaseKey, chartsPayload, options = {}) {
  const fields = options.fields || {};
  const expectationState = options.expectationState;
  if (!expectationState) {
    throw new Error('buildTestExpectations requires expectationState (internal ledger)');
  }

  const testCase = EVENT_EXPECTATIONS[testCaseKey];
  if (!testCase && !options.mixedBatch) {
    throw new Error(`Unknown test case: ${testCaseKey}`);
  }

  let domRows;
  if (options.eventHistory?.length > 1 || options.mixedBatch) {
    domRows = buildExpectationsFromEventHistory(options.eventHistory, expectationState);
  } else {
    domRows = buildExpectationsFromState(testCaseKey, expectationState, { fields });
  }

  const domIds = new Set(domRows.map((row) => row.id));

  let supplementalApiRows = [];
  try {
    if (testCase) {
      const internalRows = expandExpectedRows(testCaseKey, { ...testCase, fields });
      supplementalApiRows = internalRows
        .filter((row) => row.source === 'api' && !domIds.has(row.id))
        .map((row) => attachApiFoundValues(row, expectationState, chartsPayload));
    }
  } catch {
    supplementalApiRows = [];
  }

  const apiValidationRows = buildApiValidationRows(domRows, expectationState, chartsPayload);

  const rows = [...domRows, ...supplementalApiRows, ...apiValidationRows];
  const annotated = annotateKnownGapsFromPayload(rows, chartsPayload, testCase, {
    testCaseKey,
    repeatCount: options.repeatCount,
  });
  if (options.scanDate) {
    const scanDate = new Date(options.scanDate);
    if (!Number.isNaN(scanDate.getTime())) {
      annotated.forEach((row) => {
        if (row.source === 'dataset' || row.source === 'amcharts') {
          row.scanDate = scanDate.toISOString();
        }
      });
    }
  }
  return annotated;
}
