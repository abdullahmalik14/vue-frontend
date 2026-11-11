<template>
  <div
    data-process-item
    class="relative flex flex-col gap-4 p-3 shadow-[0px_2px_8px_0px_#00000040] md:gap-6"
    :class="rootClass"
  >
    <!-- Top: meta + progress (same as processing row) -->
    <div
      class="flex flex-col gap-4 w-full md:gap-6"
      :class="
        isMulti
          ? 'min-[700px]:flex-row min-[700px]:justify-between min-[700px]:items-center'
          : ''
      "
    >
      <div
        class="flex justify-between gap-2"
        :class="isMulti ? 'min-[700px]:items-center min-[700px]:shrink-0' : ''"
      >
        <div class="flex flex-col gap-2 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <template v-if="loading">
              <div
                class="w-[6.25rem] h-4 rounded-sm opacity-20 bg-[#667085] animate-skeleton-loading dark:bg-[#535c6d]"
              />
              <PayoutMethodBadge loading />
            </template>
            <template v-else>
              <span class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
                {{ amount }}
              </span>
              <PayoutMethodBadge :country="country" :method="method" />
            </template>
          </div>

          <div v-if="loading" class="flex items-center gap-2">
            <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{
              t('payout.processing.submittedOn')
            }}</span>
            <div
              class="w-[6.25rem] h-4 rounded-sm opacity-20 bg-[#667085] animate-skeleton-loading dark:bg-[#535c6d]"
            />
          </div>
          <span v-else class="text-sm text-[#667085] dark:text-[#9e9589]">
            {{ submittedLabel }}
          </span>
        </div>

        <!-- Mobile / single: search beside meta -->
        <button
          type="button"
          class="flex justify-center items-center w-6 h-6 shrink-0"
          :class="isMulti ? 'min-[700px]:hidden' : ''"
          :aria-label="loading ? t('payout.processing.aria.loadingPayout') : t('payout.processing.aria.viewPayoutDetails')"
          :disabled="loading"
          @click="!loading && $emit('detail')"
        >
          <img
            v-if="loading"
            :src="assets.loader"
            :alt="t('payout.alt.loader')"
            class="w-full h-full animate-[spin_1.3s_linear_infinite] [filter:brightness(0)_saturate(100%)_invert(42%)_sepia(16%)_saturate(519%)_hue-rotate(183deg)_brightness(100%)_contrast(88%)]"
          />
          <img
            v-else
            :src="assets.search"
            :alt="t('payout.alt.search')"
            class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(42%)_sepia(16%)_saturate(519%)_hue-rotate(183deg)_brightness(100%)_contrast(88%)]"
          />
        </button>
      </div>

      <!-- Progress + search aligned to track (desktop multi) -->
      <div
        class="flex w-full"
        :class="
          isMulti
            ? 'items-start gap-2 min-[700px]:max-w-[calc(22.5rem+1.75rem)]'
            : 'flex-col'
        "
      >
        <ProgressBar
          :progress="progress"
          :current-step="currentStep"
          :steps="progressSteps"
          :fill-class="progressFillClass"
          :track-class="progressTrackClass"
          :wrapper-class="progressWrapperClass"
        />

        <button
          v-if="isMulti"
          type="button"
          class="hidden min-[700px]:flex justify-center items-center w-6 h-6 shrink-0 mt-1"
          :aria-label="loading ? t('payout.processing.aria.loadingPayout') : t('payout.processing.aria.viewPayoutDetails')"
          :disabled="loading"
          @click="!loading && $emit('detail')"
        >
          <img
            v-if="loading"
            :src="assets.loader"
            :alt="t('payout.alt.loader')"
            class="w-full h-full animate-[spin_1.3s_linear_infinite] [filter:brightness(0)_saturate(100%)_invert(42%)_sepia(16%)_saturate(519%)_hue-rotate(183deg)_brightness(100%)_contrast(88%)]"
          />
          <img
            v-else
            :src="assets.search"
            :alt="t('payout.alt.search')"
            class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(42%)_sepia(16%)_saturate(519%)_hue-rotate(183deg)_brightness(100%)_contrast(88%)]"
          />
        </button>
      </div>
    </div>

    <!-- Fail reason + CTA below the top row (matches design) -->
    <div
      v-if="!loading && isFailed && showFailDetails"
      class="flex flex-col gap-2 w-full min-w-0"
    >
      <p class="text-xs leading-normal text-black md:text-sm dark:text-[#e8e6e3]">
        {{ t('payout.processing.failDescriptionPrefix') }}
        <span class="font-medium">{{ resolvedFailReason }}</span>
      </p>
      <DashboardPrimaryButton
        :text="resolvedActionLabel"
        theme="payoutFail"
        :right-icon="assets.arrowUpRight"
        @click="$emit('action')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ProgressBar from '@/components/ui/progress/ProgressBar.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import PayoutMethodBadge from '@/dev/components/ui/card/dashboard/PayoutMethodBadge.vue';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';

const { t } = useI18n();
const { assets } = usePayoutAssets();

