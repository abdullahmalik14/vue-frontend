import { ref, computed, onMounted } from 'vue';
import { getAssetUrl, getAssetUrlSync } from '@/systems/assets/assetLibrary.js';
import { getBundledAssetMap } from '@/systems/assets/assetMapSource.js';

export const XREPOST_ASSET_FLAGS = {
  profile: 'xrepost.icon.profile',
  subscription: 'xrepost.icon.subscription',
  media: 'xrepost.icon.media',
  merch: 'xrepost.icon.merch',
  customRequest: 'xrepost.icon.customRequest',
  livestream: 'xrepost.icon.livestream',
  privateChat: 'xrepost.icon.privateChat',
  videoCall: 'xrepost.icon.videoCall',
  audioCall: 'xrepost.icon.audioCall',
  salesUsd: 'xrepost.icon.salesUsd',
  salesQty: 'xrepost.icon.salesQty',
  merchLikes: 'xrepost.icon.likes',
  likes: 'xrepost.icon.likes',
  views: 'xrepost.icon.views',
  metricEye: 'xrepost.icon.metricEye',
  metricUser: 'xrepost.icon.metricUser',
  user: 'xrepost.icon.user',
  file: 'xrepost.icon.file',
  clock: 'xrepost.icon.clock',
  gift: 'xrepost.icon.gift',
  goingLive: 'xrepost.icon.goingLive',
  tip: 'xrepost.icon.tip',
  cashGift: 'xrepost.icon.cashGift',
  salesCart: 'xrepost.icon.salesCart',
  followers: 'xrepost.icon.user',
  profileVisits: 'xrepost.icon.views',
  newSubs: 'xrepost.icon.subscription',
  requests: 'xrepost.icon.customRequest',
  viewers: 'xrepost.icon.livestream',
  messages: 'xrepost.icon.privateChat',
  calls: 'xrepost.icon.videoCall',
  earnings: 'xrepost.icon.salesUsd',
  arrow: 'xrepost.icon.arrow',
  mobileBack: 'xrepost.icon.mobileBack',
  chevron: 'xrepost.icon.chevron',
  trash: 'xrepost.icon.trash',
  toastUpload: 'xrepost.icon.toastUpload',
  toastSuccess: 'xrepost.icon.toastSuccess',
  more: 'icon.media.threeDotsVertical',
  discard: 'xrepost.icon.discard',
  previewEye: 'icon.media.eye',
  help: 'payout.icon.helpCircle',
  close: 'editProfile.icon.xClose',
  verifiedTick: 'editProfile.icon.verifiedTick',
  uploadDraft: 'plan.icon.uploadDraft',
  checkCircle: 'payout.icon.checkCircle',
  savePost: 'xrepost.icon.savePost',
  editDraft: 'editProfile.icon.edit',
  imageTag: 'editProfile.icon.image03',
  previewAvatar: 'editProfile.icon.avatarChrome',
  previewLike: 'xrepost.icon.previewLike',
  previewComment: 'xrepost.icon.previewComment',
  previewRepost: 'xrepost.icon.previewRepost',
  previewShare: 'xrepost.icon.previewShare',
  previewAnalytics: 'xrepost.icon.previewAnalytics',
  mediaModeTopSelling: 'xrepost.icon.mediaModeTopSelling',
  mediaModeUpload: 'xrepost.icon.mediaModeUpload',
  mediaModeNone: 'xrepost.icon.mediaModeNone',
  previewClose: 'xrepost.icon.previewClose',
};

