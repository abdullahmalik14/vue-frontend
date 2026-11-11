<template>
  <!-- white-card-column-container (media) -->
  <div class="col-span-full xl:col-span-2 gap-4 w-full min-w-0 max-w-full order-0 flex flex-col">
    <!-- white-card -->
    <DashboardTrendCard>
      <!-- tabs-container -->
      <div
        class="w-full px-2 flex flex-row items-center justify-between gap-2 min-h-[44px] md:h-[44px] md:min-h-0">
        <!-- title -->
        <div class="flex items-center gap-2 min-w-0">
          <h3 
            data-testid="dashboard-analytics-top-media-heading"
            class="text-slate-700 m-0 leading-6 text-base font-medium font-['Poppins']">
            {{ $t('dashboard.analytics.trends.topMedia', 'Top Media') }}
          </h3>
        </div>

        <!-- tabs-button-group -->
        <DashboardTabs
          class="shrink-0"
          compact
          :tabs="topMediaTabs"
          v-model="selectedTopMediaTab"
          active-tab-class="bg-black text-white font-semibold"
          inactive-tab-class="bg-transparent text-black font-medium"
          tabs-only
        />
      </div>

      <!-- tabs-content -->
      <!-- ENRICHMENT LOADING -->
      
      

      <div
  v-if="selectedMediaRows.length > 0 || loading"
  class="w-full flex-1 pt-4"
  :style="{ minHeight: TABLE_HEIGHT }"
>

                <DashboardAnalyticsSnapCarousel
          v-if="isMobile && mediaPages.length > 1"
          :key="selectedTopMediaTab"
          :slides="mediaPages.length"
          disable-desktop-grid
          height-mode="tallest"
        >




          <div
            v-for="(pageRows, pageIndex) in mediaPages"
            :key="`${selectedTopMediaTab}-${pageIndex}`"
            class="w-full max-w-full shrink-0 grow-0 [flex-basis:100%] snap-start"
          >
            <DashboardAnalyticsTopMediaTableBody
              :columns="selectedMediaColumns"
              :rows="pageRows"
              :loading="loading"
              :theme="topMediaTheme"
              :empty-image="analyticsEmptyStateUrl || ''"
            />
          </div>
        </DashboardAnalyticsSnapCarousel>
        <DashboardAnalyticsTopMediaTableBody
          v-else
          :columns="selectedMediaColumns"
          :rows="visibleMediaRows"
          :loading="loading"
          :theme="topMediaTheme"
          inner-scroll
          :max-height="TABLE_HEIGHT"
          :empty-image="analyticsEmptyStateUrl || ''"
        />
      </div>


       <DashboardTrendContent v-else-if="!loading" class="!min-h-[522px] h-[522px]" :image="analyticsEmptyStateUrl || ''"
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
      stepName: 'DashboardAnalyticsTopMediaTable Mounted',
      status: 'success'
    });
  }
});

import { ref, computed } from 'vue'
// ENRICHMENT LOADING
import AnalyticsMediaSkeletonRow from './AnalyticsMediaSkeletonRow.vue'
import { useEnrichmentSkeleton } from '@/composables/useEnrichmentSkeleton.js'
import DashboardTrendCard from '@/components/ui/card/dashboard/DashboardTrendCard.vue'
import DashboardTrendContent from '@/components/ui/card/dashboard/DashboardTrendContent.vue'
import DashboardTabs from '@/components/ui/nav/dashboard/DashboardTabs.vue'
import DashboardAnalyticsTopMediaTableBody from './DashboardAnalyticsTopMediaTableBody.vue'
import DashboardAnalyticsSnapCarousel from '@/dev/components/ui/section/dashboard/DashboardAnalyticsSnapCarousel.vue'
import { useMobileMd } from '@/composables/useMobileMd.js'

import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'
import { useAssetUrl } from '@/composables/useAssetUrl.js'
import { formatDecimal } from '@/utils/common/formatters.js'

const MOBILE_MEDIA_PAGE_SIZE = 5
const TABLE_HEIGHT = '522px'  

function paginateRows(rows, pageSize) {
  if (!pageSize || !rows.length) return rows.length ? [rows] : []
  const pages = []
  for (let i = 0; i < rows.length; i += pageSize) {
    pages.push(rows.slice(i, i + pageSize))
  }
  return pages
}

const { url: analyticsEmptyStateUrl } = useAssetUrl('dashboard.analytics.emptyContributors')

const { t } = useI18n()
const props = defineProps({
   period: { type: String, default: 'daily' },
   loading: { type: Boolean, default: false }
 })
const analyticsStore = useDashboardAnalyticsStore()
// ENRICHMENT LOADING
const { isEnrichmentPending } = useEnrichmentSkeleton()
const { isMobile } = useMobileMd()

const topMediaTabs = computed(() => [
  { id: 'Views', label: t('dashboard.analytics.tables.media.viewsTab') },
  { id: 'P2V Sales', label: t('dashboard.analytics.tables.media.p2vSalesTab') },
])
const selectedTopMediaTab = ref('Views')

const selectedMediaRows = computed(() => (
  selectedTopMediaTab.value === 'Views' ? topMediaRows.value : p2vSalesRows.value
))

const visibleMediaRows = computed(() => {
  if (selectedMediaRows.value.length) return selectedMediaRows.value
  if (!props.loading) return []
  return Array.from({ length: 5 }, (_, index) => ({
    id: `skeleton-${index}`,
    rank: index + 1,
    title: '',
    clicks: '',
    duration: '',
    image: '',
  }))
})

const selectedMediaColumns = computed(() => (
  selectedTopMediaTab.value === 'Views'
    ? dashboardAnalyticsTopMediaColumns.value
    : dashboardAnalyticsP2VSalesColumns.value
))

