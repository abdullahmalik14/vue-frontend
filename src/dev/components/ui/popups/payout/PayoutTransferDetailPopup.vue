<template>
  <BasePopup
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :popup-config="popupConfig"
  >
    <div
      class="w-full min-h-[100dvh] relative overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] shadow-[0px_0px_10px_0px_#00000040] bg-[#F9FAFB]/90 md:w-[45rem] dark:bg-[#1b1d1e]/90"
    >
      <div
        class="absolute inset-0 w-full h-full md:backdrop-blur-[10px] pointer-events-none z-[-1]"
      />

      <div class="flex flex-col bg-[#EAECF0] md:bg-transparent dark:bg-[#222526]">
        <!-- header -->
        <div
          class="flex items-center gap-2 relative [background:linear-gradient(180deg,#F0F0F0_0%,rgba(240,240,240,0.75)_100%)]"
        >
          <div
            class="absolute inset-0 w-full h-full backdrop-blur-[25px] pointer-events-none z-[-1]"
          />

          <div
            class="flex justify-between items-center gap-2 p-2 w-full md:gap-3 md:px-4 md:py-3"
          >
            <button
              type="button"
              class="flex justify-center items-center md:hidden w-6 h-6"
              :aria-label="t('payout.transferDetail.ariaBack')"
              @click="handleClose"
            >
              <img
                :src="assets.chevronLeftAlt"
                alt=""
                class="w-full h-full [filter:brightness(0)_saturate(100%)]"
              />
            </button>

            <h1
              class="text-sm font-semibold text-[#344054] md:hidden dark:text-[#bdb8af]"
            >
              {{ t('payout.transferDetail.title') }}
            </h1>

            <button
              type="button"
              class="hidden md:flex justify-center items-center gap-1 cursor-pointer hover:opacity-80"
              @click="handleClose"
            >
              <img
                :src="assets.arrowLeft"
                alt=""
                class="w-4 h-4 [filter:brightness(0)] dark:[filter:brightness(100%)]"
              />
              <span
                class="text-xs leading-normal font-medium text-[#344054] dark:text-[#bdb8af]"
              >
                {{ t('payout.transferDetail.back') }}
              </span>
            </button>

            <!-- spacer so mobile title stays centered -->
            <div class="w-6 md:hidden" aria-hidden="true" />
          </div>
        </div>

        <!-- process (fail | processing) -->
        <div class="flex flex-col" :class="processTintClass">
          <div
            class="flex flex-col px-2 py-4 gap-6 [background:linear-gradient(0deg,rgba(255,255,255,0.8),rgba(255,255,255,0.8))] md:gap-10 md:px-4 md:py-6"
          >
            <div class="flex flex-col gap-1">
              <div class="flex flex-col gap-2">
                <h2
                  class="text-xl leading-normal font-medium md:text-4xl md:leading-[2.75rem] md:-tracking-[0.045rem]"
                  :class="titleClass"
                >
                  {{ titleText }}
                </h2>
                <p
                  v-if="isFailed"
                  class="text-sm text-black dark:text-[#e8e6e3]"
                >
                  {{ t('payout.transferDetail.failDescriptionPrefix') }}
                  <span class="font-medium">{{ failReason }}</span>
                </p>
              </div>

              <div v-if="isFailed" class="flex items-center gap-2 py-1">
                <DashboardPrimaryButton
                  :text="actionLabel"
                  variant="none"
                  :right-icon="assets.arrowUpRight"
                  right-icon-class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(100%)_sepia(5%)_saturate(7497%)_hue-rotate(193deg)_brightness(114%)_contrast(105%)]"
                  text-class="text-sm leading-6 font-medium tracking-[0.021875rem] text-white dark:text-[#e8e6e3]"
                  custom-class="flex justify-center items-center gap-2.5 p-2 h-9 bg-[#FF4405] enabled:hover:bg-[#FF4405]/80 dark:bg-[#c93300] dark:enabled:hover:bg-[#c93300]/80"
                  @click="emit('action', payout)"
                />
              </div>
            </div>

            <ProgressBar
              :progress="progressValue"
              :current-step="progressStep"
              :steps="progressSteps"
              :fill-class="progressFillClass"
              :track-class="progressTrackClass"
              wrapper-class="gap-4"
            />
          </div>
        </div>

        <!-- details -->
        <div class="flex flex-col gap-4 px-2 py-6 md:px-4">
          <div class="flex gap-4">
            <span
              class="text-sm text-[#344054] w-[7.5rem] shrink-0 sm:w-[12.5rem] dark:text-[#bdb8af]"
            >
              {{ t('payout.transferDetail.country') }}
            </span>
            <span class="text-base font-medium text-black dark:text-[#e8e6e3]">
              {{ country }}
            </span>
          </div>

          <div class="flex gap-4">
            <span
              class="text-sm text-[#344054] w-[7.5rem] shrink-0 sm:w-[12.5rem] dark:text-[#bdb8af]"
            >
              {{ t('payout.transferDetail.payoutMethod') }}
            </span>
            <div class="flex flex-col gap-2">
              <span class="text-base font-medium text-black dark:text-[#e8e6e3]">
                {{ payoutMethodLabel }}
              </span>
              <span class="text-sm text-[#182230] dark:text-[#d1cdc7]">
                {{ feeLabel }}
              </span>
            </div>
          </div>

          <div class="flex gap-4">
            <span
              class="text-sm text-[#344054] w-[7.5rem] shrink-0 sm:w-[12.5rem] dark:text-[#bdb8af]"
            >
              {{ t('payout.transferDetail.submittedOn') }}
            </span>
            <span class="text-base font-medium text-black dark:text-[#e8e6e3]">
              {{ submittedLabel }}
            </span>
          </div>

          <div class="flex gap-4">
            <span
              class="text-sm text-[#344054] w-[7.5rem] shrink-0 sm:w-[12.5rem] dark:text-[#bdb8af]"
            >
              {{ t('payout.transferDetail.payoutDetails') }}
            </span>
            <div class="flex flex-col gap-2">
              <span class="text-base font-medium text-black dark:text-[#e8e6e3]">
                {{ bankName }}
              </span>
              <span class="text-base font-medium text-black dark:text-[#e8e6e3]">
                {{ accountHolder }}
              </span>
              <span class="text-sm text-[#182230] dark:text-[#d1cdc7]">
                {{ accountEnding }}
              </span>
            </div>
          </div>

          <div class="flex gap-4">
            <span
              class="text-sm text-[#344054] w-[7.5rem] shrink-0 sm:w-[12.5rem] dark:text-[#bdb8af]"
            >
              {{ t('payout.transferDetail.withdrawAmount') }}
            </span>
            <div class="flex flex-col gap-2">
              <span class="text-base font-medium text-black dark:text-[#e8e6e3]">
                {{ withdrawAmount }}
              </span>
              <div class="h-[1.125rem]" />
            </div>
          </div>

          <div class="flex flex-col gap-4 sm:flex-row">
            <span
              class="text-sm text-[#344054] w-[7.5rem] shrink-0 sm:w-[12.5rem] dark:text-[#bdb8af]"
            >
              {{ t('payout.transferDetail.latestBalance') }}
            </span>

            <div class="flex flex-col gap-2 w-full">
              <div class="flex justify-between items-center gap-2">
                <span
                  class="text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3]"
                >
                  {{ t('payout.transferDetail.availableBalance') }}
                </span>
                <span
                  class="text-base font-semibold text-[#0C111D] shrink-0 dark:text-[#dbd8d3]"
                >
                  {{ availableBalance }}
                </span>
              </div>

              <div class="flex justify-between items-center gap-2">
                <span
                  class="text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]"
                >
                  {{ t('payout.transferDetail.payoutAmount') }}
                </span>
                <span
                  class="text-base text-[#0C111D] shrink-0 dark:text-[#dbd8d3]"
                >
                  {{ payoutAmount }}
                </span>
              </div>

              <div class="flex justify-between items-center gap-2">
                <span
                  class="text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]"
                >
                  {{ t('payout.transferDetail.serviceChargeBankDeposit') }}
                </span>
                <span
                  class="text-base text-[#0C111D] shrink-0 dark:text-[#dbd8d3]"
                >
                  {{ serviceCharge }}
                </span>
              </div>

              <hr
                class="border-b-[1px] border-b-black dark:border-b-[#363b3d]"
              />

              <div class="flex justify-between items-center gap-2">
                <span
                  class="text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]"
                >
                  {{ t('payout.transferDetail.balanceAfterPayout') }}
                </span>
                <span
                  class="text-base text-[#0C111D] shrink-0 dark:text-[#dbd8d3]"
                >
                  {{ balanceAfter }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BasePopup>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import ProgressBar from '@/components/ui/progress/ProgressBar.vue';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';

const { t } = useI18n();
const { assets } = usePayoutAssets();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  /** Active payout row from hero list / engine */
  payout: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'action']);

