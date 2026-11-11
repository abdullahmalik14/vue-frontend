<template>
  <label class="cursor-pointer" :class="resolvedWrapperClass">
    <div
      class="flex flex-1 min-w-0 gap-2"
      :class="isStartAlign ? 'items-start' : 'items-center'"
    >
      <!-- Checkbox box: size + radius come from theme / checkboxClass (Tailwind only) -->
      <span
        class="relative inline-flex shrink-0 items-center justify-center"
        :class="isStartAlign ? 'self-start' : 'self-center'"
      >
        <input
          type="checkbox"
          :checked="modelValue"
          :disabled="disabled"
          :class="inputClass"
          :style="resolvedInputStyle"
          @change="$emit('update:modelValue', $event.target.checked)"
        />

        <svg
          v-if="showCustomCheckMark && modelValue"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          class="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-2.5 w-2.5 shrink-0 -translate-x-1/2 -translate-y-1/2"
        >
          <path
            d="M3.5 8.25L6.75 11.5L12.5 4.5"
            :stroke="resolvedTickStroke"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>

      <img v-if="midImg" :src="midImg" alt="" />

      <span :class="labelSpanClass">
        <slot name="label">
          <slot>{{ label }}</slot>
        </slot>
      </span>

      <span v-if="tags && tags.length" class="inline-flex items-center gap-2">
        <div
          v-for="(tag, key) in tags"
          :key="key"
          :style="{ backgroundColor: tag.variant || '#ffffff' }"
          class="inline-flex items-center justify-center gap-2.5 rounded-[3.125rem] px-1.5 text-right text-xs font-medium leading-[1.125rem] dark:bg-dark-dash-published whitespace-nowrap"
          :class="tag.class || 'text-[#101828] dark:text-dark-dash-text'"
        >
          {{ tag.text }}
        </div>
      </span>
    </div>

    <span
      v-if="metaText"
      class="ml-auto text-xs font-medium leading-normal whitespace-nowrap text-[#667085] dark:text-[#9e9689]"
    >
      {{ metaText }}
    </span>
  </label>
</template>

<script>
/** Shared Tailwind tick for calendar event-filter checkboxes (centered, optically nudged). */
const CALENDAR_EVENT_TICK =
  "checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-1/2 checked:[&::after]:top-1/2 checked:[&::after]:-translate-x-1/2 checked:[&::after]:-translate-y-[calc(50%+1.5px)] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45";

const CALENDAR_EVENT_BOX =
  'm-0 [appearance:none] w-4 h-4 relative bg-white rounded border relative cursor-pointer';

const CALENDAR_EVENT_LABEL =
  'text-slate-700 sm:text-base text-[14px] cursor-pointer font-medium leading-6';

const CALENDAR_EVENT_WRAPPER = 'flex items-center gap-2';

