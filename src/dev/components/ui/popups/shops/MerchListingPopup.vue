<script setup>
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { createStepStateEngine, toPersistableState } from '@/utils/stateEngine';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import DashboardWizardSteps from '@/components/ui/navigation/DashboardWizardSteps.vue';
import MerchProductDetailsStep from '@/dev/components/shops/merch/steps/MerchProductDetailsStep.vue';
import MerchGalleryStep from '@/dev/components/shops/merch/steps/MerchGalleryStep.vue';
import MerchInventoryShipmentStep from '@/dev/components/shops/merch/steps/MerchInventoryShipmentStep.vue';
import MerchPublishSettingsStep from '@/dev/components/shops/merch/steps/MerchPublishSettingsStep.vue';
import MerchActionConfirmPopup from '@/dev/components/ui/popups/shops/MerchActionConfirmPopup.vue';
import CancelUploadPopup from '@/components/ui/popups/CancelUploadPopup.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { galleryHasMedia, loadMerchGallery } from '@/dev/composables/merchGalleryMediaStore.js';
import { fileToDataUrl, isBlobUrl } from '@/utils/fileToDataUrl.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  /** create = new listing; edit = edit existing (Published → SAVE on all tabs) */
  mode: {
    type: String,
    default: 'create',
    validator: (value) => ['create', 'edit'].includes(value),
  },
  initialItem: {
    type: Object,
    default: null,
  },
  /** Wizard step to open on (1–4). Publish CTA opens on Publish Settings (4). */
  initialStep: {
    type: Number,
    default: 1,
  },
});

const emit = defineEmits(['update:modelValue', 'save-draft', 'saved', 'end-preorder']);

const { t } = useI18n();
const { url: closeIconUrl } = useAssetUrl('mediaUploader.icon.close');
const { url: draftIconUrl } = useAssetUrl('plan.icon.uploadDraft');
/** Check circle the user supplied for SAVE (tight 22px glyph, not the padded payout asset). */
const saveCheckUrl = '/dev/cdn/images/merch-save-check.png';
const { url: nextIconUrl } = useAssetUrl('mediaUploader.icon.next');

const draftIconClass =
  'w-5 h-5 pointer-events-none brightness-0 invert transition-[filter] duration-200 group-hover/dpb:brightness-0 group-hover/dpb:invert-0';

/** Demo ButtonsDemo — polygonLeft Next arrow (w-6). Submit uses the same icon. */
const mediaPolygonNextIconClass =
  'w-6 h-6 pointer-events-none transition-[filter] duration-200 filter brightness-0 invert-0 group-hover/dpb:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]';

const mediaPolygonNextIconDisabledClass =
  'w-6 h-6 pointer-events-none [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(8%)_saturate(281%)_hue-rotate(182deg)_brightness(91%)_contrast(88%)]';

/** SAVE check — same box as Next arrow. */
const saveIconClass =
  'w-5 h-5 shrink-0 pointer-events-none object-contain brightness-0 transition-[filter] duration-200 group-hover/dpb:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]';

/** Flush polygon clip (no gap). Draft hover: white. */
const footerDraftBtnClass =
  '!py-[4px] !pl-[8px] !pr-[22px] hover:!bg-white hover:!text-black [clip-path:polygon(0_0,calc(100%-14px)_0,100%_100%,0_100%)]';

const footerPrimaryBtnClass = 'disabled:!opacity-100 disabled:hover:bg-[var(--btn-bg)] disabled:hover:text-[var(--btn-text)]';
const footerSaveBtnClass = '';

const leaveConfirmOpen = ref(false);
const productDetailsStepRef = ref(null);
const inventoryStepRef = ref(null);
const publishStepRef = ref(null);
let skipLeaveConfirm = false;

