<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import MediaCardV1 from '@/components/ui/media/media-cards/MediaCardV1.vue';
import MerchCard from '@/dev/components/ui/card/dashboard/MerchCard.vue';
import TwoPieceButton from '@/components/ui/buttons/TwoPieceButton.vue';

const { t } = useI18n();
const router = useRouter();
const { url: heroUrl } = useAssetUrl('thankyouSubscription.hero');
const { url: logoUrl } = useAssetUrl('thankyou.logo');
const { url: avatarUrl } = useAssetUrl('checkout.demo.creatorAvatar');
const { url: verifiedUrl } = useAssetUrl('icon.media.verified');
const { url: playIconUrl } = useAssetUrl('thankyouSubscription.iconWatch');
const { url: videoPlayIconUrl } = useAssetUrl('thankyouSubscription.iconVideoPlay');
const { url: viewAllIconUrl } = useAssetUrl('icon.arrow.right');
const { url: arrowLeftUrl } = useAssetUrl('thankyouSubscription.iconArrowLeft');
const { url: arrowRightUrl } = useAssetUrl('thankyouSubscription.iconArrowRight');
const { url: merchBagIconUrl } = useAssetUrl('thankyouSubscription.iconMerchBag');
const { url: merchBgUrl } = useAssetUrl('plan.icon.checkoutHeader');
const { url: homeIconUrl } = useAssetUrl('thankyou.dashboardHome');
const { url: poster1Url } = useAssetUrl('subscriptionCard.demo.bg1');
const { url: poster2Url } = useAssetUrl('subscriptionCard.demo.bg2');
const { url: poster3Url } = useAssetUrl('subscriptionCard.demo.bg3');
const { url: poster4Url } = useAssetUrl('subscriptionCard.demo.bg4');
const { url: tokenIconUrl } = useAssetUrl('thankyouSubscription.iconTokens');
const { url: merchIconUrl } = useAssetUrl('thankyouSubscription.iconMerch');
const { url: ppvIconUrl } = useAssetUrl('thankyouSubscription.iconPpv');
const { url: customIconUrl } = useAssetUrl('thankyouSubscription.iconCustom');

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

const watchCards = computed(() => {
  const posters = [poster1Url.value, poster2Url.value, poster3Url.value, poster4Url.value];
  return Array.from({ length: 8 }, (_, index) => ({
    id: index + 1,
    type: 'video',
    poster: posters[index % posters.length],
    title: t('thankYouSubscription.cardTitle'),
    duration: '04:00:05',
    timeAgo: t('thankYouSubscription.timeAgo'),
    likes: '12k',
    views: '40',
  }));
});

const merchRow = ref(null);
const merchOverlay = 'linear-gradient(0deg, rgba(255,255,255,0.68) -3.06%, rgba(255,255,255,0) 144.5%), linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1))';
const merchOverlayHover = 'linear-gradient(0deg, rgba(255,255,255,0.9) -3.06%, rgba(255,255,255,0) 144.5%), linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))';
const merchDiscountOverlay = 'linear-gradient(0deg, rgba(255,205,41,0.68) -3.06%, rgba(255,205,41,0) 117.35%), linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1))';
const merchDiscountOverlayHover = 'linear-gradient(0deg, rgba(255,205,41,0.9) -3.06%, rgba(255,205,41,0) 117.35%), linear-gradient(0deg, rgba(0,0,0,0.25), rgba(0,0,0,0.25))';

const merchItems = computed(() => {
  const shared = {
    bgImage: merchBgUrl.value || '',
    title: t('thankYouSubscription.merchTitle'),
    currency: t('thankYouSubscription.merchCurrency'),
    price: t('thankYouSubscription.merchPrice'),
    finalPrice: t('thankYouSubscription.merchPrice'),
    description: t('thankYouSubscription.merchDescription'),
  };
  return Array.from({ length: 10 }, (_, index) => {
    const discounted = index % 4 === 3;
    return {
      id: `merch-${index + 1}`,
      ...shared,
      discountText: discounted ? t('thankYouSubscription.merchOff') : '',
      overlayBg: discounted ? merchDiscountOverlay : merchOverlay,
      overlayHoverBg: discounted ? merchDiscountOverlayHover : merchOverlayHover,
    };
  });
});

