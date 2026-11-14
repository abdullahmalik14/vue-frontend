<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import UnifiedSelect from '@/components/ui/dropdowns/select/UnifiedSelect.vue';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

const props = defineProps({
  /** createStepStateEngine instance for this merch listing flow */
  engine: { type: Object, required: true },
});

const { t } = useI18n();

const SCOPE_ID = 'merchListingInventory';
const STOCK_MIN = 0;
const STOCK_MAX = 9999;
const WEIGHT_MIN = 0.1;
const WEIGHT_MAX = 100;
const DAYS_MIN = 1;
const DAYS_MAX = 90;
const INTL_DAYS_MIN = 1;
const INTL_DAYS_MAX = 90;
const SHIP_COST_MIN = 0;
const SHIP_COST_MAX = 500;

const attemptedSubmit = ref(false);
const rootEl = ref(null);

const stockAmount = computed({
  get: () => props.engine.state.stockAmount ?? '',
  set: (val) => props.engine.setState('stockAmount', val),
});

const unlimitedStock = computed({
  get: () => !!props.engine.state.unlimitedStock,
  set: (val) => props.engine.setState('unlimitedStock', !!val),
});

const limitOnePerBuyer = computed({
  get: () => !!props.engine.state.limitOnePerBuyer,
  set: (val) => props.engine.setState('limitOnePerBuyer', !!val),
});

const packageWeight = computed({
  get: () => props.engine.state.packageWeight ?? '',
  set: (val) => props.engine.setState('packageWeight', val),
});

const weightUnit = computed({
  get: () => props.engine.state.weightUnit || 'lb',
  set: (val) => props.engine.setState('weightUnit', val),
});

const originCountry = computed({
  get: () => props.engine.state.originCountry || '',
  set: (val) => {
    // UnifiedSelect emits the full option object — store the primitive value.
    const normalized =
      val && typeof val === 'object'
        ? (val.value ?? val.id ?? '')
        : val;
    props.engine.setState('originCountry', normalized ?? '');
  },
});

const estimatedShippingDays = computed({
  get: () => props.engine.state.estimatedShippingDays ?? '',
  set: (val) => props.engine.setState('estimatedShippingDays', val),
});

const shipInternationally = computed({
  get: () => !!props.engine.state.shipInternationally,
  set: (val) => props.engine.setState('shipInternationally', !!val),
});

const intlShippingDays = computed({
  get: () => props.engine.state.intlShippingDays ?? '',
  set: (val) => props.engine.setState('intlShippingDays', val),
});

const additionalShippingCost = computed({
  get: () => props.engine.state.additionalShippingCost ?? '',
  set: (val) => props.engine.setState('additionalShippingCost', val),
});

const checkboxLabelClass = 'text-[16px] font-[600] text-[#0C111D] cursor-pointer';
const checkboxWrapperClass = 'flex items-center gap-2';

const weightUnitOptions = computed(() => [
  { label: t('shops.merch.listing.inventory.weightUnits.lb'), value: 'lb' },
  { label: t('shops.merch.listing.inventory.weightUnits.kg'), value: 'kg' },
  { label: t('shops.merch.listing.inventory.weightUnits.oz'), value: 'oz' },
]);

const countryOptions = computed(() => [
  { label: t('shops.merch.listing.inventory.countries.taiwan'), value: 'taiwan' },
  { label: t('shops.merch.listing.inventory.countries.usa'), value: 'usa' },
  { label: t('shops.merch.listing.inventory.countries.singapore'), value: 'singapore' },
  { label: t('shops.merch.listing.inventory.countries.australia'), value: 'australia' },
  { label: t('shops.merch.listing.inventory.countries.uk'), value: 'uk' },
]);

