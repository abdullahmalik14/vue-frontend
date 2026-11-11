<template>
  <BasePopup
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :popup-config="popupConfig"
  >
    <div
      class="w-full h-[100dvh] max-h-[100dvh] min-h-0 relative flex flex-col overflow-hidden shadow-[0px_0px_10px_0px_#00000040] bg-[#F9FAFB]/90 md:w-[37.5rem] lg:w-[45rem] dark:bg-[#1b1d1e]/90"
    >
      <div class="absolute inset-0 w-full h-full backdrop-blur-[50px] pointer-events-none z-[-1]"></div>

      <div class="relative z-[1] flex flex-col h-full min-h-0 overflow-hidden">
        <!-- header -->
        <div
          class="shrink-0 flex items-center justify-between gap-2.5 p-2 min-h-[3rem] relative md:items-center md:min-h-[3.5rem] md:mt-2 md:px-4 md:py-0"
        >
          <div
            class="absolute inset-0 w-full h-full backdrop-blur-[25px] pointer-events-none z-[-1] md:hidden"
          ></div>

          <h1 class="text-sm font-semibold text-[#344054] dark:text-[#bdb8af]">
            {{ t('payout.history.title') }}
          </h1>

          <button
            type="button"
            class="flex justify-center items-center w-6 h-6 cursor-pointer hover:opacity-80"
            @click="handleClose"
          >
            <img
              :src="assets.close"
              :alt="t('payout.alt.close')"
              class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(63%)_sepia(8%)_saturate(601%)_hue-rotate(179deg)_brightness(103%)_contrast(83%)]"
            />
          </button>
        </div>

        <!-- Focusable scroll area: mouse + keyboard inner scroll -->
        <div
          ref="tableScrollRef"
          tabindex="-1"
          class="flex-1 min-h-0 mt-0 md:mt-4 overflow-y-auto overscroll-contain outline-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <FlexTable
            :columns="columns"
            :rows="rows"
            :theme="tableTheme"
            :theme-mobile="tableThemeMobile"
            show-mobile
          >
            <template #header.date="{ col }">
              <div class="pl-6 pr-2.5 py-2.5 w-full">
                <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
              </div>
            </template>

            <template #header.to="{ col }">
              <div class="pl-2.5 pr-2.5 py-2.5 w-full">
                <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
              </div>
            </template>

            <template #header.status="{ col }">
              <div class="pl-2.5 pr-2.5 py-2.5 w-full flex justify-start">
                <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
              </div>
            </template>

            <template #header.finalPayout="{ col }">
              <div class="pl-2.5 pr-2.5 py-2.5 w-full flex justify-end">
                <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
              </div>
            </template>

            <template #header.action>
              <div class="pl-1 pr-6 py-2.5 w-full" />
            </template>

            <template #cell.date="{ value }">
              <div class="pl-6 pr-3 py-2 w-full h-full flex items-center">
                <span class="text-xs leading-normal text-[#0C111D] dark:text-[#dbd8d3]">{{ value }}</span>
              </div>
            </template>

            <template #cell.to="{ row }">
              <div class="pl-2.5 pr-2.5 py-2 w-full h-full flex items-center min-w-0">
                <span class="min-w-0 text-xs leading-normal text-[#0C111D] dark:text-[#dbd8d3]">
                  <span class="block truncate">{{ row.toMethod }}</span>
                  <span class="block truncate">{{ row.toAccount }}</span>
                </span>
              </div>
            </template>

            <template #cell.status="{ value }">
              <div class="pl-2.5 pr-2.5 py-2 w-full h-full flex items-center justify-start">
                <div class="flex h-6 shrink-0">
                  <div
                    class="flex justify-center items-center w-6 h-full backdrop-blur-[10px]"
                    :class="statusMeta(value).iconBg"
                  >
                    <img
                      :src="statusMeta(value).icon"
                      :alt="statusMeta(value).label"
                      class="w-4 h-4 [filter:brightness(0)_saturate(100%)]"
                    />
                  </div>
                  <div
                    class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]"
                  >
                    <span
                      class="text-xs leading-normal font-medium"
                      :class="statusMeta(value).textClass"
                    >
                      {{ statusMeta(value).label }}
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <template #cell.finalPayout="{ value }">
              <div class="pl-2.5 pr-2.5 py-2 w-full h-full flex justify-end items-center">
                <span class="text-sm font-semibold text-right text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ value }}
                </span>
              </div>
            </template>

            <template #cell.action="{ row }">
              <div class="pl-1 pr-6 py-2 w-full h-full flex justify-end items-center">
                <button
                  type="button"
                  class="flex justify-center items-center w-6 h-6 shrink-0 cursor-pointer hover:opacity-80"
                  :aria-label="t('payout.history.aria.viewTransferDetails')"
                  @click.stop="openTransferDetail(row)"
                >
                  <img
                    :src="assets.search"
                    alt=""
                    class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(42%)_sepia(16%)_saturate(519%)_hue-rotate(183deg)_brightness(100%)_contrast(88%)]"
                  />
                </button>
              </div>
            </template>

            <template #mobile-row="{ row }">
              <div class="flex justify-between gap-0.5 w-full">
                <div class="flex flex-col gap-1">
                  <span class="text-base font-medium text-[#182230] dark:text-[#d1cdc7]">
                    {{ row.dateMobile || row.date }}
                  </span>

                  <div class="flex flex-col">
                    <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">
                      {{ t('payout.history.columns.to') }}
                    </span>
                    <span
                      class="text-xs leading-normal font-medium -mt-1 text-[#344054] dark:text-[#bdb8af]"
                    >
                      {{ row.toMethod }}<br />{{ row.toAccount }}
                    </span>
                  </div>
                </div>

                <div class="flex flex-col justify-between gap-1 pl-0.5 -mt-0.5 min-w-[9.5625rem]">
                  <div class="flex justify-end items-center gap-2">
                    <div class="flex h-6">
                      <div
                        class="flex justify-center items-center w-6 h-full backdrop-blur-[10px]"
                        :class="statusMeta(row.status).iconBg"
                      >
                        <img
                          :src="statusMeta(row.status).icon"
                          :alt="statusMeta(row.status).label"
                          class="w-4 h-4 [filter:brightness(0)_saturate(100%)]"
                        />
                      </div>
                      <div
                        class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]"
                      >
                        <span
                          class="text-xs leading-normal font-medium"
                          :class="statusMeta(row.status).textClass"
                        >
                          {{ statusMeta(row.status).label }}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      class="flex justify-center items-center w-6 h-6 shrink-0 cursor-pointer hover:opacity-80"
                      :aria-label="t('payout.history.aria.viewTransferDetails')"
                      @click.stop="openTransferDetail(row)"
                    >
                      <img
                        :src="assets.search"
                        alt=""
                        class="w-full h-full [filter:brightness(0)_saturate(100%)_invert(42%)_sepia(16%)_saturate(519%)_hue-rotate(183deg)_brightness(100%)_contrast(88%)]"
                      />
                    </button>
                  </div>

                  <div class="flex flex-col items-end sm:gap-1">
                    <div class="flex flex-col">
                      <span
                        class="text-xs leading-normal font-medium text-right text-[#667085] dark:text-[#9e9589]"
                      >
                        {{ t('payout.history.columns.finalPayout') }}
                      </span>
                      <span
                        class="text-lg font-bold text-right -mt-1 text-[#004EEB] dark:text-[#3f9dff]"
                      >
                        {{ row.finalPayoutMobile || row.finalPayout }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </FlexTable>
        </div>
      </div>
    </div>
  </BasePopup>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import FlexTable from '@/components/ui/table/FlexTable.vue';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';

const { t } = useI18n();
const { assets } = usePayoutAssets();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue', 'open-detail']);

const tableScrollRef = ref(null);

const STATUS_META = {
  pending: {
    iconBg: 'bg-[#FFE500] dark:bg-[#a99700]',
    textClass: 'text-[#FFE500] dark:text-[#ffe81a]',
    iconKey: 'clock',
    labelKey: 'payout.history.status.pending',
  },
  failed: {
    iconBg: 'bg-[#FDB022] dark:bg-[#c48a1a]',
    textClass: 'text-[#FDB022] dark:text-[#FDB022]',
    iconKey: 'alertBlack',
    labelKey: 'payout.history.status.failed',
  },
  paid: {
    iconBg: 'bg-[#07F468] dark:bg-[#06c454]',
    textClass: 'text-[#07F468] dark:text-[#23f97b]',
    iconKey: 'tickMark',
    labelKey: 'payout.history.status.paid',
  },
};

function statusMeta(status) {
  const meta = STATUS_META[status] || STATUS_META.paid;
  return {
    iconBg: meta.iconBg,
    textClass: meta.textClass,
    icon: assets.value[meta.iconKey],
    label: t(meta.labelKey),
  };
}

function mapRowToTransferPayout(row) {
  const statusMap = {
    pending: 'processing',
    failed: 'failed',
    paid: 'completed',
  };

  return {
    id: `history-${row.id}`,
    status: statusMap[row.status] || 'processing',
    country: t('payout.mock.countryUsa'),
    method:
      row.toMethodKey === 'payme'
        ? t('payout.mock.methodPayme')
        : t('payout.mock.methodBankDeposit'),
    date: row.date,
    submittedOn: t('payout.processing.submittedOnDate', { date: row.date }),
    failReason:
      row.status === 'failed' ? t('payout.processing.defaults.failReason') : undefined,
    actionLabel:
      row.status === 'failed'
        ? t('payout.processing.defaults.actionUploadAddressProof')
        : undefined,
    withdrawAmountLabel:
      row.finalPayout && row.finalPayout !== t('payout.mock.historyRow.finalPayoutDash')
        ? row.finalPayout
        : t('payout.mock.withdrawAmountUsd120'),
  };
}

function openTransferDetail(row) {
  emit('open-detail', mapRowToTransferPayout(row));
}

const popupConfig = {
  actionType: 'slideIn',
  from: 'right',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,
  shouldLockBodyScroll: true,
  // Panel must not own scroll — tableScrollRef does (keyboard + wheel).
  scrollable: false,
  containerClass: '[&>div]:h-full [&>div]:min-h-0',
  width: { default: '100%', '>768': '37.5rem', '>1024': '45rem' },
  height: { default: '100%' },
};

function focusTableScroll() {
  tableScrollRef.value?.focus?.({ preventScroll: true });
}

function onTableKeydown(e) {
  if (!props.modelValue) return;

  const el = tableScrollRef.value;
  if (!el) return;

  const key = e.key;
  const isScrollKey =
    key === 'ArrowDown' ||
    key === 'ArrowUp' ||
    key === 'PageDown' ||
    key === 'PageUp' ||
    key === 'Home' ||
    key === 'End';

  if (!isScrollKey) return;
  if (e.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return;

  const max = el.scrollHeight - el.clientHeight;
  if (max <= 0) return;

  let next = el.scrollTop;
  if (key === 'ArrowDown') next += 40;
  else if (key === 'ArrowUp') next -= 40;
  else if (key === 'PageDown') next += el.clientHeight * 0.9;
  else if (key === 'PageUp') next -= el.clientHeight * 0.9;
  else if (key === 'Home') next = 0;
  else if (key === 'End') next = max;

  next = Math.min(max, Math.max(0, next));
  if (next === el.scrollTop) return;

  e.preventDefault();
  el.scrollTop = next;
}

function bindKeyboardScroll() {
  window.addEventListener('keydown', onTableKeydown, true);
}

function unbindKeyboardScroll() {
  window.removeEventListener('keydown', onTableKeydown, true);
}

watch(
  () => props.modelValue,
  (open) => {
    unbindKeyboardScroll();
    if (!open) return;

    bindKeyboardScroll();
    nextTick(() => {
      focusTableScroll();
      // BasePopup focuses panel after open — reclaim shortly after.
      setTimeout(focusTableScroll, 50);
      setTimeout(focusTableScroll, 200);
    });
  }
);

onBeforeUnmount(() => {
  unbindKeyboardScroll();
});

const columns = computed(() => [
  {
    key: 'date',
    label: t('payout.history.columns.date'),
    basis: 'basis-[22%] min-w-0',
    grow: true,
  },
  {
    key: 'to',
    label: t('payout.history.columns.to'),
    basis: 'basis-[22%] min-w-0',
    grow: true,
  },
  {
    key: 'status',
    label: t('payout.history.columns.status'),
    basis: 'basis-[22%] min-w-0',
    grow: true,
    align: 'left',
  },
  {
    key: 'finalPayout',
    label: t('payout.history.columns.finalPayout'),
    basis: 'basis-[22%] min-w-0',
    grow: true,
    align: 'right',
  },
  { key: 'action', label: '', basis: 'basis-[12%] min-w-[3rem]', grow: false, align: 'right' },
]);

const rows = computed(() => [
  {
    id: 1,
    date: t('payout.mock.historyRow.date1'),
    dateMobile: t('payout.mock.historyRow.date1Mobile'),
    toMethod: t('payout.mock.methodPayme'),
    toMethodKey: 'payme',
    toAccount: t('payout.mock.historyRow.toPaymeMasked'),
    status: 'pending',
    finalPayout: t('payout.mock.historyRow.finalPayoutDash'),
    finalPayoutMobile: t('payout.mock.historyRow.finalPayoutDash'),
  },
  {
    id: 2,
    date: t('payout.mock.historyRow.date2'),
    dateMobile: t('payout.mock.historyRow.date2Mobile'),
    toMethod: t('payout.mock.methodBank'),
    toMethodKey: 'bank',
    toAccount: t('payout.mock.historyRow.toBankMasked'),
    status: 'failed',
    finalPayout: t('payout.mock.historyRow.finalPayoutDash'),
    finalPayoutMobile: t('payout.mock.historyRow.finalPayoutDash'),
  },
  {
    id: 3,
    date: t('payout.mock.historyRow.date3'),
    toMethod: t('payout.mock.methodBank'),
    toMethodKey: 'bank',
    toAccount: t('payout.mock.historyRow.toBankMasked'),
    status: 'paid',
    finalPayout: t('payout.mock.historyRow.finalPayout2312'),
    finalPayoutMobile: t('payout.mock.historyRow.finalPayout12308'),
  },
  {
    id: 4,
    date: t('payout.mock.historyRow.date3'),
    toMethod: t('payout.mock.methodBank'),
    toMethodKey: 'bank',
    toAccount: t('payout.mock.historyRow.toBankMasked'),
    status: 'paid',
    finalPayout: t('payout.mock.historyRow.finalPayout2312'),
    finalPayoutMobile: t('payout.mock.historyRow.finalPayout12308'),
  },
  {
    id: 5,
    date: t('payout.mock.historyRow.date5'),
    toMethod: t('payout.mock.methodBank'),
    toMethodKey: 'bank',
    toAccount: t('payout.mock.historyRow.toBankMasked'),
    status: 'paid',
    finalPayout: t('payout.mock.historyRow.finalPayout12308'),
    finalPayoutMobile: t('payout.mock.historyRow.finalPayout12308'),
  },
  {
    id: 6,
    date: t('payout.mock.historyRow.date6'),
    toMethod: t('payout.mock.methodPayme'),
    toMethodKey: 'payme',
    toAccount: t('payout.mock.historyRow.toPaymeMasked'),
    status: 'paid',
    finalPayout: t('payout.mock.historyRow.finalPayout2312'),
    finalPayoutMobile: t('payout.mock.historyRow.finalPayout12308'),
  },
  {
    id: 7,
    date: t('payout.mock.historyRow.date7'),
    toMethod: t('payout.mock.methodPayme'),
    toMethodKey: 'payme',
    toAccount: t('payout.mock.historyRow.toPaymeMasked'),
    status: 'paid',
    finalPayout: t('payout.mock.historyRow.finalPayout2312'),
    finalPayoutMobile: t('payout.mock.historyRow.finalPayout12308'),
  },
  {
    id: 8,
    date: t('payout.mock.historyRow.date8'),
    toMethod: t('payout.mock.methodPayme'),
    toMethodKey: 'payme',
    toAccount: t('payout.mock.historyRow.toPaymeMasked'),
    status: 'paid',
    finalPayout: t('payout.mock.historyRow.finalPayout2312'),
    finalPayoutMobile: t('payout.mock.historyRow.finalPayout12308'),
  },
]);

const tableTheme = {
  container: 'relative hidden md:flex flex-col w-full',
  header:
    'flex items-center w-full sticky top-0 z-30 backdrop-blur-md  border-b border-[#667085] dark:border-[#655e53]',
  headerRow: 'flex items-center w-full',
  headerCell: 'flex items-center min-h-[2.625rem]',
  row: 'flex items-center w-full min-h-[4.5rem] odd:bg-white/50 even:bg-transparent dark:odd:bg-[#181a1b]/50',
  cell: 'flex items-center h-full',
  footer: 'hidden',
};

const tableThemeMobile = {
  container: 'relative flex flex-col gap-1 md:hidden',
  card: 'flex justify-center items-center p-2 rounded-sm backdrop-blur-[5px] border-[1.5px] border-[#D0D5DD] bg-white/50 sm:py-3 dark:border-[#3b4043] dark:bg-[#181a1b]/50',
  cardRow: '',
};

const handleClose = () => {
  emit('update:modelValue', false);
};
</script>
