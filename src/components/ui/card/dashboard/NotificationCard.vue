<template>
  <transition name="fade" mode="out-in">
    <div
      v-if="isOpen"
      class="w-full flex relative"
      :class="resolvedRootClass"
    >
      <!-- Left border color -->
      <div class="toast-border w-[0.188rem] absolute h-full left-0 top-0" :class="resolvedLeftBorderClass" />

      <!-- Card body -->
      <div class="dashboard-toast-inner-wrapper flex gap-4 py-3 px-2 flex-1 min-w-0 min-h-0"
        :class="[variantConfig.bgClass, resolvedWrapperClass]">
        <div class="dashboard-toast-inner-container relative w-full flex gap-5"
          :class="isSingleLineContent ? 'items-center' : 'items-start'">
          <!-- Close button -->
          <button
            v-if="closable"
            type="button"
            class="absolute right-0 px-3 cursor-pointer border-0 bg-transparent p-0"
            :class="resolvedCloseButtonClass"
            aria-label="Close"
            @click="handleClose"
          >
            <div class="flex items-center justify-center" :class="resolvedCloseWrapperClass">
              <img
                v-if="closeIconUrl"
                :src="closeIconUrl"
                alt=""
                class="h-full w-full"
                :class="resolvedCloseIconClass"
              >
              <svg
                v-else
                class="h-4 w-4 text-[#98A2B3]"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M12 4 4 12M4 4l8 8"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </div>
          </button>

          <!-- Tip limit: full custom body (alert + title + action) -->
          <template v-if="isTipLimitBody">
            <div class="relative w-full flex gap-4">
              <div class="relative">
                <img
                  v-if="resolvedAlertSrc"
                  :src="resolvedAlertSrc"
                  :alt="alertAlt"
                  class="h-10"
                />
              </div>
              <div class="flex flex-col w-full">
                <p class="text-sm font-semibold text-[#ff4405]">{{ title }}</p>
                <div v-if="actionLabel" class="flex justify-end items-end w-full">
                  <DashboardPrimaryButton
                    :text="actionLabel"
                    theme="tipLimitAction"
                    :right-icon="resolvedChevronSrc"
                    :wrapper-overrides="[
                      { target: 'wrapper1', addClass: '!contents' },
                      { target: 'wrapper2', addClass: '!contents' },
                    ]"
                    @click="onAction"
                  />
                </div>
              </div>
            </div>
          </template>

          <template v-else>
            <!-- Icon -->
            <div v-if="showIconComputed" class="relative">
              <slot name="icon">
                <!-- Tip success: circular avatar + tip badge -->
                <div
                  v-if="isTipSuccessIcon"
                  class="w-10 h-10 relative rounded-full bg-cover bg-center"
                  :style="tipAvatarStyle"
                >
                  <div class="absolute -bottom-2 -right-2 w-[1.375rem] h-[1.375rem] flex justify-center items-center">
                    <img
                      v-if="resolvedBadgeSrc"
                      :src="resolvedBadgeSrc"
                      :alt="badgeAlt"
                      class="w-[1.375rem]"
                    />
                  </div>
                </div>

                <div
                  v-else
                  class="toast-icon-container w-10 h-10 flex justify-center items-center rounded-lg"
                  :class="resolvedIconBgClass"
                >
                  <component v-if="icon && typeof icon !== 'string'" :is="icon" :class="[resolvedIconClass, variantConfig.iconStrokeClass]" />
                  <img v-else-if="icon" :src="icon" :class="resolvedIconClass" />
                  <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" fill="none" :class="[resolvedIconClass, variantConfig.iconStrokeClass]">
                    <path
                      d="M25.666 24.5V22.167c0-2.175-1.487-4.002-3.5-4.52M18.083 3.839A4.666 4.666 0 0 1 21 8.167a4.667 4.667 0 0 1-2.917 4.327M19.833 24.5c0-2.174 0-3.262-.355-4.12a4.666 4.666 0 0 0-2.526-2.525c-.858-.355-1.945-.355-4.12-.355H9.333c-2.174 0-3.262 0-4.12.355A4.666 4.666 0 0 0 2.688 20.38C2.333 21.238 2.333 22.326 2.333 24.5M15.75 8.167a4.667 4.667 0 1 1-9.334 0 4.667 4.667 0 0 1 9.334 0Z"
                      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>

                  <!-- Badge Icon -->
                  <div v-if="badgeIcon"
                    class="absolute -bottom-2.5 -right-2.5 w-22 h-22 flex justify-center items-center rounded-lg"
                    :class="variantConfig.badgeBgClass">
                    <component v-if="badgeIcon && typeof badgeIcon !== 'string'" :is="badgeIcon" class="h-4 text-white" />
                    <img v-else :src="badgeIcon" class="w-[16px] h-[16px] [filter:brightness(0)_saturate(100%)_invert(99%)_sepia(99%)_saturate(0)_hue-rotate(176deg)_brightness(97%)_contrast(100%)]" />
                  </div>
                </div>
              </slot>
            </div>

            <!-- Content -->
            <div class="flex flex-col flex-1 min-w-0 min-h-0 pr-[1.125rem] md:pr-0"
              :class="isSingleLineContent ? 'justify-center' : ''">
              <div v-if="title" class="flex flex-col gap-2" :class="hasDescription ? 'pb-2' : ''">
                <div class="flex justify-between items-center pr-1" :class="hasDescription ? 'pt-1' : ''">
                  <span v-if="title" class="toast-heading text-sm min-w-0 break-words whitespace-normal" :class="resolvedTitleClass">{{ title
                  }}</span>
                  <slot name="title" />
                </div>
              </div>
              <div
                v-if="hasBodyContent"
                class="w-full"
                :class="isStackBody
                  ? 'flex flex-col gap-2 py-1'
                  : ['flex gap-4', description ? 'justify-between items-center' : 'items-start']"
              >
                <Paragraph
                  v-if="description"
                  theme="custom"
                  no-wrap
                  :add-class="resolvedDescriptionClass"
                  :text="description"
                />
                <slot />

                <a v-if="linkHref && linkLabel" :href="linkHref" class="flex gap-0.5 items-center"
                  @click.prevent="onLink">
                  <span class="toast-link text-xs font-medium whitespace-nowrap" :class="variantConfig.linkTextClass">{{
                    linkLabel }}</span>
                </a>
                <slot name="actions" />
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref, useSlots, watch } from "vue";
import { useAssetUrl } from "@/composables/useAssetUrl.js";
import Paragraph from "@/components/ui/typography/Paragraph.vue";
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue";

