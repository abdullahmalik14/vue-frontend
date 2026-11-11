<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePlanAssets } from '@/composables/usePlanAssets.js';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    required: true,
  },
  variant: {
    type: String,
    default: 'plan',
    validator: (value) => ['plan', 'checkout'].includes(value),
  },
  widthClass: {
    type: String,
    default: 'w-full',
  },
  placeholder: {
    type: String,
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  labelClass: {
    type: String,
    default: 'text-[#F9FAFB]',
  },
  selectedValueClass: {
    type: String,
    default: 'text-[#F9FAFB]',
  },
  iconColor: {
    type: String,
    default: '',
  },
  unstyled: {
    type: Boolean,
    default: false,
  },
  triggerClass: {
    type: String,
    default: '',
  },
  searchable: {
    type: Boolean,
    default: false,
  },
  invalid: {
    type: Boolean,
    default: false,
  },
  /** When false, options panel grows to fit all items (no inner scrollbar). */
  menuScrollable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'open', 'close']);

const { t } = useI18n();
const { assets } = usePlanAssets();

const isOpen = ref(false);
const searchQuery = ref('');
const dropdownRef = ref(null);
const triggerWrapperRef = ref(null);
const openUpwards = ref(false);

const isCheckoutVariant = computed(() => props.variant === 'checkout');

const resolvedIconColor = computed(() => {
  if (props.iconColor) return props.iconColor;
  return isCheckoutVariant.value ? 'bg-[#F9FAFB]' : 'bg-[#98A2B3]';
});

const resolvedPlaceholder = computed(() => {
  if (props.placeholder) return props.placeholder;
  const translated = t('plan.dropdown.selectOption');
  if (!translated || translated === 'plan.dropdown.selectOption') return 'Select option';
  return translated;
});

const arrowsMaskStyle = computed(() => ({
  maskImage: `url('${assets.value.arrowsMask}')`,
  webkitMaskImage: `url('${assets.value.arrowsMask}')`,
  maskSize: 'contain',
  webkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  webkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  webkitMaskPosition: 'center',
}));

const filteredOptions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!props.searchable || !query) return props.options;
  return props.options.filter((option) =>
    String(option.label || '').toLowerCase().includes(query),
  );
});

const selectedLabel = computed(() => {
  const selected = props.options.find((opt) => opt.value === props.modelValue);
  return selected ? selected.label : resolvedPlaceholder.value;
});

const toggleDropdown = () => {
  if (isOpen.value) {
    isOpen.value = false;
    return;
  }

  const positionRef = isCheckoutVariant.value ? triggerWrapperRef.value : dropdownRef.value;
  if (positionRef) {
    const rect = positionRef.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    openUpwards.value = spaceBelow < 250 && spaceAbove > spaceBelow;
  } else {
    openUpwards.value = false;
  }

  isOpen.value = true;
};

const selectOption = (option) => {
  emit('update:modelValue', option.value);
  isOpen.value = false;
};

const handleClickOutside = (event) => {
  if (!isOpen.value) return;
  const root = dropdownRef.value;
  if (!root) return;
  const target = event.target;
  if (target instanceof Node && root.contains(target)) return;
  isOpen.value = false;
};

const handleResize = () => {
  if (isOpen.value) isOpen.value = false;
};

watch(isOpen, (open) => {
  if (!open) searchQuery.value = '';
  emit(open ? 'open' : 'close');
});

