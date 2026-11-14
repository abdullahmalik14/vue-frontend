import { computed } from 'vue';
import { createStepStateEngine, toPersistableState } from '@/utils/stateEngine';
import {
  deleteMerchGallery,
  galleryHasMedia,
  loadMerchGallery,
  saveMerchGallery,
} from '@/dev/composables/merchGalleryMediaStore.js';

/** Shared persisted merch library (create / edit survives refresh). */
let merchLibraryEngine = null;
let galleryRehydrateStarted = false;

const PERSIST_KEY = 'stateEngine:merchLibrary';
/** Keep thumbs under this size so localStorage quota does not wipe the library. */
const MAX_THUMB_CHARS = 350_000;

function readPersistedLibraryItems() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const items = parsed?.state?.items;
    return Array.isArray(items) ? items : [];
  } catch (err) {
    console.warn('[merchLibrary] persist read failed', err);
    return [];
  }
}

function ensureEngine() {
  if (merchLibraryEngine) return merchLibraryEngine;

  // persist: false — we own localStorage writes via persistLibraryItems (lean gallery).
  // Engine auto-persist would fight that and either blow quota or reload stripped media.
  merchLibraryEngine = createStepStateEngine({
    flowId: 'merchLibrary',
    urlSync: 'none',
    persist: false,
    initialStep: 1,
    defaults: {
      items: [],
    },
  });
  merchLibraryEngine.initialize({ fromUrl: false });
  const persisted = readPersistedLibraryItems();
  if (persisted.length) {
    merchLibraryEngine.setState('items', persisted);
  }
  return merchLibraryEngine;
}

function galleryThumb(item) {
  const gallery = Array.isArray(item?.galleryUploaded) ? item.galleryUploaded : [];
  const first = gallery[0];
  return (
    first?.dataUrl
    || first?.objectUrl
    || item?.thumbnail
    || ''
  );
}

function clipThumb(value) {
  if (typeof value !== 'string' || !value) return '';
  return value.length > MAX_THUMB_CHARS ? '' : value;
}

/** Drop heavy gallery payloads for disk only; keep card list + one small thumb when possible. */
function leanLibraryItem(item, { keepThumb = true } = {}) {
  const gallery = Array.isArray(item?.galleryUploaded) ? item.galleryUploaded : [];
  const leanGallery = gallery.map((entry) => ({
    id: entry?.id,
    name: entry?.name || '',
    dataUrl: '',
    objectUrl: '',
  }));
  const thumb = keepThumb
    ? clipThumb(item?.thumbnail || gallery[0]?.dataUrl || gallery[0]?.objectUrl || '')
    : '';
  return {
    ...item,
    galleryUploaded: leanGallery,
    thumbnail: thumb,
  };
}

/**
 * Persist library to localStorage with quota fallbacks.
 * Returns what was written to disk (may be leaner than memory).
 * Callers must NOT replace in-memory gallery with a lean disk snapshot —
 * that was stripping all images down to a single thumb in the UI.
 */
function persistLibraryItems(items) {
  if (typeof localStorage === 'undefined') return null;

  const attempts = [
    items,
    items.map((item) => leanLibraryItem(item, { keepThumb: true })),
    items.map((item) => leanLibraryItem(item, { keepThumb: false })),
  ];

  for (const attempt of attempts) {
    const safeItems = toPersistableState(attempt) || [];
    const payload = JSON.stringify({
      step: 1,
      substep: null,
      state: { items: safeItems },
    });
    try {
      localStorage.setItem(PERSIST_KEY, payload);
      return safeItems;
    } catch (err) {
      console.warn('[merchLibrary] persist attempt failed, trying leaner payload', err);
    }
  }
  console.warn('[merchLibrary] persist failed for all attempts');
  return null;
}

