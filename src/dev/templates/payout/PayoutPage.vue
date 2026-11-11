<script setup>
import DashboardSharedTwoColLayout from '@/templates/dashboard/shared/DashboardSharedTwoColLayout.vue';
import FlexTable from '@/components/ui/table/FlexTable.vue';
import PayoutCard from '@/dev/components/ui/card/dashboard/PayoutCard.vue';
import PayoutProcessingStatus from '@/dev/components/ui/card/dashboard/PayoutProcessingStatus.vue';
import PayoutBalanceAside from '@/dev/components/ui/card/dashboard/PayoutBalanceAside.vue';
import PayoutSettingsPopup from '@/dev/components/ui/popups/payout/PayoutSettingsPopup.vue';
import WithdrawEarningsPopup from '@/dev/components/ui/popups/payout/WithdrawEarningsPopup.vue';
import TransactionHistoryPopup from '@/dev/components/ui/popups/payout/TransactionHistoryPopup.vue';
import PayoutHistoryDetailPopup from '@/dev/components/ui/popups/payout/PayoutHistoryDetailPopup.vue';
import PayoutTransferDetailPopup from '@/dev/components/ui/popups/payout/PayoutTransferDetailPopup.vue';
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';
import { usePayoutDemoState } from '@/dev/composables/usePayoutDemoState.js';

const { t } = useI18n();
const { assets } = usePayoutAssets();
const {
  activePayouts,
  payoutsLoading,
  availableBalance,
  ledgerBalance,
  nextPayoutDate,
  balanceAsideMode,
  showPayoutProcessing,
  showPayoutViewAll,
  onPayoutSubmitted,
} = usePayoutDemoState({ t });

const payoutFansocialBackgroundStyle = computed(() => ({
  '--payout-mobile-fansocial': assets.value.mobileFansocial
    ? `url(${assets.value.mobileFansocial})`
    : 'none',
  '--payout-desktop-fansocial': assets.value.desktopFansocial
    ? `url(${assets.value.desktopFansocial})`
    : 'none',
}));

const payoutHeaderBackgroundStyle = computed(() => ({
  '--payout-header-gradient': assets.value.headerGradient
    ? `url(${assets.value.headerGradient})`
    : 'none',
  '--payout-mobile-gradient': assets.value.mobileGradient
    ? `url(${assets.value.mobileGradient})`
    : 'none',
}));

const showPayoutSettingsPopup = ref(false);
const showWithdrawPopup = ref(false);
const showTransactionHistoryPopup = ref(false);
const showPayoutHistoryDetailPopup = ref(false);
const showPayoutTransferDetailPopup = ref(false);
const selectedPayoutPeriod = ref('');
const selectedTransferPayout = ref(null);

const selectedCreator = ref('all');
const creatorSearchQuery = ref('');

const creatorOptions = computed(() => [
  { value: 'all', label: t('payout.page.allCreators'), isAll: true },
  {
    value: '@ModelingMagic',
    label: t('payout.mock.creatorModelingMagic'),
    avatar: assets.value.avatar,
  },
  {
    value: '@ExquisiteEats',
    label: t('payout.mock.creatorExquisiteEats'),
    avatar: assets.value.avatar,
  },
  {
    value: '@StylishFruits',
    label: t('payout.mock.creatorStylishFruits'),
    avatar: assets.value.avatar,
  },
  {
    value: '@FashionFiesta',
    label: t('payout.mock.creatorFashionFiesta'),
    avatar: assets.value.avatar,
  },
  {
    value: '@CoutureCraze',
    label: t('payout.mock.creatorCoutureCraze'),
    avatar: assets.value.avatar,
  },
  {
    value: '@GlamourHarvest',
    label: t('payout.mock.creatorGlamourHarvest'),
    avatar: assets.value.avatar,
  },
  {
    value: '@VelvetVogue',
    label: t('payout.mock.creatorVelvetVogue'),
    avatar: assets.value.avatar,
  },
  {
    value: '@PixelPetals',
    label: t('payout.mock.creatorPixelPetals'),
    avatar: assets.value.avatar,
  },
  {
    value: '@NeonNomad',
    label: t('payout.mock.creatorNeonNomad'),
    avatar: assets.value.avatar,
  },
]);

