<template>
  <DashboardSharedTwoColLayout>
    <div class="relative flex flex-col gap-6 min-w-0 max-w-full overflow-x-hidden">
      <DashboardSharedHeader v-if="!hideLayout" />

      <DashboardAnalyticsWelcomeHeader v-if="hideLayout && isMobile" />

      <!-- ========================================================== -->
      <!-- JENNY GREETING BANNER & QUOTE SECTION (COMMENTED OUT BELOW) -->
      <!-- ========================================================== -->
      <!-- <DashboardAnalyticsWelcomeBanner /> -->
      
      <!-- Analytics Content Wrapper: keep the current data visible while refresh runs.
           data-analytics-embed-content is the iframe height source — popups stay outside it. -->
      <div data-analytics-embed-content class="flex flex-col gap-6">
        <!-- Overview Section -->
        <DashboardAnalyticsOverviewSection
          :is-analytics-refreshing="isAnalyticsRefreshing"
          @openSubscribersTrendPopup="openAnalyticsSubscribersTrendPopup"
          @openEarningsTrendPopup="openAnalyticsEarningsTrendPopup"
          @openFansTrendPopup="openAnalyticsFansTrendPopup"
          @openLikesTrendPopup="openAnalyticsLikesTrendPopup"
          @openContributorsTrendPopup="openAnalyticsContributorsTrendPopup"
          @refresh="refreshDashboardAnalytics"
        />

        <!-- Orders Received: hidden on phone iframe only, kept on iPad/desktop -->
        <div v-if="!hideLayout || !isMobile">
          <DashboardAnalyticsOrdersReceivedTable :is-analytics-refreshing="isAnalyticsRefreshing" />
        </div>

        <!-- Trends Section -->
        <DashboardAnalyticsTrendsSection :is-analytics-refreshing="isAnalyticsRefreshing" />
        </div>

        <!--
          Keep mounted after warm/first open: destroy-on-close remounts AmCharts and blocks shell (~1s).
          Warm path = toggle v-model only → white shell + spinner instantly, content loads after.
        -->
        <DashboardAnalyticsSubscribersTrendPopup
          v-if="trendMounted.subscribers || isSubscribersTrendPopupOpen"
          v-model="isSubscribersTrendPopupOpen"
          v-model:period="analyticsSubscribersTrendPeriod"
          :insight-data="dashboardAnalyticsStore.getSubscribersViewModel(analyticsSubscribersTrendPeriod)"
        />
        <DashboardAnalyticsEarningsTrendPopup
          v-if="trendMounted.earnings || isEarningsTrendPopupOpen"
          v-model="isEarningsTrendPopupOpen"
          v-model:period="analyticsEarningsTrendPeriod"
          :insight-data="dashboardAnalyticsStore.getEarningsViewModel(analyticsEarningsTrendPeriod)"
        />
        <DashboardAnalyticsFansTrendPopup
          v-if="trendMounted.fans || isFansTrendPopupOpen"
          v-model="isFansTrendPopupOpen"
          v-model:period="analyticsFansTrendPeriod"
          :insight-data="dashboardAnalyticsStore.getFansViewModel(analyticsFansTrendPeriod)"
        />
        <DashboardAnalyticsLikesTrendPopup
          v-if="trendMounted.likes || isLikesTrendPopupOpen"
          v-model="isLikesTrendPopupOpen"
          v-model:period="analyticsLikesTrendPeriod"
          :insight-data="dashboardAnalyticsStore.getLikesViewModel()"
        />
        <DashboardAnalyticsContributorsTrendPopup
          v-if="trendMounted.contributors || isContributorsTrendPopupOpen"
          v-model="isContributorsTrendPopupOpen"
          v-model:period="analyticsContributorsTrendPeriod"
          :insight-data="dashboardAnalyticsStore.getContributorsViewModel(analyticsContributorsTrendPeriod)"
        />
    </div>
  </DashboardSharedTwoColLayout>
</template>

<script setup>
import DashboardSharedTwoColLayout from '@/templates/dashboard/shared/DashboardSharedTwoColLayout.vue'
import DashboardSharedHeader from '@/templates/dashboard/shared/DashboardSharedHeader.vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'
import { FlowHandler } from '@/services/flow-system/FlowHandler'
import FlowRefreshManager from '@/services/flow-system/flowRefreshManager'
import { ANALYTICS_FETCH_FLOW } from '@/config/dashboardAnalyticsFlows.js'
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMobileMd } from '@/composables/useMobileMd.js'
import { markEmbedAnalyticsDataReady } from '@/systems/embed/embedViewport.js'
import DashboardAnalyticsEarningsTrendPopup from '@/components/ui/popups/DashboardAnalyticsEarningsTrendPopup.vue'
import DashboardAnalyticsSubscribersTrendPopup from '@/components/ui/popups/DashboardAnalyticsSubscribersTrendPopup.vue'
import DashboardAnalyticsFansTrendPopup from '@/components/ui/popups/DashboardAnalyticsFansTrendPopup.vue'
import DashboardAnalyticsLikesTrendPopup from '@/components/ui/popups/DashboardAnalyticsLikesTrendPopup.vue'
import DashboardAnalyticsContributorsTrendPopup from '@/components/ui/popups/DashboardAnalyticsContributorsTrendPopup.vue'
import DashboardAnalyticsOrdersReceivedTable from '@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsOrdersReceivedTable.vue'
import DashboardAnalyticsTrendsSection from '@/dev/components/ui/section/dashboard/DashboardAnalyticsTrendsSection.vue'
import DashboardAnalyticsOverviewSection from '@/dev/components/ui/section/dashboard/DashboardAnalyticsOverviewSection.vue'
import DashboardAnalyticsWelcomeBanner from '@/dev/components/ui/section/dashboard/DashboardAnalyticsWelcomeBanner.vue'
import DashboardAnalyticsWelcomeHeader from '@/dev/components/ui/section/dashboard/DashboardAnalyticsWelcomeHeader.vue'

