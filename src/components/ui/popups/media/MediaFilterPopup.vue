<template>
  <BasePopup
    :modelValue="modelValue"
    :popup-config="popupConfig"
    @update:modelValue="onPopupModelUpdate"
  >
    <div
      data-component="media-filter-popup"
      class="relative w-full h-[100dvh] max-h-[100dvh] min-h-0 flex flex-col overflow-hidden bg-[#F9FAFBE5] shadow-[0px_0px_10px_0px_#00000040] md:w-[352px] dark:bg-[#1b1d1e]/90"
    >
      <div class="absolute inset-0 w-full h-full backdrop-blur-[30px] pointer-events-none z-[-1]"></div>

      <div class="relative z-[1] flex flex-col h-full min-h-0 p-3">
        <div class="w-full flex justify-between items-center shrink-0">
          <Heading
            :text="t('mediaUploader.library.filterPopup.title')"
            tag="h2"
            theme="custom"
            no-wrap
            add-class="text-lg font-medium text-medium-text dark:text-timberwolf"
          />

          <button
            type="button"
            data-action="close-media-filter"
            class="cursor-pointer p-1 hover:opacity-80"
            :aria-label="t('mediaUploader.library.filterPopup.closeAlt')"
            @click="close"
          >
            <img
              v-if="closeIconUrl"
              :src="closeIconUrl"
              :alt="t('mediaUploader.library.filterPopup.closeAlt')"
              class="w-[10px] h-[10px] [filter:brightness(0)_saturate(100%)_invert(68%)_sepia(8%)_saturate(456%)_hue-rotate(182deg)_brightness(92%)_contrast(87%)]"
            />
          </button>
        </div>

        <div
          class="flex flex-col gap-6 flex-1 min-h-0 mt-[16px] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <section class="flex flex-col gap-2">
            <h3 class="text-[12px] leading-normal font-semibold uppercase text-text-quaternary">
              {{ t('mediaUploader.library.filterPopup.sortBy') }}
            </h3>

            <div class="h-10 w-full">
              <CustomDropdown
                v-model="draft.sortBy"
                :options="sortOptions"
                hide-chevron
                button-class="w-full h-10 px-3 bg-[#FFFFFF80] border-none outline-none shadow-none"
                dropdown-class="absolute left-0 right-0 w-full top-[calc(100%+0.25rem)] bg-white/90 max-h-[245px] overflow-y-auto shadow-none border-none dark:bg-[#181a1bb3] no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                option-class="p-0"
              >
                <template #trigger="{ isOpen }">
                  <div class="flex items-center justify-between w-full gap-2">
                    <div class="flex items-center gap-1 min-w-0">
                      <span class="text-[14px] leading-normal font-[600] text-medium-text truncate dark:text-timberwolf">
                        {{ t('mediaUploader.library.filterPopup.uploadDate') }}
                      </span>
                      <button
                        type="button"
                        class="shrink-0 p-0.5 cursor-pointer"
                        @click.stop="toggleSortDir"
                      >
                        <img
                          v-if="sortArrowUrl"
                          :src="sortArrowUrl"
                          alt=""
                          class="w-[11px] h-[11px] object-contain mix-blend-multiply dark:mix-blend-normal dark:invert"
                          :class="draft.sortDir === 'desc' ? 'rotate-180' : ''"
                        />
                      </button>
                    </div>
                    <img
                      v-if="chevronUrl"
                      :src="chevronUrl"
                      alt=""
                      class="h-5 w-5 shrink-0 object-contain transition-transform duration-300 [filter:brightness(0)_saturate(100%)_invert(42%)_sepia(8%)_saturate(747%)_hue-rotate(182deg)_brightness(94%)_contrast(88%)]"
                      :class="{ 'rotate-180': isOpen }"
                    />
                  </div>
                </template>
                <template #option="{ option, isSelected }">
                  <div
                    class="flex items-center h-10 px-3 text-[14px] font-medium text-text-primary cursor-pointer hover:bg-white dark:text-timberwolf dark:hover:bg-primary-dark"
                    :class="{ 'bg-white dark:bg-primary-dark font-semibold': isSelected }"
                  >
                    {{ option.label }}
                  </div>
                </template>
              </CustomDropdown>
            </div>

            <div class="flex items-center gap-2 min-h-10">
              <img
                v-if="p2vIconUrl"
                :src="p2vIconUrl"
                alt=""
                class="w-5 h-5 shrink-0 object-contain mix-blend-multiply dark:mix-blend-normal dark:invert"
              />
              <span class="flex-1 min-w-0 text-[14px] leading-normal font-medium text-text-primary truncate dark:text-timberwolf">
                {{ t('mediaUploader.library.filterPopup.payToViewAvailable') }}
                <span class="ml-0.5 text-[12px] font-normal leading-none text-text-primary align-super">{{ payToViewCount }}</span>
              </span>
              <CheckboxSwitch
                id="media-filter-p2v"
                v-model="payToViewOnlyModel"
                label=""
                theme="filter"
              />
            </div>
          </section>

          <section class="flex flex-col gap-2">
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-[12px] leading-normal font-semibold uppercase text-text-quaternary">
                {{ t('mediaUploader.library.filterPopup.mediaType') }}
              </h3>
              <DashboardPrimaryButton
                :text="t('mediaUploader.library.filterPopup.selectAll')"
                theme="mediaFilterSelectTight"
                type="button"
                :leftIcon="selectAllIconUrl"
                @click="selectAllMediaTypes"
              />
            </div>

            <CheckboxGroup
              v-for="type in mediaTypeRows"
              :key="type.id"
              :model-value="isMediaTypeSelected(type.id)"
              custom-check-mark
              :checkbox-class="filterCheckboxClass"
              wrapper-class="flex items-center w-full min-h-10 [&_svg_path]:stroke-success [&>div]:w-full [&>div]:flex-row-reverse [&>div]:justify-between"
              @update:model-value="(checked) => toggleMediaType(type.id, checked)"
            >
              <template #label>
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <img
                    v-if="type.icon"
                    :src="type.icon"
                    alt=""
                    class="w-5 h-5 shrink-0 object-contain mix-blend-multiply dark:mix-blend-normal dark:invert"
                  />
                  <span class="min-w-0 text-[14px] leading-normal font-medium text-text-primary truncate dark:text-timberwolf">
                    {{ type.label }}
                    <span class="ml-0.5 text-[12px] font-normal leading-none text-text-primary align-super">{{ type.count }}</span>
                  </span>
                </div>
              </template>
            </CheckboxGroup>
          </section>

          <section class="flex flex-col gap-2">
            <div class="flex items-center justify-between gap-2">
              <h3 class="text-[12px] leading-normal font-semibold uppercase text-text-quaternary">
                {{ t('mediaUploader.library.filterPopup.subscriptionTier') }}
              </h3>
              <DashboardPrimaryButton
                :text="t('mediaUploader.library.filterPopup.selectAll')"
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
              label-class="text-[14px] leading-normal font-medium text-text-primary truncate dark:text-timberwolf"
              wrapper-class="flex items-center w-full min-h-10 [&_svg_path]:stroke-success [&>div]:w-full [&>div]:flex-row-reverse [&>div]:justify-between"
              @update:model-value="(checked) => toggleTier(tier, checked)"
            />
          </section>
        </div>

        <div class="flex items-center gap-2 shrink-0 pt-6">
          <div class="flex-1 min-w-0">
            <DashboardPrimaryButton
              data-action="reset-media-filter"
              :text="t('mediaUploader.library.filterPopup.reset')"
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
              data-action="apply-media-filter"
              :text="t('mediaUploader.library.filterPopup.apply')"
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
import { computed, reactive, watch, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import CustomDropdown from '@/components/ui/dropdowns/CustomDropdown.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';
import { useMediaInteractions } from '@/composables/useMediaInteractions.js';
import { interactionsEngine } from '@/utils/validation/interactionsEngine.js';

const MEDIA_TYPE_IDS = ['video', 'singleImage', 'imageGallery', 'audio'];

const filterCheckboxClass =
  'h-4 w-4 box-border appearance-none [-webkit-appearance:none] bg-white border border-gray-300 rounded-[4px] checked:bg-black checked:border-black before:!hidden after:!hidden';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** Applied filter snapshot from the host page (media / merch keep their own). */
  appliedFilters: {
    type: Object,
    default: () => ({
      sortBy: 'uploadDate',
      sortDir: 'desc',
      payToViewOnly: false,
      mediaTypes: ['video', 'singleImage', 'imageGallery', 'audio'],
      tiers: [],
    }),
  },
  /**
   * Library rows for live counts. When omitted, media uploader store is used.
   * Merch passes its own library so media + merch stay independent.
   */
  items: {
    type: Array,
    default: null,
  },
  /** interactionsEngine scope — media vs merch must not share field state. */
  scopeId: {
    type: String,
    default: 'mediaUploaderFilter',
  },
});

