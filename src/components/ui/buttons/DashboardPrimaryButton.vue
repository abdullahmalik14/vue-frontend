<template>
  <div v-bind="resolvedAttrs.wrapperAttrs.wrapper1">
    <div v-bind="resolvedAttrs.wrapperAttrs.wrapper2">
      <button :type="type" v-bind="resolvedAttrs.inputAttrs" :disabled="disabled || loading" :aria-busy="loading || undefined" :class="loading ? '[&:disabled]:opacity-100' : ''" @click="handleClick">
        <span class="inline-grid [grid-template-areas:'stack'] place-items-center justify-items-center gap-[inherit] pointer-events-none min-h-[1em]">
          <span
            class="[grid-area:stack] inline-flex items-center justify-center gap-[inherit]"
            :class="loading ? 'invisible' : ''"
            aria-hidden="true"
          >
            <slot name="leftIcon">
              <img v-if="leftIcon" :src="leftIcon" :class="` inline-block ${resolvedLeftIconClass}`" />
            </slot>

            <span :class="resolvedTextClass">{{ text }}</span>

            <slot name="rightIcon">
              <span v-if="rightBadge" :class="rightBadgeClass || ''">{{ rightBadge }}</span>
              <img v-if="rightIcon" :src="rightIcon" :class="` inline-block ${resolvedRightIconClass}`" />
            </slot>
          </span>
          <span
            v-if="loading"
            class="[grid-area:stack] relative z-20 inline-flex items-center justify-center pointer-events-none"
          >
            <LoadingSpinner
              v-bind="loadingSpinnerBindings"
            >
              <template v-if="$slots.loadingSpinner" #spinner>
                <slot name="loadingSpinner" />
              </template>
            </LoadingSpinner>
          </span>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { resolveAllConfigs } from "@/utils/componentRenderingUtils";
import LoadingSpinner from "@/components/ui/spinners/LoadingSpinner.vue";

const emit = defineEmits(["click"]);

const handleClick = (event) => {
  if (props.loading) return;
  emit("click", event);
};

