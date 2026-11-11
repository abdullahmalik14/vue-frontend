<template>
  <div data-component="media-placeholder"
    v-if="viewMode === 'table'"
    class="w-full"
  >
    <MediaTableView :items="[]" loading />
  </div>

  <div
    v-else
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
  >
    <div
      v-for="n in 8"
      :key="n"
      class="w-full min-w-0 flex flex-col gap-2"
    >
      <div class="w-full aspect-video rounded-sm bg-mediaUi-skeleton animate-skeleton-loading" />
      <div class="h-4 w-[90%] rounded bg-mediaUi-skeleton animate-skeleton-loading" />
      <div class="h-4 w-[70%] rounded bg-mediaUi-skeleton animate-skeleton-loading" />
    </div>
  </div>
</template>

<script setup>
import MediaTableView from './MediaTableView.vue';

defineProps({
  viewMode: {
    type: String,
    default: 'grid',
  },
});
</script>
