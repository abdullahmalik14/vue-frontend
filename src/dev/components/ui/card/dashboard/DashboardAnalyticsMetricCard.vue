<template>
  <div :data-analytics-card="dataAnalyticsCard" class="group/container relative flex flex-col flex-grow flex-shrink [flex-basis:auto] gap-4 p-4 rounded-none min-w-0 min-h-0 [backdrop-filter:blur(25px)] bg-light-bg-container dark:bg-dark-bg-container transition-all duration-300 hover:shadow-[0px_0px_20px_0px_rgba(0,0,0,0.10)] hover:backdrop-blur-xl overflow-hidden">
    <div class="flex flex-col flex-grow flex-shrink [flex-basis: auto] gap-4 min-w-0 min-h-0">
      <!-- desktop hover overlay; mobile uses the header button so scrolling is not blocked -->
      <div v-if="hasTrend && !loading"
        class="absolute hidden [@media(hover:hover)_and_(pointer:fine)]:md:group-hover/container:flex items-start justify-end w-full h-full top-0 left-0 z-[10000] pointer-events-none">
        <DashboardPrimaryButton
          theme="analyticsTrend"
          @click="$emit('openTrend')"
          :text="$t('dashboard.analytics.page.trend')"
          :rightIcon="trendIconUrl || ''"
          :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]"
        />
      </div>

      <!-- title -->
      <div class="flex items-center justify-between gap-2 min-w-0">
        <h3 class="m-0 font-medium font-sans text-base leading-6 text-light-text-secondary dark:text-dark-text-secondary min-w-0">
          {{ title }}
        </h3>
        <div v-if="hasTrend && !loading" class="[@media(hover:hover)_and_(pointer:fine)]:hidden shrink-0 absolute top-0 right-0">
          <DashboardPrimaryButton
            theme="analyticsTrend"
            @click="$emit('openTrend')"
            customClass="active:bg-light-primary dark:hover:bg-dark-primaryHover dark:active:bg-dark-primaryHover"
            textClass="text-xs font-sans font-medium leading-[1.125rem] text-light-primary dark:text-dark-primary group-hover/button:text-white group-active/button:text-white transition-colors"
            :text="$t('dashboard.analytics.page.trend')"
            :rightIcon="trendIconUrl || ''"
            rightIconClass="w-[.875rem] h-[.875rem] transition-all group-hover/button:brightness-0 group-hover/button:invert group-active/button:brightness-0 group-active/button:invert"
            :wrapperOverrides="[{target:'wrapper1', removeClass:true}, {target:'wrapper2', removeClass:true}]"
          />
        </div>
      </div>

      <!-- data-content: keep the real layout while data loads (no iframe skeleton) -->
      <slot />

    </div>
  </div>
</template>

<script setup>
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue'
import { useAssetUrl } from '@/composables/useAssetUrl.js'

const { url: trendIconUrl } = useAssetUrl('dashboard.analytics.trendExpand')

defineProps({
  title: {
    type: String,
    required: true
  },
  hasTrend: {
    type: Boolean,
    default: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  dataAnalyticsCard: {
    type: String,
    default: ''
  }
})

defineEmits(['openTrend'])
</script>
