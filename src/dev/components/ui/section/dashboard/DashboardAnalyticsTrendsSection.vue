<template>
  <!-- Trends Section -->
      <DashboardSectionWrapper>
        <div class="relative gap-6 flex flex-col">
          <!-- section-header -->
          <div class="flex gap-4 px-2 md:px-4 pt-4 pb-0 justify-between items-start md:items-center">
            <!-- title -->
            <div class="dashboard-analytics-trends-heading flex items-center gap-2 flex-grow flex-shrink basis-auto min-w-0 min-h-0">
              <span>
                <img :src="analyticsTrendsIconUrl || ''" alt="trends" class="w-6 h-6" />
              </span>
              <h2 data-testid="dashboard-analytics-trends-heading"
                class="m-0 text-light-text-quaternary font-sans dark:text-dark-text-quaternary text-xl leading-[1.875rem] font-medium">
                {{ $t('dashboard.analytics.page.trends') }}
              </h2>
            </div>

            <!-- tabs-button-group -->
            <div class="flex flex-col items-stretch md:flex-row md:items-center gap-4 sm:w-auto">
              <!-- last-date -->
              <!-- <div class="flex items-center gap-4 w-full justify-between sm:justify-end sm:w-auto">
              <span class="text-sm leading-5 font-sans text-light-text-quaternary dark:text-dark-text-quaternary">{{ $t('dashboard.analytics.page.lastUpdated') }}
                <span class="text-sm leading-5 font-sans text-light-text-quaternary dark:text-dark-text-quaternary">7:14
                  PM</span></span>
              <DashboardPrimaryButton variant="none" text="Refresh" / :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]">
            </div> -->

              <!-- tabs -->
              <DashboardTabs
                class="shrink-0"
                compact
                v-model="selectedAnalyticsTrendPeriod"
                :tabs="dashboardAnalyticsTrendPeriodTabs"
                active-tab-class="bg-black text-white font-semibold"
                inactive-tab-class=" text-black font-medium"
              />
            </div>
          </div>

          <!-- all-analytics-data -->
          <div class="dashboard-analytics-trends-content md:px-2 md:px-4 pt-0 pb-8 flex flex-col gap-4 min-w-0 max-w-full overflow-x-hidden">
            <!-- mobile: Top Media pages, then merch / tags / countries -->
            <div v-if="isMobile" class="flex flex-col gap-4 min-w-0 max-w-full">
              <DashboardAnalyticsTopMediaTable :period="selectedAnalyticsTrendPeriod.toLowerCase()" :loading="showEnrichmentSkeletons" />
              <DashboardAnalyticsSnapCarousel :slides="3" disable-desktop-grid height-mode="tallest">
                <div class="w-full max-w-full shrink-0 grow-0 [flex-basis:100%] snap-start">
                  <DashboardAnalyticsTopMerchTable :period="selectedAnalyticsTrendPeriod.toLowerCase()" :loading="showEnrichmentSkeletons" />
                </div>
                <div class="w-full max-w-full shrink-0 grow-0 [flex-basis:100%] snap-start">
                  <DashboardAnalyticsTopTagsTable :period="selectedAnalyticsTrendPeriod.toLowerCase()" :loading="showTableSkeletons" />
                </div>
                <div class="w-full max-w-full shrink-0 grow-0 [flex-basis:100%] snap-start">
                  <DashboardAnalyticsTopCountriesTable :period="selectedAnalyticsTrendPeriod.toLowerCase()" :loading="showTableSkeletons" />
                </div>
              </DashboardAnalyticsSnapCarousel>
            </div>

            <!-- tablet / desktop grid -->
            <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3">
              <DashboardAnalyticsTopMediaTable :period="selectedAnalyticsTrendPeriod.toLowerCase()" :loading="showEnrichmentSkeletons" />
              <DashboardAnalyticsTopTagsTable :period="selectedAnalyticsTrendPeriod.toLowerCase()" :loading="showTableSkeletons" />
              <DashboardAnalyticsTopMerchTable :period="selectedAnalyticsTrendPeriod.toLowerCase()" :loading="showEnrichmentSkeletons" />
              <DashboardAnalyticsTopCountriesTable :period="selectedAnalyticsTrendPeriod.toLowerCase()" :loading="showTableSkeletons" />
            </div>
          </div>


        </div>
      </DashboardSectionWrapper>
</template>

<script setup>
import { ref, computed } from 'vue'
import DashboardSectionWrapper from '@/components/ui/card/dashboard/DashboardSectionWrapper.vue'
import DashboardTabs from '@/components/ui/nav/dashboard/DashboardTabs.vue'
import DashboardAnalyticsTopMediaTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopMediaTable.vue'
import DashboardAnalyticsTopTagsTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopTagsTable.vue'
import DashboardAnalyticsTopMerchTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopMerchTable.vue'
import DashboardAnalyticsTopCountriesTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsTopCountriesTable.vue'
import DashboardAnalyticsSnapCarousel from '@/dev/components/ui/section/dashboard/DashboardAnalyticsSnapCarousel.vue'
import { useAssetUrl } from '@/composables/useAssetUrl.js'
import { useEnrichmentSkeleton } from '@/composables/useEnrichmentSkeleton.js'
import { useMobileMd } from '@/composables/useMobileMd.js'
import { dashboardAnalyticsTrendPeriodTabs, DASHBOARD_ANALYTICS_PERIODS } from '@/systems/analytics/analyticsPeriodsConfig.js'

const { url: analyticsTrendsIconUrl } = useAssetUrl('dashboard.analytics.trendsIcon')
const { isEnrichmentPending } = useEnrichmentSkeleton()
const { isMobile } = useMobileMd()
const selectedAnalyticsTrendPeriod = ref(DASHBOARD_ANALYTICS_PERIODS.DAILY)

const props = defineProps({
  isAnalyticsRefreshing: { type: Boolean, default: false },
  hideSkeletons: { type: Boolean, default: false },
})

const showEnrichmentSkeletons = computed(
  () =>
    isEnrichmentPending.value ||
    (!props.hideSkeletons && props.isAnalyticsRefreshing),
)

const showTableSkeletons = computed(
  () => !props.hideSkeletons && (isEnrichmentPending.value || props.isAnalyticsRefreshing),
)
</script>
