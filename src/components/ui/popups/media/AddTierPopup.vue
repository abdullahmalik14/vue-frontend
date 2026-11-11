<template>
  <!-- Same overlay chrome BasePopup uses (bg-black/5 + blur). Nested over Upload Media slide-in. -->
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[21999] cursor-pointer bg-black/5 backdrop-blur-[7.5px]"
      aria-hidden="true"
      @click="onOverlayClick"
    />
  </Teleport>

  <BasePopup
    :modelValue="modelValue"
    :is-loading="isSaving"
    @update:modelValue="onPopupModelUpdate"
    :popup-config="addTierPopupConfig"
  >
    <div data-component="add-tier-popup" class="relative w-[640px] max-w-[95vw] flex flex-col bg-white/90">
      <div class="p-6 flex flex-col gap-8">
        <div class="self-stretch backdrop-blur-xl flex flex-col justify-start items-start gap-6">
          <div class="w-full">
            <div class="w-full flex justify-between items-center">
              <div class="flex-1 justify-center text-gray-500 text-lg font-medium font-['Poppins'] leading-7">
                {{ t('mediaUploader.addTier.title') }}
              </div>

              <div
                class="cursor-pointer p-1"
                data-popup-close
                role="button"
                tabindex="0"
                data-action="close-add-tier"
                :aria-label="t('mediaUploader.addTier.closeAlt')"
                @click="emit('update:modelValue', false)"
              >
                <svg width="10" height="10" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 1L1 17M1 1L17 17" stroke="#98A2B3" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <div
              v-if="interactionsEngine.elementVisibility[DRAFT_NOTICE_KEY]"
              class="flex items-center gap-1"
            >
              <InformationCircleIcon class="w-5 h-5 text-orange-500 shrink-0" />
              <div class="justify-start text-orange-500 text-sm font-normal font-['Poppins'] leading-5">
                {{ t('mediaUploader.addTier.draftNotice') }}
              </div>
            </div>
          </div>

          <div class="self-stretch flex flex-col justify-start items-start gap-2">
            <div class="w-full">
              <DashboardTextInput
                :placeholder="t('mediaUploader.addTier.tierNamePlaceholder')"
                v-model="tierName"
              />
            </div>

            <div v-if="showDescriptionEditor" class="w-full">
              <QuillEditor
                v-model="tierDescription"
                :placeholder="t('mediaUploader.addTier.tierDescriptionPlaceholder')"
              />
            </div>

            <div v-if="!showDescriptionEditor || !showBackgroundImageUploader" class="inline-flex justify-start items-start gap-6">
              <div
                v-if="!showDescriptionEditor"
                class="flex justify-start items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                @click="showDescriptionEditor = true"
              >
                <img
                  v-if="addFieldIconUrl"
                  :src="addFieldIconUrl"
                  class="w-4 h-4 shrink-0"
                  alt=""
                />
                <div class="justify-start text-medium-text text-xs font-medium font-['Poppins'] leading-4">
                  {{ t('mediaUploader.addTier.description') }}
                </div>
              </div>
              <div
                v-if="!showBackgroundImageUploader"
                class="flex justify-start items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                @click="showBackgroundImageUploader = true"
              >
                <img
                  v-if="addFieldIconUrl"
                  :src="addFieldIconUrl"
                  class="w-4 h-4 shrink-0"
                  alt=""
                />
                <div class="justify-start text-medium-text text-xs font-medium font-['Poppins'] leading-4">
                  {{ t('mediaUploader.addTier.backgroundImage') }}
                </div>
              </div>
            </div>

            <div v-if="showBackgroundImageUploader" class="w-full flex flex-col gap-2 mt-2">
              <div class="text-slate-700 text-xs font-medium font-['Poppins'] leading-4">
                {{ t('mediaUploader.addTier.backgroundImageLabel') }}
              </div>

              <div v-if="uploaderStore.form.tier_backgroundUrl" class="relative w-[126px] h-[201px] rounded-[4px] overflow-hidden group">
                <img
                  :src="uploaderStore.form.tier_backgroundUrl"
                  class="w-full h-full object-cover"
                  :alt="t('mediaUploader.addTier.backgroundPreviewAlt')"
                />

                <div
                  class="absolute top-0 right-0 w-7 h-7 bg-error flex items-center justify-center cursor-pointer hover:bg-red-600 transition-colors shadow-sm"
                  @click="removeBackgroundImage"
                >
                  <img
                    v-if="deleteIconUrl"
                    :src="deleteIconUrl"
                    class="w-4 h-4 object-contain"
                    :alt="t('mediaUploader.addTier.deleteAlt')"
                  />
                </div>
              </div>

              <ThumbnailUploader
                v-else
                :title="t('mediaUploader.addTier.uploadTitle')"
                :subtitle="t('mediaUploader.addTier.uploadSubtitle')"
                :fileInfo="t('mediaUploader.addTier.uploadFileInfo')"
                stateUrlKey="tier_backgroundUrl"
                stateFileKey="tier_backgroundFile"
                accept="image/jpeg, image/png"
                :show-selected-name="false"
                icon-variant="plain"
                full-area-click
              >
                <template #icon>
                  <img
                    :src="backgroundIconUrl"
                    alt=""
                    class="w-10 h-10 object-contain pointer-events-none"
                  />
                </template>
              </ThumbnailUploader>
            </div>
          </div>
        </div>

        <div class="self-stretch flex flex-col justify-start items-start gap-4">
          <div class="justify-center text-text-primary text-xl font-semibold font-['Poppins'] leading-8">
            {{ t('mediaUploader.addTier.subscriptionFee') }}
          </div>

          <div
            class="flex w-full flex-row items-stretch overflow-hidden rounded-[5px] border border-border-light bg-primary-bg"
          >
            <div
              class="flex h-10 flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap border-r border-border-light px-4 text-secondary-text"
            >
              <img
                :src="alertIconUrl"
                alt=""
                class="h-5 w-5 shrink-0 object-contain"
              />
              <span class="text-sm poppins-medium">
                {{ t('mediaUploader.addTier.freeTier') }}
              </span>
            </div>
            <div
              class="flex h-10 flex-1 shrink-0 items-center justify-center gap-2 whitespace-nowrap bg-dark-text px-4 text-white"
            >
              <span class="text-sm text-white poppins-semibold">
                {{ t('mediaUploader.addTier.paidTier') }}
              </span>
            </div>
          </div>

          <div class="self-stretch md:flex md:justify-between md:items-start mt-4 gap-1">
            <div class="flex-1">
              <DashboardTextInput
                id="tier_original_price"
                type="number"
                show-label
                v-model="originalPrice"
                :label-text="t('mediaUploader.addTier.originalPrice')"
                leftSpan
                :leftSpanText="t('mediaUploader.addTier.usd')"
                :description="originalPriceDescription"
                :description-class="originalPriceDescriptionClass"
                labelClass="text-gray-900 text-xs"
                :show-controls="false"
              />
            </div>
            <div class="flex-1">
              <DashboardTextInput
                id="tier_discount_price"
                type="number"
                show-label
                v-model="discountPrice"
                :label-text="t('mediaUploader.addTier.discountedPrice')"
                leftSpan
                :leftSpanText="t('mediaUploader.addTier.usd')"
                :description="discountPriceDescription"
                :description-class="discountPriceDescriptionClass"
                labelClass="text-gray-900 text-xs"
                :show-controls="false"
              />
            </div>
          </div>
        </div>

        <div class="w-full flex flex-col gap-4 py-4 bg-white/25 dark:bg-mediaUi-shell40">
          <div class="flex items-center gap-2 opacity-80">
            <h2 class="text-text-primary text-xl font-semibold font-['Poppins'] leading-8 uppercase">
              {{ t('mediaUploader.addTier.subscriberBenefits') }}
            </h2>
            <span class="text-xs leading-normal font-medium text-text-primary dark:text-mediaUi-inkSoft">
              ({{ t('mediaUploader.addTier.optional') }})
            </span>
          </div>

          <div class="flex flex-col gap-4 backdrop-blur-[25px] md:gap-6">
            <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
              <div class="relative flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-medium text-text-primary md:text-lg dark:text-timberwolf">
                    {{ t('mediaUploader.addTier.freeTokens') }}
                  </h3>
                  <BaseTooltip placement="top">
                    <p class="text-xs leading-normal font-medium text-white dark:text-timberwolf">
                      {{ t('mediaUploader.addTier.freeTokensTooltip') }}
                    </p>
                  </BaseTooltip>
                </div>
              </div>
              <DashboardTextInput
                id="input_free_tokens"
                type="number"
                v-model="freeTokens"
                rightSpan
                :rightSpanText="t('mediaUploader.addTier.percentOff')"
                :show-label="false"
                :show-controls="false"
                :wrapper-class="freeTokensError ? '!border-error' : ''"
                :show-errors="freeTokensError"
                :errors="freeTokensError ? [{ message: freeTokensErrorMessage }] : []"
                rightSpanClass="text-sm font-semibold whitespace-nowrap text-medium-text dark:text-medium-beige"
              />
            </div>

            <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
              <div class="flex flex-col gap-2">
                <div class="relative flex items-center gap-2">
                  <h3 class="text-base font-medium text-text-primary md:text-lg dark:text-timberwolf">
                    {{ t('mediaUploader.addTier.merchDiscount') }}
                  </h3>
                  <BaseTooltip placement="top">
                    <ul>
                      <li class="text-xs leading-normal font-medium text-white relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-timberwolf">
                        {{ t('mediaUploader.addTier.merchDiscountBullet1') }}
                      </li>
                      <li class="text-xs leading-normal font-medium text-white relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-timberwolf">
                        {{ t('mediaUploader.addTier.merchDiscountBullet2') }}
                      </li>
                    </ul>
                  </BaseTooltip>
                </div>
                <CheckboxGroup
                  :label="t('mediaUploader.addTier.applyOnSale')"
                  v-model="applyMerch"
                  :checkboxClass="benefitCheckboxClass"
                  :labelClass="benefitLabelClass"
                  custom-check-mark
                  wrapperClass="pl-1 flex items-center gap-2 leading-none"
                />
              </div>
              <DashboardTextInput
                id="input_merch"
                type="number"
                v-model="merchDiscount"
                rightSpan
                :rightSpanText="t('mediaUploader.addTier.percentOff')"
                :show-label="false"
                :show-controls="false"
                :wrapper-class="merchError ? '!border-error' : ''"
                :show-errors="merchError"
                :errors="merchError ? [{ message: merchErrorMessage }] : []"
                rightSpanClass="text-sm font-semibold whitespace-nowrap text-medium-text dark:text-medium-beige"
              />
            </div>

            <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
              <div class="flex flex-col gap-2">
                <div class="relative flex items-center gap-2">
                  <h3 class="text-base font-medium text-text-primary md:text-lg dark:text-timberwolf">
                    {{ t('mediaUploader.addTier.payToViewDiscount') }}
                  </h3>
                  <BaseTooltip placement="top">
                    <ul>
                      <li class="text-xs leading-normal font-medium text-white relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-timberwolf">
                        {{ t('mediaUploader.addTier.payToViewDiscountBullet') }}
                      </li>
                    </ul>
                  </BaseTooltip>
                </div>
                <CheckboxGroup
                  :label="t('mediaUploader.addTier.applyOnSale')"
                  v-model="applyPayToView"
                  :checkboxClass="benefitCheckboxClass"
                  :labelClass="benefitLabelClass"
                  custom-check-mark
                  wrapperClass="pl-1 flex items-center gap-2 leading-none"
                />
              </div>
              <DashboardTextInput
                id="input_p2v"
                type="number"
                v-model="payToViewDiscount"
                rightSpan
                :rightSpanText="t('mediaUploader.addTier.percentOff')"
                :show-label="false"
                :show-controls="false"
                :wrapper-class="payToViewError ? '!border-error' : ''"
                :show-errors="payToViewError"
                :errors="payToViewError ? [{ message: payToViewErrorMessage }] : []"
                rightSpanClass="text-sm font-semibold whitespace-nowrap text-medium-text dark:text-medium-beige"
              />
            </div>

            <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
              <div class="flex flex-col gap-2">
                <div class="relative flex items-center gap-2">
                  <h3 class="text-base font-medium text-text-primary md:text-lg dark:text-timberwolf">
                    {{ t('mediaUploader.addTier.customRequestDiscount') }}
                  </h3>
                  <BaseTooltip placement="top">
                    <ul>
                      <li class="text-xs leading-normal font-medium text-white relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-timberwolf">
                        {{ t('mediaUploader.addTier.customRequestBullet1') }}
                      </li>
                      <li class="text-xs leading-normal font-medium text-white relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-timberwolf">
                        {{ t('mediaUploader.addTier.customRequestBullet2') }}
                      </li>
                    </ul>
                  </BaseTooltip>
                </div>
                <CheckboxGroup
                  :label="t('mediaUploader.addTier.applyOnSale')"
                  v-model="applyCustom"
                  :checkboxClass="benefitCheckboxClass"
                  :labelClass="benefitLabelClass"
                  custom-check-mark
                  wrapperClass="pl-1 flex items-center gap-2 leading-none"
                />
              </div>
              <DashboardTextInput
                id="input_custom"
                type="number"
                v-model="customRequestDiscount"
                rightSpan
                :rightSpanText="t('mediaUploader.addTier.percentOff')"
                :show-label="false"
                :show-controls="false"
                :wrapper-class="customRequestError ? '!border-error' : ''"
                :show-errors="customRequestError"
                :errors="customRequestError ? [{ message: customRequestErrorMessage }] : []"
                rightSpanClass="text-sm font-semibold whitespace-nowrap text-medium-text dark:text-medium-beige"
              />
            </div>

            <div class="grid grid-cols-[repeat(auto-fit,minmax(15.25rem,1fr))] items-center gap-2 w-full">
              <div class="relative flex flex-col gap-2">
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-medium text-text-primary md:text-lg dark:text-timberwolf">
                    {{ t('mediaUploader.addTier.unsubscribeDiscount') }}
                  </h3>
                  <BaseTooltip placement="top">
                    <p class="text-xs leading-normal font-medium text-white dark:text-timberwolf">
                      {{ t('mediaUploader.addTier.unsubscribeTooltip') }}
                    </p>
                  </BaseTooltip>
                </div>
              </div>
              <DashboardTextInput
                id="input_unsubscribe"
                type="number"
                v-model="unsubscribeDiscount"
                rightSpan
                :rightSpanText="t('mediaUploader.addTier.percentOff')"
                :show-label="false"
                :show-controls="false"
                :wrapper-class="unsubscribeError ? '!border-error' : ''"
                :show-errors="unsubscribeError"
                :errors="unsubscribeError ? [{ message: unsubscribeErrorMessage }] : []"
                rightSpanClass="text-sm font-semibold whitespace-nowrap text-medium-text dark:text-medium-beige"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="sticky bottom-0 z-20 w-full flex justify-end items-center bg-white/90 ">
        <DashboardPrimaryButton
          :text="t('mediaUploader.addTier.cancel')"
          theme="addTierCancel"
          :disabled="isSaving"
          @click="onCancel"
        />
        <DashboardPrimaryButton
          :text="t('mediaUploader.addTier.save')"
          theme="addTierSave"
          btnBg="#07F468"
          btnHoverBg="black"
          btnText="black"
          btnHoverText="#07F468"
          :disabled="isSaving"
          @click="onSave"
        />
      </div>
    </div>
  </BasePopup>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import BaseTooltip from '@/components/ui/tooltips/BaseTooltip.vue';
