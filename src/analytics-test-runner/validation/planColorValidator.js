import {
  FREE_PLAN_KEY,
  FREE_TIER_COLOR,
  PLAN_COLORS,
  TIER_PLAN_COLORS,
  isFreePlan,
} from '@/config/planColors.config.js';

function isSeriesStyleMap(value) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.values(value).some((entry) => entry && typeof entry === 'object' && 'color' in entry)
  );
}

function shouldValidateSource(source) {
  if (source === 'seriesStyles') return true;
  const id = String(source || '');
  return id.startsWith('subs-') || id.startsWith('tiers-');
}

function collectSeriesStyleMaps(input) {
  const maps = [];
  const seen = new Set();

  function visit(value, source = 'seriesStyles') {
    if (!value || typeof value !== 'object' || seen.has(value)) return;
    seen.add(value);

    if (isSeriesStyleMap(value.seriesStyles)) {
      const styleSource = value.chartId || value.datasetKey || source;
      if (shouldValidateSource(styleSource)) {
        maps.push({
          source: styleSource,
          seriesStyles: value.seriesStyles,
        });
      }
    }

    if (value.config && isSeriesStyleMap(value.config.seriesStyles)) {
      const styleSource = value.chartId || value.config.datasetKey || source;
      if (shouldValidateSource(styleSource)) {
        maps.push({
          source: styleSource,
          seriesStyles: value.config.seriesStyles,
        });
      }
    }

    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${source}[${index}]`));
      return;
    }

    Object.entries(value).forEach(([key, child]) => {
      if (key !== 'seriesStyles' && key !== 'config') {
        visit(child, key);
      }
    });
  }

  if (isSeriesStyleMap(input)) {
    maps.push({ source: 'seriesStyles', seriesStyles: input });
  } else {
    visit(input);
  }

  return maps;
}

function isAggregateSeries(key, style) {
  const name = String(style?.name || '').trim();
  const id = String(key || '').trim();
  return /^(total|new|sub|tip|recurring|all|other|newsubscriber|recurringsubscriber)$/i.test(name)
    || /^(total|new|sub|tip|recurring|all|other)$/i.test(id);
}

function isFreeSeries(key, style) {
  return key === 'sub' || isFreePlan(key) || isFreePlan(style?.name);
}

/**
 * Validates that chart series styles use the correct fixed colors.
 *
 * Checks two invariants:
 *  1. Free plan always maps to FREE_TIER_COLOR (light blue)
 *  2. All non-Free plans use the restored rotating tier palette
 *
 * @param {Object} chartSeriesStyles - A seriesStyles object, chart config, or chart snapshot collection
 * @returns {{ summary: { total: number, pass: number, fail: number, skip: number }, results: Array }}
 */
export function validatePlanColors(chartSeriesStyles) {
  const results = [];
  const styleMaps = collectSeriesStyleMaps(chartSeriesStyles);

  if (styleMaps.length === 0) {
    results.push({
      severity: 'SKIP',
      plan: FREE_PLAN_KEY,
      expected: PLAN_COLORS[FREE_PLAN_KEY],
      actual: null,
      message: 'No chart series styles found to validate',
    });
  }

  for (const { source, seriesStyles } of styleMaps) {
    for (const [key, style] of Object.entries(seriesStyles || {})) {
      const color = style?.color;
      if (color == null) continue;
      if (isAggregateSeries(key, style)) continue;

      const free = isFreeSeries(key, style);
      const expected = free ? FREE_TIER_COLOR : TIER_PLAN_COLORS;
      const pass = free ? color === FREE_TIER_COLOR : TIER_PLAN_COLORS.includes(color);
      const plan = style?.name || key;

      results.push({
        severity: pass ? 'PASS' : 'FAIL',
        source,
        plan,
        check: free ? 'invariant: free = light blue' : 'invariant: non-free = tier palette',
        expected,
        actual: color,
        message: pass
          ? `Plan "${plan}" uses expected color (${color})`
          : `Plan "${plan}" color mismatch in ${source}: expected one of ${JSON.stringify(expected)}, got ${color}`,
      });
    }
  }

  const pass = results.filter((r) => r.severity === 'PASS').length;
  const fail = results.filter((r) => r.severity === 'FAIL').length;
  const skip = results.filter((r) => r.severity === 'SKIP').length;

  return {
    summary: { total: results.length, pass, fail, skip },
    results,
  };
}