const listingFlow = createStepStateEngine({
  flowId: 'merchListingFlow',
  initialStep: 1,
  urlSync: 'none',
  persist: false,
  defaults: {
    productName: '',
    description: '',
    subscribersOnly: false,
    originalPrice: '',
    discountedPrice: '',
    tags: [],
    collections: [],
    subscriptionPlans: [],
    subscriptionPlanIds: [],
    galleryUploaded: [],
    stockAmount: '',
    unlimitedStock: false,
    limitOnePerBuyer: false,
    packageWeight: '',
    weightUnit: 'lb',
    originCountry: '',
    estimatedShippingDays: '',
    shipInternationally: false,
    intlShippingDays: '',
    additionalShippingCost: '',
    publishSubstep: 'publishImmediately',
    publishDate: '',
    openForPreorder: false,
    preorderPrice: '',
    afterPreorderAction: 'keepInStore',
  },
});

const steps = computed(() => [
  { id: 1, labelKey: 'shops.merch.listing.steps.productDetails' },
  { id: 2, labelKey: 'shops.merch.listing.steps.gallery' },
  { id: 3, labelKey: 'shops.merch.listing.steps.inventoryShipment' },
  { id: 4, labelKey: 'shops.merch.listing.steps.publishSettings' },
]);

const activeStep = computed({
  get: () => listingFlow.step,
  set: (id) => {
    void listingFlow.forceStep(id);
  },
});

const hasProductDetailsProgress = computed(() => {
  const s = listingFlow.state || {};
  if (String(s.productName || '').trim()) return true;
  if (String(s.description || '').trim()) return true;
  if (s.subscribersOnly) return true;
  if (String(s.originalPrice ?? '').trim()) return true;
  if (String(s.discountedPrice ?? '').trim()) return true;
  if ((s.tags || []).length > 0) return true;
  if ((s.collections || []).length > 0) return true;
  if ((s.subscriptionPlans || []).length > 0) return true;
  if ((s.subscriptionPlanIds || []).length > 0) return true;
  return false;
});

const hasGalleryProgress = computed(
  () => ((listingFlow.state?.galleryUploaded || []).length > 0),
);

const hasInventoryProgress = computed(() => {
  const s = listingFlow.state || {};
  if (String(s.stockAmount || '').trim()) return true;
  if (s.unlimitedStock) return true;
  if (s.limitOnePerBuyer) return true;
  if (String(s.packageWeight || '').trim()) return true;
  if (String(s.originCountry || '').trim()) return true;
  if (String(s.estimatedShippingDays || '').trim()) return true;
  if (s.shipInternationally) return true;
  if (String(s.intlShippingDays || '').trim()) return true;
  if (String(s.additionalShippingCost || '').trim()) return true;
  return false;
});

const hasPublishProgress = computed(() => {
  const s = listingFlow.state || {};
  if (s.publishSubstep && s.publishSubstep !== 'publishImmediately') return true;
  if (String(s.publishDate || '').trim()) return true;
  if (s.openForPreorder) return true;
  if (String(s.preorderPrice ?? '').trim()) return true;
  if (s.afterPreorderAction && s.afterPreorderAction !== 'keepInStore') return true;
  return false;
});

/** Snapshot after open/hydrate — leave confirm only if user actually changed fields. */
const baselineSnapshot = ref('');

function galleryComparable(list) {
  return (Array.isArray(list) ? list : []).map((entry) => ({
    id: entry?.id || '',
    name: entry?.name || '',
    dataUrl: entry?.dataUrl || (!isBlobUrl(entry?.objectUrl) ? (entry?.objectUrl || '') : ''),
  }));
}

function getComparableSnapshot() {
  const s = listingFlow.state || {};
  return JSON.stringify(
    toPersistableState({
      productName: String(s.productName || '').trim(),
      description: String(s.description || '').trim(),
      subscribersOnly: Boolean(s.subscribersOnly),
      originalPrice: String(s.originalPrice ?? '').trim(),
      discountedPrice: String(s.discountedPrice ?? '').trim(),
      tags: s.tags || [],
      collections: s.collections || [],
      subscriptionPlans: s.subscriptionPlans || [],
      subscriptionPlanIds: s.subscriptionPlanIds || [],
      galleryUploaded: galleryComparable(s.galleryUploaded),
      stockAmount: String(s.stockAmount ?? '').trim(),
      unlimitedStock: Boolean(s.unlimitedStock),
      limitOnePerBuyer: Boolean(s.limitOnePerBuyer),
      packageWeight: String(s.packageWeight ?? '').trim(),
      weightUnit: s.weightUnit || 'lb',
      originCountry: s.originCountry || '',
      estimatedShippingDays: String(s.estimatedShippingDays ?? '').trim(),
      shipInternationally: Boolean(s.shipInternationally),
      intlShippingDays: String(s.intlShippingDays ?? '').trim(),
      additionalShippingCost: String(s.additionalShippingCost ?? '').trim(),
      publishSubstep: s.publishSubstep || 'publishImmediately',
      publishDate: String(s.publishDate || '').trim(),
      openForPreorder: Boolean(s.openForPreorder),
      preorderPrice: String(s.preorderPrice ?? '').trim(),
      afterPreorderAction: s.afterPreorderAction || 'keepInStore',
    }),
  );
}

