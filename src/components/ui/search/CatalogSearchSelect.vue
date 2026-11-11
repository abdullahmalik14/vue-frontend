<script setup>
/**
 * Compatibility re-export — implementation lives in
 * `@/dev/components/ui/search/CatalogSearchSelect.vue`
 */
import DevCatalogSearchSelect from '@/dev/components/ui/search/CatalogSearchSelect.vue';
</script>

<template>
  <DevCatalogSearchSelect v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData || {}" />
    </template>
  </DevCatalogSearchSelect>
</template>