/** Named style bundles — call sites pass theme="…" like CheckboxGroup. */
const dashboardPrimaryButtonThemes = {
  /** PayoutProcessingStatus — failed payout CTA. */
  payoutFail: {
    variant: "none",
    rightIconClass:
      "w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(5%)_saturate(7497%)_hue-rotate(193deg)_brightness(114%)_contrast(105%)]",
    textClass: "text-sm font-medium tracking-[0.021875rem] text-white dark:text-[#e8e6e3]",
    customClass:
      "flex justify-center items-center gap-2.5 w-max p-2 bg-[#FF4405] enabled:hover:bg-[#FF4405]/80 dark:bg-[#c93300] dark:enabled:hover:bg-[#c93300]/80",
  },
  /** TipStep2 — set tip / top-up amount to max. */
  tipLimitAction: {
    variant: "none",
    rightIconClass:
      "w-4 h-4 rotate-180 [filter:brightness(0)_saturate(100%)_invert(36%)_sepia(97%)_saturate(2876%)_hue-rotate(355deg)_brightness(99%)_contrast(105%)]",
    textClass: "text-xs leading-normal font-medium text-[#ff4405]",
    customClass: "flex items-center gap-1 p-0 bg-transparent outline-none border-none cursor-pointer",
  },
  /** Cart.vue — SYNC LIVE */
  cartSyncLive: {
    variant: "none",
    textClass: "text-[0.625rem] text-inherit font-medium",
    customClass:
      "text-[0.625rem] text-[#07F468] hover:text-white transition-colors flex items-center gap-1 bg-transparent border-none outline-none cursor-pointer p-0",
  },
  /** Cart.vue — SAVE (rename) */
  cartSave: {
    variant: "none",
    textClass: "text-[0.625rem] font-bold text-inherit",
    customClass:
      "px-3 h-8 shrink-0 bg-[#07F468]/10 border border-[#07F468]/30 rounded text-[0.625rem] text-[#07F468] font-bold hover:bg-[#07F468] hover:text-black transition-all cursor-pointer",
  },
  /** Cart.vue — APPLY coupon */
  cartApply: {
    variant: "none",
    textClass: "text-[0.625rem] font-bold text-inherit",
    customClass:
      "px-3 h-8 shrink-0 bg-white/10 border border-white/20 rounded text-[0.625rem] text-white font-bold hover:bg-white hover:text-black transition-all cursor-pointer",
  },
  /** Cart.vue — REMOVE coupon */
  cartRemove: {
    variant: "none",
    textClass: "text-[0.625rem] font-bold text-inherit",
    customClass:
      "px-3 h-8 shrink-0 bg-red-500/10 border border-red-500/30 rounded text-[0.625rem] text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all cursor-pointer",
  },
  /** Cart.vue — empty-state primary quick add */
  cartAddPrimary: {
    variant: "none",
    textClass: "text-xs font-bold text-inherit",
    customClass:
      "w-full px-4 py-2 bg-[#07F468] text-black text-xs font-bold rounded hover:opacity-90 transition-all cursor-pointer",
  },
  /** Cart.vue — empty-state secondary quick add */
  cartAddSecondary: {
    variant: "none",
    textClass: "text-xs font-bold text-inherit",
    customClass:
      "w-full px-4 py-2 bg-white/10 border border-white/20 text-white text-xs font-bold rounded hover:bg-white/20 transition-all cursor-pointer",
  },
  /** CartTypeToggle — selected */
  cartTypeActive: {
    variant: "none",
    textClass: "text-[0.625rem] font-bold tracking-wider text-[#07F468]",
    customClass:
      "px-3 py-1.5 rounded border border-[#07F468]/50 bg-[#07F468]/10 cursor-pointer",
  },
  /** CartTypeToggle — unselected */
  cartTypeInactive: {
    variant: "none",
    textClass: "text-[0.625rem] font-bold tracking-wider text-white/50",
    customClass:
      "px-3 py-1.5 rounded border border-white/20 bg-transparent cursor-pointer hover:border-white/40",
  },
  /** Cart.vue — checkout CTA */
  cartCheckout: {
    variant: "bgGreen",
    rightIconClass:
      "w-6 h-6 transition duration-200 filter brightness-0 invert-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]",
  },
  settingsBack: {
    variant: "none",
    leftIconClass: "w-4 h-4",
    textClass: "text-lg font-medium text-[#344054] dark:text-[#bdb7af]",
    customClass: "flex items-center gap-2 bg-transparent outline-none cursor-pointer",
  },
  settingsCancel: {
    variant: "none",
    textClass: "text-base font-medium text-[#0C111D] md:text-lg dark:text-[#dbd8d3]",
    customClass: "flex justify-center items-center",
  },
  settingsSave: {
    variant: "none",
    textClass: "text-base font-medium text-[#07F468] md:text-lg dark:text-[#23f97b]",
    customClass:
      "flex justify-center items-center px-4 py-1 bg-black md:px-[1.3125rem] md:py-1.5 dark:bg-[#181a1b]",
  },
  planAddDiscount: {
    variant: "none",
    leftIconClass: "w-5 h-5",
    customClass:
      "!min-w-0 h-auto px-0 py-0 bg-transparent border-none outline-none flex items-center gap-0.5 text-sm font-medium uppercase text-[#155EEF] dark:text-[#2c8df1]",
  },
  payoutBalanceWithdraw: {
    variant: "none",
    leftIconClass:
      "w-6 h-6 [filter:brightness(0)_saturate(100%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(73%)_sepia(24%)_saturate(6026%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]",
    textClass: "text-lg font-medium text-black group-hover:text-[#07F468]",
    customClass:
      "group flex justify-center items-center gap-2.5 pl-2 pr-[23.63px] min-h-[2.5rem] [clip-path:polygon(calc(100%-15.63px)_0%,100%_100%,0%_100%,0%_0%)] bg-[#07F468] enabled:hover:bg-black",
  },
  payoutSettingsSave: {
    variant: "none",
    leftIconClass:
      "w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(53%)_sepia(97%)_saturate(459%)_hue-rotate(93deg)_brightness(114%)_contrast(94%)] group-hover/button:[filter:brightness(0)_saturate(100%)]",
    textClass:
      "text-lg font-medium text-[#07F468] group-hover/button:text-black dark:text-[#23f97b] dark:group-hover/button:text-[#e8e6e3]",
    customClass:
      "flex items-center gap-2.5 pl-[1.48rem] pr-2 h-10 shadow-[0px_0px_16px_0px_#FFFFFF80] [clip-path:polygon(100%_0%,100%_100%,0%_100%,0.98rem_0%)] bg-black group/button hover:bg-[#07F468] dark:bg-[#181a1b] dark:hover:bg-[#06c454]",
  },
  cosmoManageCard: {
    variant: "none",
    customClass:
      "group inline-flex min-h-[46px] w-max cursor-pointer items-center justify-center gap-[9px] rounded-xl border-none bg-black px-[18px] font-extrabold text-cosmo-mint transition-colors duration-300 enabled:hover:bg-cosmo-mint enabled:hover:text-black",
  },
  cosmoVerification: {
    variant: "none",
    customClass:
      "group inline-flex min-h-[46px] w-max cursor-pointer items-center justify-center gap-[9px] rounded-xl border-none bg-cosmo-mint px-[10px] font-extrabold text-black transition-colors duration-300 enabled:hover:bg-black enabled:hover:text-cosmo-mint",
  },
  checkoutProceed: {
    variant: "checkoutProceedpayment",
    customClass: "drop-shadow-[0_10px_18px_#07F46899]",
  },
  guestAddressCancel: {
    variant: "none",
    customClass:
      "w-[120px] py-1 px-2 flex justify-center items-center border border-[#07F468] bg-black text-sm font-medium text-[#07F468] enabled:hover:bg-[#07F468] enabled:hover:text-black",
  },
  guestAddressUpdate: {
    variant: "none",
    customClass:
      "w-[120px] py-1 px-2 flex justify-center items-center border border-[#07F468] bg-[#07F468] text-sm font-medium text-black enabled:hover:bg-black enabled:hover:text-[#07F468]",
  },
  proceedAgree: {
    variant: "none",
    customClass:
      "flex h-10 w-full items-center justify-center border-none bg-[#07F468] text-[18px] font-[500] text-[#000000] cursor-pointer enabled:hover:bg-black enabled:hover:text-[#07F468]",
  },
  /** CheckoutBeforeTipPopup — Figma Confirm Tip (full-width green; hover = reverse) */
  confirmTip: {
    variant: "none",
    textClass:
      "text-center text-xl font-semibold uppercase leading-8 text-inherit",
    customClass:
      "self-stretch h-16 min-w-20 w-full p-2 bg-[#07F468] text-gray-900 inline-flex justify-center items-center gap-2.5 border-none cursor-pointer enabled:hover:bg-black enabled:hover:text-[#07F468] disabled:opacity-50 disabled:cursor-not-allowed",
  },
  mediaUploadCta: {
    variant: "mediaBtn",
    customClass: "uppercase",
    leftIconClass:
      "w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] group-hover:[filter:brightness(0)]",
  },
  mediaFilterSelectTight: {
    variant: "mediaBtn",
    leftIconClass: "w-4 h-4 object-contain group-hover:brightness-0",
    customClass: "!h-8 !px-2 !gap-2 !text-[14px] !font-medium shrink-0",
  },
  mediaFilterSelectWide: {
    variant: "mediaBtn",
    leftIconClass: "w-4 h-4 object-contain group-hover:brightness-0",
    customClass: "!h-8 !px-3 !gap-2 !text-[14px] !font-medium shrink-0",
  },
  mediaFilterReset: {
    variant: "simpleBtn",
    leftIconClass:
      "w-5 h-5 object-contain mix-blend-multiply group-hover/button:mix-blend-normal group-hover/button:brightness-0 group-hover/button:invert",
    customClass: "!h-10 w-full !px-2 !text-[14px] !font-medium",
  },
  mediaFilterApply: {
    variant: "mediaBtn",
    leftIconClass: "w-5 h-5 object-contain group-hover:brightness-0",
    customClass: "uppercase w-full !text-[14px] !font-medium",
  },
  addTierCancel: {
    variant: "none",
    customClass:
      "w-20 h-10 bg-white text-black flex items-center justify-center text-lg font-medium font-['Poppins'] leading-7",
  },
  addTierSave: {
    variant: "simpleBtn",
    customClass: "!h-10 !w-20 !text-lg !font-medium !font-['Poppins'] !leading-7 rounded-none",
  },
  mediaAddTierPanel: {
    variant: "polygonLeft",
    leftIconClass:
      "w-4 h-4 [filter:invert(72%)_sepia(94%)_saturate(464%)_hue-rotate(85deg)_brightness(101%)_contrast(105%)] group-hover:filter-none",
    customClass: "gap-[2px] text-sm !h-10 flex items-center",
  },
  analyticsRefresh: {
    variant: "none",
    leftIconClass: "w-[.875rem] h-[.875rem] transition-all group-hover:brightness-0 group-hover:invert",
    textClass:
      "text-xs font-sans font-medium leading-[1.125rem] text-light-primary dark:text-dark-primary group-hover:text-white dark:group-hover:text-white transition-colors",
    customClass:
      "group flex items-center justify-center gap-1 pl-[0.9375rem] pr-2 py-1 bg-white border border-gray-200 shadow-sm dark:bg-dark-bg-container dark:border-gray-700 [clip-path:polygon(0_0,100%_0,105%_105%,16%_105%)] rounded-none hover:bg-light-primary dark:hover:bg-dark-primaryHover [outline:none] disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
  },
  analyticsTrend: {
    variant: "none",
    rightIconClass:
      "w-[.875rem] h-[.875rem] transition-all group-hover/button:brightness-0 group-hover/button:invert",
    textClass:
      "text-xs font-sans font-medium leading-[1.125rem] text-light-primary dark:text-dark-primary group-hover/button:text-white transition-colors",
    customClass:
      "pointer-events-auto group/button flex items-center justify-center gap-1 pl-[0.9375rem] pr-2 py-1 bg-transparent [clip-path:polygon(0_0,100%_0,105%_105%,16%_105%)] rounded-none border-none outline-none hover:bg-light-primary dark:hover:bg-dark-primary/10 transition-colors",
  },
  dashProfileEdit: {
    variant: "none",
    rightIconClass: "w-4 h-4",
    textClass: "text-xs leading-normal font-medium text-[#155eef] dark:text-[#2b8cf1]",
    customClass: "inline-flex justify-start items-center gap-0.5 cursor-pointer bg-transparent border-none outline-none p-0",
  },
  quoteRefresh: {
    variant: "none",
    leftIconClass: "w-[.875rem] h-[.875rem]",
    textClass: "text-blue-600 text-xs font-medium font-['Poppins'] leading-4 select-none",
    customClass:
      "group flex items-center justify-center gap-1 !bg-transparent rounded-none border-none outline-none hover:opacity-80 transition-opacity",
  },
  homeNavLogin: {
    variant: "none",
    textClass: "text-lg font-semibold text-[#07F468] dark:text-[#23f97b]",
    customClass: "flex justify-center items-center px-1.5 bg-transparent outline-none border-none cursor-pointer",
  },
  homeNavSignUp: {
    variant: "none",
    textClass:
      "text-lg font-semibold text-[#1D2334] group-hover/button:text-[#07F468] dark:text-[#cfcac4] dark:group-hover/button:text-[#23f97b]",
    customClass:
      "flex justify-center items-center px-[1.375rem] py-1 [clip-path:polygon(0_0,calc(100%-14.6px)_0,100%_100%,14.6px_100%)] bg-[#07F468] group/button hover:bg-[#1D2334] dark:bg-[#0aff78] dark:hover:bg-[#242b40] border-none outline-none cursor-pointer",
  },
  homeCreatorJoin: {
    variant: "none",
    textClass:
      "text-lg font-semibold text-[#1D2334] group-hover/button:text-[#07F468] md:text-xl md:leading-normal dark:text-[#cfcac4] dark:group-hover/button:text-[#23f97b]",
    customClass:
      "flex justify-center items-center w-full px-4 py-2.5 bg-[#07F468] group/button hover:bg-[#1D2334] md:w-max md:h-[3.25rem] md:rounded-r-md dark:bg-[#0aff78] dark:hover:bg-[#242b40] border-none outline-none cursor-pointer",
  },
  homeFanSignUp: {
    variant: "none",
    textClass: "text-xl leading-normal underline text-[#D0D5DD] dark:text-[#cfcac4]",
    customClass:
      "flex justify-center items-center px-2 py-0.5 mx-auto w-max bg-transparent border-none outline-none opacity-95 cursor-pointer",
  },
  homeDitchDesktop: {
    variant: "none",
    textClass:
      "text-xl leading-normal font-semibold text-[#07F468] group-hover/button:text-[#0C111D] dark:text-[#23f97b] dark:group-hover/button:text-[#dbd8d3]",
    customClass:
      "flex justify-center items-center px-4 py-2.5 w-max bg-[#0C111D] group/button hover:bg-[#07F468] dark:bg-[#0a0e17] dark:hover:bg-[#06c454] border-none outline-none cursor-pointer",
  },
  homeDitchMobile: {
    variant: "none",
    textClass:
      "text-lg font-semibold text-[#07F468] group-hover/button:text-[#0C111D] md:text-xl md:leading-normal dark:text-[#23f97b] dark:group-hover/button:text-[#dbd8d3]",
    customClass:
      "flex justify-center items-center px-4 py-2.5 bg-[#0C111D] group/button hover:bg-[#07F468] dark:bg-[#0a0e17] dark:hover:bg-[#06c454] border-none outline-none cursor-pointer",
  },
  faqQuestion: {
    variant: "none",
    rightIconClass: "w-6 h-6 min-w-[1.5rem] transition-transform duration-300",
    textClass:
      "text-base font-semibold text-left text-[#344054] md:text-xl md:leading-normal dark:text-[#bdb8af]",
    customClass:
      "flex justify-between items-center gap-2 w-full outline-none border-none bg-transparent cursor-pointer [&>span]:w-full [&>span>span]:w-full [&>span>span]:justify-between",
  },
  calendarNewEvents: {
    variant: "none",
    leftIconClass: "w-6 h-6 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)]",
    customClass:
      "group w-full h-12 min-h-10 px-4 py-2 text-base font-semibold bg-black rounded-[48px] inline-flex justify-center items-center gap-2 text-[#07F468] hover:text-black hover:bg-[#07F468]",
  },
  bookingAddon: {
    variant: "none",
    leftIconClass:
      "w-3 h-3 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)] rounded-sm outline outline-[1.50px] outline-offset-[-0.75px]",
    customClass:
      "group bg-gray-900 flex justify-center items-center gap-2 min-w-14 px-2 py-1 text-center justify-start text-[#07F468] text-xs font-semibold capitalize tracking-tight hover:text-black hover:bg-[#07F468]",
  },
  xRepostPreviewEdit: {
    variant: "none",
    leftIconClass: "size-3.5 brightness-0 invert",
    customClass:
      "inline-flex h-7 items-center justify-center gap-1 rounded-t-[4px] rounded-b-none bg-[#2E90FA] px-2 text-xs font-medium text-white hover:bg-[#1570EF]",
  },
  xRepostPreviewDiscard: {
    variant: "none",
    leftIconClass: "size-3.5 brightness-0 invert",
    customClass:
      "inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-none bg-[#FF4405] px-2 text-xs font-medium text-white hover:bg-[#ff692e]",
  },
  xRepostPreviewSave: {
    variant: "none",
    leftIconClass: "size-3.5 brightness-0",
    customClass:
      "inline-flex h-7 shrink-0 items-center justify-center gap-1 rounded-none bg-[#07F468] px-2 text-xs font-medium text-black hover:bg-[#06c454]",
  },
  xRepostSaveDraft: {
    variant: "none",
    leftIconClass:
      "w-6 h-6 brightness-0 invert transition duration-200 group-hover:brightness-0 group-hover:invert-0",
    customClass:
      "group w-max flex items-center justify-center gap-1 py-1 pr-[1.4rem] pl-2 bg-black enabled:hover:bg-white text-white enabled:hover:text-black text-sm sm:text-lg leading-7 font-medium transition-colors duration-200 relative enabled:cursor-pointer [clip-path:polygon(0_0,92%_0,100%_105%,0_105%)]",
  },
  xRepostSavePost: {
    variant: "none",
    leftIconClass:
      "w-6 h-6 brightness-0 transition duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(77%)_sepia(61%)_saturate(638%)_hue-rotate(88deg)_brightness(101%)_contrast(92%)]",
    customClass:
      "group w-max flex items-center justify-center gap-1 py-1 pl-[1.4rem] pr-2 bg-[#07f468] enabled:hover:bg-black text-black enabled:hover:text-[#07f468] text-sm sm:text-lg leading-7 font-medium uppercase transition-colors duration-200 relative enabled:cursor-pointer [clip-path:polygon(8%_0,100%_0,105%_105%,0_105%)]",
  },
  /** Plan settings TierCard hover — Publish: green when enabled; grey #98A2B3 when disabled */
  tierHoverPublish: {
    variant: "none",
    leftIconClass:
      "w-6 h-6 shrink-0 brightness-0 transition-[filter] duration-200 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] group-disabled:[filter:brightness(0)_saturate(100%)_invert(77%)_sepia(6%)_saturate(317%)_hue-rotate(179deg)_brightness(93%)_contrast(87%)] group-disabled:group-hover:[filter:brightness(0)_saturate(100%)_invert(77%)_sepia(6%)_saturate(317%)_hue-rotate(179deg)_brightness(93%)_contrast(87%)]",
    textClass: "!text-[18px] !font-medium !normal-case text-inherit",
    customClass:
      "group flex h-10 w-full min-w-0 items-center justify-center gap-2 px-3 rounded-none bg-[#07F468] text-[#0C111D] enabled:hover:bg-black enabled:hover:text-[#07F468] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-100 disabled:bg-[#98A2B380] disabled:text-[#98A2B3] disabled:hover:bg-[#98A2B380] disabled:hover:text-[#98A2B3]",
  },
  /** Plan settings TierCard hover — Add Media (#101828 + green border → reverse) */
  tierHoverAddMedia: {
    variant: "none",
    leftIconClass:
      "w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(6%)_sepia(30%)_saturate(1200%)_hue-rotate(180deg)_brightness(95%)_contrast(95%)]",
    textClass: "!text-[16px] !font-medium !normal-case !tracking-normal text-inherit",
    customClass:
      "group flex h-10 w-full min-w-0 items-center justify-center gap-2 px-3 bg-[#101828] border border-[#07F468] text-[#07F468] enabled:hover:bg-[#07F468] enabled:hover:text-[#0C111D]",
  },
  /** Plan settings TierCard hover — Delete Tier (full width; orange → dark / orange icon+text; instant like Unpublish) */
  tierHoverDelete: {
    variant: "none",
    leftIconClass:
      "w-6 h-6 shrink-0 brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(36%)_sepia(97%)_saturate(2876%)_hue-rotate(355deg)_brightness(99%)_contrast(105%)] group-disabled:[filter:brightness(0)_saturate(100%)_invert(77%)_sepia(6%)_saturate(317%)_hue-rotate(179deg)_brightness(93%)_contrast(87%)] group-disabled:group-hover:[filter:brightness(0)_saturate(100%)_invert(77%)_sepia(6%)_saturate(317%)_hue-rotate(179deg)_brightness(93%)_contrast(87%)]",
    textClass: "!text-[16px] !font-medium !normal-case text-inherit",
    customClass:
      "group !flex !h-10 !w-full !min-w-0 !max-w-none items-center justify-center gap-2 px-3 rounded-none bg-[#FF4405] text-[#0C111D] enabled:hover:bg-[#0C111D] enabled:hover:text-[#FF4405] disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-100 disabled:bg-[#98A2B380] disabled:text-[#98A2B3] disabled:hover:bg-[#98A2B380] disabled:hover:text-[#98A2B3]",
  },
  /** Plan settings TierCard hover — Unpublish (#FDB022 → black / yellow text+icon, full width) */
  tierHoverUnpublish: {
    variant: "none",
    leftIconClass:
      "w-6 h-6 brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(76%)_sepia(48%)_saturate(1200%)_hue-rotate(360deg)_brightness(103%)_contrast(98%)]",
    textClass: "!text-[16px] !font-medium !normal-case text-inherit",
    customClass:
      "group flex h-10 w-full min-w-0 items-center justify-center gap-2 px-3 rounded-none bg-[#FDB022] text-[#0C111D] enabled:hover:bg-[#0C111D] enabled:hover:text-[#FDB022]",
  },
  /** Plan settings TierCard hover — Feature this Tier (purple → white / blue reverse) */
  tierHoverFeature: {
    variant: "none",
    leftIconClass:
      "w-6 h-6 brightness-0 invert group-hover:[filter:brightness(0)_saturate(100%)_invert(18%)_sepia(94%)_saturate(6358%)_hue-rotate(248deg)_brightness(95%)_contrast(112%)]",
    textClass: "!text-[18px] !font-medium text-inherit",
    customClass:
      "group flex h-10 w-full min-w-0 items-center justify-center gap-2 px-3 bg-[#4D20FF] text-white enabled:hover:bg-white enabled:hover:text-[#4D20FF]",
  },
  /** Plan settings TierCard hover — Remove Featured Tag */
  tierHoverUnfeature: {
    variant: "none",
    leftIconClass: "w-6 h-6 brightness-0 invert",
    textClass: "!text-[18px] !font-medium text-white",
    customClass:
      "group flex h-10 w-full min-w-0 items-center justify-center gap-2 px-3 border border-[#4D20FF] bg-black text-white enabled:hover:bg-[#4D20FF]",
  },
  /** PlanConfirmPopup — leave cancel (ghost orange) */
  planConfirmLeaveCancel: {
    variant: "none",
    textClass: "!text-base !font-medium !normal-case text-inherit",
    customClass:
      "flex h-10 items-center justify-center px-3 bg-transparent text-[#FF4405] enabled:hover:bg-[#FF4405] enabled:hover:text-white",
  },
  /** PlanConfirmPopup — leave confirm (solid orange → reverse) */
  planConfirmLeave: {
    variant: "none",
    textClass: "!text-base !font-medium !normal-case text-inherit",
    customClass:
      "flex h-10 items-center justify-center px-4 bg-[#FF4405] text-white enabled:hover:bg-transparent enabled:hover:text-[#FF4405]",
  },
  /** PlanConfirmPopup — draft saved back (ghost cyan) */
  planConfirmBack: {
    variant: "none",
    textClass: "!text-base !font-medium !normal-case text-inherit",
    customClass:
      "flex h-10 items-center justify-center px-3 bg-transparent text-[#22CCEE] enabled:hover:bg-[#22CCEE] enabled:hover:text-white",
  },
  /** PlanConfirmPopup — draft saved add media (solid cyan → reverse) */
  planConfirmAddMedia: {
    variant: "none",
    textClass: "!text-base !font-medium !normal-case text-inherit",
    customClass:
      "flex h-10 items-center justify-center px-4 bg-[#22CCEE] text-white enabled:hover:bg-transparent enabled:hover:text-[#22CCEE]",
  },
};

