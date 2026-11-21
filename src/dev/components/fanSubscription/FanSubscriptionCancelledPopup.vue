<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import breakpoints from '@/composables/breakpoints.js';

defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

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
</script>

<template>
  <BasePopup
    :model-value="modelValue"
    :popup-config="popupConfig"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex flex-col gap-6 p-4 text-[16px] font-normal leading-6 text-[#344054]">
      <div class="flex flex-col gap-2">
        <h2 class="text-[16px] font-semibold leading-6">
          {{ t('fanSubscription.card.cancelledTitle') }}
        </h2>
        <p class="mb-4">{{ t('fanSubscription.card.cancelledIntro') }}</p>
        <ul class="mb-4 list-disc pl-6">
          <li>{{ t('fanSubscription.card.accessUntil') }}</li>
          <li>{{ t('fanSubscription.card.noRebill') }}</li>
        </ul>
        <p>{{ t('fanSubscription.card.thanks') }}</p>
      </div>
      <button
        type="button"
        class="flex h-10 min-w-[100px] items-center justify-center self-start bg-[#07F468] px-[9px] py-2 text-[16px] font-medium leading-6 text-black"
        @click="emit('update:modelValue', false)"
      >
        {{ t('fanSubscription.card.understand') }}
      </button>
    </div>
  </BasePopup>
</template>
