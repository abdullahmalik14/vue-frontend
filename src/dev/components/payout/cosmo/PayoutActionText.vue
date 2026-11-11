<template>
  <span data-component="payout-action-text" class="min-w-0 flex-1">
    <strong class="block text-sm" :class="titleClass">{{ title }}</strong>
    <small class="block text-xs" :class="noteClass">{{ note }}</small>
  </span>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  note: { type: String, default: '' },
  titleClass: { type: String, default: '' },
  noteClass: { type: String, default: 'mt-0.5 text-white/80' },
});
</script>
