import { ref, computed, onMounted } from 'vue';
import { getAssetUrl, getAssetUrlSync } from '@/systems/assets/assetLibrary.js';
import { getBundledAssetMap } from '@/systems/assets/assetMapSource.js';

/** Asset map flags for payout UI (resolved via usePayoutAssets). */
const PAYOUT_ASSET_FLAGS = {
  mobileGradient: 'payout.bg.mobileGradient',
  headerGradient: 'payout.bg.headerGradient',
  desktopFansocial: 'payout.bg.desktopFansocial',
  mobileFansocial: 'payout.bg.mobileFansocial',
  popupGradient: 'payout.bg.popupGradient',
  cardGradientBg: 'payout.card.gradientBg',
  cardGradientBgMobile: 'payout.card.gradientBgMobile',
  cardLogo: 'payout.card.logo',
  cardUserAvatar: 'payout.card.userAvatar',
  cardUserInitialNoise: 'payout.card.userInitialNoise',
  creditCardDownload: 'payout.icon.creditCardDownload',
  eye: 'payout.icon.eye',
  download: 'payout.icon.download',
  history: 'payout.icon.history',
  globe1: 'payout.icon.globe1',
  alertBlack: 'payout.icon.alertBlack',
  arrowUpRight: 'payout.icon.arrowUpRight',
  ellipsis: 'payout.icon.ellipsis',
  search: 'payout.icon.search',
  loader: 'payout.icon.loader',
  token: 'payout.icon.token',
  close: 'payout.icon.close',
  closeAlt: 'payout.icon.closeAlt',
  currencyDollar: 'payout.icon.currencyDollar',
  avatar: 'payout.icon.avatar',
  premiumDesign1: 'payout.icon.premiumDesign1',
  premiumDesign2: 'payout.icon.premiumDesign2',
  premiumDesign3: 'payout.icon.premiumDesign3',
  premiumDesign4: 'payout.icon.premiumDesign4',
  settings: 'payout.icon.settings',
  settingsAlt: 'payout.icon.settingsAlt',
  settings02: 'payout.icon.settings02',
  plus: 'payout.icon.plus',
  delete: 'payout.icon.delete',
  edit: 'payout.icon.edit',
  globe: 'payout.icon.globe',
  arrowLongRight: 'payout.icon.arrowLongRight',
  bank: 'payout.icon.bank',
  chevronDown: 'payout.icon.chevronDown',
  plusSquare: 'payout.icon.plusSquare',
  crypto: 'payout.icon.crypto',
  autoCycle: 'payout.icon.autoCycle',
  addCard: 'payout.icon.addCard',
  chevronLeft: 'payout.icon.chevronLeft',
  chevronLeftAlt: 'payout.icon.chevronLeftAlt',
  down: 'payout.icon.down',
  helpCircle: 'payout.icon.helpCircle',
  arrowLeft: 'payout.icon.arrowLeft',
  tickMark: 'payout.icon.tickMark',
  clock: 'payout.icon.clock',
  arrowRight: 'payout.icon.arrowRight',
  alertOrange: 'payout.icon.alertOrange',
  xClose: 'payout.icon.xClose',
  arrows: 'payout.icon.arrows',
  checkCircle: 'payout.icon.checkCircle',
  payDeposited: 'payout.icon.payDeposited',
  searchIcon: 'payout.icon.searchIcon',
  bell: 'payout.icon.bell',
  calendarClock: 'payout.icon.calendarClock',
  lifeBuoy: 'payout.icon.lifeBuoy',
  chevronRight: 'payout.icon.chevronRight',
  walletCards: 'payout.icon.walletCards',
  uploadCloud: 'payout.icon.uploadCloud',
  personMark: 'payout.cosmo.personMark',
  cardChip: 'payout.cosmo.cardChip',
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
      Object.values(PAYOUT_ASSET_FLAGS).map((flag) => getAssetUrl(flag).catch(() => null)),
    ).then(() => {
      assetsVersion.value += 1;
    });
  }
  return warmPromise;
}

export function usePayoutAssets() {
  const assets = computed(() => {
    void assetsVersion.value;
    const resolved = {};
    for (const [key, flag] of Object.entries(PAYOUT_ASSET_FLAGS)) {
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
