<template>
  <template v-if="noWrap">
    <component :is="tag" v-bind="resolvedAttrs.inputAttrs">
      {{ text }}
    </component>
  </template>
  <div v-else v-bind="resolvedAttrs.wrapperAttrs.wrapper1">
    <div v-bind="resolvedAttrs.wrapperAttrs.wrapper2">
      <component v-if="leftIcon" :is="leftIcon" :class="[iconSize, iconSpacing]" />

      <component :is="tag" v-bind="resolvedAttrs.inputAttrs">
        {{ text }}
      </component>
    </div>
  </div>
</template>

<script setup>
import { computed, useAttrs } from "vue";
import { resolveAllConfigs } from "@/utils/componentRenderingUtils";

const attrs = useAttrs();

const props = defineProps({
  text: { type: String, required: true },
  noWrap: { type: Boolean, default: false },

  tag: {
    type: String,
    default: "h2",
  },

  theme: { type: String, default: "defaultSecondaryHeading" },

  leftIcon: [String, Object, Function],

  iconSize: { type: String, default: "w-5 h-5" },
  iconSpacing: { type: String, default: " inline-block" },

  addId: String,
  removeId: Boolean,
  addClass: String,
  removeClass: Boolean,
  addAttributes: Object,
  removeAttributes: { type: Array, default: () => [] },

  wrapperOverrides: { type: Array, default: () => [] },
  class: String,
});

// Tailwind classes matrix (themes × h1–h6)
const themeClasses = {
  defaultPrimaryHeading: {
    h1: "text-4xl font-bold text-text dark:text-text-dark tracking-tight",
    h2: "text-3xl font-bold text-text dark:text-text-dark tracking-tight",
    h3: "text-2xl font-semibold text-text dark:text-text-dark tracking-tight",
    h4: "text-xl font-semibold text-text dark:text-text-dark tracking-tight",
    h5: "text-lg font-medium text-text dark:text-text-dark tracking-tight",
    h6: "text-base font-medium text-text dark:text-text-dark tracking-tight",
  },
  defaultSecondaryHeading: {
    h1: "text-3xl font-semibold text-text dark:text-text-dark tracking-tight",
    h2: "text-2xl font-semibold text-text dark:text-text-dark tracking-tight",
    h3: "text-xl font-semibold text-text dark:text-text-dark tracking-tight",
    h4: "text-lg font-medium text-text dark:text-text-dark tracking-tight",
    h5: "text-base font-medium text-text dark:text-text-dark tracking-tight",
    h6: "text-sm font-medium text-text dark:text-text-dark tracking-tight",
  },
  sectionHeading: {
    h1: "text-2xl font-medium uppercase text-text dark:text-text-dark",
    h2: "text-xl font-medium uppercase text-text dark:text-text-dark",
    h3: "text-lg font-medium uppercase text-text dark:text-text-dark",
    h4: "text-base font-medium uppercase text-text dark:text-text-dark",
    h5: "text-sm font-medium uppercase text-text dark:text-text-dark",
    h6: "text-xs font-medium uppercase text-text dark:text-text-dark",
  },
  dashboardHeading: {
    h1: "text-3xl font-bold text-blue-600 dark:text-blue-400",
    h2: "text-2xl font-semibold text-blue-600 dark:text-blue-400",
    h3: "text-xl font-medium text-blue-500 dark:text-blue-300",
    h4: "text-lg font-medium text-blue-500 dark:text-blue-300",
    h5: "text-base font-normal text-blue-400 dark:text-blue-200",
    h6: "text-sm font-normal text-blue-400 dark:text-blue-200",
  },
  AuthHeading: {
    h2: "text-2xl font-medium tracking-wider text-white",
    h4: "text-xl tracking-wider text-white",
  },
  formHeading: {
    h4: "text-base font-[600] font-semibold leading-[24px] text-[#344054]",
  },
  profileFeed: {
    h2: "text-xl leading-normal font-medium text-white drop-shadow-[0px_0px_10px_-34px_#0000001A]"
  },
  demoHeadings: {
    h1: "text-3xl font-bold ",
    h2: "text-2xl font-semibold",
    h3: "text-xl font-medium",
    h4: "text-lg font-medium",
    h5: "text-base font-normal",
    h6: "text-sm font-normal",
  },
  orderHeading: {
    h1: "text-[#475467] text-[30px] font-[500] dark:text-[#ACBACF]"
  },
  custom: {
    h1: "",
    h2: "",
    h3: "",
    h4: "",
    h5: "",
    h6: "",
  },
  homeSectionTitle: {
    h2: "text-2xl font-semibold text-center text-[#344054] md:text-4xl md:leading-[2.75rem] md:-tracking-[0.045rem] dark:text-[#bdb8af]",
  },
  homeSectionTitleServices: {
    h2: "text-2xl font-semibold text-center text-[#344054] md:text-3xl md:leading-[2.375rem] xl:text-5xl xl:leading-[3.75rem] xl:tracking-[-0.06rem] dark:text-[#bdb8af]",
  },
  homeFeatureTitle: {
    h3: "text-xl leading-normal font-semibold text-[#344054] dark:text-[#bdb8af]",
  },
  homeHeroTitle: {
    h1: "text-4xl leading-[2.75rem] font-semibold italic -tracking-[0.045rem] drop-shadow-[0_4px_9.6px_#00000040] text-white md:text-[3.25rem] md:leading-[3.75rem] md:-tracking-[0.065rem] dark:text-[#e8e6e3]",
  },
  homeOverviewTitle: {
    h2: "text-lg font-medium text-white lg:text-2xl lg:font-semibold dark:text-[#e8e6e3]",
  },
  homeDitchTitle: {
    h2: "text-2xl font-semibold text-white md:text-4xl md:leading-[2.75rem] md:-tracking-[0.045rem] dark:text-[#e8e6e3]",
  },
  homeDitchTitleXl: {
    h2: "text-4xl leading-[2.75rem] font-semibold -tracking-[0.045rem] text-white dark:text-[#e8e6e3]",
  },
  homeSafetyTitle: {
    h2: "text-xl leading-normal font-semibold text-white md:text-4xl md:leading-[2.75rem] md:-tracking-[0.045rem] dark:text-[#e8e6e3]",
  },
};

const headingConfig = computed(() => ({
  wrappers: [
    {
      targetAttribute: "wrapper1",
      addClass: "flex flex-col w-full",
      addAttributes: { "data-wrapper": "wrapper1", "data-theme": props.theme },
    },
    {
      targetAttribute: "wrapper2",
      addClass: "flex items-center gap-2",
      addAttributes: { "data-wrapper": "wrapper2", "data-theme": props.theme },
    },
  ],
  elm: {
    addClass: [
      themeClasses[props.theme]?.[props.tag] ?? themeClasses.defaultSecondaryHeading.h2,
      props.class,
      attrs.class,
    ]
      .filter(Boolean)
      .join(" "),
    addAttributes: {
      role: "heading",
      "aria-level": props.tag.replace("h", ""),
    },
  },
}));

const resolvedAttrs = computed(() => resolveAllConfigs(headingConfig.value, props.theme, props));
</script>
