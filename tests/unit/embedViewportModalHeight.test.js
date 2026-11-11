import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getEmbedReportedHeight,
  setEmbedModalLock,
  registerEmbedHeightReporter,
  applyEmbedScrollMode,
} from '../../src/systems/embed/embedViewport.js';

describe('embedViewport modal height restore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    registerEmbedHeightReporter(null);
    applyEmbedScrollMode('content-height');
    document.documentElement.removeAttribute('data-embed-scrollable');
  });

  it('restores the pre-modal page height instead of an inflated overlay measurement', () => {
    expect(getEmbedReportedHeight(2377)).toBe(2377);

    let measure = 2377;
    const reported = [];
    registerEmbedHeightReporter(() => {
      reported.push(getEmbedReportedHeight(measure));
    });

    measure = 2893;
    setEmbedModalLock(true);

    const lockedHeight = Math.max(window.innerHeight || 0, 200);
    expect(reported.at(-1)).toBe(lockedHeight);
    expect(getEmbedReportedHeight(2893)).toBe(lockedHeight);

    setEmbedModalLock(false);
    expect(reported.at(-1)).toBe(2377);
    expect(getEmbedReportedHeight(2893)).toBe(2377);

    vi.advanceTimersByTime(50);
    expect(getEmbedReportedHeight(2893)).toBe(2377);

    measure = 2377;
    vi.advanceTimersByTime(200);
    expect(reported.at(-1)).toBe(2377);
    expect(getEmbedReportedHeight(2377)).toBe(2377);
  });
});