function captureBaseline() {
  baselineSnapshot.value = getComparableSnapshot();
}

const hasUnsavedProgress = computed(() => {
  if (!baselineSnapshot.value) return false;
  return getComparableSnapshot() !== baselineSnapshot.value;
});

const canGoNext = computed(() => {
  // Steps with interactionsEngine validate on click + smooth-scroll to first warning.
  if (listingFlow.step === 1) return true;
  if (listingFlow.step === 2) return hasGalleryProgress.value;
  if (listingFlow.step === 3) return true;
  if (listingFlow.step === 4) return true;
  return true;
});

const isEditMode = computed(() => props.mode === 'edit');

/**
 * Stop Pre-Order banner: live / in-review / published with pre-order still on.
 * Hidden for draft (e.g. after Stop → Unpublish) even if toggle residue exists.
 */
const isActivePreorderPeriod = computed(() => {
  const item = props.initialItem;
  if (!item) return false;
  if (item.status === 'preorder') return true;
  if (item.status === 'draft') return false;
  return Boolean(item.openForPreorder);
});

const popupTitle = computed(() =>
  isEditMode.value
    ? t('shops.merch.listing.editTitle')
    : t('shops.merch.listing.title'),
);

const isSubmitStep = computed(() => listingFlow.step === 4);

const footerPrimaryLabel = computed(() =>
  isSubmitStep.value
    ? t('shops.merch.listing.submitForApproval')
    : t('shops.merch.listing.next'),
);

/** Create Next / Submit — same demo polygonLeft colors; grey when blocked. */
const nextBtnBg = computed(() => (canGoNext.value ? '#07f468' : '#3440540D'));
const nextBtnText = computed(() => (canGoNext.value ? 'black' : '#98A2B3'));
const nextBtnHoverBg = computed(() => (canGoNext.value ? 'black' : '#3440540D'));
const nextBtnHoverText = computed(() => (canGoNext.value ? '#07f468' : '#98A2B3'));

/** Next and Submit for Approval share the same arrow; only the label changes. */
const footerPrimaryIconClass = computed(() =>
  canGoNext.value ? mediaPolygonNextIconClass : mediaPolygonNextIconDisabledClass,
);

/** Static catalogs for design — isolated from media uploader store */
const tagCatalog = [
  { id: 'tag_apple', name: 'Apple' },
  { id: 'tag_april', name: 'April' },
  { id: 'tag_apricote', name: 'Apricote' },
  { id: 'tag_ape', name: 'Ape' },
  { id: 'tag_audio_only', name: 'Audio only' },
  { id: 'tag_big_smile', name: 'Big smile' },
  { id: 'tag_big_energy', name: 'Big Energy' },
  { id: 'tag_big_nose', name: 'Big nose' },
  { id: 'tag_big_appetite', name: 'Big Appetite' },
  { id: 'tag_boy', name: 'Boy' },
  { id: 'tag_cantonese', name: 'Cantonese' },
  { id: 'tag_chinese', name: 'Chinese' },
  { id: 'tag_cosplay', name: 'Cosplay' },
  { id: 'tag_dumplings', name: 'Dumplings' },
  { id: 'tag_dumpz', name: 'Dumpz' },
  { id: 'tag_drinking', name: 'Drinking' },
];

const tagHistory = [];

