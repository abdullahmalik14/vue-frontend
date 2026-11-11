import { ref, computed, onMounted } from 'vue';
import { getAssetUrl, getAssetUrlSync } from '@/systems/assets/assetLibrary.js';
import { getBundledAssetMap } from '@/systems/assets/assetMapSource.js';

/** Asset map flags for order UI (resolved via useOrdersAssets). */
const ORDERS_ASSET_FLAGS = {
  dropdown: 'icon.orders.dropdown',
  search: 'icon.search',
  stars: 'orders.icon.stars',
  location: 'orders.icon.location',
  cart: 'orders.icon.cart',
  merch: 'orders.icon.merch',
  enterInput: 'orders.icon.enterInput',
  upload: 'orders.icon.upload',
  close: 'orders.icon.close',
  trash: 'orders.icon.trash',
  users: 'orders.icon.users',
  locationPin: 'orders.icon.locationPin',
  filesGreen: 'orders.icon.filesGreen',
  editPen: 'orders.icon.editPen',
  logoGreen: 'orders.icon.logoGreen',
  tagGreen: 'orders.icon.tagGreen',
  avatar: 'orders.demo.avatar',
};

/** Maps order type to an asset flag for the table row icon. */
const ORDER_TYPE_ASSET_FLAG_BY_TYPE = {
  subscription: ORDERS_ASSET_FLAGS.cart,
  p2v: ORDERS_ASSET_FLAGS.merch,
  merch: ORDERS_ASSET_FLAGS.merch,
  mix: ORDERS_ASSET_FLAGS.merch,
};

export function resolveOrderTypeAssetFlag(orderType) {
  const normalized = String(orderType || 'merch').toLowerCase();
  return ORDER_TYPE_ASSET_FLAG_BY_TYPE[normalized] || ORDERS_ASSET_FLAGS.merch;
}

const bundledProduction = getBundledAssetMap().production || {};

function resolveBundledFlag(flag) {
  return bundledProduction[flag] || '';
}

const assetsVersion = ref(0);
let warmPromise = null;

function warmAllAssets() {
  if (!warmPromise) {
    warmPromise = Promise.all(
      Object.values(ORDERS_ASSET_FLAGS).map((flag) => getAssetUrl(flag).catch(() => null)),
    ).then(() => {
      assetsVersion.value += 1;
    });
  }
  return warmPromise;
}

export function useOrdersAssets() {
  const assets = computed(() => {
    void assetsVersion.value;
    const resolved = {};
    for (const [key, flag] of Object.entries(ORDERS_ASSET_FLAGS)) {
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
