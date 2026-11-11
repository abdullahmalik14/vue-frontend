<template>
  <BasePopup
    :model-value="modelValue"
    @update:model-value="(val) => emit('update:modelValue', val)"
    :popup-config="popupConfig"
  >
    <div
      class="flex h-[100dvh] w-full min-h-0 flex-col overflow-hidden bg-[#F9FAFBE5] md:w-[27rem]"
    >
      <!-- header -->
      <div class="flex shrink-0 items-center justify-between gap-3 px-5 pb-3 pt-5 md:px-6 md:pt-6">
        <h2 class="text-base font-semibold leading-normal text-[#344054] dark:text-[#dbd8d3]">
          {{ t('dashboard.referrals.earningHistory.title') }}
        </h2>

        <button
          type="button"
          class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center transition-opacity hover:opacity-80"
          :aria-label="t('dashboard.referrals.earningHistory.close')"
          @click="handleClose"
        >
          <img
            v-if="closeIconUrl"
            :src="closeIconUrl"
            alt=""
            class="h-full w-full [filter:brightness(0)_saturate(100%)_invert(63%)_sepia(8%)_saturate(601%)_hue-rotate(179deg)_brightness(103%)_contrast(83%)]"
          />
        </button>
      </div>

      <!-- filters -->
      <div class="flex shrink-0 items-center gap-2 px-5 pb-4 md:px-6">
        <BasePlanDropdown
          v-model="selectedMonth"
          :options="monthOptions"
          :unstyled="true"
          width-class=" w-[84px]"
        >
          <template #trigger="{ isOpen, selectedLabel }">
            <div :class="dropdownTriggerClass">
              <span class="truncate text-sm font-medium text-[#344054] dark:text-[#dbd8d3]">
                {{ selectedLabel }}
              </span>
              <div
                class="h-4 w-4 shrink-0 transition-transform duration-200 bg-[#667085]"
                :class="{ 'rotate-180': isOpen }"
                :style="arrowsMaskStyle"
                aria-hidden="true"
              />
            </div>
          </template>

          <template #options-container="{ options, selectOption, modelValue, isOpen, isUpwards }">
            <div
              class="absolute left-0 right-0 z-[9999] transition-[opacity,transform] duration-200 ease-out"
              :class="[
                isOpen
                  ? 'pointer-events-auto scale-100 opacity-100'
                  : 'pointer-events-none scale-95 opacity-0',
                isUpwards ? 'bottom-[calc(100%+0.5rem)] top-auto origin-bottom' : 'top-[calc(100%+0.5rem)] origin-top',
              ]"
            >
              <div :class="dropdownOptionsClass">
                <button
                  v-for="option in options"
                  :key="option.value"
                  type="button"
                  class="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium text-[#344054] transition-colors hover:bg-[#F2F4F7] dark:text-[#dbd8d3] dark:hover:bg-[#181a1b]"
                  :class="{ 'bg-[#F2F4F7] dark:bg-[#181a1b]': modelValue === option.value }"
                  @click.stop="selectOption(option)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </template>
        </BasePlanDropdown>

        <BasePlanDropdown
          v-model="selectedYear"
          :options="yearOptions"
          :unstyled="true"
          width-class="w-[84px]"
        >
          <template #trigger="{ isOpen, selectedLabel }">
            <div :class="dropdownTriggerClass">
              <span class="truncate text-sm font-medium text-[#344054] dark:text-[#dbd8d3]">
                {{ selectedLabel }}
              </span>
              <div
                class="h-4 w-4 shrink-0 transition-transform duration-200 bg-[#667085]"
                :class="{ 'rotate-180': isOpen }"
                :style="arrowsMaskStyle"
                aria-hidden="true"
              />
            </div>
          </template>

          <template #options-container="{ options, selectOption, modelValue, isOpen, isUpwards }">
            <div
              class="absolute left-0 right-0 z-[9999] transition-[opacity,transform] duration-200 ease-out"
              :class="[
                isOpen
                  ? 'pointer-events-auto scale-100 opacity-100'
                  : 'pointer-events-none scale-95 opacity-0',
                isUpwards ? 'bottom-[calc(100%+0.5rem)] top-auto origin-bottom' : 'top-[calc(100%+0.5rem)] origin-top',
              ]"
            >
              <div :class="dropdownOptionsClass">
                <button
                  v-for="option in options"
                  :key="option.value"
                  type="button"
                  class="flex w-full items-center px-4 py-2.5 text-left text-sm font-medium text-[#344054] transition-colors hover:bg-[#F2F4F7] dark:text-[#dbd8d3] dark:hover:bg-[#181a1b]"
                  :class="{ 'bg-[#F2F4F7] dark:bg-[#181a1b]': modelValue === option.value }"
                  @click.stop="selectOption(option)"
                >
                  {{ option.label }}
                </button>
              </div>
            </div>
          </template>
        </BasePlanDropdown>
      </div>

      <!-- list -->
      <div
        class="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-6  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <FlexTable
          :columns="columns"
          :rows="filteredRows"
          row-key="id"
          :theme="tableTheme"
          desktop-breakpoint="md"
        >
          <template #header.referee="{ col }">
            <div class="pb-2">
              <span class="text-sm font-normal text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
            </div>
          </template>

          <template #header.amount="{ col }">
            <div class="flex justify-end pb-2">
              <span class="text-sm font-normal text-[#667085] dark:text-[#9e9589]">{{ col.label }}</span>
            </div>
          </template>

          <template #cell.referee="{ row }">
            <div class="flex min-w-0 items-center gap-2.5 py-4">
              <img
                :src="row.avatar"
                alt=""
                class="h-10 w-10 shrink-0 rounded-full object-cover"
              />
              <div class="min-w-0">
                <div class="flex min-w-0 items-center gap-1">
                  <span class="truncate text-sm font-semibold text-[#344054] dark:text-[#dbd8d3]">
                    {{ row.displayName }}
                  </span>
                  <img
                    v-if="row.verified && assets.tableVerifiedTick"
                    :src="assets.tableVerifiedTick"
                    alt=""
                    class="h-3 w-3 shrink-0"
                  />
                </div>
                <p
                  v-if="row.username"
                  class="truncate text-xs leading-normal text-[#667085] dark:text-[#9e9589]"
                >
                  {{ row.username }}
                </p>
              </div>
            </div>
          </template>

          <template #cell.amount="{ row }">
            <div class="flex justify-end py-4">
              <span class="shrink-0 text-sm font-semibold text-[#344054] dark:text-[#dbd8d3]">
                {{ t('dashboard.referrals.earningHistory.amountUsd', { amount: row.amount }) }}
              </span>
            </div>
          </template>

          <template #empty>
            {{ t('dashboard.referrals.earningHistory.empty') }}
          </template>
        </FlexTable>
      </div>
    </div>
  </BasePopup>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
