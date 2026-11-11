<template>
  <span
    v-if="src"
    data-component="payout-cdn-icon"
    class="inline-block shrink-0 bg-current"
    :style="maskStyle"
    aria-hidden="true"
  ></span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  src: { type: String, default: '' },
});

const maskStyle = computed(() => {
  const url = `url("${props.src}")`;
  return {
    WebkitMaskImage: url,
    maskImage: url,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
  };
});
</script>
