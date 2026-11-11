<template>
  <template v-if="noWrap">
    <p v-bind="resolvedAttrs.inputAttrs">
      {{ text }}
    </p>
  </template>
  <div v-else v-bind="resolvedAttrs.wrapperAttrs.wrapper1">
    <div v-bind="resolvedAttrs.wrapperAttrs.wrapper2">
      <!-- Optional Left Icon -->
      <template v-if="leftIcon">
        <img v-if="typeof leftIcon === 'string'" :src="leftIcon" :alt="text + ' icon'"
          :class="[iconSize, iconSpacing]" />
        <component v-else :is="leftIcon" :class="[iconSize, iconSpacing]" />
      </template>

      <!-- Paragraph Text -->
      <p v-bind="resolvedAttrs.inputAttrs">
        {{ text }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { resolveAllConfigs } from "@/utils/componentRenderingUtils";

const props = defineProps({
  text: { type: String, required: true },
  noWrap: { type: Boolean, default: false },

  theme: { type: String, default: "" },

  // optional icons
  leftIcon: { type: [String, Object, Function], default: null },

  iconSize: { type: String, default: "w-5 h-5" },
  iconSpacing: { type: String, default: "inline-block" },

  // override props (same structure as Input)
  addId: String,
  removeId: Boolean,
  addClass: String,
  removeClass: Boolean,
  addAttributes: Object,
  removeAttributes: { type: Array, default: () => [] },

  wrapperOverrides: { type: Array, default: () => [] },

  // style props
  fontSize: { type: String, default: "text-base" },
  fontWeight: { type: String, default: "font-normal" },
  fontColor: { type: String, default: "text-text dark:text-text-dark" },
  fontFamily: { type: String, default: "" },
  shadow: { type: String, default: "" },
  layoutClass: { type: String, default: "" },
  class: String,
});

const themeClasses = {
  homeSectionSubtitle:
    "text-base font-semibold text-center text-[#344054] md:text-xl md:leading-[1.875rem] dark:text-[#bdb8af]",
  homeSectionSubtitleServices:
    "text-base font-semibold text-center text-[#344054] md:text-lg md:font-medium xl:text-2xl dark:text-[#bdb8af]",
  homeFeatureBody: "text-base text-[#344054] dark:text-[#bdb8af]",
  homeHeroTagline:
    "text-base font-semibold italic text-white dark:text-[#e8e6e3] md:text-3xl md:leading-[2.375rem] md:font-medium md:not-italic",
  homeHeroBody: "text-sm opacity-90 pr-0.5 text-white md:text-base dark:text-[#e8e6e3]",
  homeOverviewBody:
    "text-sm text-white lg:text-base lg:font-medium dark:text-[#e8e6e3]",
  homeDitchSubtitle:
    "text-base font-semibold text-white md:text-2xl dark:text-[#e8e6e3]",
  homeDitchSubtitleXl: "text-2xl font-semibold text-white dark:text-[#e8e6e3]",
  homeDitchBody:
    "text-base font-medium text-white md:text-xl md:leading-normal dark:text-[#e8e6e3]",
  homeSafetyBody:
    "text-sm text-white md:text-xl md:leading-normal md:font-medium dark:text-[#e8e6e3]",
};

const paragraphConfig = computed(() => ({
  wrappers: [
    {
      targetAttribute: "wrapper1",
      addClass: "flex flex-col",
      addAttributes: { "data-wrapper": "wrapper1" },
    },
    {
      targetAttribute: "wrapper2",
      addClass: "flex items-start gap-2",
      addAttributes: { "data-wrapper": "wrapper2" },
    },
  ],
  elm: {
    addClass: [
      props.theme
        ? themeClasses[props.theme] ?? ""
        : [props.fontSize, props.fontWeight, props.fontColor].filter(Boolean).join(" "),
      props.fontFamily,
      props.shadow,
      props.layoutClass,
      props.class,
    ]
      .filter(Boolean)
      .join(" "),
    addAttributes: {
      role: "paragraph",
    },
  },
}));

const resolvedAttrs = computed(() => resolveAllConfigs(paragraphConfig.value, props.theme, props));
</script>
