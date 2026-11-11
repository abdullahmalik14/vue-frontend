<template>
  <!-- Nested above LuckyDrawEventPopup (22000): shared overlay cannot sit between them. -->
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-[22199] bg-black/5 backdrop-blur-[7.5px]"
      aria-hidden="true"
    />
  </Teleport>

  <BasePopup
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :popup-config="popupConfig"
  >
    <div class="w-full flex flex-col bg-[#FFFFFFBF]">
      <div class="p-4 flex flex-col gap-6">
        <!-- Header -->
        <div class="w-full flex flex-col gap-2">
          <div class="w-full flex justify-between items-center">
            <h2 class="text-lg font-semibold leading-7 text-[#0C111D] dark:text-[#9e9689]">
              {{ t('plan.luckyDraw.addPrizePopup.title') }}
            </h2>
            <div
              class="cursor-pointer p-1"
              data-popup-close
              role="button"
              tabindex="0"
              :aria-label="t('plan.luckyDraw.addPrizePopup.closeAlt')"
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
          <p class="text-sm font-normal text-[#667085] dark:text-[#9e9689]">
            {{ t('plan.luckyDraw.addPrizePopup.pendingDescription') }}
          </p>
        </div>

        <!-- Prize title -->
        <BaseInput
          type="text"
          v-model="prizeTitle"
          :show-controls="false"
          :placeholder="t('plan.luckyDraw.addPrizePopup.titlePlaceholder')"
          wrapperClass="w-full"
          :inputClass="planInputClass"
        />

        <!-- Description -->
        <BaseInput
          type="textarea"
          v-model="prizeDescription"
          :rows="3"
          :placeholder="t('plan.luckyDraw.addPrizePopup.descriptionPlaceholder')"
          wrapperClass="w-full"
          :inputClass="planTextareaClass"
        />

        <!-- Subscription Price -->
        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
            {{ t('plan.luckyDraw.addPrizePopup.subscriptionPrice') }}
          </h3>
          <div class="flex w-full min-w-0">
            <div
              class="w-1/2 min-w-0 h-11 flex items-center gap-2 px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043]"
            >
              <span class="text-base font-bold whitespace-nowrap text-[#344054] dark:text-[#bdb7af]">
                {{ t('mediaUploader.addTier.usd') }}
              </span>
              <BaseInput
                type="number"
                v-model="subscriptionPrice"
                :show-controls="false"
                wrapperClass="flex-1 min-w-0"
                :inputClass="planInputInnerClass"
              />
            </div>
            <BasePlanDropdown
              v-model="pricePeriod"
              :options="pricePeriodOptions"
              widthClass="w-1/2 min-w-0"
              triggerClass="!bg-[#FFFFFFE5] dark:!bg-[#FFFFFFE5]"
            />
          </div>
        </div>

        <!-- Discount period -->
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-1">
            <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
              {{ t('plan.luckyDraw.addPrizePopup.discountPeriod') }}
            </h3>
            <p class="text-sm font-[400] text-[#475467] dark:text-[#b1aba0]">
              {{ t('plan.luckyDraw.addPrizePopup.discountPeriodHelp') }}
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
              {{ t('plan.luckyDraw.addPrizePopup.billingCycles') }}
            </span>
          </div>
          <CheckboxGroup
            v-model="unlimitedTime"
            :label="t('plan.luckyDraw.addPrizePopup.unlimitedTime')"
            :checkboxClass="checkboxClass"
            labelClass="text-sm text-[#0C111D] dark:text-[#dbd8d3]"
            wrapperClass="flex items-center gap-2"
          />
        </div>

        <!-- How many winners -->
        <div class="flex flex-col gap-2">
          <h3 class="text-lg font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
            {{ t('plan.luckyDraw.addPrizePopup.howManyWinners') }}
          </h3>
          <BaseInput
            type="number"
            v-model="winnersCount"
            :show-controls="true"
            wrapperClass="w-full"
            :inputClass="planInputClass"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="w-full flex flex-col gap-3 px-6 py-4">
        <DashboardPrimaryButton
          :text="t('plan.luckyDraw.addPrizePopup.addPrize')"
          variant="mediaBtn"
          :leftIcon="canAddPrize ? (assets.plusGreenSquare || assets.plusSquare) : (assets.plusGreySquare || assets.plusSquare)"
          leftIconClass="w-5 h-5 group-hover:brightness-0"
          :disabled="!canAddPrize"
          customClass="!min-w-0 uppercase disabled:!bg-[#FFFFFF40] disabled:!text-[#98A2B3] disabled:opacity-100 disabled:cursor-not-allowed disabled:pointer-events-none"
          @click="onAddPrize"
        />
        <p class="text-xs font-normal text-[#667085] dark:text-[#9e9689]">
          {{ t('plan.luckyDraw.addPrizePopup.footerNote') }}
        </p>
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