const collectionCatalog = [
  { id: 'col_personal', name: 'Personal Fav' },
  { id: 'col_featured', name: 'Featured' },
  { id: 'col_cheese', name: 'Cheese tasting 101' },
];

const popupConfig = {
  actionType: 'slideIn',
  from: 'right',
  offset: '0px',
  speed: '0ms',
  effect: 'ease-in-out',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,
  shouldLockBodyScroll: true,
  shouldCloseOnEscape: true,
  width: { default: '100%', '>768': '55.9375rem' },
  height: { default: '100%' },
  // BasePopup panel is the scroll container — do not nest overflow-hidden on slot content.
  scrollable: true,
  closeSpeed: '0ms',
  closeEffect: 'instant',
};

function onPopupModelUpdate(val) {
  if (val === false) {
    requestClose();
    return;
  }
  emit('update:modelValue', true);
}

function requestClose() {
  if (skipLeaveConfirm) {
    skipLeaveConfirm = false;
    leaveConfirmOpen.value = false;
    emit('update:modelValue', false);
    return;
  }
  if (hasUnsavedProgress.value) {
    leaveConfirmOpen.value = true;
    return;
  }
  leaveConfirmOpen.value = false;
  emit('update:modelValue', false);
}

function forceClose() {
  skipLeaveConfirm = true;
  leaveConfirmOpen.value = false;
  emit('update:modelValue', false);
}

async function persistableGallery(list) {
  const out = [];
  for (const item of list || []) {
    let dataUrl = item?.dataUrl || '';
    if (!dataUrl && item?.file instanceof File) {
      try {
        dataUrl = await fileToDataUrl(item.file);
      } catch {
        /* ignore */
      }
    }
    if (!dataUrl && item?.objectUrl && !isBlobUrl(item.objectUrl)) {
      dataUrl = item.objectUrl;
    }
    if (!dataUrl && item?.objectUrl && isBlobUrl(item.objectUrl)) {
      try {
        const res = await fetch(item.objectUrl);
        const blob = await res.blob();
        dataUrl = await fileToDataUrl(blob);
      } catch {
        /* blob may already be revoked */
      }
    }
    out.push({
      id: item?.id,
      name: item?.name || '',
      objectUrl: dataUrl || item?.objectUrl || '',
      dataUrl: dataUrl || '',
    });
  }
  return out;
}

async function buildListingPayload(status) {
  const galleryUploaded = await persistableGallery(listingFlow.state.galleryUploaded);
  listingFlow.setState('galleryUploaded', galleryUploaded);
  const listingState = toPersistableState({
    ...listingFlow.state,
    galleryUploaded,
  });
  return {
    id: props.initialItem?.id || null,
    status,
    productName: String(listingFlow.state.productName || '').trim(),
    listingState,
  };
}

async function onSaveDraft() {
  const payload = await buildListingPayload('draft');
  emit('save-draft', payload);
  forceClose();
}

function onLeaveWithoutSaving() {
  forceClose();
}

function onEndPreorder(payload) {
  emit('end-preorder', {
    action: payload?.action === 'unpublish' ? 'unpublish' : 'keepInStore',
    productName: String(payload?.productName || listingFlow.state.productName || '').trim(),
  });
  forceClose();
}

function validateActiveStep() {
  const current = listingFlow.step;
  if (current === 1) {
    return productDetailsStepRef.value?.validateStep?.() ?? true;
  }
  if (current === 3) {
    return inventoryStepRef.value?.validateStep?.() ?? true;
  }
  if (current === 4) {
    return publishStepRef.value?.validateStep?.() ?? true;
  }
  return true;
}

async function onSaveEdit() {
  if (!validateActiveStep()) return;
  const currentStatus = props.initialItem?.status || 'published';
  const payload = await buildListingPayload(currentStatus);
  emit('saved', payload);
  forceClose();
}

async function onNext() {
  if (!canGoNext.value) return;
  const current = listingFlow.step;

  if (!validateActiveStep()) return;

  if (current === 4) {
    const payload = await buildListingPayload('reviewing');
    emit('save-draft', payload);
    forceClose();
    return;
  }

  if (current < 4) {
    void listingFlow.forceStep(current + 1);
  }
}

