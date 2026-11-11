<template>
  <!-- Nested over SubscriptionTierPopup slide-in: shared BasePopup overlay stays under the slide-in. -->
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[21999] bg-black/5 backdrop-blur-[7.5px]"
      aria-hidden="true"
    />
  </Teleport>

  <BasePopup
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :popup-config="popupConfig"
  >
    <div class="w-full flex flex-col bg-[#FFFFFFBF] backdrop-blur-[100px]">
      <div class="p-4 flex flex-col gap-6">
        <!-- Header -->
        <div class="w-full flex justify-between items-center">
          <h2 class="text-lg font-semibold leading-7 text-[#0C111D] dark:text-[#9e9689]">
            {{ t('plan.detail.discountPopup.title') }}
          </h2>
          <div
            class="cursor-pointer p-1"
            data-popup-close
            role="button"
            tabindex="0"
            :aria-label="t('plan.detail.discountPopup.closeAlt')"
            @click="emit('update:modelValue', false)"
          >
            <svg width="10" height="10" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17 1L1 17M1 1L17 17"
                stroke="#98A2B3"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>

        <!-- Subscription period and discount -->
        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
            {{ t('plan.detail.discountPopup.subscriptionPeriodDiscount') }}
          </h3>

          <div class="flex w-full flex-col items-stretch gap-2 md:flex-row md:items-start md:justify-between md:gap-4">
            <div class="flex min-w-0 w-full flex-1 [&_.dash-options]:bg-[#FFFFFFB2] [&_.dash-options]:backdrop-blur-[50px]">
              <BasePlanDropdown
                v-model="discountType"
                :options="discountTypeOptions"
                widthClass="w-1/2 shrink-0"
              />
              <div class="w-1/2 min-w-0">
                <div
                  class="w-full h-11 flex items-center gap-2 px-3.5 bg-[#FFFFFF4D] border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D]"
                >
                  <span
                    v-if="discountType === 'amount'"
                    class="text-base font-bold whitespace-nowrap text-[#344054] dark:text-[#bdb7af]"
                  >
                    {{ t('mediaUploader.addTier.usd') }}
                  </span>
                  <BaseInput
                    type="number"
                    v-model="discountAmount"
                    :show-controls="false"
                    wrapperClass="flex-1 min-w-0"
                    :inputClass="planInputInnerClass"
                  />
                  <span class="text-sm font-semibold whitespace-nowrap text-[#344054] dark:text-[#bdb7af]">
                    {{
                      discountType === 'percent'
                        ? t('mediaUploader.addTier.percentOff')
                        : t('plan.detail.discountPopup.off')
                    }}
                  </span>
                </div>
              </div>
            </div>

            <div v-if="showPricePreview" class="flex flex-col items-start pt-0.5 md:shrink-0 md:items-end">
              <div class="flex items-baseline gap-0.5">
                <span class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('mediaUploader.addTier.usd') }}
                </span>
                <span class="text-2xl font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('plan.detail.discountPopup.previewPrice') }}
                </span>
                <span class="text-xs font-medium text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('plan.detail.perMonth') }}
                </span>
              </div>
              <p class="text-sm text-[#667085] dark:text-[#9e9689]">
                {{ t('plan.detail.discountPopup.beforeDiscount', { price: t('plan.detail.discountPopup.previewBeforePrice') }) }}
              </p>
            </div>
            <p
              v-else-if="showAmountError"
              class="text-sm font-normal text-[#FF4405] dark:text-[#ff571e] md:shrink-0 md:whitespace-nowrap md:pt-2.5"
            >
              {{ t('plan.detail.discountPopup.amountRequired') }}
            </p>
          </div>
        </div>

        <!-- Discount period -->
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-1">
            <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
              {{ t('plan.detail.discountPopup.discountPeriod') }}
            </h3>
            <p class="text-sm font-[400] text-[#475467] dark:text-[#b1aba0]">
              {{ t('plan.detail.discountPopup.discountPeriodHelp') }}
            </p>
          </div>
          <div
            class="w-full h-11 flex items-center gap-2 px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]"
          >
            <BaseInput
              type="number"
              v-model="billingCycles"
              :show-controls="false"
              wrapperClass="flex-1 min-w-0"
              :inputClass="planInputInnerClass"
            />
            <span class="text-sm font-semibold whitespace-nowrap text-[#344054] dark:text-[#bdb7af]">
              {{ t('plan.detail.discountPopup.billingCycles') }}
            </span>
          </div>
        </div>

        <!-- Discount start and end date -->
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
                {{ t('plan.detail.discountPopup.dateRange') }}
              </h3>
              <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">
                {{ t('mediaUploader.addTier.optional') }}
              </span>
            </div>
            <p class="text-sm font-[400] text-[#475467] dark:text-[#b1aba0]">
              {{ t('plan.detail.discountPopup.dateRangeHelp') }}
            </p>
          </div>
          <div
            ref="dateRangeFieldRef"
            class="relative w-full"
            :class="openPicker === 'discount' ? 'z-30' : 'z-0'"
          >
            <div
              class="w-full h-11 flex items-center gap-2 px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043] cursor-pointer outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0"
              role="button"
              tabindex="0"
              @click="togglePicker('discount')"
              @keydown.enter.prevent="togglePicker('discount')"
              @keydown.space.prevent="togglePicker('discount')"
            >
              <img
                v-if="assets.calendar"
                :src="assets.calendar"
                alt=""
                class="w-5 h-5 shrink-0"
              />
              <span
                class="flex-1 min-w-0 truncate text-base"
                :class="
                  hasCompleteRange(dateRange)
                    ? 'text-[#101828] dark:text-[#d6d3cd]'
                    : 'text-[#667085] dark:text-[#9e9689]'
                "
              >
                {{ dateRangeDisplay }}
              </span>
            </div>
            <div
              v-if="openPicker === 'discount'"
              data-date-picker-panel
              class="relative mt-1 w-full z-30"
              @click.stop
            >
              <VueDatePicker
                v-model="dateRange"
                :config="datePickerConfig"
                class="w-full block"
                @range-selected="openPicker = null"
              />
            </div>
          </div>
        </div>

        <!-- Who can enter -->
        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
            {{ t('plan.detail.discountPopup.whoCanEnter') }}
          </h3>
          <div class="w-full [&_.dash-options]:bg-[#FFFFFFB2] [&_.dash-options]:backdrop-blur-[50px]">
            <BasePlanDropdown v-model="whoCanEnter" :options="audienceOptions" widthClass="w-full" />
          </div>
        </div>

        <!-- How many fans -->
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
                {{ t('plan.detail.discountPopup.fansClaim') }}
              </h3>
              <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">
                {{ t('mediaUploader.addTier.optional') }}
              </span>
            </div>
            <p class="text-sm font-[400] text-[#475467] dark:text-[#b1aba0]">
              {{ t('plan.detail.discountPopup.fansClaimHelp') }}
            </p>
          </div>

          <BaseInput
            type="number"
            v-model="fansClaimLimit"
            :show-controls="true"
            wrapperClass="w-full"
            :inputClass="planInputClass"
          />

          <div class="flex items-center gap-2">
            <CheckboxGroup
              v-model="limitOnePerFan"
              :label="t('plan.detail.discountPopup.limitOnePerFan')"
              :checkboxClass="checkboxClass"
              labelClass="text-sm text-[#0C111D] dark:text-[#dbd8d3]"
              wrapperClass="flex items-center gap-2"
            />
            <BaseTooltip placement="top" :width="220">
              <p class="text-xs leading-normal font-medium text-white dark:text-[#dbd8d3]">
                {{ t('plan.detail.discountPopup.limitOnePerFanTooltip') }}
              </p>
            </BaseTooltip>
          </div>
        </div>

        <!-- Spending requirement -->
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
                {{ t('plan.detail.discountPopup.spendingRequirement') }}
              </h3>
              <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">
                {{ t('mediaUploader.addTier.optional') }}
              </span>
            </div>
            <p class="text-sm font-[400] text-[#475467] dark:text-[#b1aba0]">
              {{ t('plan.detail.discountPopup.spendingRequirementHelp') }}
            </p>
          </div>

          <DashboardPrimaryButton
            v-if="!showSpendingRequirement"
            :text="t('plan.detail.discountPopup.addMinimumSpending')"
            variant="none"
            :leftIcon="assets.plusBlueSquare || assets.plusSquare"
            leftIconClass="w-5 h-5"
            customClass="!min-w-0 h-auto px-0 py-0 bg-transparent border-none outline-none flex items-center gap-0.5 text-sm font-medium text-[#155EEF] dark:text-[#2c8df1] uppercase"
            @click="openSpendingRequirement"
          />

          <div
            v-else
            class="w-full flex flex-col gap-4 p-4 rounded-[10px] bg-[#FFFFFF80]"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2 min-w-0">
                <h4 class="text-lg font-medium text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('plan.variation.popup.minimumSpending') }}
                </h4>
                <span class="text-xs font-normal italic text-[#667085] dark:text-[#9e9689]">
                  {{ t('mediaUploader.addTier.optional') }}
                </span>
              </div>
              <DashboardPrimaryButton
                :text="t('plan.variation.popup.removeSpendingRequirement')"
                variant="none"
                customClass="!min-w-0 h-auto px-0 py-0 bg-transparent border-none outline-none flex items-center gap-0.5 text-sm font-medium text-[#FF0066] dark:text-[#ff1a76] shrink-0"
                @click="removeSpendingRequirement"
              >
                <template #leftIcon>
                  <span
                    class="inline-block w-5 h-5 shrink-0 bg-[#FF0066] dark:bg-[#ff1a76]"
                    :style="minusMaskStyle"
                    aria-hidden="true"
                  />
                </template>
              </DashboardPrimaryButton>
            </div>

            <div class="flex w-full min-w-0">
              <div
                class="w-1/2 min-w-0 h-11 flex items-center gap-2 px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]"
              >
                <span class="text-base font-bold whitespace-nowrap text-[#344054] dark:text-[#bdb7af]">
                  {{ t('mediaUploader.addTier.usd') }}
                </span>
                <BaseInput
                  type="number"
                  v-model="minSpendingAmount"
                  :show-controls="false"
                  wrapperClass="flex-1 min-w-0"
                  :inputClass="planInputInnerClass"
                  placeholder="1000"
                />
              </div>

              <div ref="spendingCategoryRef" class="relative w-1/2 min-w-0 h-11">
                <div
                  class="h-11 flex items-center justify-between w-full px-3.5 border-b border-b-[#EAECF0] rounded-t-sm bg-[#FFFFFFE5] shadow-[0px_1px_2px_0px_#1018280D] cursor-pointer dark:border-b-[#353a3c]"
                  role="button"
                  tabindex="0"
                  @click.stop="toggleSpendingCategoryMenu"
                  @keydown.enter.prevent="toggleSpendingCategoryMenu"
                  @keydown.space.prevent="toggleSpendingCategoryMenu"
                >
                  <span
                    class="text-base font-medium truncate"
                    :class="spendingCategories.length
                      ? 'text-[#0c111d] dark:text-[#dbd8d3]'
                      : 'text-[#667085] dark:text-[#9e9689]'"
                  >
                    {{ spendingCategoryTriggerLabel }}
                  </span>
                  <div
                    class="select-arrow h-5 w-5 shrink-0 bg-[#98A2B3] transition-transform duration-300 ease-in-out"
                    :class="{ 'rotate-180': spendingCategoryOpen }"
                    :style="arrowsMaskStyle"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <div class="flex flex-col gap-1">
                <h4 class="text-lg font-medium text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ t('plan.variation.popup.spendingPeriod') }}
                </h4>
                <p class="text-sm font-normal text-[#475467] dark:text-[#b1aba0]">
                  {{ t('plan.variation.popup.spendingPeriodHelp') }}
                </p>
              </div>
              <div
                ref="spendingDateFieldRef"
                class="relative w-full"
                :class="openPicker === 'spending' ? 'z-30' : 'z-0'"
              >
                <div
                  class="w-full h-11 flex items-center gap-2 px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043] cursor-pointer outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0"
                  role="button"
                  tabindex="0"
                  @click="togglePicker('spending')"
                  @keydown.enter.prevent="togglePicker('spending')"
                  @keydown.space.prevent="togglePicker('spending')"
                >
                  <img
                    v-if="assets.calendar"
                    :src="assets.calendar"
                    alt=""
                    class="w-5 h-5 shrink-0"
                  />
                  <span
                    class="flex-1 min-w-0 truncate text-base"
                    :class="hasCompleteRange(spendingPeriodRange)
                      ? 'text-[#101828] dark:text-[#d6d3cd]'
                      : 'text-[#667085] dark:text-[#9e9689]'"
                  >
                    {{ spendingPeriodDisplay }}
                  </span>
                </div>
                <div
                  v-if="openPicker === 'spending'"
                  data-date-picker-panel
                  class="relative mt-1 w-full z-30"
                  @click.stop
                >
                  <VueDatePicker
                    v-model="spendingPeriodRange"
                    :config="datePickerConfig"
                    class="w-full block"
                    @range-selected="openPicker = null"
                  />
                </div>
              </div>
            </div>

            <CheckboxGroup
              v-model="allowLifetimeSpending"
              :label="t('plan.variation.popup.allowLifetimeSpending')"
              :checkboxClass="checkboxClass"
              labelClass="text-sm font-normal text-[#0C111D] dark:text-[#dbd8d3]"
              wrapperClass="flex items-center gap-2"
            />
          </div>
        </div>
      </div>

      <!-- Footer — no separate bg; inherits popup shell -->
      <div
        class="w-full flex items-center gap-4 px-6 py-4 "
      >
        <DashboardPrimaryButton
          :text="t('plan.detail.discountPopup.cancel')"
          variant="none"
          customClass="!min-w-0 h-10 px-2 bg-transparent border-none outline-none text-base font-medium uppercase text-[#667085] dark:text-[#9e9689]"
          @click="emit('update:modelValue', false)"
        />
        <DashboardPrimaryButton
          :text="t('plan.detail.discountPopup.addDiscount')"
          variant="mediaBtn"
          :leftIcon="canAddDiscount ? (assets.plusGreenSquare || assets.plusSquare) : (assets.plusGreySquare || assets.plusSquare)"
          leftIconClass="w-5 h-5 group-hover:brightness-0"
          :disabled="!canAddDiscount"
          customClass="!min-w-0 uppercase disabled:!bg-[#FFFFFF40] disabled:!text-[#98A2B3] disabled:opacity-100 disabled:cursor-not-allowed disabled:pointer-events-none"
          @click="onAddDiscount"
        />
      </div>
    </div>
  </BasePopup>

  <!-- Spending category menu — teleported; ignored by BasePopup outside-click via data-base-popup-portaled -->
  <Teleport to="body">
    <div
      v-if="spendingCategoryOpen"
      ref="spendingCategoryMenuRef"
      data-base-popup-portaled
      class="fixed z-[22100] overflow-hidden max-w-[100vw] shadow-[0px_4px_16px_0px_rgba(16,24,40,0.10)]"
      :style="spendingCategoryMenuStyle"
      @click.stop
    >
      <div class="w-full rounded-[2px] bg-white border border-[#EAECF0] overflow-hidden dark:bg-[#181a1b] dark:border-[#353a3c]">
        <div class="flex items-center justify-between gap-2 px-3.5 py-2.5 border-b border-[#EAECF0] dark:border-[#353a3c]">
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-normal text-[#667085] dark:text-[#9e9689]">
              {{ t('plan.variation.popup.spendingCategoryLabel') }}
            </span>
            <span class="text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3] truncate">
              {{ spendingCategoryTriggerLabel }}
            </span>
          </div>
          <div
            class="select-arrow h-4 w-4 shrink-0 bg-[#98A2B3] rotate-180"
            :style="arrowsMaskStyle"
            aria-hidden="true"
          />
        </div>

        <CheckboxGroup
          :modelValue="isAllSpendingCategoriesSelected"
          :label="t('plan.variation.popup.selectAll')"
          :checkboxClass="spendingCheckboxClass"
          wrapperClass="flex items-center w-full min-w-0 px-3.5 py-3 border-b border-[#EAECF0] bg-[#F2F4F7] cursor-pointer dark:bg-[#222526] dark:border-[#353a3c]"
          labelClass="order-1 flex-1 min-w-0 text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3]"
          @update:modelValue="toggleAllSpendingCategories"
        />

        <CheckboxGroup
          v-for="option in spendingCategoryOptions"
          :key="option.value"
          :modelValue="spendingCategories.includes(option.value)"
          :label="option.label"
          :checkboxClass="spendingCheckboxClass"
          wrapperClass="flex items-center w-full min-w-0 px-3.5 py-3 border-b border-[#EAECF0] last:border-b-0 bg-white cursor-pointer hover:bg-[#F9FAFB] dark:bg-[#181a1b] dark:hover:bg-[#222526] dark:border-[#353a3c]"
          labelClass="order-1 flex-1 min-w-0 text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]"
          @update:modelValue="(checked) => toggleSpendingCategory(option.value, checked)"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import BaseInput from '@/components/forms/inputs/BaseInput.vue';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
import BaseTooltip from '@/components/ui/tooltips/BaseTooltip.vue';
import VueDatePicker from '@/components/forms/date-picker/VueDatePicker.vue';
import { usePlanAssets } from '@/composables/usePlanAssets.js';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** Prefill when editing an existing discount */
  initialValues: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'save', 'add-minimum-spending']);

