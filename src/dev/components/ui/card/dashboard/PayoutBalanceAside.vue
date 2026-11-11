<template>
  <div
    class="flex flex-col gap-2 w-full px-2 min-[700px]:px-0 lg:min-h-[14.75rem] lg:px-6"
    :class="
      isAvailable
        ? 'min-[700px]:justify-center min-[700px]:min-h-[12.875rem] md:justify-between md:gap-2 lg:gap-10'
        : 'md:justify-between md:gap-2 lg:justify-between lg:gap-10'
    "
  >
    <section v-if="isAvailable" class="flex flex-col gap-2 lg:gap-4">
      <Heading tag="h2" theme="custom" no-wrap :add-class="titleClass" :text="t('payout.balanceAside.availableTitle')" />
      <Paragraph theme="custom" no-wrap add-class="text-sm text-[#344054] dark:text-[#bdb8af]" :text="t('payout.balanceAside.availableBody')" />
    </section>
    <Heading v-else tag="h2" theme="custom" no-wrap :add-class="titleClass" :text="t('payout.balanceAside.zeroTitle')" />

    <div :class="isAvailable ? 'flex flex-col gap-4' : ''">
      <div
        v-if="isAvailable"
        class="filter drop-shadow-[5px_4px_0px_#000000] hover:drop-shadow-[5px_4px_0px_#07F468] w-max"
      >
        <DashboardPrimaryButton
          :text="t('payout.balanceAside.withdrawNow')"
          theme="payoutBalanceWithdraw"
          :leftIcon="assets.creditCardDownload"
          @click="$emit('withdraw')"
        />
      </div>

      <div class="flex items-center gap-1">
        <div class="flex items-center gap-0.5">
          <span class="text-xs leading-4 text-[#0C111D] dark:text-[#dbd8d3]">{{
            t('payout.balanceAside.nextPayoutDate')
          }}</span>
          <BaseTooltip placement="bottom" :width="280">
            <Paragraph theme="custom" no-wrap add-class="text-xs leading-normal font-medium text-white dark:text-[#e8e6e3]" :text="t('payout.balanceAside.nextPayoutTooltip')" />
          </BaseTooltip>
          <span class="text-xs leading-4 text-[#0C111D] dark:text-[#dbd8d3]">:</span>
        </div>
        <span class="text-xs leading-normal text-[#0C111D] dark:text-[#dbd8d3]">{{ nextPayoutDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseTooltip from '@/components/ui/tooltips/BaseTooltip.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';

const { t } = useI18n();
const { assets } = usePayoutAssets();

const props = defineProps({
  /** 'zero' | 'available' */
  mode: {
    type: String,
    default: 'zero',
  },
  nextPayoutDate: {
    type: String,
    default: '',
  },
});

defineEmits(['withdraw']);

const isAvailable = computed(() => props.mode === 'available');
const titleClass =
  'text-xl leading-normal font-medium text-[#0C111D] md:text-4xl md:leading-[2.75rem] md:-tracking-[0.045rem] dark:text-[#dbd8d3]';
</script>
