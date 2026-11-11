<template>
  <div
    data-component="payout-stat-card"
    class="rounded-[20px] border-cosmo-roseBorderSoft border-t-4 px-[18px] py-4 text-white [backdrop-filter:blur(25px)] bg-light-bg-container dark:bg-dark-bg-container transition-all duration-300 hover:shadow-[0px_0px_20px_0px_rgba(0,0,0,0.10)] hover:backdrop-blur-xl"
    :class="accentClass"
  >
    <div class="text-xs font-extrabold uppercase tracking-[.08em] text-cosmo-muted">{{ label }}</div>
    <div :class="valueClass" class="mt-2 text-[30px] font-semibold tracking-[-0.04em]">{{ value }}</div>
    <div class="mt-1.5 text-[13px] text-cosmo-mutedRose">{{ note }}</div>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  note: { type: String, default: '' },
  accentClass: { type: String, default: '' },
  valueClass:{type: String, default: ''}
});
</script>