const { t } = useI18n();
const { assets } = usePlanAssets();

const discountType = ref('percent');
const discountAmount = ref('');
const billingCycles = ref('');
const dateRange = ref({ start: null, end: null });
const openPicker = ref(null);
const dateRangeFieldRef = ref(null);
const spendingDateFieldRef = ref(null);
const whoCanEnter = ref('everyone');
const fansClaimLimit = ref('');
const limitOnePerFan = ref(false);

const showSpendingRequirement = ref(false);
const minSpendingAmount = ref('');
const spendingCategories = ref([]);
const spendingCategoryOpen = ref(false);
const spendingCategoryRef = ref(null);
const spendingCategoryMenuRef = ref(null);
const spendingCategoryMenuStyle = ref({});
const spendingPeriodRange = ref({ start: null, end: null });
const allowLifetimeSpending = ref(false);

/** Same shell style as PlanDetail BaseInput fields */
const planInputClass =
  'w-full h-11 flex px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043] text-base bg-transparent border-none outline-none text-[#101828] placeholder:text-[#667085] dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]';

/** Nested inside tinted shell — no extra white input chrome */
const planInputInnerClass =
  'w-full h-full text-base bg-transparent border-none outline-none text-[#101828] placeholder:text-[#667085] dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]';

const datePickerConfig = computed(() => ({
  mode: 'range',
  layout: 'dual',
  enableTime: true,
  format: 'MM/DD/YYYY HH:mm:ss',
  alarmIcon: assets.value.alarm || '',
  style: {
    theme: 'pink',
    rounded: 'rounded-none',
    shadow: 'shadow-[0px_4px_20px_0px_rgba(0,0,0,0.10)]',
    border: 'border-0',
  },
}));

