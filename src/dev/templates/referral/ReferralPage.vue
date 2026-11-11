<template>
  <DashboardSharedTwoColLayout>
    <div class="flex flex-col gap-6 min-h-[calc(100vh-2rem)] lg:min-h-[calc(100vh-5rem)]">
      <Heading
        :text="t('dashboard.menu.referrals')"
        tag="h1"
        theme="custom"
        no-wrap
        add-class="text-[1.875rem] leading-normal font-medium text-[#475467] dark:text-[#b1aaa0]"
      />

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5 lg:items-stretch">
        <!-- Left: promo banner -->
        <section class="relative min-h-[16.5rem] overflow-hidden lg:min-h-[17.5rem]">
          <img
            v-if="assets.bannerPhoto"
            src="/images/referral-img.png"
            alt=""
            class="absolute inset-0 h-[280px] w-full object-cover object-left"
          />

          <img src="/images/banner-cut.png" alt="" class="absolute bg-blur-[10px] left-[200px] top-0">

          <!-- Dark overlay panel with blur + Figma linear gradient -->
          <div class="absolute inset-y-0 right-0 z-[1] w-[68%] sm:w-[65%]">
            <div
              class="absolute"
              aria-hidden="true"
            />
            <div
              class="absolute inset-0 backdrop-blur-[100px] bg-[#00000080]"
              aria-hidden="true"
            />
            <div class="relative z-[1] flex h-full flex-col justify-center gap-3 py-4 pl-6 pr-4 sm:pl-8 sm:pr-6">
              <Heading
                :text="t('dashboard.referrals.promo.heading')"
                tag="h2"
                theme="custom"
                no-wrap
                add-class="text-center text-lg leading-snug font-bold text-white sm:text-xl"
              />

              <i18n-t
                keypath="dashboard.referrals.promo.body"
                tag="p"
                class="text-center text-xs leading-relaxed text-white sm:text-sm"
              >
                <template #username>
                  <span class="font-medium text-[#07F468]">{{ t('dashboard.referrals.promo.username') }}</span>
                </template>
                <template #bonus>
                  <span class="font-medium text-[#07F468]">{{ t('dashboard.referrals.promo.bonus') }}</span>
                </template>
              </i18n-t>

              <DashboardTextInput
                v-model="referralLink"
                :right-icon="assets.copyIcon"
                clickable-right-icon
                wrapper-class="!bg-[#00000080] !border-[#667085] ![box-shadow:none] dark:!bg-[#00000080] dark:!border-[#667085]"
                input-class="w-full max-w-full box-border truncate text-sm text-white border-none bg-transparent outline-none py-2 pointer-events-none placeholder:text-[#98A2B3]"
                @right-icon-click="copyReferralLink"
              />
              <span class="sr-only" aria-live="polite">{{ copied ? t('dashboard.referrals.copied') : '' }}</span>
            </div>
          </div>

         
        </section>

        <!-- Right: stacked earning cards -->
        <section class="flex min-h-[16.5rem] flex-col gap-3 lg:min-h-[17.5rem]">
          <!-- Total earning: gold panel on the left -->
          <div
            class="relative isolate flex min-h-0 flex-1 overflow-hidden bg-[#0A0A0A] border-b-2 border-[#F2C318]"
          >
            <div
              class="pointer-events-none absolute inset-y-0 left-0 w-[38%] bg-[#3F3D14]"
              style="clip-path: polygon(0 0, 100% 0, 62% 100%, 0 100%)"
              aria-hidden="true"
            />
            <div class="relative z-[1] flex h-full w-full items-center">
              <div class="flex w-[28%] shrink-0 items-center justify-center">
                <img
                  v-if="assets.coinsIcon"
                  :src="assets.coinsIcon"
                  alt=""
                  class="h-10 w-10 object-contain mix-blend-screen sm:h-12 sm:w-12"
                />
              </div>
              <div class="flex min-w-0 flex-col gap-1 py-4 pr-4">
                <p class="text-xs font-medium leading-normal text-[#F2C318] sm:text-sm">
                  {{ t('dashboard.referrals.totalEarning') }}
                </p>
                <p class="text-2xl font-bold leading-none text-[#F2C318] sm:text-[1.75rem]">
                  {{ t('dashboard.referrals.amountUsd', { amount: totalEarning }) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Monthly earning: gold panel on the right -->
          <div
            class="relative isolate flex min-h-0 flex-1 overflow-hidden bg-[#0A0A0A] border-b-2 border-[#F2C318]"
          >
            <div
              class="pointer-events-none absolute inset-y-0 right-0 w-[38%] bg-[#3F3D14]"
              style="clip-path: polygon(0 0, 100% 0, 100% 100%, 38% 100%)"
              aria-hidden="true"
            />
            <div class="relative z-[1] flex h-full w-full items-center">
              <div class="flex min-w-0 flex-1 flex-col gap-1 py-4 pl-5 pr-4">
                <p class="text-xs font-medium leading-normal text-white sm:text-sm">
                  {{ t('dashboard.referrals.monthlyEarning') }}
                </p>
                <p class="text-2xl font-bold leading-none text-white sm:text-[1.75rem]">
                  {{ t('dashboard.referrals.amountUsd', { amount: monthlyEarning }) }}
                </p>
              </div>
              <button
                type="button"
                class="flex w-[28%] shrink-0 flex-col items-center justify-center gap-1 self-stretch cursor-pointer"
                :aria-label="t('dashboard.referrals.details')"
              >
                <img
                  v-if="assets.arrowUpRight"
                  :src="assets.arrowUpRight"
                  alt=""
                  class="h-5 w-5 object-contain mix-blend-screen sm:h-6 sm:w-6"
                />
                <span class="text-xs font-medium leading-normal text-white sm:text-sm">
                  {{ t('dashboard.referrals.details') }}
                </span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </DashboardSharedTwoColLayout>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardSharedTwoColLayout from '@/templates/dashboard/shared/DashboardSharedTwoColLayout.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import { useReferralAssets } from '@/dev/composables/useReferralAssets.js';

const { t } = useI18n();
const { assets } = useReferralAssets();

const referralLink = ref('https://fs.codelinden.com/sign-up/?a=username');
const totalEarning = '4321.09';
const monthlyEarning = '543.21';
const copied = ref(false);

async function copyReferralLink() {
  try {
    await navigator.clipboard.writeText(referralLink.value);
    copied.value = true;
    window.setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {
    // clipboard may be unavailable
  }
}
</script>
