<template>
  <div data-component="media-thumbnail-selector" class="grid grid-cols-4 gap-[4px] w-full">
    <button
      v-for="(thumb, index) in visibleThumbnails"
      :key="`${index}-${thumb}`"
      type="button"
      class="relative block w-full overflow-hidden rounded-sm p-0 leading-none focus:outline-none"
      @click="$emit('update:selectedIndex', index)"
    >
      <img
        v-if="thumb"
        :src="thumb"
        class="block h-[3.6125rem] w-full rounded-sm object-cover outline outline-[3px] -outline-offset-[3px]"
        :class="index === selectedIndex ? 'opacity-100 outline-dark-text' : 'opacity-60 outline-transparent'"
        loading="eager"
        fetchpriority="high"
        decoding="async"
      />
      <div v-else class="h-[3.6125rem] w-full bg-gray-200"></div>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  thumbnails: Array,
  selectedIndex: Number,
});

defineEmits(['update:selectedIndex']);

const visibleThumbnails = computed(() => props.thumbnails || []);
</script>
