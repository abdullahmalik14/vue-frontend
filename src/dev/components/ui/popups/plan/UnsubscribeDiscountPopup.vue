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
            {{ t('plan.detail.unsubscribeDiscountPopup.title') }}
          </h2>
          <div
            class="cursor-pointer p-1"
            data-popup-close
            role="button"
            tabindex="0"
            :aria-label="t('plan.detail.unsubscribeDiscountPopup.closeAlt')"
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
            {{ t('plan.detail.unsubscribeDiscountPopup.subscriptionPeriodDiscount') }}
          </h3>

          <div class="flex w-full flex-col items-stretch gap-2 md:flex-row md:items-start md:justify-between md:gap-4">
            <div class="flex min-w-0 w-full flex-1">
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

            <p
              v-if="showAmountError"
              class="text-sm font-normal text-[#FF4405] dark:text-[#ff571e] md:shrink-0 md:whitespace-nowrap md:pt-2.5"
            >
              {{ t('plan.detail.unsubscribeDiscountPopup.amountRequired') }}
            </p>
          </div>
        </div>

        <!-- Unsubscribe Discount period -->
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-1">
            <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
              {{ t('plan.detail.unsubscribeDiscountPopup.discountPeriod') }}
            </h3>
            <p class="text-sm font-[400] text-[#475467] dark:text-[#b1aba0]">
              {{ t('plan.detail.unsubscribeDiscountPopup.discountPeriodHelp') }}
            </p>
          </div>
          <div
            class="w-full h-11 flex items-center gap-2 px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]"
            :class="{ 'opacity-50': unlimitedTime }"
          >
            <BaseInput
              type="number"
              v-model="billingCycles"
              :show-controls="false"
              :disabled="unlimitedTime"
              wrapperClass="flex-1 min-w-0"
              :inputClass="planInputInnerClass"
            />
            <span class="text-sm font-semibold whitespace-nowrap text-[#344054] dark:text-[#bdb7af]">
              {{ t('plan.detail.unsubscribeDiscountPopup.billingCycles') }}
            </span>
          </div>
          <CheckboxGroup
            v-model="unlimitedTime"
            :label="t('plan.detail.unsubscribeDiscountPopup.unlimitedTime')"
            :checkboxClass="checkboxClass"
            labelClass="text-sm text-[#0C111D] dark:text-[#dbd8d3]"
            wrapperClass="flex items-center gap-2"
          />
        </div>

        <!-- Message to Fan -->
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
                {{ t('plan.detail.unsubscribeDiscountPopup.messageToFan') }}
              </h3>
              <span class="text-xs leading-normal font-medium italic text-[#667085] dark:text-[#9e9689]">
                {{ t('mediaUploader.addTier.optional') }}
              </span>
            </div>
            <p class="text-sm font-[400] text-[#475467] dark:text-[#b1aba0]">
              {{ t('plan.detail.unsubscribeDiscountPopup.messageToFanHelp') }}
            </p>
          </div>
          <BaseInput
            type="textarea"
            v-model="messageToFan"
            :rows="2"
            :placeholder="t('plan.detail.unsubscribeDiscountPopup.messagePlaceholder')"
            wrapperClass="w-full bg-[#FFFFFF80]"
            :inputClass="planTextareaClass"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="w-full flex items-center gap-4 px-6 py-4">
        <DashboardPrimaryButton
          :text="t('plan.detail.unsubscribeDiscountPopup.cancel')"
          variant="none"
          customClass="!min-w-0 h-10 px-2 bg-transparent border-none outline-none text-base font-medium uppercase text-[#667085] dark:text-[#9e9689]"
          @click="emit('update:modelValue', false)"
        />
        <DashboardPrimaryButton
          :text="t('plan.detail.unsubscribeDiscountPopup.addDiscount')"
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
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import BaseInput from '@/components/forms/inputs/BaseInput.vue';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
import { usePlanAssets } from '@/composables/usePlanAssets.js';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  initialValues: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'save']);

const { t } = useI18n();
const { assets } = usePlanAssets();

const discountType = ref('percent');
const discountAmount = ref('');
const billingCycles = ref('');
const unlimitedTime = ref(false);
const messageToFan = ref('');

const planInputInnerClass =
  'w-full h-full text-base bg-transparent border-none outline-none text-[#101828] placeholder:text-[#667085] dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]';

const planTextareaClass =
  'w-full min-h-[6.5rem] px-3.5 py-2.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043] text-base bg-transparent border-none outline-none text-[#101828] placeholder:text-[#667085] dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]';

const discountTypeOptions = computed(() => [
  { label: t('plan.detail.discountPopup.percentOff'), value: 'percent' },
  { label: t('plan.detail.discountPopup.amountOff'), value: 'amount' },
]);

const showAmountError = computed(() => discountAmount.value === '' || discountAmount.value === null);

const canAddDiscount = computed(() => {
  const amount = String(discountAmount.value ?? '').trim();
  if (amount === '' || Number(amount) <= 0) return false;
  if (unlimitedTime.value) return true;
  const cycles = String(billingCycles.value ?? '').trim();
  return cycles !== '' && Number(cycles) > 0;
});

const checkboxClass =
  "appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border";

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
  // Desktop: content height. Mobile: fixed scrollport so bottom fields stay reachable.
  // Desktop: content height. Mobile: true full sheet (100% — 90vh + width 100% was half-sheet).
  height: { default: 'auto', '<786': '100%' },
  maxHeight: { default: '90vh', '<480': '100%' },
  scrollable: true,
  closeSpeed: '0ms',
  closeEffect: 'instant',
  customClass: 'shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)]',
};


function applyInitialValues(values) {
  if (!values) {
    discountType.value = 'percent';
    discountAmount.value = '';
    billingCycles.value = '';
    unlimitedTime.value = false;
    messageToFan.value = '';
    return;
  }
  discountType.value = values.discountType ?? 'percent';
  discountAmount.value = values.discountAmount ?? '';
  billingCycles.value = values.billingCycles ?? '';
  unlimitedTime.value = Boolean(values.unlimitedTime);
  messageToFan.value = values.messageToFan ?? '';
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) applyInitialValues(props.initialValues);
  },
);

function onAddDiscount() {
  if (!canAddDiscount.value) return;
  emit('save', {
    discountType: discountType.value,
    discountAmount: String(discountAmount.value ?? '').trim(),
    billingCycles: unlimitedTime.value ? '' : String(billingCycles.value ?? '').trim(),
    unlimitedTime: Boolean(unlimitedTime.value),
    messageToFan: String(messageToFan.value ?? '').trim(),
  });
  emit('update:modelValue', false);
}
</script>