const ASSET_FALLBACKS = {
  profile: '/dev/cdn/x-repost/profile.svg',
  subscription: '/dev/cdn/x-repost/subscription.svg',
  media: '/dev/cdn/x-repost/media.svg',
  merch: '/dev/cdn/x-repost/merch.svg',
  customRequest: '/dev/cdn/x-repost/custom-request.svg',
  livestream: '/dev/cdn/x-repost/livestream.svg',
  privateChat: '/dev/cdn/x-repost/private-chat.svg',
  videoCall: '/dev/cdn/x-repost/video-call.svg',
  audioCall: '/dev/cdn/x-repost/audio-call.svg',
  salesUsd: '/dev/cdn/x-repost/sales-usd.svg',
  salesQty: '/dev/cdn/x-repost/sales-qty.svg',
  merchLikes: '/dev/cdn/x-repost/likes.svg',
  likes: '/dev/cdn/x-repost/likes.svg',
  views: '/dev/cdn/x-repost/views.svg',
  metricEye: '/dev/cdn/x-repost/metric-eye.png',
  metricUser: '/dev/cdn/x-repost/metric-user.png',
  user: '/dev/cdn/x-repost/user.svg',
  file: '/dev/cdn/x-repost/file.svg',
  clock: '/dev/cdn/x-repost/clock.svg',
  gift: '/dev/cdn/x-repost/gift.svg',
  goingLive: '/dev/cdn/x-repost/going-live.png',
  tip: '/dev/cdn/x-repost/tip.png',
  cashGift: '/dev/cdn/x-repost/cash-gift.png',
  salesCart: '/dev/cdn/x-repost/sales-cart.png',
  followers: '/dev/cdn/x-repost/metric-user.png',
  profileVisits: '/dev/cdn/x-repost/metric-eye.png',
  newSubs: '/dev/cdn/x-repost/subscription.svg',
  requests: '/dev/cdn/x-repost/custom-request.svg',
  viewers: '/dev/cdn/x-repost/livestream.svg',
  messages: '/dev/cdn/x-repost/private-chat.svg',
  calls: '/dev/cdn/x-repost/video-call.svg',
  earnings: '/dev/cdn/x-repost/sales-usd.svg',
  arrow: '/dev/cdn/x-repost/arrow.svg',
  mobileBack: '/dev/cdn/x-repost/mobile-back.png',
  chevron: '/dev/cdn/x-repost/dropdown-chevron.png',
  trash: '/images/x-repost-delete.png',
  toastUpload: '/images/x-repost-toast-upload.png',
  toastSuccess: '/images/x-repost-toast-success.png',
  more: '/images/x-repost-more-menu.png',
  discard: '/images/x-repost-discard.svg',
  previewEye: '/images/x-repost-preview-post.png',
  close: '/dev/cdn/remote/editProfile-x-close.webp',
  verifiedTick: '/dev/cdn/remote/editProfile-verified-tick.webp',
  uploadDraft: '/dev/cdn/remote/JWNPWKRW-upload-02.webp',
  checkCircle: '/dev/cdn/remote/dJkc0WbZ-check-circle.webp',
  savePost: '/images/x-repost-save-post.png',
  editDraft: '/dev/cdn/remote/editProfile-edit.webp',
  imageTag: '/dev/cdn/remote/editProfile-image-03.webp',
  previewAvatar: '/dev/cdn/remote/editProfile-avatar-chrome.webp',
  previewLike: '/images/x-repost-preview-like.png',
  previewComment: '/images/x-repost-preview-comment.png',
  previewRepost: '/images/x-repost-preview-repost.png',
  previewShare: '/images/x-repost-preview-share.png',
  previewAnalytics: '/images/x-repost-preview-analytics.png',
  mediaModeTopSelling: '/images/x-repost-media-trophy.png',
  mediaModeUpload: '/images/x-repost-media-upload.png',
  mediaModeNone: '/images/x-repost-media-none.png',
  previewClose: '/images/x-repost-preview-close.png',
};

const bundledProduction = getBundledAssetMap().production || {};
const assetsVersion = ref(0);
let warmPromise = null;

function resolveBundledFlag(flag) {
  return bundledProduction[flag] || '';
}

function warmAllAssets() {
  if (!warmPromise) {
    warmPromise = Promise.all(
      [...new Set(Object.values(XREPOST_ASSET_FLAGS))].map((flag) =>
        getAssetUrl(flag).catch(() => null),
      ),
    ).then(() => {
      assetsVersion.value += 1;
    });
  }
  return warmPromise;
}

export function useXRepostAssets() {
  const assets = computed(() => {
    void assetsVersion.value;
    const resolved = {};
    for (const [key, flag] of Object.entries(XREPOST_ASSET_FLAGS)) {
      if (
        key === 'more'
        || key === 'previewEye'
        || key === 'trash'
        || key === 'toastUpload'
        || key === 'toastSuccess'
        || key === 'discard'
        || key === 'previewLike'
        || key === 'previewComment'
        || key === 'previewRepost'
        || key === 'previewShare'
        || key === 'previewAnalytics'
        || key === 'savePost'
        || key === 'mediaModeTopSelling'
        || key === 'mediaModeUpload'
        || key === 'mediaModeNone'
        || key === 'previewClose'
      ) {
        resolved[key] = ASSET_FALLBACKS[key] || '';
        continue;
      }
      resolved[key] =
        getAssetUrlSync(flag) || resolveBundledFlag(flag) || ASSET_FALLBACKS[key] || '';
    }
    return resolved;
  });

  onMounted(() => {
    warmAllAssets();
  });

  warmAllAssets();

  return { assets };
}
