<script setup>
import CustomDropdown from '@/components/ui/dropdowns/CustomDropdown.vue';
</script>

<template>
  <CustomDropdown v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </CustomDropdown>
</template>
