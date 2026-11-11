<template>
  <!-- white-card-column-container (tags) -->
  <div class="second-white-card-column w-full min-w-0 max-w-full gap-4 order-2 xl:order-1 flex flex-col">
    <!-- white-card -->
    <DashboardTrendCard class="h-full">
      <!-- tabs-container -->
      <div>
        <!-- title -->
        <div class="flex items-center justify-between gap-2 px-[16px] min-h-[44px] md:h-[44px]">
          <h3 
            data-testid="dashboard-analytics-top-tags-heading"
            class="text-light-text-secondary font-sans dark:text-dark-text-secondary m-0 leading-6 text-base font-medium">
            {{ $t('dashboard.analytics.trends.topTags', 'Top Tags') }}
          </h3>
        </div>
      </div>

      <!-- table-content -->
      <div v-if="loading || topTagsRows.length > 0" class="w-full flex-1 pt-4">
        <FlexTable :columns="dashboardAnalyticsTopTagsColumns" :rows="loading ? skeletonRows : topTagsRows" :theme="topTagsTheme"
          :inner-scroll="!isMobile" :max-height="loading || topTagsRows.length > 0 ? '522px' : '272px'" :sticky-header="true">
          <!-- tag column -->
          <template #cell.tag="{ row }">
            <div class="flex justify-start items-center gap-2.5 h-full w-full sm:px-1">
              <DashboardTableBadge type="rank" :text="row.rank" />
              <DashboardTableBadge type="tag" :text="row.name" />
            </div>
          </template>

          <!-- views column -->
          <template #cell.views="{ row }">
            <div 
              :data-value="row.views"
              class="text-gray-900 text-xs font-semibold font-['Poppins'] text-right w-full sm:px-1">
              {{ row.views }}
            </div>
          </template>

          <template v-if="loading" #cell.tag>
            <div class="flex items-center gap-2.5 w-full" aria-hidden="true">
              <div class="h-5 w-5 rounded-full bg-gray-300 animate-pulse" />
              <div class="h-3 w-24 rounded-md bg-gray-200 animate-pulse" />
            </div>
          </template>
          <template v-if="loading" #cell.views>
            <div class="ml-auto h-3 w-12 rounded-md bg-gray-200 animate-pulse" aria-hidden="true" />
          </template>
        </FlexTable>
      </div>
      <!-- empty-state -->
      <DashboardTrendContent v-else class="flex-1 !min-h-[272px]" :image="analyticsEmptyStateUrl || ''"
        alt="list" :message="$t('dashboard.analytics.trends.noTrend')" />
    </DashboardTrendCard>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { onMounted } from 'vue';

onMounted(() => {
  if (window.performanceTracker) {
    window.performanceTracker.step({
      flowName: 'AnalyticsRender',
      stepName: 'DashboardAnalyticsTopTagsTable Mounted',
      status: 'success'
    });
  }
});

import DashboardTrendCard from '@/components/ui/card/dashboard/DashboardTrendCard.vue'
import DashboardTrendContent from '@/components/ui/card/dashboard/DashboardTrendContent.vue'
import FlexTable from '@/components/ui/table/FlexTable.vue'
import DashboardTableBadge from '@/components/ui/badge/dashboard/DashboardTableBadge.vue'
import { useAssetUrl } from '@/composables/useAssetUrl.js'

import { computed } from 'vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'
import { useMobileMd } from '@/composables/useMobileMd.js'

const { url: analyticsEmptyStateUrl } = useAssetUrl('dashboard.analytics.emptyContributors')

const { t } = useI18n()
const props = defineProps({
  period: { type: String, default: 'daily' },
  loading: { type: Boolean, default: false },
})
const analyticsStore = useDashboardAnalyticsStore()
const { isMobile } = useMobileMd()

const dashboardAnalyticsTopTagsColumns = computed(() => [
  { key: 'tag', label: t('dashboard.analytics.tables.tags.tags'), basis: 'basis-1/2', grow: true, align: 'left' },
  { key: 'views', label: t('dashboard.analytics.tables.tags.views'), basis: 'basis-1/2', grow: true, align: 'right' }
])

const topTagsRows = computed(() => {
  const data = analyticsStore.trendingTags?.[props.period] || [];

  const aggregated = {};
  data.forEach((item) => {
    const key = item.tag;
    if (!key) return;
    if (!aggregated[key]) {
      aggregated[key] = {
        tag: item.tag,
        views: 0,
      };
    }
    aggregated[key].views += item.views || 0;
  });

  const sorted = Object.values(aggregated)
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, isMobile.value ? 5 : 10);

  return sorted.map((item, index) => ({
    id: index,
    rank: index + 1,
    name: item.tag || `Tag #${index + 1}`,
    views: item.views || 0
  }));
});

const skeletonRows = Array.from({ length: 5 }, (_, index) => ({ id: `skeleton-${index}` }))

const topTagsTheme = {
  container: 'relative bg-transparent border-none w-full ',
  header: 'text-gray-500 bg-transparent',
  headerRow: 'flex items-center border-b border-gray-500',
  headerCell: 'px-2.5 py-2.5 text-sm font-normal',
  row: 'flex items-center min-h-[3rem] odd:bg-transparent even:bg-[#F2F4F780] transition-colors',
  cell: 'px-2.5 py-2 flex items-center h-full',
  footer: 'hidden'
}
</script>