const props = defineProps({
  text: { type: String, required: true },

  variant: {
    type: String,
    default: "primary", // Default primary rahega taake purana code na tootay
  },

  /** Named style bundle — see dashboardPrimaryButtonThemes */
  theme: {
    type: String,
    default: "",
  },

  size: {
    type: String,
    default: "md",
  },
  leftIconClass: { type: String, default: "" },
  rightIconClass: { type: String, default: "" },
  textClass: { type: String, default: "" },

  leftIcon: [String, Object, Function],
  rightIcon: [String, Object, Function],
  rightBadge: { type: [String, Number], default: "" },
  rightBadgeClass: { type: String, default: "" },

  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  loadingSpinnerColor: { type: String, default: "text-current" },
  loadingSpinnerSrc: { type: String, default: "" },
  loadingSpinnerSize: { type: String, default: "sm" },
  loadingSpinnerShowTrack: { type: Boolean, default: false },
  loadingSpinnerThickness: { type: [String, Number], default: "4" },
  loadingSpinnerImgFilter: { type: String, default: "" },
  loadingSpinnerCustomClass: { type: String, default: "" },
  type: { type: String, default: "button" },

  btnBg: { type: String, default: "#07f468" },
  btnHoverBg: { type: String, default: "black" },
  btnText: { type: String, default: "black" },
  btnHoverText: { type: String, default: "#07f468" },
  customClass: { type: String, default: "" }, // Aapki custom classes yahan aayengi
  addId: String,
  removeId: Boolean,
  addClass: String,
  removeClass: Boolean,
  addAttributes: Object,
  removeAttributes: { type: Array, default: () => [] },

  wrapperOverrides: { type: Array, default: () => [] },
});

