<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
import { TYPE_OPTIONS, TYPE_THEME } from './xRepostConfig.js';

const PANEL_WIDTH = 240;
const VIEWPORT_PADDING = 16;
const OPTION_HEIGHT = 52;
const PANEL_MIN_HEIGHT = 120;
const MOBILE_MAX_WIDTH = 767;

const props = defineProps({
  modelValue: {
    type: String,
    default: 'all',
  },
  assets: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'open', 'close']);

const { t } = useI18n();

const triggerRef = ref(null);
const panelRef = ref(null);
const panelStyle = ref({});
const panelMaxHeight = ref('');
const isMobileSheet = ref(typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX_WIDTH);

function syncMobileSheet() {
  isMobileSheet.value = typeof window !== 'undefined' && window.innerWidth <= MOBILE_MAX_WIDTH;
}

const dropdownOptions = computed(() => [
  { value: 'all', label: t('dashboard.xRepost.filters.allType') },
  ...TYPE_OPTIONS.map((item) => ({
    value: item.id,
    label: t(`dashboard.xRepost.types.${item.id}`),
    icon: props.assets[item.id],
  })),
]);

const typeOptions = computed(() =>
  TYPE_OPTIONS.map((item) => ({
    value: item.id,
    label: t(`dashboard.xRepost.types.${item.id}`),
    icon: props.assets[item.id],
  })),
);

const triggerLabel = computed(() => {
  if (props.modelValue === 'all') {
    return t('dashboard.xRepost.filters.allType');
  }
  return t(`dashboard.xRepost.types.${props.modelValue}`);
});

function tintedIconStyle(typeId, iconSrc) {
  const theme = TYPE_THEME[typeId];
  if (!theme?.icon || !iconSrc) return null;
  return {
    backgroundColor: theme.icon,
    WebkitMaskImage: `url("${iconSrc}")`,
    maskImage: `url("${iconSrc}")`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  };
}

function estimatePanelHeight() {
  // type rows + "View all"
  return (typeOptions.value.length + 1) * OPTION_HEIGHT;
}

function updatePanelPosition() {
  if (isMobileSheet.value) {
    const estimatedHeight = estimatePanelHeight();
    const maxHeight = Math.min(Math.max(estimatedHeight, PANEL_MIN_HEIGHT), window.innerHeight * 0.7);
    panelStyle.value = {
      bottom: '0px',
      left: '0px',
      width: '100%',
      maxHeight: `${maxHeight}px`,
    };
    panelMaxHeight.value = `${maxHeight}px`;
    return;
  }

  const trigger = triggerRef.value;
  if (!trigger) return;

  const rect = trigger.getBoundingClientRect();
  const width = PANEL_WIDTH;
  let left = rect.right - width;
  const overflowRight = left + width - (window.innerWidth - VIEWPORT_PADDING);
  if (overflowRight > 0) left = Math.max(VIEWPORT_PADDING, left - overflowRight);
  if (left < VIEWPORT_PADDING) left = VIEWPORT_PADDING;

  const gap = 4;
  // Keep panel above Add New (or viewport bottom)
  const addNewEl = document.querySelector('[data-x-repost-add-anchor]');
  const addNewTop = addNewEl?.getBoundingClientRect?.().top;
  const floorY =
    typeof addNewTop === 'number'
      ? addNewTop - gap
      : window.innerHeight - VIEWPORT_PADDING;

  const spaceBelow = Math.max(0, floorY - rect.bottom - gap);
  const spaceAbove = rect.top - VIEWPORT_PADDING;
  const measuredHeight = panelRef.value?.offsetHeight || 0;
  const estimatedHeight = measuredHeight || estimatePanelHeight();
  const openAbove = estimatedHeight > spaceBelow && spaceAbove > spaceBelow;
  const availableSpace = Math.max(openAbove ? spaceAbove : spaceBelow, PANEL_MIN_HEIGHT);

  if (openAbove) {
    panelStyle.value = {
      bottom: `${window.innerHeight - rect.top + gap}px`,
      left: `${left}px`,
      width: `${width}px`,
    };
    panelMaxHeight.value = `${availableSpace}px`;
    return;
  }

  panelStyle.value = {
    top: `${rect.bottom + gap}px`,
    left: `${left}px`,
    width: `${width}px`,
  };
  panelMaxHeight.value = `${availableSpace}px`;
}