import QuillEditor from '@/components/forms/inputs/QuillEditor.vue';
import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';
import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

const { t } = useI18n();
const { url: addFieldIconUrl } = useAssetUrl('mediaUploader.icon.addField');
const { url: deleteIconUrl } = useAssetUrl('mediaUploader.deleteIcon');
const { url: alertIconUrl } = useAssetUrl('mediaUploader.icon.alert');
const { url: backgroundIconUrl } = useAssetUrl('mediaUploader.icon.addTierBackground');

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  /**
   * Optional sink so callers (e.g. Merch) can persist tiers without
   * writing into the media uploader store / checkbox list.
   * `(planDraft) => planEntry | Promise<planEntry>`
   */
  saveHandler: {
    type: Function,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'close', 'saved']);
const uploaderStore = useMediaUploaderStore();

const isSaving = ref(false);

const SCOPE_ID = 'addTier';
const DRAFT_NOTICE_KEY = 'addTier.draftNotice';
const DESC_EDITOR_KEY = 'addTier_descriptionEditor';
const BG_UPLOADER_KEY = 'addTier_backgroundUploader';

function setUiVisible(elementKey, visible) {
  interactionsEngine.runInteractions(
    [{ type: visible ? 'showElement' : 'hideElement', elementKey }],
    null,
  );
}

