<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { authHandler } from '@/dev/utils/auth/authHandler.js';
import { useAuthStore } from '@/stores/useAuthStore.js';

const router = useRouter();
const errorMessage = ref('');

onMounted(async () => {
  try {
    const tokens = await authHandler.handleCallback();
    const authStore = useAuthStore();

    if (tokens?.idToken) {
      if (tokens.accessToken) {
        localStorage.setItem('accessToken', tokens.accessToken);
      }
      if (tokens.refreshToken) {
        localStorage.setItem('refreshToken', tokens.refreshToken);
      }

      authStore.setTokenAndDecode(tokens.idToken);
      authStore.startTokenRefreshLoop();
    }

    const returnTo =
      tokens?.appState?.returnTo ||
      (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('auth0_return_to') : null) ||
      '/dashboard';

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('auth0_social_intent');
      sessionStorage.removeItem('auth0_social_provider');
      sessionStorage.removeItem('auth0_return_to');
    }

    await router.replace(returnTo);
  } catch (error) {
    errorMessage.value = error?.message || 'Authentication callback failed';
  }
});
</script>

<template>
  <div class="flex min-h-[50vh] items-center justify-center px-4">
    <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
    <p v-else class="text-sm text-gray-500">Completing sign in...</p>
  </div>
</template>
