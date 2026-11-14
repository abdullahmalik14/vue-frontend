<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import CatalogSearchSelect from '@/dev/components/ui/search/CatalogSearchSelect.vue';
import AddTierPopup from '@/components/ui/popups/media/AddTierPopup.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

const props = defineProps({
  /** createStepStateEngine instance for this merch listing flow */
  engine: { type: Object, required: true },
  tagCatalog: { type: Array, default: () => [] },
  tagHistory: { type: Array, default: () => [] },
  collectionCatalog: { type: Array, default: () => [] },
});

const { t } = useI18n();
const { url: addTierIconUrl } = useAssetUrl('mediaUploader.icon.addTier');

const SCOPE_ID = 'merchListingProductDetails';
const PRODUCT_NAME_MAX = 100;
const DESCRIPTION_MAX = 500;

const showAddTierPopup = ref(false);
const attemptedSubmit = ref(false);
const rootEl = ref(null);

const productName = computed({
  get: () => props.engine.state.productName || '',
  set: (val) => props.engine.setState('productName', val),
});

const description = computed({
  get: () => props.engine.state.description || '',
  set: (val) => props.engine.setState('description', val),
});

const subscribersOnly = computed({
  get: () => !!props.engine.state.subscribersOnly,
  set: (val) => props.engine.setState('subscribersOnly', !!val),
});

const originalPrice = computed({
  get: () => props.engine.state.originalPrice ?? '',
  set: (val) => props.engine.setState('originalPrice', val),
});

const discountedPrice = computed({
  get: () => props.engine.state.discountedPrice ?? '',
  set: (val) => props.engine.setState('discountedPrice', val),
});

const tags = computed({
  get: () => props.engine.state.tags || [],
  set: (val) => props.engine.setState('tags', val),
});

const collections = computed({
  get: () => props.engine.state.collections || [],
  set: (val) => props.engine.setState('collections', val),
});

const subscriptionPlans = computed(() => props.engine.state.subscriptionPlans || []);
const subscriptionPlanIds = computed(() => props.engine.state.subscriptionPlanIds || []);

const hasTiers = computed(() => subscriptionPlans.value.length > 0);

const columnSplit = computed(() => Math.ceil(subscriptionPlans.value.length / 2));
const column1 = computed(() => subscriptionPlans.value.slice(0, columnSplit.value));
const column2 = computed(() => subscriptionPlans.value.slice(columnSplit.value));

const planCheckboxClass =
  'h-4 w-4 box-border appearance-none [-webkit-appearance:none] bg-white border border-gray-300 rounded-[4px] checked:bg-success checked:border-success before:!hidden after:!hidden';
const planLabelClass =
  'text-[14px] text-text-primary font-[400] cursor-pointer truncate min-w-0';

const productNameFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'productName',
  validation: {
    required: true,
    rules: [
      {
        type: 'minLength',
        param: 1,
        message: t('shops.merch.listing.validation.productNameRequired'),
      },
      {
        type: 'maxLength',
        param: PRODUCT_NAME_MAX,
        message: t('shops.merch.listing.validation.characterCount', {
          used: String(productName.value || '').length,
          max: PRODUCT_NAME_MAX,
        }),
      },
    ],
  },
  validateOnInput: true,
  validateOnMount: false,
}));

const descriptionFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'description',
  validation: {
    required: true,
    rules: [
      {
        type: 'minLength',
        param: 1,
        message: t('shops.merch.listing.validation.descriptionRequired'),
      },
      {
        type: 'maxLength',
        param: DESCRIPTION_MAX,
        message: t('shops.merch.listing.validation.characterCount', {
          used: String(description.value || '').length,
          max: DESCRIPTION_MAX,
        }),
      },
    ],
  },
  validateOnInput: true,
  validateOnMount: false,
}));

const subscriptionTiersFieldConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'subscriptionTiers',
  validation: {
    required: false,
    rules: [
      {
        type: 'custom',
        message: t('shops.merch.listing.validation.selectAtLeastOneTier'),
        param: () => {
          if (!props.engine.state.subscribersOnly) return true;
          return (props.engine.state.subscriptionPlanIds || []).length >= 1;
        },
      },
    ],
  },
  validateOnInput: true,
  validateOnMount: false,
}));

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
  dependsOn: ['originalPrice'],
  validation: {
    required: false,
    rules: [
      {
        type: 'custom',
        message: t('mediaUploader.subscription.discountPriceError'),
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

const productNameFieldState = computed(() =>
  interactionsEngine.getFieldState(productNameFieldConfig.value),
);
const descriptionFieldState = computed(() =>
  interactionsEngine.getFieldState(descriptionFieldConfig.value),
);
const subscriptionTiersFieldState = computed(() =>
  interactionsEngine.getFieldState(subscriptionTiersFieldConfig.value),
);
const originalPriceFieldState = computed(() =>
  interactionsEngine.getFieldState(originalPriceFieldConfig.value),
);
const discountPriceFieldState = computed(() =>
  interactionsEngine.getFieldState(discountPriceFieldConfig.value),
);

function hasEnteredNumber(raw) {
  if (raw === '' || raw === null || raw === undefined) return false;
  return Number.isFinite(Number(raw));
}

const isProductNameInvalid = computed(() => {
  if (!attemptedSubmit.value && String(productName.value || '').trim()) {
    return !!productNameFieldState.value && !productNameFieldState.value.isValid;
  }
  if (!attemptedSubmit.value) return false;
  return !!productNameFieldState.value && !productNameFieldState.value.isValid;
});

const isDescriptionInvalid = computed(() => {
  if (!attemptedSubmit.value && String(description.value || '').trim()) {
    return !!descriptionFieldState.value && !descriptionFieldState.value.isValid;
  }
  if (!attemptedSubmit.value) return false;
  return !!descriptionFieldState.value && !descriptionFieldState.value.isValid;
});

const isTierInvalid = computed(() => {
  if (!attemptedSubmit.value) return false;
  if (!subscribersOnly.value) return false;
  return !!subscriptionTiersFieldState.value && !subscriptionTiersFieldState.value.isValid;
});

const isOriginalPriceInvalid = computed(() => {
  if (attemptedSubmit.value && !hasEnteredNumber(originalPrice.value)) {
    return !!originalPriceFieldState.value && !originalPriceFieldState.value.isValid;
  }
  if (!hasEnteredNumber(originalPrice.value)) return false;
  return !!originalPriceFieldState.value && !originalPriceFieldState.value.isValid;
});

const isDiscountPriceInvalid = computed(() => {
  if (!hasEnteredNumber(discountedPrice.value)) return false;
  return !!discountPriceFieldState.value && !discountPriceFieldState.value.isValid;
});

const productNameCountClass = computed(() =>
  isProductNameInvalid.value ? 'text-error' : 'text-dark-gray',
);
const descriptionCountClass = computed(() =>
  isDescriptionInvalid.value ? 'text-error' : 'text-dark-gray',
);

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

function isPlanSelected(id) {
  return subscriptionPlanIds.value.includes(id);
}

function togglePlan(id, isChecked) {
  let next = [...subscriptionPlanIds.value];
  if (isChecked) {
    if (!next.includes(id)) next.push(id);
  } else {
    next = next.filter((item) => item !== id);
  }
  props.engine.setState('subscriptionPlanIds', next);
}

function openAddTierPopup() {
  showAddTierPopup.value = true;
}

function saveMerchTier(planDraft) {
  const id = `merch_tier_${Date.now()}`;
  const label = String(planDraft?.label || '').trim();
  if (!label) return null;

  const entry = {
    id,
    label,
    originalPrice: planDraft?.originalPrice ?? null,
    discountPrice: planDraft?.discountPrice ?? null,
    backgroundUrl: planDraft?.backgroundUrl || '',
  };

  const plans = [...(props.engine.state.subscriptionPlans || []), entry];
  const ids = [...(props.engine.state.subscriptionPlanIds || [])];
  if (!ids.includes(id)) ids.push(id);

  props.engine.setState('subscriptionPlans', plans);
  props.engine.setState('subscriptionPlanIds', ids);
  if (!props.engine.state.subscribersOnly) {
    props.engine.setState('subscribersOnly', true);
  }
  return entry;
}

function onTierSaved() {
  showAddTierPopup.value = false;
}

watch(subscribersOnly, (on) => {
  if (!on) return;
  if ((props.engine.state.subscriptionPlans || []).length > 0) return;
  const seeded = [
    { id: 'merch_static_free', label: t('mediaUploader.subscription.plans.free') },
    { id: 'merch_static_basic', label: t('mediaUploader.subscription.plans.basic') },
    { id: 'merch_static_amazing', label: t('mediaUploader.subscription.plans.amazing') },
    { id: 'merch_static_premium', label: t('mediaUploader.subscription.plans.premium') },
    { id: 'merch_static_complete', label: t('mediaUploader.subscription.plans.complete') },
    { id: 'merch_static_nsfw', label: t('mediaUploader.subscription.plans.nsfw') },
    { id: 'merch_static_featured', label: t('mediaUploader.subscription.plans.featured') },
  ];
  props.engine.setState('subscriptionPlans', seeded);
  props.engine.setState('subscriptionPlanIds', ['merch_static_featured']);
});

watch(productName, (val) => {
  interactionsEngine.processFieldChange(productNameFieldConfig.value, val);
});
watch(description, (val) => {
  interactionsEngine.processFieldChange(descriptionFieldConfig.value, val);
});
watch(originalPrice, (val) => {
  interactionsEngine.processFieldChange(originalPriceFieldConfig.value, val);
});
watch(discountedPrice, (val) => {
  interactionsEngine.processFieldChange(discountPriceFieldConfig.value, val);
});
watch([subscribersOnly, subscriptionPlanIds], () => {
  interactionsEngine.processFieldChange(
    subscriptionTiersFieldConfig.value,
    props.engine.state.subscriptionPlanIds || [],
  );
});

const FIELD_ORDER = [
  'productName',
  'description',
  'subscriptionTiers',
  'originalPrice',
  'discountPrice',
];

function scrollToField(fieldId) {
  const el = rootEl.value?.querySelector(`[data-merch-field="${fieldId}"]`);
  el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function validateStep() {
  attemptedSubmit.value = true;
  interactionsEngine.processFieldChange(productNameFieldConfig.value, productName.value);
  interactionsEngine.processFieldChange(descriptionFieldConfig.value, description.value);
  interactionsEngine.processFieldChange(
    subscriptionTiersFieldConfig.value,
    props.engine.state.subscriptionPlanIds || [],
  );
  interactionsEngine.processFieldChange(originalPriceFieldConfig.value, originalPrice.value);
  interactionsEngine.processFieldChange(discountPriceFieldConfig.value, discountedPrice.value);

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
  interactionsEngine.register(productNameFieldConfig.value, productName.value, null);
  interactionsEngine.register(descriptionFieldConfig.value, description.value, null);
  interactionsEngine.register(
    subscriptionTiersFieldConfig.value,
    props.engine.state.subscriptionPlanIds || [],
    null,
  );
  interactionsEngine.register(originalPriceFieldConfig.value, originalPrice.value, null);
  interactionsEngine.register(discountPriceFieldConfig.value, discountedPrice.value, null);
});

onBeforeUnmount(() => {
  interactionsEngine.clearScope(SCOPE_ID);
});

defineExpose({ validateStep });
</script>

<template>
  <div
    ref="rootEl"
    data-component="merch-product-details-step"
    class="flex flex-col gap-6"
  >
    <!-- 1. Basic info + subscribers -->
    <div class="flex flex-col gap-4">
      <div data-merch-field="productName">
        <DashboardTextInput
          id="merch_product_name"
          type="text"
          v-model="productName"
          :placeholder="t('shops.merch.listing.productNamePlaceholder')"
          :max-length="PRODUCT_NAME_MAX"
          :description-class="productNameCountClass"
        />
      </div>

      <div data-merch-field="description">
        <DashboardTextInput
          id="merch_description"
          type="textarea"
          textAreaRows="3"
          v-model="description"
          :placeholder="t('shops.merch.listing.descriptionPlaceholder')"
          :max-length="DESCRIPTION_MAX"
          :description-class="descriptionCountClass"
        />
      </div>

      <div data-merch-field="subscriptionTiers" class="flex flex-col gap-2">
        <CheckboxSwitch
          id="merch-subscribers-only"
          v-model="subscribersOnly"
          :label="t('shops.merch.listing.subscribersOnly')"
          theme="linkRow"
        />
        <p
          v-if="isTierInvalid"
          class="text-sm text-error"
        >
          {{ t('shops.merch.listing.validation.selectAtLeastOneTier') }}
        </p>
      </div>

      <div v-if="subscribersOnly" class="flex flex-col gap-4">
        <div class="flex w-full justify-between items-center gap-4">
          <p class="text-sm font-medium text-text-quaternary">
            {{ t('shops.merch.listing.selectSubscriptionPlan') }}
          </p>
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

        <div
          v-if="hasTiers"
          class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 w-full min-w-0"
        >
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
      </div>
    </div>

    <!-- 2. Price -->
    <div class="flex flex-col gap-2">
      <div class="flex flex-col gap-1">
        <p class="text-sm font-bold leading-5 text-text-quaternary">
          {{ t('shops.merch.listing.priceTitle') }}
        </p>
        <p class="text-base text-dark-text">
          {{ t('shops.merch.listing.priceSubtitle') }}
        </p>
      </div>
      <div class="md:flex md:justify-between md:items-start gap-4">
        <div class="flex-1" data-merch-field="originalPrice">
          <DashboardTextInput
            id="merch_original_price"
            type="number"
            show-label
            v-model="originalPrice"
            :label-text="t('shops.merch.listing.originalPrice')"
            leftSpan
            :leftSpanText="t('mediaUploader.subscription.usd')"
            :description="originalPriceDescription"
            :description-class="originalPriceDescriptionClass"
          />
        </div>
        <div class="flex-1" data-merch-field="discountPrice">
          <DashboardTextInput
            id="merch_discount_price"
            type="number"
            show-label
            v-model="discountedPrice"
            :label-text="t('shops.merch.listing.discountedPrice')"
            leftSpan
            :leftSpanText="t('mediaUploader.subscription.usd')"
            :description="discountPriceDescription"
            :description-class="discountPriceDescriptionClass"
          />
        </div>
      </div>
    </div>

    <!-- 3. Tags -->
    <CatalogSearchSelect
      :title="t('shops.merch.listing.tagsTitle')"
      :subtitle="t('shops.merch.listing.tagsSubtitle')"
      :placeholder="t('shops.merch.listing.tagsPlaceholder')"
      type="tags"
      :results="tagCatalog"
      :history-tags="tagHistory"
      v-model="tags"
      :max-items="10"
      show-language-icon
    />

    <!-- 4. Collection -->
    <CatalogSearchSelect
      type="collection"
      :title="t('shops.merch.listing.collectionTitle')"
      :placeholder="t('shops.merch.listing.collectionPlaceholder')"
      :results="collectionCatalog"
      v-model="collections"
      :max-items="10"
    />

    <AddTierPopup
      v-model="showAddTierPopup"
      :save-handler="saveMerchTier"
      @close="showAddTierPopup = false"
      @saved="onTierSaved"
    />
  </div>
</template>
