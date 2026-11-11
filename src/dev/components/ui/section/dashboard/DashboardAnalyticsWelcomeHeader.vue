<template>
  <h1
    v-if="welcomeText"
    class="m-0 px-2 font-semibold text-[2.25rem] pt-10 leading-[2.75rem] tracking-[-0.045rem] text-[#0C111D] break-words max-w-full"
    data-testid="dashboard-analytics-welcome-heading"
  >
    {{ welcomeText }}
  </h1>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

function toCreatorId(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function extractCreatorDisplayName(payload) {
  const user = payload?.user || payload?.data?.user || payload?.data || payload || {};
  return String(user.display_name || user.displayName || '').trim();
}

function getWpSiteBaseUrl() {
  const configured = String(import.meta.env?.VITE_WEB_BASE_URL || '').trim().replace(/\/+$/, '');
  if (configured) return configured;

  try {
    if (typeof document !== 'undefined' && document.referrer) {
      const origin = new URL(document.referrer).origin;
      if (origin && !/localhost|127\.0\.0\.1|vue-build/i.test(origin)) {
        return origin;
      }
    }
  } catch {
    // Ignore invalid referrer URLs.
  }

  return 'https://fansocial.app';
}

const { t } = useI18n();
const route = useRoute();
const profileDisplayName = ref('');

const creatorId = computed(() => (
  toCreatorId(route.query?.creator || route.query?.creatorId || route.query?.creator_id)
));

const resolvedName = computed(() => {
  const queryName = String(route.query?.name || route.query?.displayName || '').trim();
  if (queryName) return queryName;
  return profileDisplayName.value;
});

const welcomeText = computed(() => (
  resolvedName.value
    ? t('dashboard.analytics.overview.welcomeBack', { name: resolvedName.value })
    : ''
));

async function loadCreatorDisplayName() {
  if (!creatorId.value) return;

  try {
    const url = `${getWpSiteBaseUrl()}/wp-json/api/users/get-profile-data?id=${encodeURIComponent(creatorId.value)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      credentials: 'omit',
    });
    if (!response.ok) return;
    const name = extractCreatorDisplayName(await response.json());
    if (name) profileDisplayName.value = name;
  } catch {
    // Stay hidden until a real name is available.
  }
}

watch(creatorId, (id, previousId) => {
  if (id !== previousId) profileDisplayName.value = '';
  void loadCreatorDisplayName();
}, { immediate: true });

</script>
