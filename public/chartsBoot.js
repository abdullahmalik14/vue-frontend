/**
 * Chart bootstrap.
 *
 * Runs as a deferred script AFTER the AmCharts CDN files and
 * chartsUtilities / chartsCalculator / chartsHandler (all deferred, in
 * document order). Deferred scripts execute in order once parsing is done,
 * so `ChartsHandler` and `am5` exist here, while none of them block the
 * first paint of the page (the boot skeleton) any more.
 *
 * Do NOT turn this back into an inline `new ChartsHandler()` — inline
 * scripts ignore `defer` and would run before the class is defined.
 */
(function bootCharts() {
  if (typeof ChartsHandler !== 'function') {
    console.error('[chartsBoot] ChartsHandler is not defined; chart scripts did not load in order.');
    return;
  }

  try {
    window.chartsHandler = new ChartsHandler();
  } catch (error) {
    console.error('[chartsBoot] Failed to create ChartsHandler', error);
    return;
  }

  try {
    window.dispatchEvent(new CustomEvent('fansocial:charts-ready'));
  } catch (error) {
    // CustomEvent unsupported — nothing else depends on this signal.
  }
})();