function isUiVisible(elementKey) {
  return !!interactionsEngine.elementVisibility[elementKey];
}

const showDescriptionEditor = computed({
  get: () => isUiVisible(DESC_EDITOR_KEY),
  set: (val) => setUiVisible(DESC_EDITOR_KEY, !!val),
});

const showBackgroundImageUploader = computed({
  get: () => isUiVisible(BG_UPLOADER_KEY),
  set: (val) => setUiVisible(BG_UPLOADER_KEY, !!val),
});

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

const freeTokensFieldConfig = buildRangeFieldConfig('freeTokens');
const merchFieldConfig = buildRangeFieldConfig('merchDiscount');
const payToViewFieldConfig = buildRangeFieldConfig('payToViewDiscount');
const customRequestFieldConfig = buildRangeFieldConfig('customRequestDiscount');
const unsubscribeFieldConfig = buildRangeFieldConfig('unsubscribeDiscount');

const freeTokensFieldState = computed(() => interactionsEngine.getFieldState(freeTokensFieldConfig.value));
const merchFieldState = computed(() => interactionsEngine.getFieldState(merchFieldConfig.value));
const payToViewFieldState = computed(() => interactionsEngine.getFieldState(payToViewFieldConfig.value));
const customRequestFieldState = computed(() => interactionsEngine.getFieldState(customRequestFieldConfig.value));
const unsubscribeFieldState = computed(() => interactionsEngine.getFieldState(unsubscribeFieldConfig.value));