/** Compact trigger; panel same width as lb.+arrow, flush to input right (pr-3) */
const weightUnitSelectClass =
  'shrink-0 w-auto [&>div]:!w-auto [&_button]:!w-auto [&_button]:!h-auto [&_button]:!min-h-0 [&_button]:!border-0 [&_button]:!bg-transparent [&_button]:!shadow-none [&_button]:!rounded-none [&_button]:!p-0 [&_button]:!gap-0 [&_button>span.block]:!flex-grow-0 [&_button>span.block]:!pr-0 [&_button>span.block]:!normal-case [&_button>span.block]:!text-[#344054] [&_button>span.block]:!font-medium [&_button>span.pointer-events-none]:!static [&_button>span.pointer-events-none]:!inset-auto [&_button>span.pointer-events-none]:!pr-0 [&_.select-arrow]:!h-5 [&_.select-arrow]:!w-5 [&>div>.absolute]:!w-[4.25rem] [&>div>.absolute]:!min-w-[4.25rem] [&>div>.absolute]:!right-0 [&>div>.absolute]:!left-auto [&>div>.absolute]:!translate-x-3 [&>div>.absolute>div]:!max-h-none [&>div>.absolute>div]:!overflow-y-visible';

function hasEnteredNumber(raw) {
  if (raw === '' || raw === null || raw === undefined) return false;
  return Number.isFinite(Number(raw));
}

/** Reject leading-zero integers like "011" / "00"; allow "0", "0.1", "10". */
function hasValidNumberFormat(raw) {
  const str = String(raw ?? '').trim();
  if (!str) return false;
  if (/^0\d+/.test(str)) return false;
  return Number.isFinite(Number(str));
}

function inRange(raw, min, max) {
  if (!hasValidNumberFormat(raw)) return false;
  const num = Number(raw);
  return Number.isFinite(num) && num >= min && num <= max;
}

const stockFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'stockAmount',
  validation: {
    required: false,
    rules: [
      {
        type: 'custom',
        message: t('shops.merch.listing.validation.valueBetween', {
          min: STOCK_MIN,
          max: STOCK_MAX,
        }),
        param: (value) => {
          if (props.engine.state.unlimitedStock) return true;
          if (!hasEnteredNumber(value)) return false;
          return inRange(value, STOCK_MIN, STOCK_MAX);
        },
      },
    ],
  },
  validateOnInput: true,
  validateOnMount: false,
}));

const packageWeightFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'packageWeight',
  validation: {
    required: false,
    rules: [
      {
        type: 'custom',
        message: t('shops.merch.listing.validation.valueBetween', {
          min: WEIGHT_MIN,
          max: WEIGHT_MAX,
        }),
        param: (value) => {
          if (!hasEnteredNumber(value)) return false;
          return inRange(value, WEIGHT_MIN, WEIGHT_MAX);
        },
      },
    ],
  },
  validateOnInput: true,
  validateOnMount: false,
}));

const originCountryFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'originCountry',
  validation: {
    required: true,
    requiredMessage: t('shops.merch.listing.validation.selectCountryOfOrigin'),
    rules: [
      {
        type: 'minLength',
        param: 1,
        message: t('shops.merch.listing.validation.selectCountryOfOrigin'),
      },
    ],
  },
  validateOnInput: true,
  validateOnMount: false,
}));

const estimatedShippingDaysFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'estimatedShippingDays',
  validation: {
    required: false,
    rules: [
      {
        type: 'custom',
        message: t('shops.merch.listing.validation.valueBetween', {
          min: DAYS_MIN,
          max: DAYS_MAX,
        }),
        param: (value) => {
          if (!hasEnteredNumber(value)) return false;
          return inRange(value, DAYS_MIN, DAYS_MAX);
        },
      },
    ],
  },
  validateOnInput: true,
  validateOnMount: false,
}));

const intlShippingDaysFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'intlShippingDays',
  validation: {
    required: false,
    rules: [
      {
        type: 'custom',
        message: t('shops.merch.listing.validation.valueBetween', {
          min: INTL_DAYS_MIN,
          max: INTL_DAYS_MAX,
        }),
        param: (value) => {
          if (!props.engine.state.shipInternationally) return true;
          if (!hasEnteredNumber(value)) return false;
          return inRange(value, INTL_DAYS_MIN, INTL_DAYS_MAX);
        },
      },
    ],
  },
  validateOnInput: true,
  validateOnMount: false,
}));

const additionalShippingCostFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'additionalShippingCost',
  validation: {
    required: false,
    rules: [
      {
        type: 'custom',
        message: t('shops.merch.listing.validation.valueBetween', {
          min: SHIP_COST_MIN,
          max: SHIP_COST_MAX,
        }),
        param: (value) => {
          if (!props.engine.state.shipInternationally) return true;
          if (!hasEnteredNumber(value)) return false;
          return inRange(value, SHIP_COST_MIN, SHIP_COST_MAX);
        },
      },
    ],
  },
  validateOnInput: true,
  validateOnMount: false,
}));