const popupConfig = {
  actionType: 'slideIn',
  from: 'right',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,
  shouldLockBodyScroll: true,
  width: { default: '100%', '>768': '45rem' },
  height: { default: '100%' },
};

const payoutStatus = computed(() => props.payout?.status || 'processing');
const isFailed = computed(() => payoutStatus.value === 'failed');
const isCompleted = computed(() => payoutStatus.value === 'completed');

const country = computed(() => props.payout?.country || t('payout.mock.countryUsa'));
const payoutMethodLabel = computed(
  () => props.payout?.payoutMethodLabel || t('payout.mock.methodLabelBankDepositEur'),
);
const feeLabel = computed(() => props.payout?.feeLabel || t('payout.mock.feeUsd345'));
const failReason = computed(
  () => props.payout?.failReason || t('payout.processing.defaults.failReason'),
);
const actionLabel = computed(
  () => props.payout?.actionLabel || t('payout.processing.defaults.actionUploadAddressProof'),
);

const submittedLabel = computed(() => {
  const raw =
    props.payout?.submittedOn ||
    props.payout?.submittedLabel ||
    props.payout?.date ||
    t('payout.mock.dateSample22012025');
  return String(raw)
    .replace(new RegExp(`^${t('payout.transferDetail.submittedOn')}\\s*`, 'i'), '')
    .trim();
});

