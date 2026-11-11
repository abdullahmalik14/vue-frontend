/**
 * Visible viewport for apps embedded in a cross-origin iframe.
 *
 * After the parent resizes the iframe to content height, window.innerHeight
 * and 100vh become the full document height. Popups that use 90%/100%/100vh
 * then stretch with the page instead of staying one screen tall.
 *
 * Capture the iframe's viewport while the parent still uses the 100vh fallback,
 * and reuse that size for overlays and modals.
 */

const VIEWPORT_MESSAGE_TYPE = 'fansocial:analytics-viewport';

let capturedVisibleHeight = 0;
let offsetTop = 0;
let modalLocked = false;
let lastUnlockedContentHeight = 0;
let restoreCachedHeightOnly = false;
let acceptMeasuredHeightOnce = false;
let pendingSmallerHeight = 0;
let pendingSmallerCount = 0;
let reportHeightFn = null;
let unlockReportToken = 0;
let iframeScrollMode = 'content-height';
const listeners = new Set();
const modalListeners = new Set();

const MIN_VISIBLE_HEIGHT = 200;

export function getEmbedScrollMode() {
  return iframeScrollMode;
}

export function isEmbedInternalScrollMode() {
  return iframeScrollMode === 'internal';
}

/**
 * WordPress sends scrollMode on fansocial:analytics-viewport.
 * internal = Vue scrolls inside a viewport-sized iframe (mobile).
 * content-height = Vue reports full height so WordPress can stretch the iframe.
 */
export function applyEmbedScrollMode(mode) {
  const previous = iframeScrollMode;
  const next = mode === 'internal' ? 'internal' : 'content-height';
  iframeScrollMode = next;

  if (typeof document !== 'undefined') {
    document.documentElement.toggleAttribute(
      'data-embed-scrollable',
      next === 'internal',
    );
  }

  if (
    previous === 'internal'
    && next !== 'internal'
    && typeof reportHeightFn === 'function'
    && !modalLocked
  ) {
    reportHeightFn();
  }

  return previous !== next;
}

export function isEmbeddedInIframe() {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function initEmbedViewport() {
  if (typeof window === 'undefined') return;

  capturedVisibleHeight = window.innerHeight;
  offsetTop = 0;

  // If the iframe was already stretched to content height, innerHeight is the
  // full page. The browser window is then the closest stand-in for original 100vh.
  if (isEmbeddedInIframe()) {
    const outer = Number(window.outerHeight);
    if (Number.isFinite(outer) && outer >= 200 && outer < capturedVisibleHeight - 50) {
      capturedVisibleHeight = Math.round(outer);
    }
  }

  syncCssVars();

  if (!isEmbeddedInIframe()) return;

  window.addEventListener('message', (event) => {
    if (event.data?.type !== VIEWPORT_MESSAGE_TYPE) return;

    const height = Number(event.data.height);
    const iframeTop = Number(event.data.iframeTop);

    if (Number.isFinite(height) && height >= 200 && height <= 5000) {
      capturedVisibleHeight = Math.round(height);
    }

    if (Number.isFinite(iframeTop)) {
      offsetTop = Math.max(0, Math.round(-iframeTop));
    }

    applyEmbedScrollMode(event.data.scrollMode);

    syncCssVars();
    notify();
  });

  const syncVisibleViewport = () => {
    if (modalLocked) {
      syncCssVars();
      notify();
      return;
    }
    const visibleHeight = getVisibleWindowHeight();
    if (
      visibleHeight >= MIN_VISIBLE_HEIGHT &&
      visibleHeight + 2 < capturedVisibleHeight
    ) {
      capturedVisibleHeight = visibleHeight;
      syncCssVars();
      notify();
    }
  };

  window.addEventListener('resize', syncVisibleViewport);

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncVisibleViewport);
    window.visualViewport.addEventListener('scroll', () => {
      if (modalLocked) {
        syncCssVars();
        notify();
      }
    });
  }
}

function isCoveringBrowserViewport() {
  if (!modalLocked || typeof window === 'undefined') return false;
  // Parent has promoted the iframe to the browser window, so innerHeight is
  // no longer the stretched content height.
  return lastUnlockedContentHeight > 0 && window.innerHeight + 50 < lastUnlockedContentHeight;
}

