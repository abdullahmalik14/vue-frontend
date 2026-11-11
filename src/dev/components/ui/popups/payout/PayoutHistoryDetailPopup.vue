<template>
  <BasePopup
    :modelValue="modelValue"
    @update:modelValue="(val) => emit('update:modelValue', val)"
    :popup-config="popupConfig"
  >
    <div
      class="w-full h-[100dvh] max-h-[100dvh] min-h-0 relative flex flex-col overflow-hidden shadow-[0px_0px_10px_0px_#00000040] bg-[#F9FAFB]/90 dark:bg-[#1b1d1e]/90"
    >
      <div class="absolute inset-0 w-full h-full backdrop-blur-[50px] pointer-events-none z-[-1]"></div>

      <div class="relative z-[1] flex flex-col h-full min-h-0 overflow-hidden">
        <!-- header -->
        <div
          class="shrink-0 flex justify-between gap-2.5 p-2 relative md:items-center md:mt-2 md:px-4 md:py-0"
        >
          <div
            class="absolute inset-0 w-full h-full backdrop-blur-[25px] pointer-events-none z-[-1] md:hidden"
          ></div>

          <div class="flex flex-col md:h-[3.5rem] md:justify-center md:gap-1">
            <h1
              class="text-sm font-semibold text-[#344054] md:text-xs md:leading-normal md:font-medium md:text-[#667085] dark:text-[#bdb8af] md:dark:text-[#9e9689]"
            >
              {{ t('payout.historyDetail.title') }}
            </h1>
            <span
              class="text-xs leading-normal font-medium text-[#667085] md:text-base md:font-semibold md:text-[#344054] dark:text-[#9e9689] md:dark:text-[#bdb8af]"
            >
              {{ periodLabel }}
            </span>
          </div>

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
              <div class="pl-3 pr-2.5 py-2.5 w-full">
                <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
              </div>
            </template>
            <template #header.type="{ col }">
              <div class="pl-3 pr-2.5 py-2.5 w-full">
                <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
              </div>
            </template>
            <template #header.from="{ col }">
              <div class="pl-3 pr-2.5 py-2.5 w-full">
                <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
              </div>
            </template>
            <template #header.detail="{ col }">
              <div class="pl-3 pr-2.5 py-2.5 w-full">
                <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
              </div>
            </template>
            <template #header.order="{ col }">
              <div class="pl-2.5 pr-6 py-2.5 w-full">
                <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
              </div>
            </template>
            <template #header.total="{ col }">
              <div class="pl-2.5 pr-6 py-2.5 w-full flex justify-end">
                <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
              </div>
            </template>
            <template #header.commission="{ col }">
              <div class="p-2.5 w-full text-right">
                <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
              </div>
            </template>
            <template #header.finalPayout="{ col }">
              <div class="pl-2.5 pr-3 py-2.5 w-full">
                <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
              </div>
            </template>

            <template #cell.date="{ value }">
              <div class="px-3 py-2 w-full h-full flex items-center">
                <span class="text-xs leading-normal font-medium text-[#5F6369] dark:text-[#a9a296]">
                  {{ value }}
                </span>
              </div>
            </template>

            <template #cell.type="{ value }">
              <div class="px-3 py-2 w-full h-full flex items-center">
                <div class="flex justify-end h-6">
                  <div
                    class="flex justify-center items-center w-6 h-full backdrop-blur-[10px]"
                    :class="
                      value === 'tokens'
                        ? 'bg-[#FEC84B] dark:bg-[#9a6c01]'
                        : 'bg-[#07F468] dark:bg-[#06c454]'
                    "
                  >
                    <img
                      v-if="value === 'tokens'"
                      :src="assets.token"
                      :alt="t('payout.alt.token')"
                      class="w-4 h-4"
                    />
                    <img
                      v-else
                      :src="assets.currencyDollar"
                      :alt="t('payout.alt.currencyDollar')"
                      class="w-4 h-4 [filter:brightness(0)_saturate(100%)]"
                    />
                  </div>
                  <div
                    class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]"
                  >
                    <span
                      class="text-xs leading-normal font-medium"
                      :class="
                        value === 'tokens'
                          ? 'text-[#FFE500] dark:text-[#ffe81a]'
                          : 'text-[#07F468] dark:text-[#23f97b]'
                      "
                    >
                      {{ typeLabel(value) }}
                    </span>
                  </div>
                </div>
              </div>
            </template>

            <template #cell.from="{ row }">
              <div class="px-3 py-2 w-full h-full flex items-center">
                <div class="flex items-center gap-[0.3125rem]">
                  <img :src="row.avatar" :alt="t('payout.alt.avatar')" class="w-5 h-5" />
                  <span
                    class="text-xs leading-normal truncate max-w-[5.125rem] text-[#344054] dark:text-[#bdb8af]"
                  >
                    {{ row.from }}
                  </span>
                </div>
              </div>
            </template>

            <template #cell.detail="{ value }">
              <div class="px-3 py-2 w-full h-full flex items-center">
                <span class="text-xs leading-normal text-[#5F6369] dark:text-[#a9a296]">
                  {{ value }}
                </span>
              </div>
            </template>

            <template #cell.order="{ value }">
              <div class="pl-2.5 pr-6 py-2 w-full h-full flex items-center">
                <span class="text-xs leading-normal font-medium text-[#004EEB] dark:text-[#3f9dff]">
                  {{ value }}
                </span>
              </div>
            </template>

            <template #cell.total="{ value }">
              <div class="pl-2.5 pr-6 py-2 w-full h-full flex justify-end items-center">
                <span class="text-xs leading-normal text-right text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ value }}
                </span>
              </div>
            </template>

            <template #cell.commission="{ value }">
              <div class="pl-3 pr-6 py-2 w-full h-full flex justify-end items-center">
                <span class="text-xs leading-normal text-right text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ value }}
                </span>
              </div>
            </template>

            <template #cell.finalPayout="{ value }">
              <div class="pl-2.5 pr-3 py-2 w-full h-full flex items-center">
                <span class="text-sm font-semibold text-[#0C111D] dark:text-[#dbd8d3]">
                  {{ value }}
                </span>
              </div>
            </template>

            <template #mobile-row="{ row }">
              <div class="flex justify-between gap-0.5 w-full">
                <div class="flex flex-col gap-1 pr-0.5 flex-1 max-w-[15.625rem]">
                  <div class="flex justify-between items-center gap-2">
                    <span class="text-sm font-medium text-[#182230] dark:text-[#d1cdc7]">
                      {{ row.date }}
                    </span>
                    <span class="text-xs leading-normal font-medium text-[#004EEB] dark:text-[#3f9dff]">
                      {{ row.order }}
                    </span>
                  </div>

                  <div class="flex flex-col gap-0.5">
                    <div class="flex justify-between items-center gap-2">
                      <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">
                        {{ t('payout.historyDetail.columns.from') }}
                      </span>
                      <div class="flex items-center gap-[0.3125rem]">
                        <img :src="row.avatar" :alt="t('payout.alt.avatar')" class="w-[1.125rem] h-[1.125rem]" />
                        <span class="text-xs leading-normal text-[#344054] dark:text-[#bdb8af]">
                          {{ row.from }}
                        </span>
                      </div>
                    </div>

                    <div class="flex justify-between items-center gap-2">
                      <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">
                        {{ t('payout.historyDetail.columns.detail') }}
                      </span>
                      <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">
                        {{ row.detail }}
                      </span>
                    </div>

                    <div class="flex justify-between items-center gap-2">
                      <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">
                        {{ t('payout.historyDetail.columns.commission') }}
                      </span>
                      <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">
                        {{ row.commission }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-1 pl-0.5 -mt-0.5 min-w-[9.5625rem]">
                  <div class="flex justify-end h-6">
                    <div
                      class="flex justify-center items-center w-6 h-full backdrop-blur-[10px]"
                      :class="
                        row.type === 'tokens'
                          ? 'bg-[#FEC84B] dark:bg-[#9a6c01]'
                          : 'bg-[#07F468] dark:bg-[#06c454]'
                      "
                    >
                      <img
                        v-if="row.type === 'tokens'"
                        :src="assets.token"
                        :alt="t('payout.alt.token')"
                        class="w-4 h-4"
                      />
                      <img
                        v-else
                        :src="assets.currencyDollar"
                        :alt="t('payout.alt.currencyDollar')"
                        class="w-4 h-4 [filter:brightness(0)_saturate(100%)]"
                      />
                    </div>
                    <div
                      class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]"
                    >
                      <span
                        class="text-xs leading-normal font-medium"
                        :class="
                          row.type === 'tokens'
                            ? 'text-[#FFE500] dark:text-[#ffe81a]'
                            : 'text-[#07F468] dark:text-[#23f97b]'
                        "
                      >
                        {{ typeLabel(row.type) }}
                      </span>
                    </div>
                  </div>

                  <div class="flex flex-col items-end sm:gap-1">
                    <div class="flex items-center gap-1">
                      <span
                        class="text-[0.625rem] leading-[1.125rem] font-medium text-[#667085] dark:text-[#9e9589]"
                      >
                        {{ t('payout.historyDetail.columns.total') }}
                      </span>
                      <span class="text-[0.625rem] leading-[1.125rem] text-[#667085] dark:text-[#9e9589]">
                        {{ row.total }}
                      </span>
                    </div>

                    <div class="flex flex-col">
                      <span
                        class="text-xs leading-normal font-medium text-right text-[#667085] dark:text-[#9e9589]"
                      >
                        {{ t('payout.historyDetail.columns.finalPayout') }}
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
  period: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue']);