function emptyDateRange() {
  return { start: null, end: null };
}

function normalizeDateRange(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return { start: value.start ?? null, end: value.end ?? null };
  }
  if (typeof value === 'string' && value.includes(' - ')) {
    const [start, end] = value.split(' - ').map((part) => part.trim());
    return { start: start || null, end: end || null };
  }
  return emptyDateRange();
}

function hasCompleteRange(range) {
  return Boolean(range?.start && range?.end);
}

function formatDateRangeDisplay(range) {
  if (hasCompleteRange(range)) return `${range.start} - ${range.end}`;
  return t('plan.detail.discountPopup.datePlaceholder');
}

const dateRangeDisplay = computed(() => formatDateRangeDisplay(dateRange.value));
const spendingPeriodDisplay = computed(() => formatDateRangeDisplay(spendingPeriodRange.value));

function fieldRefForPicker(key) {
  return key === 'spending' ? spendingDateFieldRef.value : dateRangeFieldRef.value;
}

async function togglePicker(key) {
  if (openPicker.value === key) {
    openPicker.value = null;
    return;
  }
  spendingCategoryOpen.value = false;
  openPicker.value = key;
  await nextTick();
  const field = fieldRefForPicker(key);
  field?.scrollIntoView({ block: 'start', inline: 'nearest' });
  await nextTick();
  field
    ?.querySelector('[data-date-picker-panel]')
    ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function handleDatePickerOutsideClick(event) {
  if (!openPicker.value) return;
  const field = fieldRefForPicker(openPicker.value);
  if (field?.contains(event.target)) return;
  openPicker.value = null;
}

function handleSpendingCategoryOutsideClick(event) {
  if (!spendingCategoryOpen.value) return;
  if (spendingCategoryRef.value?.contains(event.target)) return;
  if (spendingCategoryMenuRef.value?.contains(event.target)) return;
  spendingCategoryOpen.value = false;
}

function handleWindowResize() {
  if (openPicker.value) openPicker.value = null;
  if (spendingCategoryOpen.value) positionSpendingCategoryMenu();
}

function handleScrollRepositionMenus() {
  if (spendingCategoryOpen.value) positionSpendingCategoryMenu();
}

onMounted(() => {
  document.addEventListener('mousedown', handleDatePickerOutsideClick);
  document.addEventListener('mousedown', handleSpendingCategoryOutsideClick);
  window.addEventListener('resize', handleWindowResize);
  window.addEventListener('scroll', handleScrollRepositionMenus, true);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleDatePickerOutsideClick);
  document.removeEventListener('mousedown', handleSpendingCategoryOutsideClick);
  window.removeEventListener('resize', handleWindowResize);
  window.removeEventListener('scroll', handleScrollRepositionMenus, true);
});

