<template>
  <DashboardSectionWrapper>
    <div class="flex flex-col justify-start items-start gap-6 ">
      <!-- Header & Tabs -->

      <!-- Table -->
      <!--
        Toggle iframe test (other dev):
        1) Wrap the Orders Received table + empty state in <div v-if="false">...</div>
        2) Comment out the empty-state v-else block
        3) Uncomment the IFRAME TEST block below
        Reverse those steps to bring this Orders Received table back.
      -->
      <div class="self-stretch w-full">
        <div v-if="activeOrderRows && activeOrderRows.length > 0" class="w-full">
          <FlexTable :columns="dashboardAnalyticsCurrentColumns" :rows="activeOrderRows" :theme="ordersTheme"
            :inner-scroll="true" max-height="60vh" :sticky-header="true">
            <!-- Order Slot -->
            <template #cell.order="{ row }">
              <!-- Desktop View (Visible on md and up) -->
              <div class="hidden md:flex items-center gap-4 h-full w-full pr-4">
                <div v-if="selectedTab === 'Merch' || selectedTab === 'Custom Request'"
                  :class="['w-[4rem] h-full flex-shrink-0 grid place-items-center', row.bg]">
                  <img :src="row.bg === 'bg-black' ? '/images/merch.png' : '/images/cartIcon.png'"
                    class="w-8 h-8 object-contain" />
                </div>
                <div v-else class="relative w-[3.5rem] sm:w-[4rem] h-[6rem] flex-shrink-0 -my-2 -ml-2.5">
                  <img src="/images/profile-thumbnail.png" class="w-full h-full object-cover" />
                </div>
                <div class="flex flex-col justify-center items-start gap-0.5 overflow-hidden">
                  <div v-if="row.tier"
                    class="self-stretch text-gray-900 text-sm font-semibold leading-tight line-clamp-1">{{ row.tier }}
                  </div>
                  <div v-else-if="row.title"
                    class="self-stretch justify-start text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 line-clamp-2">
                    {{ row.title }}</div>
                  <div v-else-if="row.type"
                    class="self-stretch justify-start text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 line-clamp-2">
                    {{ row.type }}</div>
                  <div 
                    :data-value="row.orderId"
                    class="self-stretch text-slate-500 text-xs font-normal leading-4 line-clamp-1">{{ row.orderId
                  }}</div>
                </div>
              </div>

              <!-- Mobile View (Visible below md) -->
              <div class="flex md:hidden items-center gap-3 h-full w-full py-2">
                <div v-if="selectedTab === 'Merch' || selectedTab === 'Custom Request'"
                  :class="['h-full w-16 shrink-0 grid place-items-center', row.bg]">
                  <img :src="row.bg === 'bg-black' ? '/images/merch.png' : '/images/cartIcon.png'"
                    class="w-10 h-10 object-contain" />
                </div>
                <div v-else class="h-16 w-16 shrink-0 rounded overflow-hidden">
                  <img src="/images/profile-thumbnail.png" class="w-full h-full object-cover" />
                </div>
                <div class="flex flex-col justify-center items-start gap-1 overflow-hidden">
                  <div class="flex items-center gap-1.5 text-slate-400 text-[11px] font-normal">
                    <span>{{ row.orderId }}</span>
                    <span>{{ formatDate(row.date) }}</span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <!-- ENRICHMENT DISABLED
                    <div v-if="isEnrichmentPending" class="w-4 h-4 rounded-full bg-[#d3d9df] flex-shrink-0"
                      style="animation: analytics-breathe 1.15s ease-in-out infinite" aria-hidden="true" />
                    <img v-else :src="row.avatarUrl || '/images/mangoes.png'"
                      class="w-4 h-4 rounded-full border border-black/5 flex-shrink-0" />
                    <span v-if="isEnrichmentPending"
                      class="inline-block h-[8px] w-20 bg-[#d3d9df] rounded"
                      style="animation: analytics-breathe 1.15s ease-in-out infinite" aria-hidden="true" />
                    <span v-else class="text-slate-500 text-[11px] font-normal">{{ row.handle }}</span>
                    -->
                    <img :src="row.avatarUrl || '/images/mangoes.png'"
                      class="w-4 h-4 rounded-full border border-black/5 flex-shrink-0" />
                    <span class="text-slate-500 text-[11px] font-normal">{{ row.handle }}</span>
                  </div>
                </div>
              </div>
            </template>

            <!-- From Slot -->
            <template #cell.from="{ row }">
              <div class="flex items-center gap-2 px-4 w-full h-full">
                <div class="w-6 h-6 rounded-full overflow-hidden shrink-0 border border-black/5">
                  <!-- ENRICHMENT DISABLED
                  <div
                    v-if="isEnrichmentPending"
                    class="w-full h-full bg-[#d3d9df] rounded-full"
                    style="animation: analytics-breathe 1.15s ease-in-out infinite"
                    aria-hidden="true"
                  />
                  <img
                    v-else
                    :src="row.avatarUrl || '/images/mangoes.png'"
                    class="w-full h-full object-cover"
                  />
                  -->
                  <img
                    :src="row.avatarUrl || '/images/mangoes.png'"
                    class="w-full h-full object-cover"
                  />
                </div>
                <!-- ENRICHMENT DISABLED
                <span
                  v-if="isEnrichmentPending"
                  class="inline-block h-[8px] w-20 bg-[#d3d9df] rounded"
                  style="animation: analytics-breathe 1.15s ease-in-out infinite"
                  aria-hidden="true"
                />
                <span
                  v-else
                  :data-value="row.handle"
                  class="truncate text-slate-700 text-[13px] font-normal">{{ row.handle }}</span>
                -->
                <span
                  :data-value="row.handle"
                  class="truncate text-slate-700 text-[13px] font-normal">{{ row.handle }}</span>
              </div>
            </template>

            <!-- Status Slot -->
            <template #cell.status="{ row }">
              <div class="flex items-center h-full px-4 w-full">
                <div class="p-1 bg-yellow-400 backdrop-blur-[10px] flex justify-center items-center gap-2">
                  <img src="/images/mangoes.png" class="w-4 h-4 object-cover" />
                </div>
                <div class="h-6 px-1.5 py-[3px] bg-black backdrop-blur-[10px] flex justify-center items-center gap-2">
                  <div 
                    :data-value="row.status"
                    class="justify-start text-yellow-400 text-xs font-medium font-['Poppins'] leading-4">{{
                    row.status }}</div>
                </div>
              </div>
            </template>

            <!-- Date Slot -->
            <template #cell.date="{ row }">
              <div 
                :data-value="row.date"
                class="px-4 text-slate-600 text-[13px] font-normal h-full flex items-center">{{ formatDate(row.date) }}</div>
            </template>

            <!-- Total Slot -->
            <template #cell.total="{ row }">
              <div
                :data-value="row.total"
                class="px-4 text-gray-900 text-[13px] font-bold h-full flex items-center justify-end md:justify-start w-full whitespace-nowrap">
                {{ formatUsdPrice(row.total) }}
              </div>
            </template>

            <!-- Details Slot (Hover) -->
            <template #cell.details>
              <div
                class="px-4 flex items-center justify-end gap-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity cursor-pointer h-full w-full bg-gradient-to-l from-white/80 via-white/40 to-transparent">
                <span class="hidden lg:inline text-blue-600 text-[13px] font-normal whitespace-nowrap">{{ $t('dashboard.analytics.tables.orders.details') }}</span>
                <div class="w-3.5 h-3.5 flex shrink-0 items-center justify-center">
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="shrink-0" aria-hidden="true">
                    <path d="M1 11L11 1M11 1H4M11 1V8" stroke="#2563EB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
              </div>
            </template>

          </FlexTable>
        </div>
        <!-- Empty State -->

      <!-- Replace the 'src' value below with the actual website URL -->
      <div class="w-full">
        <iframe
          :src="ordersReceivedIframeUrl"
          title="Order Received"
          class="w-full min-h-[593px] md:min-h-[602px] lg:min-h-[563px] border border-gray-200"
          loading="eager"
          referrerpolicy="no-referrer"
        ></iframe>
      </div>
      </div>

      <!-- Footer -->
    </div>
  </DashboardSectionWrapper>