function toNamedItems(list, prefix) {
  if (!Array.isArray(list)) return [];
  return list.map((entry, index) => {
    if (entry && typeof entry === 'object') {
      return {
        id: entry.id || `${prefix}_${index}`,
        name: entry.name || entry.label || String(entry),
      };
    }
    const name = String(entry || '').trim();
    return { id: `${prefix}_${name || index}`, name };
  }).filter((entry) => entry.name);
}

async function resolveGalleryForEdit(item, listing) {
  const raw = Array.isArray(listing.galleryUploaded || item.galleryUploaded)
    ? [...(listing.galleryUploaded || item.galleryUploaded)]
    : [];
  if (galleryHasMedia(raw)) return raw;
  if (!item?.id) return raw;
  const fromIdb = await loadMerchGallery(item.id);
  if (fromIdb.length) return fromIdb;
  // Last resort for lean localStorage rows: card thumb still held the first image.
  const thumb = typeof item.thumbnail === 'string' ? item.thumbnail : '';
  if (thumb && raw.length) {
    return raw.map((entry, index) => {
      if (index !== 0) return entry;
      if (entry?.dataUrl || entry?.objectUrl) return entry;
      return { ...entry, dataUrl: thumb, objectUrl: thumb };
    });
  }
  return raw;
}

async function applyInitialItem(item) {
  if (!item) return;
  const listing = item.listingState && typeof item.listingState === 'object'
    ? item.listingState
    : item;
  listingFlow.setState('productName', String(listing.productName || item.title || '').trim());
  listingFlow.setState('description', String(listing.description || item.description || '').trim());
  listingFlow.setState('subscribersOnly', Boolean(listing.subscribersOnly ?? item.subscribersOnly));
  listingFlow.setState(
    'originalPrice',
    listing.originalPrice != null
      ? String(listing.originalPrice)
      : (item.originalPrice != null ? String(item.originalPrice) : (item.price != null ? String(item.price) : '')),
  );
  listingFlow.setState(
    'discountedPrice',
    listing.discountedPrice != null
      ? String(listing.discountedPrice)
      : (item.discountedPrice != null ? String(item.discountedPrice) : (item.finalPrice != null ? String(item.finalPrice) : '')),
  );
  listingFlow.setState('tags', toNamedItems(listing.tags || item.tags, 'tag'));
  listingFlow.setState('collections', toNamedItems(listing.collections || item.collections, 'col'));
  listingFlow.setState(
    'subscriptionPlans',
    Array.isArray(listing.subscriptionPlans || item.subscriptionPlans)
      ? [...(listing.subscriptionPlans || item.subscriptionPlans)]
      : [],
  );
  listingFlow.setState(
    'subscriptionPlanIds',
    Array.isArray(listing.subscriptionPlanIds || item.subscriptionPlanIds)
      ? [...(listing.subscriptionPlanIds || item.subscriptionPlanIds)]
      : [],
  );
  const galleryUploaded = await resolveGalleryForEdit(item, listing);
  listingFlow.setState('galleryUploaded', galleryUploaded);
  const stockRaw = listing.stockAmount ?? item.stockAmount ?? item.stock;
  listingFlow.setState('stockAmount', stockRaw != null && stockRaw !== '' ? String(stockRaw) : '');
  listingFlow.setState('unlimitedStock', Boolean(listing.unlimitedStock ?? item.unlimitedStock));
  listingFlow.setState('limitOnePerBuyer', Boolean(listing.limitOnePerBuyer ?? item.limitOnePerBuyer));
  listingFlow.setState(
    'packageWeight',
    (listing.packageWeight ?? item.packageWeight) != null
      ? String(listing.packageWeight ?? item.packageWeight)
      : '',
  );
  listingFlow.setState('weightUnit', listing.weightUnit || item.weightUnit || 'lb');
  listingFlow.setState('originCountry', listing.originCountry || item.originCountry || '');
  listingFlow.setState(
    'estimatedShippingDays',
    (listing.estimatedShippingDays ?? item.estimatedShippingDays) != null
      ? String(listing.estimatedShippingDays ?? item.estimatedShippingDays)
      : '',
  );
  listingFlow.setState(
    'shipInternationally',
    Boolean(listing.shipInternationally ?? item.shipInternationally),
  );
  listingFlow.setState(
    'intlShippingDays',
    (listing.intlShippingDays ?? item.intlShippingDays) != null
      ? String(listing.intlShippingDays ?? item.intlShippingDays)
      : '',
  );
  listingFlow.setState(
    'additionalShippingCost',
    (listing.additionalShippingCost ?? item.additionalShippingCost) != null
      ? String(listing.additionalShippingCost ?? item.additionalShippingCost)
      : '',
  );
  listingFlow.setState(
    'publishSubstep',
    listing.publishSubstep || item.publishSubstep || 'publishImmediately',
  );
  listingFlow.setState('publishDate', listing.publishDate || item.publishDate || '');
  // After Stop Pre-Order, library clears openForPreorder; never revive from stale status alone
  // once status is no longer `preorder`.
  listingFlow.setState(
    'openForPreorder',
    item.status === 'preorder'
      ? true
      : Boolean(listing.openForPreorder ?? item.openForPreorder),
  );
  listingFlow.setState(
    'preorderPrice',
    (listing.preorderPrice ?? item.preorderPrice) != null
      ? String(listing.preorderPrice ?? item.preorderPrice)
      : '',
  );
  listingFlow.setState(
    'afterPreorderAction',
    listing.afterPreorderAction || item.afterPreorderAction || 'keepInStore',
  );
}