function onDropdownOpen() {
  emit('open');
  nextTick(() => {
    updatePanelPosition();
    requestAnimationFrame(updatePanelPosition);
  });
}

function onDropdownClose() {
  emit('close');
}

function handleReposition() {
  updatePanelPosition();
}

function selectType(selectOption, typeId) {
  selectOption({ value: typeId, label: t(`dashboard.xRepost.types.${typeId}`) });
}

function selectViewAll(selectOption) {
  selectOption({ value: 'all', label: t('dashboard.xRepost.filters.allType') });
}

function handleViewportChange() {
  syncMobileSheet();
  handleReposition();
}

onMounted(() => {
  syncMobileSheet();
  window.addEventListener('resize', handleViewportChange);
  window.addEventListener('scroll', handleReposition, true);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleViewportChange);
  window.removeEventListener('scroll', handleReposition, true);
});
</script>

<template>
  <BasePlanDropdown
    :model-value="modelValue"
    :options="dropdownOptions"
    unstyled
    width-class="flex h-10 w-auto shrink-0 items-center"
    @update:model-value="(value) => emit('update:modelValue', value)"
    @open="onDropdownOpen"
    @close="onDropdownClose"
  >
    <template #trigger="{ isOpen }">
      <div
        ref="triggerRef"
        class="flex h-10 cursor-pointer items-center gap-2 bg-transparent"
      >
        <span class="whitespace-nowrap text-sm font-normal leading-5 text-[#344054] dark:text-[#bdb7af]">
          {{ triggerLabel }}
        </span>

        <img
          v-if="assets.chevron"
          :src="assets.chevron"
          alt=""
          width="7"
          height="6"
          class="h-[6px] w-[6.8px] shrink-0 transition-transform duration-200"
          :class="{ 'rotate-180': isOpen }"
        />
      </div>
    </template>

    <template #options-container="{ selectOption, isOpen, close }">
      <Teleport to="body">
        <div
          v-if="isOpen && isMobileSheet"
          class="fixed inset-0 z-[11999] bg-black/5 backdrop-blur-[7.5px]"
          @click="close"
        />
        <div
          v-if="isOpen"
          ref="panelRef"
          class="fixed"
          :class="isMobileSheet ? 'z-[12000]' : 'z-[4000]'"
          :style="panelStyle"
          @click.stop
        >
          <div
            class="overflow-y-auto overscroll-contain bg-[#FFFFFF]"
            :class="isMobileSheet
              ? 'rounded-none border border-[#EAECF0] shadow-[0_0_12px_0_#00000033]'
              : 'rounded-[2px] shadow-[0_3px_6px_0_#00000033]'"
            :style="{ maxHeight: panelMaxHeight || undefined }"
          >
            <button
              v-for="option in typeOptions"
              :key="option.value"
              type="button"
              class="flex h-[52px] w-full cursor-pointer items-center gap-1 px-4 text-left transition-colors hover:bg-[#F9FAFB]"
              :class="isMobileSheet ? 'border-b border-[#EAECF0]' : 'border-b border-[#D0D5DD]'"
              @click.stop="selectType(selectOption, option.value)"
            >
              <span
                v-if="option.icon && tintedIconStyle(option.value, option.icon)"
                class="size-4 shrink-0"
                :style="tintedIconStyle(option.value, option.icon)"
              />
              <img
                v-else-if="option.icon"
                :src="option.icon"
                alt=""
                width="16"
                height="16"
                class="size-4 shrink-0"
              />
              <span class="whitespace-nowrap text-[12px] font-semibold leading-4 text-[#0C111D]">
                {{ option.label }}
              </span>
            </button>

            <button
              type="button"
              class="flex h-[52px] w-full cursor-pointer items-center bg-[#F2F4F7] px-4 text-left transition-colors hover:bg-[#EAECF0]"
              @click.stop="selectViewAll(selectOption)"
            >
              <span class="whitespace-nowrap text-[12px] font-semibold leading-4 text-[#344054]">
                {{ t('dashboard.xRepost.filters.viewAll') }}
              </span>
            </button>
          </div>
        </div>
      </Teleport>
    </template>
  </BasePlanDropdown>
</template>
