<script setup>
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import AddTierPopup from '@/components/ui/popups/media/AddTierPopup.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';
import { useMediaInteractions } from '@/composables/useMediaInteractions.js';

defineProps({
  hideFooterActions: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const SCOPE_ID = 'mediaUploaderSubscriptionP2v';
const {
  isVisible,
  fieldConfig,
  registerField,
  changeField,
  clear: clearInteractions,
} = useMediaInteractions(SCOPE_ID);

const { url: backIconUrl } = useAssetUrl('mediaUploader.icon.back');
const { url: addTierIconUrl } = useAssetUrl('mediaUploader.icon.addTier');
const { url: nextIconUrl } = useAssetUrl('mediaUploader.icon.next');
const { url: successTickUrl } = useAssetUrl('mediaUploader.icon.successTick');

const showAddTierPopup = ref(false);
const showTierAddedToast = ref(false);
let tierToastTimer = null;

function openAddTierPopup() {
  showAddTierPopup.value = true;
}

function closeAddTierPopup() {
  showAddTierPopup.value = false;
}

function clearTierToastTimer() {
  if (tierToastTimer != null) {
    clearTimeout(tierToastTimer);
    tierToastTimer = null;
  }
}

function onTierSaved() {
  showAddTierPopup.value = false;
  if (!uploaderStore.form.linkToSubscriptionPlan) {
    uploaderStore.updateFormField('linkToSubscriptionPlan', true);
  }
  clearTierToastTimer();
  showTierAddedToast.value = true;
  tierToastTimer = setTimeout(() => {
    showTierAddedToast.value = false;
    tierToastTimer = null;
  }, 3500);
}

onUnmounted(() => {
  clearTierToastTimer();
});

const allCheckboxes = computed(() =>
  (uploaderStore.form.subscriptionPlans || []).map((plan) => ({
    id: plan.id,
    label: plan.label,
  })),
);

const hasTiers = computed(() => allCheckboxes.value.length > 0);

const columnSplit = computed(() => Math.ceil(allCheckboxes.value.length / 2));
const column1 = computed(() => allCheckboxes.value.slice(0, columnSplit.value));
const column2 = computed(() => allCheckboxes.value.slice(columnSplit.value));

const linkSubscriptionConfig = fieldConfig('linkToSubscriptionPlan');
const payToViewConfig = fieldConfig('payToViewEnabled');
const discoveryPageConfig = fieldConfig('showOnDiscoveryPage');
const profilePageConfig = fieldConfig('showOnProfilePage');

const linkSubscriptionModel = computed({
  get: () => uploaderStore.form.linkToSubscriptionPlan || false,
  set: (val) => {
    uploaderStore.updateFormField('linkToSubscriptionPlan', val);
    changeField(linkSubscriptionConfig, val, 'linkPanel');
  },
});

const payToViewModel = computed({
  get: () => uploaderStore.form.payToViewEnabled || false,
  set: (val) => {
    uploaderStore.updateFormField('payToViewEnabled', val);
    changeField(payToViewConfig, val, 'p2vPanel');
  },
});

const discoveryPageModel = computed({
  get: () => uploaderStore.form.showOnDiscoveryPage || false,
  set: (val) => {
    uploaderStore.updateFormField('showOnDiscoveryPage', val);
    changeField(discoveryPageConfig, val);
  },
});

const profilePageModel = computed({
  get: () => uploaderStore.form.showOnProfilePage || false,
  set: (val) => {
    uploaderStore.updateFormField('showOnProfilePage', val);
    changeField(profilePageConfig, val);
  },
});

const originalPriceModel = computed({
  get: () => uploaderStore.form.payToViewOriginalPrice,
  set: (val) => uploaderStore.updateFormField('payToViewOriginalPrice', val),
});

const discountPriceModel = computed({
  get: () => uploaderStore.form.payToViewDiscountedPrice,
  set: (val) => uploaderStore.updateFormField('payToViewDiscountedPrice', val),
});

const isPlanSelected = (id) => {
  const currentList = uploaderStore.form.subscriptionPlanIds || [];
  return currentList.includes(id);
};

const togglePlan = (id, isChecked) => {
  let currentList = [...(uploaderStore.form.subscriptionPlanIds || [])];

  if (isChecked) {
    if (!currentList.includes(id)) currentList.push(id);
  } else {
    currentList = currentList.filter((item) => item !== id);
  }

  uploaderStore.updateFormField('subscriptionPlanIds', currentList);
};

// --- Price validation via interactionsEngine ---
const originalPriceFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'originalPrice',
  validation: {
    required: false,
    rules: [
      {
        type: 'minNum',
        param: 1.95,
        message: t('mediaUploader.subscription.originalPriceError'),
      },
      {
        type: 'maxNum',
        param: 500,
        message: t('mediaUploader.subscription.originalPriceError'),
      },
    ],
  },
  validateOnMount: true,
  validateOnInput: true,
}));

const discountPriceFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'discountPrice',
  // Revalidated automatically whenever `originalPrice` changes (see interactionsEngine._revalidateDependents)
  dependsOn: ['originalPrice'],
  validation: {
    required: false,
    rules: [
      {
        type: 'custom',
        message: t('mediaUploader.subscription.discountPriceError'),
        // Cross-field rule kept inside the engine's `custom` rule type (rather than
        // manually poking field state) so it still runs through validationEngine /
        // interactionsEngine.getFieldState like every other rule.
        param: (value, ctx) => {
          const disc = parseFloat(value);
          const orig = parseFloat(ctx.getFieldValue(ctx.scope, 'originalPrice'));
          return !(disc && orig && disc >= orig);
        },
      },
    ],
  },
  validateOnMount: true,
  validateOnInput: true,
}));

onMounted(() => {
  uploaderStore.migrateLegacyStaticPlans();
  registerField(linkSubscriptionConfig, linkSubscriptionModel.value, 'linkPanel');
  registerField(payToViewConfig, payToViewModel.value, 'p2vPanel');
  registerField(discoveryPageConfig, discoveryPageModel.value);
  registerField(profilePageConfig, profilePageModel.value);
  interactionsEngine.register(originalPriceFieldConfig.value, originalPriceModel.value, null);
  interactionsEngine.register(discountPriceFieldConfig.value, discountPriceModel.value, null);
});

onBeforeUnmount(() => {
  clearInteractions();
});

watch(originalPriceModel, (val) => {
  interactionsEngine.processFieldChange(originalPriceFieldConfig.value, val);
});

watch(discountPriceModel, (val) => {
  interactionsEngine.processFieldChange(discountPriceFieldConfig.value, val);
});

function hasEnteredNumber(raw) {
  if (raw === '' || raw === null || raw === undefined) return false;
  return Number.isFinite(Number(raw));
}

// Validity comes from interactionsEngine validation library (minNum/maxNum/custom).
const originalPriceFieldState = computed(() =>
  interactionsEngine.getFieldState(originalPriceFieldConfig.value),
);
const discountPriceFieldState = computed(() =>
  interactionsEngine.getFieldState(discountPriceFieldConfig.value),
);

const isOriginalPriceInvalid = computed(() => {
  if (!hasEnteredNumber(originalPriceModel.value)) return false;
  return !!originalPriceFieldState.value && !originalPriceFieldState.value.isValid;
});

const isDiscountPriceInvalid = computed(() => {
  if (!hasEnteredNumber(discountPriceModel.value)) return false;
  return !!discountPriceFieldState.value && !discountPriceFieldState.value.isValid;
});

const originalPriceDescription = computed(() =>
  t('mediaUploader.subscription.originalPriceHint'),
);

const originalPriceDescriptionClass = computed(() =>
  isOriginalPriceInvalid.value ? 'text-error' : 'text-dark-gray',
);

const discountPriceDescription = computed(() => {
  if (isDiscountPriceInvalid.value) {
    return (
      discountPriceFieldState.value?.failedRules?.[0]?.message ||
      t('mediaUploader.subscription.discountPriceError')
    );
  }
  return t('mediaUploader.subscription.discountPriceHint');
});

