import { ref, computed, onMounted } from 'vue';
import { getAssetUrl, getAssetUrlSync } from '@/systems/assets/assetLibrary.js';
import { getBundledAssetMap } from '@/systems/assets/assetMapSource.js';

/** Asset map flags for TierCard (resolved via useTierCardAssets). */
const TIER_CARD_ASSET_FLAGS = {
  video: 'tierCard.icon.video',
  images: 'tierCard.icon.images',
  audio: 'tierCard.icon.audio',
  flash: 'tierCard.icon.flash',
  doubleArrows: 'tierCard.icon.doubleArrows',
  takeCoin: 'tierCard.icon.takeCoin',
  cart: 'tierCard.icon.cart',
  image: 'tierCard.icon.image',
  tooltip: 'tierCard.icon.tooltip',
  hot: 'tierCard.icon.hot',
};

const bundledProduction = getBundledAssetMap().production || {};

function resolveBundledFlag(flag) {
  return bundledProduction[flag] || '';
}

const assetsVersion = ref(0);
let warmPromise = null;

function warmAllAssets() {
  if (!warmPromise) {
    warmPromise = Promise.all(
      Object.values(TIER_CARD_ASSET_FLAGS).map((flag) => getAssetUrl(flag).catch(() => null)),
    ).then(() => {
      assetsVersion.value += 1;
    });
  }
  return warmPromise;
}

export function useTierCardAssets() {
  const assets = computed(() => {
    void assetsVersion.value;
    const resolved = {};
    for (const [key, flag] of Object.entries(TIER_CARD_ASSET_FLAGS)) {
      resolved[key] = getAssetUrlSync(flag) || resolveBundledFlag(flag) || '';
    }
    return resolved;
  });
  

  onMounted(() => {
    warmAllAssets();
  });

  warmAllAssets();

  return { assets };
}