const discountTypeOptions = computed(() => [
  { label: t('plan.detail.discountPopup.percentOff'), value: 'percent' },
  { label: t('plan.detail.discountPopup.amountOff'), value: 'amount' },
]);

const audienceOptions = computed(() => [
  { label: t('plan.detail.audienceEveryone'), value: 'everyone' },
  { label: t('plan.detail.audienceInvited'), value: 'invited' },
]);

const spendingCategoryOptions = computed(() => [
  { label: t('plan.variation.popup.spendingCategories.tips'), value: 'tips' },
  { label: t('plan.variation.popup.spendingCategories.subscriptions'), value: 'subscriptions' },
  { label: t('plan.variation.popup.spendingCategories.payToView'), value: 'payToView' },
  { label: t('plan.variation.popup.spendingCategories.merch'), value: 'merch' },
]);

const spendingCategoryTriggerLabel = computed(() => {
  const count = spendingCategories.value.length;
  if (!count) return t('plan.variation.popup.selectSpendingCategory');
  return t('plan.variation.popup.nSelected', { count });
});

const isAllSpendingCategoriesSelected = computed(() => {
  const opts = spendingCategoryOptions.value;
  return opts.length > 0 && opts.every((opt) => spendingCategories.value.includes(opt.value));
});

function positionSpendingCategoryMenu() {
  const field = spendingCategoryRef.value;
  if (!field) return;

  const rect = field.getBoundingClientRect();
  const gap = 4;
  const pad = 8;

  const popupPanel =
    field.closest('[role="dialog"]') ||
    document.querySelector('[role="dialog"][aria-modal="true"]');
  const popupRect = popupPanel?.getBoundingClientRect();

  const minLeft = popupRect ? popupRect.left + pad : pad;
  const maxRight = popupRect ? popupRect.right - pad : window.innerWidth - pad;
  const maxWidth = Math.max(180, maxRight - minLeft);

  let width = Math.min(rect.width, maxWidth);
  let left = rect.left;

  if (left + width > maxRight) {
    left = Math.max(minLeft, maxRight - width);
  }
  if (left < minLeft) left = minLeft;
  if (left + width > maxRight) {
    width = maxRight - left;
  }

  const maxBottom = popupRect ? popupRect.bottom - pad : window.innerHeight - pad;
  const minTop = popupRect ? popupRect.top + pad : pad;
  const estimatedHeight = 280;
  let top = rect.bottom + gap;

  if (top + estimatedHeight > maxBottom) {
    const above = rect.top - gap - estimatedHeight;
    if (above >= minTop) {
      top = above;
    } else {
      top = Math.max(minTop, maxBottom - estimatedHeight);
    }
  }

  spendingCategoryMenuStyle.value = {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    maxWidth: `${maxWidth}px`,
    maxHeight: `${Math.max(160, maxBottom - top)}px`,
    overflowY: 'auto',
    boxSizing: 'border-box',
  };
}

