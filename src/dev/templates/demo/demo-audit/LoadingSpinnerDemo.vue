<template>
  <div class="flex flex-col gap-12" data-component="loading-spinner-demo">
    <!-- ===== In use (project call sites) ===== -->
    <div class="flex flex-col gap-8">
      <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">
        {{ t('demo.spinner.groups.inUse') }}
      </span>

      <!-- DashboardAnalyticsTrendPopup -->
      <div class="flex flex-col items-start gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.spinner.usage.analyticsTrend') }}
        </span>
        <LoadingSpinner
          size="lg"
          :thickness="1.5"
          color="text-success"
          track-color="text-gray-200"
          :show-track="true"
        />
        <ShowCodeToggle :code="code.analyticsTrend" />
      </div>

      <!-- AddTierPopup loader -->
      <div class="flex flex-col items-start gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.spinner.usage.addTier') }}
        </span>
        <LoadingSpinner
          size="2xl"
          :thickness="1.5"
          color="text-success"
          track-color="text-gray-200"
          :show-track="true"
        />
        <ShowCodeToggle :code="code.addTier" />
      </div>

      <!-- OrderDetailsPopup -->
      <div class="flex flex-col items-start gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.spinner.usage.orderDetails') }}
        </span>
        <LoadingSpinner size="3xl" />
        <ShowCodeToggle :code="code.orderDetails" />
      </div>

      <!-- FlexChat — initial -->
      <div class="flex flex-col items-start gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.spinner.usage.flexChatInitial') }}
        </span>
        <LoadingSpinner thickness="2.5" size="lg" color="text-success" :show-track="false" />
        <ShowCodeToggle :code="code.flexChatInitial" />
      </div>

      <!-- FlexChat — load more -->
      <div class="flex flex-col items-start gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.spinner.usage.flexChatLoadMore') }}
        </span>
        <LoadingSpinner thickness="2.5" size="md" color="text-success" :show-track="false" />
        <ShowCodeToggle :code="code.flexChatLoadMore" />
      </div>

      <!-- ProceedPaymentAgreePopup -->
      <div class="flex flex-col items-start gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.spinner.usage.proceedPayment') }}
        </span>
        <LoadingSpinner
          :src="paymentSpinnerUrl"
          size=""
          custom-class="h-[120px] w-[120px]"
          alt=""
        />
        <ShowCodeToggle :code="code.proceedPayment" />
      </div>

      <!-- UpgradeTierPopup -->
      <div class="flex flex-col items-start gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.spinner.usage.upgradeTier') }}
        </span>
        <LoadingSpinner
          :src="paymentSpinnerUrl"
          size=""
          custom-class="h-6 w-6"
          alt=""
        />
        <ShowCodeToggle :code="code.upgradeTier" />
      </div>

      <!-- TipStep1 — custom slot -->
      <div class="flex flex-col items-start gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.spinner.usage.tipStep') }}
        </span>
        <div class="w-28 h-28 relative">
          <LoadingSpinner size="" wrapper-class="w-24 h-24 left-[12px] top-[12px] absolute">
            <template #spinner>
              <div
                class="w-24 h-24 bg-[conic-gradient(from_180deg_at_50.00%_50.00%,_#07F468_0deg,_rgba(7,_244,_104,_0)_360deg)] rounded-full [mask-image:radial-gradient(transparent_55%,_black_66%)] [-webkit-mask-image:radial-gradient(transparent_55%,_black_66%)]"
              />
            </template>
          </LoadingSpinner>
        </div>
        <ShowCodeToggle :code="code.tipStep" />
      </div>

      <!-- DashboardPrimaryButton / TwoPieceButton default loading spinner -->
      <div class="flex flex-col items-start gap-3">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.spinner.usage.buttonLoading') }}
        </span>
        <LoadingSpinner
          size="sm"
          color="text-current"
          :show-track="false"
          thickness="4"
        />
        <ShowCodeToggle :code="code.buttonLoading" />
      </div>
    </div>

    <!-- ===== Variations ===== -->
    <div class="flex flex-col gap-8">
      <span class="text-xs text-gray-500 uppercase tracking-wider font-semibold">
        {{ t('demo.spinner.groups.variations') }}
      </span>

      <!-- Sizes -->
      <div class="flex flex-col gap-4">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.spinner.groups.sizes') }}
        </span>
        <div class="flex flex-wrap items-end gap-8">
          <div
            v-for="size in sizeOptions"
            :key="size"
            class="flex flex-col items-start gap-3"
          >
            <LoadingSpinner
              :size="size"
              :thickness="3.5"
              color="text-success"
              track-color="text-gray-200"
              :show-track="true"
            />
            <ShowCodeToggle :code="sizeSnippet(size)" />
          </div>
        </div>
      </div>

      <!-- Theme colours -->
      <div class="flex flex-col gap-4">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.spinner.groups.themeColors') }}
        </span>
        <div class="flex flex-col gap-8">
        <div
          v-for="item in themeColorVariants"
          :key="item.id"
            class="flex flex-col items-start gap-3"
          >
            <span class="text-[10px] text-gray-400 uppercase tracking-wider">
              {{ t(item.labelKey) }}
            </span>
          <LoadingSpinner
            size="xl"
            thickness="3.5"
            :color="item.color"
            :track-color="item.trackColor"
              :show-track="true"
          />
          <ShowCodeToggle :code="item.code" />
        </div>
      </div>
    </div>

    <!-- Track / thickness / speed -->
      <div class="flex flex-col gap-4">
        <span class="text-[10px] text-gray-400 uppercase tracking-wider">
          {{ t('demo.spinner.groups.trackThicknessSpeed') }}
        </span>
        <div class="flex flex-col gap-8">
          <div class="flex flex-col items-start gap-3">
            <span class="text-[10px] text-gray-400 uppercase tracking-wider">
              {{ t('demo.spinner.noTrack') }}
            </span>
            <LoadingSpinner
              size="xl"
              thickness="3.5"
              color="text-success"
              :show-track="false"
            />
            <ShowCodeToggle :code="code.noTrack" />
        </div>

          <div class="flex flex-col items-start gap-3">
            <span class="text-[10px] text-gray-400 uppercase tracking-wider">
              {{ t('demo.spinner.svgThin') }}
            </span>
            <LoadingSpinner
              size="3xl"
              thickness="1"
              color="text-success"
              track-color="text-gray-100"
              :show-track="true"
            />
            <ShowCodeToggle :code="code.thin" />
        </div>

          <div class="flex flex-col items-start gap-3">
            <span class="text-[10px] text-gray-400 uppercase tracking-wider">
              {{ t('demo.spinner.thick') }}
            </span>
            <LoadingSpinner
              size="xl"
              thickness="6"
              color="text-success"
              track-color="text-gray-200"
              :show-track="true"
            />
            <ShowCodeToggle :code="code.thick" />
        </div>

          <div class="flex flex-col items-start gap-3">
            <span class="text-[10px] text-gray-400 uppercase tracking-wider">
              {{ t('demo.spinner.speedSlow') }}
            </span>
            <LoadingSpinner
              size="xl"
              thickness="3.5"
              color="text-success"
              track-color="text-gray-200"
              :show-track="true"
              speed="slow"
            />
            <ShowCodeToggle :code="code.speedSlow" />
        </div>

          <div class="flex flex-col items-start gap-3">
            <span class="text-[10px] text-gray-400 uppercase tracking-wider">
              {{ t('demo.spinner.speedFast') }}
            </span>
            <LoadingSpinner
              size="xl"
              thickness="3.5"
              color="text-success"
              track-color="text-gray-200"
              :show-track="true"
              speed="fast"
            />
            <ShowCodeToggle :code="code.speedFast" />
        </div>

          <div class="flex flex-col items-start gap-3">
            <span class="text-[10px] text-gray-400 uppercase tracking-wider">
              {{ t('demo.spinner.withText') }}
            </span>
          <LoadingSpinner
            size="md"
            thickness="3.5"
            color="text-success"
            track-color="text-gray-200"
              :show-track="true"
              :text="t('common.loading')"
            text-class="text-xs font-medium text-light-text-secondary"
          />
            <ShowCodeToggle :code="code.withText" />
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';

