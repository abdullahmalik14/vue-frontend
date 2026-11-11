<template>
  <div>
    <div v-if="showAlert" class="w-full border-b-[0.5px] border-[#EAECF0] relative dark:border-[#222526]">
      <div class="w-[3px] block bg-[#FF4405] dark:bg-[#c93300]"></div>
      <div
        class="flex gap-4 px-4 py-3.5 flex-1 min-w-0 min-h-0 shadow-[0px_0px_8px_0px_#FF44051A] [background:linear-gradient(0deg,rgba(255,255,255,0.9),rgba(255,255,255))] before:absolute before:content-[''] before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-[rgba(255,68,5,0.1)] before:to-[rgba(255,255,255,0.9)] relative"
      >
        <div class="relative w-full flex items-center gap-2.5">
          <img
            :src="assets.alertOrange"
            :alt="t('payout.alt.alertOrangeFull')"
            class="w-6 min-w-[1.5rem] shrink-0 [filter:brightness(0)_saturate(100%)_invert(41%)_sepia(57%)_saturate(6607%)_hue-rotate(358deg)_brightness(101%)_contrast(100%)]"
          />
          <div class="flex flex-col w-full flex-1">
            <div class="flex justify-between items-start gap-1">
              <h3 class="text-sm font-semibold text-[#FF4405] dark:text-[#ff571e]">
                {{ t('payout.withdraw.step3.alertTitle') }}
              </h3>
              <button type="button" class="flex justify-center items-center w-6 h-6 hover:opacity-80" @click="closeAlert">
                <img
                  :src="assets.xClose"
                  :alt="t('payout.alt.xClose')"
                  class="w-6 h-6 min-w-[1.5rem] [filter:brightness(0)_saturate(100%)_invert(92%)_sepia(8%)_saturate(217%)_hue-rotate(178deg)_brightness(97%)_contrast(82%)]"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

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

      <h3 class="text-lg font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ t('payout.withdraw.step3.payoutDetails') }}</h3>

      <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-4">
          <h3 class="xl:hidden text-base text-[#0C111D] dark:text-[#dbd8d3]">
            {{ t('payout.withdraw.step3.enterNecessaryInfo') }}
          </h3>
          <h3 class="hidden xl:inline text-base text-[#0C111D] dark:text-[#dbd8d3]">
            {{ t('payout.withdraw.step3.provideInfo') }}
          </h3>

          <!-- Bank fields -->
          <div :class="fieldWrap(swiftError)">
            <label class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">{{ t('payout.withdraw.step3.bankSwiftBicCode') }}</label>
            <DashboardTextInput
              v-model="swiftCode"
              type="text"
              :placeholder="t('payout.withdraw.step3.swiftPlaceholder')"
              :show-label="false"
              :wrapper-class="inputWrapperClass(swiftError)"
              :input-class="inputClass"
              :show-tooltip="true"
              :tooltip-icon="assets.helpCircle"
              :tooltip-text="t('payout.withdraw.step3.swiftTooltip')"
              @update:model-value="(val) => handleFieldInput('swiftCode', val)"
            />
            <span class="hidden group-[.input-error]/input-container:inline text-sm text-[#FF4405] dark:text-[#ff571e]">
              {{ t('payout.withdraw.step3.invalidFormat') }}
            </span>
          </div>

          <div :class="fieldWrap(accountError)">
            <label class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">
              {{ t('payout.withdraw.step3.bankAccountOrIban') }}
            </label>
            <DashboardTextInput
              v-model="accountNumber"
              type="text"
              :placeholder="t('payout.withdraw.step3.ibanPlaceholder')"
              :show-label="false"
              :wrapper-class="inputWrapperClass(accountError)"
              :input-class="inputClass"
              @update:model-value="(val) => handleFieldInput('accountNumber', val)"
            />
            <span
              class="xl:hidden group-[.input-error]/input-container:!hidden text-sm text-[#475467] dark:text-[#b1aaa0]"
            >
              {{ t('payout.withdraw.step3.intermediaryHelpMobile') }}
            </span>
            <span
              class="hidden xl:inline group-[.input-error]/input-container:!hidden text-sm text-[#475467] dark:text-[#b1aaa0]"
            >
              {{ t('payout.withdraw.step3.intermediaryHelpDesktop') }}
            </span>
            <span class="hidden group-[.input-error]/input-container:inline text-sm text-[#FF4405] dark:text-[#ff571e]">
              {{ t('payout.withdraw.step3.invalidFormat') }}
            </span>
          </div>
        </div>

        <!-- Address section -->
        <div class="flex flex-col gap-2">
          <h3 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">{{ t('payout.withdraw.step3.address') }}</h3>
          <p class="text-sm text-[#475467] dark:text-[#b1aaa0]">
            {{ t('payout.withdraw.step3.addressHelp') }}
          </p>

          <div :class="fieldWrap(address1Error)">
            <DashboardTextInput
              v-model="address1"
              type="text"
              :placeholder="t('payout.withdraw.step3.addressLine1')"
              :show-label="false"
              :wrapper-class="inputWrapperClass(address1Error)"
              :input-class="inputClass"
              @update:model-value="(val) => handleFieldInput('address1', val)"
            />
            <span class="hidden group-[.input-error]/input-container:inline text-sm text-[#FF4405] dark:text-[#ff571e]">
              {{ t('payout.withdraw.step3.invalidFormat') }}
            </span>
          </div>

          <div :class="fieldWrap(address2Error)">
            <DashboardTextInput
              v-model="address2"
              type="text"
              :placeholder="t('payout.withdraw.step3.addressLine2')"
              :show-label="false"
              :wrapper-class="inputWrapperClass(address2Error)"
              :input-class="inputClass"
              @update:model-value="(val) => handleFieldInput('address2', val)"
            />
            <span class="hidden group-[.input-error]/input-container:inline text-sm text-[#FF4405] dark:text-[#ff571e]">
              {{ t('payout.withdraw.step3.invalidFormat') }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <div :class="[fieldWrap(postalError), 'w-full']">
              <DashboardTextInput
                v-model="postalCode"
                type="text"
                :placeholder="t('payout.withdraw.step3.postalCode')"
                :show-label="false"
                :wrapper-class="inputWrapperClass(postalError, true)"
                :input-class="inputClass"
                @update:model-value="(val) => handleFieldInput('postalCode', val)"
              />
              <span class="hidden group-[.input-error]/input-container:inline text-sm text-[#FF4405] dark:text-[#ff571e]">
                {{ t('payout.withdraw.step3.invalidFormat') }}
              </span>
            </div>
            <div :class="[fieldWrap(cityError), 'w-full']">
              <DashboardTextInput
                v-model="city"
                type="text"
                :placeholder="t('payout.withdraw.step3.city')"
                :show-label="false"
                :wrapper-class="inputWrapperClass(cityError, true)"
                :input-class="inputClass"
                @update:model-value="(val) => handleFieldInput('city', val)"
              />
              <span class="hidden group-[.input-error]/input-container:inline text-sm text-[#FF4405] dark:text-[#ff571e]">
                {{ t('payout.withdraw.step3.invalidFormat') }}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <div :class="[fieldWrap(countryError), 'w-full relative z-[10000]']">
              <BasePlanDropdown v-model="country" :options="countryOptions" :unstyled="true" width-class="w-full">
                <template #trigger="{ isOpen, selectedOption }">
                  <div :class="selectTriggerClass(isOpen, countryError)">
                    <span
                      class="text-base flex-grow capitalize text-balance"
                      :class="selectedOption ? 'text-[#101828] dark:text-[#d6d3cd]' : 'text-[#667085] dark:text-[#9e9589]'"
                    >
                      {{ selectedOption?.label || t('payout.withdraw.step3.country') }}
                    </span>
                    <img
                      class="select-arrow h-4 w-4 transition-transform duration-200 [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(10%)_saturate(466%)_hue-rotate(179deg)_brightness(96%)_contrast(81%)]"
                      :class="{ 'rotate-180': isOpen }"
                      :src="assets.arrows"
                      :alt="t('payout.alt.arrowDown')"
                    />
                  </div>
                </template>
                <template #options-container="{ options, selectOption, modelValue, isOpen, isUpwards }">
                  <div :class="simpleMenuClass(isOpen, isUpwards)">
                    <div
                      class="rounded-[0.125rem] border border-[rgba(186,188,203,0.5)] bg-white dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]"
                    >
                      <button
                        v-for="option in options"
                        :key="option.value"
                        type="button"
                        class="option flex items-center w-full gap-[0.625rem] p-[0.75rem] cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-[#222526]"
                        :class="{ 'bg-[#EAECF0] dark:bg-[#222526]': modelValue === option.value }"
                        @click.stop="onSelect(option, selectOption, 'country')"
                      >
                        <span
                          class="text-[0.875rem] font-medium leading-[1.25rem] text-[#0c111d] tracking-[0.01875rem] dark:text-[#dbd8d3]"
                        >
                          {{ option.label }}
                        </span>
                      </button>
                    </div>
                  </div>
                </template>
              </BasePlanDropdown>
              <span class="hidden group-[.input-error]/input-container:inline text-sm text-[#FF4405] dark:text-[#ff571e]">
                {{ t('payout.withdraw.step3.invalidFormat') }}
              </span>
            </div>

            <div :class="[fieldWrap(provinceError), 'w-full relative z-[10000]']">
              <BasePlanDropdown v-model="province" :options="stateOptions" :unstyled="true" width-class="w-full">
                <template #trigger="{ isOpen, selectedOption }">
                  <div :class="selectTriggerClass(isOpen, provinceError)">
                    <span
                      class="text-base flex-grow capitalize text-balance"
                      :class="selectedOption ? 'text-[#101828] dark:text-[#d6d3cd]' : 'text-[#667085] dark:text-[#9e9589]'"
                    >
                      {{ selectedOption?.label || t('payout.withdraw.step3.stateProvince') }}
                    </span>
                    <img
                      class="select-arrow h-4 w-4 transition-transform duration-200 [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(10%)_saturate(466%)_hue-rotate(179deg)_brightness(96%)_contrast(81%)]"
                      :class="{ 'rotate-180': isOpen }"
                      :src="assets.arrows"
                      :alt="t('payout.alt.arrowDown')"
                    />
                  </div>
                </template>
                <template #options-container="{ options, selectOption, modelValue, isOpen, isUpwards }">
                  <div :class="simpleMenuClass(isOpen, isUpwards)">
                    <div
                      class="rounded-[0.125rem] border border-[rgba(186,188,203,0.5)] bg-white dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]"
                    >
                      <button
                        v-for="option in options"
                        :key="option.value"
                        type="button"
                        class="option flex items-center w-full gap-[0.625rem] p-[0.75rem] cursor-pointer hover:bg-[#F9FAFB] dark:hover:bg-[#222526]"
                        :class="{ 'bg-[#EAECF0] dark:bg-[#222526]': modelValue === option.value }"
                        @click.stop="onSelect(option, selectOption, 'province')"
                      >
                        <span
                          class="text-[0.875rem] font-medium leading-[1.25rem] text-[#0c111d] tracking-[0.01875rem] dark:text-[#dbd8d3]"
                        >
                          {{ option.label }}
                        </span>
                      </button>
                    </div>
                  </div>
                </template>
              </BasePlanDropdown>
              <span class="hidden group-[.input-error]/input-container:inline text-sm text-[#FF4405] dark:text-[#ff571e]">
                {{ t('payout.withdraw.step3.invalidFormat') }}
              </span>
            </div>
          </div>
        </div>

        <!-- Phone -->
        <div :class="fieldWrap(phoneError)">
          <label class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">{{ t('payout.withdraw.step3.phoneNumber') }}</label>
          <div
            class="flex items-center gap-2 shadow-[0px_1px_2px_0px_#1018280D] rounded-t-sm border-b bg-white/50 dark:bg-[#181a1b]/50"
            :class="phoneError ? 'border-[#FF4405] dark:border-[#ff571e]' : 'border-[#D0D5DD] dark:border-[#3b4043]'"
          >
            <div class="flex items-center w-full">
              <div class="relative flex w-max z-[10001]">
                <BasePlanDropdown
                  v-model="phoneCountry"
                  :options="phoneCountryOptions"
                  :unstyled="true"
                  width-class="w-full"
                >
                  <template #trigger="{ isOpen, selectedOption }">
                    <div class="w-full min-w-[8.5rem] h-10 flex items-center justify-between gap-2 py-2 px-3 cursor-pointer">
                      <div class="flex items-center gap-3">
                        <span class="text-xl leading-6 text-[#101828] font-emoji dark:text-[#d6d3cd]">
                          {{ selectedOption?.flag || '🇭🇰' }}
                        </span>
                        <span class="text-xl leading-6 text-[#101828] dark:text-[#d6d3cd]">
                          {{ selectedOption?.code || '+852' }}
                        </span>
                      </div>
                      <img
                        class="select-arrow h-5 w-5 transition-transform duration-200 [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(10%)_saturate(466%)_hue-rotate(179deg)_brightness(96%)_contrast(81%)]"
                        :class="{ 'rotate-180': isOpen }"
                        :src="assets.chevronDown"
                        :alt="t('payout.alt.chevronDown')"
                      />
                    </div>
                  </template>
                  <template #options-container="{ options, selectOption, modelValue, isOpen, isUpwards, close }">
                    <div
                      class="max-md:!fixed max-md:!w-full max-md:!left-0 max-md:!bottom-0 max-md:!top-auto max-md:!shadow-[0px_-2px_4px_0px_#0000001A] absolute left-0 z-[9999] w-full min-w-[14.6875rem] origin-top rounded-lg shadow-lg backdrop-blur-[12.5px] transition-[opacity,transform] duration-200 ease-out"
                      :class="[
                        isOpen
                          ? 'scale-100 opacity-100 pointer-events-auto h-auto overflow-auto'
                          : 'scale-95 opacity-0 pointer-events-none h-0 overflow-hidden',
                        isUpwards
                          ? 'bottom-[calc(100%+0.5rem)] top-auto [transform-origin:50%_100%] max-md:!bottom-0'
                          : 'top-[calc(100%+0.5rem)] [transform-origin:50%_0] max-md:!top-auto',
                      ]"
                      @click="(e) => e.target === e.currentTarget && close()"
                    >
                      <div class="flex flex-col bg-white/95 dark:bg-[#181a1b]/95 rounded-lg overflow-hidden" @click.stop>
                        <button
                          v-for="option in options"
                          :key="option.value"
                          type="button"
                          class="flex items-center gap-2 p-3 cursor-pointer hover:bg-white dark:hover:bg-[#181a1b]"
                          :class="{ 'bg-[#EAECF0] dark:bg-[#222526]': modelValue === option.value }"
                          @click.stop="onSelect(option, selectOption, 'phoneCountry')"
                        >
                          <span class="text-xl leading-6 text-[#101828] font-emoji dark:text-[#d6d3cd]">
                            {{ option.flag }}
                          </span>
                          <div class="flex items-center gap-1">
                            <span class="text-base text-[#101828] dark:text-[#d6d3cd]">{{ option.label }}</span>
                            <span class="text-base font-semibold text-[#101828] dark:text-[#d6d3cd]">
                              {{ option.code }}
                            </span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </template>
                </BasePlanDropdown>
              </div>

              <input
                v-model="phoneNumber"
                type="text"
                :placeholder="t('payout.withdraw.step3.phoneNumber')"
                class="text-base placeholder:text-[#667085] text-[#101828] px-3 py-2 bg-transparent focus:outline-none flex-grow dark:placeholder:text-[#9e9589] dark:text-[#d6d3cd]"
                @input="handleFieldInput('phoneNumber', $event.target.value)"
              />
            </div>
          </div>
          <span class="hidden group-[.input-error]/input-container:inline text-sm text-[#FF4405] dark:text-[#ff571e]">
            {{ t('payout.withdraw.step3.invalidFormat') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

const { t } = useI18n();
const { assets } = usePayoutAssets();

const props = defineProps({
  engine: { type: Object, required: true },
});

defineEmits(['close']);

const engineState = props.engine.state;
const swiftCode = ref(engineState.swiftCode || '');
const accountNumber = ref(engineState.accountNumber || '');
const address1 = ref(engineState.address1 || '');
const address2 = ref(engineState.address2 || '');
const postalCode = ref(engineState.postalCode || '');
const city = ref(engineState.city || '');
const country = ref(engineState.addressCountry || '');
const province = ref(engineState.addressState || '');
const phoneCountry = ref(engineState.phoneCountry || 'hong-kong');
const phoneNumber = ref(engineState.phoneNumber || '');

const swiftError = ref(false);
const accountError = ref(false);
const address1Error = ref(false);
const address2Error = ref(false);
const postalError = ref(false);
const cityError = ref(false);
const countryError = ref(false);
const provinceError = ref(false);
const phoneError = ref(false);
const showAlert = ref(false);

const SCOPE_ID = 'payoutWithdrawStep3';

const invalidFormatMessage = computed(() => t('payout.withdraw.step3.invalidFormat'));

function requiredFieldConfig(id) {
  return {
    scope: SCOPE_ID,
    id,
    validation: { required: true, requiredMessage: invalidFormatMessage.value },
    validateOnInput: false,
  };
}

function optionalFieldConfig(id) {
  return {
    scope: SCOPE_ID,
    id,
    validation: {},
    validateOnInput: false,
  };
}

const swiftFieldConfig = computed(() => requiredFieldConfig('swiftCode'));
const accountFieldConfig = computed(() => requiredFieldConfig('accountNumber'));
const address1FieldConfig = computed(() => requiredFieldConfig('address1'));
const address2FieldConfig = computed(() => optionalFieldConfig('address2'));
const postalFieldConfig = computed(() => requiredFieldConfig('postalCode'));
const cityFieldConfig = computed(() => requiredFieldConfig('city'));
const countryFieldConfig = computed(() => requiredFieldConfig('country'));
const provinceFieldConfig = computed(() => requiredFieldConfig('province'));
const phoneFieldConfig = computed(() => requiredFieldConfig('phoneNumber'));

const fieldConfigsById = {
  swiftCode: swiftFieldConfig,
  accountNumber: accountFieldConfig,
  address1: address1FieldConfig,
  address2: address2FieldConfig,
  postalCode: postalFieldConfig,
  city: cityFieldConfig,
  country: countryFieldConfig,
  province: provinceFieldConfig,
  phoneNumber: phoneFieldConfig,
};

const fieldRefsById = {
  swiftCode,
  accountNumber,
  address1,
  address2,
  postalCode,
  city,
  country,
  province,
  phoneNumber,
};

const fieldErrorsById = {
  swiftCode: swiftError,
  accountNumber: accountError,
  address1: address1Error,
  address2: address2Error,
  postalCode: postalError,
  city: cityError,
  country: countryError,
  province: provinceError,
  phoneNumber: phoneError,
};

const countryOptions = computed(() => [
  { label: t('payout.mock.countryHongKong'), value: 'hong-kong' },
  { label: t('payout.mock.countryAustralia'), value: 'australia' },
  { label: t('payout.mock.countryUsa'), value: 'usa' },
]);

const stateOptions = computed(() => [
  { label: t('payout.mock.stateFlorida'), value: 'florida' },
  { label: t('payout.mock.stateHawaii'), value: 'hawaii' },
  { label: t('payout.mock.stateNewYork'), value: 'new-york' },
]);

const phoneCountryOptions = computed(() => [
  { value: 'hong-kong', label: t('payout.mock.countryHongKong'), flag: '🇭🇰', code: '+852' },
  { value: 'france', label: t('payout.mock.countryFrance'), flag: '🇫🇷', code: '+33' },
  { value: 'india', label: t('payout.mock.countryIndia'), flag: '🇮🇳', code: '+91' },
  { value: 'united-kingdom', label: t('payout.mock.countryUnitedKingdom'), flag: '🇬🇧', code: '+44' },
  { value: 'united-states', label: t('payout.mock.countryUnitedStates'), flag: '🇺🇸', code: '+1' },
]);

const inputClass =
  'text-base text-[#101828] placeholder:text-[#667085] dark:placeholder:text-[#9e9589] dark:text-[#d6d3cd] !p-0';

const fieldWrap = (err) => ['flex flex-col gap-1.5 group/input-container', { 'input-error': err }];

function inputWrapperClass(err, compact = false) {
  const base = compact
    ? 'rounded-t-sm !px-3 !py-2 !h-10 !shadow-[0px_1px_2px_0px_#1018280D] dark:!border-[#3b4043] !bg-white/10 dark:!bg-[#181a1b]/10'
    : 'rounded-t-sm !px-3 !py-2 !h-auto !shadow-[0px_1px_2px_0px_#1018280D] dark:!border-[#3b4043]';
  return `${base} ${err ? '!border-[#FF4405] dark:!border-[#ff571e]' : ''}`;
}

function selectTriggerClass(isOpen, err) {
  return [
    'w-full h-10 flex items-center gap-2 py-2 px-3 border-b bg-white/10 dark:bg-[#181a1b]/10 shadow-[0_1px_2px_0_#1018280D] cursor-pointer',
    err ? 'border-[#FF4405] dark:border-[#ff571e]' : 'border-[#D0D5DD] dark:border-[#3b4043]',
    isOpen ? 'border-black dark:border-white' : '',
  ];
}

function simpleMenuClass(isOpen, isUpwards) {
  return [
    'absolute left-0 right-0 z-[9999] w-full shadow-lg transition-[opacity,transform] duration-200 ease-out',
    isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none h-0 overflow-hidden',
    isUpwards
      ? 'bottom-[calc(100%+0.5rem)] top-auto [transform-origin:50%_100%]'
      : 'top-[calc(100%+0.5rem)] [transform-origin:50%_0]',
  ];
}

const canProceed = computed(() =>
  [
    swiftCode.value,
    accountNumber.value,
    address1.value,
    postalCode.value,
    city.value,
    country.value,
    province.value,
    phoneCountry.value,
    phoneNumber.value,
  ].every((v) => String(v || '').trim().length > 0)
);

watch(canProceed, (value) => props.engine.setState('canProceed', value), { immediate: true });

function closeAlert() {
  showAlert.value = false;
}

function clearErrors() {
  swiftError.value = false;
  accountError.value = false;
  address1Error.value = false;
  address2Error.value = false;
  postalError.value = false;
  cityError.value = false;
  countryError.value = false;
  provinceError.value = false;
  phoneError.value = false;
  showAlert.value = false;

  const scope = interactionsEngine.scopes[SCOPE_ID];
  if (scope) {
    Object.values(scope.fields).forEach((fieldState) => {
      fieldState.touched = false;
      fieldState.showError = false;
    });
  }
}

function handleFieldInput(fieldId, value) {
  const fieldConfig = fieldConfigsById[fieldId];
  if (fieldConfig) {
    interactionsEngine.processFieldChange(fieldConfig.value, String(value ?? '').trim());
  }
  clearErrors();
}

function onSelect(option, selectOption, fieldId) {
  selectOption(option);
  handleFieldInput(fieldId, option.value);
}

function goBack() {
  props.engine.goToStep(props.engine.step - 1);
}

onMounted(() => {
  Object.entries(fieldConfigsById).forEach(([fieldId, fieldConfig]) => {
    const initialValue = String(fieldRefsById[fieldId]?.value || '').trim();
    interactionsEngine.register(fieldConfig.value, initialValue);
  });
});

onBeforeUnmount(() => {
  interactionsEngine.clearScope(SCOPE_ID);
});

function validateInputs() {
  clearErrors();

  const result = interactionsEngine.validateScope(SCOPE_ID);

  result.invalidFields.forEach(({ fieldId }) => {
    const errorRef = fieldErrorsById[fieldId];
    if (errorRef) errorRef.value = true;
  });

  if (!result.isValid) showAlert.value = true;
  return result.isValid;
}

function proceed() {
  if (!validateInputs()) return;

  const phoneOpt = phoneCountryOptions.value.find((o) => o.value === phoneCountry.value);
  props.engine.setState('swiftCode', swiftCode.value.trim());
  props.engine.setState('accountNumber', accountNumber.value.trim());
  props.engine.setState('address1', address1.value.trim());
  props.engine.setState('address2', address2.value.trim());
  props.engine.setState('postalCode', postalCode.value.trim());
  props.engine.setState('city', city.value.trim());
  props.engine.setState('addressCountry', country.value);
  props.engine.setState('addressState', province.value);
  props.engine.setState('phoneCountry', phoneCountry.value);
  props.engine.setState('phoneCode', phoneOpt?.code || '');
  props.engine.setState('phoneNumber', phoneNumber.value.trim());
  props.engine.goToStep(4);
}

defineExpose({ proceed });
</script>