const themeBundle = computed(() => dashboardPrimaryButtonThemes[props.theme] || null);
const resolvedVariant = computed(() => themeBundle.value?.variant || props.variant);
const resolvedCustomClass = computed(() =>
  [themeBundle.value?.customClass, props.customClass].filter(Boolean).join(" "),
);
const resolvedTextClass = computed(() => props.textClass || themeBundle.value?.textClass || "");
const resolvedRightIconClass = computed(
  () => props.rightIconClass || themeBundle.value?.rightIconClass || "w-5 h-5",
);
const resolvedLeftIconClass = computed(
  () => props.leftIconClass || themeBundle.value?.leftIconClass || "w-5 h-5",
);

// Tailwind theme classes
const themeClasses = {
  // CHANGE 1: 'none' add kiya hai taake custom styling allow ho sake
  none: "",

  primary:
    "bg-primary text-white font-medium rounded-md enabled:hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "bg-gray-600 text-white font-medium rounded-md enabled:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed",
  success:
    "bg-green-600 text-white font-medium rounded-md enabled:hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed",
  danger:
    "bg-red-600 text-white font-medium rounded-md enabled:hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed",
  warning:
    "bg-yellow-500 text-black font-medium rounded-md enabled:hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed",
  outline:
    "border border-gray-400 text-gray-700 font-medium rounded-md enabled:hover:bg-gray-100 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed",
  authTransparent:
    " w-full relative [caret-color:transparent] h-12 px-6 py-2 gap-2.5 rounded-[0.625rem] inline-flex justify-center items-center text-text border border-buttonSecondaryBorder bg-buttonSecondary font-medium text-[15px] transition-opacity duration-100 ease-in-out enabled:hover:bg-[linear-gradient(180deg,_rgba(87,_85,_85,_0.50)_0%,_rgba(0,_0,_0,_0.50)_100%)] enabled:hover:[box-shadow:0px_0px_20px_0px_rgba(255,150,192,0.8)_inset,_8px_8px_30px_0px_rgba(255,0,102,0.7),_0px_0px_35px_0px_rgba(255,255,221,0.5),_-8px_-8px_30px_0px_rgba(255,0,0,0.7)]",
  authPink:
    "w-full relative [caret-color:transparent] h-12 px-6 py-2 gap-2.5 rounded-[0.625rem] inline-flex items-center justify-center text-text bg-buttonPrimary  border border-buttonPrimaryBorder font-medium text-[15px] transition-opacity duration-100 ease-in-out enabled:hover:bg-gradient-to-b enabled:hover:from-[#FF408C] enabled:hover:to-[#F00] enabled:hover:[box-shadow:0px_0px_20px_0px_rgba(255,150,192,0.8)_inset,_8px_8px_30px_0px_rgba(255,0,102,0.7),_0px_0px_35px_0px_rgba(255,255,221,0.5),_-8px_-8px_30px_0px_rgba(255,0,0,0.7)]",
  hoverBgWhite:
    "flex items-center text-[1.125rem] break-words justify-center min-w-[6.25rem] px-2 py-1 font-medium leading-7 text-[#0c111d] bg-transparent border-none outline-none enabled:hover:bg-white",
  greyBg:
    "flex items-center justify-center text-[#98a2b3] uppercase font-medium break-words gap-2 leading-7 text-[1.125rem] min-w-[5.3125rem] px-2 py-1 bg-[rgba(52,64,84,0.05)] border-0",
  "skew-right":
    "group w-max pl-2 gap-2.5 pr-2.5 h-10 relative flex justify-center items-center appearance-button transition-opacity duration-100 ease-in-out normal-case overflow-visible outline-none border-none bg-[var(--btn-bg)] enabled:hover:bg-[var(--btn-hover-bg)] enabled:hover:after:bg-[var(--btn-hover-bg)] before:content-[''] before:block before:w-full before:h-full before:absolute before:top-0 before:right-0 before:z-[1] before:shadow-[4px_4px_0_0_#000] before:transition-all before:ease-in-out before:duration-0 after:content-[''] after:block after:w-4 after:h-full after:absolute after:top-0 after:-right-[0.43rem] after:z-[1] after:shadow-[4px_4px_0_0_#000] after:skew-x-[20deg] after:translate-x-0 after:transition-all after:ease-in-out after:duration-0 after:bg-[var(--btn-bg)]",
  polygonLeft:
    "w-max group flex items-center justify-center gap-[0.625rem] py-1 pl-[1.4rem] pr-2 bg-[var(--btn-bg)] enabled:hover:bg-[var(--btn-hover-bg)] text-[var(--btn-text)] enabled:hover:text-[var(--btn-hover-text)] text-sm sm:text-lg leading-7 font-medium uppercase transition-colors duration-200 relative enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 [clip-path:polygon(8%_0,100%_0,105%_105%,0_105%)]",
  polygonRight:
    "w-max group flex items-center justify-center gap-[0.625rem] py-1 pr-[1.4rem] pl-2 bg-black enabled:hover:bg-[#07f468] text-[#fff] text-[1.125rem] leading-7 font-medium uppercase transition-colors duration-200 enabled:hover:text-black relative cursor-pointer [clip-path:polygon(0_0,92%_0,100%_105%,0_105%)]",
  bgGreen:
    "group flex items-center justify-center gap-2.5 py-6 px-[1.4rem] bg-[#07f468] enabled:hover:bg-black text-[#000] text-[1.125rem] leading-7 font-medium uppercase transition-colors duration-200 enabled:hover:text-[#07f468] relative cursor-pointer ",
  mediaBtn:
    "flex justify-center items-center gap-2.5 h-10 px-2 py-1 cursor-pointer text-lg font-medium text-[#07F468] enabled:hover:text-black bg-black border-none outline-none group enabled:hover:bg-[#07F468]",
  profileMediaBtn:
    "flex justify-center items-center h-11 p-2.5 rounded-[3.125rem] text-sm leading-6 text-[#07F468] bg-black/90 cursor-pointer dark:bg-background-dark-app",
  checkoutProceedpayment:
    "w-full flex justify-center items-center gap-2 w-full h-12 border-t-[1.5px] border-b-[1.5px] border-transparent bg-[#07F468] px-4 [clip-path:polygon(24px_0,100%_0,calc(100%_-_24px)_100%,0_100%)] cursor-pointer group/button enabled:hover:bg-black text-base leading-[1.875rem] font-semibold uppercase text-black enabled:hover:text-[#07F468]",
  disableBtn:
    "flex justify-center items-center gap-2 w-full text-base leading-[1.875rem] font-semibold uppercase text-white/30 h-12 border-t-[1.5px] border-b-[1.5px] border-transparent bg-white/20 px-4 [clip-path:polygon(24px_0,100%_0,calc(100%_-_24px)_100%,0_100%)] cursor-not-allowed",
  actionGreen: "w-full sm:flex-grow sm:min-w-[17.125rem] h-10 flex justify-center items-center gap-2 px-6 sm:pl-2 bg-[#101828] border border-[#07F468] enabled:hover:bg-[#07F468] group/xbtn text-base font-medium tracking-[0.0218rem] whitespace-nowrap text-[#07F468] enabled:hover:text-[#0C111D]",
  retryAction: "flex items-center gap-2.5 px-4 justify-center items-center h-10 shadow-[5px_4px_0px_0px_#07F468] cursor-pointer border-none outline-none bg-black group/button enabled:hover:bg-[#07F468] enabled:hover:shadow-[5px_4px_0px_0px_black] dark:bg-[#181a1b] dark:shadow-[5px_4px_0px_0px_#06c454] dark:enabled:hover:bg-[#06c454] dark:enabled:hover:shadow-[5px_4px_0px_0px_#181a1b] text-lg font-medium text-[#07F468] enabled:hover/button:text-black dark:text-[#07F468] dark:group-hover/button:text-[#181a1b]",
  simpleBtn: "flex justify-center items-center gap-1 px-3.5 h-12 shrink-0 cursor-pointer group/button [&.disabled]:pointer-events-none min-w-max text-sm font-semibold whitespace-nowrap bg-[var(--btn-bg)] enabled:hover:bg-[var(--btn-hover-bg)] text-[var(--btn-text)] enabled:hover:text-[var(--btn-hover-text)]"
};

