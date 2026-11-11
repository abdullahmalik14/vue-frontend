<script setup>
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
import BaseTooltip from '@/components/ui/tooltips/BaseTooltip.vue';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import QuillEditor from '@/components/forms/inputs/QuillEditor.vue';
import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';
import MediaUploadTypeTabs from '@/components/media/uploader/parts/MediaUploadTypeTabs.vue';
import MediaUploadProgressState from '@/components/media/uploader/parts/MediaUploadProgressState.vue';
import ImageCropperModal from '@/components/ui/popups/ImageCropperModal.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import SubscriberDiscountPopup from '@/dev/components/ui/popups/plan/SubscriberDiscountPopup.vue';
import UnsubscribeDiscountPopup from '@/dev/components/ui/popups/plan/UnsubscribeDiscountPopup.vue';
import PlanConfirmPopup from '@/dev/components/ui/popups/plan/PlanConfirmPopup.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import { usePlanAssets } from '@/composables/usePlanAssets.js';

/** Plan Detail background image — JPEG/PNG, max 10MB (matches uploadFileInfo copy). */
const BG_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

const { t } = useI18n();
const { assets } = usePlanAssets();

const props = defineProps({
  publishFlow: {
    type: Object,
    required: true,
  },
});

const bgUploaderRef = ref(null);
const showSubscriberDiscountPopup = ref(false);
const showUnsubscribeDiscountPopup = ref(false);
const inviteLinkCopied = ref(false);

/** Background: file → crop → progress → set bgImage */
const showBgCropper = ref(false);
const bgCropSrc = ref('');
const pendingBgObjectUrl = ref('');
const isBgUploading = ref(false);
const bgUploadProgress = ref(0);
/** Same bar: 0–50 uploading, 50–100 processing */
const bgUploadPhase = ref('uploading');
let bgUploadTimer = null;
const showBgImageError = ref(false);
/** `tooLarge` | `wrongFormat` — PlanConfirmPopup imageError */
const bgImageErrorKind = ref('tooLarge');

const hasSubscriberDiscount = computed(() => Boolean(props.publishFlow.state.subscriberDiscount));
const hasUnsubscribeDiscount = computed(() => Boolean(props.publishFlow.state.unsubscribeDiscount));
const subscriberDiscountEditValues = computed(() => props.publishFlow.state.subscriberDiscount);
const unsubscribeDiscountEditValues = computed(() => props.publishFlow.state.unsubscribeDiscount);

function formatDiscountMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return String(value ?? '');
  if (Number.isInteger(num)) return String(num);
  return num.toFixed(2).replace(/\.?0+$/, '');
}

function computeDiscountedFromBase(basePrice, discount) {
  const base = Number(basePrice);
  if (!Number.isFinite(base) || !discount) return null;
  const amount = Number(discount.discountAmount);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (discount.discountType === 'amount') return Math.max(0, base - amount);
  return Math.max(0, base * (1 - amount / 100));
}

const subscriberDiscountSummary = computed(() => {
  const discount = props.publishFlow.state.subscriberDiscount;
  if (!discount) return null;
  const base = props.publishFlow.state.basePrice;
  const discounted = computeDiscountedFromBase(base, discount);
  const percentLabel =
    discount.discountType === 'percent'
      ? `-${discount.discountAmount}%`
      : `-USD$ ${formatDiscountMoney(discount.discountAmount)}`;
  return {
    price: discounted != null ? formatDiscountMoney(discounted) : formatDiscountMoney(base || 0),
    percentLabel,
    dateRange: discount.dateRange || '',
    billingCycles: discount.billingCycles
      ? t('plan.detail.discountBillingCyclesCount', { count: discount.billingCycles })
      : '',
  };
});

const unsubscribeDiscountSummary = computed(() => {
  const discount = props.publishFlow.state.unsubscribeDiscount;
  if (!discount) return null;
  const base = props.publishFlow.state.basePrice;
  const discounted = computeDiscountedFromBase(base, discount);
  const percentLabel =
    discount.discountType === 'percent'
      ? `-${discount.discountAmount}%`
      : `-USD$ ${formatDiscountMoney(discount.discountAmount)}`;
  return {
    price: discounted != null ? formatDiscountMoney(discounted) : formatDiscountMoney(base || 0),
    percentLabel,
    billingCycles: discount.unlimitedTime
      ? t('plan.detail.unsubscribeDiscountPopup.unlimitedTime')
      : discount.billingCycles
        ? t('plan.detail.discountBillingCyclesCount', { count: discount.billingCycles })
        : '',
  };
});

const inviteLink = computed(() => t('plan.detail.inviteLink'));

const copyInviteLink = async () => {
  if (!inviteLink.value) return;
  try {
    await navigator.clipboard.writeText(inviteLink.value);
    inviteLinkCopied.value = true;
    setTimeout(() => {
      inviteLinkCopied.value = false;
    }, 1500);
  } catch {
    // clipboard may be unavailable in some environments
  }
};

const substepProxy = computed({
  get: () => props.publishFlow.state.planDetailSubstep,
  set: (val) => props.publishFlow.setState('planDetailSubstep', val),
});

const tierNameProxy = computed({
  get: () => props.publishFlow.state.tierName,
  set: (val) => props.publishFlow.setState('tierName', val),
});

const isFeaturedProxy = computed({
  get: () => props.publishFlow.state.isFeaturedTier,
  set: (val) => props.publishFlow.setState('isFeaturedTier', val),
});

const bgImageProxy = computed({
  get: () => props.publishFlow.state.bgImage,
  set: (val) => props.publishFlow.setState('bgImage', val),
});

const priceDurationProxy = computed({
  get: () => props.publishFlow.state.priceDuration,
  set: (val) => props.publishFlow.setState('priceDuration', val),
});