const tableScrollRef = ref(null);

const periodLabel = computed(() => props.period || t('payout.mock.periodSample'));

function typeLabel(typeKey) {
  return typeKey === 'tokens'
    ? t('payout.historyDetail.types.tokens')
    : t('payout.historyDetail.types.sales');
}

const columns = computed(() => [
  {
    key: 'date',
    label: t('payout.historyDetail.columns.date'),
    basis: 'min-w-[7.114375rem]',
    grow: false,
  },
  {
    key: 'type',
    label: t('payout.historyDetail.columns.type'),
    basis: 'min-w-[7.114375rem]',
    grow: false,
  },
  {
    key: 'from',
    label: t('payout.historyDetail.columns.from'),
    basis: 'min-w-[7.114375rem]',
    grow: false,
  },
  {
    key: 'detail',
    label: t('payout.historyDetail.columns.detail'),
    basis: 'min-w-[7.114375rem]',
    grow: false,
  },
  {
    key: 'order',
    label: t('payout.historyDetail.columns.order'),
    basis: 'min-w-[5.5rem]',
    grow: false,
  },
  {
    key: 'total',
    label: t('payout.historyDetail.columns.total'),
    basis: 'min-w-[7.114375rem]',
    grow: false,
    align: 'right',
  },
  {
    key: 'commission',
    label: t('payout.historyDetail.columns.commission'),
    basis: 'min-w-[7.75rem]',
    grow: false,
    align: 'right',
  },
  {
    key: 'finalPayout',
    label: t('payout.historyDetail.columns.finalPayout'),
    basis: 'min-w-[7.114375rem]',
    grow: false,
  },
]);

