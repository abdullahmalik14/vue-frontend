<template>
  <div data-component="dashboard-wizard-steps" class="relative w-full">
    <div
      class="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[2px] bg-white dark:bg-panel-dark-border"
      aria-hidden="true"
    />
    <div
      class="relative z-10 flex flex-row justify-between items-stretch self-stretch w-full overflow-x-auto list-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <button
        v-for="step in steps"
        :key="step.id"
        type="button"
        :data-action="actionAttr"
        :data-step-id="step.id"
        :data-state="modelValue === step.id ? 'active' : 'inactive'"
        class="relative text-xs md:flex-1 leading-[1.125rem] flex md:min-w-[5rem] items-center justify-center px-4 md:px-2 py-2.5 transition-all duration-200 cursor-pointer flex-shrink-0 outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0"
        :class="
          modelValue === step.id
            ? 'text-black dark:text-text font-[600]'
            : 'text-gray-500'
        "
        @click="emit('update:modelValue', step.id)"
      >
        {{ resolveLabel(step) }}
        <span
          v-if="modelValue === step.id"
          class="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[2px] bg-black dark:bg-timberwolf"
          aria-hidden="true"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const props = defineProps({
  /** Active step id */
  modelValue: {
    type: [Number, String],
    required: true,
  },
  /**
   * Steps: `{ id, labelKey?, label? }`
   * Prefer `labelKey` for i18n; `label` is raw text fallback.
   */
  steps: {
    type: Array,
    required: true,
  },
  /** data-action value on each step button */
  actionAttr: {
    type: String,
    default: 'select-wizard-step',
  },
});

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();

function resolveLabel(step) {
  if (step?.labelKey) return t(step.labelKey);
  return step?.label ?? '';
}
</script>
