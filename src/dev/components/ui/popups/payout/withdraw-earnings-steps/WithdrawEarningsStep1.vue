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

    <button type="button" class="hidden justify-center items-center gap-1 w-max">
      <img
        :src="assets.chevronLeft"
        :alt="t('payout.alt.chevronLeft')"
        class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(46%)_sepia(8%)_saturate(955%)_hue-rotate(183deg)_brightness(91%)_contrast(88%)]"
      />
      <span class="text-sm leading-[1.125rem] font-medium text-[#667085] dark:text-[#9e9589]">{{ t('payout.withdraw.back') }}</span>
    </button>

    <div class="flex flex-col gap-6 mt-4 md:mt-6">
      <div class="flex flex-col gap-4">
        <h3 class="text-base font-medium text-[#344054] dark:text-[#bdb8af]">
          {{ t('payout.withdraw.step1.whereToSend') }}
        </h3>

        <div class="select-dropdown relative flex w-full overflow-visible">
          <BasePlanDropdown
            v-model="country"
            :options="countryOptions"
            :unstyled="true"
            widthClass="w-full"
          >
            <template #trigger="{ isOpen, selectedOption }">
              <div
                class="payout-select__trigger w-full h-[3.5rem] flex justify-between items-center gap-2 p-4 border-b-[1.5px] bg-white/75 dark:bg-[#181a1b]/75 transition-colors cursor-pointer"
                :class="isOpen ? 'border-black dark:border-white' : 'border-[#D0D5DD] dark:border-[#3b4043]'"
              >
                <div class="flex items-center gap-2">
                  <img
                    :src="assets.globe"
                    :alt="t('payout.alt.globe')"
                    class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(78%)_sepia(17%)_saturate(268%)_hue-rotate(179deg)_brightness(81%)_contrast(86%)]"
                  />
                  <span
                    class="text-base flex-grow text-balance"
                    :class="
                      selectedOption
                        ? 'text-[#344054] dark:text-[#bdb8af] font-medium'
                        : 'text-[#667085] dark:text-[#9e9589]'
                    "
                  >
                    {{ selectedOption ? selectedOption.label : t('payout.withdraw.step1.selectCountry') }}
                  </span>
                </div>
                <img
                  class="select-arrow h-5 w-5 transition-transform duration-200 [filter:brightness(0)_saturate(100%)_invert(78%)_sepia(17%)_saturate(268%)_hue-rotate(179deg)_brightness(81%)_contrast(86%)]"
                  :class="{ 'rotate-180': isOpen }"
                  :src="assets.chevronDown"
                  :alt="t('payout.alt.chevronDown')"
                />
              </div>
            </template>

            <template #options-container="{ selectOption, modelValue, isOpen, isUpwards }">
              <div
                class="payout-options-container max-md:!fixed max-md:!flex max-md:!flex-col max-md:!justify-end max-md:!inset-0 max-md:!bg-white/60 max-md:!backdrop-blur-[2.5px] max-md:!shadow-[0px_-2px_4px_0px_#0000001A] absolute left-auto right-0 z-[9999] w-full origin-top shadow-[0px_0px_10px_-34px_#0000001A] transition-[opacity,transform] duration-200 ease-out h-auto overflow-auto"
                :class="[
                  isOpen
                    ? 'scale-100 opacity-100 pointer-events-auto'
                    : 'scale-95 opacity-0 pointer-events-none h-0 overflow-hidden',
                  isUpwards
                    ? 'bottom-[calc(100%+1.5px)] top-auto [transform-origin:50%_100%]'
                    : 'top-[calc(100%+1.5px)] [transform-origin:50%_0]',
                ]"
                @click.stop
              >
                <div
                  class="flex flex-col gap-2 max-md:gap-1 max-md:shadow-[0px_0px_12px_0px_#00000033] bg-white dark:bg-[#181a1b]"
                >
                  <div
                    class="flex items-center gap-2 p-4 border-b border-[#D0D5DD]/50 max-md:py-3 dark:border-[#3b4043]/50"
                  >
                    <img
                      :src="assets.search"
                      :alt="t('payout.alt.search')"
                      class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(25%)_sepia(27%)_saturate(547%)_hue-rotate(179deg)_brightness(89%)_contrast(94%)]"
                    />
                    <input
                      v-model="searchQuery"
                      type="text"
                      :placeholder="t('payout.withdraw.step1.searchCountry')"
                      class="w-full text-base text-[#667085] dark:text-[#9e9589] bg-transparent focus:outline-none"
                      @click.stop
                    />
                  </div>
                  <div
                    class="flex flex-col gap-2 max-md:gap-1 max-md:h-[10.75rem] h-[15.5rem] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  >
                    <div
                      v-for="option in filteredOptions"
                      :key="option.value"
                      class="option flex items-center justify-center gap-[0.625rem] cursor-pointer group hover:bg-[#F9FAFB] dark:hover:bg-[#222526]"
                      :class="{ 'bg-[#F2F4F7] dark:bg-[#222526]': modelValue === option.value }"
                      @click.stop="onSelectCountry(option, selectOption)"
                    >
                      <div class="option-inner-container flex items-center flex-1 gap-2 p-4 max-md:py-2">
                        <span class="text-base font-medium text-[#0C111D] text-balance dark:text-[#dbd8d3]">
                          {{ option.label }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </BasePlanDropdown>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <h3 class="text-base font-medium text-[#344054] dark:text-[#bdb8af]">{{ t('payout.withdraw.step1.enterPayoutAmount') }}</h3>

        <div class="flex flex-col gap-1">
          <div
            class="flex items-center gap-2 p-4 border-b-[1.5px] border-[#D0D5DD] bg-white/75 dark:bg-[#181a1b]/75 dark:border-[#3b4043]"
          >
            <div class="flex items-center gap-2 w-full">
              <span class="text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ t('payout.withdraw.usdPrefix') }}</span>
              <DashboardTextInput
                type="text"
                :placeholder="t('payout.withdraw.step1.amountPlaceholder')"
                v-model="amountStr"
                wrapperClass="w-full !p-0 !border-none !shadow-none !bg-transparent"
                inputClass="text-base placeholder:text-[#98A2B3] text-[#0C111D] bg-transparent focus:outline-none dark:placeholder:text-[#b0a993] dark:text-[#dbd8d3] !p-0 w-full !border-none !shadow-none"
                @input="handleAmountInput"
                @blur="formatAmountOnBlur"
              />
            </div>
          </div>

          <span v-if="hasInsufficientBalance" class="text-xs leading-normal text-[#FF4405] dark:text-[#ff571e]">
            {{ t('payout.withdraw.step1.insufficientBalance') }}
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
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';

const { t } = useI18n();
const { assets } = usePayoutAssets();

const props = defineProps({
  engine: {
    type: Object,
    required: true,
  },
});

defineEmits(['close']);

const country = computed({
  get: () => props.engine.state.selectedCountry,
  set: (val) => props.engine.setState('selectedCountry', val),
});

const amountStr = computed({
  get: () => props.engine.state.amount,
  set: (val) => props.engine.setState('amount', val),
});

const availableBalance = computed(() => props.engine.state.availableBalance || 30054.4);
const searchQuery = ref('');

const countryOptions = computed(() => [
  { label: t('payout.mock.countryAustralia'), value: 'australia' },
  { label: t('payout.mock.countryChina'), value: 'china' },
  { label: t('payout.mock.countryUk'), value: 'uk' },
  { label: t('payout.mock.countryUsa'), value: 'usa' },
  { label: t('payout.mock.countrySingapore'), value: 'singapore' },
]);

const filteredOptions = computed(() => {
  if (!searchQuery.value) return countryOptions.value;
  const lower = searchQuery.value.toLowerCase();
  return countryOptions.value.filter((opt) => opt.label.toLowerCase().includes(lower));
});

const hasInsufficientBalance = computed(() => {
  const num = parseFloat(amountStr.value);
  return !isNaN(num) && num > availableBalance.value;
});

const canProceed = computed(() => {
  const num = parseFloat(amountStr.value);
  return country.value && !isNaN(num) && num > 0 && num <= availableBalance.value;
});

watch(
  canProceed,
  (value) => {
    props.engine.setState('canProceed', value);
  },
  { immediate: true }
);

const handleAmountInput = (e) => {
  let value = typeof e === 'object' && e.target ? e.target.value : e;
  value = String(value || '').replace(/[^\d.]/g, '');
  const parts = value.split('.');
  if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
  if (value.includes('.')) {
    const splitVal = value.split('.');
    if (splitVal[1].length > 2) value = splitVal[0] + '.' + splitVal[1].slice(0, 2);
  }
  amountStr.value = value;
};

const formatAmountOnBlur = () => {
  if (amountStr.value) {
    let num = parseFloat(amountStr.value);
    if (!isNaN(num)) {
      if (num > availableBalance.value) num = availableBalance.value;
      amountStr.value = num.toFixed(2);
    }
  }
};

const onSelectCountry = (option, selectOption) => {
  selectOption(option);
  searchQuery.value = '';
};

const proceed = () => {
  if (!canProceed.value) return;
  props.engine.setState('selectedCountry', country.value);
  props.engine.setState('amount', amountStr.value);
  props.engine.goToStep(2);
};

defineExpose({ proceed });
</script>
