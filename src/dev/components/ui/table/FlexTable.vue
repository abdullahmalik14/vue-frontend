<script setup>
import FlexTable from '@/components/ui/table/FlexTable.vue';
</script>

<template>
  <FlexTable v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </FlexTable>
</template>