const props = defineProps({
  amount: { type: String, default: '' },
  country: { type: String, default: '' },
  method: { type: String, default: '' },
  /** Full line e.g. "Submitted on 22 Jan 2025" or a date string */
  submittedOn: { type: String, default: '' },
  date: { type: String, default: '' },
  /**
   * pending | processing | failed | completed
   */
  status: {
    type: String,
    default: 'processing',
    validator: (v) => ['pending', 'processing', 'failed', 'completed'].includes(v),
  },
  statusStep: { type: Number, default: 1 },
  /** single = stacked card; multi = row layout + border on desktop */
  layout: {
    type: String,
    default: 'single',
    validator: (v) => ['single', 'multi'].includes(v),
  },
  loading: { type: Boolean, default: false },
  failReason: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
  /** Show reason + CTA below the progress row */
  showFailDetails: { type: Boolean, default: false },
  /** Middle label when failed */
  failStepLabel: { type: String, default: '' },
});

defineEmits(['detail', 'action']);

const isMulti = computed(() => props.layout === 'multi');
const isFailed = computed(() => props.status === 'failed');

const resolvedFailReason = computed(
  () => props.failReason || t('payout.processing.defaults.failReason')
);
const resolvedActionLabel = computed(
  () => props.actionLabel || t('payout.processing.defaults.actionUploadAddressProof')
);
const resolvedFailStepLabel = computed(
  () => props.failStepLabel || t('payout.processing.steps.failToProcess')
);

const submittedLabel = computed(() => {
  if (props.submittedOn) return props.submittedOn;
  if (props.date) {
    return props.date.toLowerCase().startsWith('submitted')
      ? props.date
      : t('payout.processing.submittedOnDate', { date: props.date });
  }
  return t('payout.processing.submittedOnEmpty');
});

const rootClass = computed(() => {
  // Card stays column; only the top meta/progress row goes horizontal on multi
  const multi =
    'min-[700px]:border-[1.5px] min-[700px]:border-white min-[700px]:pr-3 lg:w-[50rem] dark:min-[700px]:border-[#303436]';
  const single = 'lg:max-w-[32.75rem]';

  if (props.loading) {
    return [isMulti.value ? multi : single, 'bg-white/25 dark:bg-[#181a1b]/25'];
  }

  if (isFailed.value) {
    return [
      isMulti.value ? multi : single,
      '[background:linear-gradient(0deg,rgba(255,255,255,0.25),rgba(255,255,255,0.25)),linear-gradient(0deg,rgba(255,68,5,0.05),rgba(255,68,5,0.05))]',
    ];
  }

  return [isMulti.value ? multi : single, 'bg-white/25 dark:bg-[#181a1b]/25'];
});

const currentStep = computed(() => {
  if (props.loading) return 1;
  if (props.status === 'pending') return 0;
  if (props.status === 'failed' || props.status === 'processing') return 1;
  if (props.status === 'completed') return 2;
  return Math.min(2, Math.max(0, Number(props.statusStep) || 0));
});

const progress = computed(() => {
  if (props.loading) return 50;
  const map = { 0: 0, 1: 50, 2: 100 };
  return map[currentStep.value] ?? 50;
});

const progressFillClass = computed(() => {
  if (props.loading) return 'bg-[#CACCCE] dark:bg-[#35393b]';
  if (isFailed.value) return 'bg-[#FF4405] dark:bg-[#c93300]';
  return 'bg-[#0c111d] dark:bg-[#0a0e17]';
});

const progressTrackClass = computed(() =>
  isFailed.value && !props.loading
    ? 'h-[0.375rem] bg-white dark:bg-[#181a1b]'
    : 'h-[0.375rem]'
);

const progressWrapperClass = computed(() => {
  if (isMulti.value) return 'w-full min-w-0 flex-1 min-[700px]:gap-4 min-[700px]:max-w-[22.5rem] gap-2';
  return 'w-full md:gap-4 lg:max-w-[31.25rem] gap-2';
});

const progressSteps = computed(() => {
  if (props.loading) {
    return [
      { label: t('payout.processing.steps.pending'), labelClass: 'opacity-0' },
      { label: t('payout.processing.steps.processing'), labelClass: 'opacity-0' },
      { label: t('payout.processing.steps.completed'), labelClass: 'opacity-0' },
    ];
  }

  if (isFailed.value) {
    return [
      { label: t('payout.processing.steps.pending') },
      {
        label: resolvedFailStepLabel.value,
        labelClass: 'text-[#FF4405] dark:text-[#ff571e]',
        fontClass: 'font-medium',
        icon: assets.value.alertBlack,
        iconClass:
          '[filter:brightness(0)_saturate(100%)_invert(32%)_sepia(83%)_saturate(2544%)_hue-rotate(356deg)_brightness(100%)_contrast(105%)]',
      },
      { label: t('payout.processing.steps.complete'), labelClass: 'text-[#98A2B3] dark:text-[#b0a993]' },
    ];
  }

  return [
    { label: t('payout.processing.steps.pending') },
    { label: t('payout.processing.steps.processing') },
    { label: t('payout.processing.steps.completed') },
  ];
});
</script>
