<template>
  <div
    data-component="catalog-search-select"
    ref="rootRef"
    :class="['flex flex-col items-start self-stretch', parentClass]"
  >
    <div class="flex flex-col gap-2 w-full">
      <div v-if="title || subtitle" class="flex flex-col gap-[0.375rem]">
        <div
          v-if="title"
          class="text-sm font-bold leading-5 text-text-quaternary"
        >
          {{ title }}
        </div>
        <span
          v-if="subtitle"
          :class="['text-base text-dark-text', subTitleClass]"
        >
          {{ subtitle }}
        </span>
      </div>

      <!--
        In-flow panel (not absolute): opens flush under the input inside the
        merch popup, pushes Collection down, selected chips stay below the panel.
      -->
      <div
        ref="anchorRef"
        data-catalog-search-anchor
        class="relative w-full"
        :class="isOpen ? 'z-20' : 'z-0'"
      >
        <!-- Search field — fixed 48px row (input + language trailing) -->
        <div
          :class="[
            'relative z-[2] flex items-stretch self-stretch w-full h-[48px]',
            showLanguageIcon
              ? 'border-b border-[#D0D5DD] bg-white/50 [box-shadow:0px_1px_2px_0px_rgba(16,24,40,0.05)]'
              : '',
            searchWrapperClass,
          ]"
          @focusin="openDropdown"
        >
          <DashboardTextInput
            v-model="searchQuery"
            type="text"
            :placeholder="resolvedPlaceholder"
            :left-icon="resolvedIconUrl"
            :input-class="inputClass"
            :wrapper-class="[
              '!h-[48px] !min-h-[48px]',
              showLanguageIcon ? '!border-0 !shadow-none !bg-transparent !pr-0' : '',
            ].filter(Boolean).join(' ')"
            add-class="!gap-0 flex-1 min-w-0 w-full h-[48px]"
            class="flex-1 min-w-0 w-full h-[48px]"
            @update:model-value="onSearch"
          />

          <div
            v-if="showLanguageIcon"
            class="relative flex items-stretch shrink-0 self-stretch h-[48px] border-l border-handle-light"
            @click.stop
            @pointerdown.stop
          >
            <BasePlanDropdown
              v-model="selectedLanguageCode"
              :options="tagLanguageOptions"
              :unstyled="true"
              widthClass="w-max h-[48px]"
              @open="closeDropdown"
            >
              <template #trigger="{ isOpen: langOpen, selectedLabel }">
                <div
                  class="flex items-center gap-1 h-[48px] px-3 text-sm text-text-quaternary whitespace-nowrap cursor-pointer"
                >
                  <img
                    v-if="assets.globeIcon"
                    :src="assets.globeIcon"
                    alt=""
                    class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(42%)_sepia(9%)_saturate(1033%)_hue-rotate(182deg)_brightness(94%)_contrast(88%)]"
                  >
                  <span>{{ selectedLabel }}</span>
                  <div
                    class="h-4 w-4 shrink-0 transition-transform duration-200 bg-[#98A2B3]"
                    :class="{ 'rotate-180': langOpen }"
                    :style="languageArrowMaskStyle"
                    aria-hidden="true"
                  />
                </div>
              </template>

              <template #options-container="{ options, selectOption, modelValue: langValue, isOpen: langOpen, isUpwards }">
                <div
                  class="absolute left-0 right-0 w-full z-[60] transition-all duration-300"
                  :class="langOpen
                    ? 'opacity-100 visible pointer-events-auto'
                    : 'opacity-0 invisible pointer-events-none'"
                  :style="isUpwards
                    ? { bottom: 'calc(100% + 0.25rem)', top: 'auto' }
                    : { top: 'calc(100% + 0.25rem)', bottom: 'auto' }"
                >
                  <div class="w-full rounded-[2px] bg-white shadow-[0px_0px_8px_0px_rgba(0,0,0,0.25)] max-h-[200px] overflow-y-auto">
                    <div
                      v-for="option in options"
                      :key="option.value"
                      class="flex items-center gap-2 h-12 px-3 border-b border-light-divider cursor-pointer hover:bg-border-tab last:border-b-0"
                      :class="{ 'bg-border-tab': langValue === option.value }"
                      @click.stop="onSelectLanguage(option, selectOption)"
                    >
                      <span class="text-sm font-medium text-text-primary truncate">
                        {{ option.label }}
                      </span>
                    </div>
                  </div>
                </div>
              </template>
            </BasePlanDropdown>
          </div>
        </div>

        <!-- In-flow dropdown — flush under input, opaque, takes space inside merch popup -->
        <div
          v-show="isOpen && !showCreateTagPopup"
          ref="dropdownRef"
          data-catalog-search-dropdown
          class="relative z-[1] m-0 w-full max-h-[min(400px,55vh)] overflow-hidden border-t border-dark-text bg-[#F2F4F7] shadow-[0px_0px_8px_0px_rgba(0,0,0,0.1)]"
        >
          <!-- Tags: create empty state -->
          <template v-if="type === 'tags' && hasNoTagResults">
            <div class="bg-secondary-bg p-4">
              <p class="text-[16px] leading-6 text-text-quaternary">
                {{ t('mediaUploader.createTag.notFound') }}
              </p>
              <p class="mt-1 text-[12px] leading-[1.125rem] text-text-quaternary">
                {{ t('mediaUploader.createTag.notFoundHint') }}
              </p>
            </div>
            <button
              type="button"
              class="flex w-full items-center gap-2 bg-white p-4"
              @click.stop="openCreateTagPopup"
            >
              <span class="text-sm font-medium text-text-primary">
                {{ t('mediaUploader.createTag.create') }}
              </span>
              <span class="bg-success px-2 py-1 text-sm font-medium text-black">
                {{ pendingCreateName }}
              </span>
              <svg class="h-4 w-4 shrink-0 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M7 7h10v10" />
              </svg>
            </button>
          </template>

          <!-- Tags: tabs + A–Z chip grid -->
          <template v-else-if="type === 'tags'">
            <CatalogIconTabs
              v-model="activeTab"
              :tabs="tagTabs"
            />

            <div
              class="flex flex-col flex-1 w-full overflow-y-auto max-h-[320px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <div class="relative flex flex-col justify-start pt-4 pb-4 px-4 gap-6">
                <div
                  v-for="section in alphabeticalSections"
                  :key="section.letter"
                  class="flex justify-start gap-4"
                >
                  <div class="text-dark-text w-18 leading-6 text-base uppercase">
                    {{ section.letter }}
                  </div>
                  <div class="flex flex-wrap gap-2 flex-1 basis-0">
                    <button
                      v-for="tag in section.tags"
                      :key="tag[optionValueKey]"
                      type="button"
                      class="inline-flex cursor-pointer"
                      @click.stop="toggleItem(tag)"
                    >
                      <span
                        :class="[
                          'flex items-center gap-1 whitespace-normal break-words py-1 rounded-none px-2 min-w-[3.5rem] leading-5 text-sm font-medium',
                          isSelected(tag[optionValueKey])
                            ? 'bg-text-primary text-white'
                            : 'bg-white text-medium-text',
                        ]"
                      >
                        {{ tag[optionLabelKey] }}
                        <span
                          v-if="isSelected(tag[optionValueKey])"
                          class="text-white text-xs ml-1"
                          aria-hidden="true"
                        >×</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Collection: create row or selectable list -->
          <template v-else-if="type === 'collection'">
            <template v-if="showCreateRow">
              <div class="bg-secondary-bg p-4">
                <p class="text-[16px] leading-6 text-text-quaternary">
                  {{ resolvedNotFound }}
                </p>
              </div>
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded-none bg-white p-4"
                @click.stop="openCreateTagPopup"
              >
                <span class="text-sm font-medium text-text-primary">
                  {{ resolvedCreateLabel }}
                </span>
                <span class="bg-[#0C111D] text-white px-2 py-1 text-sm font-medium">
                  {{ pendingCreateName }}
                </span>
                <svg class="h-4 w-4 shrink-0 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M7 7h10v10" />
                </svg>
              </button>
            </template>
            <div
              v-else
              class="flex flex-col gap-2 w-full max-h-[280px] overflow-y-auto rounded-none bg-[#F2F4F7] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              <button
                v-for="item in filteredResults"
                :key="item[optionValueKey]"
                type="button"
                class="flex w-full items-center justify-between gap-2 rounded-none border-0 p-4 text-left text-sm font-medium text-text-primary outline-none ring-0 shadow-none transition-colors hover:bg-[#3440541A] focus:outline-none focus-visible:outline-none focus:ring-0 active:outline-none"
                :class="isSelected(item[optionValueKey]) ? 'bg-[#3440541A]' : ''"
                @mousedown.prevent
                @click.stop="toggleItem(item)"
              >
                <span class="min-w-0 truncate">{{ item[optionLabelKey] }}</span>
                <svg
                  v-if="isSelected(item[optionValueKey])"
                  class="h-4 w-4 shrink-0 text-text-primary"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M13.5 4.5L6.5 11.5L2.5 7.5"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>
          </template>

          <!-- Performer list -->
          <template v-else-if="type === 'performer' && filteredResults.length > 0">
            <div class="max-h-[400px] overflow-y-auto bg-transparent">
              <button
                v-for="performer in filteredResults"
                :key="performer[optionValueKey]"
                type="button"
                class="w-full flex items-center gap-3 px-3 py-3 border-b border-handle-light bg-transparent"
              >
                <img
                  v-if="performer.avatar"
                  :src="performer.avatar"
                  :alt="performer[optionLabelKey]"
                  class="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div class="flex-1 min-w-0 text-left">
                  <div class="text-sm font-medium text-darker-text truncate">
                    {{ performer[optionLabelKey] }}
                  </div>
                  <div
                    v-if="performer.username"
                    class="text-xs text-text-quaternary truncate"
                  >
                    @{{ performer.username }}
                  </div>
                </div>
                <div
                  class="flex items-center gap-1 text-xs leading-[1.125rem] font-medium cursor-pointer shrink-0"
                  :class="
                    isSelected(performer[optionValueKey])
                      ? 'text-text-quaternary'
                      : 'text-blue-accent'
                  "
                  @click.stop="toggleItem(performer)"
                >
                  <img
                    :src="
                      isSelected(performer[optionValueKey])
                        ? assets.minusIcon
                        : assets.plusIcon
                    "
                    class="w-4 h-4"
                    :class="
                      isSelected(performer[optionValueKey])
                        ? '[filter:brightness(0)_saturate(100%)_invert(42%)_sepia(9%)_saturate(1033%)_hue-rotate(182deg)_brightness(94%)_contrast(88%)]'
                        : ''
                    "
                    alt=""
                  />
                  {{
                    isSelected(performer[optionValueKey])
                      ? t('mediaUploader.search.remove')
                      : t('mediaUploader.search.add')
                  }}
                </div>
              </button>
            </div>
          </template>
        </div>
      </div>

      <!-- Selected chips — below input / below open dropdown panel -->
      <div
        v-if="type === 'tags' && selectedItems.length > 0"
        class="relative z-0 flex flex-wrap gap-2"
      >
        <div
          v-for="item in selectedItems"
          :key="item[optionValueKey]"
          class="relative group"
        >
          <div
            class="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-[4px]"
            :class="tagChipClass(item)"
          >
            <span>{{ item[optionLabelKey] }}</span>
            <button
              type="button"
              class="ml-0.5 opacity-70 hover:opacity-100"
              :class="tagRemoveClass(item)"
              @click.stop="removeItem(item[optionValueKey])"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div
            v-if="item.status === 'pending'"
            class="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden -translate-x-1/2 group-hover:block"
          >
            <div class="relative w-max max-w-[16rem] rounded-lg bg-mediaUi-inkOverlay px-3 py-2 text-xs font-medium leading-normal text-white shadow-[0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A] backdrop-blur-[25px]">
              <div
                class="absolute left-1/2 -top-1.5 h-0 w-0 -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-mediaUi-inkOverlay"
              />
              {{ t('mediaUploader.createTag.pendingTooltip') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <CreateNewTagPopup
      v-if="type === 'tags' || type === 'collection'"
      v-model="showCreateTagPopup"
      :tag-name="pendingCreateName"
      :entity="type === 'collection' ? 'collection' : 'tag'"
      @created="onTagCreated"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
import CreateNewTagPopup from '@/components/ui/popups/media/CreateNewTagPopup.vue';
import CatalogIconTabs from '@/dev/components/ui/tabs/CatalogIconTabs.vue';
import { useMediaUploaderAssets } from '@/composables/useMediaUploaderAssets.js';
import { usePlanAssets } from '@/composables/usePlanAssets.js';
import { useMediaInteractions } from '@/composables/useMediaInteractions.js';

const props = defineProps({
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  iconUrl: { type: String, default: '' },
  iconAlt: { type: String, default: '' },
  type: {
    type: String,
    default: 'tags',
    validator: (v) => ['tags', 'collection', 'performer'].includes(v),
  },
  results: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] },
  maxItems: { type: Number, default: 10 },
  showLanguageIcon: { type: Boolean, default: false },
  historyTags: { type: Array, default: () => [] },
  optionLabelKey: { type: String, default: 'name' },
  optionValueKey: { type: String, default: 'id' },
  notFoundMessage: { type: String, default: '' },
  createLabel: { type: String, default: '' },
  parentClass: { type: String, default: '' },
  subTitleClass: { type: String, default: '' },
  searchWrapperClass: { type: String, default: '' },
  inputClass: { type: String, default: '' },
});

