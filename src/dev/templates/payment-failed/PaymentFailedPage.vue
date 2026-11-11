<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import TwoPieceButton from '@/components/ui/buttons/TwoPieceButton.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';

const { t } = useI18n();
const router = useRouter();
const { url: heroUrl } = useAssetUrl('paymentFailed.hero');
const { url: iconUrl } = useAssetUrl('paymentFailed.icon');
const { url: logoUrl } = useAssetUrl('thankyou.logo');

const logoMaskStyle = computed(() => {
  if (!logoUrl.value) return undefined;
  const mask = `url(${logoUrl.value})`;
  return {
    maskImage: mask,
    WebkitMaskImage: mask,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  };
});

function goBack() {
  router.back();
}
</script>

<template>
  <section class="fixed inset-0 overflow-hidden bg-black">
    <img
      v-if="heroUrl"
      :src="heroUrl"
      alt=""
      class="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
    />
    <div class="pointer-events-none absolute inset-0 bg-black/55" aria-hidden="true" />

    <div
      v-if="logoUrl"
      class="absolute left-6 top-6 z-20 h-10 w-10 bg-[#9D8282]"
      :style="logoMaskStyle"
      role="img"
      :aria-label="t('paymentFailed.logoAlt')"
    />

    <div class="relative z-10 flex h-full min-h-0 items-center justify-center px-6">
      <div class="flex w-full max-w-[860px] flex-col items-center text-center gap-6">
        <img
          v-if="iconUrl"
          :src="iconUrl"
          alt=""
          class="h-[112px] w-[128px] object-contain"
        />

        <Heading
          no-wrap
          tag="h1"
          theme="custom"
          class="text-[24px] font-medium leading-[32px] md:leading-[44px] text-white md:text-[36px]"
          :text="t('paymentFailed.heading')"
        />

        <div class="flex flex-col gap-1">
          <Paragraph
            theme="custom"
            no-wrap
            class="text-[18px] font-medium leading-6 text-[#FCFCFD]"
            :text="t('paymentFailed.reasonLabel')"
          />
          <Paragraph
            theme="custom"
            no-wrap
            class="text-[14px] font-normal leading-5 text-[#F24822]"
            :text="t('paymentFailed.reason')"
          />
        </div>

        <Paragraph
          theme="custom"
          no-wrap
          class="max-w-[760px] text-[14px] font-normal leading-5 text-[#FCFCFD] sm:text-[14px]"
          :text="t('paymentFailed.help')"
        />

        <TwoPieceButton
          variant="two-piece"
          tag="button"
          type="button"
          skew-position="right"
          :text="t('paymentFailed.tryAgain')"
          root-class="group relative isolate inline-flex w-max cursor-pointer no-underline"
          main-class="relative z-10 flex h-10 items-center gap-2 bg-black px-4 text-[#07F468] transition-colors duration-300 group-hover:bg-[#07F468] group-hover:text-black"
          skew-class="pointer-events-none absolute left-1 top-1 z-0 h-full w-full bg-[#07F468] transition-colors duration-300 group-hover:bg-black"
          text-class="text-[18px] font-semibold uppercase tracking-wide text-[#07F468] transition-colors duration-300 group-hover:text-black"
          @click="goBack"
        >
          <template #icon>
            <svg class="h-5 w-5 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M13 8H3M3 8l4-4M3 8l4 4"
                stroke="currentColor"
                stroke-width="1.6"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </template>
        </TwoPieceButton>
      </div>
    </div>

    <div class="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-10">
      <button
        type="button"
        class="text-[14px] font-normal text-[#FCFCFD]"
        @click="goBack"
      >
        {{ t('paymentFailed.back') }}
      </button>
      <a
        href="mailto:support@fansocial.app"
        class="text-[14px] font-normal text-[#FCFCFD]"
      >
        {{ t('paymentFailed.support') }}
      </a>
    </div>
  </section>
</template>