const { t } = useI18n();
const { url: paymentSpinnerUrl } = useAssetUrl('checkout.paymentSpinner');

const sizeOptions = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];

function sizeSnippet(size) {
  return `<LoadingSpinner
  size="${size}"
  :thickness="3.5"
  color="text-success"
  track-color="text-gray-200"
  :show-track="true"
/>`;
}

const themeColorVariants = [
  {
    id: 'success',
    labelKey: 'demo.spinner.colorSuccess',
    color: 'text-success',
    trackColor: 'text-gray-200',
    code: `<LoadingSpinner
  size="xl"
  thickness="3.5"
  color="text-success"
  track-color="text-gray-200"
  :show-track="true"
/>`,
  },
  {
    id: 'brand-pink',
    labelKey: 'demo.spinner.colorBrandPink',
    color: 'text-brand-pink',
    trackColor: 'text-gray-200',
    code: `<LoadingSpinner
  size="xl"
  thickness="3.5"
  color="text-brand-pink"
  track-color="text-gray-200"
  :show-track="true"
/>`,
  },
  {
    id: 'primary-blue',
    labelKey: 'demo.spinner.colorPrimary',
    color: 'text-light-primary',
    trackColor: 'text-gray-200',
    code: `<LoadingSpinner
  size="xl"
  thickness="3.5"
  color="text-light-primary"
  track-color="text-gray-200"
  :show-track="true"
/>`,
  },
  {
    id: 'ink',
    labelKey: 'demo.spinner.colorInk',
    color: 'text-light-text-primary',
    trackColor: 'text-gray-200',
    code: `<LoadingSpinner
  size="xl"
  thickness="3.5"
  color="text-light-text-primary"
  track-color="text-gray-200"
  :show-track="true"
/>`,
  },
];

