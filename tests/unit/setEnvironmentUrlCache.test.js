import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

describe('setEnvironment URL cache invalidation (L-06)', () => {
  beforeEach(() => {
    vi.resetModules();
    setActivePinia(createPinia());
    window.performanceTracker = { step: vi.fn() };
  });

  it('clears all asset_url_* cache keys when environment changes', async () => {
    vi.stubEnv('PROD', 'true');
    vi.stubEnv('DEV', '');

    const { setValueWithExpiration, getValueFromCache } = await import(
      '../../src/utils/common/cacheHandler.js',
    );
    const { clearAssetCaches, setEnvironment, getAssetUrl } = await import(
      '../../src/utils/assets/assetLibrary.js',
    );

    clearAssetCaches();

    const flag = 'icon.cart';
    const devCacheKey = `asset_url_development_${flag}`;
    const prodCacheKey = `asset_url_production_${flag}`;
    const staleDevUrl = 'https://stale.example.com/dev-cart.svg';

    setValueWithExpiration(devCacheKey, staleDevUrl, 1_800_000);
    setValueWithExpiration(prodCacheKey, 'https://stale.example.com/prod-cart.svg', 1_800_000);

    expect(getValueFromCache(devCacheKey)).toBe(staleDevUrl);
    expect(getValueFromCache(prodCacheKey)).toBe('https://stale.example.com/prod-cart.svg');

    setEnvironment('production');

    expect(getValueFromCache(devCacheKey)).toBeNull();
    expect(getValueFromCache(prodCacheKey)).toBeNull();

    const prodUrl = await getAssetUrl(flag, 'production');
    expect(prodUrl).toBe('/dev/cdn/placeholder/cart.svg');
    expect(prodUrl).not.toBe(staleDevUrl);
  });
});