const emit = defineEmits(['update:modelValue', 'apply']);

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const {
  fieldConfig,
  registerField,
  changeField,
  clear: clearInteractions,
} = useMediaInteractions(props.scopeId);

const payToViewConfig = fieldConfig('payToViewOnly');
const mediaTypesConfig = fieldConfig('mediaTypes');
const tiersConfig = fieldConfig('tiers');

const { url: closeIconUrl } = useAssetUrl('mediaUploader.icon.close');
const { url: chevronUrl } = useAssetUrl('mediaUploader.icon.chevronDown');
const { url: sortArrowUrl } = useAssetUrl('mediaUploader.icon.filterSort');
const { url: p2vIconUrl } = useAssetUrl('mediaUploader.icon.filterP2v');
const { url: videoIconUrl } = useAssetUrl('mediaUploader.icon.filterVideo');
const { url: singleImageIconUrl } = useAssetUrl('mediaUploader.icon.filterSingleImage');
const { url: galleryIconUrl } = useAssetUrl('mediaUploader.icon.filterGallery');
const { url: audioIconUrl } = useAssetUrl('mediaUploader.icon.filterAudio');
const { url: resetIconUrl } = useAssetUrl('mediaUploader.icon.filterReset');
const { url: applyIconUrl } = useAssetUrl('mediaUploader.icon.filterApply');
const { url: selectAllIconUrl } = useAssetUrl('mediaUploader.icon.filterSelectAll');

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

