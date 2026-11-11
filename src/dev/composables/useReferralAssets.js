import { ref, computed, onMounted } from 'vue';
import { getAssetUrl, getAssetUrlSync } from '@/systems/assets/assetLibrary.js';
import { getBundledAssetMap } from '@/systems/assets/assetMapSource.js';

const ASSET_FLAGS = {
  bannerPhoto: 'referral.banner.photo',
  bannerCut: 'referral.banner.cut',
  bannerUnion: 'referral.banner.union',
  copyIcon: 'referral.icon.copy',
  coinsIcon: 'referral.icon.coins',
  arrowUpRight: 'referral.icon.arrowUpRight',
  tableAvatar1: 'referral.table.avatar1',
  tableAvatar2: 'referral.table.avatar2',
  tableAvatar4: 'referral.table.avatar4',
  tableAvatarPlaceholder: 'referral.table.avatarPlaceholder',
  tableVerifiedTick: 'plan.icon.verifiedTick',
  tableStatusApproved: 'payout.icon.tickMark',
  tableStatusInvite: 'plan.icon.send',
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
      Object.values(ASSET_FLAGS).map((flag) => getAssetUrl(flag).catch(() => null)),
    ).then(() => {
      assetsVersion.value += 1;
    });
  }
  return warmPromise;
}

export function useReferralAssets() {
  const assets = computed(() => {
    void assetsVersion.value;
    const resolved = {};
    for (const [key, flag] of Object.entries(ASSET_FLAGS)) {
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
