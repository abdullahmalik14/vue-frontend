<template>
  <div :class="lockViewport ? 'flex h-dvh max-h-dvh flex-col overflow-hidden' : ''">
  <!--Mobile Header -->
  <DashboardSharedHeader v-if="!hideLayout" class="block md:hidden" :class="lockViewport ? 'shrink-0' : ''" />

  <div
    class="dashboard-two-col-container flex relative isolate dark:bg-[#0A0A0A]"
    :class="lockViewport ? 'min-h-0 flex-1 overflow-hidden' : 'min-h-screen'"
  >
    <!--Desktop Sidebar -->
    <DashboardSharedSidebar v-if="!hideLayout" class="hidden md:block relative z-[3]" />

    <!-- Body / Main Content -->
    <div
      class="flex-1 min-w-0 relative z-[1]"
      :class="[
        noPadding ? '' : '',
        lockViewport ? 'min-h-0 overflow-hidden' : 'min-h-screen md:h-auto',
      ]"
    >
      <slot />
    </div>

    <div
      v-if="bgUrl && !embeddedInIframe"
      class="pointer-events-none fixed inset-0 -z-10 bg-cover bg-top bg-no-repeat"
      :style="{ backgroundImage: `url(${bgUrl})` }"
      aria-hidden="true"
    ></div>
  </div>
  </div>
</template>

<script setup>
import DashboardSharedHeader  from "@/templates/dashboard/shared/DashboardSharedHeader.vue";
import DashboardSharedSidebar from "@/templates/dashboard/shared/DashboardSharedSidebar.vue";
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { isEmbeddedInIframe } from '@/systems/embed/embedViewport.js';

defineProps({
  noPadding: {
    type: Boolean,
    default: false,
  },
  lockViewport: {
    type: Boolean,
    default: false,
  },
});

const route = useRoute();
const hideLayout = computed(() => route.meta?.routeConfig?.hideLayout || route.meta?.hideLayout || false);
const embeddedInIframe = isEmbeddedInIframe();

const { url: bgUrl } = useAssetUrl('dashboard.bg.gradient');
</script>

<style scoped>
.dashboard-two-col-container {
  display: flex;
}
</style>