const code = {
  analyticsTrend: `import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';

<LoadingSpinner
  size="lg"
  :thickness="1.5"
  color="text-success"
  track-color="text-gray-200"
  :show-track="true"
/>`,

  addTier: `import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';

<LoadingSpinner
  size="2xl"
  :thickness="1.5"
  color="text-success"
  track-color="text-gray-200"
  :show-track="true"
/>`,

  orderDetails: `import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';

<LoadingSpinner size="3xl" />`,

  flexChatInitial: `import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';

<LoadingSpinner
  thickness="2.5"
  size="lg"
  color="text-success"
  :show-track="false"
/>`,

  flexChatLoadMore: `import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';

<LoadingSpinner
  thickness="2.5"
  size="md"
  color="text-success"
  :show-track="false"
/>`,

  proceedPayment: `import { useAssetUrl } from '@/composables/useAssetUrl.js';
import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';

const { url: paymentSpinnerUrl } = useAssetUrl('checkout.paymentSpinner');

<LoadingSpinner
  :src="paymentSpinnerUrl"
  size=""
  custom-class="h-[120px] w-[120px]"
  alt=""
/>`,

  upgradeTier: `import { useAssetUrl } from '@/composables/useAssetUrl.js';
import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';

const { url: paymentSpinnerUrl } = useAssetUrl('checkout.paymentSpinner');

<LoadingSpinner
  :src="paymentSpinnerUrl"
  size=""
  custom-class="h-6 w-6"
  alt=""
/>`,

  tipStep: `import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';

<LoadingSpinner size="" wrapper-class="w-24 h-24 left-[12px] top-[12px] absolute">
  <template #spinner>
    <div
      class="w-24 h-24 bg-[conic-gradient(from_180deg_at_50.00%_50.00%,_#07F468_0deg,_rgba(7,_244,_104,_0)_360deg)] rounded-full [mask-image:radial-gradient(transparent_55%,_black_66%)] [-webkit-mask-image:radial-gradient(transparent_55%,_black_66%)]"
    />
  </template>
</LoadingSpinner>`,

  buttonLoading: `import LoadingSpinner from '@/components/ui/spinners/LoadingSpinner.vue';

<LoadingSpinner
  size="sm"
  color="text-current"
  :show-track="false"
  thickness="4"
/>`,

  noTrack: `<LoadingSpinner
  size="xl"
  thickness="3.5"
  color="text-success"
  :show-track="false"
/>`,

  thin: `<LoadingSpinner
  size="3xl"
  thickness="1"
  color="text-success"
  track-color="text-gray-100"
  :show-track="true"
/>`,

  thick: `<LoadingSpinner
  size="xl"
  thickness="6"
  color="text-success"
  track-color="text-gray-200"
  :show-track="true"
/>`,

  speedSlow: `<LoadingSpinner
  size="xl"
  thickness="3.5"
  color="text-success"
  track-color="text-gray-200"
  :show-track="true"
  speed="slow"
/>`,

  speedFast: `<LoadingSpinner
  size="xl"
  thickness="3.5"
  color="text-success"
  track-color="text-gray-200"
  :show-track="true"
  speed="fast"
/>`,

  withText: `<LoadingSpinner
  size="md"
  thickness="3.5"
  color="text-success"
  track-color="text-gray-200"
  :show-track="true"
  :text="t('common.loading')"
  text-class="text-xs font-medium text-light-text-secondary"
/>`,
};
</script>