function isRangeInvalid(rawValue, fieldState) {
  if (rawValue === '' || rawValue === null || rawValue === undefined) return false;
  if (!Number.isFinite(Number(rawValue))) return false;
  return !!fieldState && !fieldState.isValid;
}

function firstFailedMessage(fieldState) {
  return fieldState?.failedRules?.[0]?.message || rangeErrorMessage.value;
}

const benefitCheckboxClass =
  'h-4 w-4 box-border appearance-none [-webkit-appearance:none] bg-white border border-gray-300 rounded-[4px] checked:bg-success checked:border-success before:!hidden after:!hidden';
const benefitLabelClass =
  'text-sm leading-4 text-text-primary font-[400] cursor-pointer m-0 p-0 dark:text-timberwolf';

const tierName = computed({
  get: () => uploaderStore.form.tier_name,
  set: (val) => uploaderStore.updateFormField('tier_name', val),
});
const tierDescription = computed({
  get: () => uploaderStore.form.tier_description,
  set: (val) => uploaderStore.updateFormField('tier_description', val),
});
const originalPrice = computed({
  get: () => uploaderStore.form.tier_originalPrice,
  set: (val) => uploaderStore.updateFormField('tier_originalPrice', val),
});
const discountPrice = computed({
  get: () => uploaderStore.form.tier_discountPrice,
  set: (val) => uploaderStore.updateFormField('tier_discountPrice', val),
});

