<template>
  <BasePopup
    :modelValue="modelValue"
    :popup-config="popupConfig"
    @update:modelValue="onPopupModelUpdate"
  >
    <div
      data-component="merch-filter-popup"
      class="relative w-full h-[100dvh] max-h-[100dvh] min-h-0 flex flex-col overflow-hidden bg-[#F9FAFBE5] shadow-[0px_0px_10px_0px_#00000040] md:w-[352px] dark:bg-[#1b1d1e]/90"
    >
      <div class="absolute inset-0 w-full h-full backdrop-blur-[30px] pointer-events-none z-[-1]"></div>

      <div class="relative z-[1] flex flex-col h-full min-h-0 p-3">
        <div class="w-full flex justify-between items-center shrink-0 px-2 pt-2">
          <Heading
            :text="t('shops.merch.library.filterPopup.title')"
            tag="h2"
            theme="custom"
            no-wrap
            add-class="text-sm font-semibold leading-5 text-slate-700 dark:text-timberwolf"
          />

          <button
            type="button"
            data-action="close-merch-filter"
            class="cursor-pointer p-1 hover:opacity-80"
            :aria-label="t('shops.merch.library.filterPopup.closeAlt')"
            @click="close"
          >
            <img
              v-if="closeIconUrl"
              :src="closeIconUrl"
              :alt="t('shops.merch.library.filterPopup.closeAlt')"
              class="w-[10px] h-[10px] [filter:brightness(0)_saturate(100%)_invert(68%)_sepia(8%)_saturate(456%)_hue-rotate(182deg)_brightness(92%)_contrast(87%)]"
            />
          </button>
        </div>

        <div class="flex flex-col gap-2 flex-1 min-h-0 mt-2">
          <section class="relative z-20 flex flex-col gap-2 opacity-80 shrink-0">
            <div class="flex flex-col gap-0">
              <div class="px-2.5 py-2">
                <h3 class="text-xs font-semibold leading-4 uppercase text-gray-500">
                  {{ t('shops.merch.library.filterPopup.sortBy') }}
                </h3>
              </div>
              <div class="relative px-2">
                <button
                  type="button"
                  data-action="toggle-merch-sort"
                  class="flex w-full items-center justify-between overflow-hidden rounded-lg bg-white/50 px-3.5 py-2.5 text-left"
                  @click="sortOpen = !sortOpen"
                >
                  <div class="flex min-w-0 items-center gap-1.5">
                    <span class="truncate text-sm font-semibold leading-5 text-slate-700 dark:text-timberwolf">
                      {{ selectedSortOption?.label }}
                    </span>
                    <img
                      v-if="sortInputIconUrl && selectedSortOption?.showArrow"
                      :src="sortInputIconUrl"
                      alt=""
                      class="h-[14px] w-[14px] shrink-0 object-contain"
                      :class="selectedSortOption?.arrowDir === 'desc' ? 'rotate-180' : ''"
                    />
                  </div>
                  <img
                    v-if="chevronUrl"
                    :src="chevronUrl"
                    alt=""
                    class="h-5 w-5 shrink-0 object-contain transition-transform duration-300 [filter:brightness(0)_saturate(100%)_invert(42%)_sepia(8%)_saturate(747%)_hue-rotate(182deg)_brightness(94%)_contrast(88%)]"
                    :class="{ 'rotate-180': sortOpen }"
                  />
                </button>
                <div
                  v-if="sortOpen"
                  data-merch-sort-select
                  class="absolute left-2 right-2 top-[calc(100%+0.25rem)] z-30 overflow-hidden rounded-lg bg-white py-1 shadow-[0px_4px_12px_0px_rgba(16,24,40,0.08)]"
                >
                  <button
                    v-for="option in sortOptions"
                    :key="option.value"
                    type="button"
                    class="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-gray-50"
                    :class="sortKeyModel === option.value ? 'bg-gray-50' : ''"
                    @click="selectSortOption(option.value)"
                  >
                    <span class="flex-1 text-sm font-medium leading-5 text-slate-700">
                      {{ option.label }}
                    </span>
                    <img
                      v-if="sortOptionIconUrl && option.showArrow"
                      :src="sortOptionIconUrl"
                      alt=""
                      class="h-[13px] w-[10px] shrink-0 object-contain"
                      :class="option.arrowDir === 'desc' ? 'rotate-180' : ''"
                    />
                  </button>
                </div>
              </div>
            </div>

            <div class="flex min-h-10 items-center gap-2 px-4 py-1">
              <span class="flex-1 text-sm font-semibold leading-5 text-gray-900 dark:text-timberwolf">
                {{ t('shops.merch.library.filterPopup.preOrder') }}
              </span>
              <CheckboxSwitch
                id="merch-filter-preorder"
                v-model="preOrderOnlyModel"
                label=""
                theme="filter"
              />
            </div>

            <div class="flex min-h-10 items-center gap-2 px-4 py-1">
              <span class="flex-1 text-sm font-semibold leading-5 text-gray-900 dark:text-timberwolf">
                {{ t('shops.merch.library.filterPopup.subscriberOnly') }}
              </span>
              <CheckboxSwitch
                id="merch-filter-subscriber"
                v-model="subscriberOnlyModel"
                label=""
                theme="filter"
              />
            </div>

            <div class="flex min-h-10 items-center gap-2 px-4 py-1">
              <span class="flex-1 text-sm font-semibold leading-5 text-gray-900 dark:text-timberwolf">
                {{ t('shops.merch.library.filterPopup.onSale') }}
              </span>
              <CheckboxSwitch
                id="merch-filter-onsale"
                v-model="onSaleOnlyModel"
                label=""
                theme="filter"
              />
            </div>
          </section>

          <div
            class="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            <section class="flex flex-col gap-1 px-2">
              <div class="flex items-center justify-between py-1">
                <h3 class="flex-1 text-xs font-semibold leading-4 text-gray-500">
                  {{ t('shops.merch.library.filterPopup.tags') }}
                </h3>
              </div>
              <DashboardTextInput
                id="merch-filter-tags"
                v-model="tagQueryModel"
                type="text"
                :placeholder="t('shops.merch.library.filterPopup.searchTags')"
                :left-icon="searchIconUrl"
                left-icon-class="[filter:brightness(0)_saturate(100%)_invert(45%)_sepia(8%)_saturate(747%)_hue-rotate(182deg)_brightness(94%)_contrast(88%)]"
                wrapper-class="!h-12 !min-h-12 !rounded-none !border-0 !border-b !border-gray-300 !bg-white/50 !shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
                add-class="!gap-0"
                input-class="text-base font-normal leading-6 text-gray-900 placeholder:text-gray-500"
              />
            </section>

            <section class="flex flex-col gap-1 px-2">
              <div class="flex items-center justify-between py-1">
                <h3 class="flex-1 text-xs font-semibold leading-4 text-gray-500">
                  {{ t('shops.merch.library.filterPopup.collections') }}
                </h3>
              </div>
              <DashboardTextInput
                id="merch-filter-collections"
                v-model="collectionQueryModel"
                type="text"
                :placeholder="t('shops.merch.library.filterPopup.searchCollections')"
                :left-icon="searchIconUrl"
                left-icon-class="[filter:brightness(0)_saturate(100%)_invert(45%)_sepia(8%)_saturate(747%)_hue-rotate(182deg)_brightness(94%)_contrast(88%)]"
                wrapper-class="!h-12 !min-h-12 !rounded-none !border-0 !border-b !border-gray-300 !bg-white/50 !shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)]"
                add-class="!gap-0"
                input-class="text-base font-normal leading-6 text-gray-900 placeholder:text-gray-500"
              />
            </section>

            <section class="flex flex-col">
              <div class="flex items-center justify-between gap-2 border-b px-2.5 py-2">
                <h3 class="text-xs font-semibold leading-4 uppercase text-gray-500">
                  {{ t('shops.merch.library.filterPopup.subscriptionTier') }}
                </h3>
                <DashboardPrimaryButton
                  :text="t('shops.merch.library.filterPopup.selectAll')"
                  theme="mediaFilterSelectWide"
                  type="button"
                  :leftIcon="selectAllIconUrl"
                  @click="selectAllTiers"
                />
              </div>

              <CheckboxGroup
                v-for="tier in tierRows"
                :key="tier"
                :model-value="isTierSelected(tier)"
                custom-check-mark
                :checkbox-class="filterCheckboxClass"
                :label="tier"
                label-class="text-sm font-medium leading-5 text-gray-900 truncate dark:text-timberwolf"
                wrapper-class="flex items-center w-full min-h-12 h-12 px-4 py-2 [&_svg_path]:stroke-black [&>div]:w-full [&>div]:flex-row-reverse [&>div]:justify-between"
                @update:model-value="(checked) => toggleTier(tier, checked)"
              />
            </section>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 pt-6">
          <div class="flex-1 min-w-0">
            <DashboardPrimaryButton
              data-action="reset-merch-filter"
              :text="t('shops.merch.library.filterPopup.reset')"
              theme="mediaFilterReset"
              type="button"
              btnBg="transparent"
              btnHoverBg="#FF4405"
              btnText="#FF4405"
              btnHoverText="#FFFFFF"
              :leftIcon="resetIconUrl"
              @click="resetDraft"
            />
          </div>
          <div class="flex-1 min-w-0">
            <DashboardPrimaryButton
              data-action="apply-merch-filter"
              :text="t('shops.merch.library.filterPopup.apply')"
              theme="mediaFilterApply"
              type="button"
              :leftIcon="applyIconUrl"
              @click="applyFilters"
            />
          </div>
        </div>
      </div>
    </div>
  </BasePopup>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { createStepStateEngine, toPersistableState } from '@/utils/stateEngine.js';

