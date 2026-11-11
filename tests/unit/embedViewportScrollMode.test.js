import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  applyEmbedScrollMode,
  getEmbedScrollMode,
  isEmbedInternalScrollMode,
  registerEmbedHeightReporter,
} from '../../src/systems/embed/embedViewport.js';

describe('embedViewport scrollMode', () => {
  afterEach(() => {
    applyEmbedScrollMode('content-height');
    registerEmbedHeightReporter(null);
    document.documentElement.removeAttribute('data-embed-scrollable');
  });

  it('defaults to content-height without the scrollable attribute', () => {
    expect(getEmbedScrollMode()).toBe('content-height');
    expect(isEmbedInternalScrollMode()).toBe(false);
    expect(document.documentElement.hasAttribute('data-embed-scrollable')).toBe(false);
  });

  it('enables internal scrolling when WordPress sends scrollMode internal', () => {
    applyEmbedScrollMode('internal');

    expect(getEmbedScrollMode()).toBe('internal');
    expect(isEmbedInternalScrollMode()).toBe(true);
    expect(document.documentElement.hasAttribute('data-embed-scrollable')).toBe(true);
  });

  it('treats missing or unknown scrollMode as content-height', () => {
    applyEmbedScrollMode('internal');
    applyEmbedScrollMode(undefined);

    expect(getEmbedScrollMode()).toBe('content-height');
    expect(isEmbedInternalScrollMode()).toBe(false);
    expect(document.documentElement.hasAttribute('data-embed-scrollable')).toBe(false);
  });

  it('reports height once when leaving internal mode', () => {
    const reportHeight = vi.fn();
    registerEmbedHeightReporter(reportHeight);

    applyEmbedScrollMode('internal');
    expect(reportHeight).not.toHaveBeenCalled();

    applyEmbedScrollMode('content-height');
    expect(reportHeight).toHaveBeenCalledTimes(1);
  });
});