// Tailwind size classes
const sizeClasses = {
  sm: "px-2 py-1 text-sm",
  md: "",
  lg: "px-6 py-3 ",
};

const buttonConfig = {
  wrappers: [
    {
      targetAttribute: "wrapper1",
      addClass: "flex flex-col",
      addAttributes: { "data-wrapper": "wrapper1" },
    },
    {
      targetAttribute: "wrapper2",
      addClass: "flex items-center gap-2",
      addAttributes: { "data-wrapper": "wrapper2" },
    },
  ],
};

const resolvedAttrs = computed(() => {
  const themeClass =
    themeClasses[resolvedVariant.value] !== undefined
      ? themeClasses[resolvedVariant.value]
      : themeClasses.primary;
  const sizeClass = sizeClasses[props.size] || sizeClasses.md;

  const config = {
    wrappers: buttonConfig.wrappers,
    elm: {
      addClass: `${themeClass} ${sizeClass} ${resolvedCustomClass.value}`,
      addAttributes: {
        type: props.type,
        role: "button",
        style: `
      --btn-bg: ${props.btnBg};
      --btn-hover-bg: ${props.btnHoverBg};
      --btn-text: ${props.btnText};
      --btn-hover-text: ${props.btnHoverText};
    `,
      },
    },
  };

  return resolveAllConfigs(config, props.theme, props);
});

const loadingSpinnerBindings = computed(() => ({
  size: props.loadingSpinnerSize,
  color: props.loadingSpinnerColor,
  showTrack: props.loadingSpinnerShowTrack,
  thickness: props.loadingSpinnerThickness,
  src: props.loadingSpinnerSrc,
  imgFilter: props.loadingSpinnerImgFilter,
  customClass: props.loadingSpinnerCustomClass,
}));
</script>