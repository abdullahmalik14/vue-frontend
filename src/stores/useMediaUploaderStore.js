import { defineStore } from 'pinia';
import { reactive, ref, computed } from 'vue';
import router from '@/router';
import {
  attachStorageQuotaMonitor,
  buildPersistKey,
  createPersistedStateSerializer,
  migrateLegacyPersistedState,
  persistStorageAdapter,
  resolvePersistStorage,
  resolvePersistTtlMs,
} from '../utils/common/persistUtils.js';
import {
  hydrateLibraryItemsMedia,
  idbDeleteMediaForItem,
  isHeavyMediaUrl,
  isMediaRef,
  mediaRefKey,
  persistLibraryItemMedia,
} from '../infrastructure/cache/mediaLibraryIdb.js';

const noopValidator = () => ({ valid: true, errors: [] });

const MEDIA_UPLOADER_PERSIST_VERSION = 2;
const MEDIA_UPLOADER_PERSIST_BASE_KEY = 'media_uploader_persistence';
const MEDIA_UPLOADER_PERSIST_KEY = buildPersistKey(MEDIA_UPLOADER_PERSIST_BASE_KEY);

function toPersistableMediaUrl(itemId, field, url) {
  if (!url || typeof url !== 'string') return '';
  if (isMediaRef(url)) return url;
  if (url.startsWith('blob:')) return '';
  if (isHeavyMediaUrl(url) && itemId) return mediaRefKey(itemId, field);
  return url;
}

/** localStorage write path — never embed data:/blob: bytes. */
function sanitizeLibraryItemForPersist(item) {
  if (!item || typeof item !== 'object') return null;
  const formSnapshot = item.formSnapshot && typeof item.formSnapshot === 'object'
    ? sanitizeFormSnapshotForPersist(item.formSnapshot)
    : undefined;
  const itemId = item.id || '';
  let poster = toPersistableMediaUrl(itemId, 'poster', item.poster || '');
  let videoUrl = toPersistableMediaUrl(itemId, 'video', item.videoUrl || '');
  if (itemId && isHeavyMediaUrl(item.poster) && item.poster === item.videoUrl) {
    poster = mediaRefKey(itemId, 'video');
    videoUrl = mediaRefKey(itemId, 'video');
  }
  return {
    ...item,
    poster,
    videoUrl,
    formSnapshot,
  };
}

/** Hydrate path — keep data: URLs from legacy storage; only drop ephemeral blob: URLs. */
function sanitizeLibraryItemAfterRestore(item) {
  if (!item || typeof item !== 'object') return null;
  const formSnapshot = item.formSnapshot && typeof item.formSnapshot === 'object'
    ? sanitizeFormSnapshotForPersist(item.formSnapshot)
    : undefined;
  return {
    ...item,
    poster: typeof item.poster === 'string' && item.poster.startsWith('blob:') ? '' : (item.poster || ''),
    videoUrl: typeof item.videoUrl === 'string' && item.videoUrl.startsWith('blob:') ? '' : (item.videoUrl || ''),
    formSnapshot,
  };
}

function sanitizeFormSnapshotForPersist(source) {
  const next = {
    ...createDefaultForm(),
    ...(source || {}),
    mediaFile: null,
    uploadedThumbnailFile: null,
    uploadedTrailerFile: null,
    tier_backgroundFile: null,
    socialThumbnailCustomImageFile: null,
    socialThumbnailCustomVideoFile: null,
    src: null,
    galleryPending: [],
  };
  // Media bytes live on the library card; keep snapshot light for localStorage quota.
  next.galleryUploaded = [];
  next.mediaUrl = '';
  next.thumbnailUrl = '';
  next.previewTrailerUrl = '';
  next.socialThumbnailCustomImageSrc = '';
  next.socialThumbnailCustomVideoSrc = '';
  next.tier_backgroundUrl = '';
  try {
    return JSON.parse(JSON.stringify(next));
  } catch {
    return createDefaultForm();
  }
}