function resetFlow() {
  listingFlow.setState('productName', '');
  listingFlow.setState('description', '');
  listingFlow.setState('subscribersOnly', false);
  listingFlow.setState('originalPrice', '');
  listingFlow.setState('discountedPrice', '');
  listingFlow.setState('tags', []);
  listingFlow.setState('collections', []);
  listingFlow.setState('subscriptionPlans', []);
  listingFlow.setState('subscriptionPlanIds', []);
  listingFlow.setState('galleryUploaded', []);
  listingFlow.setState('stockAmount', '');
  listingFlow.setState('unlimitedStock', false);
  listingFlow.setState('limitOnePerBuyer', false);
  listingFlow.setState('packageWeight', '');
  listingFlow.setState('weightUnit', 'lb');
  listingFlow.setState('originCountry', '');
  listingFlow.setState('estimatedShippingDays', '');
  listingFlow.setState('shipInternationally', false);
  listingFlow.setState('intlShippingDays', '');
  listingFlow.setState('additionalShippingCost', '');
  listingFlow.setState('publishSubstep', 'publishImmediately');
  listingFlow.setState('publishDate', '');
  listingFlow.setState('openForPreorder', false);
  listingFlow.setState('preorderPrice', '');
  listingFlow.setState('afterPreorderAction', 'keepInStore');
  void listingFlow.forceStep(1);
}

function resolveOpenStep() {
  const step = Number(props.initialStep);
  if (!Number.isFinite(step)) return 1;
  return Math.min(4, Math.max(1, Math.floor(step)));
}

watch(
  () => props.modelValue,
  async (open) => {
    if (open) {
      leaveConfirmOpen.value = false;
      skipLeaveConfirm = false;
      resetFlow();
      if (isEditMode.value && props.initialItem) {
        await applyInitialItem(props.initialItem);
      }
      await listingFlow.forceStep(resolveOpenStep());
      await nextTick();
      captureBaseline();
      return;
    }
    leaveConfirmOpen.value = false;
    baselineSnapshot.value = '';
    resetFlow();
  },
);
</script>

