<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

import BasePopup from './BasePopup.vue'
import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue'
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useAssetUrl } from '@/composables/useAssetUrl.js'
const { url: iconChevronDown } = useAssetUrl('dashboard.analytics.chevronDown')
const { url: iconClosePopup } = useAssetUrl('dashboard.analytics.closePopup')


const props = defineProps({
  modelValue: Boolean,
  title: String,
  logo: String,
  period: String,
  showPeriodSelector: { type: Boolean, default: true },
  /**
   * BasePopup shell spinner while charts/JS mount.
   * Same white popup; inner body hidden; close always visible; approved small thin spinner.
   */
  isLoading: { type: Boolean, default: false },
  /** Loader position passed to BasePopup: center | top-center | bottom-center | ... */
  loaderPosition: { type: String, default: 'center' },
})

const emit = defineEmits(['update:modelValue', 'update:period'])

// Instant open (~0ms effect) — shell must paint under 10ms; spinner covers chart mount.
const config = computed(() => ({
  actionType: 'popup',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,
  shouldCloseOnEscape: true,
  width: '100%',
  height: '100%',
  speed: '0ms',
  effect: 'ease',
  customEffect: 'instant',
  scrollable: true,
}))

// ================= DROPDOWN =================
import { DASHBOARD_ANALYTICS_PERIODS, dashboardAnalyticsTrendPeriodTabs } from '@/systems/analytics/analyticsPeriodsConfig.js'
const options = computed(() => {
  return [
    ...dashboardAnalyticsTrendPeriodTabs.map(tab => ({ label: t(tab.labelKey), value: tab.id })),
    { label: t('dashboard.analytics.periods.allTime', 'All Time'), value: DASHBOARD_ANALYTICS_PERIODS.ALL_TIME }
  ]
})

const selected = computed({
  get: () => props.period || DASHBOARD_ANALYTICS_PERIODS.DAILY,
  set: (val) => emit('update:period', val)
})
const isOpen = ref(false)
const dropdownDirection = ref('downward')
const optionsRef = ref(null)

const selectedLabel = computed(() => {
  return options.value.find((o) => o.value === selected.value)?.label || 'Select'
})

function toggleDropdown() {
  isOpen.value = !isOpen.value
  if (isOpen.value) positionDropdown()
}

function selectOption(option) {
  selected.value = option.value
  isOpen.value = false
}

function positionDropdown() {
  if (!optionsRef.value) return
  const rect = optionsRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const spaceAbove = rect.top
  const optionsHeight = optionsRef.value.scrollHeight

  dropdownDirection.value =
    spaceBelow < optionsHeight && spaceAbove > spaceBelow ? 'upward' : 'downward'
}