const emit = defineEmits(['update:modelValue', 'add']);

const { t } = useI18n();
const { assets } = usePlanAssets();

const prizeTitle = ref('');
const prizeDescription = ref('');
const subscriptionPrice = ref('');
const pricePeriod = ref('month');
const billingCycles = ref('6');
const unlimitedTime = ref(false);
const winnersCount = ref('10');

const planInputClass =
  'w-full h-11 flex px-3.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043] text-base bg-transparent border-none outline-none text-[#101828] placeholder:text-[#667085] dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]';

const planInputInnerClass =
  'w-full h-full text-base bg-transparent border-none outline-none text-[#101828] placeholder:text-[#667085] dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]';

const planTextareaClass =
  'w-full min-h-[6.5rem] px-3.5 py-2.5 bg-white/30 border-b border-[#D0D5DD] rounded-t-sm shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b4d] dark:border-[#3b4043] text-base bg-transparent border-none outline-none text-[#101828] placeholder:text-[#667085] dark:text-[#d6d3cd] dark:placeholder:text-[#9e9689]';

const checkboxClass =
  "appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border";

const pricePeriodOptions = computed(() => [
  { label: t('plan.detail.perDay'), value: 'day' },
  { label: t('plan.detail.perMonthDuration'), value: 'month' },
  { label: t('plan.detail.perYear'), value: 'year' },
]);

const canAddPrize = computed(() => String(prizeTitle.value ?? '').trim().length > 0);

const popupConfig = {
  actionType: 'popup',
  position: 'center',
  customEffect: 'instant',
  offset: '0px',
  speed: '0ms',
  effect: 'ease-in-out',
  // Overlay via Teleport above — must sit above LuckyDrawEventPopup at 22000.
  shouldShowOverlay: false,
  shouldCloseOnOutsideClick: true,
  forceZIndex: 22200,
  shouldLockBodyScroll: true,
  shouldCloseOnEscape: true,
  width: { default: '720px', '<786': '100%' },
  height: { default: '90vh' },
  scrollable: true,
  closeSpeed: '0ms',
  closeEffect: 'instant',
  customClass: 'shadow-[0px_0px_12px_0px_rgba(0,0,0,0.1)]',
};


function applyInitialValues(values) {
  if (!values) {
    prizeTitle.value = '';
    prizeDescription.value = '';
    subscriptionPrice.value = '';
    pricePeriod.value = 'month';
    billingCycles.value = '6';
    unlimitedTime.value = false;
    winnersCount.value = '10';
    return;
  }
  prizeTitle.value = values.prizeTitle ?? values.title ?? '';
  prizeDescription.value = values.prizeDescription ?? values.description ?? '';
  subscriptionPrice.value = values.subscriptionPrice ?? values.price ?? '';
  pricePeriod.value = values.pricePeriod ?? 'month';
  billingCycles.value = values.billingCycles ?? '6';
  unlimitedTime.value = Boolean(values.unlimitedTime);
  winnersCount.value = values.winnersCount ?? '10';
}

function onAddPrize() {
  if (!canAddPrize.value) return;
  emit('add', {
    prizeTitle: prizeTitle.value,
    prizeDescription: prizeDescription.value,
    subscriptionPrice: subscriptionPrice.value,
    pricePeriod: pricePeriod.value,
    billingCycles: billingCycles.value,
    unlimitedTime: unlimitedTime.value,
    winnersCount: winnersCount.value,
  });
  emit('update:modelValue', false);
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) applyInitialValues(props.initialValues);
  },
);
</script>
