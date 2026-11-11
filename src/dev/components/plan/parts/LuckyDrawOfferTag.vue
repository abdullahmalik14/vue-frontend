<script setup>
import { usePlanAssets } from '@/composables/usePlanAssets.js';

defineProps({
  /** Left black segment — e.g. "90% off 1 YEAR" */
  label: {
    type: String,
    required: true,
  },
  /** Right green segment — e.g. "1/1 Left" */
  tokens: {
    type: String,
    required: true,
  },
});

const { assets } = usePlanAssets();
</script>

<template>
  <div
    data-component="lucky-draw-offer-tag"
    class="flex items-center w-full h-9 flex rounded-[3.125rem] overflow-hidden sm:max-w-[17.8125rem] md:max-w-[19.0625rem] xl:max-w-[19.59375rem]"
  >
    <div class="h-full flex items-center gap-1 px-3 py-[0.0625rem] grow bg-[#0C111D] dark:bg-[#dbd8d3]">
      <span class="text-base font-semibold text-[#07F468] dark:text-[#06c454]">{{ label }}</span>
    </div>

    <div
      class="h-9 flex justify-center items-center gap-1 px-2 py-[0.0625rem] bg-[#07F468] dark:bg-[#06c454]"
    >
      <div class="flex justify-center items-center h-5">
        <img v-if="assets.token" :src="assets.token" alt="" class="w-4 h-4" />
      </div>
      <span class="text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3]">{{ tokens }}</span>
    </div>
  </div>
</template>