async function toggleSpendingCategoryMenu() {
  if (spendingCategoryOpen.value) {
    spendingCategoryOpen.value = false;
    return;
  }
  if (openPicker.value) openPicker.value = null;
  spendingCategoryOpen.value = true;
  await nextTick();
  positionSpendingCategoryMenu();
}

function toggleSpendingCategory(value, checked) {
  const next = new Set(spendingCategories.value);
  if (checked) next.add(value);
  else next.delete(value);
  spendingCategories.value = Array.from(next);
}

function toggleAllSpendingCategories(checked) {
  spendingCategories.value = checked
    ? spendingCategoryOptions.value.map((opt) => opt.value)
    : [];
}

const arrowsMaskStyle = computed(() => ({
  maskImage: `url('${assets.value.arrowsMask}')`,
  webkitMaskImage: `url('${assets.value.arrowsMask}')`,
  maskSize: 'contain',
  webkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  webkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  webkitMaskPosition: 'center',
}));

const minusMaskStyle = computed(() => ({
  maskImage: `url('${assets.value.minusSquare}')`,
  webkitMaskImage: `url('${assets.value.minusSquare}')`,
  maskSize: 'contain',
  webkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  webkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  webkitMaskPosition: 'center',
}));

const showAmountError = computed(() => discountAmount.value === '' || discountAmount.value === null);
const showPricePreview = computed(() => String(discountAmount.value).length > 0);

