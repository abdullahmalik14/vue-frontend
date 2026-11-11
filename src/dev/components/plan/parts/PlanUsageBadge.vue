<script setup>
import { useI18n } from 'vue-i18n';
import { usePlanAssets } from '@/composables/usePlanAssets.js';

defineProps({
  /** When true, shows ∞ unlimited usage */
  unlimited: {
    type: Boolean,
    default: false,
  },
  usageStart: {
    type: [String, Number],
    default: '0',
  },
  usageLimit: {
    type: [String, Number],
    default: '',
  },
});

const { t } = useI18n();
const { assets } = usePlanAssets();
</script>

<template>
  <div
    data-component="plan-usage-badge"
    class="flex justify-center items-center gap-1 self-end w-max px-2.5 py-0.5 rounded-[3.125rem] bg-[#F2F4F7] sm:self-center dark:bg-[#1e2022]"
  >
    <template v-if="unlimited">
      <img v-if="assets.infinite" :src="assets.infinite" alt="" class="w-4 h-4" />
      <span class="text-sm text-[#344054] dark:text-[#bdb8af]">
        {{ t('plan.subscription.unlimitedUsage') }}
      </span>
    </template>
    <template v-else>
      <span class="text-sm text-[#344054] dark:text-[#bdb8af]">
        {{ usageStart }}<span class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">/{{ usageLimit }}</span>
        {{ t('plan.subscription.usage') }}
      </span>
    </template>
  </div>
</template>
