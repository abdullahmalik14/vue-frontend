<template>
  <div v-bind="resolvedAttrs.wrapperAttrs.wrapper1">
    <div v-bind="resolvedAttrs.wrapperAttrs.wrapper2">
      <input
        :id="id"
        type="radio"
        :name="name"
        :value="value"
        :checked="modelValue === value"
        class="peer sr-only"
        @change="$emit('update:modelValue', value)"
      />
      <label
        v-if="label"
        :for="id"
        :data-radio-theme="theme || 'dashboard'"
        :class="[resolvedLabelClass, radioLabelClass].filter(Boolean)"
      >
        {{ label }}
      </label>
    </div>
  </div>
</template>

<script setup>
import { resolveAllConfigs } from "@/utils/componentRenderingUtils";
import { computed } from "vue";

/**
 * Named radio looks — call sites pass theme="…" like DashboardPrimaryButton.
 * Circle (before/after) lives in scoped CSS so Tailwind purge cannot drop it.
 * Show Code stays short: theme="dashboard" | "plan" | "createTag" | "auth".
 */
const radioThemes = {
  /** MediaUploader publish/schedule attach-media */
  dashboard: {
    wrapper1Class: "flex flex-col gap-2",
    wrapper2Class: "flex items-center gap-2",
    labelClass:
      "radio-label relative block cursor-pointer pl-8 text-[0.938rem] font-medium leading-6 text-black",
  },
  /** PlanSharing / LuckyDraw / EditProfile — dark-mode aware */
  plan: {
    wrapper1Class: "flex flex-col gap-2",
    wrapper2Class: "flex items-center gap-2",
    labelClass:
      "radio-label relative block cursor-pointer pl-8 text-base font-medium text-black dark:text-[#e8e6e3]",
  },
  /** CreateNewTagPopup */
  createTag: {
    wrapper1Class: "flex flex-col gap-2",
    wrapper2Class: "flex items-center gap-2",
    labelClass:
      "radio-label relative block cursor-pointer pl-8 text-[16px] font-medium font-bolder text-black dark:text-platinum",
  },
  auth: {
    wrapper1Class: "flex flex-col gap-[0.375rem] flex-1 self-stretch",
    wrapper2Class: "flex flex-col gap-2",
    labelClass: "block",
  },
};

const props = defineProps({
  modelValue: [String, Number],
  value: [String, Number],
  name: String,
  label: String,
  id: String,
  /** Optional extra label classes; prefer a named theme instead */
  radioLabelClass: { type: String, default: "" },
  theme: String,
  addId: String,
  removeId: Boolean,
  addClass: String,
  removeClass: Boolean,
  addAttributes: Object,
  removeAttributes: Array,
  wrapperOverrides: Array,
});

defineEmits(["update:modelValue"]);

const themeBundle = computed(() => radioThemes[props.theme] || radioThemes.dashboard);

const resolvedLabelClass = computed(() => themeBundle.value.labelClass);

const inputConfig = computed(() => ({
  wrappers: [
    {
      targetAttribute: "wrapper1",
      addClass: themeBundle.value.wrapper1Class,
      addAttributes: { "data-wrapper": "wrapper1" },
    },
    {
      targetAttribute: "wrapper2",
      addClass: themeBundle.value.wrapper2Class,
      addAttributes: { "data-wrapper": "wrapper2" },
    },
  ],
  elm: {
    addClass: "peer sr-only",
    addAttributes: {
      type: "radio",
      name: props.name,
    },
  },
  additionalConfig: {
    label: {
      addClass: "",
      addAttributes: { for: props.id },
    },
  },
}));

const resolvedAttrs = computed(() =>
  resolveAllConfigs(inputConfig.value, props.theme, props),
);
</script>

<style scoped>
/* Shared radio circle — themes only change colors via data-radio-theme */
.radio-label::before {
  content: "";
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  border-width: 1px;
  border-style: solid;
  box-sizing: border-box;
}

.radio-label::after {
  content: "";
  position: absolute;
  left: 0.4375rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 9999px;
  display: none;
}

.peer:checked + .radio-label::after {
  display: block;
}

/* dashboard — MediaUploader tokens */
.radio-label[data-radio-theme="dashboard"]::before {
  border-color: #d0d5dd;
  background-color: #fff;
}
.peer:checked + .radio-label[data-radio-theme="dashboard"]::before {
  background-color: #000;
}
.radio-label[data-radio-theme="dashboard"]::after {
  background-color: #07f468;
}

/* plan — EditProfile / PlanSharing / LuckyDraw */
.radio-label[data-radio-theme="plan"]::before {
  border-color: #d0d5dd;
  background-color: #ffffff;
}
:global(.dark) .radio-label[data-radio-theme="plan"]::before {
  border-color: #3b4043;
  background-color: #181a1b;
}
.peer:checked + .radio-label[data-radio-theme="plan"]::before {
  background-color: #000000;
}
.radio-label[data-radio-theme="plan"]::after {
  background-color: #07f468;
}

/* createTag — CreateNewTagPopup tokens */
.radio-label[data-radio-theme="createTag"]::before {
  border-color: #d0d5dd;
  background-color: #fff;
}
:global(.dark) .radio-label[data-radio-theme="createTag"]::before {
  border-color: #3b4043;
  background-color: #181a1b;
}
.peer:checked + .radio-label[data-radio-theme="createTag"]::before {
  background-color: #000;
}
.radio-label[data-radio-theme="createTag"]::after {
  background-color: #07f468;
}
</style>