const canAddDiscount = computed(() => {
  const amount = String(discountAmount.value ?? '').trim();
  const cycles = String(billingCycles.value ?? '').trim();
  return amount !== '' && Number(amount) > 0 && cycles !== '' && Number(cycles) > 0;
});

const checkboxClass =
  "appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border";

const spendingCheckboxClass =
  "order-2 ml-auto appearance-none bg-white border border-[#D0D5DD] rounded-[4px] w-4 h-4 shrink-0 cursor-pointer checked:bg-black checked:border-black checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-[#07F468] checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border";

const popupConfig = {
  actionType: 'popup',
  position: 'center',
  customEffect: 'instant',
  offset: '0px',
  speed: '0ms',
  effect: 'ease-in-out',
  // Nested overlay Teleport above slide-in; BasePopup closes on outside click.
  shouldShowOverlay: false,
  shouldCloseOnOutsideClick: true,
  forceZIndex: 22000,
  shouldLockBodyScroll: true,
  shouldCloseOnEscape: true,
  width: { default: '720px', '<786': '100%' },
  // Desktop: content height. Mobile: true full sheet (100% — 90vh + width 100% was half-sheet).
  height: { default: 'auto', '<786': '100%' },
  maxHeight: { default: '90vh', '<786': '100%' },
  scrollable: true,
  closeSpeed: '0ms',
  closeEffect: 'instant',
  // Shadow must live on the BasePopup panel — inner content is clipped by overflow-y:auto
  customClass: 'shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)]',
};