/** Theme matrix — Tailwind only. Call sites pass theme="…" like Heading. */
export const checkboxGroupThemes = {
  calendarVideo: {
    checkboxClass: `${CALENDAR_EVENT_BOX} border-indigo-600 checked:bg-indigo-600 checked:border-indigo-600 ${CALENDAR_EVENT_TICK}`,
    labelClass: CALENDAR_EVENT_LABEL,
    wrapperClass: CALENDAR_EVENT_WRAPPER,
  },
  calendarAudio: {
    checkboxClass: `${CALENDAR_EVENT_BOX} border-cyan-500 checked:bg-cyan-500 checked:border-cyan-500 ${CALENDAR_EVENT_TICK}`,
    labelClass: CALENDAR_EVENT_LABEL,
    wrapperClass: CALENDAR_EVENT_WRAPPER,
  },
  calendarGroup: {
    checkboxClass: `${CALENDAR_EVENT_BOX} border-rose-600 checked:bg-rose-600 checked:border-rose-600 ${CALENDAR_EVENT_TICK}`,
    labelClass: CALENDAR_EVENT_LABEL,
    wrapperClass: CALENDAR_EVENT_WRAPPER,
  },
  calendarSchedule: {
    checkboxClass: `${CALENDAR_EVENT_BOX} border-gray-900 checked:bg-gray-900 checked:border-gray-900 ${CALENDAR_EVENT_TICK}`,
    labelClass: 'text-slate-700 sm:text-[16px] text-[12px] cursor-pointer font-medium leading-6',
    wrapperClass: CALENDAR_EVENT_WRAPPER,
  },
  calendarPink: {
    checkboxClass:
      "appearance-none bg-white border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 outline-none focus:outline-none focus:ring-0 checked:bg-[#FF0066] checked:border-[#FF0066] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-white checked:after:border-b-2 checked:after:border-r-2 checked:after:rotate-45 checked:after:box-border cursor-pointer",
    labelClass: 'text-xs sm:text-[12px] leading-normal tracking-[0.0175rem] text-slate-700 cursor-pointer mt-[2px]',
    wrapperClass: 'flex items-center',
  },
  /** Green fill, black CSS tick, 16px. Plan media rows share the label and wrapper too. */
  successTick: {
    checkboxClass:
      "appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 shrink-0 cursor-pointer checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border",
    labelClass: 'text-xs leading-normal font-semibold text-[#0C111D] dark:text-[#dbd8d3] max-w-[100px] truncate sm:max-w-none md:text-lg',
    wrapperClass: 'pl-1 flex items-center gap-2 md:gap-6 w-full',
  },
  /** Same green + black tick as successTick, 16px (coming soon). */
  successTickSm: {
    checkboxClass:
      "appearance-none bg-white border border-gray-300 rounded-[4px] w-4 h-4 shrink-0 cursor-pointer outline-none focus:outline-none focus:ring-0 checked:bg-success checked:border-success checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-1 checked:after:h-2 checked:after:border-black checked:after:border-[2px] checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:rotate-45 checked:after:box-border",
  },
  /** Green fill with the SVG tick (`custom-check-mark`). Submit terms, discovery, apply-on-sale. */
  successCustom: {
    checkboxClass:
      'h-4 w-4 box-border appearance-none [-webkit-appearance:none] bg-white border border-gray-300 rounded-[4px] checked:bg-success checked:border-success before:!hidden after:!hidden',
  },
  /** Neon green fill, black CSS tick. Checkout terms. */
  mintTick: {
    checkboxClass:
      "appearance-none border border-[#D0D5DD] rounded-[4px] w-4 min-w-4 h-4 checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-[0.3rem] checked:after:top-[0.15rem] checked:after:w-1 checked:after:h-2 checked:after:border checked:after:border-solid checked:after:border-t-0 checked:after:border-l-0 checked:after:border-[black] checked:after:border-b-[2px] checked:after:border-r-[2px] checked:after:rotate-45 checked:after:box-border cursor-pointer",
  },
  /** Neon green fill with the SVG tick. Save card. */
  mintCustom: {
    checkboxClass:
      "appearance-none border rounded-[4px] w-4 min-w-4 h-4 min-h-4 shrink-0 cursor-pointer outline-none focus:outline-none focus:ring-0 box-border bg-white border-[#D0D5DD] checked:accent-[#07f468] checked:bg-[#07f468] checked:border-[#07f468] checked:relative checked:after:content-[''] checked:after:absolute checked:after:left-1/2 checked:after:top-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:rotate-45 checked:after:box-border checked:after:w-1 checked:after:h-2 checked:after:border-[2px] checked:after:border-black checked:after:border-t-0 checked:after:border-l-0 checked:after:border-solid",
  },
  /** Neon green fill, centered check icon. Verified fan. */
  mintIcon: {
    checkboxClass:
      "appearance-none border rounded-[4px] w-4 min-w-4 h-4 min-h-4 shrink-0 cursor-pointer outline-none focus:outline-none focus:ring-0 box-border bg-white border-[#D0D5DD] checked:bg-[#07f468] checked:border-[#07f468] checked:accent-[#07f468] checked:[background-image:url('/dev/cdn/remote/plan-check.svg')] checked:[background-position:center] checked:[background-repeat:no-repeat] checked:[background-size:55%]",
  },
  /** Black fill, SVG tick. Media filter. */
  filterBlack: {
    checkboxClass:
      'h-4 w-4 box-border appearance-none [-webkit-appearance:none] bg-white border border-gray-300 rounded-[4px] checked:bg-black checked:border-black before:!hidden after:!hidden',
  },
  /** Booking checkbox, white tick, 16px. Instant booking and fan recording. */
  booking: {
    checkboxClass:
      "m-0 border border-gray-300 [appearance:none] w-4 h-4 rounded bg-white relative cursor-pointer outline-none focus:outline-none checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-[0.3rem] checked:[&::after]:top-[0.15rem] checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45",
  },
  /** Smaller booking checkbox, white tick. Disable chat. */
  bookingSmall: {
    checkboxClass:
      "m-0 border border-checkboxBorder [appearance:none] w-[0.75rem] h-[0.75rem] rounded bg-transparent relative cursor-pointer checked:bg-checkbox checked:border-checkbox checked:[&::after]:content-[''] checked:[&::after]:absolute checked:[&::after]:left-1/2 checked:[&::after]:top-1/2 checked:[&::after]:-translate-x-1/2 checked:[&::after]:-translate-y-1/2 checked:[&::after]:w-[0.25rem] checked:[&::after]:h-[0.5rem] checked:[&::after]:border checked:[&::after]:border-solid checked:[&::after]:border-white checked:[&::after]:border-r-[2px] checked:[&::after]:border-b-[2px] checked:[&::after]:border-t-0 checked:[&::after]:border-l-0 checked:[&::after]:rotate-45",
  },
  /** Pink fill + centered white SVG tick. SubscriptionCard feature list (always checked, decorative). */
  subscriptionFeature: {
    checkboxClass:
      'h-4 w-4 box-border appearance-none [-webkit-appearance:none] rounded-[4px] cursor-default bg-[#FF0066] border border-[#FF0066] checked:bg-[#FF0066] checked:border-[#FF0066] before:!hidden after:!hidden',
    labelClass: 'text-base text-white',
    wrapperClass: 'flex items-center gap-4 pointer-events-none cursor-default',
    customCheckMark: true,
    tickStroke: '#FFFFFF',
  },
};

