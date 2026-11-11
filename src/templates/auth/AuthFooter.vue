<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getAssetUrls } from '@/systems/assets/assetLibrary.js';

const { t } = useI18n();

const assets = ref({});

getAssetUrls([
  'auth.footer.mail',
  'auth.footer.discord',
  'auth.footer.x',
  'auth.footer.instagram',
  'auth.footer.visa',
  'auth.footer.mastercard',
  'auth.footer.securityMetrics',
]).then((map) => {
  assets.value = map || {};
});

const legalLinks = [
  { key: 'dmca', href: '#' },
  { key: 'antiExploitation', href: '#' },
  { key: 'privacy', href: '#' },
  { key: 'aiGenerated', href: '#' },
  { key: 'termsCreators', href: '#' },
  { key: 'termsFans', href: '#' },
  { key: 'contentRemoval', href: '#' },
];
</script>

<template>
  <div
    class="relative z-20 w-full pb-6 md:pb-8 lg:pb-12 pt-4 md:pt-6 flex flex-col items-center gap-4"
  >
    <div class="self-stretch inline-flex justify-between items-start">
      <div class="justify-start text-white text-xs font-normal font-['Poppins'] leading-4">
        {{ t('auth.footer.copyright') }}
      </div>
      <div class="flex justify-start items-center gap-4">
        <a href="#" class="w-5 h-5 inline-flex items-center justify-center" :aria-label="t('auth.footer.mailAlt')">
          <img
            v-if="assets['auth.footer.mail']"
            :src="assets['auth.footer.mail']"
            :alt="t('auth.footer.mailAlt')"
            class="w-5 h-5 object-contain"
          />
        </a>
        <a href="#" class="w-5 h-5 inline-flex items-center justify-center" :aria-label="t('auth.footer.discordAlt')">
          <img
            v-if="assets['auth.footer.discord']"
            :src="assets['auth.footer.discord']"
            :alt="t('auth.footer.discordAlt')"
            class="w-5 h-5 object-contain"
          />
        </a>
        <a href="#" class="w-5 h-5 inline-flex items-center justify-center" :aria-label="t('auth.footer.xAlt')">
          <img
            v-if="assets['auth.footer.x']"
            :src="assets['auth.footer.x']"
            :alt="t('auth.footer.xAlt')"
            class="w-5 h-5 object-contain"
          />
        </a>
        <a href="#" class="w-5 h-5 inline-flex items-center justify-center" :aria-label="t('auth.footer.instagramAlt')">
          <img
            v-if="assets['auth.footer.instagram']"
            :src="assets['auth.footer.instagram']"
            :alt="t('auth.footer.instagramAlt')"
            class="w-5 h-5 object-contain"
          />
        </a>
      </div>
    </div>

    <div class="self-stretch h-px bg-gray-500 opacity-50" aria-hidden="true"></div>

    <div class="self-stretch inline-flex justify-center items-start gap-3 flex-wrap content-start">
      <a
        v-for="link in legalLinks"
        :key="link.key"
        :href="link.href"
        class="text-center justify-start text-gray-300 text-xs font-normal font-['Poppins'] leading-4"
      >
        {{ t(`auth.footer.${link.key}`) }}
      </a>
    </div>

    <div class="inline-flex justify-start items-center gap-4">
      <img
        v-if="assets['auth.footer.visa']"
        class="w-8 h-5 object-contain"
        :src="assets['auth.footer.visa']"
        :alt="t('auth.footer.visaAlt')"
      />
      <img
        v-if="assets['auth.footer.mastercard']"
        class="w-8 h-5 object-contain"
        :src="assets['auth.footer.mastercard']"
        :alt="t('auth.footer.mastercardAlt')"
      />
      <img
        v-if="assets['auth.footer.securityMetrics']"
        class="w-24 h-5 object-contain"
        :src="assets['auth.footer.securityMetrics']"
        :alt="t('auth.footer.securityMetricsAlt')"
      />
    </div>

    <div class="self-stretch text-center justify-start">
      <span class="text-gray-400 text-[10px] font-medium font-['Poppins']">{{ t('auth.footer.company') }}</span>
      <span class="text-gray-400 text-[10px] font-normal font-['Poppins']">{{ t('auth.footer.address') }}</span>
    </div>
  </div>
</template>
