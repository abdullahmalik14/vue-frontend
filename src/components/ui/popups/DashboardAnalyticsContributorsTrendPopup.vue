<template>
  <DashboardAnalyticsTrendPopup :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
    :period="period" @update:period="handlePeriodChange"
    :title="$t('dashboard.analytics.trends.titleContributors', 'Contributors Insight')" :logo="iconPopupLogo || ''"
    :is-loading="isChartRendering">
    <div class="flex flex-col gap-4">

      <div class="flex flex-col gap-3 md-small:p-4 rounded-sm w-full h-[22rem] relative">
        <div class="flex justify-between items-center z-10 relative">
          <h3 class="text-base font-semibold text-[#101828] dark:text-[#dbd8d3]">{{
            $t('dashboard.analytics.trends.topFans') }}</h3>
          <div class="flex gap-1 bg-[#F9FAFB] rounded-lg border border-[#EAECF0]">
            <button class="p-1.5 rounded-md cursor-pointer transition-all focus:outline-none hover:!bg-transparent"
              :class="activeFansViewMode === 'bar' ? 'bg-white shadow-sm' : 'bg-transparent'" @click="setFansView('bar')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                :stroke="activeFansViewMode === 'bar' ? '#344054' : '#98A2B3'" stroke-width="2" stroke-linecap="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </button>
          </div>
        </div>

        <div class="absolute top-[40px] left-0 right-0 bottom-[10px] transition-opacity duration-200"
          :class="{ 'opacity-0': isChartRendering, 'opacity-100': !isChartRendering }"
          v-show="analyticsStore.bundleLoaded && insightData?.topFans?.length > 0">
          <div data-chart-container data-chart-id="contrib-fans-bar" :hidden="activeFansViewMode !== 'bar' || undefined"
            class="absolute md:left-[1rem] md:mt-2 inset-0" :data-chart-config='getContribBarCfg("contrib-fans")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
          <div data-chart-container data-chart-id="contrib-fans-line" :hidden="activeFansViewMode !== 'line' || undefined"
            class="absolute md:left-[1rem] md:mt-2 inset-0" :data-chart-config='getContribLineCfg("contrib-fans")'>
            <div amchart data-role="chart" style="width:100%;height:100%;"></div>
          </div>
        </div>
        <!-- Empty State (shell spinner covers chart load — no inner Loading Chart) -->
        <div
          class="flex flex-col justify-center items-center gap-6 w-full py-12 text-center absolute inset-0 mt-10 z-20 "
          v-if="!isChartRendering && !insightData?.topFans?.length">
          <img src="/images/empty-bar.svg" alt="list" class="w-24 h-24 object-contain" style="transform: scale(2.5);" />
          <div class="flex flex-col gap-1">
            <span class="text-xs leading-6 text-light-text-secondary dark:text-dark-text-secondary">{{
              $t('dashboard.analytics.trends.noTrend') }}</span>
          </div>
        </div>
      </div>
    </div>
  </DashboardAnalyticsTrendPopup>
</template>

<script setup>
import { useAssetUrl } from '@/composables/useAssetUrl.js'
const { url: iconPopupLogo } = useAssetUrl('dashboard.analytics.earningsIcon')
const { url: icon6Url } = useAssetUrl('dashboard.analytics.icon6')

import DashboardAnalyticsTrendPopup from './DashboardAnalyticsTrendPopup.vue'

// addeing file

import { useMobileMd } from '@/composables/useMobileMd.js'
const { isMobile } = useMobileMd()

import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'
// ENRICHMENT DISABLED
import { useEnrichmentSkeleton } from '@/composables/useEnrichmentSkeleton.js'

const props = defineProps({
  modelValue: Boolean,
  period: String,
  insightData: Object
})

const emit = defineEmits(['update:modelValue', 'update:period'])
const { t } = useI18n()
const analyticsStore = useDashboardAnalyticsStore()
// ENRICHMENT DISABLED
const { isEnrichmentPending } = useEnrichmentSkeleton()

// View toggle state per section
const activeContribViewMode = ref('bar')
const activeSpendersViewMode = ref('bar')
const activeFansViewMode = ref('bar')

// ===== CHART CONFIG HELPERS =====
const legendConfig = { enabled: true, class: "absolute -bottom-2 left-0 w-full flex flex-wrap justify-center gap-4", itemClass: "inline-flex items-center gap-1.5 px-2 py-1", markerClass: "w-2.5 h-2.5 rounded-full", labelClass: "text-slate-500 text-xs font-medium font-sans" }
const contributorsChartStyles = computed(() => ({
  subscription: { color: "#4CC9F0", name: t('dashboard.analytics.legends.subscription', 'Sub') },
  paytoview:    { color: "#7209B7", name: t('dashboard.analytics.legends.paytoview', 'P2V') },
  merch:        { color: "#F72585", name: t('dashboard.analytics.legends.merch', 'Merch') },
  tip:          { color: "#4361EE", name: t('dashboard.analytics.legends.tip', 'Tip') },
  call:         { color: "#3A0CA3", name: t('dashboard.analytics.legends.call', 'Call') },
}))
const contributorsChartLabels = { subscription: "Sub", paytoview: "P2V", merch: "Merch", tip: "Tip", call: "Call" }
const BREAKDOWN_KEYS = ["subscription", "paytoview", "merch", "tip", "call"]