const basePriceProxy = computed({
  get: () => props.publishFlow.state.basePrice,
  set: (val) => props.publishFlow.setState('basePrice', val),
});

const tierAudienceProxy = computed({
  get: () => props.publishFlow.state.tierAudience,
  set: (val) => props.publishFlow.setState('tierAudience', val),
});

const maxSubscribersProxy = computed({
  get: () => props.publishFlow.state.maxSubscribers,
  set: (val) => props.publishFlow.setState('maxSubscribers', val),
});

const freeTokensProxy = computed({
  get: () => props.publishFlow.state.freeTokensDiscount,
  set: (val) => props.publishFlow.setState('freeTokensDiscount', val),
});

const merchDiscountProxy = computed({
  get: () => props.publishFlow.state.merchDiscount,
  set: (val) => props.publishFlow.setState('merchDiscount', val),
});

const applyMerchProxy = computed({
  get: () => props.publishFlow.state.applyMerchToSale,
  set: (val) => props.publishFlow.setState('applyMerchToSale', val),
});

const payToViewDiscountProxy = computed({
  get: () => props.publishFlow.state.payToViewDiscount,
  set: (val) => props.publishFlow.setState('payToViewDiscount', val),
});

const applyPayToViewProxy = computed({
  get: () => props.publishFlow.state.applyPayToViewToSale,
  set: (val) => props.publishFlow.setState('applyPayToViewToSale', val),
});

const customRequestDiscountProxy = computed({
  get: () => props.publishFlow.state.customRequestDiscount,
  set: (val) => props.publishFlow.setState('customRequestDiscount', val),
});

const applyCustomProxy = computed({
  get: () => props.publishFlow.state.applyCustomToSale,
  set: (val) => props.publishFlow.setState('applyCustomToSale', val),
});

function isMediaOptionSelected(value) {
  return (props.publishFlow.state.selectedMediaOptions || []).includes(value);
}

function toggleMediaOption(value, checked) {
  const current = [...(props.publishFlow.state.selectedMediaOptions || [])];
  const next = checked
    ? current.includes(value)
      ? current
      : [...current, value]
    : current.filter((item) => item !== value);
  props.publishFlow.setState('selectedMediaOptions', next);
}

const descriptionProxy = computed({
  get: () => props.publishFlow.state?.description || '',
  set: (val) => {
    if (props.publishFlow.setState) {
      props.publishFlow.setState('description', val);
    }
  },
});

// --- CUSTOM validation migrated to interactionsEngine (1-99 range, optional fields) ---
// Legacy behavior being preserved: empty or non-numeric values never show an error;
// only a genuinely out-of-range number (via minNum:1 / maxNum:99) does.
const SCOPE_ID = 'planDetail';

const rangeErrorMessage = computed(() => t('mediaUploader.addTier.rangeError'));

function buildRangeFieldConfig(fieldId) {
  return computed(() => ({
    scope: SCOPE_ID,
    id: fieldId,
    validation: {
      required: false,
      rules: [
        { type: 'minNum', param: 1, message: rangeErrorMessage.value },
        { type: 'maxNum', param: 99, message: rangeErrorMessage.value },
      ],
    },
    validateOnMount: true,
    validateOnInput: true,
  }));
}

const priceErrorMessage = computed(() => t('mediaUploader.addTier.originalPriceHint'));

const basePriceFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'basePrice',
  validation: {
    required: false,
    rules: [
      { type: 'minNum', param: 1.95, message: priceErrorMessage.value },
      { type: 'maxNum', param: 500, message: priceErrorMessage.value },
    ],
  },
  validateOnMount: true,
  validateOnInput: true,
}));

const freeTokensFieldConfig = buildRangeFieldConfig('freeTokensDiscount');
const merchFieldConfig = buildRangeFieldConfig('merchDiscount');
const payToViewFieldConfig = buildRangeFieldConfig('payToViewDiscount');
const customReqFieldConfig = buildRangeFieldConfig('customRequestDiscount');

const basePriceFieldState = computed(() => interactionsEngine.getFieldState(basePriceFieldConfig.value));
const freeTokensFieldState = computed(() => interactionsEngine.getFieldState(freeTokensFieldConfig.value));
const merchFieldState = computed(() => interactionsEngine.getFieldState(merchFieldConfig.value));
const payToViewFieldState = computed(() => interactionsEngine.getFieldState(payToViewFieldConfig.value));
const customReqFieldState = computed(() => interactionsEngine.getFieldState(customReqFieldConfig.value));

// Empty optional fields (and any value that doesn't even parse to a number) must never
// show an error — mirrors the previous `value !== '' && (val < 1 || val > 99)` computeds,
// where NaN comparisons always fell through to `false`.
function isRangeInvalid(rawValue, fieldState) {
  if (rawValue === '' || rawValue === null || rawValue === undefined) return false;
  if (!Number.isFinite(Number(rawValue))) return false;
  return !!fieldState && !fieldState.isValid;
}

const basePriceError = computed(() => {
  // Free tier has no base price — never block on price range.
  if (substepProxy.value === 'free-tier') return false;
  return isRangeInvalid(basePriceProxy.value, basePriceFieldState.value);
});
const freeTokensError = computed(() => isRangeInvalid(freeTokensProxy.value, freeTokensFieldState.value));
const merchError = computed(() => isRangeInvalid(merchDiscountProxy.value, merchFieldState.value));
const payToViewError = computed(() => isRangeInvalid(payToViewDiscountProxy.value, payToViewFieldState.value));
const customReqError = computed(() => isRangeInvalid(customRequestDiscountProxy.value, customReqFieldState.value));

