<template>
  <div
    class="flex flex-col w-full px-2 min-[700px]:px-0 xl:px-6"
    :class="isMulti ? '' : 'lg:px-6'"
  >
    <!-- Single failed: keep hero NotificationCard (existing) -->
    <template v-if="isSingleFailed">
      <div class="flex flex-col gap-4">
        <NotificationCard
          v-model="alertOpen"
          variant="error"
          theme="payoutFail"
          :show-icon="false"
          :closable="false"
          :title="resolvedFailTitle"
          :description="singleFailDescription"
        >
          <DashboardPrimaryButton
            :text="singleActionLabel"
            theme="payoutFail"
            :right-icon="assets.arrowUpRight"
            @click="emitAction(normalizedPayouts[0])"
          />
        </NotificationCard>

        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-base font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
              {{ normalizedPayouts[0]?.amount }}
            </span>
            <PayoutMethodBadge
              :country="normalizedPayouts[0]?.country"
              :method="normalizedPayouts[0]?.method"
            />
          </div>
          <span class="text-base text-[#0C111D] dark:text-[#dbd8d3]">
            {{ normalizedPayouts[0]?.date || '' }}
          </span>
        </div>

        <ProgressBar
          :progress="50"
          :current-step="1"
          :steps="singleFailSteps"
          fill-class="bg-[#FF4405] dark:bg-[#c93300]"
          wrapper-class="lg:max-w-[31.25rem]"
        />
      </div>
    </template>

    <!-- Processing list (single card or multi list) -->
    <template v-else>
      <div class="flex flex-col gap-4 w-full">
        <div class="flex items-start justify-between gap-3 px-0">
          <Heading
            tag="h2"
            theme="custom"
            no-wrap
            :add-class="`text-xl leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3] ${
              isMulti
                ? 'md:text-3xl md:leading-[2.375rem]'
                : 'md:text-4xl md:leading-[2.75rem] md:tracking-[-0.045rem]'
            }`"
            :text="isMulti ? t('payout.processing.multiTitle', { count: totalCount }) : t('payout.processing.singleTitle')"
          />

          <button
            v-if="isMulti && showViewAll"
            type="button"
            class="shrink-0 flex items-center gap-1 text-sm font-medium uppercase tracking-wide text-[#344054] mt-1"
            @click="$emit('view-all')"
          >
            {{ t('payout.processing.viewAll') }}
            <img
              :src="assets.arrowUpRight"
              :alt="t('payout.alt.arrowUpRight')"
              class="w-3.5 h-3.5 [filter:brightness(0)_saturate(100%)_invert(32%)_sepia(98%)_saturate(2000%)_hue-rotate(212deg)_brightness(96%)_contrast(96%)]"
            />
          </button>
        </div>

        <div data-process-items-container class="flex flex-col gap-[8px]">
          <PayoutProcessItem
            v-for="item in visiblePayouts"
            :key="item.id || `${item.amount}-${item.date}-${item.status}`"
            :amount="item.amount"
            :country="item.country"
            :method="item.method"
            :date="item.date"
            :submitted-on="item.submittedOn"
            :status="item.status || 'processing'"
            :status-step="item.statusStep"
            :loading="loading || !!item.loading"
            :layout="itemLayout"
            :fail-reason="item.failReason || failReason"
            :action-label="item.actionLabel || actionLabel"
            :fail-step-label="item.failStepLabel || resolvedFailStepLabel"
            :show-fail-details="isMulti && (item.status || '') === 'failed'"
            @detail="emitDetail(item)"
            @action="emitAction(item)"
          />

          <div v-if="hiddenCount > 0 || isExpanded" class="flex items-center gap-2 px-2">
            <button
              type="button"
              data-view-more-less-button
              class="flex items-center gap-0.5"
              @click="isExpanded = !isExpanded"
            >
              <img
                :src="assets.ellipsis"
                :alt="t('payout.alt.more')"
                class="w-5 h-5 [filter:brightness(0)_saturate(100%)_invert(25%)_sepia(36%)_saturate(7124%)_hue-rotate(218deg)_brightness(97%)_contrast(93%)]"
              />
              <span
                data-view-more-less-text
                class="text-sm font-medium text-[#155EEF] dark:text-[#2c8df1]"
              >
                {{
                  isExpanded
                    ? t('payout.processing.viewLess')
                    : t('payout.processing.more', { count: hiddenCount })
                }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ProgressBar from '@/components/ui/progress/ProgressBar.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import PayoutMethodBadge from '@/dev/components/ui/card/dashboard/PayoutMethodBadge.vue';
import PayoutProcessItem from '@/dev/components/ui/card/dashboard/PayoutProcessItem.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';

const { t } = useI18n();
const { assets } = usePayoutAssets();

const props = defineProps({
  /**
   * Preferred API — list of active payouts from engine.
   * Each: { id?, amount, country, method, date|submittedOn, status, failReason?, actionLabel?, loading? }
   */
  payouts: {
    type: Array,
    default: () => [],
  },
  /** Legacy single-payout props (still supported) */
  amount: { type: String, default: '' },
  country: { type: String, default: '' },
  method: { type: String, default: '' },
  date: { type: String, default: '' },
  status: {
    type: String,
    default: 'processing',
    validator: (v) => ['pending', 'processing', 'failed', 'completed'].includes(v),
  },
  statusStep: { type: Number, default: 1 },
  failReason: { type: String, default: '' },
  failTitle: {
    type: String,
    default: '',
  },
  actionLabel: { type: String, default: '' },
  /** Skeleton list while fetching */
  loading: { type: Boolean, default: false },
  /** How many items before "+ N more" */
  previewLimit: { type: Number, default: 2 },
  showViewAll: { type: Boolean, default: false },
});

const emit = defineEmits(['action', 'detail', 'view-all']);

const alertOpen = ref(true);
const isExpanded = ref(false);

const resolvedFailTitle = computed(() => props.failTitle || t('payout.processing.failTitle'));
const resolvedFailStepLabel = computed(() => t('payout.processing.steps.failToProcess'));
const resolvedDefaultFailReason = computed(() => t('payout.processing.defaults.failReason'));
const resolvedDefaultActionLabel = computed(
  () => t('payout.processing.defaults.actionUploadAddressProof')
);
const resolvedDefaultAmount = computed(() => t('payout.mock.amountEur'));
const resolvedDefaultCountry = computed(() => t('payout.mock.countryUsa'));
const resolvedDefaultMethod = computed(() => t('payout.mock.methodBankDeposit'));

function formatSubmittedOn(date) {
  if (!date) return '';
  return date.toLowerCase().startsWith('submitted')
    ? date
    : t('payout.processing.submittedOnDate', { date });
}

function mapPayout(p, i) {
  return {
    id: p.id ?? `payout-${i}`,
    amount: p.amount ?? props.amount ?? resolvedDefaultAmount.value,
    country: p.country ?? props.country ?? resolvedDefaultCountry.value,
    method: p.method ?? props.method ?? resolvedDefaultMethod.value,
    date: p.date ?? '',
    submittedOn: p.submittedOn || '',
    status: p.status || 'processing',
    statusStep: p.statusStep ?? 1,
    failReason: p.failReason,
    actionLabel: p.actionLabel,
    failStepLabel: p.failStepLabel,
    loading: !!p.loading || props.loading,
  };
}

const normalizedPayouts = computed(() => {
  if (props.payouts?.length) {
    return props.payouts.map(mapPayout);
  }

  // Loading with no data yet → skeleton rows for multi preview
  if (props.loading) {
    return Array.from({ length: Math.max(2, props.previewLimit) }, (_, i) => ({
      id: `skeleton-${i}`,
      amount: '',
      country: '',
      method: '',
      date: '',
      submittedOn: '',
      status: 'processing',
      statusStep: 1,
      loading: true,
    }));
  }

  // Legacy single object via flat props
  const legacyDate = props.date;
  return [
    {
      id: 'payout-0',
      amount: props.amount || resolvedDefaultAmount.value,
      country: props.country || resolvedDefaultCountry.value,
      method: props.method || resolvedDefaultMethod.value,
      date: legacyDate,
      submittedOn: formatSubmittedOn(legacyDate),
      status: props.status,
      statusStep: props.statusStep,
      failReason: props.failReason,
      actionLabel: props.actionLabel,
      loading: false,
    },
  ];
});

/** Display count — prefer real list length; while loading use that or skeleton count */
const totalCount = computed(() =>
  props.payouts?.length ? props.payouts.length : normalizedPayouts.value.length
);
const isMulti = computed(() => totalCount.value > 1 || props.loading);
const itemLayout = computed(() => (isMulti.value ? 'multi' : 'single'));

const isSingleFailed = computed(
  () => totalCount.value === 1 && normalizedPayouts.value[0]?.status === 'failed' && !props.loading
);

const visiblePayouts = computed(() => {
  const list = normalizedPayouts.value;
  if (isExpanded.value || list.length <= props.previewLimit) return list;
  return list.slice(0, props.previewLimit);
});

const hiddenCount = computed(() =>
  Math.max(0, totalCount.value - props.previewLimit)
);

const singleFailDescription = computed(() => {
  const reason =
    normalizedPayouts.value[0]?.failReason ||
    props.failReason ||
    resolvedDefaultFailReason.value;
  return `${t('payout.processing.failDescriptionPrefix')} ${reason}`;
});

const singleActionLabel = computed(
  () =>
    normalizedPayouts.value[0]?.actionLabel ||
    props.actionLabel ||
    resolvedDefaultActionLabel.value
);

const singleFailSteps = computed(() => [
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
]);

watch(
  () => normalizedPayouts.value.map((p) => p.status).join(','),
  () => {
    alertOpen.value = true;
    if (totalCount.value <= props.previewLimit) isExpanded.value = false;
  }
);

function emitAction(item) {
  emit('action', item);
}

function emitDetail(item) {
  emit('detail', item);
}
</script>