function getVisibleWindowHeight() {
  if (typeof window === 'undefined') return 0;

  const inner = window.innerHeight || 0;
  const visual = window.visualViewport;

  if (visual && Number.isFinite(visual.height) && visual.height >= 200) {
    return Math.round(inner > 0 ? Math.min(inner, visual.height) : visual.height);
  }

  const outer = typeof window.outerHeight === 'number' ? window.outerHeight : 0;
  const screenHeight =
    typeof window.screen === 'object' && window.screen
      ? window.screen.height || 0
      : 0;

  if (inner >= MIN_VISIBLE_HEIGHT) return inner;
  if (outer >= MIN_VISIBLE_HEIGHT) return outer;
  return Math.max(screenHeight, MIN_VISIBLE_HEIGHT);
}

export function getEmbedViewportHeight() {
  if (typeof window === 'undefined') return 0;
  if (!isEmbeddedInIframe()) return getVisibleWindowHeight();
  if (isCoveringBrowserViewport()) return getVisibleWindowHeight();

  const fallback = getVisibleWindowHeight();
  return capturedVisibleHeight >= MIN_VISIBLE_HEIGHT
    ? capturedVisibleHeight
    : fallback;
}

export function getEmbedViewportOffsetTop() {
  if (!isEmbeddedInIframe()) return 0;
  if (isCoveringBrowserViewport()) return 0;
  return offsetTop;
}

export function onEmbedViewportChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

let embedAnalyticsDataReady = false;

export function markEmbedAnalyticsDataReady() {
  embedAnalyticsDataReady = true;
  if (typeof reportHeightFn === 'function' && !modalLocked) {
    reportHeightFn();
  }
}

export function isEmbedAnalyticsDataReady() {
  return embedAnalyticsDataReady;
}

export function registerEmbedHeightReporter(fn) {
  reportHeightFn = typeof fn === 'function' ? fn : null;
}

export function isEmbedModalLocked() {
  return modalLocked;
}

/**
 * Parent WordPress owns page scroll. When a modal opens we:
 * 1. Ask the parent to promote the iframe over the browser window
 * 2. Freeze parent overflow
 *
 * Height is not reported while the modal is open — the parent owns iframe size
 * for the overlay. On close we send the cached full content height so the
 * iframe can return to the dashboard.
 *
 * Do not remeasure to update that cache while a modal is open or just closing.
 * The Trend popup is teleported onto body and can sit in document flow for a
 * frame, which would permanently inflate the restore height.
 */
export function setEmbedModalLock(locked) {
  const next = !!locked;
  if (modalLocked === next) return;

  unlockReportToken += 1;
  const token = unlockReportToken;

  if (next) {
    restoreCachedHeightOnly = true;
    modalLocked = true;
  } else {
    modalLocked = false;
  }

  if (typeof document !== 'undefined') {
    document.documentElement.toggleAttribute('data-embed-modal-open', modalLocked);
  }

  modalListeners.forEach((fn) => {
    try {
      fn(modalLocked);
    } catch {
      // Ignore subscriber errors so one overlay cannot break others.
    }
  });

  syncCssVars();
  notify();

  if (typeof reportHeightFn !== 'function') return;

  reportHeightFn();

  if (!next) {
    const reportRestoredHeight = () => {
      if (token === unlockReportToken && !modalLocked) reportHeightFn();
    };
    requestAnimationFrame(reportRestoredHeight);
    window.setTimeout(reportRestoredHeight, 50);
    window.setTimeout(() => {
      if (token !== unlockReportToken || modalLocked) return;
      restoreCachedHeightOnly = false;
      // Accept a smaller #app measurement so a leftover overlay/chart
      // cannot permanently inflate the WordPress iframe.
      acceptMeasuredHeightOnce = true;
      reportHeightFn();
      acceptMeasuredHeightOnce = false;
    }, 250);
  }
}

export function onEmbedModalLockChange(fn) {
  modalListeners.add(fn);
  return () => modalListeners.delete(fn);
}