</template>

<script setup>
import Heading from '@/components/ui/typography/Heading.vue'
import { onMounted } from 'vue';

onMounted(() => {
  if (window.performanceTracker) {
    window.performanceTracker.step({
      flowName: 'AnalyticsRender',
      stepName: 'DashboardAnalyticsOrdersReceivedTable Mounted',
      status: 'success'
    });
  }
});

import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardSectionWrapper from '@/components/ui/card/dashboard/DashboardSectionWrapper.vue'
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue'
import DashboardTabs from '@/components/ui/nav/dashboard/DashboardTabs.vue'
import FlexTable from '@/components/ui/table/FlexTable.vue'
import { useAssetUrl } from '@/composables/useAssetUrl.js'
// ENRICHMENT DISABLED
// import AnalyticsContributorSkeletonRow from './AnalyticsContributorSkeletonRow.vue'
// import { useEnrichmentSkeleton } from '@/composables/useEnrichmentSkeleton.js'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'
import { formatUsdPrice, formatDate } from '@/utils/common/index.js'
import { buildHostAuthenticatedIframeUrl } from '@/utils/hostIframeAuth.js'

const { t } = useI18n()
defineProps({
  isAnalyticsRefreshing: { type: Boolean, default: false },
})
const analyticsStore = useDashboardAnalyticsStore()
const { url: allOrdersArrowUrl } = useAssetUrl('dashboard.analytics.allOrdersArrow')
// ENRICHMENT DISABLED
// const { isEnrichmentPending } = useEnrichmentSkeleton()

// --- Orders Received iframe ---
// The WordPress template no longer trusts the session cookie (dropped in a
// third-party iframe), so the dashboard JWT is passed as ?fs_jwt. The URL is
// returned unchanged when no host token is resolvable.
const ORDERS_RECEIVED_IFRAME_URL =
  'https://fansocial.app/wp-content/plugins/fansocial/templates/template-parts/dashboard/template-part-dashboard-overview-order-received-iframe.php'
