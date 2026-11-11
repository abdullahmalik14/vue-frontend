<script setup>
import BaseTooltip from '@/components/ui/tooltips/BaseTooltip.vue';
</script>

<template>
  <BaseTooltip v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </BaseTooltip>
</template>
