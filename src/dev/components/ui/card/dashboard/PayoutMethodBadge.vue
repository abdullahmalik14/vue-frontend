<template>
  <div
    class="flex items-center gap-1 flex-wrap px-2 py-0.5 shadow-[0px_0px_4px_0px_#00000026] rounded-[3.125rem] bg-white/50 dark:bg-[#181a1b]/50"
  >
    <div class="w-4 h-4 shrink-0">
      <img
        :src="resolvedIconSrc"
        alt=""
        class="w-full h-full [filter:_brightness(0)_saturate(100%)]"
      />
    </div>

    <template v-if="loading">
      <div
        class="w-[3.1625rem] h-3 rounded-sm opacity-20 bg-[#667085] animate-skeleton-loading dark:bg-[#535c6d]"
      />
      <span class="text-sm font-medium text-[#182230] dark:text-[#d1cdc7]">-</span>
      <div
        class="w-[6.25rem] h-3 rounded-sm opacity-20 bg-[#667085] animate-skeleton-loading dark:bg-[#535c6d]"
      />
    </template>
    <template v-else>
      <span class="text-sm font-medium text-[#182230] dark:text-[#d1cdc7]">
        {{ t('payout.methodBadge.countryMethod', { country: resolvedCountry, method: resolvedMethod }) }}
      </span>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';

const { t } = useI18n();
const { assets } = usePayoutAssets();

const props = defineProps({
  country: {
    type: String,
    default: '',
  },
  method: {
    type: String,
    default: '',
  },
  iconSrc: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const resolvedCountry = computed(() => props.country || t('payout.mock.countryUsa'));
const resolvedMethod = computed(() => props.method || t('payout.mock.methodBankDeposit'));
const resolvedIconSrc = computed(() => props.iconSrc || assets.value.globe1);
</script>
