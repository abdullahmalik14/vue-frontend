import { ref, computed, onMounted } from 'vue';
import { getAssetUrl, getAssetUrlSync } from '@/systems/assets/assetLibrary.js';
import { getBundledAssetMap } from '@/systems/assets/assetMapSource.js';

const SETTINGS_ASSET_FLAGS = {
  mobileGradientBg: 'plan.icon.mobileGradientBg',
  gradientBg: 'dashboard.bg.gradient',
  language: 'dashboard.language',
  notification: 'dashboard.notification',
  avatar: 'dashboard.avatar',
  hamburger: 'dashboard.hamburger',
  arrowBack: 'settings.icon.arrowBack',
  linkX: 'icon.social.x.logo',
  premiumStars: 'orders.icon.stars',
  premiumStar: 'icon.star',
  devicePower: 'settings.icon.devicePower',
  devicePhone: 'settings.icon.devicePhone',
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
      Object.values(SETTINGS_ASSET_FLAGS).map((flag) => getAssetUrl(flag).catch(() => null)),
    ).then(() => {
      assetsVersion.value += 1;
    });
  }
  return warmPromise;
}

export function useSettingsAssets() {
  const assets = computed(() => {
    void assetsVersion.value;
    const resolved = {};
    for (const [key, flag] of Object.entries(SETTINGS_ASSET_FLAGS)) {
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