const route = useRoute()
const hideLayout = computed(() => route.meta?.routeConfig?.hideLayout || route.meta?.hideLayout || false)
const { isMobile } = useMobileMd()

const dashboardAnalyticsStore = useDashboardAnalyticsStore()

const analyticsSubscribersTrendPeriod = ref('daily')
const analyticsEarningsTrendPeriod = ref('daily')
const analyticsFansTrendPeriod = ref('daily')
const analyticsLikesTrendPeriod = ref('daily')
const analyticsContributorsTrendPeriod = ref('daily')

/** Stay true after warm/first open so close does not destroy popup (instant reopen). */
const trendMounted = ref({
  subscribers: false,
  earnings: false,
  fans: false,
  likes: false,
  contributors: false,
})

const isSubscribersTrendPopupOpen = ref(false)
const isEarningsTrendPopupOpen = ref(false)
const isFansTrendPopupOpen = ref(false)
const isLikesTrendPopupOpen = ref(false)
const isContributorsTrendPopupOpen = ref(false)

function openTrendPopup(key, isOpenRef, periodRef, initialPeriod = 'daily') {
  periodRef.value = initialPeriod
  trendMounted.value = { ...trendMounted.value, [key]: true }
  isOpenRef.value = true
}

function openAnalyticsSubscribersTrendPopup() {
  openTrendPopup('subscribers', isSubscribersTrendPopupOpen, analyticsSubscribersTrendPeriod)
}
function openAnalyticsEarningsTrendPopup() {
  openTrendPopup('earnings', isEarningsTrendPopupOpen, analyticsEarningsTrendPeriod)
}
function openAnalyticsFansTrendPopup() {
  openTrendPopup('fans', isFansTrendPopupOpen, analyticsFansTrendPeriod)
}
function openAnalyticsLikesTrendPopup() {
  openTrendPopup('likes', isLikesTrendPopupOpen, analyticsLikesTrendPeriod)
}
function openAnalyticsContributorsTrendPopup() {
  openTrendPopup('contributors', isContributorsTrendPopupOpen, analyticsContributorsTrendPeriod)
}

const isAnalyticsRefreshing = ref(true)

const HOST_ORIGIN = 'https://fansocial.app'
const DATA_READY_MESSAGE_TYPE = 'fansocial:analytics-data-ready'

function getAnalyticsReferenceDate() {
  if (typeof window === 'undefined') return undefined
  const referenceDate = window.__ANALYTICS_REFERENCE_DATE__
  return typeof referenceDate === 'string' && referenceDate.trim()
    ? referenceDate.trim()
    : undefined
}

function getAnalyticsFetchPayload() {
  const referenceDate = getAnalyticsReferenceDate()
  return {
    source: 'full',
    ...(referenceDate ? { referenceDate } : {}),
  }
}

function notifyHostAnalyticsDataReady() {
  if (typeof window === 'undefined') return
  try {
    if (window.self === window.top) return
  } catch {
    return
  }
  window.parent.postMessage(
    { type: DATA_READY_MESSAGE_TYPE, dataReady: true },
    HOST_ORIGIN,
  )
}

watch(isAnalyticsRefreshing, (refreshing, wasRefreshing) => {
  if (wasRefreshing && !refreshing) {
    markEmbedAnalyticsDataReady()
    notifyHostAnalyticsDataReady()
    // WordPress may attach its listener after the first postMessage.
    ;[400, 1200, 2500].forEach((ms) => {
      window.setTimeout(notifyHostAnalyticsDataReady, ms)
    })
  }
})

async function refreshDashboardAnalytics() {
  if (isAnalyticsRefreshing.value) return
  isAnalyticsRefreshing.value = true
  try {
    await FlowHandler.run(ANALYTICS_FETCH_FLOW, getAnalyticsFetchPayload())
  } finally {
    isAnalyticsRefreshing.value = false
  }
}

onMounted(async () => {
  // Only fetch here if main.js's boot-time fetch hasn't already populated the store —
  // avoids a duplicate network round-trip on first load.
  if (!dashboardAnalyticsStore.lastUpdated) {
    isAnalyticsRefreshing.value = true
    try {
      await FlowHandler.run(ANALYTICS_FETCH_FLOW, { source: 'full' })
    } finally {
      isAnalyticsRefreshing.value = false
    }
  } else {
    isAnalyticsRefreshing.value = false
  }

  // Pre-mount after data ready so first click is also instant shell toggle
  requestAnimationFrame(() => {
    trendMounted.value = {
      subscribers: true,
      earnings: true,
      fans: true,
      likes: true,
      contributors: true,
    }
  })

  FlowRefreshManager.startFromRegistry(ANALYTICS_FETCH_FLOW, { source: 'full' })
})

onUnmounted(() => {
  FlowRefreshManager.stop(ANALYTICS_FETCH_FLOW)
})

</script>