function resetSpendingRequirement() {
  showSpendingRequirement.value = false;
  minSpendingAmount.value = '';
  spendingCategories.value = [];
  spendingCategoryOpen.value = false;
  spendingPeriodRange.value = emptyDateRange();
  allowLifetimeSpending.value = false;
  if (openPicker.value === 'spending') openPicker.value = null;
}

function openSpendingRequirement() {
  showSpendingRequirement.value = true;
  emit('add-minimum-spending');
}

function removeSpendingRequirement() {
  resetSpendingRequirement();
}

function applyInitialValues(values) {
  openPicker.value = null;
  if (!values) {
    discountType.value = 'percent';
    discountAmount.value = '';
    billingCycles.value = '';
    dateRange.value = emptyDateRange();
    whoCanEnter.value = 'everyone';
    fansClaimLimit.value = '';
    limitOnePerFan.value = false;
    resetSpendingRequirement();
    return;
  }
  discountType.value = values.discountType ?? 'percent';
  discountAmount.value = values.discountAmount ?? '';
  billingCycles.value = values.billingCycles ?? '';
  dateRange.value = normalizeDateRange(values.dateRange);
  whoCanEnter.value = values.whoCanEnter ?? 'everyone';
  fansClaimLimit.value = values.fansClaimLimit ?? '';
  limitOnePerFan.value = Boolean(values.limitOnePerFan);
  showSpendingRequirement.value = Boolean(values.showSpendingRequirement);
  minSpendingAmount.value = values.minSpendingAmount ?? '';
  const incomingCategories = values.spendingCategories ?? values.spendingCategory;
  if (Array.isArray(incomingCategories)) {
    spendingCategories.value = incomingCategories.filter(Boolean);
  } else if (incomingCategories) {
    spendingCategories.value = [incomingCategories];
  } else {
    spendingCategories.value = [];
  }
  spendingCategoryOpen.value = false;
  spendingPeriodRange.value = normalizeDateRange(values.spendingPeriodRange ?? values.spendingPeriodDate);
  allowLifetimeSpending.value = Boolean(values.allowLifetimeSpending);
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) applyInitialValues(props.initialValues);
    else {
      openPicker.value = null;
      spendingCategoryOpen.value = false;
    }
  },
);

function onAddDiscount() {
  if (!canAddDiscount.value) return;
  emit('save', {
    discountType: discountType.value,
    discountAmount: String(discountAmount.value ?? '').trim(),
    billingCycles: String(billingCycles.value ?? '').trim(),
    dateRange: hasCompleteRange(dateRange.value)
      ? `${dateRange.value.start} - ${dateRange.value.end}`
      : '',
    whoCanEnter: whoCanEnter.value,
    fansClaimLimit: String(fansClaimLimit.value ?? '').trim(),
    limitOnePerFan: Boolean(limitOnePerFan.value),
    showSpendingRequirement: showSpendingRequirement.value,
    minSpendingAmount: String(minSpendingAmount.value ?? '').trim(),
    spendingCategories: [...spendingCategories.value],
    spendingPeriodRange: { ...spendingPeriodRange.value },
    allowLifetimeSpending: Boolean(allowLifetimeSpending.value),
  });
  emit('update:modelValue', false);
}
</script>
