<template>
  <div class="social-linking-container w-full max-w-2xl mx-auto p-6">
    <div class="flex flex-col gap-6">
      <Heading :text="t('demo.socialLinking.title')" tag="h1" theme="AuthHeading" />

      <Paragraph :text="t('demo.socialLinking.description')" font-size="text-base"
        font-color="text-gray-400" />

      <!-- Loading State -->
      <div v-if="isLoadingAttributes" class="p-4 bg-gray-800/50 rounded animate-pulse">
        <p class="text-gray-400">{{ t('demo.socialLinking.loading') }}</p>
      </div>

      <div v-else class="flex flex-col gap-6">
        <!-- Twitter Section -->
        <div class="p-5 bg-gray-900/50 border border-gray-700 rounded-lg flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-black rounded-full flex items-center justify-center border border-gray-700">
              <!-- Using a text placeholder if icon not loaded, but ideally should use icon -->
              <img v-if="xIcon" :src="xIcon" :alt="t('demo.socialLinking.twitter')" class="w-6 h-6" />
              <span v-else class="text-white font-bold">X</span>
            </div>
            <div>
              <h3 class="text-white font-semibold">{{ t('demo.socialLinking.twitter') }}</h3>
              <p class="text-sm text-gray-400">
                {{ isTwitterLinked ? t('demo.socialLinking.linkedId', { id: twitterId }) : t('demo.socialLinking.notLinked') }}
              </p>
            </div>
          </div>

          <button v-if="isTwitterLinked" @click="unlinkProvider('twitter')" :disabled="isLoading"
            class="px-4 py-2 bg-red-900/40 text-red-400 border border-red-900/50 rounded hover:bg-red-900/60 transition-colors text-sm font-medium disabled:opacity-50">
            {{ t('demo.socialLinking.unlink') }}
          </button>
          <button v-else @click="handleTwitterLink" :disabled="isLoading"
            class="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50">
            {{ t('demo.socialLinking.linkAccount') }}
          </button>
        </div>

        <!-- Telegram Section -->
        <div class="p-5 bg-gray-900/50 border border-gray-700 rounded-lg flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-[#2aabee] rounded-full flex items-center justify-center">
              <img v-if="telegramIcon" :src="telegramIcon" :alt="t('demo.socialLinking.telegram')" class="w-6 h-6" />
              <span v-else class="text-white font-bold">TG</span>
            </div>
            <div>
              <h3 class="text-white font-semibold">{{ t('demo.socialLinking.telegram') }}</h3>
              <p class="text-sm text-gray-400">
                {{ isTelegramLinked ? t('demo.socialLinking.linkedId', { id: telegramId }) : t('demo.socialLinking.notLinked') }}
              </p>
            </div>
          </div>

          <button v-if="isTelegramLinked" @click="unlinkProvider('telegram')" :disabled="isLoading"
            class="px-4 py-2 bg-red-900/40 text-red-400 border border-red-900/50 rounded hover:bg-red-900/60 transition-colors text-sm font-medium disabled:opacity-50">
            {{ t('demo.socialLinking.unlink') }}
          </button>
          <button v-else @click="handleTelegramLink" :disabled="isLoading"
            class="px-4 py-2 bg-[#2aabee] text-white rounded hover:bg-[#229ed9] transition-colors text-sm font-medium disabled:opacity-50">
            {{ t('demo.socialLinking.linkAccount') }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div v-if="successMessage" class="p-4 bg-success/10 border border-success/40 rounded text-success">
        {{ successMessage }}
      </div>
      <div v-if="error" class="p-4 bg-red-900/30 border border-red-800 rounded text-red-400">
        {{ error }}
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import Heading from "@/components/ui/typography/Heading.vue";
import Paragraph from "@/components/ui/typography/Paragraph.vue";
import { useAuthStore } from '@/stores/useAuthStore.js';
import { authHandler } from '@/dev/utils/auth/authHandler.js';
import {
  linkSocialProviderIdentity,
  unlinkSocialProviderIdentity,
} from '@/dev/utils/auth/socialAuthIdentity.js';
import { initiateSocialPopup } from '@/dev/utils/auth/socialAuthBridge.js';
import { getAssetUrl } from "@/systems/assets/assetLibrary";
import { linkSocialAccount as scyllaLink, unlinkSocialAccount as scyllaUnlink, checkUserExists } from "@/infrastructure/backend/scyllaDbClient.js";

const { t } = useI18n();
const authStore = useAuthStore();
const isLoading = ref(false);
const isLoadingAttributes = ref(true);
const error = ref('');
const successMessage = ref('');

const userAttributes = ref({});
const xIcon = ref('');
const telegramIcon = ref('');

// Handlers for popups
const twitterPopupRef = ref(null);
const twitterOAuthState = ref(null);
const twitterPopupCheckInterval = ref(null);
const telegramPopupRef = ref(null);
const telegramAuthState = ref(null);
const telegramPopupCheckInterval = ref(null);

const twitterId = computed(() => userAttributes.value['custom:twitter_id']);
const telegramId = computed(() => userAttributes.value['custom:telegram_id']);
const isTwitterLinked = computed(() => !!twitterId.value);
const isTelegramLinked = computed(() => !!telegramId.value);

onMounted(async () => {
  try {
    xIcon.value = await getAssetUrl("icon.social.x");
    telegramIcon.value = await getAssetUrl("icon.social.telegram");
    await fetchAttributes();
  } catch (err) {
    console.error("Failed to init demo", err);
  } finally {
    isLoadingAttributes.value = false;
  }
});

onBeforeUnmount(() => {
  cleanupListeners();
});

function cleanupListeners() {
  window.removeEventListener('message', handleTwitterMessage);
  window.removeEventListener('message', handleTelegramMessage);
  if (twitterPopupCheckInterval.value) clearInterval(twitterPopupCheckInterval.value);
  if (telegramPopupCheckInterval.value) clearInterval(telegramPopupCheckInterval.value);
}

async function fetchAttributes() {
  userAttributes.value = {
    sub: authStore.currentUser?.raw?.sub,
    ...(authStore.currentUser?.raw || {}),
  };
}

async function unlinkProvider(provider) {
  if (!confirm(`Are you sure you want to unlink your ${provider} account?`)) return;

  isLoading.value = true;
  error.value = '';
  successMessage.value = '';

  try {
    await unlinkSocialProviderIdentity(provider);

    // Sync to ScyllaDB (non-blocking)
    if (userAttributes.value.sub) {
      scyllaUnlink(userAttributes.value.sub, provider)
        .catch(err => console.error('ScyllaDB unlink failed:', err));
    }

    successMessage.value = `Successfully unlinked ${provider}.`;
    await fetchAttributes();
  } catch (err) {
    error.value = `Failed to unlink ${provider}: ${err.message}`;
  } finally {
    isLoading.value = false;
  }
}

// --- Twitter Linking Flow ---

async function handleTwitterLink() {
  isLoading.value = true;
  error.value = '';

  try {
    window.removeEventListener('message', handleTwitterMessage);
    window.addEventListener('message', handleTwitterMessage);

    const { popup, state } = await initiateSocialPopup('twitter');
    twitterPopupRef.value = popup;
    twitterOAuthState.value = state;

    twitterPopupCheckInterval.value = setInterval(() => {
      if (popup.closed) {
        clearInterval(twitterPopupCheckInterval.value);
        isLoading.value = false;
        // If we didn't get a message before close, assume cancelled
        if (twitterOAuthState.value) {
          console.log("Twiter popup closed by user");
        }
        cleanupListeners();
      }
    }, 1000);

  } catch (err) {
    isLoading.value = false;
    error.value = err.message;
  }
}

async function handleTwitterMessage(event) {
  const data = event?.data;
  if (!data || typeof data !== 'object') return;

  const expectedState = twitterOAuthState.value;
  if (!expectedState || data.state !== expectedState) return;

  if (twitterPopupRef.value && event.source !== twitterPopupRef.value) return;

  if (data.type === 'twitter-oauth-code') {
    const { code, state } = data;

    // Clear popup check interval since we got a response
    if (twitterPopupCheckInterval.value) {
      clearInterval(twitterPopupCheckInterval.value);
      twitterPopupCheckInterval.value = null;
    }

    // Send acknowledgment that we received the message to allow popup to close
    if (event.source) {
      event.source.postMessage({ type: 'twitter-oauth-ack', success: true, state }, event.origin || "*");
    }

    try {
      // Import handler dynamically
      const { handleTwitterCallback } = await import("@/dev/utils/auth/socialAuthHandler.js");

      // Perform exchange with mode='link'
      const profile = await handleTwitterCallback(code, state, 'link');

      console.log("Got Twitter profile for linking:", profile);

      if (!profile || !profile.id) {
        throw new Error("Failed to get Twitter ID from callback");
      }

      // Link the account
      await linkSocialProviderIdentity('twitter', profile.id);

      // Sync to ScyllaDB (check for conflicts first)
      if (userAttributes.value.sub) {
        try {
          // Check if this Twitter ID is already linked to another account
          const existingUser = await checkUserExists('twitter', profile.id);
          if (existingUser && existingUser.user_id !== userAttributes.value.sub) {
            throw new Error('This Twitter account is already linked to another user');
          }

          await scyllaLink(userAttributes.value.sub, 'twitter', profile.id);
        } catch (err) {
          console.error('ScyllaDB sync failed:', err);
          // If it's a conflict error, show it to user
          if (err.message.includes('already linked')) {
            error.value = err.message;
            // Rollback social link
            await unlinkSocialProviderIdentity('twitter').catch(e => console.error('Rollback failed:', e));
            return;
          }
        }
      }

      successMessage.value = "Twitter account linked successfully!";
      await authStore.syncWithAuthToken();
      await fetchAttributes();

    } catch (err) {
      console.error("Linking failed", err);
      error.value = "Failed to link Twitter: " + err.message;

      // Send error acknowledgment if something failed during processing (though popup might be closed already)
      if (event.source) {
        try {
          event.source.postMessage({ type: 'twitter-oauth-ack', success: false, state, error: err.message }, event.origin || "*");
        } catch (e) { /* ignore if closed */ }
      }
    } finally {
      isLoading.value = false;
      cleanupListeners();
    }
  } else if (data.type === 'twitter-auth-error') {
    isLoading.value = false;
    error.value = data.error || "Twitter login failed";
    cleanupListeners();
  }
}

// --- Telegram Linking Flow ---

async function handleTelegramLink() {
  isLoading.value = true;
  error.value = '';

  try {
    window.removeEventListener('message', handleTelegramMessage);
    window.addEventListener('message', handleTelegramMessage);

    const { popup, state } = await initiateSocialPopup('telegram');
    telegramPopupRef.value = popup;
    telegramAuthState.value = state;

    telegramPopupCheckInterval.value = setInterval(() => {
      if (popup.closed) {
        clearInterval(telegramPopupCheckInterval.value);
        isLoading.value = false;
        cleanupListeners();
      }
    }, 1000);

  } catch (err) {
    isLoading.value = false;
    error.value = err.message;
  }
}

async function handleTelegramMessage(event) {
  const data = event?.data;
  if (!data || typeof data !== 'object') return;

  const expectedState = telegramAuthState.value;
  if (!expectedState || data.state !== expectedState) return;

  if (telegramPopupRef.value && event.source !== telegramPopupRef.value) return;

  if (data.type === 'telegram-auth-success') {
    const telegramUser = data.user;

    // Clear popup check interval since we got a response
    if (telegramPopupCheckInterval.value) {
      clearInterval(telegramPopupCheckInterval.value);
      telegramPopupCheckInterval.value = null;
    }

    // Ack
    if (event.source) {
      event.source.postMessage({ type: "telegram-auth-ack", success: true, state: data.state }, event.origin || "*");
    }

    try {
      await linkSocialProviderIdentity('telegram', telegramUser.id);

      // Sync to ScyllaDB (check for conflicts first)
      if (userAttributes.value.sub) {
        try {
          // Check if this Telegram ID is already linked to another account
          const existingUser = await checkUserExists('telegram', String(telegramUser.id));
          if (existingUser && existingUser.user_id !== userAttributes.value.sub) {
            throw new Error('This Telegram account is already linked to another user');
          }

          await scyllaLink(userAttributes.value.sub, 'telegram', String(telegramUser.id));
        } catch (err) {
          console.error('ScyllaDB sync failed:', err);
          // If it's a conflict error, show it to user
          if (err.message.includes('already linked')) {
            error.value = err.message;
            // Rollback social link
            await unlinkSocialAccount('telegram').catch(e => console.error('Rollback failed:', e));
            return;
          }
        }
      }

      successMessage.value = "Telegram account linked successfully!";
      await authStore.syncWithAuthToken();
      await fetchAttributes();
    } catch (err) {
      error.value = "Failed to link Telegram: " + err.message;
      // Send error ack
      if (event.source) {
        try {
          event.source.postMessage({ type: "telegram-auth-ack", success: false, state: data.state, error: err.message }, event.origin || "*");
        } catch (e) { /* ignore */ }
      }
    } finally {
      isLoading.value = false;
      cleanupListeners();
    }
  } else if (data.type === 'telegram-auth-error') {
    isLoading.value = false;
    error.value = data.error || "Telegram login failed";
    cleanupListeners();
  }
}

</script>

<style scoped>
/* Add any specific styles if needed */
</style>