function hasEnteredNumber(raw) {
  if (raw === '' || raw === null || raw === undefined) return false;
  return Number.isFinite(Number(raw));
}

// Tier prices: use interactionsEngine field state (same library as benefit % fields).
const originalPriceFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'tier_originalPrice',
  validation: {
    required: false,
    rules: [
      { type: 'minNum', param: 1.95, message: t('mediaUploader.addTier.originalPriceHint') },
      { type: 'maxNum', param: 500, message: t('mediaUploader.addTier.originalPriceHint') },
    ],
  },
  validateOnMount: true,
  validateOnInput: true,
}));

const discountPriceFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'tier_discountPrice',
  dependsOn: ['tier_originalPrice'],
  validation: {
    required: false,
    rules: [
      {
        type: 'custom',
        message: t('mediaUploader.addTier.discountPriceError'),
        param: (value, ctx) => {
          const disc = parseFloat(value);
          const orig = parseFloat(ctx.getFieldValue(ctx.scope, 'tier_originalPrice'));
          return !(disc && orig && disc >= orig);
        },
      },
    ],
  },
  validateOnMount: true,
  validateOnInput: true,
}));

const originalPriceFieldState = computed(() =>
  interactionsEngine.getFieldState(originalPriceFieldConfig.value),
);
const discountPriceFieldState = computed(() =>
  interactionsEngine.getFieldState(discountPriceFieldConfig.value),
);