<template>
  <BasePopup
    :modelValue="modelValue"
    :popup-config="popupConfig"
    @update:modelValue="onPopupModelUpdate"
  >
    <div
      data-component="merch-listing-popup"
      data-merch-listing-popup
      class="relative flex min-h-full w-full flex-col bg-[#F9FAFBE5] backdrop-blur-[30px] shadow-[0px_0px_10px_0px_#00000040]"
    >
      <div class="relative z-[1] w-full flex justify-between items-center py-4 px-4 md:px-6">
        <Heading
          :text="popupTitle"
          tag="h2"
          theme="custom"
          no-wrap
          add-class="text-lg font-medium text-text-quaternary"
        />

        <button
          type="button"
          class="cursor-pointer p-1 hover:opacity-80"
          :aria-label="t('shops.merch.listing.closeAlt')"
          @click="requestClose"
        >
          <img
            v-if="closeIconUrl"
            :src="closeIconUrl"
            :alt="t('shops.merch.listing.closeAlt')"
            class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(68%)_sepia(8%)_saturate(456%)_hue-rotate(182deg)_brightness(92%)_contrast(87%)]"
          />
        </button>
      </div>

      <DashboardWizardSteps
        v-model="activeStep"
        :steps="steps"
      />

      <div class="relative z-[1] flex-1 overflow-visible px-6 py-4 pb-6">
        <MerchProductDetailsStep
          v-if="activeStep === 1"
          ref="productDetailsStepRef"
          :engine="listingFlow"
          :tag-catalog="tagCatalog"
          :tag-history="tagHistory"
          :collection-catalog="collectionCatalog"
        />

        <MerchGalleryStep
          v-else-if="activeStep === 2"
          :engine="listingFlow"
        />

        <MerchInventoryShipmentStep
          v-else-if="activeStep === 3"
          ref="inventoryStepRef"
          :engine="listingFlow"
        />

        <MerchPublishSettingsStep
          v-else-if="activeStep === 4"
          ref="publishStepRef"
          :engine="listingFlow"
          :is-edit-mode="isEditMode"
          :is-active-preorder="isActivePreorderPeriod"
          @end-preorder="onEndPreorder"
        />

        <div
          v-else
          class="text-sm text-text-quaternary"
        >
          {{ t('shops.merch.listing.stepPlaceholder') }}
        </div>
      </div>

      <!-- Edit Merch Details: SAVE — bottom-right in document flow -->
      <div
        v-if="isEditMode"
        class="relative bottom-0 mt-auto flex w-full items-end justify-end"
      >
        <DashboardPrimaryButton
          :text="t('shops.merch.listing.save')"
          variant="polygonLeft"
          type="button"
          :leftIcon="saveCheckUrl"
          :leftIconClass="saveIconClass"
          :customClass="footerSaveBtnClass"
          btnBg="#07f468"
          btnHoverBg="black"
          btnText="black"
          btnHoverText="#07f468"
          @click="onSaveEdit"
        />
      </div>

      <!-- Create: Save as Draft + Next / Submit for Approval -->
      <div
        v-else
        class="relative bottom-0 mt-auto flex w-full items-end justify-between"
      >
        <DashboardPrimaryButton
          :text="t('shops.merch.listing.saveAsDraft')"
          variant="polygonRight"
          :leftIcon="draftIconUrl"
          :leftIconClass="draftIconClass"
          :customClass="footerDraftBtnClass"
          type="button"
          @click="onSaveDraft"
        />

        <DashboardPrimaryButton
          :text="footerPrimaryLabel"
          variant="polygonLeft"
          type="button"
          :rightIcon="nextIconUrl"
          :rightIconClass="footerPrimaryIconClass"
          :btnBg="nextBtnBg"
          :btnHoverBg="nextBtnHoverBg"
          :btnText="nextBtnText"
          :btnHoverText="nextBtnHoverText"
          :disabled="!canGoNext"
          :customClass="footerPrimaryBtnClass"
          @click="onNext"
        />
      </div>

      <!-- Leave confirm — same CancelUploadPopup as media uploader -->
      <CancelUploadPopup
        v-model="leaveConfirmOpen"
        mode="leave"
        nested
        contain
        :title="t('mediaUploader.uploadPopup.leaveConfirm.title')"
        :message="t('mediaUploader.uploadPopup.leaveConfirm.description')"
        :cancel-label="t('mediaUploader.uploadPopup.leaveConfirm.saveDraft')"
        :confirm-label="t('mediaUploader.uploadPopup.leaveConfirm.leave')"
        @save-draft="onSaveDraft"
        @delete="onLeaveWithoutSaving"
      />
    </div>
  </BasePopup>
</template>