const mediaPages = computed(() => paginateRows(visibleMediaRows.value, MOBILE_MEDIA_PAGE_SIZE))

const dashboardAnalyticsTopMediaColumns = computed(() => [
  { key: 'media', label: t('dashboard.analytics.tables.media.media'), basis: 'basis-1/3', grow: true, align: 'left' },
  { key: 'clicks', label: t('dashboard.analytics.tables.media.clicks'), basis: 'basis-1/3', grow: true, align: 'center' },
  { key: 'duration', label: t('dashboard.analytics.tables.media.watchDuration'), basis: 'basis-1/3', grow: true, align: 'right' }
])

const dashboardAnalyticsP2VSalesColumns = computed(() => [
  { key: 'media', label: t('dashboard.analytics.tables.media.media'), basis: 'basis-1/3', grow: true, align: 'left' },
  { key: 'sales_count', label: t('dashboard.analytics.tables.media.sales'), basis: 'basis-1/3', grow: true, align: 'center' },
  { key: 'sales_usd', label: t('dashboard.analytics.tables.media.salesUsd'), basis: 'basis-1/3', grow: true, align: 'right' }
])

function formatDuration(sec) {
  if (!sec || sec <= 0) return '0h0m';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) {
    return `${h}h${m}m`;
  }
  if (m > 0) {
    return `${m}m${s}s`;
  }
  return `${s}s`;
}

const topMediaRows = computed(() => {
  const enrichedMedia = analyticsStore.enrichment.media || {};
  const data = (analyticsStore.trendingMedia?.[props.period] || [])
    .slice();

  const aggregated = {};
  data.forEach((item) => {
    const key = item.media || item.title || `Media #${item.rank || 'unknown'}`;
    if (!key) return;

    if (!aggregated[key]) {
      let mediaId = item.mediaId;
      if (mediaId == null && item.media) {
        mediaId = Number(String(item.media).replace(/^Media\s*#/, '').trim());
      }
      aggregated[key] = {
        media: item.media,
        mediaId,
        title: item.title,
        thumbnailUrl: item.thumbnailUrl,
        views: 0,
        clicks: 0,
        watchDurationSec: 0,
      };
    }
    aggregated[key].views += item.views || 0;
    aggregated[key].clicks += item.clicks || 0;
    aggregated[key].watchDurationSec += item.watchDurationSec || 0;
  });

  const sorted = Object.values(aggregated)
    .sort((a, b) => {
      const bWatch = b.watchDurationSec || 0;
      const aWatch = a.watchDurationSec || 0;
      if (bWatch !== aWatch) return bWatch - aWatch;
      const bClicks = b.views || b.clicks || 0;
      const aClicks = a.views || a.clicks || 0;
      return bClicks - aClicks;
    })
    .slice(0, 10);

  return sorted.map((item, index) => {
    const enriched = item.mediaId != null ? enrichedMedia[String(item.mediaId)] : null;
    return {
      id: index,
      rank: index + 1,
      title: (enriched && enriched.title) || item.title || item.media || `Media #${index + 1}`,
      clicks: item.views || item.clicks || 0,
      duration: formatDuration(item.watchDurationSec),
      image: (enriched && enriched.thumbnailUrl) || '/images/profile-thumbnail.png'
    };
  });
});

const p2vSalesRows = computed(() => {
  const enrichedMedia = analyticsStore.enrichment.media || {};
  const data = analyticsStore.trendingMedia?.[props.period] || [];
  const aggregated = {};
  data.forEach(item => {
    let mediaId = item.mediaId;
    if (mediaId == null && item.media) {
      mediaId = Number(String(item.media).replace(/^Media\s*#/, '').trim());
    }
    const key = item.media || item.title || `Media #${item.rank || 'unknown'}`;
    if (!key) return;
    const salesUSD = item.ppvSalesUSD || item.salesUSD || item.sales_usd || 0;
    const salesCount = item.ppvSalesCount || item.salesCount || item.sales_count || 0;
    if (!aggregated[key]) {
      aggregated[key] = {
        title: key,
        mediaId: mediaId,
        thumbnailUrl: item.thumbnailUrl,
        salesUSD: 0,
        salesCount: 0,
      };
    }
    aggregated[key].salesUSD += salesUSD;
    aggregated[key].salesCount += salesCount;
  });

  const sorted = Object.values(aggregated)
    .filter(item => item.salesCount > 0)
    .sort((a, b) => b.salesUSD - a.salesUSD)
    .slice(0, 10);

  return sorted.map((item, index) => {
    const enriched = item.mediaId != null ? enrichedMedia[String(item.mediaId)] : null;
    return {
      id: index,
      rank: index + 1,
      title: (enriched && enriched.title) || item.title,
      sales_count: item.salesCount,
      sales_usd: `USD$ ${formatDecimal(item.salesUSD)}`,
      image: (enriched && enriched.thumbnailUrl) || '/images/profile-thumbnail.png'
    };
  });
});

const topMediaTheme = {
  container: 'relative bg-transparent border-none w-full ',
  header: 'text-gray-500 bg-transparent',
  headerRow: 'flex items-center border-b border-gray-500',
  headerCell: 'px-2.5 py-2.5 text-sm font-normal',
  row: 'flex items-center min-h-[6rem] odd:bg-transparent even:bg-[#F2F4F780]',
  cell: 'px-2.5 py-2 flex items-center h-full',
  footer: 'hidden'
}
</script>

<style scoped>
@keyframes skeleton-breathe {
  0%,
  100% {
    opacity: 0.48;
    transform: scale(0.985);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-skeleton-breathe {
  animation: skeleton-breathe 1.15s ease-in-out infinite;
}
</style>
