import { ref, computed, onMounted } from 'vue';
import { getAssetUrl, getAssetUrlSync } from '@/systems/assets/assetLibrary.js';
import { getBundledAssetMap } from '@/systems/assets/assetMapSource.js';

const ASSET_FLAGS = {
  featuredMediaBg: 'checkout.demo.featuredMediaBg',
  creatorAvatar: 'checkout.demo.creatorAvatar',
  profileSlideinBg: 'checkout.demo.profileSlideinBg',
  planLogo: 'checkout.demo.planLogo',
  planLogoNoBg: 'checkout.demo.planLogoNoBg',
  communicationIcon: 'checkout.icon.communication',
  generalIcon: 'checkout.icon.general',
  paymentIcon: 'checkout.icon.payment',
  mailIcon: 'checkout.icon.mail',
  cardBg: 'checkout.demo.cardBg',
  trashIcon: 'checkout.demo.trashIcon',
  trashBin: 'checkout.demo.trashBin',
  visaLogo: 'checkbox.demo.visaLogo',
  calendarIcon: 'checkout.demo.calendarIcon',
  chevronLeft: 'icon.notification.chevronLeft',
  chevronArrows: 'checkout.demo.chevronArrows',
  verifiedTick: 'icon.media.verified',
  closeIcon: 'icon.notification.close',
  financeIcon: 'checkout.demo.financeIcon',
  faceSmile: 'checkout.demo.faceSmile',
  addressIcon: 'checkout.demo.addressIcon',
  alertIcon: 'icon.notification.alertIcon',
};

const bundledMap = getBundledAssetMap();

const EXTERNAL_FALLBACKS = {
  featuredMediaBg: "https://i.ibb.co.com/70sHrpv/featured-media-bg.webp",
  creatorAvatar: "https://i.ibb.co.com/67B4Cz6d/Frame-1410098582.webp",
  profileSlideinBg: "https://i.ibb.co.com/LXPfFX03/profile-slidein-bg.webp",
  planLogo: "https://i.ibb.co.com/p6RVnpkx/logo-1.webp",
  planLogoNoBg: "https://i.ibb.co.com/p6RVnpkx/logo-1.webp",
  paymentIcon: "https://i.ibb.co.com/m5nstLw2/svgviewer-png-output-30.png",
  mailIcon: "https://i.ibb.co.com/XfdvLvLC/mail.webp",
  generalIcon: "https://i.ibb.co.com/xSK3W1w6/General.webp",
  financeIcon: "/dev/cdn/remote/638d9e2ec2-Finance-e-Commerce.webp",
  faceSmile: "/dev/cdn/remote/79c6b2c799-face-smile.webp",
  trashIcon: "/dev/cdn/remote/75e5b5aba1-trash-03.webp",
  trashBin: "/dev/cdn/remote/7b921e5623-trash-bin.webp",
  cardBg: "/dev/cdn/remote/becf3acc56-card-bg.webp",
  addressIcon: "/dev/cdn/remote/b75966c1f6-svgviewer-png-output-33.png",
  verifiedTick: "/dev/cdn/remote/241c87a6ab-tick-mark.webp",
  closeIcon: "https://i.ibb.co.com/bMbk5v87/x-close.webp",
  chevronLeft: "https://i.ibb.co.com/Gvkq58F5/chevron-left.webp",
  alertIcon: "https://i.ibb.co.com/yBMzbHWz/alert-circle.webp",
};

function resolveBundledFlag(flag) {
  return bundledMap.production?.[flag] || bundledMap.development?.[flag] || "";
}

const assetsVersion = ref(0);
let warmPromise = null;

function warmAllAssets() {
  if (!warmPromise) {
    warmPromise = Promise.all(
      Object.values(ASSET_FLAGS).map((flag) => getAssetUrl(flag).catch(() => null)),
    ).then(() => {
      assetsVersion.value += 1;
    });
  }
  return warmPromise;
}

export function useCheckoutDemoAssets() {
  const assets = computed(() => {
    void assetsVersion.value;
    const resolved = {};
    for (const [key, flag] of Object.entries(ASSET_FLAGS)) {
      resolved[key] =
        getAssetUrlSync(flag) ||
        resolveBundledFlag(flag) ||
        EXTERNAL_FALLBACKS[key] ||
        "";
    }
    return resolved;
  });

  onMounted(() => {
    warmAllAssets();
  });

  warmAllAssets();

  return { assets };
}
