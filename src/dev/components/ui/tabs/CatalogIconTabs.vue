<template>
  <ul
    data-component="catalog-icon-tabs"
    role="tablist"
    :class="[
      'flex flex-row items-stretch overflow-x-auto whitespace-nowrap list-none border-b border-mediaUi-borderSoft [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
      listClass,
    ]"
  >
    <li
      v-for="tab in tabs"
      :key="tab.id"
      role="tab"
      :aria-selected="isActive(tab.id)"
      :class="[
        'flex flex-1 basis-0 outline-none ring-0 border-0 shadow-none',
        isActive(tab.id) ? 'bg-mediaUi-tabActiveSoft' : '',
        itemClass,
      ]"
    >
      <button
        type="button"
        tabindex="-1"
        :class="[
          'catalog-icon-tab-btn flex flex-col items-center justify-center w-full gap-0.5 whitespace-nowrap pt-[.563rem] pb-[.563rem] px-4 min-w-[5rem] outline-none ring-0 border-0 shadow-none focus:outline-none focus-visible:outline-none focus:ring-0 active:outline-none',
          isActive(tab.id) ? 'opacity-100' : 'opacity-70',
          buttonClass,
        ]"
        @mousedown.prevent
        @click="selectTab(tab.id)"
      >
        <img
          v-if="tab.icon"
          :src="tab.icon"
          :alt="tab.label || ''"
          class="w-5 h-5 pointer-events-none"
        />
        <span
          v-if="tab.label"
          class="text-text-quaternary text-xs leading-[1.125rem] font-medium pointer-events-none"
        >
          {{ tab.label }}
        </span>
      </button>
    </li>
  </ul>
</template>

<script setup>
/**
 * Icon + optional label tabs used inside catalog search dropdowns (A–Z / category row).
 * Tabs shape: `{ id, icon, label? }`
 */
const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
  tabs: {
    type: Array,
    required: true,
  },
  listClass: { type: String, default: '' },
  itemClass: { type: String, default: '' },
  buttonClass: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

function isActive(tabId) {
  return String(tabId) === String(props.modelValue);
}

function selectTab(tabId) {
  emit('update:modelValue', tabId);
}
</script>

<style scoped>
.catalog-icon-tab-btn,
.catalog-icon-tab-btn:focus,
.catalog-icon-tab-btn:focus-visible,
.catalog-icon-tab-btn:active {
  outline: none !important;
  box-shadow: none !important;
  -webkit-tap-highlight-color: transparent;
}
</style>
