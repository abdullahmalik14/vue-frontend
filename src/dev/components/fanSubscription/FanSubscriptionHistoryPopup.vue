<script setup>
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';

defineProps({
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);
const { t } = useI18n();

const rows = [
  { date: 'historyDate1', price: 'historyPrice', shaded: true },
  { date: 'historyDate2', price: 'historyPrice', shaded: false },
  { date: 'historyDate3', price: 'historyPrice', shaded: true },
  { date: 'historyDate4', price: 'historyPrice', shaded: false },
  { date: 'historyDate5', price: 'historyPriceLast', shaded: true },
];

const popupConfig = {
  actionType: 'slideIn',
  from: 'right',
  offset: '0px',
  speed: '250ms',
  effect: 'ease-in-out',
  closeSpeed: '250ms',
  closeEffect: 'cubic-bezier(0.4, 0, 0.2, 1)',
  shouldShowOverlay: false,
  shouldCloseOnOutsideClick: true,
  shouldCloseOnEscape: true,
  shouldLockBodyScroll: true,
  scrollable: false,
  width: { default: '545px', '<768': '100%' },
  height: '100%',
  containerClass: '[&>div]:h-full [&>div]:min-h-0',
};

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
    <div class="flex h-full min-h-0 w-full flex-col bg-white">
      <div class="flex w-full shrink-0 items-center justify-between px-6 py-4">
        <h2 class="text-[14px] font-semibold leading-5 text-[#344054]">
          {{ t('fanSubscription.card.membershipHistory') }}
        </h2>
        <button
          type="button"
          data-slideIn-close
          class="cursor-pointer"
          :aria-label="t('fanSubscription.card.historyClose')"
          @click="close"
        >
          <img src="/dev/cdn/fan-subscription/history-close.svg" alt="" />
        </button>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto">
        <div
          v-for="row in rows"
          :key="row.date"
          class="flex h-[72px] w-full"
        >
          <div class="flex h-[72px] w-[72px] shrink-0 items-center justify-center border-b border-[#98A2B3] bg-black">
            <img src="/dev/cdn/fan-subscription/history-mark.svg" alt="" />
          </div>
          <div
            class="flex min-w-0 flex-1 flex-col justify-center gap-1 p-1.5"
            :class="row.shaded ? 'bg-[rgba(242,244,247,0.5)]' : ''"
          >
            <p class="truncate text-[12px] font-semibold leading-[18px] text-[#0C111D]">
              {{ t('fanSubscription.card.historyPlan') }}
            </p>
            <p class="truncate text-[12px] italic leading-[18px] text-[#667085]">
              {{ t(`fanSubscription.card.${row.date}`) }}
            </p>
            <div class="flex w-[176px] max-w-full items-center gap-[5px]">
              <img
                src="/dev/cdn/fan-subscription/history-avatar.png"
                alt=""
                class="size-5 shrink-0 rounded-full object-cover"
              />
              <p class="truncate text-[12px] font-normal leading-[18px] text-[#344054]">
                {{ t('fanSubscription.card.historyHandle') }}
              </p>
            </div>
          </div>
          <div
            class="flex h-[72px] w-[100px] shrink-0 items-center justify-end px-2.5"
            :class="row.shaded ? 'bg-[rgba(242,244,247,0.5)]' : ''"
          >
            <p class="w-full truncate text-right text-[12px] font-semibold leading-[18px] text-[#0C111D]">
              {{ t(`fanSubscription.card.${row.price}`) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </BasePopup>
</template>