/** True when Plan Detail has out-of-range warnings — blocks next step, not Save as draft. */
const hasBlockingErrors = computed(
  () =>
    basePriceError.value
    || freeTokensError.value
    || merchError.value
    || payToViewError.value
    || customReqError.value,
);

const basePriceDescriptionClass = computed(() =>
  basePriceError.value
    ? 'text-[#FF4405] opacity-100'
    : 'text-xs leading-normal text-[#475467] md:text-sm dark:text-[#b1aba0]',
);

onMounted(() => {
  interactionsEngine.register(basePriceFieldConfig.value, basePriceProxy.value, null);
  interactionsEngine.register(freeTokensFieldConfig.value, freeTokensProxy.value, null);
  interactionsEngine.register(merchFieldConfig.value, merchDiscountProxy.value, null);
  interactionsEngine.register(payToViewFieldConfig.value, payToViewDiscountProxy.value, null);
  interactionsEngine.register(customReqFieldConfig.value, customRequestDiscountProxy.value, null);
});

onBeforeUnmount(() => {
  interactionsEngine.clearScope(SCOPE_ID);
  clearBgUploadTimer();
});

watch(basePriceProxy, (val) => {
  interactionsEngine.processFieldChange(basePriceFieldConfig.value, val);
});
watch(freeTokensProxy, (val) => {
  interactionsEngine.processFieldChange(freeTokensFieldConfig.value, val);
});
watch(merchDiscountProxy, (val) => {
  interactionsEngine.processFieldChange(merchFieldConfig.value, val);
});
watch(payToViewDiscountProxy, (val) => {
  interactionsEngine.processFieldChange(payToViewFieldConfig.value, val);
});
watch(customRequestDiscountProxy, (val) => {
  interactionsEngine.processFieldChange(customReqFieldConfig.value, val);
});

function clearBgUploadTimer() {
  if (bgUploadTimer != null) {
    clearInterval(bgUploadTimer);
    bgUploadTimer = null;
  }
}

function revokePendingBgUrl() {
  if (pendingBgObjectUrl.value && pendingBgObjectUrl.value.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(pendingBgObjectUrl.value);
    } catch {
      /* ignore */
    }
  }
  pendingBgObjectUrl.value = '';
  bgCropSrc.value = '';
}

/** blob: URLs are stripped by toPersistableState — persist as data URL instead. */
async function blobUrlToDataUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:')) return url;
  if (!url.startsWith('blob:')) return url;
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('readAsDataURL failed'));
    reader.readAsDataURL(blob);
  });
}

const onBackgroundImageSelected = ({ objectUrl }) => {
  clearBgUploadTimer();
  isBgUploading.value = false;
  bgUploadProgress.value = 0;
  bgUploadPhase.value = 'uploading';
  if (pendingBgObjectUrl.value && pendingBgObjectUrl.value !== objectUrl) {
    revokePendingBgUrl();
  }
  pendingBgObjectUrl.value = objectUrl || '';
  bgCropSrc.value = objectUrl || '';
  showBgCropper.value = true;
};

function onBackgroundImageRejected({ reason } = {}) {
  bgImageErrorKind.value = reason === 'format' ? 'wrongFormat' : 'tooLarge';
  showBgImageError.value = true;
  bgUploaderRef.value?.reset?.();
}

function onBgImageErrorBack() {
  showBgImageError.value = false;
}

function onBgCropCancel() {
  showBgCropper.value = false;
  revokePendingBgUrl();
  bgUploaderRef.value?.reset?.();
}

function isBgCropperOpen() {
  return showBgCropper.value;
}

function closeBgCropper() {
  if (!showBgCropper.value) return false;
  onBgCropCancel();
  return true;
}

/** Scroll first out-of-range Plan Detail field into view (Save & Publish). */
function scrollToFirstError() {
  const order = [
    [basePriceError.value, 'input_base_price'],
    [freeTokensError.value, 'input_free_tokens'],
    [merchError.value, 'input_merch'],
    [payToViewError.value, 'input_p2v'],
    [customReqError.value, 'input_custom'],
  ];
  const targetId = order.find(([hasError]) => hasError)?.[1];
  if (!targetId || typeof document === 'undefined') return false;
  const el = document.getElementById(targetId);
  if (!el) return false;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const input = el.matches?.('input') ? el : el.querySelector?.('input');
  input?.focus?.({ preventScroll: true });
  return true;
}

defineExpose({
  isBgCropperOpen,
  closeBgCropper,
  hasBlockingErrors,
  scrollToFirstError,
});

function onBgCropUpload() {
  showBgCropper.value = false;
  if (!pendingBgObjectUrl.value) return;

  clearBgUploadTimer();
  isBgUploading.value = true;
  bgUploadProgress.value = 0;
  bgUploadPhase.value = 'uploading';

  const objectUrl = pendingBgObjectUrl.value;
  let persistBgPromise = blobUrlToDataUrl(objectUrl).catch(() => objectUrl);

  bgUploadTimer = setInterval(() => {
    bgUploadProgress.value = Math.min(100, bgUploadProgress.value + 4);
    bgUploadPhase.value =
      bgUploadProgress.value < 50 ? 'uploading' : 'processing';
    if (bgUploadProgress.value >= 100) {
      clearBgUploadTimer();
      persistBgPromise.then((dataUrl) => {
        props.publishFlow.setState('bgImage', dataUrl || objectUrl);
        if (objectUrl.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(objectUrl);
          } catch {
            /* ignore */
          }
        }
        pendingBgObjectUrl.value = '';
        bgCropSrc.value = '';
        isBgUploading.value = false;
        bgUploadProgress.value = 0;
        bgUploadPhase.value = 'uploading';
        bgUploaderRef.value?.reset?.();
      });
    }
  }, 80);
}

