<template>
  <!-- <FlexTable :columns="dashboardAnalyticsContributorsPreviewColumns" :rows="rows" :theme="dashboardAnalyticsContributorsTableTheme" :inner-scroll="true" max-height="300px" :sticky-header="true"> -->
  <FlexTable :columns="dashboardAnalyticsContributorsPreviewColumns" :rows="rows" :theme="dashboardAnalyticsContributorsTableTheme" :inner-scroll="!isMobile" max-height="350px" :sticky-header="true" :skeleton="loading && !(rows && rows.length)">
    <!-- Custom Fan Cell (Rank + Avatar + Info) -->
    <template #cell.contributorIdentity="{ row }">
      <div class="flex items-center gap-2.5 px-2.5 w-full">
        <!-- Rank -->
        <div class="w-5 h-5 bg-black flex items-center justify-center shrink-0">
          <span class="text-white text-sm font-bold leading-5">{{ row.rank }}</span>
        </div>
        <!-- User Info -->
        <div class="flex flex-col justify-center items-start gap-0.5 overflow-hidden">
          <div :data-value="row.name" class="truncate text-gray-900 text-xs font-semibold leading-4">
            {{ row.name }}
          </div>
          <div class="flex items-center gap-1">
            <div class="w-5 h-5 relative rounded-full overflow-hidden shrink-0 border border-black/10">
              <img :src="row.avatar || analyticsDefaultAvatarUrl" class="w-full h-full object-cover" />
            </div>
            <span :data-value="row.handle" class="truncate text-slate-700 text-xs font-normal leading-4">{{ row.handle }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Custom Total Cell -->
    <template #cell.totalUsd="{ row }">
      <div class="px-4 w-full text-right">
        <span :data-value="row.total" class="text-gray-900 text-xs font-semibold leading-4 whitespace-nowrap">USD$ {{ $n(row.total) }}</span>
      </div>
    </template>

    <template #empty>
      <div class="flex flex-col items-center justify-center w-full gap-4 py-8">
        <img :src="analyticsIcon6Url || ''" alt="No contributors" class="w-24 h-24" />
        <span class="text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">{{ $t('dashboard.analytics.tables.noTopContributors', 'No top contributors yet') }}</span>
        <RouterLink to="/dashboard" class="text-sm text-primary-600 underline">{{ $t('dashboard.analytics.page.learnHowToEarn', 'Learn how to earn') }}</RouterLink>
      </div>
    </template>
    <!-- Skeleton rows (Design 2: Rounded breathing pulse) -->
    <template v-if="loading" #cell.contributorIdentity="{ row }">
      <div class="flex items-center gap-2.5 px-3 w-full">
        <div class="w-5 h-5 rounded-full bg-gray-300 animate-pulse shrink-0"></div>
        <div class="flex flex-col gap-2">
          <div class="h-3 w-28 rounded-md bg-gray-200 animate-pulse"></div>
          <div class="h-3 w-20 rounded-md bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    </template>
    <template v-if="loading" #cell.totalUsd="{ row }">
      <div class="px-4 w-full text-right">
        <div class="h-3 w-16 rounded-md bg-gray-200 animate-pulse ml-auto"></div>
      </div>
    </template>
  </FlexTable>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

const { t } = useI18n();
import { computed } from 'vue'
import FlexTable from '@/components/ui/table/FlexTable.vue'
import { useAssetUrl } from '@/composables/useAssetUrl.js'
import { useMobileMd } from '@/composables/useMobileMd.js'

const { isMobile } = useMobileMd()

const { url: analyticsIcon6Url } = useAssetUrl('dashboard.analytics.emptyContributors')
const { url: analyticsDefaultAvatarUrl } = useAssetUrl('dashboard.analytics.defaultAvatar')

defineProps({
  rows: {
    type: Array,
    required: true,
    default: () => []
  },
    loading: {
    type: Boolean,
    default: false
  }
})

const dashboardAnalyticsContributorsPreviewColumns = computed(() => [
  { key: 'contributorIdentity', label: t('dashboard.analytics.tables.fan'), grow: true, align: 'left' },
  { key: 'totalUsd', label: t('dashboard.analytics.tables.totalUsd'), basis: 'basis-32', align: 'right' }
])

const dashboardAnalyticsContributorsTableTheme = {
  container: 'relative bg-transparent border-none w-full min-w-72 dact-container',
  header: 'bg-transparent text-gray-500',
  headerRow: 'flex items-center border-b border-gray-500 w-full',
  headerCell: 'px-4 py-2.5 text-sm font-normal',
  row: 'flex items-center min-h-[4.5rem] odd:bg-transparent even:bg-[#F2F4F780] w-full dact-row',
  cell: 'py-2 flex items-center h-full',
  footer: 'hidden'
}
</script>