const emit = defineEmits([
  'update:modelValue',
  'search',
  'manage-tags',
  'language-change',
  'create',
]);

const { t } = useI18n();
const { assets } = useMediaUploaderAssets();
const { assets: planAssets } = usePlanAssets();

const SCOPE_ID = `catalogSearch_${props.type}`;
const {
  fieldConfig,
  registerField,
  changeField,
  clear: clearInteractions,
} = useMediaInteractions(SCOPE_ID);
const selectedConfig = fieldConfig('selectedItems');

const rootRef = ref(null);
const anchorRef = ref(null);
const dropdownRef = ref(null);
const searchQuery = ref('');
const isOpen = ref(false);
const showCreateTagPopup = ref(false);
const selectedItems = ref([...(props.modelValue || [])]);
const createdItems = ref([]);
const activeTab = ref('az');
const selectedLanguageCode = ref('zh-tw');

const resolvedPlaceholder = computed(
  () => props.placeholder || t('mediaUploader.search.defaultPlaceholder'),
);
const resolvedIconUrl = computed(() => props.iconUrl || assets.value.searchIcon);
const resolvedNotFound = computed(
  () =>
    props.notFoundMessage ||
    (props.type === 'collection'
      ? t('shops.merch.listing.collectionNotFound')
      : t('mediaUploader.createTag.notFound')),
);
const resolvedCreateLabel = computed(
  () =>
    props.createLabel ||
    (props.type === 'collection'
      ? t('shops.merch.listing.createCollection')
      : t('mediaUploader.createTag.create')),
);