const filterCheckboxClass =
  'h-4 w-4 box-border appearance-none [-webkit-appearance:none] bg-white border border-gray-300 rounded-[4px] checked:bg-green-500 checked:border-green-500 before:!hidden after:!hidden';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  appliedFilters: {
    type: Object,
    default: () => ({
      sortKey: 'uploadDate_desc',
      preOrderOnly: false,
      subscriberOnly: false,
      onSaleOnly: false,
      tagQuery: '',
      collectionQuery: '',
      tiers: [],
    }),
  },
  items: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'apply']);

const { t } = useI18n();

const { url: closeIconUrl } = useAssetUrl('mediaUploader.icon.close');
const { url: chevronUrl } = useAssetUrl('mediaUploader.icon.chevronDown');
const { url: resetIconUrl } = useAssetUrl('mediaUploader.icon.filterReset');
const { url: applyIconUrl } = useAssetUrl('mediaUploader.icon.filterApply');
const { url: selectAllIconUrl } = useAssetUrl('mediaUploader.icon.filterSelectAll');
const { url: searchIconUrl } = useAssetUrl('mediaUploader.searchIcon');
const { url: sortInputIconUrl } = useAssetUrl('shops.merch.icon.filterSortInput');
const { url: sortOptionIconUrl } = useAssetUrl('shops.merch.icon.filterSortOption');

