<script setup>
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { url: heroUrl } = useAssetUrl('maintenance.hero');
const { url: logoUrl } = useAssetUrl('maintenance.logo');
</script>

<template>
  <section class="relative min-h-screen overflow-hidden bg-white">
    <img
      v-if="heroUrl"
      :src="heroUrl"
      alt=""
      class="pointer-events-none absolute inset-0 h-full w-full object-cover object-right"
    />

    <div class="relative z-10 flex min-h-screen items-end px-6  sm:px-10 md:items-center lg:px-[80px]">
      <div class="relative w-full max-w-[640px]">
        <div
          class="pointer-events-none absolute -top-32 bottom-0 left-1/2 z-0 w-screen -translate-x-1/2 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,#FFFFFF_100%)] md:hidden"
          aria-hidden="true"
        />
        <div class="relative z-10 flex flex-col gap-6 md:gap-8 py-[72px] md:py-0">
          <img
            v-if="logoUrl"
            :src="logoUrl"
            :alt="t('maintenance.logoAlt')"
            class="h-[37px] w-[142px]"
          />

          <h1 class="max-w-[620px] text-[36px] font-semibold leading-[44px] md:leading-[60px] text-[#000000] md:text-[48px] lg:text-[60px]">
            {{ t('maintenance.heading.line1') }}<br />
            {{ t('maintenance.heading.line2') }}
          </h1>

          <p class="max-w-[560px] text-[14px] font-normal leading-[28px] text-[#101828] sm:text-[20px] lg:text-[24px] lg:leading-[36px]">
            {{ t('maintenance.schedule.line1') }}<br />
            {{ t('maintenance.schedule.line2') }}
          </p>

          <p class="max-w-[560px] text-[14px] font-normal leading-[28px] text-[#101828] sm:text-[20px] lg:text-[24px] lg:leading-[36px]">
            {{ t('maintenance.body') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
