<template>
  <div v-bind="resolvedAttrs.wrapperAttrs.wrapper1">
    <label v-if="showWrapperLabel" class="block text-sm font-medium text-gray-900">
      {{ wrapperLabel }}
    </label>

    <div class="flex gap-2 ">
      <label :class="['relative inline-block shrink-0', resolvedSwitchWrapperClass]">
        <input
          type="checkbox"
          class="peer h-0 w-0 opacity-0"
          :id="inputId"
          :checked="modelValue"
          @change="toggle"
        />

        <span
          :class="[
            'absolute cursor-pointer transition-all duration-100 ease-in-out',
            resolvedTrackClass,
          ]"
        ></span>

        <span
          :class="[
            'absolute top-1/2 bg-white transition-all duration-100 ease-in-out transform -translate-y-1/2',
            resolvedKnobClass,
          ]"
        ></span>
      </label>

      <label
        :for="inputId"
        :class="['cursor-pointer', resolvedLabelClass]"
      >
        {{ label }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from "vue";
import { resolveAllConfigs } from "@/utils/componentRenderingUtils";

const PLAN_TRACK =
  "absolute inset-0 cursor-pointer rounded-[0.75rem] bg-[#98a2b380] transition-all duration-100 ease-in-out peer-checked:bg-[#0c111d] dark:bg-[#434c5b80] dark:peer-checked:bg-[#0a0e17]";
const PLAN_KNOB =
  "absolute left-[0.125rem] top-1/2 h-4 w-4 -translate-y-1/2 transform rounded-full bg-white shadow-[0_1px_3px_0_rgba(16,24,40,0.1),0_1px_2px_0_rgba(16,24,40,0.06)] transition-all duration-100 ease-in-out peer-checked:translate-x-[1rem] dark:bg-[#181a1b]";

/** Theme matrix — Tailwind / wrapper bundles. Call sites pass theme="…" like CheckboxGroup. */
const checkboxSwitchThemes: Record<
  string,
  {
    trackClass?: string;
    knobClass?: string;
    labelClass?: string;
    switchWrapperClass?: string;
    wrapperOverrides?: Array<{ target: string; addClass: string }>;
  }
> = {
  /** Subscription link toggle — horizontal row next to Add Tier. */
  linkRow: {
    wrapperOverrides: [
      { target: "wrapper1", addClass: "!flex-row !items-center !self-auto !h-10 !gap-0" },
    ],
  },
  /** Media filter row — compact track, no visible label. */
  filter: {
    trackClass:
      "top-0 left-0 right-0 bottom-0 bg-[rgba(152,162,179,0.5)] rounded-[0.75rem] peer-checked:bg-text-primary",
    labelClass: "hidden",
    wrapperOverrides: [{ target: "wrapper1", addClass: "!gap-0 !self-auto" }],
  },
  /** Plan featured tier — dark track, semibold label. */
  planFeatured: {
    trackClass: PLAN_TRACK,
    knobClass: PLAN_KNOB,
    labelClass: "text-base font-semibold text-black dark:text-[#e8e6e3]",
    switchWrapperClass: "w-9 h-5",
  },
  /** Plan sharing / lucky draw — dark track, medium label. */
  plan: {
    trackClass: PLAN_TRACK,
    knobClass: PLAN_KNOB,
    labelClass: "text-base font-medium text-[#0C111D] dark:text-[#dbd8d3]",
    switchWrapperClass: "w-9 h-5",
  },
};

const props = defineProps<{
  modelValue: boolean;
  label?: string;
  id?: string;
  showWrapperLabel?: boolean;
  wrapperLabel?: string;
  /** Named Tailwind / wrapper bundle — see checkboxSwitchThemes */
  theme?: string;

  // Styling Props (override theme when set)
  trackClass?: string;
  knobClass?: string;
  labelClass?: string;
  switchWrapperClass?: string;

  addId?: string;
  removeId?: boolean;
  addClass?: string;
  removeClass?: boolean;
  addAttributes?: object;
  removeAttributes?: string[];
  wrapperOverrides?: any[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const fallbackId = useId();
const inputId = computed(() => props.id ?? fallbackId);

const themeBundle = computed(() => checkboxSwitchThemes[props.theme || ""] || null);

const resolvedTrackClass = computed(
  () =>
    props.trackClass ||
    themeBundle.value?.trackClass ||
    "top-0 left-0 right-0 bottom-0 bg-[rgba(152,162,179,0.5)] rounded-[0.75rem] peer-checked:bg-[#101828]",
);

const resolvedKnobClass = computed(
  () =>
    props.knobClass ||
    themeBundle.value?.knobClass ||
    "w-4 h-4 left-[0.125rem] rounded-full shadow-dash-toggle peer-checked:translate-x-[1rem]",
);

const resolvedLabelClass = computed(
  () =>
    props.labelClass ||
    themeBundle.value?.labelClass ||
    "text-sm sm:text-base font-medium  text-dash-gray-900",
);

const resolvedSwitchWrapperClass = computed(
  () => props.switchWrapperClass || themeBundle.value?.switchWrapperClass || "w-9 h-5 ",
);

const resolvedWrapperOverrides = computed(() => {
  if (props.wrapperOverrides?.length) return props.wrapperOverrides;
  return themeBundle.value?.wrapperOverrides;
});

const toggle = () => {
  emit("update:modelValue", !props.modelValue);
};

const inputConfig = {
  wrappers: [
    { targetAttribute: "wrapper1", addClass: "flex flex-col gap-[0.375rem] self-stretch", addAttributes: { "data-wrapper": "wrapper1" } },
    { targetAttribute: "wrapper2", addClass: "flex items-center gap-2", addAttributes: { "data-wrapper": "wrapper2" } },
  ],
  elm: { addClass: "opacity-0 w-0 h-0 peer" },
  additionalConfig: {
    label: { addClass: "text-base font-medium text-gray-900 cursor-pointer", addAttributes: { for: "input-id" } },
  },
};

const resolvedAttrs = computed(() =>
  resolveAllConfigs(inputConfig, props.theme, {
    ...props,
    wrapperOverrides: resolvedWrapperOverrides.value,
  }),
);
</script>