import FlexTable from '@/components/ui/table/FlexTable.vue';
import { useReferralAssets } from '@/dev/composables/useReferralAssets.js';
import { usePlanAssets } from '@/composables/usePlanAssets.js';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const { t } = useI18n();
const { assets } = useReferralAssets();
const { assets: planAssets } = usePlanAssets();
const { url: closeIconUrl } = useAssetUrl('payout.icon.close');

const selectedMonth = ref('12');
const selectedYear = ref('2024');

const popupConfig = {
  actionType: 'slideIn',
  from: 'right',
  shouldShowOverlay: true,
  shouldCloseOnOutsideClick: true,
  shouldLockBodyScroll: true,
  scrollable: false,
  containerClass: '[&>div]:h-full [&>div]:min-h-0',
  width: { default: '100%', '>768': '27rem' },
  height: { default: '100%' },
};

const dropdownTriggerClass =
  'flex h-10 w-full items-center justify-between gap-2 rounded-lg bg-[#FFFFFF80] px-3.5 shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] cursor-pointer';

const dropdownOptionsClass =
  'overflow-hidden rounded-lg border border-[#EAECF0] bg-white shadow-[0px_4px_6px_-2px_rgba(16,24,40,0.03),0px_12px_16px_-4px_rgba(16,24,40,0.08)] dark:border-[#353a3c] dark:bg-[#181a1b]';