onMounted(() => {
  // Capture phase so outside-click still works inside parents that use @click.stop
  // (e.g. BasePopup panel), which would otherwise block bubble-phase document listeners.
  document.addEventListener('click', handleClickOutside, true);
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true);
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <!-- Checkout variant (replaces BaseSelect) -->
  <div
    v-if="isCheckoutVariant"
    ref="dropdownRef"
    class="flex flex-col gap-1.5"
    :class="widthClass"
  >
    <label v-if="label" class="text-sm font-medium" :class="labelClass">
      {{ label }}
    </label>

    <div ref="triggerWrapperRef" class="relative w-full">
      <div
        class="dash-select__trigger w-full h-10 flex items-center gap-2 py-2 px-3 border-b shadow-[0_1px_2px_0_#1018280D] cursor-pointer"
        :class="[invalid ? 'border-[#FF692E]' : 'border-[#D0D5DD]', triggerClass || 'bg-white/10']"
        @click="toggleDropdown"
      >
        <span class="text-base flex-grow capitalize text-balance" :class="selectedValueClass">
          {{ selectedLabel }}
        </span>
        <div
          class="h-4 w-4 transition-transform duration-200 select-arrow shrink-0"
          :class="[{ 'rotate-180': isOpen }, resolvedIconColor]"
          :style="arrowsMaskStyle"
        ></div>
      </div>

      <div
        class="dash-options-container absolute left-0 right-0 z-50 w-full min-w-[15rem] shadow-lg transition-[opacity,transform] duration-200 ease-out"
        :class="[
          isOpen
            ? 'scale-100 opacity-100 pointer-events-auto visible'
            : 'scale-95 opacity-0 pointer-events-none invisible',
          openUpwards ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top',
        ]"
      >
        <div v-if="searchable" class="overflow-hidden rounded-[0.125rem] bg-[#5C5C5C]">
          <label class="flex items-center gap-2 bg-[#FFFFFF1A] p-2">
            <svg class="h-4 w-4 shrink-0 text-white/70" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="4.25" stroke="currentColor" stroke-width="1.5" />
              <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search"
              class="w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-white/60"
              @click.stop
            />
          </label>
          <div class="checkout-search-scroll max-h-[10.5rem] overflow-y-auto">
            <p
              v-if="!filteredOptions.length"
              class="p-2 text-center text-[14px] font-normal text-[#ffffff]"
            >
              No results find.
            </p>
            <button
              v-for="option in filteredOptions"
              :key="option.value"
              type="button"
              class="flex w-full items-center bg-transparent p-2 text-left text-[14px] font-normal text-[#ffffff]"
              :class="modelValue === option.value ? 'bg-[#FFFFFF33]' : ''"
              @click.stop="selectOption(option)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
        <div v-else class="rounded-[0.125rem] border border-[rgba(186,188,203,0.5)] bg-white">
          <div
            v-for="option in options"
            :key="option.value"
            @click.stop="selectOption(option)"
            class="option flex items-center justify-center gap-[0.625rem] hover:bg-white p-[0.75rem] cursor-pointer"
          >
            <div class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]">
              <span
                class="text-[0.875rem] font-medium leading-[1.25rem] text-[#0c111d] capitalize tracking-[0.01875rem] text-balance"
              >
                {{ option.label }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Unstyled variant (orders filter — custom trigger + options panel) -->
  <div
    v-else-if="unstyled"
    ref="dropdownRef"
    class="relative h-full"
    :class="widthClass"
  >
    <div class="cursor-pointer h-full" @click="toggleDropdown">
      <slot
        name="trigger"
        :is-open="isOpen"
        :selected-label="selectedLabel"
        :label="selectedLabel"
        :selected-option="options.find((opt) => opt.value === modelValue) || null"
      />
    </div>
    <slot
      name="options-container"
      :options="options"
      :select-option="selectOption"
      :close="() => { isOpen = false }"
      :model-value="modelValue"
      :is-open="isOpen"
      :is-upwards="openUpwards"
    />
  </div>

  <!-- Plan variant (original BasePlanDropdown UI) -->
  <div
    v-else
    ref="dropdownRef"
    class="relative h-11 flex-shrink-0"
    :class="widthClass"
  >
    <div class="dash-select cursor-pointer" @click="toggleDropdown">
      <div
        class="dash-select__trigger h-11 flex items-center justify-between w-full px-3.5 border-b border-b-[#EAECF0] rounded-t-sm bg-white/50 shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b80] dark:border-b-[#353a3c]"
        :class="triggerClass"
      >
        <span class="text-base font-medium text-[#0c111d] dark:text-[#dbd8d3]">
          {{ selectedLabel }}
        </span>
        <div
          class="select-arrow h-5 w-5 transition-transform duration-300 ease-in-out shrink-0"
          :class="[{ 'rotate-180': isOpen }, resolvedIconColor]"
          :style="arrowsMaskStyle"
          aria-hidden="true"
        ></div>
      </div>

      <div
        class="dash-options-container absolute w-full transition-all duration-300 z-10 shadow-none border-none"
        :class="
          isOpen ? 'opacity-100 visible pointer-events-auto' : 'opacity-0 invisible pointer-events-none'
        "
        :style="openUpwards ? { bottom: 'calc(100% + 0.5rem)', top: 'auto' } : { top: 'calc(100% + 0.5rem)', bottom: 'auto' }"
      >
        <div
          class="dash-options rounded-[2px] bg-white/70 backdrop-blur-[25px] dark:bg-[#181a1bb3]"
          :class="menuScrollable ? 'max-h-[200px] overflow-y-auto' : 'max-h-none overflow-visible'"
        >
          <div
            v-for="option in options"
            :key="option.value"
            @click.stop="selectOption(option)"
            class="dash-option flex items-center gap-2 h-12 px-3 border-b border-[#EAECF0] cursor-pointer hover:bg-white dark:hover:bg-[#181a1b] dark:border-[#353a3c]"
            :class="{ 'bg-white dark:bg-[#181a1b] selected': modelValue === option.value }"
          >
            <span class="text-sm font-medium text-[#0c111d] dark:text-[#dbd8d3]">
              {{ option.label }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <select class="dash-real-select hidden" :name="`dash-select-${Math.random()}`" :value="modelValue">
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
  </div>
</template>

<style scoped>
.checkout-search-scroll {
  scrollbar-width: thin;
  scrollbar-color: #adaaaa80 transparent;
}

.checkout-search-scroll::-webkit-scrollbar {
  width: 6px;
}

.checkout-search-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.checkout-search-scroll::-webkit-scrollbar-thumb {
  height: 68px;
  min-height: 68px;
  max-height: 68px;
  background: #adaaaa80;
  border-radius: 50px;
}
</style>