const draft = reactive(createDefaultFilters());

const payToViewOnlyModel = computed({
  get: () => draft.payToViewOnly,
  set: (val) => {
    draft.payToViewOnly = !!val;
    changeField(payToViewConfig, !!val);
  },
});

const sortOptions = computed(() => [
  {
    value: 'uploadDate',
    label: t('mediaUploader.library.filterPopup.uploadDate'),
  },
]);

const libraryItems = computed(() => {
  if (Array.isArray(props.items)) return props.items;
  return uploaderStore.libraryItems || [];
});

const payToViewCount = computed(
  () => libraryItems.value.filter((item) => hasPayToView(item)).length,
);

const mediaTypeRows = computed(() => [
  {
    id: 'video',
    label: t('mediaUploader.library.filterPopup.types.video'),
    icon: videoIconUrl.value,
    count: countByKind('video'),
  },
  {
    id: 'singleImage',
    label: t('mediaUploader.library.filterPopup.types.singleImage'),
    icon: singleImageIconUrl.value,
    count: countByKind('singleImage'),
  },
  {
    id: 'imageGallery',
    label: t('mediaUploader.library.filterPopup.types.imageGallery'),
    icon: galleryIconUrl.value,
    count: countByKind('imageGallery'),
  },
  {
    id: 'audio',
    label: t('mediaUploader.library.filterPopup.types.audio'),
    icon: audioIconUrl.value,
    count: countByKind('audio'),
  },
]);

const tierRows = computed(() => {
  const names = new Set();
  libraryItems.value.forEach((item) => {
    (item.tiers || []).forEach((tier) => {
      if (tier) names.add(tier);
    });
  });
  return [...names];
});

const allMediaSelected = computed({
  get() {
    return MEDIA_TYPE_IDS.every((id) => draft.mediaTypes.includes(id));
  },
  set(checked) {
    draft.mediaTypes = checked ? [...MEDIA_TYPE_IDS] : [];
  },
});

