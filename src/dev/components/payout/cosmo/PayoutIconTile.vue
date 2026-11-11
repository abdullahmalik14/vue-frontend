<template>
  <span
    data-component="payout-icon-tile"
    class="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[14px]"
    :class="tileClass"
  >
    <slot>
      <PayoutCdnIcon v-if="src" :src="src" class="h-[18px] w-[18px]" />
    </slot>
  </span>
</template>

<script setup>
import PayoutCdnIcon from '@/dev/components/payout/cosmo/PayoutCdnIcon.vue';

defineProps({
  src: { type: String, default: '' },
  tileClass: { type: String, default: 'bg-white/15' },
});
</script>
