<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import FlexTable from '@/components/ui/table/FlexTable.vue';
import DashboardTextInput from '@/components/forms/inputs/DashboardTextInput.vue';
import { useReferralAssets } from '@/dev/composables/useReferralAssets.js';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const { assets } = useReferralAssets();
const { url: searchIconUrl } = useAssetUrl('icon.search');

const searchQuery = ref('');

const referralRows = computed(() => [
  {
    id: 1,
    displayName: 'Princess Carrot Pop',
    username: '@jennyo',
    avatar: assets.value.tableAvatar1,
    verified: true,
    status: 'approved',
    joinDate: '22 Jan 2022',
    showProfile: true,
  },
  {
    id: 2,
    displayName: 'Candy Apple Pop',
    username: '@username',
    avatar: assets.value.tableAvatar2,
    verified: true,
    status: 'inviteSent',
    joinDate: '---',
    showProfile: false,
  },
  {
    id: 3,
    email: 'lily@email.com',
    avatar: assets.value.tableAvatarPlaceholder,
    verified: false,
    status: 'inviteSent',
    joinDate: '---',
    showProfile: false,
    isPlaceholderAvatar: true,
  },
  {
    id: 4,
    displayName: 'Candy Apple Pop',
    username: '@username',
    avatar: assets.value.tableAvatar4,
    verified: true,
    status: 'deactivated',
    joinDate: '22 Jan 2022',
    deactivatedOn: 'xx-xx-xxxx',
    showProfile: false,
  },
  {
    id: 5,
    displayName: 'Candy Apple Pop',
    username: '@username',
    avatar: assets.value.tableAvatar2,
    verified: true,
    status: 'approved',
    joinDate: '22 Jan 2022',
    showProfile: true,
  },
]);

const filteredRows = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const rows = referralRows.value;
  if (!query) return rows;

  return rows.filter((row) => {
    const haystack = [row.displayName, row.username, row.email]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });
});

const columns = computed(() => [
  {
    key: 'from',
    label: t('dashboard.referrals.table.columns.from'),
    basis: { default: 'basis-[280px]', md: 'md:basis-[280px]' },
  },
  {
    key: 'status',
    label: t('dashboard.referrals.table.columns.status'),
    basis: { default: 'basis-[152px]', md: 'md:basis-[152px]' },
  },
  {
    key: 'joinDate',
    label: t('dashboard.referrals.table.columns.joinDate'),
    basis: { default: 'basis-[112px]', md: 'md:basis-[112px]' },
  },
  {
    key: 'note',
    label: '',
    basis: { default: 'basis-[180px]', md: 'md:basis-[200px]' },
    grow: true,
  },
  {
    key: 'profile',
    label: '',
    basis: { default: 'basis-[88px]', md: 'md:basis-[88px]' },
    align: 'right',
  },
]);

const tableTheme = {
  container: 'relative min-w-[812px] overflow-hidden bg-transparent border-0 shadow-none rounded-none',
  header: 'bg-transparent',
  headerRow: 'flex items-center border-b border-[#000]/60',
  headerCell: 'p-0 text-sm font-normal text-[#667085]',
  row: 'flex items-center min-h-[4.75rem] odd:bg-transparent even:bg-[#FFFFFF80]',
  cell: 'p-0 text-sm text-[#344054]',
  footer: 'hidden p-0',
};

function statusLabel(status) {
  if (status === 'approved') return t('dashboard.referrals.table.status.approved');
  if (status === 'inviteSent') return t('dashboard.referrals.table.status.inviteSent');
  if (status === 'deactivated') return t('dashboard.referrals.table.status.deactivated');
  return status;
}
</script>

