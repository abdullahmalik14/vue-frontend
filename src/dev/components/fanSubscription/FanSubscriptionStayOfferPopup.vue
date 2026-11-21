<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import breakpoints from '@/composables/breakpoints.js';

defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue', 'accept', 'decline']);
const { t } = useI18n();

const isMobile = computed(() => breakpoints.state.mobile);

const portraitSrc = '/dev/cdn/fan-subscription/stay-offer/portrait.png';
const portraitOverlaySrc = '/dev/cdn/fan-subscription/stay-offer/portrait-overlay.png';
const verifiedSrc = '/dev/cdn/fan-subscription/stay-offer/verified.svg';
const closeSrc = '/dev/cdn/fan-subscription/stay-offer/close.svg';
const acceptIconSrc = '/dev/cdn/fan-subscription/stay-offer/check.svg';
const declineIconSrc = '/dev/cdn/fan-subscription/stay-offer/decline.svg';

const popupConfig = computed(() => {
  if (isMobile.value) {
    return {
      actionType: 'slideIn',
      from: 'bottom',
      offset: '0px',
      speed: '300ms',
      effect: 'ease-in-out',
      closeSpeed: '300ms',
      closeEffect: 'ease-in-out',
      shouldShowOverlay: true,
      shouldCloseOnOutsideClick: true,
      shouldCloseOnEscape: true,
      shouldLockBodyScroll: true,
      width: '100%',
      height: 'auto',
      scrollable: true,
      customClass: 'rounded-t-[5px] bg-transparent shadow-[0px_0px_20px_0px_rgba(0,0,0,0.25)]',
    };
  }

  return {
    actionType: 'popup',
    position: 'center',
    customEffect: 'instant',
    speed: '0ms',
    closeSpeed: '0ms',
    closeEffect: 'instant',
    shouldShowOverlay: true,
    shouldCloseOnOutsideClick: true,
    shouldCloseOnEscape: true,
    shouldLockBodyScroll: true,
    width: { default: '844px' },
    height: { default: 'auto' },
    scrollable: false,
    customClass: 'overflow-visible bg-transparent shadow-[0px_0px_20px_0px_rgba(0,0,0,0.25)]',
  };
});

function close() {
  emit('update:modelValue', false);
}
</script>