function handleClickOutside(e) {
  if (!optionsRef.value) return
  if (!optionsRef.value.closest('.select-dropdown')?.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', positionDropdown)
  document.addEventListener('click', handleClickOutside)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', positionDropdown)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <BasePopup
    :modelValue="props.modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :popup-config="config"
  >
    <div class="box-border flex items-center justify-center h-full w-full lg:px-12 lg:py-16">
    <div
      class="relative w-full h-full lg:h-auto max-h-full flex flex-col gap-4 bg-white/90 dark:bg-[#181a1b]/90 md-small:px-6 md-small:pb-6 pb-6 px-2 md:px-6 pt-0 rounded-none scrollbar-hide overflow-y-auto"
      :aria-busy="props.isLoading ? 'true' : undefined"
    >
      <!-- Sticky popup header (Title, Dropdown, Close Button) -->
      <div
        class="sticky top-0 z-[10050] flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white/95 dark:bg-[#181a1b]/95 backdrop-blur-md py-2 md-small:py-4 -mx-2 px-2 md-small:px-2 lg:px-4"
      >
        <!-- Title & Mobile Close button -->
        <div class="flex items-center justify-between w-full md:w-auto gap-2">
          <div class="flex items-center gap-2">
            <img v-if="props.logo" :src="props.logo" alt="" class="w-6 h-6 object-contain" />
            <h3 class="text-lg md:text-2xl font-semibold text-[#0c111d] dark:text-[#dbd8d3] m-0">{{ props.title }}</h3>
          </div>

          <!-- Mobile Close Button (aligned with title on mobile) -->
          <div
            @click="emit('update:modelValue', false)"
            class="close-button md:hidden shrink-0 cursor-pointer p-2 bg-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.1),0px_1px_2px_0px_rgba(16,24,40,0.06)] rounded-full flex justify-center items-center dark:bg-[#181a1b] dark:shadow-[0px_1px_3px_0px_rgba(13,19,32,0.1),0px_1px_2px_0px_rgba(13,19,32,0.06)]"
            data-popup-close
          >
            <img
              :src="iconClosePopup || ''"
              alt="close-button"
              class="w-5 h-5"
            />
          </div>
        </div>

        <!-- Right Side: Select Dropdown & Desktop Close Button -->
        <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <!-- select-dropdown -->
          <div v-if="props.showPeriodSelector" class="select-dropdown flex-1 min-w-0 md:flex-none md:w-auto relative z-[10000]" id="select-dropdown">
            <div
              class="trends-select cursor-pointer min-w-[5.75rem] rounded-[0.5rem] border-none bg-white/30 dark:bg-[#181a1b]/30"
              @click.stop="toggleDropdown"
            >
              <div
                class="dash-select__trigger flex items-center justify-center md:justify-center gap-1 rounded-[0.5rem] bg-white/50 px-[0.875rem] py-[0.625rem] dark:bg-[#181a1b]/50"
              >
                <span
                  class="text-[0.875rem] font-medium leading-[1.25rem] text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]"
                >
                  {{ selectedLabel }}
                </span>
                <img
                  class="select-arrow h-6 w-6 transition-transform duration-200"
                  :class="{ 'rotate-180': isOpen }"
                  :src="iconChevronDown || ''"
                  alt="arrow-down"
                />
              </div>

              <!-- Options container -->
              <div
                ref="optionsRef"
                class="dash-options-container absolute left-auto right-0 top-[calc(100%+0.5rem)] z-[9999] w-full min-w-[15rem] origin-top scale-95 opacity-0 h-0 overflow-hidden pointer-events-none shadow-lg transition-all duration-200 ease-out [transform-origin:50%_0]"
                :class="{
                  open: isOpen,
                  'scale-100 opacity-100 pointer-events-auto h-auto overflow-auto': isOpen,
                  'scale-95 opacity-0 pointer-events-none h-0 overflow-hidden': !isOpen,
                  upward: dropdownDirection === 'upward',
                  downward: dropdownDirection === 'downward',
                }"
                :style="
                  dropdownDirection === 'upward'
                    ? { bottom: 'calc(100% + 0.5rem)', top: 'auto' }
                    : { top: 'calc(100% + 0.5rem)', bottom: 'auto' }
                "
              >
                <div
                  class="rounded-[0.125rem]  bg-white/90 dark:border-[rgba(61,71,73,0.5)] dark:bg-[#181a1b]/90 backdrop-blur-[25px]"
                >
                  <div
                    v-for="option in options"
                    :key="option.value"
                    class="option flex items-center justify-center gap-[0.625rem] p-[0.75rem]"
                    :class="option.value === selected ? 'bg-[#F2F4F7] dark:bg-[#2a2c2d]' : 'hover:bg-white dark:hover:bg-[#e8e6e3]'"
                    @click.stop="selectOption(option)"
                  >
                    <div
                      class="option-inner-container flex flex-1 gap-[0.625rem] px-[0.625rem] py-[0.563rem]"
                    >
                      <span
                        class="text-[0.875rem] font-medium leading-[1.25rem] text-[#0c111d] capitalize tracking-[0.01875rem] text-balance dark:text-[#dbd8d3]"
                      >
                        {{ option.label }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Real select (hidden) -->
            <select
              v-model="selected"
              class="dash-real-select hidden"
              name="trends-select"
              required
            >
              <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </div>

          <!-- Desktop Close Button (aligned with title & dropdown) -->
          <div
            @click="emit('update:modelValue', false)"
            class="close-button hidden md:flex shrink-0 cursor-pointer p-2.5 bg-white shadow-[0px_1px_3px_0px_rgba(16,24,40,0.1),0px_1px_2px_0px_rgba(16,24,40,0.06)] rounded-full justify-center items-center dark:bg-[#181a1b] dark:shadow-[0px_1px_3px_0px_rgba(13,19,32,0.1),0px_1px_2px_0px_rgba(13,19,32,0.06)]"
            data-popup-close
          >
            <img
              :src="iconClosePopup || ''"
              alt="close-button"
              class="w-6 h-6"
            />
          </div>
        </div>
      </div>

      <!-- Spinner centered on white content shell -->
      <div
        v-if="props.isLoading"
        class="absolute inset-0 z-[9998] flex items-center justify-center pointer-events-none"
        :data-loader-position="loaderPosition || 'center'"
      >
        <LoadingSpinner
          size="lg"
          :thickness="1.5"
          color="text-success"
          track-color="text-gray-200"
          :show-track="true"
        />
      </div>

      <!-- Inner contents hidden until ready; DOM kept so charts can mount -->
      <div
        class="flex flex-col gap-4 flex-1"
        :class="{ invisible: props.isLoading, 'pointer-events-none': props.isLoading }"
        :aria-hidden="props.isLoading ? 'true' : undefined"
      >
        <!-- body (slot for dynamic content) -->
          <slot />
      </div>
    </div>
    </div>
  </BasePopup>
</template>