export default {
  name: 'CheckboxGroup',
  props: {
    modelValue: { type: Boolean, default: false },
    label: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    /** Named Tailwind bundle — see checkboxGroupThemes */
    theme: { type: String, default: '' },
    checkboxClass: { type: String, default: '' },
    labelClass: { type: String, default: '' },
    wrapperClass: { type: String, default: '' },
    tags: { type: Array, default: () => [] },
    metaText: { type: String, default: '' },
    midImg: { type: String, default: '' },
    checkboxStyle: { type: [Object, String], default: () => ({}) },
    /** Figma black rounded tick overlay inside the box */
    customCheckMark: { type: Boolean, default: false },
    /** SVG tick stroke when customCheckMark is on (overrides theme) */
    tickStroke: { type: String, default: '' },
  },
  emits: ['update:modelValue'],
  computed: {
    themeBundle() {
      return checkboxGroupThemes[this.theme] || null;
    },
    showCustomCheckMark() {
      return this.customCheckMark || !!this.themeBundle?.customCheckMark;
    },
    resolvedTickStroke() {
      return this.tickStroke || this.themeBundle?.tickStroke || '#000000';
    },
    resolvedCheckboxClass() {
      return this.checkboxClass || this.themeBundle?.checkboxClass || '';
    },
    resolvedLabelClass() {
      return this.labelClass || this.themeBundle?.labelClass || '';
    },
    resolvedWrapperClass() {
      return this.wrapperClass || this.themeBundle?.wrapperClass || '';
    },
    isStartAlign() {
      return String(this.resolvedWrapperClass || '').includes('items-start');
    },
    hasExplicitSize() {
      return /\b(h-|w-|size-|min-h-|min-w-)/.test(String(this.resolvedCheckboxClass || ''));
    },
    inputClass() {
      const sizeFallback = this.hasExplicitSize ? '' : 'h-4 w-4';
      if (this.showCustomCheckMark) {
        return [
          'relative m-0 box-border cursor-pointer appearance-none [-webkit-appearance:none] outline-none focus:outline-none focus:ring-0 before:!hidden after:!hidden',
          sizeFallback,
          this.resolvedCheckboxClass,
        ];
      }
      return [
        'm-0 box-border shrink-0 outline-none focus:outline-none focus:ring-0',
        sizeFallback,
        this.resolvedCheckboxClass ? 'appearance-none' : '',
        this.isStartAlign ? 'self-start' : 'self-center',
        this.resolvedCheckboxClass,
      ];
    },
    /** Optional caller overrides only — no forced px sizes (themes own size via Tailwind). */
    resolvedInputStyle() {
      if (!this.checkboxStyle) return undefined;
      if (typeof this.checkboxStyle === 'string') {
        return this.checkboxStyle || undefined;
      }
      return Object.keys(this.checkboxStyle).length ? this.checkboxStyle : undefined;
    },
    labelSpanClass() {
      const hasTruncate = String(this.resolvedLabelClass || '').includes('truncate');
      return [
        this.resolvedLabelClass,
        this.isStartAlign
          ? 'min-w-0 m-0 p-0 leading-4'
          : hasTruncate
            ? 'min-w-0'
            : 'inline-flex min-w-0 flex-wrap items-center gap-x-1',
      ];
    },
  },
};
</script>
