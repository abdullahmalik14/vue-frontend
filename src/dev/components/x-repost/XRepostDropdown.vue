<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: '',
  },
  widthClass: {
    type: String,
    default: 'w-max',
  },
  triggerClass: {
    type: String,
    default: '',
  },
  panelMinWidth: {
    type: Number,
    default: 0,
  },
  panelWidth: {
    type: Number,
    default: 0,
  },
  optionLayout: {
    type: String,
    default: 'simple',
  },
  labelClass: {
    type: String,
    default: 'text-sm font-medium leading-5 text-[#0C111D] dark:text-[#dbd8d3]',
  },
  showHelp: {
    type: Boolean,
    default: false,
  },
  helpIcon: {
    type: String,
    default: '',
  },
  chevronIcon: {
    type: String,
    default: '',
  },
  iconTintColor: {
    type: String,
    default: '',
  },
  selectedOptionClass: {
    type: [String, Function],
    default: 'bg-[#ECFDFF] dark:bg-[#0c3a44]',
  },
  truncateLabel: {
    type: Boolean,
    default: true,
  },
  showTriggerIcon: {
    type: Boolean,
    default: true,
  },
  showBorderRight: {
    type: Boolean,
    default: true,
  },
  showBorderBottom: {
    type: Boolean,
    default: true,
  },
  showBorderTop: {
    type: Boolean,
    default: false,
  },
  shrinkable: {
    type: Boolean,
    default: false,
  },
  autoWidth: {
    type: Boolean,
    default: false,
  },
  paddingClass: {
    type: String,
    default: 'px-3',
  },
  forceOpenAbove: {
    type: Boolean,
    default: false,
  },
  mobileFieldBorder: {
    type: Boolean,
    default: true,
  },
  optionTitleClass: {
    type: String,
    default: '',
  },
  optionDescriptionClass: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'open', 'close']);

const isOpen = ref(false);
const hoveredValue = ref(null);
const dropdownRef = ref(null);
const panelRef = ref(null);
const panelStyle = ref({});
const listStyle = ref({});

const VIEWPORT_PADDING = 16;
const PANEL_MIN_HEIGHT = 120;
const RICH_OPTION_HEIGHT = 88;
const SIMPLE_OPTION_HEIGHT = 52;

const optionList = computed(() => (Array.isArray(props.options) ? props.options : []));

const selectedOption = computed(
  () => optionList.value.find((opt) => opt.value === props.modelValue) || null,
);

const selectedLabel = computed(() => selectedOption.value?.label || props.placeholder);

const isPlaceholder = computed(() => !selectedOption.value && Boolean(props.placeholder));

function optionHighlightClass(option) {
  if (typeof props.selectedOptionClass === 'function') {
    return props.selectedOptionClass(option);
  }
  return props.selectedOptionClass;
}

function isOptionHighlighted(option) {
  return props.modelValue === option.value || hoveredValue.value === option.value;
}

function tintedIconStyle(src) {
  if (!props.iconTintColor || !src) return null;
  return {
    backgroundColor: props.iconTintColor,
    WebkitMaskImage: `url("${src}")`,
    maskImage: `url("${src}")`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  };
}

function estimatePanelHeight() {
  const optionHeight =
    props.optionLayout === 'rich' ? RICH_OPTION_HEIGHT : SIMPLE_OPTION_HEIGHT;
  return optionList.value.length * optionHeight;
}

function updatePanelPosition() {
  const trigger = dropdownRef.value;
  if (!trigger) return;
  const rect = trigger.getBoundingClientRect();
  const minWidth = props.panelMinWidth || rect.width;
  const width = props.panelWidth || Math.max(rect.width, minWidth);
  let left = rect.left;
  const overflowRight = left + width - (window.innerWidth - VIEWPORT_PADDING);
  if (overflowRight > 0) left = Math.max(VIEWPORT_PADDING, left - overflowRight);

  const spaceBelow = window.innerHeight - rect.bottom - VIEWPORT_PADDING;
  const spaceAbove = rect.top - VIEWPORT_PADDING;
  const estimatedHeight = estimatePanelHeight();
  const openAbove =
    props.forceOpenAbove ||
    (estimatedHeight > spaceBelow && spaceAbove > spaceBelow);
  const availableSpace = Math.max(openAbove ? spaceAbove : spaceBelow, PANEL_MIN_HEIGHT);

  if (props.forceOpenAbove) {
    const maxHeight = Math.min(Math.max(estimatedHeight, PANEL_MIN_HEIGHT), window.innerHeight * 0.7);
    panelStyle.value = {
      bottom: '0px',
      left: '0px',
      width: '100%',
      maxHeight: `${maxHeight}px`,
    };
    listStyle.value = {
      maxHeight: `${maxHeight}px`,
    };
    return;
  }

  if (openAbove) {
    panelStyle.value = {
      bottom: `${window.innerHeight - rect.top}px`,
      left: `${left}px`,
      width: `${width}px`,
      maxHeight: `${availableSpace}px`,
    };
  } else {
    panelStyle.value = {
      top: `${rect.bottom}px`,
      left: `${left}px`,
      width: `${width}px`,
      maxHeight: `${availableSpace}px`,
    };
  }

  listStyle.value = {
    maxHeight: `${availableSpace}px`,
  };
}

const toggleDropdown = async () => {
  if (isOpen.value) {
    isOpen.value = false;
    return;
  }
  isOpen.value = true;
  await nextTick();
  updatePanelPosition();
};

const selectOption = (option) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

const handleDocumentClick = (event) => {
  if (!isOpen.value) return;
  const trigger = dropdownRef.value;
  const panel = panelRef.value;
  const target = event.target;
  if (target instanceof Node && (trigger?.contains(target) || panel?.contains(target))) return;
  isOpen.value = false;
};

