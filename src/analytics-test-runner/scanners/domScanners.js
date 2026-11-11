import { markScannedElement } from '../utils/markScannedElement.js';
import { normalizeNumber } from '../utils/normalizeNumber.js';
import { getOpenTrendPopupRoot } from './popupControls.js';

/**
 * Main-card metrics already expose `data-value` (or a nearby % label).
 * Used when `data-analytics-metric` stamps are not on the Vue templates.
 */
const MAIN_CARD_FALLBACKS = {
  'subscribers.new': { card: 'subscribers', kind: 'value', index: 0 },
  'subscribers.recurring': { card: 'subscribers', kind: 'value', index: 1 },
  'subscribers.new-percentage': { card: 'subscribers', kind: 'percent', index: 0 },
  'subscribers.recurring-percentage': { card: 'subscribers', kind: 'percent', index: 1 },
  'earnings.total': { card: 'earnings', kind: 'value', index: 0 },
  'earnings.percentage': { card: 'earnings', kind: 'percent', index: 0 },
  'fans.new-followers': { card: 'fans', kind: 'value', index: 0 },
  'fans.profile-visits': { card: 'fans', kind: 'value', index: 1 },
  'fans.new-followers-percentage': { card: 'fans', kind: 'percent', index: 0 },
  'fans.profile-visits-percentage': { card: 'fans', kind: 'percent', index: 1 },
  'likes.media': { card: 'likes', kind: 'value', index: 0 },
  'likes.merch': { card: 'likes', kind: 'value', index: 1 },
  'likes.profile': { card: 'likes', kind: 'value', index: 2 },
  'likes.feed': { card: 'likes', kind: 'value', index: 3 },
  'likes.media-percentage': { card: 'likes', kind: 'percent', index: 0 },
  'likes.merch-percentage': { card: 'likes', kind: 'percent', index: 1 },
  'likes.profile-percentage': { card: 'likes', kind: 'percent', index: 2 },
  'likes.feed-percentage': { card: 'likes', kind: 'percent', index: 3 },
};

const POPUP_HEADING_FALLBACKS = {
  'earnings.total': ['total earnings'],
  'earnings.tokens-received': ['tokens received'],
  'fans.profile-visits': ['profile visit'],
  'fans.new-followers': ['new follower'],
};

const PERCENT_TEXT = /[+\-]?\d+(?:\.\d+)?\s*%/;

function resultFromElement(el, label) {
  if (!el) return null;
  markScannedElement(el, label);

  const rawAttr = el.getAttribute('data-value');
  if (rawAttr != null && String(rawAttr).trim() !== '') {
    const num = normalizeNumber(rawAttr);
    return {
      ok: num != null && !Number.isNaN(num),
      foundValue: num,
      rawText: el.textContent.trim(),
      element: el,
      error: num == null || Number.isNaN(num) ? `Could not parse data-value="${rawAttr}"` : null,
    };
  }

  const text = el.textContent.trim();
  const num = normalizeNumber(text.replace('%', ''));
  return {
    ok: num != null && !Number.isNaN(num),
    foundValue: num,
    rawText: text,
    element: el,
    error: num == null || Number.isNaN(num) ? `Could not parse textContent "${text}"` : null,
  };
}

function scanMainCardFallback(metric) {
  const spec = MAIN_CARD_FALLBACKS[metric];
  if (!spec) return null;

  const card = document.querySelector(`[data-analytics-card="${spec.card}"]`);
  if (!card) return null;

  const valueNodes = Array.from(card.querySelectorAll('[data-value]'));
  if (spec.kind === 'value') {
    return resultFromElement(valueNodes[spec.index], `fallback card ${spec.card} · ${metric}`);
  }

  const valueEl = valueNodes[spec.index];
  if (!valueEl) return { missingPercent: true, spec };

  const column =
    valueEl.closest('.flex-col') ||
    valueEl.parentElement?.parentElement ||
    valueEl.parentElement;
  const percentEl = Array.from((column || card).querySelectorAll('span')).find((el) => {
    if (el.children.length > 0) return false;
    return PERCENT_TEXT.test(String(el.textContent || ''));
  });

  if (!percentEl) return { missingPercent: true, spec };
  return resultFromElement(percentEl, `fallback card ${spec.card} % · ${metric}`);
}

function scanPopupFallback(metric) {
  const needles = POPUP_HEADING_FALLBACKS[metric];
  if (!needles) return null;

  const root = getOpenTrendPopupRoot();
  if (!root) return null;

  const headings = Array.from(root.querySelectorAll('h3, h2, h4'));
  const heading = headings.find((el) => {
    const text = String(el.textContent || '').trim().toLowerCase();
    return needles.some((needle) => text.includes(needle));
  });
  if (!heading) return null;

  const column = heading.parentElement || heading;
  const valueEl =
    column.querySelector('[data-value]') ||
    Array.from(column.querySelectorAll('span, div')).find((el) => {
      if (el === heading || heading.contains(el)) return false;
      if (el.children.length > 0) return false;
      const text = String(el.textContent || '').trim();
      if (!text || text === '--' || text.includes('%')) return false;
      return normalizeNumber(text) != null;
    });

  return resultFromElement(valueEl, `fallback popup · ${metric}`);
}

