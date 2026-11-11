<script setup>
import DashboardSharedTwoColLayout from '@/templates/dashboard/shared/DashboardSharedTwoColLayout.vue';
</script>

<template>
  <DashboardSharedTwoColLayout v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </DashboardSharedTwoColLayout>
</template>