const sortOpen = ref(false);

const popupConfig = {
  actionType: 'slideIn',
  from: 'right',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,
  shouldLockBodyScroll: true,
  shouldCloseOnEscape: true,
  scrollable: false,
  containerClass: '[&>div]:h-full [&>div]:min-h-0',
  width: { default: '100%', '>768': '352px' },
  height: { default: '100%' },
};

const filterEngine = createStepStateEngine({
  flowId: 'merchLibraryFilterDraft',
  urlSync: 'none',
  persist: false,
  defaults: createDefaultMerchFilters(),
});

const draft = filterEngine.state;

const sortOptions = computed(() => {
  const uploadDate = t('shops.merch.library.filterPopup.uploadDate');
  return [
    { value: 'uploadDate_asc', label: uploadDate, showArrow: true, arrowDir: 'asc' },
    { value: 'uploadDate_desc', label: uploadDate, showArrow: true, arrowDir: 'desc' },
    { value: 'mostPopular', label: t('shops.merch.library.filterPopup.mostPopular'), showArrow: false },
  ];
});

const sortKeyModel = computed(() => draft.sortKey || 'uploadDate_desc');

const selectedSortOption = computed(() => {
  const key = sortKeyModel.value;
  return sortOptions.value.find((option) => option.value === key) || sortOptions.value[1];
});

function selectSortOption(value) {
  filterEngine.setState('sortKey', value || 'uploadDate_desc');
  sortOpen.value = false;
}

