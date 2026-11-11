import { markScannedElement } from '../utils/markScannedElement.js';
import { sleep } from '../utils/sleep.js';
import { periodMatchesLabel } from '../utils/periodMap.js';

export function isElementVisible(el) {
  if (!el) return false;
  if (typeof window !== 'undefined' && window.getComputedStyle) {
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
  }
  if (typeof el.getBoundingClientRect !== 'function') return true;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0 && rect.top === 0 && rect.left === 0) {
    // jsdom / unlaid-out nodes — fall through to computed-style result
    return true;
  }
  return rect.width > 0 && rect.height > 0;
}

function isPanelShown(panel) {
  if (!panel) return false;
  if (typeof window !== 'undefined' && window.getComputedStyle) {
    const style = window.getComputedStyle(panel);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
  }
  return true;
}

/**
 * Trend popups stay mounted after close (`v-show`). Always target the visible one.
 * @returns {Element|null}
 */
export function getOpenTrendPopupRoot() {
  const closeButtons = Array.from(document.querySelectorAll('.close-button, [data-popup-close]'));
  const panels = closeButtons.map((btn) => ({
    btn,
    panel:
      btn.closest('[role="dialog"]') ||
      btn.closest('.fixed') ||
      btn.closest('[class*="fixed"]') ||
      btn.parentElement,
  }));
  const shown = panels.filter(({ panel }) => isPanelShown(panel));
  const visible = shown.filter(({ btn }) => isElementVisible(btn));
  const chosen = visible[visible.length - 1] || shown[shown.length - 1] || null;
  return chosen?.panel || null;
}

function queryInOpenPopup(selector) {
  const root = getOpenTrendPopupRoot();
  if (root) {
    const found = root.querySelector(selector);
    if (found) return found;
  }
  return Array.from(document.querySelectorAll(selector)).find(isElementVisible) || null;
}

export async function waitForPopupPaint(timeoutMs = 6000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    const popupRoot = getOpenTrendPopupRoot();
    if (popupRoot) {
      await sleep(150);
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      return true;
    }
    await sleep(100);
  }

  return false;
}

export async function closeTrendPopup() {
  const closeBtn = queryInOpenPopup('.close-button') || queryInOpenPopup('[data-popup-close]');
  if (closeBtn) {
    markScannedElement(closeBtn, 'Close trend popup');
    closeBtn.click();
    await sleep(400);
    return;
  }

  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  await sleep(400);
}

/**
 * Switch popup period via the custom trends dropdown (Daily / Weekly / …).
 * @param {string} periodLabel - day | week | month | year | alltime
 * @param {{ optional?: boolean }} [options] — if optional, missing toggle returns `{ ok: false, missing: true }` instead of throwing
 * @returns {Promise<{ ok: boolean, missing?: boolean, reason?: string }>}
 */
export async function switchPopupPeriod(periodLabel, options = {}) {
  const optional = !!options.optional;
  const dropdown = queryInOpenPopup('.select-dropdown');
  if (!dropdown) {
    if (optional) return { ok: false, missing: true, reason: 'dropdown-missing' };
    throw new Error(`Period dropdown not found for: ${periodLabel}`);
  }

  const trigger = dropdown.querySelector('.trends-select, .dash-select__trigger');
  if (!trigger) {
    if (optional) return { ok: false, missing: true, reason: 'trigger-missing' };
    throw new Error(`Period dropdown trigger not found for: ${periodLabel}`);
  }

  markScannedElement(trigger, `Open period menu: ${periodLabel}`);
  trigger.click();
  await sleep(200);

  const optionNodes = Array.from(
    dropdown.querySelectorAll('.dash-options-container .option, .dash-options-container .option span'),
  );

  const target = optionNodes.find((element) => periodMatchesLabel(periodLabel, element.textContent));

  if (!target) {
    trigger.click();
    await sleep(100);
    if (optional) return { ok: false, missing: true, reason: 'option-missing' };
    throw new Error(`Period option not found: ${periodLabel}`);
  }

  const clickable = target.closest('.option') || target;
  markScannedElement(clickable, `Period toggle: ${periodLabel}`);
  clickable.click();
  await sleep(250);
  return { ok: true };
}

/**
 * Visible period option labels in the open popup (Daily, Weekly, …).
 * @returns {string[]}
 */
export function listAvailablePopupPeriodLabels() {
  const dropdown = queryInOpenPopup('.select-dropdown');
  if (!dropdown) return [];
  return Array.from(
    dropdown.querySelectorAll('.dash-options-container .option, .dash-options-container .option span'),
  )
    .map((el) => String(el.textContent || '').trim())
    .filter(Boolean);
}