const rows = computed(() => {
  const avatar = assets.value.avatar;
  const m = 'payout.mock.historyDetailRow';

  return [
    {
      id: 1,
      date: t(`${m}.date`),
      type: 'sales',
      from: t(`${m}.from`),
      avatar,
      detail: t(`${m}.detailCrLikes`),
      order: t(`${m}.order`),
      total: t(`${m}.total`),
      commission: t(`${m}.commission`),
      finalPayout: t(`${m}.finalPayout`),
      finalPayoutMobile: t(`${m}.finalPayoutMobile`),
    },
    {
      id: 2,
      date: t(`${m}.date`),
      type: 'sales',
      from: t(`${m}.from`),
      avatar,
      detail: t(`${m}.detailCrClips`),
      order: t(`${m}.order`),
      total: t(`${m}.total`),
      commission: t(`${m}.commission`),
      finalPayout: t(`${m}.finalPayout`),
      finalPayoutMobile: t(`${m}.finalPayoutMobile`),
    },
    {
      id: 3,
      date: t(`${m}.date`),
      type: 'sales',
      from: t(`${m}.from`),
      avatar,
      detail: t(`${m}.detailMerch`),
      order: t(`${m}.order`),
      total: t(`${m}.total`),
      commission: t(`${m}.commission`),
      finalPayout: t(`${m}.finalPayout`),
      finalPayoutMobile: t(`${m}.finalPayoutMobile`),
    },
    {
      id: 4,
      date: t(`${m}.date`),
      type: 'tokens',
      from: t(`${m}.from`),
      avatar,
      detail: t(`${m}.detailTip`),
      order: t(`${m}.orderDash`),
      total: t(`${m}.total`),
      commission: t(`${m}.commission`),
      finalPayout: t(`${m}.finalPayout`),
      finalPayoutMobile: t(`${m}.finalPayoutMobile`),
    },
    {
      id: 5,
      date: t(`${m}.date`),
      type: 'tokens',
      from: t(`${m}.from`),
      avatar,
      detail: t(`${m}.detailPrivateChat`),
      order: t(`${m}.orderDash`),
      total: t(`${m}.total`),
      commission: t(`${m}.commission`),
      finalPayout: t(`${m}.finalPayout`),
      finalPayoutMobile: t(`${m}.finalPayoutMobile`),
    },
    {
      id: 6,
      date: t(`${m}.date`),
      type: 'sales',
      from: t(`${m}.from`),
      avatar,
      detail: t(`${m}.detailCrLikes`),
      order: t(`${m}.order`),
      total: t(`${m}.total`),
      commission: t(`${m}.commission`),
      finalPayout: t(`${m}.finalPayout`),
      finalPayoutMobile: t(`${m}.finalPayoutMobile`),
    },
    {
      id: 7,
      date: t(`${m}.date`),
      type: 'tokens',
      from: t(`${m}.from`),
      avatar,
      detail: t(`${m}.detailTip`),
      order: t(`${m}.orderDash`),
      total: t(`${m}.total`),
      commission: t(`${m}.commission`),
      finalPayout: t(`${m}.finalPayout`),
      finalPayoutMobile: t(`${m}.finalPayoutMobile`),
    },
    {
      id: 8,
      date: t(`${m}.date`),
      type: 'sales',
      from: t(`${m}.from`),
      avatar,
      detail: t(`${m}.detailMerch`),
      order: t(`${m}.order`),
      total: t(`${m}.total`),
      commission: t(`${m}.commission`),
      finalPayout: t(`${m}.finalPayout`),
      finalPayoutMobile: t(`${m}.finalPayoutMobile`),
    },
  ];
});

