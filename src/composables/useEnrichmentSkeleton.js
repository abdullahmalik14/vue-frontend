import { computed } from 'vue'
import { useDashboardAnalyticsStore } from '@/stores/useDashboardAnalyticsStore.js'

export function useEnrichmentSkeleton() {
  const analyticsStore = useDashboardAnalyticsStore()
  const isEnrichmentPending = computed(() => !analyticsStore.enrichment.loaded)
  return { isEnrichmentPending }
}