const slots = useSlots();

const { url: closeIconUrl } = useAssetUrl("icon.notification.close");
const { url: defaultTipAvatarUrl } = useAssetUrl("icon.notification.tipAvatar");
const { url: defaultTipBadgeUrl } = useAssetUrl("icon.notification.tipBadge");
const { url: defaultAlertIconUrl } = useAssetUrl("icon.notification.alertIcon");
const { url: defaultChevronUrl } = useAssetUrl("icon.notification.chevronLeft");

/** Named look bundles — call sites pass theme="…" like CheckboxGroup. */
const notificationCardThemes = {
  /** PayoutProcessingStatus — single failed payout hero. */
  payoutFail: {
    titleClass: "text-lg font-medium text-[#FF4405] md:text-2xl dark:text-[#ff571e]",
    descriptionClass: "text-xs leading-normal text-black md:text-sm dark:text-[#e8e6e3]",
    bodyLayout: "stack",
  },
  /** TipStep1 — tip sent success (tokens / cash). */
  tipSuccess: {
    leftBorderClass: "bg-[#07F468]",
    titleClass: "font-semibold text-[#107569]",
    iconPreset: "tipAvatar",
  },
  /** TipStep2 — max tip / top-up limit exceeded. */
  tipLimit: {
    showIcon: false,
    bodyLayout: "tipLimit",
  },
  /** AuthLayout — signed-out banner on /log-in (Figma dark info). */
  authSignedOut: {
    rootClass: "self-stretch min-h-16 border-b-[0.50px] border-slate-700",
    leftBorderClass: "bg-cyan-400 w-[3px]",
    bgClass: "bg-gradient-to-r from-black/0 to-black/90 !gap-4",
    titleClass: "text-cyan-400 text-sm font-semibold leading-5",
    iconBgClass: "bg-cyan-400/10",
    closeIconClass:
      "[filter:brightness(0)_saturate(100%)_invert(98%)_sepia(1%)_saturate(221%)_hue-rotate(201deg)_brightness(116%)_contrast(96%)]",
  },
  /** PlanPage — upgrade limit warning under tier carousel (alert / orange). */
  planUpgrade: {
    showIcon: false,
    bodyLayout: "stack",
    titleClass: "text-sm font-semibold text-[#B54708]",
    descriptionClass: "text-sm text-[#000] pr-5",
  },
  /** PlanPage — tier published / updated-and-published toast (success-teal). */
  planTierToast: {
    bodyLayout: "stack",
    wrapperClass: "!py-[12px] !px-[8px] !gap-3 !items-center",
    titleClass: "text-sm font-semibold text-teal-700 pr-8",
    descriptionClass: "text-sm text-[#0F172A] pr-5",
    closeButtonClass: "absolute right-0 top-2 px-3 cursor-pointer z-[1]",
    closeWrapperClass: "h-4 w-4 flex items-center justify-center",
    closeIconClass:
      "[filter:brightness(0)_saturate(100%)_invert(45%)_sepia(7%)_saturate(500%)_hue-rotate(182deg)_brightness(95%)_contrast(90%)]",
  },
  /** Merch gallery — over-limit warning (alert). */
  merchGalleryAlert: {
    rootClass: "!min-h-16 w-full !rounded-none !border-b-0",
    wrapperClass: "!gap-4 !px-4",
    titleClass: "text-sm font-semibold text-[#B54708]",
    iconClass:
      "h-[21px] w-[21px] object-contain [filter:brightness(0)_saturate(100%)_invert(32%)_sepia(84%)_saturate(1456%)_hue-rotate(6deg)_brightness(94%)_contrast(92%)]",
    closeButtonClass: "absolute right-0 top-2 px-3 cursor-pointer",
    closeWrapperClass: "h-4 w-4 flex items-center justify-center",
  },
  /** Merch gallery — post-upload approval notice (success/notice). */
  merchGalleryNotice: {
    rootClass: "!min-h-16 w-full !rounded-none !border-b-0",
    wrapperClass: "!gap-4 !px-4",
    iconClass: "h-[21px] w-[21px] object-contain",
    closeButtonClass: "absolute right-0 top-2 px-3 cursor-pointer",
    closeWrapperClass: "h-4 w-4 flex items-center justify-center",
  },
  /** Merch publish — in pre-order period banner (notice + stop CTA). */
  merchPreorderNotice: {
    rootClass: "!min-h-16 w-full !rounded-none !border-b-0",
    wrapperClass: "!gap-4 !px-4 !items-center",
    leftBorderClass: "bg-[#22CCEE] z-[1] w-[3px]",
    titleClass: "text-sm font-semibold text-[#088AB2]",
    iconBgClass: "bg-[rgba(34,204,238,0.1)]",
    iconClass:
      "h-[21px] w-[21px] object-contain [filter:brightness(0)_saturate(100%)_invert(64%)_sepia(72%)_saturate(1497%)_hue-rotate(149deg)_brightness(97%)_contrast(95%)]",
  },
};

