<script setup>
/**
 * Plan publish flow tabs — icon + label + pink underline (SubscriptionTierPopup).
 * Existing DashboardTabs / MediaUploadTypeTabs do not match this underline style.
 */
defineProps({
  /** Active step / tab id (number or string) */
  modelValue: {
    type: [Number, String],
    required: true,
  },
  /**
   * Tab items: { id, label, icon }
   * id compared to modelValue; icon is image URL.
   */
  tabs: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

const activeIconClass =
  '[filter:brightness(0)_saturate(100%)_invert(15%)_sepia(77%)_saturate(6803%)_hue-rotate(330deg)_brightness(100%)_contrast(108%)]';
const idleIconClass =
  '[filter:brightness(0)_saturate(100%)_invert(44%)_sepia(18%)_saturate(467%)_hue-rotate(183deg)_brightness(93%)_contrast(86%)]';

function isActive(tabId, modelValue) {
  return String(tabId) === String(modelValue);
}

function selectTab(tabId) {
  emit('update:modelValue', tabId);
}
</script>

<template>
  <div data-component="plan-flow-tabs" class="flex items-center gap-2 px-0">
    <ul
      class="flex w-full items-center gap-6 overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
    >
      <li
        v-for="(tab, index) in tabs"
        :key="tab.id"
        role="tab"
        :aria-selected="isActive(tab.id, modelValue)"
        class="flex min-w-max max-w-[calc((100%/3)-1rem)] grow cursor-pointer items-center justify-center gap-2 pb-3 md:w-max md:grow-0"
        :class="[
          index === 0 ? '' : 'px-1',
          isActive(tab.id, modelValue)
            ? 'active border-b-[2px] border-[#FB5BA2] dark:border-[#950444]'
            : '',
        ]"
        @click="selectTab(tab.id)"
      >
        <div
          class="flex w-full items-center justify-center gap-2"
          :class="index === 0 ? '' : 'px-1'"
        >
          <img
            v-if="tab.icon"
            :src="tab.icon"
            alt=""
            class="h-5 w-5"
            :class="isActive(tab.id, modelValue) ? activeIconClass : idleIconClass"
          />
          <span
            class="whitespace-nowrap text-sm font-semibold"
            :class="
              isActive(tab.id, modelValue)
                ? 'text-[#FF0066] dark:text-[#ff1a76]'
                : 'text-[#667085] dark:text-[#9e9689]'
            "
          >
            {{ tab.label }}
          </span>
        </div>
      </li>
    </ul>
  </div>
</template>
