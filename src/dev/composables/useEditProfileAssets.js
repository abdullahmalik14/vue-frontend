import { ref, computed, onMounted } from 'vue';
import { getAssetUrl, getAssetUrlSync } from '@/systems/assets/assetLibrary.js';
import { getBundledAssetMap } from '@/systems/assets/assetMapSource.js';

/**
 * Exact pre-audit Edit Profile icons (original ibb sources → /dev/cdn/remote).
 * Hard path fallbacks guarantee images still render if sync resolve misses.
 */
const EDIT_PROFILE_ASSET_FLAGS = {
  smileyFace: 'editProfile.icon.smiley',
  infoSquare: 'editProfile.icon.infoSquare',
  language: 'editProfile.icon.language',
  notification: 'editProfile.icon.notification',
  avatar: 'editProfile.icon.avatarChrome',
  hamburger: 'editProfile.icon.hamburger',
  edit: 'editProfile.icon.edit',
  chevronDown: 'editProfile.icon.chevronDown',
  galleryEmpty: 'editProfile.icon.galleryEmpty',
  galleryStaged: 'editProfile.icon.galleryStaged',
  galleryMenu: 'editProfile.icon.galleryMenu',
  video: 'editProfile.icon.videoStaged',
  videoTag: 'editProfile.icon.videoTag',
  close: 'editProfile.icon.xClose',
  upload: 'editProfile.icon.upload01',
  uploadDraft: 'editProfile.icon.upload03',
  minusSquare: 'editProfile.icon.minusSquare',
  closeButton: 'editProfile.icon.closeButton',
  tooltip: 'editProfile.icon.tooltip',
  fullscreen: 'editProfile.icon.fullscreen',
  featuredMediaBg: 'editProfile.icon.featuredBg',
  verifiedTick: 'editProfile.icon.verifiedTick',
  previewFallback: 'editProfile.icon.previewFallback',
  imageTag: 'editProfile.icon.image03',
  playIconBig: 'editProfile.icon.playBig',
  alertTriangle: 'editProfile.icon.alertTriangle',
  tickMark: 'editProfile.icon.tickMark',
  closeBtn: 'editProfile.icon.closeBtn',
  reflect: 'editProfile.icon.reflect',
  zoomOut: 'editProfile.icon.zoomOut',
  zoomIn: 'editProfile.icon.zoomIn',
  refresh: 'editProfile.icon.refresh',
  avatar1: 'editProfile.avatar.preset1',
  avatar2: 'editProfile.avatar.preset2',
  avatar3: 'editProfile.avatar.preset3',
  avatar4: 'editProfile.avatar.preset4',
  avatar5: 'editProfile.avatar.preset5',
};

/** Same-to-same CDN paths for every key (never leave src empty). */
const EDIT_PROFILE_PATH_FALLBACKS = {
  smileyFace: '/dev/cdn/remote/editProfile-smiley.webp',
  infoSquare: '/dev/cdn/remote/editProfile-info-square.webp',
  language: '/dev/cdn/remote/editProfile-language.webp',
  notification: '/dev/cdn/remote/editProfile-notification.webp',
  avatar: '/dev/cdn/remote/editProfile-avatar-chrome.webp',
  hamburger: '/dev/cdn/remote/editProfile-hamburger.webp',
  edit: '/dev/cdn/remote/editProfile-edit.webp',
  chevronDown: '/dev/cdn/remote/editProfile-chevron-down.webp',
  galleryEmpty: '/dev/cdn/remote/editProfile-images-empty.webp',
  galleryStaged: '/dev/cdn/remote/editProfile-images-staged.webp',
  galleryMenu: '/dev/cdn/remote/editProfile-images-menu.webp',
  video: '/dev/cdn/remote/editProfile-video-staged.webp',
  videoTag: '/dev/cdn/remote/editProfile-video-tag.webp',
  close: '/dev/cdn/remote/editProfile-x-close.webp',
  upload: '/dev/cdn/remote/editProfile-upload-01.webp',
  uploadDraft: '/dev/cdn/remote/editProfile-upload-03.webp',
  minusSquare: '/dev/cdn/remote/editProfile-minus-square.webp',
  closeButton: '/dev/cdn/remote/editProfile-close-button.webp',
  tooltip: '/dev/cdn/remote/editProfile-tooltip.webp',
  fullscreen: '/dev/cdn/remote/editProfile-fullscreen.webp',
  featuredMediaBg: '/dev/cdn/remote/editProfile-featured-bg.webp',
  verifiedTick: '/dev/cdn/remote/editProfile-verified-tick.webp',
  previewFallback: '/dev/cdn/remote/editProfile-preview-fallback.webp',
  imageTag: '/dev/cdn/remote/editProfile-image-03.webp',
  playIconBig: '/dev/cdn/remote/editProfile-play-big.webp',
  alertTriangle: '/dev/cdn/remote/editProfile-alert-triangle.webp',
  tickMark: '/dev/cdn/remote/editProfile-tick-mark.webp',
  closeBtn: '/dev/cdn/remote/editProfile-close-btn.webp',
  reflect: '/dev/cdn/remote/editProfile-reflect.webp',
  zoomOut: '/dev/cdn/remote/editProfile-zoom-out.webp',
  zoomIn: '/dev/cdn/remote/editProfile-zoom-in.webp',
  refresh: '/dev/cdn/remote/editProfile-refresh.webp',
  avatar1: '/dev/cdn/remote/editProfile-avatar-1.webp',
  avatar2: '/dev/cdn/remote/editProfile-avatar-2.webp',
  avatar3: '/dev/cdn/remote/editProfile-avatar-3.webp',
  avatar4: '/dev/cdn/remote/editProfile-avatar-4.webp',
  avatar5: '/dev/cdn/remote/editProfile-avatar-5.webp',
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
      Object.values(EDIT_PROFILE_ASSET_FLAGS).map((flag) => getAssetUrl(flag).catch(() => null)),
    ).then(() => {
      assetsVersion.value += 1;
    });
  }
  return warmPromise;
}

export function useEditProfileAssets() {
  const assets = computed(() => {
    void assetsVersion.value;
    const resolved = {};
    for (const [key, flag] of Object.entries(EDIT_PROFILE_ASSET_FLAGS)) {
      resolved[key] =
        getAssetUrlSync(flag) ||
        resolveBundledFlag(flag) ||
        EDIT_PROFILE_PATH_FALLBACKS[key] ||
        '';
    }
    return resolved;
  });

  onMounted(() => {
    warmAllAssets();
  });

  warmAllAssets();

  return { assets, EDIT_PROFILE_ASSET_FLAGS };
}
