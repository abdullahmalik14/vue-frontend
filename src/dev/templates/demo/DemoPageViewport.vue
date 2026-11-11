<template>
  <!--
    Mimics live-page content column width on DemoPage (which has no page sidebar).
    dashboard → DashboardSharedTwoColLayout content (sidebar 5.625rem)
    settings  → SettingsPage tab column (left nav lg:w-[26.6875rem])
    plan      → PlanPage body (xl:px-10)
    full      → Home / Profile (section owns its own px)
  -->
  <div
    class="w-full max-w-full"
    :class="viewportClass"
  >
    <slot />
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'dashboard',
    validator: (v) => ['dashboard', 'settings', 'plan', 'full'].includes(v),
  },
  /** Match DashboardSharedTwoColLayout no-padding (e.g. Payout) */
  noPadding: { type: Boolean, default: false },
});

const viewportClass = computed(() => {
  if (props.variant === 'settings') {
    return 'lg:max-w-[calc(100vw-26.6875rem-2rem)]';
  }
  if (props.variant === 'plan') {
    return 'xl:px-10';
  }
  if (props.variant === 'full') {
    return '';
  }
  // dashboard two-col content column
  return [
    'md:max-w-[calc(100vw-5.625rem)]',
    props.noPadding ? '' : 'lg:p-[40px]',
  ]
    .filter(Boolean)
    .join(' ');
});
</script>