const filteredCreatorOptions = computed(() => {
  const q = creatorSearchQuery.value.trim().toLowerCase().replace(/^@/, '');
  return creatorOptions.value.filter((opt) => {
    if (opt.isAll) return false;
    if (!q) return true;
    return opt.label.toLowerCase().replace(/^@/, '').includes(q);
  });
});

function onSelectCreator(option, selectOption) {
  selectOption(option);
  creatorSearchQuery.value = '';
}

function onCreatorDropdownOpen() {
  creatorSearchQuery.value = '';
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
    document.body.style.overflow = 'hidden';
  }
}

function onCreatorDropdownClose() {
  creatorSearchQuery.value = '';
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
}

function openPayoutHistoryDetail(row) {
  selectedPayoutPeriod.value = row?.period || '';
  showPayoutHistoryDetailPopup.value = true;
}

function onPayoutFailAction(item) {
  // Hook for upload-proof / retry / support — item is the payout row
  void item;
}

function onPayoutDetail(item) {
  if (!item || typeof item !== 'object') return;
  selectedTransferPayout.value = { ...item };
  showPayoutTransferDetailPopup.value = true;
}

function payoutStatusLabel(status) {
  const key = String(status || '').toLowerCase();
  if (key === 'pending') return t('payout.page.status.pending');
  if (key === 'paid') return t('payout.page.status.paid');
  if (key === 'failed') return t('payout.page.status.failed');
  return status;
}

const payoutColumns = computed(() => [
  { key: 'period', label: t('payout.page.columns.period'), basis: 'min-w-[11.75rem]' },
  { key: 'status', label: t('payout.page.columns.status'), basis: 'min-w-[7.375rem] lg:min-w-[8.875rem]' },
  {
    key: 'totalEarned',
    label: t('payout.page.columns.totalEarned'),
    basis: 'min-w-[7.625rem] lg:min-w-[9.8125rem] xl:min-w-[12.125rem]',
    align: 'right',
  },
  {
    key: 'rollover',
    label: t('payout.page.columns.rollover'),
    basis: 'min-w-[6.4375rem] lg:min-w-[8.5625rem]',
    align: 'right',
  },
  {
    key: 'transferFee',
    label: t('payout.page.columns.transferFee'),
    basis: 'min-w-[7.5rem] lg:min-w-[8.5625rem]',
    align: 'right',
  },
  {
    key: 'commission',
    label: t('payout.page.columns.commission'),
    basis: 'min-w-[8.5625rem]',
    align: 'right',
  },
  {
    key: 'finalPayout',
    label: t('payout.page.columns.finalPayout'),
    basis: 'min-w-[9.8125rem] xl:min-w-[12.125rem]',
    align: 'right',
  },
  { key: 'action', label: '', basis: 'min-w-[5rem]', grow: true, align: 'right' },
]);

const payoutRows = computed(() => {
  const row = {
    period: t('payout.mock.pageTableRow.period'),
    totalEarned: t('payout.mock.pageTableRow.totalEarned'),
    rollover: t('payout.mock.pageTableRow.rollover'),
    transferFee: t('payout.mock.pageTableRow.transferFee'),
    commission: t('payout.mock.pageTableRow.commission'),
    finalPayout: t('payout.mock.pageTableRow.finalPayout'),
  };

  return [
    { id: 1, ...row, status: 'pending' },
    { id: 2, ...row, status: 'paid' },
    { id: 3, ...row, status: 'paid' },
    { id: 4, ...row, status: 'paid' },
    { id: 5, ...row, status: 'paid' },
  ];
});

