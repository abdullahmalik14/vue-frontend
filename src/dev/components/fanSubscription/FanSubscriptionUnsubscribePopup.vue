<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import breakpoints from '@/composables/breakpoints.js';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  step: { type: String, default: 'offer' },
});

const emit = defineEmits(['update:modelValue', 'to-confirm', 'confirm']);
const { t } = useI18n();

const isOffer = computed(() => props.step !== 'confirm');
const isMobile = computed(() => breakpoints.state.mobile);

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
      scrollable: false,
      customClass: 'rounded-t-[5px] bg-[rgba(255,255,255,0.9)] backdrop-blur-[50px]',
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
    width: { default: '420px' },
    height: { default: 'auto' },
    customClass: 'rounded-[5px] bg-[rgba(255,255,255,0.9)] backdrop-blur-[50px]',
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
    <div class="flex flex-col gap-6 p-4">
      <div class="flex flex-col gap-2">
        <h2 class="text-[16px] font-semibold leading-6 text-[#344054]">
          {{ isOffer ? t('fanSubscription.card.offerTitle') : t('fanSubscription.card.unsubscribe') }}
        </h2>
        <p class="text-[16px] font-normal leading-6 text-[#344054]">
          {{ isOffer ? t('fanSubscription.card.offerBody') : t('fanSubscription.card.confirmBody') }}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex h-10 min-w-[100px] items-center justify-center px-[9px] py-2 text-[16px] font-medium leading-6 text-[#FF4405]"
          @click="isOffer ? emit('to-confirm') : close()"
        >
          {{ isOffer ? t('fanSubscription.card.unsubscribe') : t('fanSubscription.card.cancel') }}
        </button>
        <button
          type="button"
          class="flex h-10 min-w-[100px] items-center justify-center bg-[#FF4405] px-[9px] py-2 text-[16px] font-medium leading-6 text-white"
          @click="isOffer ? close() : emit('confirm')"
        >
          {{ isOffer ? t('fanSubscription.card.stayDiscount') : t('fanSubscription.card.unsubscribe') }}
        </button>
      </div>
    </div>
  </BasePopup>
</template>