const stockFieldState = computed(() =>
  interactionsEngine.getFieldState(stockFieldConfig.value),
);
const packageWeightFieldState = computed(() =>
  interactionsEngine.getFieldState(packageWeightFieldConfig.value),
);
const originCountryFieldState = computed(() =>
  interactionsEngine.getFieldState(originCountryFieldConfig.value),
);
const estimatedShippingDaysFieldState = computed(() =>
  interactionsEngine.getFieldState(estimatedShippingDaysFieldConfig.value),
);
const intlShippingDaysFieldState = computed(() =>
  interactionsEngine.getFieldState(intlShippingDaysFieldConfig.value),
);
const additionalShippingCostFieldState = computed(() =>
  interactionsEngine.getFieldState(additionalShippingCostFieldConfig.value),
);

function showRangeError(hasValue, fieldState) {
  if (attemptedSubmit.value) {
    return !!fieldState && !fieldState.isValid;
  }
  if (!hasValue) return false;
  return !!fieldState && !fieldState.isValid;
}

const isStockInvalid = computed(() => {
  if (unlimitedStock.value) return false;
  return showRangeError(hasEnteredNumber(stockAmount.value), stockFieldState.value);
});

const isPackageWeightInvalid = computed(() =>
  showRangeError(hasEnteredNumber(packageWeight.value), packageWeightFieldState.value),
);

const isOriginCountryInvalid = computed(() => {
  if (!attemptedSubmit.value) return false;
  if (String(originCountry.value || '').trim()) return false;
  return !!originCountryFieldState.value && !originCountryFieldState.value.isValid;
});

const isEstimatedShippingDaysInvalid = computed(() =>
  showRangeError(
    hasEnteredNumber(estimatedShippingDays.value),
    estimatedShippingDaysFieldState.value,
  ),
);

const isIntlShippingDaysInvalid = computed(() => {
  if (!shipInternationally.value) return false;
  return showRangeError(
    hasEnteredNumber(intlShippingDays.value),
    intlShippingDaysFieldState.value,
  );
});

const isAdditionalShippingCostInvalid = computed(() => {
  if (!shipInternationally.value) return false;
  return showRangeError(
    hasEnteredNumber(additionalShippingCost.value),
    additionalShippingCostFieldState.value,
  );
});

const stockErrorText = computed(() =>
  t('shops.merch.listing.validation.valueBetween', { min: STOCK_MIN, max: STOCK_MAX }),
);
const packageWeightErrorText = computed(() =>
  t('shops.merch.listing.validation.valueBetween', { min: WEIGHT_MIN, max: WEIGHT_MAX }),
);
const estimatedShippingDaysErrorText = computed(() =>
  t('shops.merch.listing.validation.valueBetween', { min: DAYS_MIN, max: DAYS_MAX }),
);
const intlShippingDaysErrorText = computed(() =>
  t('shops.merch.listing.validation.valueBetween', {
    min: INTL_DAYS_MIN,
    max: INTL_DAYS_MAX,
  }),
);
const additionalShippingCostErrorText = computed(() =>
  t('shops.merch.listing.validation.valueBetween', {
    min: SHIP_COST_MIN,
    max: SHIP_COST_MAX,
  }),
);

watch(stockAmount, (val) => {
  interactionsEngine.processFieldChange(stockFieldConfig.value, val);
});
watch(unlimitedStock, () => {
  interactionsEngine.processFieldChange(stockFieldConfig.value, stockAmount.value);
});
watch(packageWeight, (val) => {
  interactionsEngine.processFieldChange(packageWeightFieldConfig.value, val);
});
watch(originCountry, (val) => {
  interactionsEngine.processFieldChange(originCountryFieldConfig.value, val);
});
watch(estimatedShippingDays, (val) => {
  interactionsEngine.processFieldChange(estimatedShippingDaysFieldConfig.value, val);
});
watch(intlShippingDays, (val) => {
  interactionsEngine.processFieldChange(intlShippingDaysFieldConfig.value, val);
});
watch(additionalShippingCost, (val) => {
  interactionsEngine.processFieldChange(additionalShippingCostFieldConfig.value, val);
});
watch(shipInternationally, () => {
  interactionsEngine.processFieldChange(intlShippingDaysFieldConfig.value, intlShippingDays.value);
  interactionsEngine.processFieldChange(
    additionalShippingCostFieldConfig.value,
    additionalShippingCost.value,
  );
});

