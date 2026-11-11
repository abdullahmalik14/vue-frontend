<script setup>
import DashboardSharedHeader from '@/templates/dashboard/shared/DashboardSharedHeader.vue';
</script>

<template>
  <DashboardSharedHeader v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </DashboardSharedHeader>
</template>