function isStretchBox(el, style) {
  if (
    el.classList.contains('min-h-screen')
    || el.classList.contains('embed-boot-skeleton')
    || el.tagName === 'MAIN'
  ) {
    return true;
  }

  const grow = parseFloat(style.flexGrow);
  if (Number.isFinite(grow) && grow > 0) return true;

  const minHeight = style.minHeight;
  const height = style.height;
  if (
    minHeight === '100vh'
    || minHeight === '100dvh'
    || minHeight === '100svh'
    || minHeight === '100%'
    || height === '100vh'
    || height === '100%'
  ) {
    return true;
  }

  const px = parseFloat(minHeight);
  const viewport = getEmbedViewportHeight() || window.innerHeight;
  return Number.isFinite(px) && viewport >= 200 && Math.abs(px - viewport) <= 2;
}

/**
 * Intrinsic dashboard height. Ignores min-h-screen / 100vh wrappers and
 * teleported overlays so the first WordPress iframe size is content, not
 * one extra viewport of empty space.
 */
export function measureEmbedContentHeight() {
  if (typeof document === 'undefined') return 0;

  const app = document.getElementById('app');
  if (!app) return 0;

  const marked = document.querySelector('[data-analytics-embed-content]');
  if (marked && marked.offsetParent !== null) {
    const top = app.getBoundingClientRect().top;
    const bottom = marked.getBoundingClientRect().bottom;
    return Math.max(0, Math.ceil(bottom - top + 8));
  }

  const scrollY = window.scrollY || window.pageYOffset || 0;
  const appTop = app.getBoundingClientRect().top + scrollY;
  let maxBottom = appTop;

  const shouldSkip = (el) => {
    if (!el || el.nodeType !== 1) return true;
    if (el.hasAttribute('data-popup-overlay') || el.hasAttribute('hidden')) {
      return true;
    }
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return true;
    if (style.position === 'fixed') return true;
    return false;
  };

  const visit = (el) => {
    if (shouldSkip(el)) return;

    const style = window.getComputedStyle(el);
    if (!isStretchBox(el, style)) {
      const bottom = el.getBoundingClientRect().bottom + scrollY;
      if (bottom > maxBottom) maxBottom = bottom;
    }

    for (let i = 0; i < el.children.length; i += 1) {
      visit(el.children[i]);
    }
  };

  visit(app);

  const paddingBottom = parseFloat(window.getComputedStyle(app).paddingBottom) || 0;
  return Math.max(0, Math.ceil(maxBottom - appTop + paddingBottom));
}

export function getEmbedReportedHeight(contentHeight) {
  const measured = Number(contentHeight);
  const safeContent = Number.isFinite(measured) ? Math.ceil(measured) : 0;
  const floor = 200;

  if (modalLocked) {
    return Math.max(getEmbedViewportHeight(), floor);
  }

  if (restoreCachedHeightOnly) {
    return Math.max(lastUnlockedContentHeight, getEmbedViewportHeight(), floor);
  }

  if (safeContent < floor) {
    return Math.max(lastUnlockedContentHeight, floor);
  }

  const marked = typeof document !== 'undefined'
    && document.querySelector('[data-analytics-embed-content]');

  // Marked analytics content is the real card stack. Always accept shrink
  // so a stretched main/flex-1 cannot lock in extra iframe space.
  if (
    marked
    || acceptMeasuredHeightOnce
    || lastUnlockedContentHeight === 0
    || safeContent >= lastUnlockedContentHeight
  ) {
    lastUnlockedContentHeight = safeContent;
    pendingSmallerHeight = 0;
    pendingSmallerCount = 0;
    return lastUnlockedContentHeight;
  }

  if (Math.abs(safeContent - pendingSmallerHeight) <= 8) {
    pendingSmallerCount += 1;
  } else {
    pendingSmallerHeight = safeContent;
    pendingSmallerCount = 1;
  }

  if (pendingSmallerCount >= 2) {
    lastUnlockedContentHeight = safeContent;
    pendingSmallerHeight = 0;
    pendingSmallerCount = 0;
  }

  return Math.max(lastUnlockedContentHeight, floor);
}

function syncCssVars() {
  if (typeof document === 'undefined') return;
  document.documentElement.style.setProperty(
    '--embed-viewport-height',
    `${getEmbedViewportHeight()}px`,
  );
  document.documentElement.style.setProperty(
    '--embed-viewport-offset-top',
    `${getEmbedViewportOffsetTop()}px`,
  );
}

function notify() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // Ignore subscriber errors so one overlay cannot break others.
    }
  });
}
