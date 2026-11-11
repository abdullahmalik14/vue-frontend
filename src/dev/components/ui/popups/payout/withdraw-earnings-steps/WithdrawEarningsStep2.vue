<template>
  <div class="flex flex-col gap-4 px-2 pt-2 pb-4 z-[2] md:p-4 xl:px-6">
    <div class="flex justify-between items-center">
      <h2 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">{{ t('payout.withdraw.title') }}</h2>

      <button
        type="button"
        class="flex justify-center items-center w-6 h-6 md:w-10 md:h-10"
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
      class="flex justify-center items-center gap-1 w-max hover:opacity-80 transition-opacity"
      @click="goBack"
    >
      <img
        :src="assets.chevronLeft"
        :alt="t('payout.alt.chevronLeft')"
        class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(46%)_sepia(8%)_saturate(955%)_hue-rotate(183deg)_brightness(91%)_contrast(88%)]"
      />
      <span class="text-xs leading-[1.125rem] font-medium text-[#667085] dark:text-[#9e9589]">{{ t('payout.withdraw.back') }}</span>
    </button>

    <h3 class="text-lg font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ t('payout.withdraw.step2.payoutOptionsTitle') }}</h3>

    <div class="flex flex-col gap-2">
      <div
        v-for="option in payoutOptions"
        :key="option.id"
        :class="[
          'flex flex-col gap-2 p-4 rounded-sm backdrop-blur-[5px] border-[1.5px] group/option cursor-pointer transition-colors',
          selectedOption === option.id
            ? 'bg-black/90 border-white dark:bg-[#181a1b]/90 dark:border-[#303436] option-selected'
            : 'border-[#D0D5DD] bg-white/50 dark:border-[#3b4043] dark:bg-[#181a1b]/50 hover:bg-white dark:hover:bg-[#181a1b]',
        ]"
        @click="selectOption(option.id)"
      >
        <div class="flex justify-between items-center gap-2">
          <span
            :class="[
              'text-lg font-medium text-[#182230] dark:text-[#d1cdc7]',
              selectedOption === option.id
                ? 'text-[#FCFCFD] dark:text-[#e6e4e1]'
                : 'group-hover/option:text-black dark:group-hover/option:text-white',
            ]"
          >
            {{ option.title }}
          </span>
          <div
            class="flex items-center gap-1 flex-wrap px-2 py-1 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white dark:bg-[#181a1b]"
          >
            <div class="w-4 h-4">
              <img
                :src="option.icon"
                :alt="option.type"
                class="w-full h-full [filter:_brightness(0)_saturate(100%)]"
              />
            </div>
            <span class="text-sm leading-4 font-medium text-[#182230] dark:text-[#d1cdc7]">
              {{ option.type }}
            </span>
          </div>
        </div>

        <div class="flex justify-between items-center gap-2">
          <span
            :class="[
              'text-sm text-[#182230] dark:text-[#d1cdc7]',
              selectedOption === option.id ? 'text-[#FCFCFD] dark:text-[#e6e4e1]' : '',
            ]"
          >
            {{ t('payout.withdraw.step2.paysIn') }}
            <span
              :class="[
                'text-sm font-medium text-[#182230] dark:text-[#d1cdc7]',
                selectedOption === option.id ? 'text-[#FCFCFD] dark:text-[#e6e4e1]' : '',
              ]"
            >
              {{ option.currency }}
            </span>
          </span>
          <span
            :class="[
              'text-sm text-[#182230] dark:text-[#d1cdc7]',
              selectedOption === option.id ? 'text-[#FCFCFD] dark:text-[#e6e4e1]' : '',
            ]"
          >
            {{ option.fee }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';
import { computed, ref, watch } from 'vue';

const { t } = useI18n();
const { assets } = usePayoutAssets();

const props = defineProps({
  engine: {
    type: Object,
    required: true,
  },
});

defineEmits(['close']);

const payoutOptions = computed(() => [
  {
    id: 1,
    title: t('payout.mock.methodBankDeposit'),
    type: t('payout.mock.typeBank'),
    icon: assets.value.bank,
    currency: t('payout.mock.currencyEur'),
    fee: t('payout.mock.feeUsd345'),
  },
  {
    id: 2,
    title: t('payout.mock.methodBankDeposit'),
    type: t('payout.mock.typeBank'),
    icon: assets.value.bank,
    currency: t('payout.mock.currencyUsd'),
    fee: t('payout.mock.feeUsd345'),
  },
  {
    id: 3,
    title: t('payout.mock.methodBankWire'),
    type: t('payout.mock.typeBank'),
    icon: assets.value.bank,
    currency: t('payout.mock.currencyUsd'),
    fee: t('payout.mock.feeUsd345'),
  },
  {
    id: 4,
    title: t('payout.mock.methodBankWire'),
    type: t('payout.mock.typeBank'),
    icon: assets.value.bank,
    currency: t('payout.mock.currencyCzk'),
    fee: t('payout.mock.feeUsd345'),
  },
  {
    id: 5,
    title: t('payout.mock.methodUsdtEth'),
    type: t('payout.mock.typeCrypto'),
    icon: assets.value.crypto,
    currency: t('payout.mock.currencyUsdt'),
    fee: t('payout.mock.feeUsd345'),
  },
]);

const selectedOption = ref(props.engine.state.payoutOptionId || null);

const canProceed = computed(() => selectedOption.value !== null);

watch(
  canProceed,
  (value) => {
    props.engine.setState('canProceed', value);
  },
  { immediate: true }
);

function selectOption(id) {
  selectedOption.value = id;
  const option = payoutOptions.value.find((o) => o.id === id);
  props.engine.setState('payoutOptionId', id);
  props.engine.setState('payoutOption', option);
}

function goBack() {
  props.engine.goToStep(props.engine.step - 1);
}

function proceed() {
  if (!canProceed.value) return;
  props.engine.goToStep(3);
}

defineExpose({ proceed });
</script>
