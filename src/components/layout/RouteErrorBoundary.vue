<template>
  <div
    v-if="routeError"
    class="route-error-boundary flex items-center justify-center min-h-[50vh] px-4 py-12"
    role="alert"
    aria-live="assertive"
  >
    <div class="text-center max-w-md">
      <h1 class="text-xl font-semibold text-gray-900 mb-2">
        Something went wrong
      </h1>
      <p class="text-gray-600 mb-6">
        This page could not be displayed. You can try again or return to the dashboard.
      </p>
      <div class="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          type="button"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          @click="retryRoute"
        >
          Try again
        </button>
        <button
          type="button"
          class="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
          @click="goHome"
        >
          Go to dashboard
        </button>
      </div>
      <details v-if="routeError" class="mt-6 text-left">
        <summary class="text-xs text-gray-500 cursor-pointer">
          Error details (tap to expand)
        </summary>
        <p class="mt-2 text-xs text-gray-400 break-all">
          {{ routeError.message }}
        </p>
        <pre
          v-if="routeError.stack"
          class="mt-2 text-[10px] text-gray-400 break-all whitespace-pre-wrap bg-gray-50 dark:bg-gray-800 p-2 rounded"
        >{{ routeError.stack }}</pre>
      </details>
    </div>
  </div>
  <div v-else :key="contentKey">
    <slot />
  </div>
</template>

<script setup>
import { computed, onErrorCaptured, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { log } from '@/infrastructure/logging/logHandler.js';
import { reportApplicationError } from '@/infrastructure/errors/errorHandler.js';
import { getDefaultDashboardSlug } from '@/systems/routing/routeDefaults.js';
import {
  createRouteRenderError,
  shouldClearRouteErrorOnNavigation,
} from '@/systems/routing/routeErrorBoundary.js';

const props = defineProps({
  routeKey: {
    type: String,
    required: true,
  },
});

const router = useRouter();
const routeError = ref(null);
const retryKey = ref(0);

const contentKey = computed(() => `${props.routeKey}:${retryKey.value}`);
const showDevDetails = import.meta.env.DEV;

watch(
  () => props.routeKey,
  (nextRouteKey, previousRouteKey) => {
    if (shouldClearRouteErrorOnNavigation(previousRouteKey, nextRouteKey)) {
      routeError.value = null;
    }
  },
);

onErrorCaptured((err, instance, info) => {
  routeError.value = createRouteRenderError(err, info);

  log('RouteErrorBoundary.vue', 'onErrorCaptured', 'error', 'Route component render error captured', {
    routeKey: props.routeKey,
    error: routeError.value.message,
    info,
    componentName: instance?.type?.name || instance?.$options?.name || 'Unknown',
  });

  reportApplicationError(
    'RouteErrorBoundary.vue',
    'onErrorCaptured',
    'Route component render error',
    err,
    {
      routeKey: props.routeKey,
      info,
      errorCode: 'ROUTE_RENDER_ERROR',
    },
  );

  if (window.performanceTracker) {
    window.performanceTracker.step({
      step: 'routeRenderError',
      file: 'RouteErrorBoundary.vue',
      method: 'onErrorCaptured',
      flag: 'error',
      purpose: `Route render error on ${props.routeKey}: ${routeError.value.message}`,
    });
  }

  return false;
});

function retryRoute() {
  routeError.value = null;
  retryKey.value += 1;
}

function goHome() {
  routeError.value = null;
  router.push(getDefaultDashboardSlug());
}
</script>
