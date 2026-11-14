<template>
  <div
    data-component="media-upload-type-tabs"
    class="relative"
    :class="tabsOnly ? 'w-auto' : 'w-full'"
  >
    <!-- Desktop tabs (always on when tabsOnly) -->
    <div
      class="shrink-0 overflow-hidden rounded-[5px] border border-handle-light dark:border-panel-dark-border"
      :class="[
        tabsOnly ? 'inline-flex' : 'hidden md:flex w-full',
        listClass,
      ]"
      role="tablist"
      :aria-label="resolvedAriaLabel"
    >
      <button
        v-for="(tab, index) in tabs"
        :key="tab.id"
        type="button"
        role="tab"
        data-action="select-media-type-tab"
        :data-tab-id="tab.id"
        :aria-selected="activeTab === tab.id"
        :data-state="activeTab === tab.id ? 'selected' : 'idle'"
        class="flex items-center justify-center gap-2 h-10 min-h-10 shrink-0 px-3 text-[14px] transition-colors duration-150 cursor-pointer outline-none focus:outline-none rounded-none"
        :class="[
          tabsOnly ? '' : 'flex-1',
          activeTab === tab.id ? resolvedActiveClass : resolvedInactiveClass,
          index < tabs.length - 1 ? 'border-r border-handle-light dark:border-panel-dark-border' : '',
          tabClass,
        ]"
        @click="selectTab(tab.id)"
      >
        <img
          v-if="tab.icon"
          :src="tab.icon"
          :alt="tab.label"
          class="w-5 h-5 shrink-0"
          :class="activeTab === tab.id
            ? 'brightness-0 invert'
            : '[filter:brightness(0)_saturate(100%)_invert(65%)_sepia(5%)_saturate(982%)_hue-rotate(179deg)_brightness(101%)_contrast(84%)]'"
        />
        <span class="whitespace-nowrap">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Mobile dropdown: overlays content instead of pushing it down -->
    <div v-if="!tabsOnly" class="md:hidden">
      <BasePlanDropdown
        unstyled
        :model-value="activeTab"
        :options="dropdownOptions"
        width-class="w-full"
        @update:model-value="selectTab"
      >
        <template #trigger="{ isOpen, selectedOption }">
          <div
            class="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-text-primary px-4 text-white dark:bg-primary-dark"
            :aria-label="resolvedAriaLabel"
          >
            <img
              v-if="selectedOption?.icon || selectedTab?.icon"
              :src="selectedOption?.icon || selectedTab?.icon"
              :alt="selectedOption?.label || selectedTab?.label || ''"
              class="h-5 w-5 shrink-0 brightness-0 invert"
            />
            <span class="text-sm sm:text-[16px]">{{ selectedOption?.label || selectedTab?.label }}</span>
            <img
              v-if="chevronDownUrl"
              :src="chevronDownUrl"
              alt=""
              class="h-5 w-5 brightness-0 invert transition-transform duration-200"
              :class="{ 'rotate-180': isOpen }"
            />
          </div>
        </template>

        <template #options-container="{ options, selectOption, isOpen, isUpwards }">
          <div
            class="absolute left-0 right-0 z-50 transition-[opacity,transform] duration-200 ease-out"
            :class="[
              isOpen
                ? 'pointer-events-auto scale-100 opacity-100'
                : 'pointer-events-none scale-95 opacity-0',
              isUpwards ? 'bottom-[calc(100%+6px)] top-auto origin-bottom' : 'top-[calc(100%+6px)] origin-top',
            ]"
          >
            <div class="overflow-hidden rounded-lg bg-mediaUi-white80 py-1 dark:bg-cosmo-shell">
              <button
                v-for="option in options"
                :key="option.value"
                type="button"
                class="flex w-full cursor-pointer items-center justify-center px-4 py-2.5 text-sm text-medium-text transition-colors hover:bg-text-primary hover:text-white sm:text-[16px] dark:text-cosmo-darkInk dark:hover:bg-primary-dark dark:hover:text-white"
                @click.stop="selectOption(option)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
        </template>
      </BasePlanDropdown>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { createStepStateEngine } from '@/utils/stateEngine.js';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';

const props = defineProps({
  /** Array of { id, label, icon? } */
  tabs: {
    type: Array,
    required: true,
  },
  /**
   * Controlled active tab id. When set, component does not own tab state
   * (parent handles via update:modelValue). UploadMediaPopup can keep using `engine`.
   */
  modelValue: {
    type: [String, Number],
    default: undefined,
  },
  /** Optional external stateEngine instance (must expose state.activeTab) */
  engine: {
    type: Object,
    default: null,
  },
  /**
   * Optional gate before switching tabs.
   * Return false / Promise<false> to block; true to allow.
   * Signature: (nextTabId, currentTabId) => boolean | Promise<boolean>
   */
  beforeTabChange: {
    type: Function,
    default: null,
  },
  /** Optional aria-label override for tablist / mobile trigger */
  tabsAriaLabel: {
    type: String,
    default: '',
  },
  /** Always show segmented tabs (no mobile dropdown) — Plan Published/Draft, etc. */
  tabsOnly: {
    type: Boolean,
    default: false,
  },
  /** Extra classes on the tablist shell */
  listClass: {
    type: String,
    default: '',
  },
  /** Extra classes on every tab button */
  tabClass: {
    type: String,
    default: '',
  },
  /** Override selected tab classes */
  activeClass: {
    type: String,
    default: '',
  },
  /** Override idle tab classes */
  inactiveClass: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['tab-change', 'update:modelValue']);
const { t } = useI18n();
const { url: chevronDownUrl } = useAssetUrl('mediaUploader.icon.chevronDown');

const isControlled = computed(() => props.modelValue !== undefined);

const resolvedActiveClass = computed(
  () =>
    props.activeClass ||
    'bg-text-primary text-white poppins-semibold dark:bg-primary-dark',
);

const resolvedInactiveClass = computed(
  () =>
    props.inactiveClass ||
    'bg-gray-50 text-secondary-text poppins-medium dark:bg-cosmo-shell dark:text-cosmo-darkInk',
);

const localEngine =
  props.engine ??
  createStepStateEngine({
    flowId: 'media-upload-type-tabs',
    urlSync: 'none',
    defaults: {
      activeTab: props.tabs[0]?.id ?? 'video',
    },
  });

onMounted(() => {
  if (!props.engine && !isControlled.value) {
    localEngine.initialize({ fromUrl: false });
  }
});

const activeTab = computed(() => {
  if (isControlled.value) return props.modelValue;
  return localEngine.state.activeTab;
});

const selectedTab = computed(
  () => props.tabs.find((tab) => tab.id === activeTab.value) || props.tabs[0],
);

const dropdownOptions = computed(() =>
  props.tabs.map((tab) => ({
    value: tab.id,
    label: tab.label,
    icon: tab.icon,
  })),
);

const resolvedAriaLabel = computed(
  () => props.tabsAriaLabel || t('mediaUploader.uploadPopup.tabsAria'),
);

async function selectTab(tabId) {
  if (activeTab.value === tabId) return;

  if (typeof props.beforeTabChange === 'function') {
    const allowed = await props.beforeTabChange(tabId, activeTab.value);
    if (!allowed) return;
  }

  if (isControlled.value) {
    emit('update:modelValue', tabId);
    emit('tab-change', tabId);
    return;
  }

  localEngine.setState('activeTab', tabId, { reason: 'tab-click' });
  emit('tab-change', tabId);
}

defineExpose({
  engine: localEngine,
  activeTab,
});
</script>