function cancelBgUpload() {
  clearBgUploadTimer();
  isBgUploading.value = false;
  bgUploadProgress.value = 0;
  bgUploadPhase.value = 'uploading';
  revokePendingBgUrl();
  bgUploaderRef.value?.reset?.();
}

const removeImage = () => {
  clearBgUploadTimer();
  isBgUploading.value = false;
  bgUploadProgress.value = 0;
  bgUploadPhase.value = 'uploading';
  revokePendingBgUrl();
  props.publishFlow.setState('bgImage', null);
  bgUploaderRef.value?.reset?.();
};

const tierTypeTabs = computed(() => [
  { id: 'free-tier', label: t('plan.detail.freeTier') },
  { id: 'paid-tier', label: t('plan.detail.paidTiers') },
]);

function openAddSubscriberDiscount() {
  showSubscriberDiscountPopup.value = true;
}

function openEditSubscriberDiscount() {
  showSubscriberDiscountPopup.value = true;
}

function removeSubscriberDiscount() {
  props.publishFlow.setState('subscriberDiscount', null);
}

function saveSubscriberDiscount(payload) {
  props.publishFlow.setState('subscriberDiscount', payload);
}

function openAddUnsubscribeDiscount() {
  showUnsubscribeDiscountPopup.value = true;
}

function openEditUnsubscribeDiscount() {
  showUnsubscribeDiscountPopup.value = true;
}

function removeUnsubscribeDiscount() {
  props.publishFlow.setState('unsubscribeDiscount', null);
}

function saveUnsubscribeDiscount(payload) {
  props.publishFlow.setState('unsubscribeDiscount', payload);
}

const durationOptions = computed(() => [
  { label: t('plan.detail.perDay'), value: 'day' },
  { label: t('plan.detail.perMonthDuration'), value: 'month' },
  { label: t('plan.detail.perYear'), value: 'year' },
]);

const audienceOptions = computed(() => [
  { label: t('plan.detail.audienceEveryone'), value: 'everyone' },
  { label: t('plan.detail.audienceInvited'), value: 'invited' },
]);

const featureOptions = computed(() => [
  {
    value: 'some-content',
    label: t('plan.detail.mediaFeatures.someContent.label'),
    tags: [{ text: t('plan.detail.tagPublished'), variant: '#D1E0FF', class: 'text-[#155EEF]' }],
    metaText: t('plan.detail.mediaFeatures.someContent.meta'),
  },
  {
    value: 'more-content',
    label: t('plan.detail.mediaFeatures.moreContent.label'),
    tags: [{ text: t('plan.detail.tagPublished'), variant: '#D1E0FF', class: 'text-[#155EEF]' }],
    metaText: t('plan.detail.mediaFeatures.moreContent.meta'),
  },
  {
    value: 'some-more-content',
    label: t('plan.detail.mediaFeatures.someMoreContent.label'),
    tags: [{ text: t('plan.detail.tagPublished'), variant: '#D1E0FF', class: 'text-[#155EEF]' }],
    metaText: t('plan.detail.mediaFeatures.someMoreContent.meta'),
  },
  {
    value: 'even-more-content',
    label: t('plan.detail.mediaFeatures.evenMoreContent.label'),
    tags: [{ text: t('plan.detail.tagPublished'), variant: '#D1E0FF', class: 'text-[#155EEF]' }],
    metaText: t('plan.detail.mediaFeatures.evenMoreContent.meta'),
  },
  {
    value: 'even-some-more-content',
    label: t('plan.detail.mediaFeatures.evenSomeMoreContent.label'),
    tags: [{ text: t('plan.detail.tagDraft'), variant: '#F2F4F7', class: 'text-[#98A2B3]' }],
    metaText: t('plan.detail.mediaFeatures.evenSomeMoreContent.meta'),
  },
  {
    value: 'even-most-content',
    label: t('plan.detail.mediaFeatures.evenMostContent.label'),
    tags: [{ text: t('plan.detail.tagDraft'), variant: '#F2F4F7', class: 'text-[#98A2B3]' }],
    metaText: t('plan.detail.mediaFeatures.evenMostContent.meta'),
  },
  {
    value: 'even-more-most-content',
    label: t('plan.detail.mediaFeatures.evenMoreMostContent.label'),
    tags: [{ text: t('plan.detail.tagDraft'), variant: '#F2F4F7', class: 'text-[#98A2B3]' }],
    metaText: t('plan.detail.mediaFeatures.evenMoreMostContent.meta'),
  },
]);
</script>

