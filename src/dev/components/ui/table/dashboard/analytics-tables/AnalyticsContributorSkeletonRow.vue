<template>
  <div
    class="analytics-skeleton-contributor-row flex items-center gap-3 h-[3.5rem] px-3 rounded-xl"
    :style="{ '--row-index': rowIndex }"
    aria-hidden="true"
  >
    <div class="analytics-sk analytics-sk--rank w-5 h-5 rounded-full flex-shrink-0" />

    <div class="analytics-sk analytics-sk--avatar w-8 h-8 rounded-full flex-shrink-0" />

    <div class="flex flex-col gap-1.5 flex-1">
      <div class="analytics-sk analytics-sk--name h-[10px] w-[55%] rounded-md" />
      <div class="analytics-sk analytics-sk--handle h-[8px] w-[38%] rounded-md" />
    </div>

    <div class="analytics-sk analytics-sk--total h-[10px] w-[64px] rounded-md flex-shrink-0" />
  </div>
</template>

<script setup>
defineProps({
  rowIndex: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.analytics-sk {
  background: #d3d9df;
  animation: analytics-breathe 1.15s ease-in-out infinite;
  animation-delay: calc(var(--row-index, 0) * 80ms);
}

@keyframes analytics-breathe {
  0%,  100% { opacity: 0.48; transform: scale(0.985); }
  50%       { opacity: 1;    transform: scale(1); }
}
</style>