/**
 * Scan a DOM element by data-analytics-metric (+ optional period and surface).
 * Falls back to existing `data-value` / popup headings when stamps are absent.
 *
 * @param {{ metric: string, period?: string, surface?: string }} options
 * @returns {{ ok: boolean, foundValue: number|null, rawText: string, element: Element|null, error: string|null }}
 */
export function scanMetricSelector({ metric, period, surface } = {}) {
  if (!metric) {
    return { ok: false, foundValue: null, rawText: '', element: null, error: 'metric is required for scanMetricSelector' };
  }

  const selector = [
    `[data-analytics-metric="${metric}"]`,
    period ? `[data-analytics-period="${period}"]` : '',
    surface ? `[data-analytics-surface="${surface}"]` : '',
  ].join('');

  const stamped =
    document.querySelector(selector) ||
    document.querySelector(
      `[data-analytics-metric="${metric}"]${surface ? `[data-analytics-surface="${surface}"]` : ''}`,
    );

  if (stamped) {
    return resultFromElement(stamped, `metric: ${metric}`);
  }

  const fallback =
    (!surface || surface === 'main' ? scanMainCardFallback(metric) : null) ||
    (String(surface || '').startsWith('popup-') ? scanPopupFallback(metric) : null);

  if (fallback?.missingPercent) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: null,
      knownGap: 'vs-yesterday % not in DOM (no stamp; comparison hidden when previous period is empty)',
      error: `Element not found: ${selector}`,
    };
  }

  if (fallback && !fallback.missingPercent) return fallback;

  return {
    ok: false,
    foundValue: null,
    rawText: '',
    element: null,
    error: `Element not found: ${selector}`,
  };
}


/**
 * Scan the sales value for a specific country in the Top Countries table.
 * Uses data-testid to locate the table and data-analytics-metric for the sales cell.
 *
 * @param {string} _tableHeading - unused; kept for call-site compatibility
 * @param {string} countryName   - display name used as data-value on the country cell
 */
export function scanTrendTableCountrySales(_tableHeading, countryName) {
  const headingEl = document.querySelector('[data-testid="dashboard-analytics-top-countries-heading"]');

  if (!headingEl) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: null,
      error: 'Top Countries heading not found (data-testid="dashboard-analytics-top-countries-heading")',
    };
  }

  const tableRoot =
    headingEl.closest('.fourth-white-card-column') ||
    headingEl.closest('[class*="white-card"]') ||
    headingEl.closest('div');

  markScannedElement(headingEl, 'Table: Top Countries');

  const countryCells = Array.from(tableRoot?.querySelectorAll('[data-value]') || []).filter((el) => {
    const value = el.getAttribute('data-value') || el.textContent.trim();
    return value === countryName || el.textContent.trim() === countryName;
  });

  if (countryCells.length === 0) {
    return {
      ok: false,
      foundValue: null,
      rawText: '',
      element: tableRoot,
      error: `Country row not found: ${countryName}`,
    };
  }

  const countryEl = countryCells[0];
  markScannedElement(countryEl, `Country: ${countryName}`);

  const row = countryEl.closest('[class*="row"]') || countryEl.closest('.flex');

  // Prefer explicit data-analytics-metric selector; fall back to any other [data-value] in the row
  const salesEl =
    row?.querySelector('[data-analytics-metric^="countries."][data-analytics-metric$=".sales"]') ||
    Array.from(row?.querySelectorAll('[data-value]') || []).find((el) => el !== countryEl);

  if (!salesEl) {
    return {
      ok: false,
      foundValue: null,
      rawText: countryEl.textContent.trim(),
      element: countryEl,
      error: `Sales cell not found for ${countryName}`,
    };
  }

  markScannedElement(salesEl, `Sales: ${countryName}`);
  const salesText = salesEl.getAttribute('data-value') || salesEl.textContent;
  const sales = normalizeNumber(String(salesText).replace(/[^\d.-]/g, ''));

  return {
    ok: !Number.isNaN(sales),
    foundValue: sales,
    rawText: salesEl.textContent.trim(),
    element: salesEl,
    error: Number.isNaN(sales) ? `Could not parse sales for ${countryName}` : null,
  };
}

/**
 * Open a trend popup by clicking its card's "Trend" button.
 * Locates the card via data-analytics-card="<name>" (set on DashboardAnalyticsMetricCard).
 * Accepted names: "subscribers" | "earnings" | "fans" | "likes" | "top contributors"
 *
 * @param {string} cardName  e.g. "Earnings", "Subscribers" — matched case-insensitively
 */
export async function openTrendPopupFromHeading(cardName) {
  const key = cardName.toLowerCase();
  const cardEl = document.querySelector(`[data-analytics-card="${key}"]`);

  if (!cardEl) {
    throw new Error(
      `Analytics card not found: [data-analytics-card="${key}"] — ` +
      `ensure data-analytics-card is set on the DashboardAnalyticsMetricCard for "${cardName}"`,
    );
  }

  markScannedElement(cardEl, `Popup source card: ${cardName}`);
  cardEl.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

  const buttons = Array.from(cardEl.querySelectorAll('button'));
  const trendButton = buttons.find((button) => button.textContent.trim().toLowerCase().includes('trend'));

  if (!trendButton) throw new Error(`Trend button not found inside card: ${cardName}`);

  markScannedElement(trendButton, `Open popup: ${cardName}`);
  trendButton.click();
}
