<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { createStepStateEngine } from '@/utils/stateEngine';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import CancelUploadPopup from '@/components/ui/popups/CancelUploadPopup.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import DashboardWizardSteps from '@/components/ui/navigation/DashboardWizardSteps.vue';
import MerchProductDetailsStep from '@/dev/components/shops/merch/steps/MerchProductDetailsStep.vue';
import MerchGalleryStep from '@/dev/components/shops/merch/steps/MerchGalleryStep.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'save-draft']);

const { t } = useI18n();
const { url: closeIconUrl } = useAssetUrl('mediaUploader.icon.close');
const { url: draftIconUrl } = useAssetUrl('plan.icon.uploadDraft');
const { url: nextIconUrl } = useAssetUrl('mediaUploader.icon.next');

const draftIconClass =
  'w-5 h-5 brightness-0 invert transition duration-200 group-hover:brightness-0 group-hover:invert-0';

const nextIconEnabledClass =
  'w-5 h-5 brightness-0 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]';

const nextIconDisabledClass =
  'w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(8%)_saturate(281%)_hue-rotate(182deg)_brightness(91%)_contrast(88%)]';

/** Flush polygon clip (no gap). Draft hover: white. Next hover: black + green icon/text. */
const footerDraftBtnClass =
  '!py-[4px] !pl-[8px] !pr-[22px] enabled:hover:!bg-white enabled:hover:!text-black [clip-path:polygon(0_0,calc(100%-14px)_0,100%_100%,0_100%)]';

const footerNextBtnClass =
  '!py-[4px] !pr-[8px] !pl-[22px] disabled:!opacity-100 [clip-path:polygon(14px_0,100%_0,100%_100%,0_100%)]';

const leaveConfirmOpen = ref(false);
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

const hasUnsavedProgress = computed(() => {
  if (hasProductDetailsProgress.value) return true;
  if (hasGalleryProgress.value) return true;
  if (listingFlow.step > 1) return true;
  return false;
});

const canGoNext = computed(() => {
  if (listingFlow.step === 1) return hasProductDetailsProgress.value;
  if (listingFlow.step === 2) return hasGalleryProgress.value;
  return true;
});

const nextBtnBg = computed(() => (canGoNext.value ? '#07f468' : '#3440540D'));
const nextBtnText = computed(() => (canGoNext.value ? 'black' : '#98A2B3'));
const nextBtnHoverBg = computed(() => (canGoNext.value ? 'black' : '#3440540D'));
const nextBtnHoverText = computed(() => (canGoNext.value ? '#07f468' : '#98A2B3'));
const nextIconClass = computed(() =>
  canGoNext.value ? nextIconEnabledClass : nextIconDisabledClass,
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

function onSaveDraft() {
  emit('save-draft');
  forceClose();
}

function onLeaveWithoutSaving() {
  forceClose();
}

function onNext() {
  if (!canGoNext.value) return;
  const current = listingFlow.step;
  if (current < 4) {
    void listingFlow.forceStep(current + 1);
  }
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
  void listingFlow.forceStep(1);
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      leaveConfirmOpen.value = false;
      skipLeaveConfirm = false;
      void listingFlow.forceStep(1);
      return;
    }
    leaveConfirmOpen.value = false;
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
          :text="t('shops.merch.listing.title')"
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
          :engine="listingFlow"
          :tag-catalog="tagCatalog"
          :tag-history="tagHistory"
          :collection-catalog="collectionCatalog"
        />

        <MerchGalleryStep
          v-else-if="activeStep === 2"
          :engine="listingFlow"
        />

        <div
          v-else
          class="text-sm text-text-quaternary"
        >
          {{ t('shops.merch.listing.stepPlaceholder') }}
        </div>
      </div>

      <!-- Bottom two-piece actions — flush polygon clips (Right + Left) -->
      <div
        class="relative bottom-0 mt-auto flex w-full items-end justify-between pointer-events-none"
      >
        <DashboardPrimaryButton
          :text="t('shops.merch.listing.saveAsDraft')"
          variant="polygonRight"
          :leftIcon="draftIconUrl"
          :leftIconClass="draftIconClass"
          :customClass="footerDraftBtnClass"
          type="button"
          class="pointer-events-auto"
          @click="onSaveDraft"
        />

        <DashboardPrimaryButton
          :text="t('shops.merch.listing.next')"
          variant="polygonLeft"
          :rightIcon="nextIconUrl"
          :rightIconClass="nextIconClass"
          :btnBg="nextBtnBg"
          :btnHoverBg="nextBtnHoverBg"
          :btnText="nextBtnText"
          :btnHoverText="nextBtnHoverText"
          :disabled="!canGoNext"
          :customClass="footerNextBtnClass"
          type="button"
          class="pointer-events-auto"
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