export function buildMerchItemFromListingState(listingState = {}, overrides = {}) {
  const s = listingState || {};
  const galleryUploaded = Array.isArray(s.galleryUploaded)
    ? toPersistableState(s.galleryUploaded)
    : [];
  const title = String(overrides.title ?? s.productName ?? '').trim();
  const originalPrice = s.originalPrice != null ? String(s.originalPrice) : '';
  const discountedPrice = s.discountedPrice != null ? String(s.discountedPrice) : '';

  return {
    id: overrides.id || `merch_${Date.now()}`,
    title,
    description: String(s.description || '').trim(),
    status: overrides.status || 'draft',
    subscribersOnly: Boolean(s.subscribersOnly),
    originalPrice,
    discountedPrice,
    price: originalPrice,
    finalPrice: discountedPrice || originalPrice,
    currency: 'USD',
    tags: Array.isArray(s.tags) ? toPersistableState(s.tags) : [],
    collections: Array.isArray(s.collections) ? toPersistableState(s.collections) : [],
    subscriptionPlans: Array.isArray(s.subscriptionPlans)
      ? toPersistableState(s.subscriptionPlans)
      : [],
    subscriptionPlanIds: Array.isArray(s.subscriptionPlanIds)
      ? [...s.subscriptionPlanIds]
      : [],
    galleryUploaded,
    thumbnail: galleryThumb({ galleryUploaded, thumbnail: overrides.thumbnail }),
    stock: s.stockAmount !== '' && s.stockAmount != null ? Number(s.stockAmount) : 0,
    stockAmount: s.stockAmount != null ? String(s.stockAmount) : '',
    unlimitedStock: Boolean(s.unlimitedStock),
    limitOnePerBuyer: Boolean(s.limitOnePerBuyer),
    packageWeight: s.packageWeight != null ? String(s.packageWeight) : '',
    weightUnit: s.weightUnit || 'lb',
    originCountry: s.originCountry || '',
    estimatedShippingDays:
      s.estimatedShippingDays != null ? String(s.estimatedShippingDays) : '',
    shipInternationally: Boolean(s.shipInternationally),
    intlShippingDays: s.intlShippingDays != null ? String(s.intlShippingDays) : '',
    additionalShippingCost:
      s.additionalShippingCost != null ? String(s.additionalShippingCost) : '',
    publishSubstep: s.publishSubstep || 'publishImmediately',
    publishDate: s.publishDate || '',
    openForPreorder: Boolean(s.openForPreorder),
    preorderPrice: s.preorderPrice != null ? String(s.preorderPrice) : '',
    afterPreorderAction: s.afterPreorderAction || 'keepInStore',
    itemsSold: overrides.itemsSold ?? 0,
    totalSales: overrides.totalSales ?? '0',
    publishedAt: overrides.publishedAt ?? '',
    createdAt: overrides.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

async function rehydrateGalleriesFromIdb(engine) {
  const list = Array.isArray(engine.state.items) ? [...engine.state.items] : [];
  if (!list.length) return;
  let changed = false;
  const next = await Promise.all(
    list.map(async (item) => {
      if (!item?.id || galleryHasMedia(item.galleryUploaded)) return item;
      const gallery = await loadMerchGallery(item.id);
      if (!gallery.length) return item;
      changed = true;
      return {
        ...item,
        galleryUploaded: gallery,
        thumbnail: galleryThumb({ galleryUploaded: gallery, thumbnail: item.thumbnail }),
      };
    }),
  );
  if (!changed) return;
  // Memory only — do not lean-strip galleries that just came back from IDB.
  engine.setState('items', next);
  persistLibraryItems(next);
}

export function useMerchLibraryEngine() {
  const engine = ensureEngine();

  if (!galleryRehydrateStarted) {
    galleryRehydrateStarted = true;
    void rehydrateGalleriesFromIdb(engine);
  }

  const items = computed(() =>
    (Array.isArray(engine.state.items) ? engine.state.items : []).map((item) => ({
      ...item,
      thumbnail: galleryThumb(item),
    })),
  );

  function setItems(next) {
    const list = toPersistableState(Array.isArray(next) ? next : []) || [];
    // Always keep full gallery in memory for ProfileMerchPopup / lightGallery.
    engine.setState('items', list);
    // Disk may store a leaner copy if quota is tight — do not mirror that back into memory.
    persistLibraryItems(list);
  }

  function upsertItem(item) {
    if (!item?.id) return null;
    const list = Array.isArray(engine.state.items) ? [...engine.state.items] : [];
    const index = list.findIndex((row) => row.id === item.id);
    const nextItem = toPersistableState({
      ...item,
      thumbnail: galleryThumb(item),
      updatedAt: new Date().toISOString(),
    });
    if (index >= 0) list[index] = { ...list[index], ...nextItem };
    else list.unshift(nextItem);
    setItems(list);
    // Prefer the pre-lean gallery payload so IndexedDB keeps full dataUrls.
    void saveMerchGallery(item.id, item.galleryUploaded || nextItem.galleryUploaded || []);
    return getItem(item.id) || nextItem;
  }

  function patchItem(id, patch) {
    if (!id) return null;
    const list = Array.isArray(engine.state.items) ? [...engine.state.items] : [];
    const index = list.findIndex((row) => row.id === id);
    if (index < 0) return null;
    const nextItem = toPersistableState({
      ...list[index],
      ...patch,
      id,
      thumbnail: galleryThumb({ ...list[index], ...patch }),
      updatedAt: new Date().toISOString(),
    });
    list[index] = nextItem;
    setItems(list);
    if (Object.prototype.hasOwnProperty.call(patch, 'galleryUploaded')) {
      void saveMerchGallery(id, nextItem.galleryUploaded);
    }
    return getItem(id) || nextItem;
  }

  function removeItem(id) {
    if (!id) return;
    const list = (Array.isArray(engine.state.items) ? engine.state.items : []).filter(
      (row) => row.id !== id,
    );
    setItems(list);
    void deleteMerchGallery(id);
  }

  function getItem(id) {
    return (Array.isArray(engine.state.items) ? engine.state.items : []).find((row) => row.id === id) || null;
  }

  /** Resolve gallery for edit popup — falls back to IndexedDB when localStorage stripped media. */
  async function resolveItemGallery(item) {
    if (!item?.id) return [];
    if (galleryHasMedia(item.galleryUploaded)) {
      return Array.isArray(item.galleryUploaded) ? [...item.galleryUploaded] : [];
    }
    const fromIdb = await loadMerchGallery(item.id);
    if (fromIdb.length) {
      // Repair in-memory item so ProfileMerchPopup / grid also recover.
      patchItem(item.id, {
        galleryUploaded: fromIdb,
        thumbnail: galleryThumb({ galleryUploaded: fromIdb, thumbnail: item.thumbnail }),
      });
      return fromIdb;
    }
    return Array.isArray(item.galleryUploaded) ? [...item.galleryUploaded] : [];
  }

  return {
    engine,
    items,
    setItems,
    upsertItem,
    patchItem,
    removeItem,
    getItem,
    resolveItemGallery,
  };
}
