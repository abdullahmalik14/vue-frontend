<template>
  <!-- white-card-column-container (countries) -->
  <div class="fourth-white-card-column w-full min-w-0 max-w-full gap-4 order-3 flex flex-col">
    <!-- white-card -->
    <DashboardTrendCard class="h-full">
      <!-- tabs-container -->
      <div>
        <!-- title -->
        <div class="flex items-center justify-between gap-2 px-[16px] min-h-[44px] md:h-[44px]">
          <h3 
            data-testid="dashboard-analytics-top-countries-heading"
            class="text-light-text-secondary dark:text-dark-text-secondary m-0 leading-6 text-base font-medium">
            {{ $t('dashboard.analytics.trends.topCountries') }}
          </h3>
        </div>
      </div>

      <!-- table-content -->
      <div v-if="loading || topCountriesRows.length > 0" class="w-full flex-1 pt-4 !min-h-[272px]">
        <FlexTable :columns="dashboardAnalyticsTopCountriesColumns" :rows="loading ? skeletonRows : topCountriesRows" :theme="topCountriesTheme"
          :inner-scroll="!isMobile" :max-height="loading || topCountriesRows.length > 0 ? '522px' : '272px'" :sticky-header="true">
          <!-- tags column -->
          <template #cell.tags="{ row }">
            <div class="flex justify-start items-center gap-2.5 h-full w-full sm:px-1">
              <DashboardTableBadge type="rank" :text="row.rank" />
              <div 
                :data-value="row.country"
                class="flex-1 text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 line-clamp-2">
                {{ row.country }}
              </div>
            </div>
          </template>

          <!-- sales column -->
          <template #cell.sales="{ row }">
            <div
              :data-value="row.sales"
              class="text-right w-full text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 truncate sm:px-1">
              {{ row.sales }}
            </div>
          </template>

          <template v-if="loading" #cell.tags>
            <div class="flex items-center gap-2.5 w-full" aria-hidden="true">
              <div class="h-5 w-5 rounded-full bg-gray-300 animate-pulse" />
              <div class="h-3 w-24 rounded-md bg-gray-200 animate-pulse" />
            </div>
          </template>
          <template v-if="loading" #cell.sales>
            <div class="ml-auto h-3 w-16 rounded-md bg-gray-200 animate-pulse" aria-hidden="true" />
          </template>
        </FlexTable>
      </div>
      <!-- empty-state -->
      <DashboardTrendContent v-else class="flex-1 !min-h-[272px]" :image="analyticsEmptyContributorsUrl || ''"
        alt="list" :message="$t('dashboard.analytics.trends.noTrend')" />
    </DashboardTrendCard>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  if (window.performanceTracker) {
    window.performanceTracker.step({
      flowName: 'AnalyticsRender',
      stepName: 'DashboardAnalyticsTopCountriesTable Mounted',
      status: 'success'
    });
  }
});

import DashboardTrendCard from '@/components/ui/card/dashboard/DashboardTrendCard.vue'
import DashboardTrendContent from '@/components/ui/card/dashboard/DashboardTrendContent.vue'
import FlexTable from '@/components/ui/table/FlexTable.vue'
import DashboardTableBadge from '@/components/ui/badge/dashboard/DashboardTableBadge.vue'

import { computed } from 'vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'
import { useI18n } from 'vue-i18n'
import { useAssetUrl } from '@/composables/useAssetUrl.js'
import { analyticsCountryCodeToDisplayName } from '@/systems/analytics/analyticsCountryLabels.js'
import { filterZeroAmountEntries } from '@/utils/common/analyticsFilters.js'
import { useMobileMd } from '@/composables/useMobileMd.js'

const props = defineProps({
  period: { type: String, default: 'daily' },
  loading: { type: Boolean, default: false },
})
const analyticsStore = useDashboardAnalyticsStore()
const { isMobile } = useMobileMd()

const { t, n } = useI18n()
const { url: analyticsEmptyContributorsUrl } = useAssetUrl('dashboard.analytics.emptyContributors')

const dashboardAnalyticsTopCountriesColumns = computed(() => [
  { key: 'tags', label: t('dashboard.analytics.trends.topCountries'), basis: 'basis-1/2', grow: true, align: 'left' },
  { key: 'sales', label: t('dashboard.analytics.tables.salesUsd'), basis: 'basis-1/2', grow: true, align: 'right' }
])

const topCountriesRows = computed(() => {
  const data = analyticsStore.trendingCountries?.[props.period] || [];

  // Merge duplicate countries
  const countryMap = new Map();

  data.forEach((item) => {
    const countryCode = item.country;
    const sales =
      Number(item.salesUSD || item.earningsUSD || item.sales_usd || 0);

    if (!countryMap.has(countryCode)) {
      countryMap.set(countryCode, {
        country: countryCode,
        sales,
      });
    } else {
      countryMap.get(countryCode).sales += sales;
    }
  });

  // Convert to array, sort by sales descending, and assign ranks
  return filterZeroAmountEntries([...countryMap.values()], 'sales')
    .sort((a, b) => b.sales - a.sales)
    .slice(0, isMobile.value ? 5 : 10)
    .map((item, index) => ({
      id: index,
      rank: index + 1,
      country:
        analyticsCountryCodeToDisplayName[item.country] || item.country,
      sales: `USD$ ${n(item.sales)}`,
    }));
});

const skeletonRows = Array.from({ length: 5 }, (_, index) => ({ id: `skeleton-${index}` }))

const topCountriesTheme = {
  container: 'relative bg-transparent border-none w-full ',
  header: 'text-gray-500 bg-transparent',
  headerRow: 'flex items-center border-b border-gray-500 w-full',
  headerCell: 'px-3 py-2.5 text-sm font-normal',
  row: 'flex items-center min-h-[3rem] odd:bg-transparent even:bg-[#F2F4F780] transition-colors w-full',
  cell: 'px-3 py-2 flex items-center h-full',
  footer: 'hidden'
}
</script>