const tagLanguageOptions = computed(() => [
  { value: 'zh-tw', label: t('mediaUploader.search.languageTraditional') },
  { value: 'zh', label: t('mediaUploader.search.languageSimplified') },
  { value: 'en', label: t('mediaUploader.search.languageEnglish') },
]);

const languageArrowMaskStyle = computed(() => {
  const mask = planAssets.value.arrowsMask;
  if (!mask) return {};
  return {
    maskImage: `url('${mask}')`,
    webkitMaskImage: `url('${mask}')`,
    maskSize: 'contain',
    webkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    webkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    webkitMaskPosition: 'center',
  };
});

const tagTabs = computed(() => [
  { id: 'az', icon: assets.value.tagTabAz, label: t('mediaUploader.tagTabs.az') },
  { id: 'sort', icon: assets.value.tagTabSort, label: '' },
  { id: 'hobby', icon: assets.value.tagTabHobby, label: t('mediaUploader.tagTabs.hobby') },
  { id: 'clothing', icon: assets.value.tagTabClothing, label: t('mediaUploader.tagTabs.clothing') },
  { id: 'scene', icon: assets.value.tagTabScene, label: t('mediaUploader.tagTabs.scene') },
  { id: 'identity', icon: assets.value.tagTabIdentity, label: t('mediaUploader.tagTabs.identity') },
  { id: 'body', icon: assets.value.tagTabBody, label: t('mediaUploader.tagTabs.body') },
]);