const isOriginalPriceInvalid = computed(() => {
  if (!hasEnteredNumber(originalPrice.value)) return false;
  return !!originalPriceFieldState.value && !originalPriceFieldState.value.isValid;
});

const isDiscountPriceInvalid = computed(() => {
  if (!hasEnteredNumber(discountPrice.value)) return false;
  return !!discountPriceFieldState.value && !discountPriceFieldState.value.isValid;
});

const originalPriceDescription = computed(() =>
  t('mediaUploader.addTier.originalPriceHint'),
);

const originalPriceDescriptionClass = computed(() =>
  isOriginalPriceInvalid.value ? 'text-error' : 'text-dark-gray',
);

const discountPriceDescription = computed(() => {
  if (isDiscountPriceInvalid.value) {
    return (
      discountPriceFieldState.value?.failedRules?.[0]?.message ||
      t('mediaUploader.addTier.discountPriceError')
    );
  }
  return t('mediaUploader.addTier.discountPriceHint');
});

const discountPriceDescriptionClass = computed(() =>
  isDiscountPriceInvalid.value ? 'text-error' : 'text-dark-gray',
);

const freeTokens = computed({
  get: () => uploaderStore.form.tier_freeTokens,
  set: (val) => uploaderStore.updateFormField('tier_freeTokens', val),
});
const merchDiscount = computed({
  get: () => uploaderStore.form.tier_merchDiscount,
  set: (val) => uploaderStore.updateFormField('tier_merchDiscount', val),
});
const applyMerchConfig = {
  scope: SCOPE_ID,
  id: 'tier_applyMerch',
  validation: { required: false, rules: [] },
  validateOnInput: false,
};
const applyPayToViewConfig = {
  scope: SCOPE_ID,
  id: 'tier_applyPayToView',
  validation: { required: false, rules: [] },
  validateOnInput: false,
};
const applyCustomConfig = {
  scope: SCOPE_ID,
  id: 'tier_applyCustom',
  validation: { required: false, rules: [] },
  validateOnInput: false,
};