function scrollMerch(direction) {
  const row = merchRow.value;
  if (!row) return;
  row.scrollBy({ left: direction * 340, behavior: 'smooth' });
}

function goDashboard() {
  router.push('/dashboard');
}

const benefits = computed(() => [
  { key: 'tokens', icon: tokenIconUrl.value, label: t('thankYouSubscription.freeTokens'), value: t('thankYouSubscription.freeTokensValue') },
  { key: 'merch', icon: merchIconUrl.value, label: t('thankYouSubscription.merchDiscount'), value: t('thankYouSubscription.off10') },
  { key: 'ppv', icon: ppvIconUrl.value, label: t('thankYouSubscription.ppvDiscount'), value: t('thankYouSubscription.off10') },
  { key: 'custom', icon: customIconUrl.value, label: t('thankYouSubscription.customRequest'), value: t('thankYouSubscription.off5') },
]);
</script>

<template>
  <div class="relative min-h-screen bg-black">
    <div class="pointer-events-none absolute inset-x-0 top-0 h-[60%] overflow-hidden">
      <img
        v-if="heroUrl"
        :src="heroUrl"
        alt=""
        class="h-full w-full object-cover object-center"
      />
    </div>

    <div class="relative z-10 flex min-h-screen flex-col">
    <div class="flex flex-col p-[8px] sm:py-6 sm:px-4 gap-[200px]">
      <div
        v-if="logoUrl"
        class="h-10 w-10 shrink-0 bg-[#A7A2AA] "
        :style="logoMaskStyle"
        role="img"
        :aria-label="t('thankYouSubscription.logoAlt')"
      />

      <div class="flex  flex-1 items-center">
        <div class="flex w-full flex-col gap-4 lg:flex-row justify-between">
          <div class="flex flex-1 max-w-[644px] flex-col gap-4">
            <Heading
              no-wrap
              tag="h1"
              theme="custom"
              class="text-[32px] font-medium leading-[1.15] text-[#FFFFFF] sm:text-[48px]"
              :text="t('thankYouSubscription.heading')"
            />
            <Paragraph
              theme="custom"
              no-wrap
              class="text-[16px] font-medium leading-6 text-white sm:text-[20px]"
              :text="t('thankYouSubscription.memberOf')"
            />
            <Heading    
              no-wrap
              tag="h2"
              theme="custom"
              class="text-[28px] font-semibold leading-tight text-white sm:text-[48px]"
              :text="t('thankYouSubscription.lounge')"
            />
            <div class="flex items-center gap-2">
              <img
                v-if="avatarUrl"
                :src="avatarUrl"
                alt=""
                class="h-6 w-6 shrink-0 rounded-full object-cover"
              />
              <span class="text-[16px] font-medium text-white">{{ t('thankYouSubscription.creator') }}</span>
              <img
                v-if="verifiedUrl"
                :src="verifiedUrl"
                alt=""
                class="h-4 w-4 shrink-0"
              />
            </div>
          </div>

          <div class="flex flex-1 items-start w-full justify-end max-w-[644px] flex-col gap-4 lg:pt-2">
            <Paragraph
              theme="custom"
              no-wrap
              class="text-[14px] font-normal leading-6 text-[#EAECF0] sm:text-[16px]"
              :text="t('thankYouSubscription.offers')"
            />
            <ul class="flex flex-col gap-3 w-full">
              <li
                v-for="benefit in benefits"
                :key="benefit.key"
                class="flex items-center justify-between w-full"
              >
                <span class="flex flex-1 w-full items-center gap-2 text-[14px] font-medium text-[#EAECF0] sm:text-[20px]">
                  <img
                    v-if="benefit.icon"
                    :src="benefit.icon"
                    alt=""
                    class="h-5 w-5 shrink-0 object-contain"
                  />
                  {{ benefit.label }}
                </span>
                <span class="shrink-0 flex-1 text-start w-full text-[14px] font-medium text-[#EAECF0] sm:text-[20px]">{{ benefit.value }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-1 flex-col bg-[#FFFFFF03] px-2 py-6 sm:px-4 sm:pb-16 backdrop-blur-[10px]">
      <div class="mb-4 flex items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <img
            v-if="playIconUrl"
            :src="playIconUrl"s
            alt=""
            class="h-5 w-5 shrink-0 object-contain"
          />
          <span class="text-[16px] font-medium text-white">{{ t('thankYouSubscription.watchNow') }}</span>
        </div>
        <button type="button" class="flex items-center gap-1 text-[14px] font-medium uppercase tracking-wide text-white">
          {{ t('thankYouSubscription.viewAll') }}
          <img
            v-if="viewAllIconUrl"
            :src="viewAllIconUrl"
            alt=""
            class="h-4 w-4 brightness-0 invert"
          />
        </button>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
        <div
          v-for="card in watchCards"
          :key="card.id"
          class="relative min-w-0 [container-type:inline-size] [&_.video-container>div.absolute.left-0.bottom-0]:hidden [&_.video-container+div_.relative.shrink-0]:hidden"
        >
          <MediaCardV1 :media="card" variant="default" title-color="#FFFFFF" />
          <img
            v-if="videoPlayIconUrl"
            :src="videoPlayIconUrl"
            alt=""
            class="pointer-events-none absolute left-2 z-30 h-[40px] w-[40px] object-contain"
            style="top: calc(100cqw * 9 / 16 - 3rem)"
          />
        </div>
      </div>

      <div class="mt-6">
        <div class="mb-4 flex items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <img
              v-if="merchBagIconUrl"
              :src="merchBagIconUrl"
              alt=""
              class="h-5 w-5 shrink-0 object-contain"
            />
            <span class="text-[16px] font-medium text-white">{{ t('thankYouSubscription.merch') }}</span>
          </div>
          <div class="flex items-center gap-3">
            <button type="button" class="flex items-center" @click="scrollMerch(-1)">
              <img
                v-if="arrowLeftUrl"
                :src="arrowLeftUrl"
                alt=""
                class="h-[18px] w-[18px] object-contain"
              />
            </button>
            <button type="button" class="flex items-center" @click="scrollMerch(1)">
              <img
                v-if="arrowRightUrl"
                :src="arrowRightUrl"
                alt=""
                class="h-[18px] w-[18px] object-contain"
              />
            </button>
          </div>
        </div>

        <div
          ref="merchRow"
          class="flex gap-4 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div
            v-for="item in merchItems"
            :key="item.id"
            class=" shrink-0 w-[200px]"
          >
            <MerchCard
              class="h-[200px] w-[200px] shrink-0"
              title-below
              :bg-image="item.bgImage"
              :title="item.title"
              :currency="item.currency"
              :price="item.price"
              :final-price="item.finalPrice"
              :description="item.description"
              :discount-text="item.discountText"
              :overlay-bg="item.overlayBg"
              :overlay-hover-bg="item.overlayHoverBg"
            />
          </div>
        </div>
      </div>

    </div>
    </div>

    <div class="fixed bottom-0 right-0 z-30">
      <TwoPieceButton
        variant="link-x"
        tag="button"
        :text="t('thankYouSubscription.dashboardHome')"
        textClass="text-[18px] font-medium uppercase text-[#000000] group-hover:text-[#07F468] transition-colors duration-300"
        rootClass="pb-1 pl-[5px] filter drop-shadow-[-5px_4px_0px_#000] group enabled:hover:drop-shadow-[-5px_4px_0px_#07F468] w-max transition-all duration-300"
        contentWrapperClass="flex justify-center items-center gap-2.5 pl-6 pr-2 h-10 [clip-path:polygon(1rem_0%,100%_0%,100%_100%,0%_100%)] bg-[#07F468] group-hover:bg-black transition-all duration-300"
        type="button"
        @click="goDashboard"
      >
        <template #icon>
          <img
            v-if="homeIconUrl"
            :src="homeIconUrl"
            alt=""
            class="h-[18px] w-[18px] brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(83%)_sepia(37%)_saturate(2897%)_hue-rotate(81deg)_brightness(94%)_contrast(103%)]"
          />
        </template>
      </TwoPieceButton>
    </div>
  </div>
</template>
