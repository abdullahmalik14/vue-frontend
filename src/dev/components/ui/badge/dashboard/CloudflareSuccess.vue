<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const props = defineProps({
  /** Toggle mock Turnstile success badge visibility */
  show: { type: Boolean, default: true },
  /**
   * Which CDN badge image to use:
   * - login → original login page badge
   * - default → later WhatsApp / form badge (forgot + reset)
   */
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'login'].includes(v),
  },
});

const { t } = useI18n();
const { url: defaultUrl } = useAssetUrl('auth.badge.cloudflareSuccess');
const { url: loginUrl } = useAssetUrl('auth.badge.cloudflareSuccessLogin');

const cloudflareSuccessUrl = computed(() =>
  props.variant === 'login' ? loginUrl.value : defaultUrl.value,
);
</script>

<template>
  <img
    v-if="show && cloudflareSuccessUrl"
    class="w-72 h-16"
    :src="cloudflareSuccessUrl"
    :alt="t('cloudflareSuccess.success')"
  />
</template>