const catalogOptions = computed(() => {
  const merged = [...createdItems.value, ...(props.results || [])];
  const seen = new Set();
  return merged.filter((item) => {
    const id = item?.[props.optionValueKey];
    if (id == null || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
});

const filteredResults = computed(() => {
  const source = props.type === 'collection' ? catalogOptions.value : (props.results || []);
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return source;
  return source.filter((item) => {
    const nameMatch = String(item?.[props.optionLabelKey] || '')
      .toLowerCase()
      .includes(q);
    const usernameMatch = String(item?.username || '')
      .toLowerCase()
      .includes(q);
    return nameMatch || usernameMatch;
  });
});

const pendingCreateName = computed(() => searchQuery.value.trim());

const hasNoTagResults = computed(
  () =>
    props.type === 'tags' &&
    pendingCreateName.value.length > 0 &&
    filteredResults.value.length === 0,
);

const showCreateRow = computed(
  () =>
    props.type === 'collection' &&
    pendingCreateName.value.length > 0 &&
    filteredResults.value.length === 0,
);

const alphabeticalSections = computed(() => {
  const sections = {};
  filteredResults.value.forEach((tag) => {
    const name = String(tag?.[props.optionLabelKey] || '');
    const firstLetter = name.charAt(0).toUpperCase() || '#';
    if (!sections[firstLetter]) sections[firstLetter] = [];
    sections[firstLetter].push(tag);
  });
  return Object.keys(sections)
    .sort()
    .map((letter) => ({ letter, tags: sections[letter] }));
});

function syncSelectedField() {
  changeField(
    selectedConfig,
    selectedItems.value.map((item) => item[props.optionValueKey]),
  );
}

function syncParent() {
  emit('update:modelValue', [...selectedItems.value]);
  syncSelectedField();
}

function openDropdown() {
  isOpen.value = true;
}

function closeDropdown() {
  isOpen.value = false;
}

function onSearch() {
  isOpen.value = true;
  emit('search', searchQuery.value);
}

function onSelectLanguage(option, selectOption) {
  selectOption(option);
  emit('language-change', option);
}

function isSelected(id) {
  return selectedItems.value.some((item) => item[props.optionValueKey] === id);
}

function toggleItem(item) {
  const id = item[props.optionValueKey];
  if (isSelected(id)) {
    selectedItems.value = selectedItems.value.filter(
      (row) => row[props.optionValueKey] !== id,
    );
  } else {
    if (selectedItems.value.length >= props.maxItems) {
      alert(t('mediaUploader.search.maxItemsAlert', { max: props.maxItems }));
      return;
    }
    selectedItems.value = [...selectedItems.value, item];
  }
  syncParent();

  if (props.type === 'performer') {
    searchQuery.value = '';
    closeDropdown();
  }
}

function removeItem(id) {
  selectedItems.value = selectedItems.value.filter(
    (item) => item[props.optionValueKey] !== id,
  );
  syncParent();
}

function openCreateTagPopup() {
  if (!pendingCreateName.value) return;
  closeDropdown();
  showCreateTagPopup.value = true;
}

function onTagCreated(payload) {
  if (!payload?.name) return;
  if (selectedItems.value.length >= props.maxItems) {
    alert(t('mediaUploader.search.maxItemsAlert', { max: props.maxItems }));
    return;
  }
  const existing = selectedItems.value.find(
    (item) =>
      String(item[props.optionLabelKey] || '').toLowerCase() ===
      payload.name.toLowerCase(),
  );
  if (existing) {
    searchQuery.value = '';
    closeDropdown();
    return;
  }
  const entry = {
    [props.optionValueKey]: `custom-${Date.now()}`,
    [props.optionLabelKey]: payload.name,
    status: payload.status,
  };
  if (props.type === 'collection') {
    createdItems.value = [...createdItems.value, entry];
  }
  selectedItems.value.push(entry);
  syncParent();
  if (props.type === 'collection') {
    emit('create', entry);
  }
  searchQuery.value = '';
  closeDropdown();
}

function tagChipClass(item) {
  if (item?.status === 'personal') return 'bg-success text-black';
  if (item?.status === 'pending') {
    return 'bg-border-light text-text-primary border border-dashed border-black';
  }
  return 'bg-text-primary text-white';
}

function tagRemoveClass(item) {
  if (item?.status === 'personal' || item?.status === 'pending') return 'text-black';
  return 'text-white';
}

watch(
  () => props.modelValue,
  (val) => {
    selectedItems.value = [...(val || [])];
  },
  { deep: true },
);

function isEventInsideAnchor(event) {
  // Only THIS instance's search row + panel (not sibling CatalogSearchSelect).
  const path =
    typeof event.composedPath === 'function' ? event.composedPath() : [];
  if (anchorRef.value && path.includes(anchorRef.value)) return true;
  if (dropdownRef.value && path.includes(dropdownRef.value)) return true;

  const target = event.target;
  if (!(target instanceof Node)) return false;
  if (anchorRef.value?.contains(target)) return true;
  if (dropdownRef.value?.contains(target)) return true;
  return false;
}

function handlePointerOutside(event) {
  if (!isOpen.value || showCreateTagPopup.value) return;
  // Bubble phase: inside clicks are skipped via contains / data attrs.
  if (isEventInsideAnchor(event)) return;
  closeDropdown();
}

function handleEscape(event) {
  if (event.key !== 'Escape') return;
  if (showCreateTagPopup.value) return;
  if (!isOpen.value) return;
  closeDropdown();
}

onMounted(() => {
  registerField(
    selectedConfig,
    selectedItems.value.map((item) => item[props.optionValueKey]),
  );
  // Bubble (not capture): avoids false closes when clicking tabs/chips inside
  // the in-flow panel under BasePopup's @click.stop.
  document.addEventListener('pointerdown', handlePointerOutside);
  window.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  clearInteractions();
});

onUnmounted(() => {
  document.removeEventListener('pointerdown', handlePointerOutside);
  window.removeEventListener('keydown', handleEscape);
});
</script>

