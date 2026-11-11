<script setup>
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
</script>

<template>
  <BasePlanDropdown v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </BasePlanDropdown>
</template>