const tableTheme = {
  container: 'relative overflow-hidden bg-transparent border-0 shadow-none rounded-none',
  header: 'bg-transparent',
  headerRow: 'flex items-center border-b border-[#00000099] px-6',
  headerCell: 'p-0 text-sm font-normal text-[#667085]',
  row: 'flex items-center px-6 odd:bg-transparent even:bg-[#FFFFFF80]',
  cell: 'p-0 text-sm text-[#344054]',
  footer: 'hidden p-0',
};

const columns = computed(() => [
  {
    key: 'referee',
    label: t('dashboard.referrals.earningHistory.columns.referee'),
    grow: true,
    basis: { default: 'basis-0' },
  },
  {
    key: 'amount',
    label: t('dashboard.referrals.earningHistory.columns.amount'),
    align: 'right',
    basis: { default: 'basis-[7rem]' },
  },
]);

const arrowsMaskStyle = computed(() => ({
  maskImage: `url('${planAssets.value.arrowsMask}')`,
  webkitMaskImage: `url('${planAssets.value.arrowsMask}')`,
  maskSize: 'contain',
  webkitMaskSize: 'contain',
  maskRepeat: 'no-repeat',
  webkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  webkitMaskPosition: 'center',
}));

const monthOptions = computed(() => [
  { value: '12', label: t('dashboard.referrals.earningHistory.months.dec') },
  { value: '11', label: t('dashboard.referrals.earningHistory.months.nov') },
  { value: '10', label: t('dashboard.referrals.earningHistory.months.oct') },
  { value: '9', label: t('dashboard.referrals.earningHistory.months.sep') },
  { value: '8', label: t('dashboard.referrals.earningHistory.months.aug') },
  { value: '7', label: t('dashboard.referrals.earningHistory.months.jul') },
  { value: '6', label: t('dashboard.referrals.earningHistory.months.jun') },
  { value: '5', label: t('dashboard.referrals.earningHistory.months.may') },
  { value: '4', label: t('dashboard.referrals.earningHistory.months.apr') },
  { value: '3', label: t('dashboard.referrals.earningHistory.months.mar') },
  { value: '2', label: t('dashboard.referrals.earningHistory.months.feb') },
  { value: '1', label: t('dashboard.referrals.earningHistory.months.jan') },
]);

const yearOptions = computed(() => [
  { value: '2027', label: '2027' },
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' },
  { value: '2024', label: '2024' },
  { value: 'all', label: t('dashboard.referrals.earningHistory.allTime') },
]);

const earningRows = computed(() => [
  {
    id: 1,
    displayName: 'Princess Carrot Pop',
    username: '@jennya',
    avatar: assets.value.tableAvatar1,
    verified: true,
    amount: '123.12',
    month: '12',
    year: '2024',
  },
  {
    id: 2,
    displayName: 'Jenny J.',
    username: '@jennyj',
    avatar: assets.value.tableAvatar2,
    verified: true,
    amount: '123.12',
    month: '12',
    year: '2024',
  },
  {
    id: 3,
    displayName: 'Jenny K.',
    username: '',
    avatar: assets.value.tableAvatar4,
    verified: true,
    amount: '23.12',
    month: '12',
    year: '2024',
  },
]);

const filteredRows = computed(() => {
  return earningRows.value.filter((row) => {
    const monthMatch = selectedMonth.value === row.month;
    const yearMatch = selectedYear.value === 'all' || selectedYear.value === row.year;
    return monthMatch && yearMatch;
  });
});

function handleClose() {
  emit('update:modelValue', false);
}
</script>