<template>
  <BasePopup
    :model-value="modelValue"
    :popup-config="popupConfig"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="relative flex w-full flex-col md:min-h-[560px] md:flex-row">
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          :src="portraitSrc"
          alt=""
          class="size-full scale-110 object-cover blur-[30px]"
        />
        <div class="absolute inset-0 bg-[rgba(255,255,255,0.1)]" />
      </div>

      <div class="relative z-[1] h-64 w-full overflow-hidden md:h-auto md:w-[323px] md:self-stretch">
        <img
          :src="portraitSrc"
          :alt="t('fanSubscription.stayOffer.name')"
          class="absolute left-[-58.81%] top-[-0.76%] h-[152.68%] w-[387.83%] max-w-none object-cover"
        />
        <img
          :src="portraitOverlaySrc"
          alt=""
          class="absolute inset-0 size-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-transparent from-50% to-[rgba(0,0,0,0.9)]" />
        <div class="absolute bottom-0 left-0 flex w-max max-w-[220px] flex-col gap-0.5 p-4 drop-shadow-[0px_0px_4px_rgba(0,0,0,0.5)]">
          <div class="flex items-center gap-1">
            <Heading
              no-wrap
              tag="h3"
              theme="custom"
              :text="t('fanSubscription.stayOffer.name')"
              add-class="whitespace-nowrap text-sm font-medium leading-5 text-[#FCFAFF]"
            />
            <img :src="verifiedSrc" :alt="t('fanSubscription.stayOffer.verified')" />
          </div>
          <Paragraph
            no-wrap
            theme="custom"
            :text="t('fanSubscription.stayOffer.handle')"
            add-class="text-xs font-medium leading-[18px] text-[#FCFCFD]"
          />
        </div>
      </div>

      <button
        type="button"
        data-popup-close
        data-slideIn-close
        class="absolute z-10 rounded-full bg-[rgba(102,112,133,0.5)] p-2 backdrop-blur-[10px]"
        :class="isMobile ? 'right-3 top-3' : '-right-6 -top-6'"
        :aria-label="t('fanSubscription.stayOffer.close')"
        @click="close"
      >
        <img :src="closeSrc" alt="" />
      </button>

      <div class="relative z-[1] flex min-w-0 flex-1 flex-col">
        <div class="flex flex-1 flex-col gap-4 p-6 drop-shadow-[0px_0px_5px_rgba(0,0,0,0.1)]">
          <Paragraph
            no-wrap
            theme="custom"
            :text="t('fanSubscription.stayOffer.kicker')"
            add-class="text-xs font-semibold leading-[18px] text-[#07F468]"
          />
          <Heading
            no-wrap
            tag="h2"
            theme="custom"
            :text="t('fanSubscription.stayOffer.message')"
            add-class="text-[20px] font-medium leading-[30px] text-[#FCFAFF]"
          />

          <div class="flex items-end justify-between gap-3 rounded-[5px] p-3">
            <Paragraph
              no-wrap
              theme="custom"
              :text="t('fanSubscription.stayOffer.currentPrice')"
              add-class="text-sm font-medium leading-5 text-[#EAECF0]"
            />
            <div class="flex items-end gap-1 text-[#EAECF0]">
              <Paragraph
                no-wrap
                theme="custom"
                :text="t('fanSubscription.stayOffer.currency')"
                add-class="text-[20px] font-semibold leading-[30px] text-[#EAECF0]"
              />
              <Paragraph
                no-wrap
                theme="custom"
                :text="t('fanSubscription.stayOffer.currentAmount')"
                add-class="text-[30px] font-semibold leading-[38px] text-[#EAECF0] line-through"
              />
              <Paragraph
                no-wrap
                theme="custom"
                :text="t('fanSubscription.stayOffer.perMonth')"
                add-class="text-[10px] font-normal leading-[13px] tracking-[0.01px] text-[#EAECF0]"
              />
            </div>
          </div>

          <div class="relative flex items-end justify-between gap-3 rounded-[5px] border-[0.75px] border-[#FFEFBA] bg-[rgba(255,197,5,0.3)] p-3 shadow-[0px_0px_16px_0px_rgba(255,205,41,0.55)]">
            <Paragraph
              no-wrap
              theme="custom"
              :text="t('fanSubscription.stayOffer.off')"
              add-class="absolute -top-3 left-3 bg-[#FFCD29] px-[5px] py-0.5 text-lg font-bold leading-7 text-black"
            />
            <Paragraph
              no-wrap
              theme="custom"
              :text="t('fanSubscription.stayOffer.offerLabel')"
              add-class="pt-4 text-sm font-medium leading-5 text-[#FFCD29]"
            />
            <div class="flex items-end gap-1 text-[#FFCD29]">
              <Paragraph
                no-wrap
                theme="custom"
                :text="t('fanSubscription.stayOffer.currency')"
                add-class="text-[20px] font-semibold leading-[30px] text-[#FFCD29]"
              />
              <Paragraph
                no-wrap
                theme="custom"
                :text="t('fanSubscription.stayOffer.offerAmount')"
                add-class="text-[48px] font-semibold leading-[60px] tracking-[-0.96px] text-[#FFCD29]"
              />
              <Paragraph
                no-wrap
                theme="custom"
                :text="t('fanSubscription.stayOffer.perMonth')"
                add-class="text-[10px] font-normal leading-[13px] tracking-[0.01px] text-[#FFCD29]"
              />
            </div>
          </div>
        </div>

        <div class="flex w-full flex-col gap-4 px-6 pb-6 [&_[data-wrapper='wrapper1']]:w-full [&_[data-wrapper='wrapper2']]:w-full [&_button]:w-full">
          <DashboardPrimaryButton
            :text="t('fanSubscription.stayOffer.accept')"
            theme="fanStayOfferAccept"
            :left-icon="acceptIconSrc"
            @click="emit('accept')"
          />
          <DashboardPrimaryButton
            :text="t('fanSubscription.stayOffer.decline')"
            theme="fanStayOfferDecline"
            :left-icon="declineIconSrc"
            @click="emit('decline')"
          />
        </div>
      </div>
    </div>
  </BasePopup>
</template>
