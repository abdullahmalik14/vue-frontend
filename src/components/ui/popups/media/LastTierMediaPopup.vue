<template>
  <BasePopup data-component="last-tier-media-popup"
    :modelValue="modelValue"
    :popup-config="popupConfig"
    @update:modelValue="(val) => emit('update:modelValue', val)"
  >
    <div
      class="w-full overflow-hidden bg-white/90 dark:bg-background-dark-appbu backdrop-blur-[50px] drop-shadow-[0px_-8px_10px_#0000000D]"
      :class="isMobile
        ? 'rounded-t-[0.625rem]'
        : 'max-w-[23.4375rem] rounded-lg sm:shadow-[0px_2px_4px_-2px_#1018280F,0px_4px_8px_-2px_#1018281A]'"
    >
      <div class="flex flex-col gap-6 p-4">
        <p class="text-base font-semibold leading-6 text-medium-text dark:text-text break-words [overflow-wrap:anywhere]">
          {{ message }}
        </p>
        <button
          type="button"
          class="w-full h-10 flex justify-center items-center bg-error hover:bg-error-light cursor-pointer rounded-[2px]"
          @click="onBack"
        >
          <span class="text-base font-medium text-white">{{ backLabel }}</span>
        </button>
      </div>
    </div>
  </BasePopup>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import breakpoints from '@/composables/breakpoints.js';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  tierName: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const isMobile = computed(() => breakpoints.state.mobile);

const message = computed(() =>
  t('mediaUploader.library.lastTierPopup.message', { tier: props.tierName || '' }),
);

const backLabel = computed(() => t('mediaUploader.library.lastTierPopup.back'));

function onBack() {
  emit('update:modelValue', false);
}

const popupConfig = computed(() => {
  if (isMobile.value) {
    return {
      actionType: 'slideIn',
      from: 'bottom',
      position: 'center',
      offset: '0px',
      speed: '300ms',
      effect: 'ease-in-out',
      closeSpeed: '300ms',
      closeEffect: 'ease-in-out',
      shouldShowOverlay: true,
      shouldCloseOnOutsideClick: true,
      shouldCloseOnEscape: true,
      shouldLockBodyScroll: true,
      zIndex: 22000,
      forceZIndex: 22000,
      width: '100%',
      height: 'auto',
      scrollable: false,
    };
  }

  return {
    actionType: 'popup',
    position: 'center',
    customEffect: 'scale',
    offset: '0px',
    speed: '250ms',
    effect: 'ease-in-out',
    shouldShowOverlay: true,
    shouldCloseOnOutsideClick: true,
    shouldCloseOnEscape: true,
    shouldLockBodyScroll: true,
    zIndex: 22000,
    forceZIndex: 22000,
    width: { default: 'auto', '<480': '90%' },
    height: 'auto',
    scrollable: false,
    closeSpeed: '250ms',
    closeEffect: 'cubic-bezier(0.4, 0, 0.2, 1)',
  };
});
</script>
