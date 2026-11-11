<template>
  <div class="flex flex-col gap-4 px-2 pt-2 pb-4 z-[2] md:p-4 xl:px-6">
    <div class="flex justify-between items-center">
      <h2 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">{{ t('payout.withdraw.title') }}</h2>

      <button
        type="button"
        class="flex justify-center items-center w-6 h-6 md:w-10 md:h-10 cursor-pointer hover:opacity-80"
        @click="$emit('close')"
      >
        <img
          :src="assets.closeAlt"
          :alt="t('payout.alt.close')"
          class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(73%)_sepia(11%)_saturate(425%)_hue-rotate(179deg)_brightness(87%)_contrast(89%)]"
        />
      </button>
    </div>

    <button
      type="button"
      class="flex justify-center items-center gap-1 w-max cursor-pointer hover:opacity-80 transition-opacity"
      @click="goBack"
    >
      <img
        :src="assets.chevronLeft"
        :alt="t('payout.alt.chevronLeft')"
        class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(46%)_sepia(8%)_saturate(955%)_hue-rotate(183deg)_brightness(91%)_contrast(88%)]"
      />
      <span class="text-xs leading-[1.125rem] font-medium text-[#667085] dark:text-[#9e9589]">{{ t('payout.withdraw.back') }}</span>
    </button>

    <h3 class="text-lg font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ t('payout.withdraw.step4.summary') }}</h3>

    <div class="flex flex-col gap-4">
      <h3 class="text-base text-[#0C111D] dark:text-[#dbd8d3]">
        {{ t('payout.withdraw.step4.confirmInfo') }}
      </h3>

      <div class="grid grid-cols-[80px_1fr] gap-x-2 gap-y-4 sm:grid-cols-[150px_1fr] md:gap-x-4">
        <span class="text-sm text-[#344054] dark:text-[#bdb8af]">{{ t('payout.withdraw.step4.country') }}</span>
        <span class="text-base font-medium text-black dark:text-[#e8e6e3]">{{ country }}</span>

        <span class="text-sm text-[#344054] dark:text-[#bdb8af]">{{ t('payout.withdraw.step4.payoutMethod') }}</span>
        <div class="flex flex-col gap-2">
          <span class="text-base font-medium text-black dark:text-[#e8e6e3]">{{ methodTitle }}</span>
          <span class="text-sm text-[#182230] dark:text-[#d1cdc7]">{{ fee }}</span>
        </div>

        <span class="text-sm text-[#344054] dark:text-[#bdb8af]">{{ t('payout.withdraw.step4.payoutDetails') }}</span>
        <div class="flex flex-col gap-2">
          <span class="text-base font-medium text-black dark:text-[#e8e6e3]">{{ t('payout.mock.bankNamePlaceholder') }}</span>
          <span class="text-base font-medium text-black dark:text-[#e8e6e3]">{{ t('payout.mock.accountHolderMasked') }}</span>
          <span class="text-sm text-[#182230] dark:text-[#d1cdc7]">
            {{ t('payout.withdraw.step4.accountNumberEnding', { ending: accountEnding }) }}
          </span>
        </div>

        <span class="text-sm text-[#344054] dark:text-[#bdb8af]">{{ t('payout.withdraw.step4.withdrawAmount') }}</span>
        <div class="flex flex-col gap-2">
          <span class="text-base font-medium text-black dark:text-[#e8e6e3]">{{ t('payout.withdraw.usdPrefix') }}{{ withdrawAmount }}</span>
          <div class="flex flex-col gap-2 h-[1.125rem]"></div>
        </div>

        <span class="hidden lg:inline text-sm text-[#344054] dark:text-[#bdb8af]">{{ t('payout.withdraw.step4.latestBalance') }}</span>
        <div class="hidden lg:flex flex-col gap-2">
          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center gap-2">
              <span class="text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3]">{{ t('payout.withdraw.step4.availableBalance') }}</span>
              <span class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
                {{ t('payout.withdraw.usdPrefix') }}{{ formatDecimal(availableBalance) }}
              </span>
            </div>

            <div class="flex justify-between items-center gap-2">
              <span class="text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ t('payout.withdraw.step4.payoutAmount') }}</span>
              <span class="text-base text-[#0C111D] dark:text-[#dbd8d3]">
                -{{ t('payout.withdraw.usdPrefix') }}{{ formatDecimal(payoutAmount) }}
              </span>
            </div>

            <hr class="border-t border-black dark:border-[#363b3d]" />

            <div class="flex justify-between items-center gap-2">
              <span class="text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ t('payout.withdraw.step4.latestBalance') }}</span>
              <span class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
                {{ t('payout.withdraw.usdPrefix') }}{{ latestBalance }}
              </span>
            </div>
          </div>

          <div class="flex flex-col gap-2 h-[1.125rem]"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { computed, onMounted } from 'vue';
import { formatDecimal } from '@/utils/common/formatters.js';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';

const { t } = useI18n();
const { assets } = usePayoutAssets();

const props = defineProps({
  engine: {
    type: Object,
    required: true,
  },
});

defineEmits(['close']);

const countryMap = computed(() => ({
  usa: t('payout.mock.countryUsa'),
  uk: t('payout.mock.countryUk'),
  australia: t('payout.mock.countryAustralia'),
  china: t('payout.mock.countryChina'),
  singapore: t('payout.mock.countrySingapore'),
}));

const country = computed(() => {
  const raw = props.engine.state.selectedCountry || props.engine.state.country || 'usa';
  return countryMap.value[String(raw).toLowerCase()] || String(raw).toUpperCase();
});

const payoutOption = computed(() => props.engine.state.payoutOption || {});
const methodTitle = computed(() =>
  payoutOption.value.title
    ? `${payoutOption.value.title} - ${payoutOption.value.currency}`
    : t('payout.mock.methodLabelBankDepositEur')
);
const fee = computed(() => payoutOption.value.fee || t('payout.mock.feeUsd345'));

const accountNumber = computed(() => props.engine.state.accountNumber || '123');
const accountEnding = computed(() => {
  const acc = String(accountNumber.value);
  return acc.length > 3 ? acc.slice(-3) : acc;
});
const withdrawAmount = computed(() => props.engine.state.amount || '120.00');

const availableBalance = computed(() => props.engine.state.availableBalance || 30054.4);
const payoutAmount = computed(() => parseFloat(withdrawAmount.value) || 0);
const latestBalance = computed(() => formatDecimal(availableBalance.value - payoutAmount.value));

onMounted(() => {
  props.engine.setState('canProceed', true);
});

function goBack() {
  props.engine.goToStep(props.engine.step - 1);
}

function proceed() {
  props.engine.goToStep(5);
}

defineExpose({ proceed });
</script>
