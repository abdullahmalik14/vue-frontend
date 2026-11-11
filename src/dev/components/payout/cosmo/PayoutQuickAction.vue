<template>
  <button
    type="button"
    class="flex w-full cursor-pointer items-center gap-3 border-0 text-left font-[inherit] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
    :class="[rowClass, bgClass]"
    data-component="payout-quick-action"
    :data-action="action || undefined"
  >
    <PayoutIconTile :src="iconSrc" :tile-class="tileClass" />
    <PayoutActionText :title="title" :note="note" :title-class="titleClass" :note-class="noteClass" />
    <slot name="trailing">
      <span v-if="badge" :class="badgeClass">{{ badge }}</span>
      <PayoutCdnIcon v-else :src="assets.chevronRight" class="h-[18px] w-[18px]" />
    </slot>
  </button>
</template>

<script setup>
import PayoutCdnIcon from '@/dev/components/payout/cosmo/PayoutCdnIcon.vue';
import PayoutIconTile from '@/dev/components/payout/cosmo/PayoutIconTile.vue';
import PayoutActionText from '@/dev/components/payout/cosmo/PayoutActionText.vue';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';

const { assets } = usePayoutAssets();

defineProps({
  rowClass: { type: String, default: 'min-h-[82px] rounded-[18px] px-3.5 text-white transition hover:-translate-y-px' },
  bgClass: { type: String, default: '' },
  iconSrc: { type: String, required: true },
  action: { type: String, default: '' },
  tileClass: { type: String, default: 'bg-white/15' },
  title: { type: String, required: true },
  note: { type: String, default: '' },
  titleClass: { type: String, default: '' },
  noteClass: { type: String, default: 'mt-0.5 text-white/80' },
  badge: { type: String, default: '' },
  badgeClass: { type: String, default: 'rounded-full bg-cosmo-mintInk px-2 py-1.5 text-xs font-extrabold text-cosmo-mint' },
});
</script>