const bankName = computed(
  () => props.payout?.bankName || t('payout.mock.bankNamePlaceholder'),
);
const accountHolder = computed(
  () => props.payout?.accountHolder || t('payout.mock.accountHolderMasked'),
);
const accountEnding = computed(
  () => props.payout?.accountEnding || t('payout.mock.accountEnding123'),
);
const withdrawAmount = computed(
  () =>
    props.payout?.withdrawAmountLabel ||
    (props.payout?.withdrawAmount
      ? `${t('payout.withdraw.usdPrefix')}${props.payout.withdrawAmount}`
      : t('payout.mock.withdrawAmountUsd120')),
);
const availableBalance = computed(
  () => props.payout?.availableBalance || t('payout.mock.availableBalanceUsd50099'),
);
const payoutAmount = computed(
  () => props.payout?.payoutAmount || t('payout.mock.payoutAmountMinus10'),
);
const serviceCharge = computed(
  () => props.payout?.serviceCharge || t('payout.mock.serviceChargeMinus345'),
);
const balanceAfter = computed(
  () => props.payout?.balanceAfter || t('payout.mock.balanceAfterDash'),
);

const titleText = computed(() => {
  if (isFailed.value) return t('payout.transferDetail.failedTitle');
  if (isCompleted.value) return t('payout.transferDetail.completedTitle');
  return t('payout.transferDetail.processingTitle');
});

const titleClass = computed(() =>
  isFailed.value
    ? 'text-[#FF4405] dark:text-[#ff571e]'
    : 'text-[#004EEB] dark:text-[#3f9dff]'
);

const processTintClass = computed(() =>
  isFailed.value
    ? '[background:linear-gradient(0deg,rgba(255,68,5,.5),rgba(255,68,5,.5))]'
    : '[background:linear-gradient(0deg,rgba(41,112,255,.5),rgba(41,112,255,.5))]'
);

const progressValue = computed(() => {
  if (isCompleted.value) return 100;
  return 50;
});

const progressStep = computed(() => {
  if (isCompleted.value) return 2;
  return 1;
});

const progressFillClass = computed(() =>
  isFailed.value
    ? 'bg-[#FF4405] dark:bg-[#c93300]'
    : 'bg-[#0c111d] dark:bg-[#0a0e17]'
);

const progressTrackClass = computed(() =>
  isFailed.value
    ? 'h-[0.375rem] bg-[#EAECF0] dark:bg-[#222526]'
    : 'h-[0.375rem] bg-white dark:bg-[#181a1b]'
);

const progressSteps = computed(() => {
  if (isFailed.value) {
    return [
      { label: t('payout.transferDetail.steps.pending') },
      {
        label: t('payout.transferDetail.steps.failToProcess'),
        labelClass: 'text-[#FF4405] dark:text-[#ff571e]',
        fontClass: 'font-medium',
        icon: assets.value.alertBlack,
        iconClass:
          '[filter:brightness(0)_saturate(100%)_invert(32%)_sepia(83%)_saturate(2544%)_hue-rotate(356deg)_brightness(100%)_contrast(105%)]',
      },
      {
        label: t('payout.transferDetail.steps.complete'),
        labelClass: 'text-[#98A2B3] dark:text-[#b0a993]',
      },
    ];
  }

  if (isCompleted.value) {
    return [
      { label: t('payout.transferDetail.steps.pending') },
      { label: t('payout.transferDetail.steps.processing') },
      { label: t('payout.transferDetail.steps.complete') },
    ];
  }

  return [
    { label: t('payout.transferDetail.steps.pending') },
    { label: t('payout.transferDetail.steps.processing') },
    {
      label: t('payout.transferDetail.steps.complete'),
      labelClass: 'text-[#98A2B3] dark:text-[#b0a993]',
    },
  ];
});

function handleClose() {
  emit('update:modelValue', false);
}
</script>