const handleReposition = () => {
  if (!isOpen.value) return;
  updatePanelPosition();
};

watch(isOpen, (open) => {
  if (!open) hoveredValue.value = null;
  emit(open ? 'open' : 'close');
});

onMounted(() => {
  document.addEventListener('click', handleDocumentClick, true);
  window.addEventListener('resize', handleReposition);
  window.addEventListener('scroll', handleReposition, true);
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick, true);
  window.removeEventListener('resize', handleReposition);
  window.removeEventListener('scroll', handleReposition, true);
});
</script>

<template>
  <div
    ref="dropdownRef"
    class="relative box-border"
    :class="[
      forceOpenAbove ? 'min-h-[52px]' : 'h-[52px]',
      shrinkable ? 'shrink' : 'shrink-0',
      autoWidth ? 'w-max max-w-full' : widthClass,
      showBorderRight ? 'border-r border-[#D0D5DD]' : '',
      !forceOpenAbove && showBorderTop ? 'border-t border-[#D0D5DD]' : '',
      !forceOpenAbove && showBorderBottom ? 'border-b border-[#D0D5DD]' : '',
    ]"
  >
    <div
      class="relative flex w-full cursor-pointer items-center gap-1"
      :class="[
        paddingClass,
        triggerClass,
        forceOpenAbove && mobileFieldBorder ? 'x-repost-mobile-trigger' : '',
        forceOpenAbove ? 'min-h-[52px]' : 'h-full min-h-0 overflow-hidden',
        isOpen && !forceOpenAbove
          ? 'border-b-[1.5px] border-b-black bg-white dark:bg-white'
          : '',
      ]"
      @click.stop="toggleDropdown"
    >
      <span class="flex min-w-0 flex-1 items-center gap-1">
        <span
          v-if="showTriggerIcon && selectedOption?.icon && tintedIconStyle(selectedOption.icon)"
          class="size-4 shrink-0"
          :style="tintedIconStyle(selectedOption.icon)"
        />
        <img
          v-else-if="showTriggerIcon && selectedOption?.icon"
          :src="selectedOption.icon"
          alt=""
          width="16"
          height="16"
          class="size-4 shrink-0"
        />
        <span
          class="min-w-0 whitespace-nowrap"
          :class="[
            labelClass,
            truncateLabel ? 'truncate' : '',
            isPlaceholder ? 'font-normal text-[#667085]' : '',
          ]"
        >
          {{ selectedLabel }}
        </span>
      </span>

      <img
        v-if="showHelp && helpIcon"
        :src="helpIcon"
        alt=""
        width="13"
        height="13"
        class="h-[13px] w-[13px] shrink-0"
      />

      <img
        v-if="chevronIcon"
        :src="chevronIcon"
        alt=""
        width="7"
        height="6"
        class="ml-auto h-[6px] w-[6.8px] shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen && forceOpenAbove"
        class="fixed inset-0 z-[11999] bg-black/5 backdrop-blur-[7.5px]"
        @click="isOpen = false"
      />
      <div
        v-if="isOpen"
        ref="panelRef"
        class="fixed"
        :class="forceOpenAbove ? 'z-[12000]' : 'z-[4000]'"
        :style="panelStyle"
        @click.stop
      >
        <div
          class="flex max-h-full flex-col overflow-hidden bg-[#FFFFFFE5] dark:bg-[#FFFFFFE5]"
          :class="forceOpenAbove
            ? 'rounded-none border border-[#EAECF0] shadow-[0_0_12px_0_#00000033]'
            : 'rounded-[2px] shadow-[0_3px_6px_0_rgba(0,0,0,0.12)]'"
        >
          <div
            class="overflow-y-auto overscroll-contain scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            :style="listStyle"
          >
          <button
            v-for="option in optionList"
            :key="option.value"
            type="button"
            class="flex w-full cursor-pointer flex-col items-start text-left transition-colors"
            :class="[
              optionLayout === 'rich' ? 'gap-1 px-4 py-4' : 'h-[52px] justify-center px-4',
              forceOpenAbove ? 'border-b border-[#EAECF0] last:border-b-0' : '',
              isOptionHighlighted(option) ? optionHighlightClass(option) : '',
            ]"
            @mouseenter="hoveredValue = option.value"
            @mouseleave="hoveredValue = null"
            @click="selectOption(option)"
          >
            <span class="flex w-full items-center gap-1">
              <span
                v-if="option.icon && tintedIconStyle(option.icon)"
                class="size-4 shrink-0"
                :style="tintedIconStyle(option.icon)"
              />
              <img
                v-else-if="option.icon"
                :src="option.icon"
                alt=""
                width="16"
                height="16"
                class="size-4 shrink-0"
              />
              <span
                class="whitespace-nowrap"
                :class="optionTitleClass || (optionLayout === 'rich'
                  ? 'text-sm font-semibold leading-5 text-[#0C111D] dark:text-[#dbd8d3]'
                  : 'text-sm font-medium leading-5 text-[#0C111D] dark:text-[#dbd8d3]')"
              >
                {{ option.label }}
              </span>
            </span>
            <p
              v-if="optionLayout === 'rich' && option.description"
              :class="optionDescriptionClass || 'w-full text-xs font-normal leading-[18px] text-[#667085]'"
            >
              {{ option.description }}
            </p>
          </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.x-repost-mobile-trigger {
  border-top: 1px solid #d0d5dd !important;
  border-bottom: 1px solid #d0d5dd !important;
  box-sizing: border-box;
  background-clip: padding-box;
}
</style>
