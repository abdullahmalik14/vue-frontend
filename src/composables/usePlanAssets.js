import { ref, computed, onMounted } from 'vue';
import { getAssetUrl, getAssetUrlSync } from '@/systems/assets/assetLibrary.js';
import { getBundledAssetMap } from '@/systems/assets/assetMapSource.js';

const PLAN_ASSET_FLAGS = {
  featuredMediaBg: 'plan.icon.featuredMediaBg',
  unionGreen: 'plan.icon.unionGreen',
  mobileGradientBg: 'plan.icon.mobileGradientBg',
  gradientBg: 'dashboard.bg.gradient',
  chevronLeft: 'plan.icon.chevronLeft',
  threeDots: 'plan.icon.threeDots',
  arrowLeft: 'plan.icon.arrowLeft',
  uploadDraft: 'plan.icon.uploadDraft',
  upload: 'plan.icon.upload',
  time: 'plan.icon.time',
  infoSquare: 'plan.icon.infoSquare',
  dollar: 'plan.icon.dollar',
  share: 'plan.icon.share',
  eye: 'plan.icon.eye',
  closeGreen: 'plan.icon.closeGreen',
  weather: 'plan.icon.weather',
  calendar: 'plan.icon.calendar',
  alarm: 'plan.icon.alarm',
  pen: 'plan.icon.pen',
  trash: 'plan.icon.trash',
  infinite: 'plan.icon.infinite',
  logoBg: 'plan.icon.logoBg',
  calendar01: 'plan.icon.calendar01',
  dollar01: 'plan.icon.dollar01',
  tooltip: 'mediaUploader.icon.tooltip',
  verifiedTick: 'plan.icon.verifiedTick',
  checkoutHeader: 'plan.icon.checkoutHeader',
  playIcon: 'plan.icon.playIcon',
  send: 'plan.icon.send',
  copy: 'plan.icon.copy',
  arrowsMask: 'plan.icon.arrowsMask',
  chevronDown: 'plan.icon.chevronDown',
  moneyCat: 'plan.icon.moneyCat',
  token: 'plan.icon.token',
  plusSquare: 'plan.icon.plusSquare',
  plusBlueSquare: 'plan.icon.plusBlueSquare',
  plusGreenSquare: 'plan.icon.plusGreenSquare',
  plusGreySquare: 'plan.icon.plusGreySquare',
  minusSquare: 'plan.icon.minusSquare',
  backgroundUpload: 'plan.icon.backgroundUpload',
  check: 'plan.icon.check',
  emptyKeyhole: 'plan.icon.emptyKeyhole',
  newTierPlus: 'plan.icon.newTierPlus',
  editDetails: 'plan.icon.editDetails',
  toastKeyhole: 'plan.icon.toastKeyhole',
  toastUploadCloud: 'plan.icon.toastUploadCloud',
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
      Object.values(PLAN_ASSET_FLAGS).map((flag) => getAssetUrl(flag).catch(() => null)),
    ).then(() => {
      assetsVersion.value += 1;
    });
  }
  return warmPromise;
}

export function usePlanAssets() {
  const assets = computed(() => {
    void assetsVersion.value;
    const resolved = {};
    for (const [key, flag] of Object.entries(PLAN_ASSET_FLAGS)) {
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
