<template>
  <div
    class="analytics-skeleton-row flex items-center min-h-[6rem] rounded-xl overflow-hidden"
    :style="{ '--row-index': rowIndex }"
    aria-hidden="true"
  >
    <div class="analytics-sk analytics-sk--thumb w-[3.5rem] sm:w-[5rem] self-stretch flex-shrink-0" />

    <div class="flex flex-col gap-2 px-3 flex-1 py-4">
      <div class="analytics-sk analytics-sk--line h-[10px] w-[93%] rounded-md" />
      <div class="analytics-sk analytics-sk--line h-[10px] w-[82%] rounded-md" />
      <div class="analytics-sk analytics-sk--line h-[10px] w-[48%] rounded-md" />
    </div>

    <div class="basis-1/3 flex justify-center px-2">
      <div class="analytics-sk analytics-sk--number h-[12px] w-[52px] rounded-md" />
    </div>

    <div class="basis-1/3 flex justify-end px-2.5">
      <div class="analytics-sk analytics-sk--money h-[12px] w-[92px] rounded-md" />
    </div>
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

.analytics-sk--thumb {
  border-radius: 0;
  min-height: 6rem;
}

@keyframes analytics-breathe {
  0%,  100% { opacity: 0.48; transform: scale(0.985); }
  50%       { opacity: 1;    transform: scale(1); }
}
</style>