const ordersReceivedIframeUrl = buildHostAuthenticatedIframeUrl(ORDERS_RECEIVED_IFRAME_URL)

// --- Orders Tabs ---
// const orderTabs = ['Subscriptions', 'Pay to View', 'Merch', 'Custom Request', 'Wishtender']
const selectedTab = ref('Subscriptions')
const isDropdownOpen = ref(false)

// --- Orders Table Data ---
const dashboardAnalyticsOrdersColumns = computed(() => [
  { key: 'order', label: t('dashboard.analytics.tables.orders.orderLabel'), basis: { default: 'grow md:grow-0 md:basis-[300px]' }, align: 'left' },
  { key: 'from', label: t('dashboard.analytics.tables.orders.from'), basis: 'basis-[220px]', align: 'left', hiddenAt: ['xs', 'sm'] },
  { key: 'date', label: t('dashboard.analytics.tables.orders.date'), basis: 'basis-[180px]', align: 'left', hiddenAt: ['xs', 'sm'] },
  // Mobile: Total stays right (ml-auto). Desktop: sits after Date; Details takes ml-auto for far-right hover.
  { key: 'total', label: t('dashboard.analytics.tables.orders.total'), basis: { default: 'ml-auto basis-[110px] md:ml-0' }, align: 'left' },
  { key: 'details', label: '', basis: { default: 'shrink-0 basis-[80px] md:ml-auto' }, align: 'right', hiddenAt: ['xs', 'sm'] }
])

const dashboardAnalyticsMerchOrdersColumns = computed(() => [
  { key: 'order', label: t('dashboard.analytics.tables.orders.orderLabel'), basis: { default: 'grow md:grow-0 md:basis-[280px]' }, align: 'left' },
  { key: 'from', label: t('dashboard.analytics.tables.orders.from'), basis: 'basis-[180px]', align: 'left', hiddenAt: ['xs', 'sm'] },
  { key: 'status', label: t('dashboard.analytics.tables.orders.status'), basis: 'basis-[160px]', align: 'left', hiddenAt: ['xs', 'sm'] },
  { key: 'date', label: t('dashboard.analytics.tables.orders.date'), basis: 'basis-[150px]', align: 'left', hiddenAt: ['xs', 'sm'] },
  { key: 'total', label: t('dashboard.analytics.tables.orders.total'), basis: { default: 'ml-auto basis-[110px] md:ml-0' }, align: 'left' },
  { key: 'details', label: '', basis: { default: 'shrink-0 basis-[80px] md:ml-auto' }, align: 'right', hiddenAt: ['xs', 'sm'] }
])

const dashboardAnalyticsCustomRequestOrdersColumns = dashboardAnalyticsMerchOrdersColumns



const activeOrderRows = computed(() => {
  const recentOrdersData = analyticsStore.recentOrders || {}
  // ENRICHMENT DISABLED
  // const enrichedUsers = analyticsStore.enrichment.users

  if (!analyticsStore.bundleLoaded) return []

  const rawRows = (() => {
    switch (selectedTab.value) {
      case 'Merch': return recentOrdersData.merch || []
      case 'Pay to View': return recentOrdersData.p2v || []
      case 'Custom Request': return recentOrdersData.customRequest || []
      case 'Wishtender': return recentOrdersData.wishtender || []
      default: return recentOrdersData.subscriptions || []
    }
  })()

  return rawRows.map(row => {
    // ENRICHMENT DISABLED
    // const userKey = String(row.name || row.fanId || '')
    // const enriched = enrichedUsers[userKey]
    return {
      ...row,
      handle: row.handle || row.name || '',
      avatarUrl: null,
    }
  })
})

const totalOrdersCount = computed(() => {
  const recentOrdersData = analyticsStore.recentOrders || {}
  return (recentOrdersData.subscriptions?.length || 0) +
         (recentOrdersData.p2v?.length || 0) +
         (recentOrdersData.merch?.length || 0) +
         (recentOrdersData.customRequest?.length || 0) +
         (recentOrdersData.wishtender?.length || 0)
})

const dashboardAnalyticsCurrentColumns = computed(() => {
  if (selectedTab.value === 'Merch' || selectedTab.value === 'Custom Request') {
    return dashboardAnalyticsMerchOrdersColumns.value
  }
  return dashboardAnalyticsOrdersColumns.value
})

const ordersTheme = {
  container: 'relative bg-transparent border-none w-full overflow-x-auto ',
  header: 'text-[#667085] bg-transparent',
  headerRow: 'flex items-center h-12',
  headerCell: 'px-4 text-[13px] font-normal tracking-tight',
  row: 'relative group/row flex items-center h-20 odd:bg-transparent even:bg-[#F2F4F780] transition-all',
  cell: 'flex items-center h-full',
  footer: 'hidden'
}
</script>

<style scoped>
@keyframes analytics-breathe {
  0%,  100% { opacity: 0.48; transform: scale(0.985); }
  50%        { opacity: 1;    transform: scale(1); }
}
</style>