const applyMerch = computed({
  get: () => uploaderStore.form.tier_applyMerch,
  set: (val) => {
    uploaderStore.updateFormField('tier_applyMerch', val);
    interactionsEngine.processFieldChange(applyMerchConfig, val);
  },
});
const payToViewDiscount = computed({
  get: () => uploaderStore.form.tier_payToViewDiscount,
  set: (val) => uploaderStore.updateFormField('tier_payToViewDiscount', val),
});
const applyPayToView = computed({
  get: () => uploaderStore.form.tier_applyPayToView,
  set: (val) => {
    uploaderStore.updateFormField('tier_applyPayToView', val);
    interactionsEngine.processFieldChange(applyPayToViewConfig, val);
  },
});
const customRequestDiscount = computed({
  get: () => uploaderStore.form.tier_customRequestDiscount,
  set: (val) => uploaderStore.updateFormField('tier_customRequestDiscount', val),
});
const applyCustom = computed({
  get: () => uploaderStore.form.tier_applyCustom,
  set: (val) => {
    uploaderStore.updateFormField('tier_applyCustom', val);
    interactionsEngine.processFieldChange(applyCustomConfig, val);
  },
});
const unsubscribeDiscount = computed({
  get: () => uploaderStore.form.tier_unsubscribeDiscount,
  set: (val) => uploaderStore.updateFormField('tier_unsubscribeDiscount', val),
});

function removeBackgroundImage() {
  uploaderStore.updateFormField('tier_backgroundUrl', '');
  uploaderStore.updateFormField('tier_backgroundFile', null);
}

const freeTokensError = computed(() => isRangeInvalid(freeTokens.value, freeTokensFieldState.value));
const merchError = computed(() => isRangeInvalid(merchDiscount.value, merchFieldState.value));
const payToViewError = computed(() => isRangeInvalid(payToViewDiscount.value, payToViewFieldState.value));
const customRequestError = computed(() => isRangeInvalid(customRequestDiscount.value, customRequestFieldState.value));
const unsubscribeError = computed(() => isRangeInvalid(unsubscribeDiscount.value, unsubscribeFieldState.value));

const freeTokensErrorMessage = computed(() => firstFailedMessage(freeTokensFieldState.value));
const merchErrorMessage = computed(() => firstFailedMessage(merchFieldState.value));
const payToViewErrorMessage = computed(() => firstFailedMessage(payToViewFieldState.value));
const customRequestErrorMessage = computed(() => firstFailedMessage(customRequestFieldState.value));
const unsubscribeErrorMessage = computed(() => firstFailedMessage(unsubscribeFieldState.value));

const hasBenefitRangeError = computed(
  () =>
    freeTokensError.value ||
    merchError.value ||
    payToViewError.value ||
    customRequestError.value ||
    unsubscribeError.value,
);

function registerBenefitFields() {
  interactionsEngine.register(freeTokensFieldConfig.value, freeTokens.value, null);
  interactionsEngine.register(merchFieldConfig.value, merchDiscount.value, null);
  interactionsEngine.register(payToViewFieldConfig.value, payToViewDiscount.value, null);
  interactionsEngine.register(customRequestFieldConfig.value, customRequestDiscount.value, null);
  interactionsEngine.register(unsubscribeFieldConfig.value, unsubscribeDiscount.value, null);
  interactionsEngine.register(applyMerchConfig, applyMerch.value, null);
  interactionsEngine.register(applyPayToViewConfig, applyPayToView.value, null);
  interactionsEngine.register(applyCustomConfig, applyCustom.value, null);
  interactionsEngine.register(originalPriceFieldConfig.value, originalPrice.value, null);
  interactionsEngine.register(discountPriceFieldConfig.value, discountPrice.value, null);
  setUiVisible(DESC_EDITOR_KEY, false);
  setUiVisible(BG_UPLOADER_KEY, false);
}

function showDraftNotice() {
  interactionsEngine.runInteractions(
    [{ type: 'showElement', elementKey: DRAFT_NOTICE_KEY }],
    null,
  );
}