const popupConfig = {
  actionType: 'slideIn',
  from: 'right',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,  
  shouldLockBodyScroll: true,
  scrollable: false,
  containerClass: '[&>div]:h-full [&>div]:min-h-0',
  width: { default: '100%', '>768': '42.375rem', '>1024': '57.9375rem' },
  height: { default: '100%' },
};

const tableTheme = {
  container: 'relative hidden md:flex flex-col w-full min-w-min',
  header:
    'flex items-center w-full sticky top-0 z-30 backdrop-blur-md border-b border-[#667085] dark:border-[#655e53]',
  headerRow: 'flex items-center w-full',
  headerCell: 'flex items-center min-h-[2.625rem]',
  row: 'flex items-center w-full min-h-[4.5rem] even:bg-white/50  odd:bg-transparent dark:odd:bg-[#181a1b]/50',
  cell: 'flex items-center h-full',
  footer: 'hidden',
};

const tableThemeMobile = {
  container: 'relative flex flex-col gap-1 md:hidden px-2',
  card: 'flex justify-center items-center p-2 rounded-sm backdrop-blur-[5px] border-[1.5px] border-[#D0D5DD] bg-white/50 sm:py-3 dark:border-[#3b4043] dark:bg-[#181a1b]/50',
  cardRow: '',
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
      setTimeout(focusTableScroll, 50);
      setTimeout(focusTableScroll, 200);
    });
  }
);

onBeforeUnmount(() => {
  unbindKeyboardScroll();
});

const handleClose = () => {
  emit('update:modelValue', false);
};
</script>