const props = defineProps({
  variant: {
    type: String,
    default: "notice",
    validator: (value) => ["notice", "alert", "success", "error", "info", "warning", "limit-exceeded", "success-teal"].includes(value),
  },
  /** Named title / description / body bundle — see notificationCardThemes */
  theme: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  linkLabel: {
    type: String,
    default: "",
  },
  linkHref: {
    type: String,
    default: "",
  },
  /** Tip limit CTA label (theme="tipLimit") */
  actionLabel: {
    type: String,
    default: "",
  },
  /** Tip success avatar image URL (falls back to asset map) */
  avatarSrc: {
    type: String,
    default: "",
  },
  /** Tip success badge image URL (falls back to asset map / badgeIcon) */
  badgeSrc: {
    type: String,
    default: "",
  },
  /** Tip limit alert icon URL (falls back to asset map) */
  alertSrc: {
    type: String,
    default: "",
  },
  badgeAlt: {
    type: String,
    default: "",
  },
  alertAlt: {
    type: String,
    default: "",
  },
  // Optional override for the left accent border color class (falls back to variant)
  leftBorderClass: {
    type: String,
    default: "",
  },
  // Optional override for the title text color class (falls back to variant)
  titleClass: {
    type: String,
    default: "",
  },
  // Optional override for the description text color class (falls back to variant)
  descriptionClass: {
    type: String,
    default: "",
  },
  icon: {
    type: [Object, Function, String],
  },
  badgeIcon: {
    type: [Object, Function, String],
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
  closable: {
    type: Boolean,
    default: true,
  },
  modelValue: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue", "close", "link", "action"]);

// Local open state to support both controlled and uncontrolled usages
const isOpen = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => {
    isOpen.value = v;
  }
);
watch(isOpen, (v) => emit("update:modelValue", v));

const themeBundle = computed(() => notificationCardThemes[props.theme] || null);

const isTipLimitBody = computed(() => themeBundle.value?.bodyLayout === "tipLimit");
const isTipSuccessIcon = computed(() => themeBundle.value?.iconPreset === "tipAvatar");
const isStackBody = computed(() => themeBundle.value?.bodyLayout === "stack");

const showIconComputed = computed(() => {
  if (props.showIcon === false) return false;
  if (themeBundle.value?.showIcon === false) return false;
  return true;
});

const hasTitle = computed(() => Boolean(props.title));
const hasDescription = computed(() => Boolean(props.description));
const hasBodyContent = computed(
  () =>
    hasDescription.value
    || Boolean(props.linkHref && props.linkLabel)
    || Boolean(slots.default)
    || Boolean(slots.actions),
);
/** Title-only toasts (e.g. merch submitted) center icon + text vertically. */
const isSingleLineContent = computed(() => {
  if (isTipLimitBody.value) return false;
  if (hasTitle.value && !hasDescription.value && !hasBodyContent.value) return true;
  if (isStackBody.value) return false;
  return hasTitle.value !== hasDescription.value;
});

const resolvedRootClass = computed(
  () => themeBundle.value?.rootClass || "border-b border-[#E5E7EB]",
);
const resolvedLeftBorderClass = computed(
  () => props.leftBorderClass || themeBundle.value?.leftBorderClass || variantConfig.value.leftBorderClass,
);
const resolvedTitleClass = computed(
  () => props.titleClass || themeBundle.value?.titleClass || variantConfig.value.titleTextClass,
);
const resolvedDescriptionClass = computed(
  () =>
    props.descriptionClass ||
    themeBundle.value?.descriptionClass ||
    `text-sm flex-1 [text-shadow:0_0_10px_rgba(0,0,0,0.10)] pr-5 ${variantConfig.value.descriptionTextClass}`,
);
const resolvedIconBgClass = computed(
  () => themeBundle.value?.iconBgClass || variantConfig.value.iconBgClass,
);
const resolvedIconClass = computed(
  () => themeBundle.value?.iconClass || "h-7 w-7",
);
const resolvedWrapperClass = computed(() => themeBundle.value?.wrapperClass || "");
const resolvedCloseButtonClass = computed(() => {
  if (themeBundle.value?.closeButtonClass) return themeBundle.value.closeButtonClass;
  return "absolute right-0 top-2 px-3 cursor-pointer";
});
const resolvedCloseWrapperClass = computed(
  () => themeBundle.value?.closeWrapperClass || "h-6 w-6 flex items-center justify-center",
);
const resolvedCloseIconClass = computed(
  () =>
    themeBundle.value?.closeIconClass ||
    "[filter:brightness(0)_saturate(100%)_invert(92%)_sepia(5%)_saturate(392%)_hue-rotate(182deg)_brightness(94%)_contrast(92%)]",
);

const resolvedAvatarSrc = computed(() => props.avatarSrc || defaultTipAvatarUrl.value || "");
const resolvedBadgeSrc = computed(() => {
  if (props.badgeSrc) return props.badgeSrc;
  if (typeof props.badgeIcon === "string" && props.badgeIcon) return props.badgeIcon;
  return defaultTipBadgeUrl.value || "";
});
const resolvedAlertSrc = computed(() => props.alertSrc || defaultAlertIconUrl.value || "");
const resolvedChevronSrc = computed(() => defaultChevronUrl.value || "");

const tipAvatarStyle = computed(() => {
  const src = resolvedAvatarSrc.value;
  return src ? { backgroundImage: `url('${src}')` } : {};
});

const palettes = {
  notice: {
    left: "bg-[#22CCEE]",
    bg: "[background:linear-gradient(0deg,rgba(255,255,255,0.9),rgba(255,255,255))] before:absolute before:content-[''] before:top-0 before:left-0 before:w-full before:h-full before:bg-gradient-to-r before:from-[rgba(46,211,183,0.15)] before:to-[rgba(255,255,255,0.9)] relative",
    title: "text-[#088AB2] font-semibold",
    description: "text-[#0F172A]",
    link: "text-[#22CCEE] ",
    iconBg: "bg-[rgba(34,204,238,0.1)]",
    iconStroke: "stroke-[#22CCEE] text-[#22CCEE]",
    badgeBg: "bg-[#22CCEE]",
  },
  alert: {
    left: "bg-[#FDB022]",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(253,176,34,0.15)_0,rgba(253,176,34,0.15)_100%),rgba(255,255,255,0.9)] ",
    title: "text-[#B54708] font-semibold",
    description: "text-[#0F172A]",
    link: "text-[#FDB022]",
    iconBg: "bg-[rgba(253,176,34,0.15)]",
    iconStroke: "stroke-[#FDB022] text-[#FDB022]",
  },
  success: {
    left: "bg-[#07f468]",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(7,244,104,0.15)_0,rgba(7,244,104,0.15)_100%),rgba(255,255,255,0.9)]",
    title: "text-[#07f468] ",
    description: "text-[#0F172A]",
    link: "text-[#07f468] ",
    iconBg: "bg-[rgba(7,244,104,0.15)]",
    iconStroke: " text-[#07f468]",
  },
  "success-teal": {
    left: "bg-teal-400",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(45,212,191,0.15)_0,rgba(45,212,191,0.15)_100%),rgba(255,255,255,0.9)]",
    title: "text-teal-700 font-semibold",
    description: "text-[#0F172A]",
    link: "text-teal-400",
    iconBg: "bg-teal-400/10",
    iconStroke: "text-teal-400 stroke-teal-400",
  },
  error: {
    left: "bg-[#FF4405] ",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(255,68,5,0.12)_0,rgba(255,68,5,0.12)_100%),rgba(255,255,255,0.9)] ",
    title: "text-[#FF4405] ",
    description: "text-[#0F172A]",
    link: "text-[#FF4405] ",
    iconBg: "bg-[rgba(255,68,5,0.12)]",
    iconStroke: "stroke-[#FF4405] text-[#FF4405]",
  },
  warning: {
    left: "bg-[#FF4405] ",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(255,68,5,0.10)_0,rgba(255,68,5,0.10)_100%),rgba(255,255,255,0.9)] ",
    title: "text-[#FF4405] ",
    description: "text-[#0F172A]",
    link: "text-[#FF4405] ",
    iconBg: "bg-[rgba(255,68,5,0.10)]",
    iconStroke: " text-[#FF4405]",
  },
  info: {
    left: "bg-[#3B82F6]",
    bg: "[background:linear-gradient(90deg,rgba(255,255,255,0)_0,rgba(255,255,255,0.9)_100%),linear-gradient(0deg,rgba(59,130,246,0.12)_0,rgba(59,130,246,0.12)_100%),rgba(255,255,255,0.9)] ",
    title: "text-[#3B82F6]",
    description: "text-[#0F172A]",
    link: "text-[#3B82F6]",
    iconBg: "bg-[rgba(59,130,246,0.12)]",
    iconStroke: "stroke-[#3B82F6] text-[#3B82F6]",
  },
  "limit-exceeded": {
    left: "bg-[#FF4405]",
    bg: " bg-[#242424] [background:linear-gradient(0deg,rgba(255,68,5,0.3),rgba(255,68,5,0.3)),linear-gradient(90deg,rgba(0,0,0,0)0%,rgba(0,0,0,0.9)100%)] before:absolute before:content-[''] before:top-0 before:left-0 before:w-full before:h-full before:bg-[linear-gradient(90deg,rgba(0,0,0,0)0%,rgba(0,0,0,0.9)100%)]",
    title: "text-[#FF4405] text-sm font-semibold",
    description: "text-[#F2F4F7]",
    link: "text-[#FF4405] text-xs font-medium",
    iconBg: "bg-transparent",
    iconStroke: "stroke-[#FF4405] text-[#FF4405]",
  },
};

const variantConfig = computed(() => {
  const p = palettes[props.variant];
  const theme = themeBundle.value;
  return {
    leftBorderClass: p.left,
    bgClass: theme?.bgClass || p.bg,
    titleTextClass: p.title,
    descriptionTextClass: p.description,
    linkTextClass: p.link,
    iconBgClass: p.iconBg,
    iconStrokeClass: p.iconStroke,
    badgeBgClass: p.badgeBg,
    closeColor: "#D0D5DD",
  };
});

function handleClose() {
  isOpen.value = false;
  emit("close");
}

function onLink() {
  emit("link");
}

function onAction() {
  emit("action");
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
