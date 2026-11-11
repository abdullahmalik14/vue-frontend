<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import TwoPieceButton from '@/components/ui/buttons/TwoPieceButton.vue';
import SectionToggleHeader from '@/dev/components/checkout/reusable/SectionToggleHeader.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import MediaOrderSummaryList from '@/dev/components/thankyou/MediaOrderSummaryList.vue';
import { useCheckoutDemoAssets } from '@/dev/composables/useCheckoutDemoAssets.js';

const { t } = useI18n();
const router = useRouter();
const { assets } = useCheckoutDemoAssets();

const { url: heroUrl } = useAssetUrl('thankyou.hero');
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
const { url: homeIconUrl } = useAssetUrl('thankyou.dashboardHome');
const { url: orderDetailIconUrl } = useAssetUrl('thankyou.orderDetail');

const orderSummaryOpen = ref(true);

function goDashboard() {
  router.push('/dashboard');
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

    <div class="relative z-10 flex h-full min-h-0 flex-col justify-between overflow-y-auto overscroll-contain lg:flex-row lg:overflow-hidden">
      <div class="flex md:h-screen shrink-0 flex-col gap-6 py-4 px-2 md:py-6 md:px-4 lg:p-6  lg:h-auto lg:min-h-0 lg:flex-1 lg:overflow-hidden">
        <div
          v-if="logoUrl"
          class="h-10 w-10 bg-[#A7A2AA]"
          :style="logoMaskStyle"
          role="img"
          :aria-label="t('thankYou.logoAlt')"
        />

        <Heading
          no-wrap
          tag="h1"
          theme="custom"
          class=" font-medium leading-[60px] text-[#FFFFFF] text-[48px]"
          :text="t('thankYou.heading')"
        />

        <div class="md:mt-auto flex flex-col gap-6 lg:mt-0">
          <div class="flex flex-col gap-4">
            <div class="flex flex-col">
              <Paragraph
                theme="custom"
                no-wrap
                class="text-[18px] font-medium leading-[28px] text-[#FCFCFD]"
                :text="t('thankYou.orderReceived')"
              />
              <Paragraph
                theme="custom"
                no-wrap
                class="text-[18px] font-medium leading-[28px] text-[#FCFCFD]"
                :text="t('thankYou.dashboardHint')"
              />
            </div>
            <Paragraph
              theme="custom"
              no-wrap
              class="text-[18px] font-medium leading-[28px] text-[#FCFCFD]"
              :text="t('thankYou.help')"
            />
          </div>

          <TwoPieceButton
            variant="link-x"
            tag="button"
            :text="t('thankYou.dashboardHome')"
            textClass="text-[18px] font-medium uppercase text-[#000000] group-hover:text-[#07F468] transition-colors duration-300"
            type="button"
            @click="goDashboard"
          >
            <template #icon>
              <img
                v-if="homeIconUrl"
                :src="homeIconUrl"
                alt=""
                class="w-[18px] h-[18px] brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(83%)_sepia(37%)_saturate(2897%)_hue-rotate(81deg)_brightness(94%)_contrast(103%)]"
              />
            </template>
          </TwoPieceButton>
        </div>
      </div>

      <aside class=" relative flex w-full flex-col gap-6 bg-[#FFFFFF1A] py-4 px-2 md:py-6 md:px-4 lg:p-6 backdrop-blur-[80px] lg:h-full lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:[scrollbar-width:none] lg:[-ms-overflow-style:none] lg:[&::-webkit-scrollbar]:hidden">
        <section class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <img
              v-if="orderDetailIconUrl"
              :src="orderDetailIconUrl"
              alt=""
              class="h-5 w-5"
            />
            <Heading
              no-wrap
              tag="h2"
              theme="custom"
              class="text-[16px] font-semibold uppercase text-[#FCFCFD]"
              :text="t('thankYou.orderDetail')"
            />
          </div>

          <div class="grid grid-cols-2 gap-x-6 gap-y-4">
            <div class="flex flex-col gap-0.5">
              <span class="text-[14px] font-normal leading-5 text-[#07F468]">{{ t('thankYou.orderNumberLabel') }}</span>
              <span class="text-[16px] font-medium leading-6 text-[#FCFCFD]">{{ t('thankYou.orderId') }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-[14px] font-normal leading-5 text-[#07F468]">{{ t('thankYou.dateLabel') }}</span>
              <span class="text-[16px] font-medium leading-6 text-[#FCFCFD]">{{ t('thankYou.date') }}</span>
            </div>

            <div class="flex flex-col gap-0.5">
              <span class="text-[14px] font-normal leading-5 text-[#07F468]">{{ t('thankYou.emailLabel') }}</span>
              <span class="text-[16px] font-medium leading-6 text-[#FCFCFD]">{{ t('thankYou.email') }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-[14px] font-normal leading-5 text-[#07F468]">{{ t('thankYou.shippingLabel') }}</span>
              <span class="text-[16px] font-medium leading-6 text-[#FCFCFD]">{{ t('thankYou.address') }}</span>
            </div>

            <div class="flex flex-col gap-0.5">
              <span class="text-[14px] font-normal leading-5 text-[#07F468]">{{ t('thankYou.billingLabel') }}</span>
              <span class="text-[16px] font-medium leading-6 text-[#FCFCFD]">{{ t('thankYou.address') }}</span>
            </div>
            <div class="flex flex-col gap-0.5">
              <span class="text-[14px] font-normal leading-5 text-[#07F468]">{{ t('thankYou.paymentLabel') }}</span>
              <span class="text-[16px] font-medium leading-6 text-[#FCFCFD]">
                {{ t('thankYou.card') }}
                <span class="font-semibold">{{ t('thankYou.cardBrand') }}</span>
              </span>
            </div>

            <div class="flex flex-col gap-0.5">
              <span class="text-[14px] font-normal leading-5 text-[#07F468]">{{ t('thankYou.amountLabel') }}</span>
              <span class="text-[16px] font-medium leading-6 text-[#FCFCFD]">{{ t('thankYou.amount') }}</span>
            </div>
          </div>

          
        </section>

        <SectionToggleHeader
          :title="t('thankYou.orderSummary')"
          :icon="assets.generalIcon"
          v-model="orderSummaryOpen"
        >
          <MediaOrderSummaryList />

          <TwoPieceButton
      class="absolute bottom-0 right-0 z-20 lg:hidden"
      variant="link-x"
      tag="button"
      :text="t('thankYou.dashboardHome')"
      textClass="text-[18px] font-medium uppercase text-[#000000] group-hover:text-[#07F468] transition-colors duration-300"
      rootClass="pb-1 pr-[5px] filter drop-shadow-[5px_4px_0px_#000] group enabled:hover:drop-shadow-[5px_4px_0px_#07F468] w-max transition-all duration-300"
      contentWrapperClass="flex justify-center items-center gap-2.5 pl-6 pr-2 h-10 [clip-path:polygon(1rem_0%,100%_0%,100%_100%,0%_100%)] bg-[#07F468] group-hover:bg-black transition-all duration-300"
      type="button"
      @click="goDashboard"
    >
      <template #icon>
        <img
          v-if="homeIconUrl"
          :src="homeIconUrl"
          alt=""
          class="w-[18px] h-[18px] brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(83%)_sepia(37%)_saturate(2897%)_hue-rotate(81deg)_brightness(94%)_contrast(103%)]"
        />
      </template>
    </TwoPieceButton>
        </SectionToggleHeader>

        

      </aside>
    </div>

    
  </section>
</template>