function normalizePersistedMediaState(state, { forPersist = false } = {}) {
  if (!state || typeof state !== 'object') {
    return {
      libraryItems: [],
      subscriptionCatalog: [],
      editingItemId: null,
      step: 1,
      substep: 'chooseScreenshot',
    };
  }

  const sanitizeItem = forPersist ? sanitizeLibraryItemForPersist : sanitizeLibraryItemAfterRestore;

  return {
    libraryItems: Array.isArray(state.libraryItems)
      ? state.libraryItems.map(sanitizeItem).filter(Boolean)
      : [],
    subscriptionCatalog: Array.isArray(state.subscriptionCatalog) ? state.subscriptionCatalog : [],
    editingItemId: state.editingItemId ?? null,
    step: Number.isFinite(Number(state.step)) ? Number(state.step) : 1,
    substep: typeof state.substep === 'string' ? state.substep : 'chooseScreenshot',
  };
}

const mediaUploaderPersistSerializer = createPersistedStateSerializer({
  version: MEDIA_UPLOADER_PERSIST_VERSION,
  ttlMs: resolvePersistTtlMs(),
  fallback: () => ({
    libraryItems: [],
    subscriptionCatalog: [],
    editingItemId: null,
    step: 1,
    substep: 'chooseScreenshot',
  }),
  migrate: (state) => normalizePersistedMediaState(state, { forPersist: false }),
  mapBeforeSerialize: (state) => normalizePersistedMediaState(state, { forPersist: true }),
  mapAfterDeserialize: (state) => normalizePersistedMediaState(state, { forPersist: false }),
});

function createDefaultForm() {
  return {
    mediaType: '',
    mediaId: '',
    src: null,
    thumbnailOption: 'siteDefaultPlaceholder',
    thumbnailUrl: '',
    blurThumbnail: false,
    blurThumbnailLevel: '20px',
    showPreviewTrailer_Screenshot: false,
    showPreviewTrailer_Placeholder: false,
    showPreviewTrailer_Upload: false,
    uploadedThumbnailFile: null,
    uploadedTrailerFile: null,
    previewTrailerSource: 'siteGenerated',
    previewTrailerUrl: '',
    linkToSubscriptionPlan: false,
    subscriptionPlanIds: [],
    subscriptionPlans: [],
    postToSocials_Immediate: false,
    postToSocials_Schedule: false,
    payToViewEnabled: false,
    payToViewOriginalPrice: null,
    payToViewDiscountedPrice: null,
    mediaTitle: '',
    description: '',
    tags: [],
    coPerformerIds: [],
    publishType: 'publishImmediatelyAfterApproval',
    scheduledPublishDateTime: '',
    featureOnComingSoon: false,
    preOrderPrice: null,
    postToSocialsOnPublish: false,
    xAccountConnected: false,
    socialPostMessage: '',
    socialThumbnailMode: 'useOriginal',
    socialThumbnailCustomImageSrc: '',
    socialThumbnailCustomVideoSrc: '',
    socialThumbnailCustomImageFile: null,
    socialThumbnailCustomVideoFile: null,
    showOnDiscoveryPage: false,
    showOnProfilePage: false,
    termsCheckbox1: false,
    termsCheckbox2: false,
    termsCheckbox3: false,
    termsCheckbox4: false,
    termsCheckbox5: false,
    tier_name: '',
    tier_description: '',
    tier_originalPrice: null,
    tier_discountPrice: null,
    tier_backgroundUrl: '',
    tier_backgroundFile: null,
    tier_freeTokens: null,
    tier_merchDiscount: null,
    tier_applyMerch: false,
    tier_payToViewDiscount: null,
    tier_applyPayToView: false,
    tier_customRequestDiscount: null,
    tier_applyCustom: false,
    tier_unsubscribeDiscount: null,
    mediaUrl: '',
    mediaFile: null,
    duration: '',
    galleryUploaded: [],
    galleryPending: [],
  };
}

function formatVideoDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '';
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatUploadDate(date = new Date(), locale) {
  const resolvedLocale =
    locale ||
    (typeof navigator !== 'undefined' && navigator.language) ||
    'en-GB';
  return date.toLocaleDateString(resolvedLocale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function tagLabelsFromForm(tags) {
  const names = [];
  for (const tag of tags || []) {
    const name = typeof tag === 'string' ? tag : tag?.name;
    const value = String(name || '').trim();
    if (!value || /^\+\d+$/.test(value)) continue;
    names.push(value);
  }
  return names;
}

function restoreTruncatedTagNames(tags, catalog = []) {
  const names = [];
  let missing = 0;
  for (const tag of tags || []) {
    const name = typeof tag === 'string' ? tag : tag?.name;
    const value = String(name || '').trim();
    const plusMatch = value.match(/^\+(\d+)$/);
    if (plusMatch) {
      missing += Number(plusMatch[1]);
      continue;
    }
    if (value) names.push(value);
  }

  if (missing > 0 && catalog.length) {
    const catalogNames = catalog
      .map((tag) => (typeof tag === 'string' ? tag : tag?.name))
      .map((name) => String(name || '').trim())
      .filter(Boolean);
    const isPrefix = names.every((name, index) => catalogNames[index] === name);
    if (isPrefix && catalogNames.length >= names.length + missing) {
      return catalogNames.slice(0, names.length + missing);
    }
  }

  return names;
}

function formatP2vPrice(form) {
  if (!form.payToViewEnabled) return '';
  const amount = form.payToViewDiscountedPrice ?? form.payToViewOriginalPrice;
  if (amount == null || amount === '') return '';
  const numeric = Number(amount);
  if (Number.isNaN(numeric)) return `USD$ ${amount}`;
  return `USD$ ${numeric.toFixed(2)}`;
}

function isSiteDemoThumbnail(url) {
  if (!url || typeof url !== 'string') return false;
  return /media-uploader-thumb-(slide|a|b)\.webp/i.test(url);
}

function firstGalleryUrl(form) {
  const items = Array.isArray(form.galleryUploaded) ? form.galleryUploaded : [];
  const first = items[0];
  return first?.dataUrl || first?.objectUrl || '';
}

function resolveLibraryPoster(form, substep) {
  const mediaType = form.mediaType || 'video';
  const uploaded = form.mediaUrl || firstGalleryUrl(form) || '';
  const thumbnail = form.thumbnailUrl || '';
  const thumbnailIsDemo = isSiteDemoThumbnail(thumbnail);

  if (mediaType === 'singleImage' || mediaType === 'imageGallery') {
    if (substep === 'usePlaceholder' && thumbnail && !thumbnailIsDemo) {
      return thumbnail;
    }
    return uploaded || (!thumbnailIsDemo ? thumbnail : '') || '';
  }

  if (thumbnail && !thumbnailIsDemo) return thumbnail;
  // Prefer placeholder image over raw video bytes (img/poster need an image URL).
  if (thumbnail) return thumbnail;
  if (
    typeof uploaded === 'string' &&
    (uploaded.startsWith('data:video') || uploaded.startsWith('blob:'))
  ) {
    return '';
  }
  return uploaded || '';
}

function isSingleImageLibraryItem(item) {
  return item?.mediaKind === 'singleImage' || item?.type === 'image';
}

export const useMediaUploaderStore = defineStore('mediaUploader', () => {
  const currentRoute = computed(() => router.currentRoute.value);

  const step = ref(1);
  const substep = ref('chooseScreenshot');

  const validators = reactive({
    1: noopValidator,
    2: noopValidator,
    3: noopValidator,
    4: noopValidator,
    5: noopValidator,
  });

  const form = reactive(createDefaultForm());

  const libraryItems = ref([]);
  const subscriptionCatalog = ref([]);
  const tagCatalog = ref([]);
  const tagHistory = ref([]);
  const performerCatalog = ref([]);
  const editingItemId = ref(null);

  const ui = reactive({
    isValidating: false,
    errors: {},
    uploadProgress: 0,
    isUploading: false,
  });

  function setStep(newStep) {
    if (newStep > step.value && !validateStep(step.value)) {
      return;
    }

    if (newStep === 1) {
      if (form.mediaType === 'audio') {
        const audioSubsteps = ['usePlaceholder', 'uploadThumbnail'];
        if (!audioSubsteps.includes(substep.value)) {
          substep.value = 'usePlaceholder';
        }
      } else if (form.mediaType === 'singleImage') {
        const singleSubsteps = ['useImageAsThumbnail', 'usePlaceholder'];
        if (!singleSubsteps.includes(substep.value)) {
          substep.value = 'useImageAsThumbnail';
        }
      } else {
        const step1Substeps = ['chooseScreenshot', 'usePlaceholder', 'uploadThumbnail'];
        if (!step1Substeps.includes(substep.value)) {
          substep.value = 'chooseScreenshot';
        }
      }
    } else if (newStep === 4) {
      const step4Substeps = ['publishImmediately', 'schedulePublish'];
      if (!step4Substeps.includes(substep.value)) {
        substep.value = 'publishImmediately';
      }
    } else {
      substep.value = '';
    }

    step.value = newStep;
    syncToUrl();
  }

  function setSubstep(newSubstep) {
    substep.value = newSubstep;
    syncToUrl();
  }

  function updateFormField(path, value) {
    form[path] = value;
  }

  function ensureSubscriptionPlans() {
    if (!Array.isArray(form.subscriptionPlans)) {
      form.subscriptionPlans = [];
    }
  }

  /** Drop legacy static seed plans (labelKey defaults) so only user-added tiers remain. */
  function migrateLegacyStaticPlans() {
    ensureSubscriptionPlans();
    const next = form.subscriptionPlans.filter(
      (plan) => plan && typeof plan.label === 'string' && plan.label.trim() && !plan.labelKey,
    );
    if (next.length !== form.subscriptionPlans.length) {
      form.subscriptionPlans = next;
      const ids = new Set(next.map((plan) => plan.id));
      form.subscriptionPlanIds = (form.subscriptionPlanIds || []).filter((id) => ids.has(id));
    }
  }

  function resetTierDraft() {
    form.tier_name = '';
    form.tier_description = '';
    form.tier_originalPrice = null;
    form.tier_discountPrice = null;
    form.tier_backgroundUrl = '';
    form.tier_backgroundFile = null;
    form.tier_freeTokens = null;
    form.tier_merchDiscount = null;
    form.tier_applyMerch = false;
    form.tier_payToViewDiscount = null;
    form.tier_applyPayToView = false;
    form.tier_customRequestDiscount = null;
    form.tier_applyCustom = false;
    form.tier_unsubscribeDiscount = null;
  }

  function addSubscriptionPlan(plan) {
    ensureSubscriptionPlans();
    const id = plan?.id || `tier_${Date.now()}`;
    const label = String(plan?.label || '').trim();
    if (!label) return null;

    const entry = {
      id,
      label,
      originalPrice: plan?.originalPrice ?? null,
      discountPrice: plan?.discountPrice ?? null,
      backgroundUrl: plan?.backgroundUrl || '',
    };

    form.subscriptionPlans = [...(form.subscriptionPlans || []), entry];

    if (!form.subscriptionPlanIds.includes(id)) {
      form.subscriptionPlanIds = [...form.subscriptionPlanIds, id];
    }

    upsertSubscriptionCatalog(entry, plan?.status || 'published');
    return entry;
  }

  function upsertSubscriptionCatalog(plan, status = 'published') {
    const id = plan?.id;
    const label = String(plan?.label || '').trim();
    if (!id || !label) return;
    const next = [...(subscriptionCatalog.value || [])];
    const idx = next.findIndex((row) => row.id === id);
    const row = { id, label, status: plan?.status || status };
    if (idx >= 0) next[idx] = { ...next[idx], ...row };
    else next.push(row);
    subscriptionCatalog.value = next;
  }

  function planToTierRow(plan, status = 'published') {
    if (!plan || typeof plan.label !== 'string') return null;
    const label = plan.label.trim();
    if (!label || plan.labelKey) return null;
    return {
      id: plan.id,
      label,
      status: plan.status || status,
    };
  }

  const availableSubscriptionTiers = computed(() => {
    const catalog = (subscriptionCatalog.value || [])
      .map((plan) => planToTierRow(plan, plan?.status || 'published'))
      .filter(Boolean);
    if (catalog.length) return catalog;

    return (form.subscriptionPlans || [])
      .map((plan) => planToTierRow(plan, 'published'))
      .filter(Boolean);
  });

  function normalizeTierName(value) {
    if (typeof value === 'string') return value.trim();
    if (value && typeof value === 'object') {
      return String(value.label || value.id || '').trim();
    }
    return '';
  }

  function itemHasTier(item, plan) {
    const label = normalizeTierName(typeof plan === 'string' ? plan : plan?.label);
    const id = typeof plan === 'object' ? String(plan?.id || '').trim() : '';
    return (item?.tiers || []).some((entry) => {
      const name = normalizeTierName(entry);
      return Boolean(name) && (name === label || (id && name === id));
    });
  }

  function countLibraryItemsOnTier(plan) {
    return (libraryItems.value || []).filter((item) => itemHasTier(item, plan)).length;
  }

  function toggleLibraryItemTier(itemId, plan) {
    const label = normalizeTierName(typeof plan === 'string' ? plan : plan?.label);
    const id = typeof plan === 'object' ? String(plan?.id || '').trim() : '';
    if (!itemId || !label) return { blocked: false };

    const item = (libraryItems.value || []).find((row) => String(row.id) === String(itemId));
    if (!item) return { blocked: false };

    const current = [...(item.tiers || [])];
    const isSelected = itemHasTier(item, plan);

    if (isSelected && countLibraryItemsOnTier(plan) <= 1) {
      return { blocked: true, tierLabel: label };
    }

    const next = isSelected
      ? current.filter((entry) => {
          const name = normalizeTierName(entry);
          return name !== label && (!id || name !== id);
        })
      : [...current, label];

    libraryItems.value = (libraryItems.value || []).map((row) => (
      String(row.id) === String(itemId) ? { ...row, tiers: next } : row
    ));
    return { blocked: false };
  }

  function addValidator(stepNumber, validatorFn) {
    validators[stepNumber] = validatorFn;
  }

  function validateStep(stepNumber) {
    const validator = validators[stepNumber];
    if (!validator) return true;

    const { valid, errors } = validator(form);
    if (!valid && errors?.length) {
      alert(errors[0]);
      return false;
    }
    return valid;
  }

  function syncToUrl() {
    const currentParams = new URLSearchParams(window.location.search);
    const newStep = String(step.value);
    const newSubstep = String(substep.value);

    if (currentParams.get('media_step') === newStep && currentParams.get('media_sub') === newSubstep) {
      return;
    }

    const params = new URLSearchParams();
    params.set('media_step', newStep);
    params.set('media_sub', newSubstep);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }

  function initializeFromUrl() {
    const qStep = currentRoute.value.query.media_step;
    const qSub = currentRoute.value.query.media_sub;

    if (qStep) {
      const parsed = parseInt(qStep, 10);
      if (!Number.isNaN(parsed)) step.value = parsed;
    }

    if (qSub) {
      substep.value = qSub;
    } else if (step.value === 1) {
      substep.value = 'chooseScreenshot';
    }
  }

  async function submitUploader() {
    ui.isValidating = false;
    return true;
  }

  function cloneFormSnapshot(source) {
    return sanitizeFormSnapshotForPersist(source);
  }

  function applyFormValues(next) {
    const defaults = createDefaultForm();
    for (const key of Object.keys(form)) {
      if (!(key in defaults)) delete form[key];
    }
    Object.assign(form, defaults, next || {});
  }

  function defaultSubstepForType(mediaType) {
    if (mediaType === 'singleImage') return 'useImageAsThumbnail';
    if (mediaType === 'audio' || mediaType === 'imageGallery') return 'usePlaceholder';
    return 'chooseScreenshot';
  }

  function resolveMediaKind(item) {
    if (item?.mediaKind) return item.mediaKind;
    if (item?.type === 'image') return 'singleImage';
    if (item?.type === 'gallery') return 'imageGallery';
    if (item?.type === 'audio') return 'audio';
    return 'video';
  }

  function parseP2vAmount(price) {
    const match = String(price || '').replace(/,/g, '').match(/(\d+(\.\d+)?)/);
    return match ? Number(match[1]) : null;
  }

  function formFromLibraryItem(item) {
    const next = createDefaultForm();
    const mediaType = resolveMediaKind(item);
    next.mediaType = mediaType;
    next.mediaTitle = item.title || '';
    next.description = item.description || '';
    next.mediaUrl = item.videoUrl || '';
    next.thumbnailUrl = item.poster || item.videoUrl || '';
    next.duration = item.duration || '';
    next.blurThumbnail = Boolean(item.blurThumbnail);
    next.blurThumbnailLevel = item.blurThumbnailLevel || '20px';
    next.tags = (item.tags || [])
      .map((tag, index) => {
        const name = typeof tag === 'string' ? tag : tag?.name;
        const value = String(name || '').trim();
        if (!value) return null;
        return { id: tag?.id || `tag_${index}_${value}`, name: value };
      })
      .filter(Boolean);
    next.showOnProfilePage = (item.appearOn || []).includes('profile');
    next.showOnDiscoveryPage = (item.appearOn || []).includes('discovery');
    next.payToViewEnabled = Boolean(String(item.price || '').trim());
    const amount = parseP2vAmount(item.price);
    if (amount != null) {
      next.payToViewOriginalPrice = amount;
    }
    const catalog = [
      ...(subscriptionCatalog.value || []),
      ...(form.subscriptionPlans || []),
    ];
    const seen = new Set();
    next.subscriptionPlans = catalog.filter((plan) => {
      if (!plan?.id || seen.has(plan.id)) return false;
      seen.add(plan.id);
      return true;
    });
    const labels = item.tiers || [];
    next.subscriptionPlanIds = next.subscriptionPlans
      .filter((plan) => labels.includes(plan.label))
      .map((plan) => plan.id);
    next.linkToSubscriptionPlan = next.subscriptionPlanIds.length > 0;
    if (mediaType === 'imageGallery' && next.mediaUrl) {
      next.galleryUploaded = [{
        id: `existing_${item.id}`,
        name: 'image',
        objectUrl: next.mediaUrl,
        dataUrl: next.mediaUrl,
      }];
    }
    return next;
  }

  function buildLibraryItemFields(status) {
    const mediaType = form.mediaType || 'video';
    const cardType =
      mediaType === 'singleImage' || mediaType === 'audio'
        ? 'image'
        : mediaType === 'imageGallery'
          ? 'gallery'
          : 'video';

    const selectedPlanIds = new Set(form.subscriptionPlanIds || []);
    const plans = Array.isArray(form.subscriptionPlans) ? form.subscriptionPlans : [];
    const selectedPlans = selectedPlanIds.size
      ? plans.filter((plan) => selectedPlanIds.has(plan.id))
      : plans;

    const appearOn = [];
    if (form.showOnProfilePage) appearOn.push('profile');
    if (form.showOnDiscoveryPage) appearOn.push('discovery');

    return {
      title: String(form.mediaTitle || '').trim(),
      description: String(form.description || '').trim(),
      type: cardType,
      mediaKind: mediaType,
      poster: resolveLibraryPoster(form, substep.value),
      videoUrl: form.mediaUrl || firstGalleryUrl(form) || '',
      duration: form.duration || '',
      status,
      blurThumbnail: Boolean(form.blurThumbnail),
      blurThumbnailLevel: form.blurThumbnailLevel || '20px',
      hasTrailer: Boolean(
        form.previewTrailerUrl ||
          form.uploadedTrailerFile ||
          form.showPreviewTrailer_Upload ||
          form.showPreviewTrailer_Screenshot,
      ),
      tags: tagLabelsFromForm(form.tags),
      price: formatP2vPrice(form),
      tiers: selectedPlans.map((plan) => plan.label).filter(Boolean),
      appearOn,
      formSnapshot: cloneFormSnapshot(form),
    };
  }

  async function flushLibraryItemMedia(item) {
    if (!item?.id) return;
    try {
      await persistLibraryItemMedia(item);
    } catch (error) {
      console.warn('[media-uploader] IndexedDB media persist failed', item.id, error);
    }
  }

  function addLibraryItemFromForm({ status = 'reviewing' } = {}) {
    const item = {
      id: `media_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      ...buildLibraryItemFields(status),
      date: formatUploadDate(),
      likes: 0,
      views: 0,
    };

    libraryItems.value = [item, ...libraryItems.value];
    editingItemId.value = null;
    return item;
  }

  function updateLibraryItemFromForm(itemId, { status } = {}) {
    const existing = (libraryItems.value || []).find((row) => row.id === itemId);
    if (!existing) return null;
    const nextStatus = status || existing.status || 'reviewing';
    const fields = buildLibraryItemFields(nextStatus);
    const nextItem = {
      ...existing,
      ...fields,
      id: existing.id,
      date: existing.date,
      likes: existing.likes || 0,
      views: existing.views || 0,
      status: nextStatus,
    };
    libraryItems.value = (libraryItems.value || []).map((row) => (
      row.id === itemId ? nextItem : row
    ));
    return nextItem;
  }

  async function saveLibraryItemFromForm({ status } = {}) {
    let item;
    if (editingItemId.value) {
      item = updateLibraryItemFromForm(editingItemId.value, { status });
      editingItemId.value = null;
    } else {
      item = addLibraryItemFromForm({ status: status || 'reviewing' });
    }
    // Write media bytes to IndexedDB BEFORE relying on localStorage metadata.
    await flushLibraryItemMedia(item);
    return item;
  }

  function loadLibraryItemForEdit(itemId) {
    const item = (libraryItems.value || []).find((row) => row.id === itemId);
    if (!item) return false;
    editingItemId.value = itemId;
    const snap = item.formSnapshot && typeof item.formSnapshot === 'object'
      ? { ...createDefaultForm(), ...item.formSnapshot }
      : formFromLibraryItem(item);
    // Media URLs are stored on the card (not duplicated in formSnapshot) for persist quota.
    if (item.videoUrl) snap.mediaUrl = item.videoUrl;
    if (item.poster) snap.thumbnailUrl = item.poster;
    if ((item.mediaKind === 'imageGallery' || item.type === 'gallery') && item.videoUrl) {
      snap.galleryUploaded = [{
        id: `existing_${item.id}`,
        name: 'image',
        objectUrl: item.videoUrl,
        dataUrl: item.videoUrl,
      }];
    }
    applyFormValues(snap);
    step.value = 3;
    substep.value = defaultSubstepForType(form.mediaType);
    return true;
  }

  function clearEditingItem() {
    editingItemId.value = null;
  }

  function removeLibraryItem(id) {
    libraryItems.value = (libraryItems.value || []).filter((item) => item.id !== id);
    void idbDeleteMediaForItem(id).catch((error) => {
      console.warn('[media-uploader] IndexedDB media delete failed', id, error);
    });
  }

  async function rehydrateLibraryMedia() {
    try {
      const items = libraryItems.value || [];
      // Legacy: data: URLs still in localStorage → move into IndexedDB once.
      await Promise.all(
        items
          .filter((item) => isHeavyMediaUrl(item?.videoUrl) || isHeavyMediaUrl(item?.poster))
          .map((item) => flushLibraryItemMedia(item)),
      );
      const hydrated = await hydrateLibraryItemsMedia(libraryItems.value || []);
      libraryItems.value = hydrated;
    } catch (error) {
      console.warn('[media-uploader] library media rehydrate failed', error);
    }
  }

  function updateLibraryItemStatus(id, status) {
    libraryItems.value = (libraryItems.value || []).map((item) => (
      item.id === id ? { ...item, status } : item
    ));
  }

  function restoreLibraryItemTags(catalog = []) {
    const items = libraryItems.value || [];
    let changed = false;
    const next = items.map((item) => {
      const tags = restoreTruncatedTagNames(item.tags, catalog);
      const prev = (item.tags || []).map((tag) => (typeof tag === 'string' ? tag : tag?.name)).join('\0');
      if (tags.join('\0') === prev) return item;
      changed = true;
      return { ...item, tags };
    });
    if (changed) libraryItems.value = next;
    restoreLibraryItemPosters();
  }

  function restoreLibraryItemPosters() {
    const items = libraryItems.value || [];
    let changed = false;
    const next = items.map((item) => {
      if (!isSingleImageLibraryItem(item) && item?.mediaKind !== 'imageGallery') return item;
      const actual = item.videoUrl || '';
      if (!actual) return item;
      if (item.poster === actual) return item;
      if (!item.poster || isSiteDemoThumbnail(item.poster)) {
        changed = true;
        return { ...item, poster: actual };
      }
      return item;
    });
    if (changed) libraryItems.value = next;
  }

  function resetForm() {
    const next = createDefaultForm();
    for (const key of Object.keys(form)) {
      if (!(key in next)) delete form[key];
    }
    Object.assign(form, next);
    step.value = 1;
    substep.value = 'chooseScreenshot';
    // Drop wizard query leftovers so a fresh open does not look mid-flow.
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('media_step') || params.has('media_sub')) {
        params.delete('media_step');
        params.delete('media_sub');
        const qs = params.toString();
        window.history.replaceState({}, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
      }
    }
  }

  function reset() {
    resetForm();
  }

  function setUploaderCatalogs({
    tagCatalog: nextTags,
    tagHistory: nextHistory,
    performerCatalog: nextPerformers,
  } = {}) {
    if (Array.isArray(nextTags)) tagCatalog.value = nextTags;
    if (Array.isArray(nextHistory)) tagHistory.value = nextHistory;
    if (Array.isArray(nextPerformers)) performerCatalog.value = nextPerformers;
  }

  return {
    step,
    substep,
    form,
    ui,
    libraryItems,
    subscriptionCatalog,
    tagCatalog,
    tagHistory,
    performerCatalog,
    availableSubscriptionTiers,
    editingItemId,
    validators,
    setStep,
    setSubstep,
    updateFormField,
    resetTierDraft,
    ensureSubscriptionPlans,
    migrateLegacyStaticPlans,
    addSubscriptionPlan,
    toggleLibraryItemTier,
    addValidator,
    validateStep,
    initializeFromUrl,
    submitUploader,
    addLibraryItemFromForm,
    updateLibraryItemFromForm,
    saveLibraryItemFromForm,
    loadLibraryItemForEdit,
    clearEditingItem,
    removeLibraryItem,
    updateLibraryItemStatus,
    restoreLibraryItemTags,
    rehydrateLibraryMedia,
    setUploaderCatalogs,
    resetForm,
    reset,
  };
}, {
  persist: {
    key: MEDIA_UPLOADER_PERSIST_KEY,
    storage: {
      getItem: persistStorageAdapter.getItem,
      removeItem: persistStorageAdapter.removeItem,
      setItem(key, value) {
        try {
          persistStorageAdapter.setItem(key, value);
        } catch (error) {
          // QuotaExceeded: strip already applied; log so silent loss is visible.
          console.warn('[media-uploader] localStorage persist failed', key, error);
          try {
            // Last resort: persist metadata-only (no media refs payload shrink).
            const parsed = JSON.parse(value);
            if (parsed?.data?.libraryItems) {
              parsed.data.libraryItems = parsed.data.libraryItems.map((item) => ({
                ...item,
                videoUrl: isMediaRef(item.videoUrl) ? item.videoUrl : '',
                poster: isMediaRef(item.poster) ? item.poster : (isHeavyMediaUrl(item.poster) ? '' : item.poster),
                formSnapshot: undefined,
              }));
              persistStorageAdapter.setItem(key, JSON.stringify(parsed));
            }
          } catch (retryError) {
            console.warn('[media-uploader] localStorage persist retry failed', retryError);
          }
        }
      },
    },
    // Only library + catalog survive refresh. Wizard step/form must not leak into a new upload.
    pick: ['libraryItems', 'subscriptionCatalog'],
    serializer: mediaUploaderPersistSerializer,
    beforeHydrate() {
      migrateLegacyPersistedState({
        storage: resolvePersistStorage(),
        newKey: MEDIA_UPLOADER_PERSIST_KEY,
        legacyKeys: [MEDIA_UPLOADER_PERSIST_BASE_KEY],
        baseKey: MEDIA_UPLOADER_PERSIST_BASE_KEY,
      });
    },
    afterHydrate({ store }) {
      if (!Array.isArray(store.libraryItems)) store.libraryItems = [];
      if (!Array.isArray(store.subscriptionCatalog)) store.subscriptionCatalog = [];
      store.editingItemId = null;
      store.step = 1;
      store.substep = 'chooseScreenshot';
      void store.rehydrateLibraryMedia?.();
      attachStorageQuotaMonitor(store, {
        key: MEDIA_UPLOADER_PERSIST_KEY,
        label: 'media-uploader',
      });
    },
  },
});