const allTiersSelected = computed({
  get() {
    const rows = tierRows.value;
    return rows.length > 0 && rows.every((tier) => draft.tiers.includes(tier));
  },
  set(checked) {
    draft.tiers = checked ? [...tierRows.value] : [];
  },
});

function createDefaultFilters() {
  return {
    sortBy: 'uploadDate',
    sortDir: 'desc',
    payToViewOnly: false,
    mediaTypes: [...MEDIA_TYPE_IDS],
    tiers: [],
  };
}

function cloneFilters(filters) {
  const base = createDefaultFilters();
  if (!filters) return base;
  return {
    sortBy: filters.sortBy || 'uploadDate',
    sortDir: filters.sortDir === 'asc' ? 'asc' : 'desc',
    payToViewOnly: Boolean(filters.payToViewOnly),
    mediaTypes: Array.isArray(filters.mediaTypes) ? [...filters.mediaTypes] : [...MEDIA_TYPE_IDS],
    tiers: Array.isArray(filters.tiers) ? [...filters.tiers] : [],
  };
}

function syncDraftFieldsToEngine() {
  // Only push when fields are registered (after mount / while popup is live).
  if (!interactionsEngine.getFieldState(payToViewConfig)) return;
  changeField(payToViewConfig, draft.payToViewOnly);
  changeField(mediaTypesConfig, [...draft.mediaTypes]);
  changeField(tiersConfig, [...draft.tiers]);
}

function applyDraft(next) {
  const cloned = cloneFilters(next);
  draft.sortBy = cloned.sortBy;
  draft.sortDir = cloned.sortDir;
  draft.payToViewOnly = cloned.payToViewOnly;
  draft.mediaTypes = cloned.mediaTypes;
  draft.tiers = cloned.tiers;
  syncDraftFieldsToEngine();
}

onMounted(() => {
  registerField(payToViewConfig, draft.payToViewOnly);
  registerField(mediaTypesConfig, [...draft.mediaTypes]);
  registerField(tiersConfig, [...draft.tiers]);
});

onBeforeUnmount(() => {
  clearInteractions();
});

function itemKind(item) {
  if (item.mediaKind) return item.mediaKind;
  if (item.type === 'image') return 'singleImage';
  if (item.type === 'gallery') return 'imageGallery';
  if (item.type === 'audio') return 'audio';
  return 'video';
}

function hasPayToView(item) {
  return Boolean(String(item.price || '').trim());
}

function countByKind(kind) {
  return libraryItems.value.filter((item) => itemKind(item) === kind).length;
}

function isMediaTypeSelected(id) {
  return draft.mediaTypes.includes(id);
}

function toggleMediaType(id, checked) {
  if (checked) {
    if (!draft.mediaTypes.includes(id)) draft.mediaTypes = [...draft.mediaTypes, id];
  } else {
    draft.mediaTypes = draft.mediaTypes.filter((value) => value !== id);
  }
  changeField(mediaTypesConfig, [...draft.mediaTypes]);
}

function isTierSelected(tier) {
  return draft.tiers.includes(tier);
}

function toggleTier(tier, checked) {
  if (checked) {
    if (!draft.tiers.includes(tier)) draft.tiers = [...draft.tiers, tier];
  } else {
    draft.tiers = draft.tiers.filter((value) => value !== tier);
  }
  changeField(tiersConfig, [...draft.tiers]);
}

function toggleSortDir() {
  draft.sortDir = draft.sortDir === 'asc' ? 'desc' : 'asc';
}

function selectAllMediaTypes() {
  draft.mediaTypes = [...MEDIA_TYPE_IDS];
  changeField(mediaTypesConfig, [...draft.mediaTypes]);
}

function selectAllTiers() {
  draft.tiers = [...tierRows.value];
  changeField(tiersConfig, [...draft.tiers]);
}

function resetDraft() {
  const next = createDefaultFilters();
  // Defaults: all media types on, no tier filter, P2V off, newest first.
  applyDraft(next);
  emit('apply', cloneFilters(next));
}

function applyFilters() {
  emit('apply', cloneFilters(draft));
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
    if (open) applyDraft(props.appliedFilters);
  },
);
</script>