function getContribBarCfg(dk) {
  return JSON.stringify({
    type: "bar", period: "slot", datasetKey: dk,
    fields: { category: "name", total: "subscription" },
    breakdownKeys: BREAKDOWN_KEYS,
    stacked: true,
    seriesStyles: contributorsChartStyles.value,
    seriesLabels: contributorsChartLabels,
    bar: { widthPercent: 50 },
    axisLabelColor: "#475467", axisLabelFontSize: "10px",
    xAxis: { minGridDistance: 60, maxLabelLength: 5 },
    tooltip: { aggregated: { enabled: true, mode: "codepen", valuePrefix: "$", valueSuffix: "" } },
    yAxis: { min: 0, autoMax: true, autoMaxBuffer: 0.12, strict: true },
    legentHint: legendConfig
  })
}

function getContribLineCfg(dk) {
  return JSON.stringify({
    type: "line", period: "slot", datasetKey: dk,
    fields: { category: "name", total: "subscription" },
    breakdownKeys: BREAKDOWN_KEYS,
    stacked: true,
    seriesStyles: contributorsChartStyles.value,
    seriesLabels: contributorsChartLabels,
    axisLabelColor: "#475467", axisLabelFontSize: "10px",
        xAxis: { minGridDistance: 60, maxLabelLength: 5 },
    tooltip: { aggregated: { enabled: true, mode: "codepen", valuePrefix: "$", valueSuffix: "" } },
    yAxis: { min: 0, autoMax: true, autoMaxBuffer: 0.12, strict: true },
    line: { strokeWidth: 4 },
    legentHint: legendConfig
  })
}

// ===== INJECT CHART DATA =====
function injectChartData() {
  if (!window.chartsHandler) return
  const d = props.insightData
  if (!d) return


  // FIX: Responsive limit for Top Contributors only.
  const mapForChart = (arr, limit = 5) => {
    if (!Array.isArray(arr)) return []

    return arr.slice(0, limit).map(c => ({
      name: c.name || '',
      subscription: c.subscription || 0,
      paytoview: c.paytoview || 0,
      merch: c.merch || 0,
      tip: c.tip || 0,
      call: c.call || 0,
    }))
  }

window.chartsHandler._configs.data['contrib-top'] = { slot: mapForChart(d.topContributors, isMobile.value ? 5 : 10) }
window.chartsHandler._configs.data['contrib-spenders'] = { slot: mapForChart(d.topOrderSpenders, isMobile.value ? 5 : 10) }
window.chartsHandler._configs.data['contrib-fans'] = { slot: mapForChart(d.topFans, isMobile.value ? 5 : 10) }

}

// ===== CHART RENDERING =====
async function ensureReady() {
  if (!window.chartsHandler) return
  const hasContributorsData = window.chartsHandler._configs?.data && Object.keys(window.chartsHandler._configs.data).length > 0
  if (!hasContributorsData) await window.chartsHandler.loadChartConfigsAndData()
  injectChartData()
}

async function renderChart(chartId) {
  if (!window.chartsHandler) return
  const container = document.querySelector(`[data-chart-id="${chartId}"]`)
  if (!container) return
  try { window.chartsHandler.destroyChartInstance(chartId) } catch (e) { }
  container.removeAttribute('hidden')
  const host = container.querySelector('[amchart]')
  if (host) host.innerHTML = ''
  await window.chartsHandler.renderChartInstance(container)
}

const isChartRendering = ref(true)

async function renderAllCharts() {
  isChartRendering.value = true
  await ensureReady()
  await renderChart(`contrib-top-${activeContribViewMode.value}`)
  await renderChart(`contrib-spenders-${activeSpendersViewMode.value}`)
  await renderChart(`contrib-fans-${activeFansViewMode.value}`)
  isChartRendering.value = false
}

async function setContribView(v) {
  activeContribViewMode.value = v
  await nextTick()
  await renderChart(`contrib-top-${v}`)
}

async function setSpendersView(v) {
  activeSpendersViewMode.value = v
  await nextTick()
  await renderChart(`contrib-spenders-${v}`)
}

async function setFansView(v) {
  activeFansViewMode.value = v
  await nextTick()
  await renderChart(`contrib-fans-${v}`)
}

async function handlePeriodChange(val) {
  emit('update:period', val)
}

watch(() => props.insightData, async () => {
  if (!props.modelValue) return
  await nextTick()
  injectChartData()
  await renderChart(`contrib-top-${activeContribViewMode.value}`)
  await renderChart(`contrib-spenders-${activeSpendersViewMode.value}`)
  await renderChart(`contrib-fans-${activeFansViewMode.value}`)
  isChartRendering.value = false
})

watch(() => props.modelValue, async (isOpen) => {
  if (!isOpen) return
  isChartRendering.value = true
  await nextTick()
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  await renderAllCharts()
})

watch(isMobile, async () => {
  if (!props.modelValue) return
  await nextTick()
  injectChartData()
  await renderChart(`contrib-fans-${activeFansViewMode.value}`)
})

onMounted(async () => {
  if (!props.modelValue) return
  isChartRendering.value = true
  await nextTick()
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  await renderAllCharts()
})
</script>