const FIELD_ORDER = [
  'stockAmount',
  'packageWeight',
  'originCountry',
  'estimatedShippingDays',
  'intlShippingDays',
  'additionalShippingCost',
];

function scrollToField(fieldId) {
  const el = rootEl.value?.querySelector(`[data-merch-field="${fieldId}"]`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function validateStep() {
  attemptedSubmit.value = true;
  interactionsEngine.processFieldChange(stockFieldConfig.value, stockAmount.value);
  interactionsEngine.processFieldChange(packageWeightFieldConfig.value, packageWeight.value);
  interactionsEngine.processFieldChange(originCountryFieldConfig.value, originCountry.value);
  interactionsEngine.processFieldChange(
    estimatedShippingDaysFieldConfig.value,
    estimatedShippingDays.value,
  );
  interactionsEngine.processFieldChange(intlShippingDaysFieldConfig.value, intlShippingDays.value);
  interactionsEngine.processFieldChange(
    additionalShippingCostFieldConfig.value,
    additionalShippingCost.value,
  );

  const summary = interactionsEngine.validateScope(SCOPE_ID);
  if (summary.isValid) return true;

  const firstId =
    summary.firstInvalidField?.fieldId ||
    FIELD_ORDER.find((id) => summary.invalidFields?.some((f) => f.fieldId === id));
  if (firstId) {
    void nextTick(() => scrollToField(firstId));
  }
  return false;
}

onMounted(() => {
  interactionsEngine.register(stockFieldConfig.value, stockAmount.value, null);
  interactionsEngine.register(packageWeightFieldConfig.value, packageWeight.value, null);
  interactionsEngine.register(originCountryFieldConfig.value, originCountry.value, null);
  interactionsEngine.register(
    estimatedShippingDaysFieldConfig.value,
    estimatedShippingDays.value,
    null,
  );
  interactionsEngine.register(intlShippingDaysFieldConfig.value, intlShippingDays.value, null);
  interactionsEngine.register(
    additionalShippingCostFieldConfig.value,
    additionalShippingCost.value,
    null,
  );
});

onBeforeUnmount(() => {
  interactionsEngine.clearScope(SCOPE_ID);
});

defineExpose({ validateStep });
</script>

<template>
  <div
    ref="rootEl"
    data-component="merch-inventory-shipment-step"
    class="flex flex-col gap-6"
  >
    <!-- Stock -->
    <div class="flex flex-col gap-2">
      <p class="text-[14px] font-bold leading-5 text-[#667085]">
        {{ t('shops.merch.listing.inventory.stockTitle') }}
      </p>
      <p class="text-[16px] text-[#0C111D] font-[400]">
        {{ t('shops.merch.listing.inventory.stockSubtitle') }}
      </p>

      <div data-merch-field="stockAmount" class="flex flex-col gap-1">
        <DashboardTextInput
          id="merch_stock_amount"
          type="text"
          v-model="stockAmount"
          :placeholder="t('shops.merch.listing.inventory.enterAmountPlaceholder')"
        />
        <p v-if="isStockInvalid" class="text-sm text-error">
          {{ stockErrorText }}
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <CheckboxGroup
          v-model="unlimitedStock"
          :label="t('shops.merch.listing.inventory.unlimitedStock')"
          theme="successCustom"
          custom-check-mark
          :label-class="checkboxLabelClass"
          :wrapper-class="checkboxWrapperClass"
        />
        <CheckboxGroup
          v-model="limitOnePerBuyer"
          :label="t('shops.merch.listing.inventory.limitOnePerBuyer')"
          theme="successCustom"
          custom-check-mark
          :label-class="checkboxLabelClass"
          :wrapper-class="checkboxWrapperClass"
        />
      </div>
    </div>

    <!-- Shipment -->
    <div class="flex flex-col gap-4">
      <p class="text-sm font-bold leading-5 text-text-quaternary">
        {{ t('shops.merch.listing.inventory.shipmentTitle') }}
      </p>

      <div data-merch-field="packageWeight" class="flex flex-col gap-1">
        <DashboardTextInput
          id="merch_package_weight"
          type="text"
          show-label
          v-model="packageWeight"
          :label-text="t('shops.merch.listing.inventory.packageWeight')"
          :placeholder="t('shops.merch.listing.inventory.enterAmountPlaceholder')"
          right-span
        >
          <template #rightSpan>
            <div :class="weightUnitSelectClass">
              <UnifiedSelect
                v-model="weightUnit"
                :options="weightUnitOptions"
                variant="dashboard"
                name="merch-weight-unit"
                dropdown-max-height="max-h-none"
              />
            </div>
          </template>
        </DashboardTextInput>
        <p v-if="isPackageWeightInvalid" class="text-sm text-error">
          {{ packageWeightErrorText }}
        </p>
      </div>

      <div data-merch-field="originCountry" class="flex flex-col gap-1.5 w-full">
        <label class="text-sm font-medium text-[#667085] dark:text-[#9e9589]">
          {{ t('shops.merch.listing.inventory.originCountry') }}
        </label>
        <UnifiedSelect
          v-model="originCountry"
          :options="countryOptions"
          :placeholder="t('shops.merch.listing.inventory.selectCountryPlaceholder')"
          variant="dashboard"
          name="merch-origin-country"
        />
        <p v-if="isOriginCountryInvalid" class="text-sm text-error">
          {{ t('shops.merch.listing.validation.selectCountryOfOrigin') }}
        </p>
      </div>

      <div data-merch-field="estimatedShippingDays" class="flex flex-col gap-1">
        <DashboardTextInput
          id="merch_estimated_shipping_days"
          type="text"
          show-label
          v-model="estimatedShippingDays"
          :label-text="t('shops.merch.listing.inventory.estimatedShippingDays')"
          :placeholder="t('shops.merch.listing.inventory.numberOfDaysPlaceholder')"
          right-span
          :right-span-text="t('shops.merch.listing.inventory.daysSuffix')"
          right-span-class="text-base font-medium text-[#344054] dark:text-[#bdb7af]"
        />
        <p v-if="isEstimatedShippingDaysInvalid" class="text-sm text-error">
          {{ estimatedShippingDaysErrorText }}
        </p>
      </div>

      <CheckboxGroup
        v-model="shipInternationally"
        :label="t('shops.merch.listing.inventory.shipInternationally')"
        theme="successCustom"
        custom-check-mark
        :label-class="checkboxLabelClass"
        :wrapper-class="checkboxWrapperClass"
      />

      <div
        v-if="shipInternationally"
        class="flex flex-col gap-4 md:flex-row md:items-start"
      >
        <div class="flex-1 min-w-0" data-merch-field="intlShippingDays">
          <DashboardTextInput
            id="merch_intl_shipping_days"
            type="text"
            show-label
            v-model="intlShippingDays"
            :label-text="t('shops.merch.listing.inventory.estimatedShippingDays')"
            :placeholder="t('shops.merch.listing.inventory.numberOfDaysPlaceholder')"
            right-span
            :right-span-text="t('shops.merch.listing.inventory.daysSuffix')"
            right-span-class="text-base font-medium text-[#344054] dark:text-[#bdb7af]"
          />
          <p v-if="isIntlShippingDaysInvalid" class="mt-1 text-sm text-error">
            {{ intlShippingDaysErrorText }}
          </p>
        </div>
        <div class="flex-1 min-w-0" data-merch-field="additionalShippingCost">
          <DashboardTextInput
            id="merch_additional_shipping_cost"
            type="text"
            show-label
            v-model="additionalShippingCost"
            :label-text="t('shops.merch.listing.inventory.additionalShippingCost')"
            :placeholder="t('shops.merch.listing.inventory.enterAmountPlaceholder')"
            left-span
            :left-span-text="t('mediaUploader.subscription.usd')"
            left-span-class="!text-[16px] !font-[500] !text-[#475467]"
          />
          <p v-if="isAdditionalShippingCostInvalid" class="mt-1 text-sm text-error">
            {{ additionalShippingCostErrorText }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