function hideDraftNotice() {
  interactionsEngine.runInteractions(
    [{ type: 'hideElement', elementKey: DRAFT_NOTICE_KEY }],
    null,
  );
}

function onPopupModelUpdate(val) {
  if (!val && isSaving.value) return;
  emit('update:modelValue', val);
  if (!val) emit('close');
}

function onOverlayClick() {
  if (isSaving.value) return;
  emit('update:modelValue', false);
  emit('close');
}

function onCancel() {
  if (isSaving.value) return;
  emit('update:modelValue', false);
  emit('close');
}

async function onSave() {
  if (isSaving.value) return;
  if (isOriginalPriceInvalid.value || isDiscountPriceInvalid.value || hasBenefitRangeError.value) {
    return;
  }

  const name = String(tierName.value || '').trim();
  const label = name || t('mediaUploader.addTier.title');

  isSaving.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const planDraft = {
      label,
      originalPrice: originalPrice.value,
      discountPrice: discountPrice.value,
      backgroundUrl: uploaderStore.form.tier_backgroundUrl || '',
    };

    let plan;
    if (typeof props.saveHandler === 'function') {
      plan = await props.saveHandler(planDraft);
    } else {
      plan = uploaderStore.addSubscriptionPlan(planDraft);
      uploaderStore.resetTierDraft();
    }

    showDescriptionEditor.value = false;
    showBackgroundImageUploader.value = false;

    emit('saved', plan);
    emit('update:modelValue', false);
    emit('close');
  } finally {
    isSaving.value = false;
  }
}

watch(originalPrice, (val) => {
  if (!props.modelValue) return;
  interactionsEngine.processFieldChange(originalPriceFieldConfig.value, val);
});
watch(discountPrice, (val) => {
  if (!props.modelValue) return;
  interactionsEngine.processFieldChange(discountPriceFieldConfig.value, val);
});
watch(freeTokens, (val) => {
  if (!props.modelValue) return;
  interactionsEngine.processFieldChange(freeTokensFieldConfig.value, val);
});
watch(merchDiscount, (val) => {
  if (!props.modelValue) return;
  interactionsEngine.processFieldChange(merchFieldConfig.value, val);
});
watch(payToViewDiscount, (val) => {
  if (!props.modelValue) return;
  interactionsEngine.processFieldChange(payToViewFieldConfig.value, val);
});
watch(customRequestDiscount, (val) => {
  if (!props.modelValue) return;
  interactionsEngine.processFieldChange(customRequestFieldConfig.value, val);
});
watch(unsubscribeDiscount, (val) => {
  if (!props.modelValue) return;
  interactionsEngine.processFieldChange(unsubscribeFieldConfig.value, val);
});

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      registerBenefitFields();
      showDraftNotice();
      return;
    }
    isSaving.value = false;
    hideDraftNotice();
    interactionsEngine.clearScope(SCOPE_ID);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  hideDraftNotice();
  interactionsEngine.clearScope(SCOPE_ID);
});

// Overlay handled by Teleport above (Upload Media slide-in sits above shared BasePopup overlay).
const addTierPopupConfig = computed(() => ({
  actionType: 'popup',
  position: 'center',
  customEffect: 'scale',
  offset: '0px',
  speed: '250ms',
  effect: 'ease-in-out',
  shouldShowOverlay: false,
  forceZIndex: 22000,
  shouldCloseOnOutsideClick: false,
  shouldLockBodyScroll: true,
  shouldCloseOnEscape: !isSaving.value,
  width: { default: 'auto', '<480': '95%' },
  height: { default: '90vh' },
  scrollable: true,
  closeSpeed: '250ms',
  closeEffect: 'cubic-bezier(0.4, 0, 0.2, 1)',
  loader: {
    component: LoadingSpinner,
    position: 'center',
    props: {
      size: '2xl',
      thickness: 1.5,
      color: 'text-success',
      trackColor: 'text-gray-200',
      showTrack: true,
    },
  },
}));
</script>
