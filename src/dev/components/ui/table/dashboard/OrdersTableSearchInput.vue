<script setup>
import OrdersTableSearchInput from '@/components/ui/table/dashboard/OrdersTableSearchInput.vue';
</script>

<template>
  <OrdersTableSearchInput v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </OrdersTableSearchInput>
</template>
