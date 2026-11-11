<template>
  <div class="flex flex-col gap-4 w-full" :class="wrapperClass">
    <div
      class="rounded-lg overflow-hidden w-full bg-[#EAECF0] dark:bg-[#222526] z-0"
      :class="trackClass"
      role="progressbar"
      :aria-valuenow="clampedProgress"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="h-full rounded transition-[width] duration-300 ease-out"
        :class="fillClass"
        :style="{ width: `${clampedProgress}%` }"
      />
    </div>

    <div v-if="steps.length" class="w-full flex justify-between">
      <div
        v-for="(step, index) in steps"
        :key="`${step.label}-${index}`"
        class="flex items-center gap-1 text-xs leading-[1.125rem]"
        :class="stepLabelClass(step, index)"
      >
        <img
          v-if="step.icon"
          :src="step.icon"
          alt=""
          class="w-3 h-3"
          :class="step.iconClass || ''"
        />
        <span :class="step.fontClass || ''">{{ step.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /** 0–100 fill percentage */
  progress: {
    type: Number,
    default: 0,
  },
  /**
   * Optional step labels under the bar.
   * Example: [{ label: 'Pending' }, { label: 'Processing' }, { label: 'Completed' }]
   */
  steps: {
    type: Array,
    default: () => [],
  },
  /**
   * 0-based index of the current step (inclusive active range from start).
   * When set, labels up to this index use the active color.
   * If omitted, active labels are derived from `progress` evenly across steps.
   */
  currentStep: {
    type: Number,
    default: null,
  },
  trackClass: {
    type: String,
    default: 'h-[0.375rem]',
  },
  wrapperClass: {
    type: String,
    default: '',
  },
  fillClass: {
    type: String,
    default: 'bg-[#0c111d] dark:bg-[#0a0e17]',
  },
  activeLabelClass: {
    type: String,
    default: 'text-[#0c111d] dark:text-[#dbd8d3]',
  },
  inactiveLabelClass: {
    type: String,
    default: 'text-[#98A2B3] dark:text-[#b0a993]',
  },
});

const clampedProgress = computed(() =>
  Math.min(100, Math.max(0, Number(props.progress) || 0))
);

const activeStepIndex = computed(() => {
  if (props.currentStep != null) return props.currentStep;
  if (!props.steps.length) return -1;
  const segment = 100 / props.steps.length;
  return Math.min(
    props.steps.length - 1,
    Math.floor(clampedProgress.value / segment)
  );
});

function isStepActive(index) {
  return index <= activeStepIndex.value;
}

function stepLabelClass(step, index) {
  if (step.labelClass) return step.labelClass;
  return isStepActive(index) ? props.activeLabelClass : props.inactiveLabelClass;
}
</script>