<template>
  <div class="flex flex-col gap-6 grow md:gap-8">
    <section class="flex flex-col gap-4 px-2 py-4 bg-white/25 md:gap-6 md:p-4 dark:bg-[#181a1b40]">
      <Heading tag="h2" theme="custom" no-wrap add-class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]" :text="t('plan.detail.tierInformation')" />

      <div class="flex flex-col gap-1.5">
        <DashboardTextInput
          v-model="tierNameProxy"
          :placeholder="t('mediaUploader.addTier.tierNamePlaceholder')"
          :show-label="false"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <QuillEditor v-model="descriptionProxy" :placeholder="t('mediaUploader.addTier.tierDescriptionPlaceholder')" />
      </div>

      <section class="flex flex-col gap-2">
        <Heading tag="h3" theme="custom" no-wrap add-class="text-base font-semibold text-[#0C111D] md:text-lg md:font-medium dark:text-[#dbd8d3]" :text="t('mediaUploader.addTier.backgroundImage')" />

        <MediaUploadProgressState
          v-if="isBgUploading"
          :progress="bgUploadProgress"
          :phase="bgUploadPhase"
          compact
          @cancel="cancelBgUpload"
        />

        <ThumbnailUploader
          v-else-if="!bgImageProxy"
          ref="bgUploaderRef"
          :title="t('mediaUploader.addTier.uploadTitle')"
          :subtitle="t('mediaUploader.addTier.uploadSubtitle')"
          :file-info="t('mediaUploader.addTier.uploadFileInfo')"
          accept="image/jpeg, image/png"
          :max-size="BG_IMAGE_MAX_BYTES"
          :use-media-store="false"
          :show-selected-name="false"
          icon-variant="plain"
          underline-title
          full-area-click
          wrapper-class="cursor-pointer border-2 border-transparent bg-[rgba(0,0,0,0.05)] rounded-lg p-10 h-[12.1875rem] w-full flex flex-col items-center justify-center hover:border-[#0c111d] dark:hover:border-[#857c6d] hover:bg-[rgba(0,0,0,0.10)] dark:hover:bg-[rgba(0,0,0,0.05)] group relative"
          inner-wrapper-class="gap-2 w-full flex flex-col justify-center items-center self-stretch border-2 border-dashed border-transparent"
          title-class="text-sm font-semibold text-center text-[#0C111D] dark:text-[#dbd8d3]"
          title-highlight-class="text-sm font-semibold underline text-[#0C111D] dark:text-[#dbd8d3]"
          file-info-class="text-[#333333] text-sm leading-normal font-medium text-center tracking-[0.00875rem] opacity-70 dark:text-[#c8c3bc]"
          @file-selected="onBackgroundImageSelected"
          @file-rejected="onBackgroundImageRejected"
        >
          <template #icon>
            <img
              v-if="assets.backgroundUpload"
              :src="assets.backgroundUpload"
              :alt="t('mediaUploader.addTier.backgroundImage')"
              class="w-10 h-10 [filter:brightness(0)] dark:[filter:brightness(100%)]"
            />
          </template>
        </ThumbnailUploader>

        <div v-else class="w-full">
          <div class="relative w-[7.876rem] h-[12.5625rem] overflow-hidden">
            <img
              :src="bgImageProxy"
              :alt="t('mediaUploader.addTier.backgroundPreviewAlt')"
              class="h-full w-auto object-cover"
            />
            <button
              @click="removeImage"
              class="group absolute top-0 right-0 flex h-6 w-6 cursor-pointer items-center justify-center bg-[#FF0066] hover:bg-white dark:bg-[#cc0052] dark:hover:bg-white"
            >
              <img
                :src="assets.trash || ''"
                :alt="t('plan.detail.alt.trash')"
                class="h-5 w-5 brightness-0 invert transition-[filter] group-hover:[filter:brightness(0)_saturate(100%)_invert(18%)_sepia(98%)_saturate(7482%)_hue-rotate(325deg)_brightness(95%)_contrast(118%)]"
              />
            </button>
          </div>
        </div>
    
        <ImageCropperModal
          v-model="showBgCropper"
          confirm-mode="upload"
          :imageSrc="bgCropSrc"
          @upload="onBgCropUpload"
          @cancel="onBgCropCancel"
        />

        <PlanConfirmPopup
          v-model="showBgImageError"
          variant="imageError"
          :image-error-kind="bgImageErrorKind"
          max-width="22rem"
          @secondary="onBgImageErrorBack"
        />
      </section>

      <div class="flex flex-col gap-2">
        <CheckboxSwitch
          v-model="isFeaturedProxy"
          :label="t('plan.detail.featuredTier')"
          id="featured-tier"
          theme="planFeatured"
        />
        <div class="ml-12 flex flex-col gap-1">
          <Paragraph theme="custom" no-wrap add-class="text-sm text-[#0C111D] dark:text-[#dbd8d3]" :text="t('plan.detail.featuredHelp')" />
          <NotificationCard
            v-if="isFeaturedProxy"
            variant="alert"
            :showIcon="false"
            :closable="false"
            :title="t('plan.detail.featuredAlertTitle')"
            :description="t('plan.detail.featuredAlertDescription')"
          />
        </div>
      </div>
    </section>

    <section
      class="flex flex-col gap-4 px-2 py-4 bg-white/25 group/price-container paid-tier md:gap-6 md:p-4 dark:bg-[#181a1b40]"
    >
      <Heading tag="h2" theme="custom" no-wrap add-class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]" :text="t('plan.detail.priceSetting')" />

      <MediaUploadTypeTabs
        v-model="substepProxy"
        :tabs="tierTypeTabs"
        :tabs-aria-label="t('plan.detail.priceSetting')"
      />

      <div v-if="substepProxy === 'free-tier'" class="flex flex-col gap-4 animate-fade-in"></div>

      <div v-if="substepProxy === 'paid-tier'" class="flex flex-col gap-4 animate-fade-in">
        <div class="flex-col gap-4 flex">
          <Heading tag="h3" theme="custom" no-wrap add-class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3] md:text-lg" :text="t('plan.detail.subscriptionBasePrice')" />

          <div class="flex w-full items-start">
            <div class="flex-1 min-w-0">
              <DashboardTextInput
                type="number"
                id="input_base_price"
                v-model="basePriceProxy"
                left-span
                :left-span-text="t('mediaUploader.addTier.usd')"
                :description="t('mediaUploader.addTier.originalPriceHint')"
                :show-label="false"
                :show-controls="false"
              />
            </div>

            <div class="plan-detail-menu-frosted">
              <BasePlanDropdown v-model="priceDurationProxy" :options="durationOptions" widthClass="w-[11.25rem]" />
            </div>
          </div>
        </div>

        <div class="flex-col gap-4 flex">
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <Heading tag="h3" theme="custom" no-wrap add-class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3] md:text-lg" :text="t('plan.detail.subscriberDiscount')" />
              <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">
                {{ t('mediaUploader.addTier.optional') }}
              </span>
            </div>
            <Paragraph theme="custom" no-wrap add-class="text-base text-[#475467] dark:text-[#b1aba0]" :text="t('plan.detail.subscriberDiscountHelp')" />
          </div>

          <div v-if="hasSubscriberDiscount && subscriberDiscountSummary" class="flex flex-col gap-4 pb-2">
            <div class="flex items-center gap-2">
              <div>
                <span class="text-base font-medium align-middle text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('mediaUploader.addTier.usd') }}
                </span>
                <span
                  class="text-3xl leading-[2.375rem] font-semibold align-baseline text-[#0C111D] dark:text-[#dbd8d3]"
                >{{ subscriberDiscountSummary.price }}</span>
                <span class="text-xs leading-normal font-medium align-bottom text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('plan.detail.perMonth') }}
                </span>
              </div>
              <div class="flex justify-center items-center px-1 py-0.5 bg-[#FCE40D] dark:bg-[#a19102]">
                <span class="text-xs leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]">{{ subscriberDiscountSummary.percentLabel }}</span>
              </div>
            </div>
            <div class="flex flex-col gap-2 sm:flex-row sm:justify-between sm:flex-wrap">
              <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 sm:flex-wrap">
                <div v-if="subscriberDiscountSummary.dateRange" class="flex items-center gap-1">
                  <div class="flex justify-center items-center w-5 h-5">
                    <img :src="assets.weather" :alt="t('plan.detail.alt.weather')" class="w-4 h-4" />
                  </div>
                  <Paragraph theme="custom" no-wrap add-class="text-sm text-[#344054] dark:text-[#bdb7af]" :text="subscriberDiscountSummary.dateRange" />
                </div>
                <div v-if="subscriberDiscountSummary.billingCycles" class="flex items-center gap-1 pt-1">
                  <div class="flex justify-center items-center w-5 h-5">
                    <img :src="assets.calendar" :alt="t('plan.detail.alt.calendar')" class="w-4 h-4" />
                  </div>
                  <Paragraph theme="custom" no-wrap add-class="text-sm text-[#344054] dark:text-[#bdb7af]" :text="subscriberDiscountSummary.billingCycles" />
                </div>
              </div>
              <div class="flex justify-end items-center gap-4 sm:grow">
                <button
                  type="button"
                  class="flex justify-center items-center gap-0.5 outline-none cursor-pointer"
                  @click="openEditSubscriberDiscount"
                >
                  <img :src="assets.pen" :alt="t('plan.detail.alt.pen')" class="w-5 h-5" />
                  <span class="text-sm font-medium text-[#155EEF] dark:text-[#2c8df1]">
                    {{ t('plan.detail.edit') }}
                  </span>
                </button>
                <button
                  type="button"
                  class="flex justify-center items-center gap-0.5 outline-none cursor-pointer"
                  @click="removeSubscriberDiscount"
                >
                  <img :src="assets.trash" :alt="t('plan.detail.alt.trash')" class="w-5 h-5" />
                  <span class="text-sm font-medium text-[#FF0066] dark:text-[#ff1a76]">
                    {{ t('plan.detail.remove') }}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <DashboardPrimaryButton
            v-else
            :text="t('plan.detail.addDiscount')"
            theme="planAddDiscount"
            :leftIcon="assets.plusBlueSquare || assets.plusSquare"
            @click="openAddSubscriberDiscount"
          />
        </div>
      </div>
    </section>

    <SubscriberDiscountPopup
      v-model="showSubscriberDiscountPopup"
      :initial-values="subscriberDiscountEditValues"
      @save="saveSubscriberDiscount"
    />

    <section class="flex flex-col gap-4 px-2 py-4 bg-white/25 group/wrapper md:gap-6 md:p-4 dark:bg-[#181a1b40]">
      <Heading tag="h2" theme="custom" no-wrap add-class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]" :text="t('plan.detail.subscriberSetting')" />

      <section class="flex flex-col gap-2">
        <Heading tag="h3" theme="custom" no-wrap add-class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3] md:text-lg" :text="t('plan.detail.whoCanSubscribe')" />
        <div class="plan-detail-menu-frosted flex w-full">
          <BasePlanDropdown v-model="tierAudienceProxy" :options="audienceOptions" widthClass="w-full" />
        </div>

        <div v-if="tierAudienceProxy === 'invited'" class="flex flex-col gap-1.5">
          <Paragraph theme="custom" no-wrap add-class="text-[16px] font-normal text-[#344054] dark:text-[#bdb7af]" :text="t('plan.detail.sendSubscriptionLinkHelp')" />
          <DashboardTextInput
            :model-value="inviteLink"
            :add-attributes="{ readonly: true }"
            :right-icon="assets.copy"
            clickable-right-icon
            right-span
            :right-span-text="inviteLinkCopied ? t('plan.detail.copied') : t('plan.detail.copyLink')"
            right-span-class="text-sm font-semibold whitespace-nowrap text-medium-text dark:text-medium-beige cursor-pointer"
            :show-label="false"
            @right-icon-click="copyInviteLink"
          />
        </div>
      </section>

      <div class="flex flex-col gap-2">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <Heading tag="h3" theme="custom" no-wrap add-class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3] md:text-lg" :text="t('plan.detail.maximumSubscribers')" />
            <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">
              {{ t('mediaUploader.addTier.optional') }}
            </span>
          </div>
          <Paragraph theme="custom" no-wrap add-class="text-base text-[#344054] dark:text-[#bdb7af]" :text="t('plan.detail.maximumSubscribersHelp')" />

          <div class="flex flex-col gap-1.5">
            <DashboardTextInput
              v-model="maxSubscribersProxy"
              :placeholder="t('plan.detail.enterAmount')"
              :show-label="false"
            />
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <Heading tag="h3" theme="custom" no-wrap add-class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3] md:text-lg" :text="t('plan.detail.unsubscribeDiscount')" />
            <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">
              {{ t('mediaUploader.addTier.optional') }}
            </span>
          </div>
          <Paragraph theme="custom" no-wrap add-class="text-base font-normal text-[#475467] dark:text-[#b1aba0]" :text="t('plan.detail.unsubscribeDiscountHelp')" />
        </div>

        <div v-if="hasUnsubscribeDiscount && unsubscribeDiscountSummary" class="flex flex-col gap-4 pb-2">
          <div class="flex items-center gap-2">
            <div>
              <span class="text-base font-medium align-middle text-[#0C111D] dark:text-[#dbd8d3]">
                {{ t('mediaUploader.addTier.usd') }}
              </span>
              <span
                class="text-3xl leading-[2.375rem] font-semibold align-baseline text-[#0C111D] dark:text-[#dbd8d3]"
              >{{ unsubscribeDiscountSummary.price }}</span>
              <span class="text-xs leading-normal font-medium align-bottom text-[#0C111D] dark:text-[#dbd8d3]">
                {{ t('plan.detail.perMonth') }}
              </span>
            </div>
            <div class="flex justify-center items-center px-1 py-0.5 bg-[#FCE40D] dark:bg-[#a19102]">
              <span class="text-xs leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3]">{{ unsubscribeDiscountSummary.percentLabel }}</span>
            </div>
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:justify-between sm:flex-wrap">
            <div class="flex flex-col sm:flex-row sm:items-baseline sm:gap-3 sm:flex-wrap">
              <div v-if="unsubscribeDiscountSummary.billingCycles" class="flex items-center gap-1 pt-1">
                <div class="flex justify-center items-center w-5 h-5">
                  <img :src="assets.calendar" :alt="t('plan.detail.alt.calendar')" class="w-4 h-4" />
                </div>
                <Paragraph theme="custom" no-wrap add-class="text-sm text-[#344054] dark:text-[#bdb7af]" :text="unsubscribeDiscountSummary.billingCycles" />
              </div>
            </div>
            <div class="flex justify-end items-center gap-4 sm:grow">
              <button
                type="button"
                class="flex justify-center items-center gap-0.5 outline-none cursor-pointer"
                @click="openEditUnsubscribeDiscount"
              >
                <img :src="assets.pen" :alt="t('plan.detail.alt.pen')" class="w-5 h-5" />
                <span class="text-sm font-medium text-[#155EEF] dark:text-[#2c8df1]">
                  {{ t('plan.detail.edit') }}
                </span>
              </button>
              <button
                type="button"
                class="flex justify-center items-center gap-0.5 outline-none cursor-pointer"
                @click="removeUnsubscribeDiscount"
              >
                <img :src="assets.trash" :alt="t('plan.detail.alt.trash')" class="w-5 h-5" />
                <span class="text-sm font-medium text-[#FF0066] dark:text-[#ff1a76]">
                  {{ t('plan.detail.remove') }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <DashboardPrimaryButton
          v-else
          :text="t('plan.detail.addDiscount')"
          theme="planAddDiscount"
          :leftIcon="assets.plusBlueSquare || assets.plusSquare"
          @click="openAddUnsubscribeDiscount"
        />
      </div>
    </section>

    <UnsubscribeDiscountPopup
      v-model="showUnsubscribeDiscountPopup"
      :initial-values="unsubscribeDiscountEditValues"
      @save="saveUnsubscribeDiscount"
    />

    <div class="flex flex-col gap-4 px-2 py-4 bg-white/25 md:gap-6 md:p-4 dark:bg-[#181a1b40]">
      <div class="flex items-center gap-2 opacity-80">
        <Heading tag="h2" theme="custom" no-wrap add-class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]" :text="t('mediaUploader.addTier.subscriberBenefits')" />
        <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">
          {{ t('mediaUploader.addTier.optional') }}
        </span>
      </div>

      <div class="flex flex-col gap-4 md:gap-6">
        <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
          <div class="relative flex flex-col gap-2">
            <div class="flex items-center gap-2">
              <Heading tag="h3" theme="custom" no-wrap add-class="text-base font-semibold text-[#0C111D] md:text-lg dark:text-[#dbd8d3]" :text="t('mediaUploader.addTier.freeTokens')" />
              <BaseTooltip>
                <Paragraph theme="custom" no-wrap add-class="text-xs leading-normal font-medium text-white dark:text-[#dbd8d3]" :text="t('mediaUploader.addTier.freeTokensTooltip')" />
              </BaseTooltip>
            </div>
          </div>
          <DashboardTextInput
            id="input_free_tokens"
            type="number"
            v-model="freeTokensProxy"
            right-span
            :right-span-text="t('mediaUploader.addTier.tokensPerMonth')"
            :show-label="false"
            :show-controls="false"
            inline-error-icon
            :show-errors="freeTokensError"
            :errors="freeTokensError ? [{ message: t('mediaUploader.addTier.rangeError') }] : []"
            right-span-class="text-sm font-semibold whitespace-nowrap text-medium-text dark:text-medium-beige"
          />
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
          <div class="flex flex-col gap-2">
            <div class="relative flex items-center gap-2">
              <Heading tag="h3" theme="custom" no-wrap add-class="text-base font-semibold text-[#0C111D] md:text-lg dark:text-[#dbd8d3]" :text="t('mediaUploader.addTier.merchDiscount')" />
              <BaseTooltip>
                <ul>
                  <li
                    class="text-xs leading-normal font-medium text-white relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-[#dbd8d3]"
                  >
                    {{ t('mediaUploader.addTier.merchDiscountBullet1') }}
                  </li>
                  <li
                    class="text-xs leading-normal font-medium text-white relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-[#dbd8d3]"
                  >
                    {{ t('mediaUploader.addTier.merchDiscountBullet2') }}
                  </li>
                </ul>
              </BaseTooltip>
            </div>
            <CheckboxGroup
              :label="t('mediaUploader.addTier.applyOnSale')"
              v-model="applyMerchProxy"
              theme="successTick"
              labelClass="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]"
              wrapperClass="pl-1 flex items-center gap-3"
            />
          </div>
          <DashboardTextInput
            id="input_merch"
            type="number"
            v-model="merchDiscountProxy"
            right-span
            :right-span-text="t('mediaUploader.addTier.percentOff')"
            :show-label="false"
            :show-controls="false"
            inline-error-icon
            :show-errors="merchError"
            :errors="merchError ? [{ message: t('mediaUploader.addTier.rangeError') }] : []"
            right-span-class="text-sm font-semibold whitespace-nowrap text-medium-text dark:text-medium-beige"
          />
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
          <div class="flex flex-col gap-2">
            <div class="relative flex items-center gap-2">
              <Heading tag="h3" theme="custom" no-wrap add-class="text-base font-semibold text-[#0C111D] md:text-lg dark:text-[#dbd8d3]" :text="t('mediaUploader.addTier.payToViewDiscount')" />
              <BaseTooltip>
                <ul>
                  <li
                    class="text-xs leading-normal font-medium text-white relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-[#dbd8d3]"
                  >
                    {{ t('mediaUploader.addTier.payToViewDiscountBullet') }}
                  </li>
                </ul>
              </BaseTooltip>
            </div>
            <CheckboxGroup
              :label="t('mediaUploader.addTier.applyOnSale')"
              v-model="applyPayToViewProxy"
              theme="successTick"
              labelClass="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]"
              wrapperClass="pl-1 flex items-center gap-3"
            />
          </div>
          <DashboardTextInput
            id="input_p2v"
            type="number"
            v-model="payToViewDiscountProxy"
            right-span
            :right-span-text="t('mediaUploader.addTier.percentOff')"
            :show-label="false"
            :show-controls="false"
            inline-error-icon
            :show-errors="payToViewError"
            :errors="payToViewError ? [{ message: t('mediaUploader.addTier.rangeError') }] : []"
            right-span-class="text-sm font-semibold whitespace-nowrap text-medium-text dark:text-medium-beige"
          />
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
          <div class="flex flex-col gap-2">
            <div class="relative flex items-center gap-2">
              <Heading tag="h3" theme="custom" no-wrap add-class="text-base font-semibold text-[#0C111D] md:text-lg dark:text-[#dbd8d3]" :text="t('mediaUploader.addTier.customRequestDiscount')" />
              <BaseTooltip>
                <ul>
                  <li
                    class="text-xs leading-normal font-medium text-white relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-[#dbd8d3]"
                  >
                    {{ t('mediaUploader.addTier.customRequestBullet1') }}
                  </li>
                  <li
                    class="text-xs leading-normal font-medium text-white relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-[#dbd8d3]"
                  >
                    {{ t('mediaUploader.addTier.customRequestBullet2') }}
                  </li>
                </ul>
              </BaseTooltip>
            </div>
            <CheckboxGroup
              :label="t('mediaUploader.addTier.applyOnSale')"
              v-model="applyCustomProxy"
              theme="successTick"
              labelClass="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]"
              wrapperClass="pl-1 flex items-center gap-3"
            />
          </div>
          <DashboardTextInput
            id="input_custom"
            type="number"
            v-model="customRequestDiscountProxy"
            right-span
            :right-span-text="t('mediaUploader.addTier.percentOff')"
            :show-label="false"
            :show-controls="false"
            inline-error-icon
            :show-errors="customReqError"
            :errors="customReqError ? [{ message: t('mediaUploader.addTier.rangeError') }] : []"
            right-span-class="text-sm font-semibold whitespace-nowrap text-medium-text dark:text-medium-beige"
          />
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-4 px-2 py-4 bg-white/25 overflow-hidden md:gap-6 md:p-4 dark:bg-[#181a1b40]">
      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2 opacity-80">
          <Heading tag="h2" theme="custom" no-wrap add-class="text-xl leading-normal font-semibold text-[#667085] dark:text-[#9e9689]" :text="t('plan.detail.mediaOptions')" />
          <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">
            {{ t('mediaUploader.addTier.optional') }}
          </span>
        </div>
        <Paragraph theme="custom" no-wrap add-class="text-sm text-[#475467] dark:text-[#b1aba0] xl:text-base" :text="t('plan.detail.mediaOptionsHelp')" />
      </div>

      <CheckboxGroup
        v-for="option in featureOptions"
        :key="option.value"
        :label="option.label"
        :tags="option.tags"
        :metaText="option.metaText"
        :model-value="isMediaOptionSelected(option.value)"
        theme="successTick"
        labelClass="text-xs leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3] max-w-[100px] truncate sm:max-w-none md:text-lg"
        wrapperClass="pl-1 flex items-center gap-2 md:gap-6 w-full"
        @update:model-value="(checked) => toggleMediaOption(option.value, checked)"
      />
    </div>
  </div>
</template>

<style scoped>
.plan-detail-menu-frosted :deep(.dash-options) {
  background-color: #ffffffb2;
  backdrop-filter: blur(50px);
  -webkit-backdrop-filter: blur(50px);
}
</style>
