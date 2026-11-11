<template>
  <div class="relative">
    <!-- Desktop Tabs -->
    <div
      :class="[
        tabsOnly ? 'flex' : 'hidden md:flex',
        'w-full lg:w-auto bg-[linear-gradient(90deg,rgba(251,91,162,0.15)_0%,rgba(251,91,162,0.08)_100%)] justify-start items-stretch overflow-hidden rounded-full',
        compact ? 'p-1' : 'p-1'
      ]"
    >
      <div
        v-for="tab in tabs"
        :key="getTabId(tab)"
        @click="selectTab(tab)"
        :data-value="getTabId(tab)"
        :class="[
          'flex-1 lg:flex-initial whitespace-nowrap cursor-pointer h-full flex justify-center items-center gap-2 transition-colors font-[\'Poppins\'] text-sm outline-none last:border-r-0 rounded-full',
          compact ? 'px-4 py-2' : 'px-4 py-2',
          modelValue === getTabId(tab) ? activeTabClass : inactiveTabClass
        ]"
      >
        <span class="inline-grid place-items-center">
          <span class="invisible col-start-1 row-start-1 font-semibold" aria-hidden="true">{{ getTabLabel(tab) }}</span>
          <span class="col-start-1 row-start-1">{{ getTabLabel(tab) }}</span>
        </span>
        <span
          v-if="getTabCount(tab) != null"
          class="text-[0.625rem] font-medium leading-none text-[#98A2B3] relative -top-0.5"
        >{{ getTabCount(tab) }}</span>
      </div>
    </div>

    <!-- Mobile Dropdown -->
    <div
      v-if="!tabsOnly"
      class="md:hidden relative"
      :class="compact ? 'w-auto' : 'w-full sm:w-auto'"
    >
      <button
        @click="isDropdownOpen = !isDropdownOpen"
        :class="[
          'px-3 py-1.5 bg-white/70 backdrop-blur-md  rounded-[0.625rem] flex justify-center gap-2 items-center outline-none hover:bg-white/90 transition-colors',
          compact ? '' : 'w-full'
        ]"
      >
        <span class="text-gray-900 font-medium text-sm">{{ getTabLabel(selectedTabObject) }}</span>
        <div
          class="w-4 h-4 flex items-center justify-center transition-transform"
          :class="{ 'rotate-180': isDropdownOpen }"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="#667085" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
      </button>

      <div
        v-if="isDropdownOpen"
        :class="[
          'absolute right-0 z-20 top-full mt-1.5 bg-white/90 backdrop-blur-md border border-gray-200 rounded-[0.125rem] shadow-[0_0_12px_0_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in zoom-in duration-200',
          compact ? 'min-w-full sm:w-[200px]' : 'w-full sm:w-[200px]'
        ]"
      >
        <div
          v-for="tab in tabs"
          :key="getTabId(tab)"
          @click="selectTab(tab)"
          :class="[
            'px-4 py-3 text-sm transition-colors cursor-pointer text-center',
            modelValue === getTabId(tab) ? '' : 'text-gray-600 hover:bg-gray-50/80'
          ]"
        >
          {{ getTabLabel(tab) }}
          <span
            v-if="getTabCount(tab) != null"
            class="ml-0.5 text-[0.625rem] font-medium leading-none text-[#98A2B3] relative -top-0.5"
          >{{ getTabCount(tab) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMobileMd } from '@/composables/useMobileMd.js'

const props = defineProps({
  tabs: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  },
  activeTabClass: {
    type: String,
    default: 'bg-gray-50 text-gray-800 font-bold'
  },
  inactiveTabClass: {
    type: String,
    default: 'bg-transparent text-gray-500 font-medium hover:bg-gray-50'
  },
  compact: {
    type: Boolean,
    default: false
  },
  // Show tabs on all screen sizes and hide dropdown
  tabsOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const { isMobile } = useMobileMd()

const isDropdownOpen = ref(false)

const getTabId = (tab) => {
  return typeof tab === 'object' ? tab.id : tab
}

const getTabLabel = (tab) => {
  if (typeof tab === 'object') {
    return tab.labelKey ? t(tab.labelKey) : tab.label
  }
  return tab
}

const getTabCount = (tab) => {
  if (typeof tab === 'object' && tab.count != null) return tab.count
  return null
}

const selectedTabObject = computed(() => {
  return props.tabs.find(tab => getTabId(tab) === props.modelValue) || props.modelValue
})

const selectTab = (tab) => {
  emit('update:modelValue', getTabId(tab))
  isDropdownOpen.value = false
}
</script>