const tableTheme = {
  container: 'hidden md:flex flex-col w-full',
  header: 'hidden md:flex items-center w-full',
  headerRow: 'flex items-center w-full',
  headerCell: 'flex items-center min-h-[2.625rem] border-b border-[#667085] dark:border-[#655e53]',
  row: 'flex items-center w-full min-h-[4.5rem] odd:bg-[#e3e9f0] even:bg-[#ebedf3]',
  cell: 'flex items-center h-full',
  footer: 'p-3 text-center'
};

const tableThemeMobile = {
  container: 'flex flex-col gap-1 sm:px-2 md:hidden',
  card: 'flex justify-center items-center p-2 rounded-sm backdrop-blur-[5px] border-[1.5px] border-[#D0D5DD] bg-white/50 sm:py-3 dark:border-[#3b4043] dark:bg-[#181a1b]/50',
  cardRow: '', // Using mobile-row slot for full control
};

</script>

<template>
 <DashboardSharedTwoColLayout no-padding>
    <!-- main-wrapper -->
    <div class="flex flex-col md:flex-row">
      <!-- dashboard-template-main -->
      <div class="w-full relative z-[2] bg-transparent before:content-[''] before:fixed before:bg-[image:var(--payout-mobile-fansocial)] md:before:bg-[image:var(--payout-desktop-fansocial)] before:bg-cover before:bg-center before:w-screen before:h-screen before:bg-no-repeat before:left-0 before:top-0 before:pointer-events-none" :style="payoutFansocialBackgroundStyle">
        <div class="flex flex-col gap-4 flex-grow md:gap-6">
          <!-- top page header section -->
          <div class="relative flex flex-col gap-6 bg-cover md:backdrop-blur-[5px] md:[background-image:var(--payout-header-gradient)] md:px-4 md:pt-4 xl:px-6 xl:pt-6 before:content-[''] md:before:hidden before:fixed before:bg-[image:var(--payout-mobile-gradient)] before:bg-cover before:w-full before:bg-no-repeat before:h-full before:left-0 before:top-0 before:pointer-events-none" :style="payoutHeaderBackgroundStyle">

            <!-- overlay (above image, below content) -->
            <div class="absolute inset-0 bg-white/10 pointer-events-none"></div> 

            <!-- custom-title -->
            <div class="hidden md:flex justify-between items-center gap-4 w-full z-[1] xl:gap-6">
              <Heading
                :text="t('payout.page.title')"
                tag="h1"
                theme="custom"
                no-wrap
                add-class="text-3xl leading-[2.375rem] font-medium tracking-[-0.045rem] text-[#475467] dark:text-[#b1aaa0]"
              />
            
              <!-- payout-settings-button -->
              <button @click="showPayoutSettingsPopup = true" class="flex justify-center items-center gap-2.5 pl-1 pr-2 h-10">
                <img :src="assets.settings02" :alt="t('payout.alt.settings02')" class="w-6 h-6 [filter:brightness(0)_saturate(100%)_invert(49%)_sepia(5%)_saturate(1614%)_hue-rotate(183deg)_brightness(85%)_contrast(84%)]">
                <span class="text-lg font-medium text-[#667085] dark:text-[#9e9589]">{{ t('payout.page.payoutSettings') }}</span>
              </button>
            </div>

            <!-- top-page-settings -->
            <div class="flex flex-col items-start gap-2 z-[1] sm:gap-4 md:gap-2 lg:flex-row lg:gap-4">
              <PayoutCard
                :available-balance="availableBalance"
                :ledger-balance="ledgerBalance"
                @open-withdraw="showWithdrawPopup = true"
                @open-transaction-history="showTransactionHistoryPopup = true"
              >
                <template #aside>
                  <PayoutProcessingStatus
                    v-if="showPayoutProcessing"
                    :payouts="activePayouts"
                    :loading="payoutsLoading"
                    :show-view-all="showPayoutViewAll"
                    @action="onPayoutFailAction"
                    @detail="onPayoutDetail"
                  />
                  <PayoutBalanceAside
                    v-else
                    :mode="balanceAsideMode"
                    :next-payout-date="nextPayoutDate"
                    @withdraw="showWithdrawPopup = true"
                  />
                </template>
              </PayoutCard>
            </div>
          </div>

          <!-- payout-history section -->
          <div class="flex flex-col gap-2 md:gap-4 pb-10">
            <!-- title-container -->
            <div class="flex justify-between items-center gap-2.5 px-2 md:px-4">
              <Heading
                :text="t('payout.page.payoutHistory')"
                tag="h2"
                theme="custom"
                no-wrap
                add-class="text-lg font-medium shrink-0 text-[#667085] md:text-xl md:leading-normal dark:text-[#9e9589]"
              />

              <div class="select-dropdown relative flex [&.disabled]:opacity-50 [&.disabled]:cursor-not-allowed">
                <BasePlanDropdown
                  v-model="selectedCreator"
                  :options="creatorOptions"
                  :unstyled="true"
                  widthClass="w-full"
                  @open="onCreatorDropdownOpen"
                  @close="onCreatorDropdownClose"
                >
                  <template #trigger="{ isOpen, selectedOption }">
                    <div
                      class="payout-select__trigger w-max h-6 flex justify-between items-center gap-2 px-2 ml-auto cursor-pointer"
                    >
                      <span
                        v-if="!selectedOption || selectedOption.isAll"
                        class="text-sm text-[#344054] dark:text-[#bdb8af]"
                      >
                        {{ t('payout.page.allCreators') }}
                      </span>
                      <div v-else class="flex items-center gap-[0.3125rem]">
                        <img
                          :src="selectedOption.avatar || assets.avatar"
                          :alt="t('payout.alt.avatar')"
                          class="w-5 h-5"
                        />
                        <span class="text-xs leading-normal truncate text-[#344054] dark:text-[#bdb8af]">
                          {{ selectedOption.label }}
                        </span>
                      </div>

                      <img
                        class="select-arrow h-4 w-4 shrink-0 transition-transform duration-200 [filter:brightness(0)_saturate(100%)_invert(41%)_sepia(13%)_saturate(677%)_hue-rotate(182deg)_brightness(100%)_contrast(83%)]"
                        :class="{ 'rotate-180': isOpen }"
                        :src="assets.down"
                        :alt="t('payout.alt.down')"
                      />
                    </div>
                  </template>

                  <template #options-container="{ selectOption, modelValue, isOpen, isUpwards, close }">
                    <div
                      class="payout-options-container max-md:!fixed max-md:!flex max-md:!flex-col max-md:!justify-end max-md:!inset-0 max-md:!bg-white/50 max-md:dark:!bg-[#181a1b]/50 absolute left-auto right-0 z-[9999] min-w-[15.625rem] rounded-sm transition-[opacity,transform] duration-200 ease-out"
                      :class="[
                        isOpen
                          ? 'scale-100 opacity-100 pointer-events-auto h-auto overflow-auto'
                          : 'scale-95 opacity-0 pointer-events-none h-0 overflow-hidden',
                        isUpwards
                          ? 'bottom-[calc(100%+1.5px)] top-auto [transform-origin:50%_100%] max-md:!top-0 max-md:!bottom-0'
                          : 'top-[calc(100%+1.5px)] [transform-origin:50%_0] max-md:!top-0',
                      ]"
                      @click="(e) => { if (e.target === e.currentTarget) close(); }"
                    >
                      <div
                        class="flex flex-col h-[21.875rem] max-md:!h-[18.25rem] max-md:!rounded-t-[0.9375rem] shadow-[0px_0px_8px_0px_#00000040] bg-white/50 max-md:!bg-white/90 relative dark:bg-[#181a1b]/50 max-md:dark:!bg-[#181a1b]/90"
                        @click.stop
                      >
                        <div
                          class="absolute inset-0 w-full h-full backdrop-blur-[50px] pointer-events-none z-[-1]"
                        ></div>

                        <button
                          type="button"
                          class="shrink-0 flex items-center p-3 min-h-[3rem] w-full text-left bg-white/50 border-b border-[#EAECF0] cursor-pointer dark:bg-[#181a1b]/50 dark:border-[#353a3c]"
                          :class="{ 'bg-white dark:bg-[#181a1b]': modelValue === 'all' }"
                          @click.stop="onSelectCreator(creatorOptions[0], selectOption)"
                        >
                          <span class="text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]">
                            {{ t('payout.page.allCreators') }}
                          </span>
                        </button>

                        <div
                          class="shrink-0 flex items-center gap-2 px-3 py-2 bg-white/50 border-b border-[#D0D5DD] shadow-[0px_1px_2px_0px_#1018280D] dark:bg-[#181a1b]/50 dark:border-[#3b4043]"
                        >
                          <img
                            :src="assets.search"
                            :alt="t('payout.alt.search')"
                            class="w-5 h-5 shrink-0 [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(9%)_saturate(827%)_hue-rotate(183deg)_brightness(94%)_contrast(91%)]"
                          />
                          <input
                            v-model="creatorSearchQuery"
                            type="text"
                            :placeholder="t('payout.page.searchByUsername')"
                            class="w-full text-base text-[#101828] placeholder:text-[#667085] dark:text-[#d6d3cd] dark:placeholder:text-[#9e9589] bg-transparent focus:outline-none"
                            @click.stop
                          />
                        </div>

                        <div
                          class="creator-dropdown-scroll flex flex-col flex-1 min-h-0 overflow-y-auto"
                        >
                          <button
                            v-for="option in filteredCreatorOptions"
                            :key="option.value"
                            type="button"
                            class="flex items-center gap-2.5 px-3 py-2 min-h-[3rem] w-full text-left border-b border-[#EAECF0] cursor-pointer hover:bg-white/80 dark:border-[#353a3c] dark:hover:bg-[#222526]"
                            :class="{ 'bg-white dark:bg-[#181a1b]': modelValue === option.value }"
                            @click.stop="onSelectCreator(option, selectOption)"
                          >
                            <div class="flex items-center gap-[0.3125rem] min-w-0">
                              <img
                                :src="option.avatar || assets.avatar"
                                :alt="t('payout.alt.avatar')"
                                class="w-5 h-5 shrink-0"
                              />
                              <span
                                class="text-xs leading-normal truncate text-[#344054] dark:text-[#bdb8af]"
                              >
                                {{ option.label }}
                              </span>
                            </div>
                          </button>

                          <div
                            v-if="filteredCreatorOptions.length === 0"
                            class="flex items-center gap-2.5 px-3 py-2 min-h-[3rem] border-b border-[#EAECF0] dark:border-[#353a3c]"
                          >
                            <span class="text-xs leading-normal truncate text-[#344054] dark:text-[#bdb8af]">
                              {{ t('payout.page.noResult') }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </BasePlanDropdown>
              </div>
            </div>

            <!-- table-wrapper -->
            <FlexTable
              :columns="payoutColumns"
              :rows="payoutRows"
              :theme="tableTheme"
              :themeMobile="tableThemeMobile"
              showMobile
            >
              <!-- DESKTOP HEADERS -->
              <template #header.period="{ col }">
                <div class="pl-6 pr-2.5 w-full">
                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
                </div>
              </template>

              <template #header.status="{ col }">
                <div class="pl-0 pr-2.5 w-full flex justify-start">
                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
                </div>
              </template>

              <template #header.totalEarned="{ col }">
                <div class="pl-2.5 pr-6 w-full text-right">
                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
                </div>
              </template>

              <template #header.rollover="{ col }">
                <div class="pl-2.5 pr-6 w-full text-right">
                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
                </div>
              </template>

              <template #header.transferFee="{ col }">
                <div class="pl-2.5 pr-6 w-full text-right">
                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
                </div>
              </template>

              <template #header.commission="{ col }">
                <div class="pl-2.5 pr-6 w-full text-right">
                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
                </div>
              </template>

              <template #header.finalPayout="{ col }">
                <div class="pl-2.5 pr-6 w-full text-right">
                  <span class="text-sm text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
                </div>
              </template>

              <!-- DESKTOP CELLS -->
              <template #cell.period="{ value }">
                <div class="pl-6 pr-3 w-full">
                  <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ value }}</span>
                </div>
              </template>

              <template #cell.status="{ value }">
                <div class="pl-0 pr-2.5 w-full flex items-center justify-start">
                  <div class="flex h-6 shrink-0">
                    <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px]" 
                         :class="value === 'pending' ? 'bg-[#FFE500] dark:bg-[#a99700]' : 'bg-[#07F468] dark:bg-[#06c454]'">
                      <img :src="value === 'pending' ? assets.clock : assets.tickMark" 
                           :alt="payoutStatusLabel(value)" class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                    </div>
                    <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]">
                      <span class="text-xs leading-normal font-medium" 
                            :class="value === 'pending' ? 'text-[#FFE500] dark:text-[#ffe81a]' : 'text-[#07F468] dark:text-[#23f97b]'">{{ payoutStatusLabel(value) }}</span>
                    </div>
                  </div>
                </div>
              </template>

              <template #cell.totalEarned="{ value }">
                <div class="pl-3 pr-6 w-full text-right">
                  <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ value }}</span>
                </div>
              </template>

              <template #cell.rollover="{ value }">
                <div class="pl-3 pr-6 w-full text-right">
                  <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ value }}</span>
                </div>
              </template>

              <template #cell.transferFee="{ value }">
                <div class="pl-3 pr-6 w-full text-right">
                  <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ value }}</span>
                </div>
              </template>

              <template #cell.commission="{ value }">
                <div class="pl-3 pr-6 w-full text-right">
                  <span class="text-xs leading-normal font-medium text-[#0C111D] dark:text-[#dbd8d3]">{{ value }}</span>
                </div>
              </template>

              <template #cell.finalPayout="{ value }">
                <div class="pl-3 pr-6 w-full text-right">
                  <span class="text-xs leading-normal font-bold text-[#004EEB] dark:text-[#3f9dff]">{{ value }}</span>
                </div>
              </template>

              <template #cell.action="{ row }">
                <div class="pl-3 pr-6 w-full text-right flex justify-end">
                  <button
                    type="button"
                    class="flex justify-center items-center w-8 h-8 cursor-pointer hover:opacity-80"
                    @click.stop="openPayoutHistoryDetail(row)"
                  >
                    <img :src="assets.searchIcon" :alt="t('payout.alt.searchIcon')" class="w-6 h-6">
                  </button>
                </div>
              </template>

              <!-- MOBILE ROW SLOT -->
              <template #mobile-row="{ row }">
                <div class="flex justify-between gap-0.5 w-full">
                  <!-- row-left -->
                  <div class="flex flex-col gap-1 w-[10.625rem] sm:gap-1.5 text-left">
                    <span class="text-sm font-medium py-0.5 text-[#182230] dark:text-[#d1cdc7]">{{ row.period }}</span>
                  
                    <!-- mini-table -->
                    <div class="flex flex-col gap-0.5 sm:gap-1">
                      <div class="flex justify-between items-center gap-0.5">
                        <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">{{ t('payout.page.columns.rollover') }}</span>
                        <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">{{ row.rollover }}</span>
                      </div>
                      <div class="flex justify-between items-center gap-0.5">
                        <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">{{ t('payout.page.columns.transferFee') }}</span>
                        <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">{{ row.transferFee }}</span>
                      </div>
                      <div class="flex justify-between items-center gap-0.5">
                        <span class="text-xs leading-normal font-medium text-[#667085] dark:text-[#9e9589]">{{ t('payout.page.columns.commission') }}</span>
                        <span class="text-xs leading-normal text-[#667085] dark:text-[#9e9589]">{{ row.commission }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- row-right -->
                  <div class="flex flex-col items-end gap-0.5 min-w-[9.4375rem] sm:gap-1.5">
                    <!-- status + detail -->
                    <div class="flex items-center gap-1">
                      <div class="flex h-6">
                        <div class="flex justify-center items-center w-6 h-full backdrop-blur-[10px]"
                             :class="row.status === 'pending' ? 'bg-[#FFE500] dark:bg-[#a99700]' : 'bg-[#07F468] dark:bg-[#06c454]'">
                          <img :src="row.status === 'pending' ? assets.clock : assets.tickMark" 
                               :alt="payoutStatusLabel(row.status)"
                               class="w-4 h-4 [filter:brightness(0)_saturate(100%)]">
                        </div>
                        <div class="flex justify-center items-center px-1.5 h-full backdrop-blur-[10px] bg-black dark:bg-[#181a1b]">
                          <span class="text-xs leading-normal font-medium"
                                :class="row.status === 'pending' ? 'text-[#FFE500] dark:text-[#ffe81a]' : 'text-[#07F468] dark:text-[#23f97b]'">{{ payoutStatusLabel(row.status) }}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        class="flex justify-center items-center w-7 h-7 shrink-0 cursor-pointer hover:opacity-80"
                        @click.stop="openPayoutHistoryDetail(row)"
                      >
                        <img :src="assets.searchIcon" :alt="t('payout.alt.searchIcon')" class="w-5 h-5">
                      </button>
                    </div>

                    <div class="flex flex-col sm:gap-1 text-right">
                      <div class="flex items-center justify-end gap-1">
                        <span class="text-[0.625rem] leading-[1.125rem] font-medium text-[#667085] dark:text-[#9e9589]">{{ t('payout.page.columns.totalEarned') }}</span>
                        <span class="text-[0.625rem] leading-[1.125rem] text-[#667085] dark:text-[#9e9589]">{{ row.totalEarned }}</span>
                      </div>

                      <div class="flex flex-col">
                        <span class="text-xs leading-normal font-medium text-right text-[#667085] dark:text-[#9e9589]">{{ t('payout.page.columns.finalPayout') }}</span>
                        <span class="text-lg font-bold text-right -mt-1 text-[#004EEB] dark:text-[#3f9dff]">{{ row.finalPayout }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </FlexTable>
          </div>
        </div>
    </div>
    </div>
    <PayoutSettingsPopup v-model="showPayoutSettingsPopup" />
    <WithdrawEarningsPopup v-model="showWithdrawPopup" @submitted="onPayoutSubmitted" />
    <TransactionHistoryPopup
      v-model="showTransactionHistoryPopup"
      @open-detail="onPayoutDetail"
    />
    <PayoutHistoryDetailPopup
      v-model="showPayoutHistoryDetailPopup"
      :period="selectedPayoutPeriod"
    />
    <PayoutTransferDetailPopup
      v-model="showPayoutTransferDetailPopup"
      :payout="selectedTransferPayout"
      @action="onPayoutFailAction"
    />
 </DashboardSharedTwoColLayout>
</template>

<style scoped>
.creator-dropdown-scroll {
  scrollbar-width: thin;
  scrollbar-color: #98a2b3 transparent;
}

.creator-dropdown-scroll::-webkit-scrollbar {
  width: 4px;
}

.creator-dropdown-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.creator-dropdown-scroll::-webkit-scrollbar-thumb {
  background: #98a2b3;
  border-radius: 999px;
}

.creator-dropdown-scroll::-webkit-scrollbar-thumb:hover {
  background: #667085;
}
</style>