function onDocumentPointerDown(event) {
  if (!sortOpen.value) return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (target.closest('[data-action="toggle-merch-sort"]')) return;
  if (target.closest('[data-merch-sort-select]')) return;
  sortOpen.value = false;
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown, true);
});

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown, true);
});

const preOrderOnlyModel = computed({
  get: () => Boolean(draft.preOrderOnly),
  set: (val) => filterEngine.setState('preOrderOnly', Boolean(val)),
});

const subscriberOnlyModel = computed({
  get: () => Boolean(draft.subscriberOnly),
  set: (val) => filterEngine.setState('subscriberOnly', Boolean(val)),
});

const onSaleOnlyModel = computed({
  get: () => Boolean(draft.onSaleOnly),
  set: (val) => filterEngine.setState('onSaleOnly', Boolean(val)),
});

const tagQueryModel = computed({
  get: () => String(draft.tagQuery || ''),
  set: (val) => filterEngine.setState('tagQuery', String(val ?? '')),
});

const collectionQueryModel = computed({
  get: () => String(draft.collectionQuery || ''),
  set: (val) => filterEngine.setState('collectionQuery', String(val ?? '')),
});

const tierRows = computed(() => {
  const names = new Set();
  (props.items || []).forEach((item) => {
    merchItemTiers(item).forEach((tier) => names.add(tier));
  });
  return [...names];
});

function createDefaultMerchFilters() {
  return {
    sortKey: 'uploadDate_desc',
    preOrderOnly: false,
    subscriberOnly: false,
    onSaleOnly: false,
    tagQuery: '',
    collectionQuery: '',
    tiers: [],
  };
}

function cloneFilters(filters) {
  const base = createDefaultMerchFilters();
  if (!filters) return base;
  return {
    sortKey: filters.sortKey || 'uploadDate_desc',
    preOrderOnly: Boolean(filters.preOrderOnly),
    subscriberOnly: Boolean(filters.subscriberOnly),
    onSaleOnly: Boolean(filters.onSaleOnly),
    tagQuery: String(filters.tagQuery || ''),
    collectionQuery: String(filters.collectionQuery || ''),
    tiers: Array.isArray(filters.tiers) ? [...filters.tiers] : [],
  };
}

function merchItemTiers(item) {
  const planIds = Array.isArray(item?.subscriptionPlanIds) ? item.subscriptionPlanIds : [];
  const plans = Array.isArray(item?.subscriptionPlans) ? item.subscriptionPlans : [];
  return plans
    .filter((plan) => plan && planIds.includes(plan.id))
    .map((plan) => String(plan.label || plan.name || '').trim())
    .filter(Boolean);
}

function applyDraft(next) {
  const cloned = cloneFilters(next);
  filterEngine.setState('sortKey', cloned.sortKey);
  filterEngine.setState('preOrderOnly', cloned.preOrderOnly);
  filterEngine.setState('subscriberOnly', cloned.subscriberOnly);
  filterEngine.setState('onSaleOnly', cloned.onSaleOnly);
  filterEngine.setState('tagQuery', cloned.tagQuery);
  filterEngine.setState('collectionQuery', cloned.collectionQuery);
  filterEngine.setState('tiers', cloned.tiers);
}

function isTierSelected(tier) {
  return Array.isArray(draft.tiers) && draft.tiers.includes(tier);
}

function toggleTier(tier, checked) {
  const current = Array.isArray(draft.tiers) ? [...draft.tiers] : [];
  if (checked) {
    if (!current.includes(tier)) current.push(tier);
  } else {
    const idx = current.indexOf(tier);
    if (idx >= 0) current.splice(idx, 1);
  }
  filterEngine.setState('tiers', current);
}

function selectAllTiers() {
  filterEngine.setState('tiers', [...tierRows.value]);
}

function resetDraft() {
  const next = createDefaultMerchFilters();
  applyDraft(next);
  emit('apply', cloneFilters(next));
}

function applyFilters() {
  emit('apply', cloneFilters(toPersistableState(draft) || draft));
  close();
}

function close() {
  emit('update:modelValue', false);
}

function onPopupModelUpdate(val) {
  emit('update:modelValue', val);
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      applyDraft(props.appliedFilters);
      return;
    }
    sortOpen.value = false;
  },
);
</script>
