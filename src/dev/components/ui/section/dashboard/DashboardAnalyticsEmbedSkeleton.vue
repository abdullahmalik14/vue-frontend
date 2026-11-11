<template>
  <div
    class="embed-boot-skeleton w-full min-h-[100vh] bg-[#F9FAFB] px-4 py-6 flex flex-col gap-4"
    role="status"
    aria-live="polite"
    aria-label="Loading analytics"
  >
    <div class="h-10 w-2/3 max-w-[16rem] rounded-md bg-gray-200 animate-pulse" />
    <div class="h-5 w-40 rounded-md bg-gray-200 animate-pulse" />
    <div class="rounded-sm bg-white/80 p-4 h-40 flex gap-3">
      <div class="flex-1 rounded-md bg-gray-200 animate-pulse" />
      <div class="flex-1 rounded-md bg-gray-200 animate-pulse" />
    </div>
    <div class="rounded-sm bg-white/80 p-4 h-40">
      <div class="h-full rounded-md bg-gray-200 animate-pulse" />
    </div>
    <div class="rounded-sm bg-white/80 p-4 flex flex-col gap-3">
      <div v-for="index in 5" :key="index" class="h-12 rounded-md bg-gray-200 animate-pulse" />
    </div>
  </div>
</template>