<template>
  <section class="overflow-hidden bg-[#FFFFFF66]">
    <div class="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
      <h2 class="text-base font-medium leading-normal text-[#475467] dark:text-[#b1aaa0]">
        {{ t('dashboard.referrals.table.title') }}
      </h2>

      <div class="w-full sm:max-w-[15.5rem]">
        <DashboardTextInput
          v-model="searchQuery"
          :left-icon="searchIconUrl"
          :placeholder="t('dashboard.referrals.table.searchPlaceholder')"
          wrapper-class="!h-10 !bg-[#FFFFFF80] !border-[#D0D5DD] ![box-shadow:none] dark:!bg-[#FFFFFF80] dark:!border-[#D0D5DD]"
          input-class="w-full max-w-full box-border text-sm text-[#667085] border-none bg-transparent outline-none py-2 placeholder:text-sm placeholder:text-[#667085]"
        />
      </div>
    </div>

    <div class="overflow-x-auto">
      <FlexTable
        :columns="columns"
        :rows="filteredRows"
        row-key="id"
        :theme="tableTheme"
        desktop-breakpoint="md"
      >
      <template #header.from="{ col }">
        <div class="px-5 py-3">
          <span class="text-sm font-normal text-[#667085]">{{ col.label }}</span>
        </div>
      </template>

      <template #header.status="{ col }">
        <div class="py-3 pl-1 pr-2">
          <span class="text-sm font-normal text-[#667085]">{{ col.label }}</span>
        </div>
      </template>

      <template #header.joinDate="{ col }">
        <div class="py-3 pl-1 pr-2">
          <span class="text-sm font-normal text-[#667085]">{{ col.label }}</span>
        </div>
      </template>

      <template #header.note>
        <span class="sr-only">{{ t('dashboard.referrals.table.deactivatedOn', { date: '' }) }}</span>
      </template>

      <template #header.profile>
        <span class="sr-only">{{ t('dashboard.referrals.table.profile') }}</span>
      </template>

      <template #cell.from="{ row }">
        <div class="flex min-w-0 items-center gap-2.5 px-5 py-3">
          <img
            :src="row.avatar"
            alt=""
            class="h-10 w-10 shrink-0 rounded-full object-cover"
            :class="row.isPlaceholderAvatar ? 'bg-[#D0D5DD] object-contain p-2' : ''"
          />
          <div class="min-w-0">
            <div v-if="row.displayName" class="flex min-w-0 items-center gap-1">
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
            <p
              v-else-if="row.email"
              class="truncate text-sm font-semibold text-[#344054] dark:text-[#dbd8d3]"
            >
              {{ row.email }}
            </p>
          </div>
        </div>
      </template>

      <template #cell.status="{ row }">
        <div class="flex items-center py-3 pl-1 pr-2">
          <div class="flex h-6 shrink-0">
            <div
              class="flex h-full w-6 items-center justify-center"
              :class="{
                'bg-[#07F468]': row.status === 'approved',
                'bg-[#667085]': row.status === 'inviteSent',
                'bg-[#FF4405]': row.status === 'deactivated',
              }"
            >
              <img
                v-if="row.status === 'approved' && assets.tableStatusApproved"
                :src="assets.tableStatusApproved"
                alt=""
                class="h-4 w-4 [filter:brightness(0)_saturate(100%)]"
              />
              <img
                v-else-if="row.status === 'inviteSent' && assets.tableStatusInvite"
                :src="assets.tableStatusInvite"
                alt=""
                class="h-4 w-4 [filter:brightness(0)_saturate(100%)]"
              />
              <svg
                v-else-if="row.status === 'deactivated'"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M11 1L1 11M1 1L11 11"
                  stroke="black"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="flex h-full items-center bg-black px-1.5 dark:bg-[#181a1b]">
              <span
                class="whitespace-nowrap text-xs font-bold leading-normal"
                :class="{
                  'text-[#07F468]': row.status === 'approved',
                  'text-[#D0D5DD]': row.status === 'inviteSent',
                  'text-[#FF4405]': row.status === 'deactivated',
                }"
              >
                {{ statusLabel(row.status) }}
              </span>
            </div>
          </div>
        </div>
      </template>

      <template #cell.joinDate="{ row }">
        <div class="py-3 pl-1 pr-2">
          <span class="whitespace-nowrap text-sm font-[400] text-[#475467] dark:text-[#dbd8d3]">
            {{ row.joinDate }}
          </span>
        </div>
      </template>

      <template #cell.note="{ row }">
        <div class="min-w-0 max-w-full overflow-hidden py-3 pl-2 pr-3">
          <span
            v-if="row.deactivatedOn"
            class="block max-w-full text-xs font-semibold leading-snug text-[#FF4405] break-words"
          >
            {{ t('dashboard.referrals.table.deactivatedOn', { date: row.deactivatedOn }) }}
          </span>
        </div>
      </template>

      <template #cell.profile="{ row }">
        <div class="flex shrink-0 items-center justify-end px-5 py-3">
          <button
            v-if="row.showProfile"
            type="button"
            class="inline-flex items-center gap-1 text-xs font-medium text-[#344054] transition-colors  dark:text-[#dbd8d3]"
          >
            <span>{{ t('dashboard.referrals.table.profile') }}</span>
            <img
              v-if="assets.arrowUpRight"
              :src="assets.arrowUpRight"
              alt=""
              class="h-[7px] w-[7px] object-contain [filter:brightness(0)_saturate(100%)]"
            />
          </button>
        </div>
      </template>

      <template #empty>
        {{ t('dashboard.referrals.table.empty') }}
      </template>
    </FlexTable>
    </div>
  </section>
</template>
