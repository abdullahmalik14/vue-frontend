# Analytics DOM + Chart Test Runner

Browser-injected test suite for the analytics page. Validates visible DOM and amCharts runtime data against **internally computed expectations** (domain-partitioned ledger), then cross-checks `/api/charts` for DB drift.

**API:** Dev proxy targets `http://15.235.59.191` (Node API — see `server-access-guide.pdf`). Do not use the Vercel handler for test runs.

> **Adding a new metric or chart?** See [METRIC_CONTRACT.md](./METRIC_CONTRACT.md) — the canonical guide.  
> Note: am5 `dataContext` scraping is **deprecated**. All new assertions must use `data-analytics-*` attributes.

## Test creator

Use **`99999`** — not `566` (shared manual QA data).

```text
https://admin.uy4sdjn4f7.com/?creator_id=99999
http://localhost:5173/iframe/analytics?creator=99999
```

## Config

| File | Purpose |
|------|---------|
| `config/analyticsMetricRegistry.js` | **NEW** — single source of truth for all metric keys + bindings |
| `config/chartContractSchema.js` | **NEW** — required attributes + metrics per chart container |
| `config/breakdownKeyToMetric.js` | **NEW** — chart field → metric key mapping |
| `config/testCreator.js` | Creator id, fan ids, API paths |
| `config/eventExpectations.js` | Per-master-event triggers and expected views |
| `config/masterEventChildMap.js` | Master→child metric routing (mirror Node server) |
| `config/expectationState.js` | Internal ledger — source of truth for expected values |
| `config/buildExpectationsFromState.js` | Row builder from internal state |
| `config/mixedBatchScenarios.js` | Multi-event scenarios before one refresh |
| `config/volumeScenarios.js` | Repeat-count presets + historical offsets |
| `config/periodBuckets.js` | Dated event → daily/weekly/monthly/yearly/alltime routing |
| `GAP_ANALYSIS.md` | Doc vs live gaps (2026-06-30) |

## Scanners

| File | Scan type | Status |
|------|-----------|--------|
| `scanners/domScanners.js` → `scanMetricSelector` | `metricSelector` | **Active** |
| `scanners/chartContractScanner.js` | `chartContract` | **Active** |
| `scanners/domScanners.js` → `scanCardValueByHeading` | `cardValueByHeading` | Deprecated |
| `scanners/domScanners.js` → `scanCardMetricByLabel` | `cardMetricByLabel` | Deprecated |
| `scanners/domScanners.js` → `scanPopupStatByHeading` | `popupStatByHeading` | Deprecated |

## Build spec

See `/Users/pro2019/Downloads/dom_chart_test_scanner_runner_build_instructions.md`

## Status

**Phase 0–7 v1 implemented** — injects panel in dev on analytics routes. First case: `newSubscription` on creator `99999`.

### Usage

1. `nvm use 20 && npm run dev`
2. Open `http://localhost:5173/iframe/analytics?creator=99999`
3. Click **Start Test Runner** in the bottom-right panel
4. Or run in console: `runAnalyticsTestCase('newSubscription')`
5. **Batch:** **Batch: all cases (sequential)** — one clear + one event per case (`runAnalyticsTestBatch()`).
6. **Mixed batch:** e.g. **Mixed: New Subscription + Merch** — one clear, multiple events, one refresh (`runAnalyticsTestMixedBatch()`).
7. **Volume:** set **Repeat count** (presets 15 / 500) and click **Run volume**, or `runAnalyticsTestVolume({ testCaseKey: 'newSubscription', count: 15 })`.
8. **Historical:** check **Historical dates** to split repeats across today / 8 days ago / 40 days ago, then toggle popup Daily–All Time.
9. **Historical seed:** `runAnalyticsTestHistoricalSeed()` clears creator `99999`, creates 500 mixed records spanning the prior 365 days, waits for ingest, and runs the standard DOM/API scan from the seeded ledger.

Console:

```js
runAnalyticsTestCase('newSubscription')           // count=1, existing path
runAnalyticsTestVolume({ testCaseKey: 'newSubscription', count: 15 })
runAnalyticsTestVolume({ testCaseKey: 'newSubscription', count: 15, historical: true })
runAnalyticsTestVolume({ testCaseKey: 'newSubscription', count: 500 })
runAnalyticsTestHistoricalSeed()                 // 500 mixed records over 365 days; clears test creator
runAnalyticsTestHistoricalSeed({ count: 750, daysBack: 730 })
runAnalyticsTestHistoricalSeed({ testCaseKey: 'newSubscription', count: 500 })
runAnalyticsTestHistoricalSeed({ count: 200, clearFirst: false }) // append instead of clearing
runAnalyticsTestCombinedHistoricalCurrent() // 10 historical (8d/40d) + 5 current records
runAnalyticsTestCombinedHistoricalCurrent({ testCaseKey: 'merchOrder', historicalCount: 12, currentCount: 6 })
runAnalyticsTestBatch()
runAnalyticsTestMixedBatch()
```

Creator is always `99999`. Volume uses unique fan ids (`88001`, then `89001+`) so idempotent subscriptions/follows/orders do not collapse.

**Ingest:** after N triggers the runner polls `/api/charts` until ledger totals appear (no 8s × N sleep). Failures are listed in **Run report** (event, repeat count, surface, period, metric, expected, found).

**Known gaps** (`GAP_ANALYSIS.md`, `*.alltime` missing, `recentOrders`, blocked `p2v`) are `GAP` / `BLOCKED`, not hard FAIL, unless the API now returns the data.

### Modules

| Path | Role |
|------|------|
| `index.js` | Dev bootstrap |
| `runAnalyticsTestCase.js` | Single-event orchestrator (count=1) |
| `runAnalyticsTestVolume.js` | Repeat / historical orchestrator |
| `runAnalyticsTestHistoricalSeed.js` | Mixed historical data seeder (no assertions) |
| `runAnalyticsTestCombinedHistoricalCurrent.js` | Historical + current metric-update scenario |
| `runAnalyticsTestBatch.js` | Sequential all-cases |
| `runAnalyticsTestMixedBatch.js` | Multi-event, one refresh |
| `api/` | HTTP runner + in-memory log |
| `refresh/` | Refresh button + waits |
| `scanners/` | DOM scanners + execute |
| `charts/` | am5 registry collector |
| `compare/` | PASS/FAIL engine |
| `config/` | Creator id, event expectations, row expander |
| `validation/` | Lightweight JSON contract check |
| `ui/panel.js` | Injected test panel |