const discountPriceDescriptionClass = computed(() =>
  isDiscountPriceInvalid.value ? 'text-error' : 'text-dark-gray',
);

const planCheckboxClass =
  'h-4 w-4 box-border appearance-none [-webkit-appearance:none] bg-white border border-gray-300 rounded-[4px] checked:bg-success checked:border-success before:!hidden after:!hidden';
const planLabelClass =
  'text-[14px] text-text-primary font-[400] cursor-pointer truncate min-w-0';
const displayLabelClass = 'text-[16px] text-text-primary font-[600] cursor-pointer';
</script>

<template>
  <div data-component="media-uploader-step-subscription-p2v" class="relative py-[16px] px-[10px] lg:px-[24px] overflow-x-hidden">
    <div
      class="flex gap-2 items-center cursor-pointer"
      @click="uploaderStore.setStep(1)"
    >
      <img :src="backIconUrl" :alt="t('mediaUploader.shell.back')" />
      <button
        type="button"
        class="text-xs font-medium leading-[1.125rem] text-medium-text break-words"
      >
        {{ t('mediaUploader.shell.back') }}
      </button>
    </div>

    <div class="mb-4 mt-2">
      <div class="flex justify-between items-center">
        <Heading tag="h4" theme="custom" no-wrap add-class="text-text-quaternary text-sm font-[700] leading-normal not-italic py-[8px]" :text="t('mediaUploader.subscription.settingsTitle')" />
      </div>

      <!-- Empty state: no tiers set up yet -->
      <template v-if="!hasTiers">
        <p class="text-sm font-normal text-text-quaternary mb-4">
          {{ t('mediaUploader.subscription.noTiersYet') }}
        </p>
        <div class="flex items-center w-full">
          <DashboardPrimaryButton
            :text="t('mediaUploader.subscription.addTier')"
            theme="mediaAddTierPanel"
            customClass="shrink-0"
            :leftIcon="addTierIconUrl"
            btnBg="#000"
            btnHoverBg="#07f468"
            btnText="#07f468"
            btnHoverText="#000"
            type="button"
            @click.stop="openAddTierPopup"
          />
        </div>
      </template>

      <!-- Tiers exist: link toggle + optional checkbox list -->
      <template v-else>
        <div class="flex w-full justify-between items-center gap-4">
          <CheckboxSwitch
            :label="t('mediaUploader.subscription.linkToggle')"
            id="link-subscription-toggle"
            v-model="linkSubscriptionModel"
            theme="linkRow"
          />

          <DashboardPrimaryButton
            v-if="isVisible('linkPanel')"
            :text="t('mediaUploader.subscription.addTier')"
            theme="mediaAddTierPanel"
            :leftIcon="addTierIconUrl"
            btnBg="#000"
            btnHoverBg="#07f468"
            btnText="#07f468"
            btnHoverText="#000"
            type="button"
            @click.stop="openAddTierPopup"
          />
        </div>

        <div v-if="isVisible('linkPanel')" class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mt-4 w-full min-w-0">
          <div class="flex flex-col gap-2 min-w-0 overflow-hidden">
            <CheckboxGroup
              v-for="item in column1"
              :key="item.id"
              :label="item.label"
              :modelValue="isPlanSelected(item.id)"
              @update:modelValue="(val) => togglePlan(item.id, val)"
              :checkboxClass="planCheckboxClass"
              :labelClass="planLabelClass"
              custom-check-mark
              wrapperClass="flex items-center w-full min-w-0 max-w-full"
            />
          </div>

          <div class="flex flex-col gap-2 min-w-0 overflow-hidden">
            <CheckboxGroup
              v-for="item in column2"
              :key="item.id"
              :label="item.label"
              :modelValue="isPlanSelected(item.id)"
              @update:modelValue="(val) => togglePlan(item.id, val)"
              :checkboxClass="planCheckboxClass"
              :labelClass="planLabelClass"
              custom-check-mark
              wrapperClass="flex items-center w-full min-w-0 max-w-full"
            />
          </div>
        </div>
      </template>
    </div>

    <div class="mb-4 mt-4 flex flex-col gap-4">
      <Heading tag="h4" theme="custom" no-wrap add-class="text-text-quaternary text-sm font-[700] leading-normal not-italic " :text="t('mediaUploader.subscription.payToViewTitle')" />

      <CheckboxSwitch
        :label="t('mediaUploader.subscription.payToViewToggle')"
        id="p2v-toggle"
        v-model="payToViewModel"
      />

      <div v-if="isVisible('p2vPanel')" class="md:flex md:justify-between md:items-start mt-4 ml-[38px] gap-4">
        <div class="flex-1">
          <DashboardTextInput
            id="original_price"
            type="number"
            show-label
            v-model="originalPriceModel"
            :label-text="t('mediaUploader.subscription.originalPrice')"
            leftSpan
            :leftSpanText="t('mediaUploader.subscription.usd')"
            :description="originalPriceDescription"
            :description-class="originalPriceDescriptionClass"
          />
        </div>
        <div class="flex-1">
          <DashboardTextInput
            id="discount_price"
            type="number"
            show-label
            v-model="discountPriceModel"
            :label-text="t('mediaUploader.subscription.discountedPrice')"
            leftSpan
            :leftSpanText="t('mediaUploader.subscription.usd')"
            :description="discountPriceDescription"
            :description-class="discountPriceDescriptionClass"
          />
        </div>
      </div>
    </div>

    <div class="mt-[40px] flex flex-col gap-4">
      <Heading tag="h4" theme="custom" no-wrap add-class="text-text-quaternary text-sm font-[700] leading-normal not-italic" :text="t('mediaUploader.subscription.displayTitle')" />

      <CheckboxGroup
        :label="t('mediaUploader.subscription.discoveryPage')"
        v-model="discoveryPageModel"
        :checkboxClass="planCheckboxClass"
        :labelClass="displayLabelClass"
        custom-check-mark
        wrapperClass="flex items-center"
      />

      <CheckboxGroup
        :label="t('mediaUploader.subscription.profilePage')"
        v-model="profilePageModel"
        :checkboxClass="planCheckboxClass"
        :labelClass="displayLabelClass"
        custom-check-mark
        wrapperClass="flex items-center"
      />
    </div>

    <div v-if="!hideFooterActions" class="flex justify-end md:mt-0 mt-4">
      <DashboardPrimaryButton
        :text="t('mediaUploader.shell.next')"
        variant="polygonLeft"
        :rightIcon="nextIconUrl"
        rightIconClass="w-5 h-5 transition duration-200 brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]"
        btnBg="#07f468"
        btnHoverBg="black"
        btnText="black"
        btnHoverText="#07f468"
        type="button"
        @click="uploaderStore.setStep(3)"
      />
    </div>

    <AddTierPopup
      :modelValue="showAddTierPopup"
      @update:modelValue="(val) => (showAddTierPopup = val)"
      @close="closeAddTierPopup"
      @saved="onTierSaved"
    />

    <Teleport to="body">
      <div
        v-if="showTierAddedToast"
        class="pointer-events-auto fixed top-[10px] left-[10px] right-[10px] z-[9999] w-auto animate-in fade-in slide-in-from-top duration-300 sm:left-auto sm:right-2 sm:top-2 sm:w-[350px] sm:slide-in-from-right"
      >
        <NotificationCard
          v-model="showTierAddedToast"
          variant="success-teal"
          :title="t('mediaUploader.subscription.tierAddedToast')"
          :closable="false"
        >
          <template #icon>
            <div class="w-10 h-10 flex justify-center items-center rounded-lg bg-mediaUi-mintSoft overflow-hidden">
              <img
                v-if="successTickUrl"
                :src="successTickUrl"
                alt=""
                class="w-7 h-7 object-contain"
              />
            </div>
          </template>
        </NotificationCard>
      </div>
    </Teleport>
  </div>
</template>
