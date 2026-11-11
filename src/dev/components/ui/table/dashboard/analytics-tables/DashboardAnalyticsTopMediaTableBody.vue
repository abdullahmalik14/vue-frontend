<template>
  <FlexTable
    :columns="columns"
    :rows="rows"
    :theme="theme"
    :inner-scroll="innerScroll"
    :max-height="maxHeight"
    :sticky-header="true"
  >
    <template #cell.media="{ row }">
      <div class="flex items-center gap-2 sm:gap-3 h-full min-w-0">
        <div class="relative w-[3.5rem] sm:w-[5rem] h-[6rem] flex-shrink-0 -my-2 -ml-2.5">
          <img :src="row.image" alt="media" class="w-full h-full object-cover">
          <div class="w-5 h-5 left-0 top-0 absolute bg-black flex justify-center items-center">
            <span class="text-white text-sm font-bold font-['Poppins'] leading-none">{{ row.rank }}</span>
          </div>
        </div>
        <div
          :data-value="row.title"
          class="min-w-0 flex-1 text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 line-clamp-2 md:line-clamp-3">
          {{ row.title }}
        </div>
      </div>
    </template>
    <template #cell.clicks="{ row }">
      <div
        :data-value="row.clicks"
        class="text-center w-full text-gray-900 text-xs font-semibold font-['Poppins'] leading-4">
        {{ row.clicks }}
      </div>
    </template>
    <template #cell.duration="{ row }">
      <div
        :data-value="row.duration"
        class="text-right w-full text-gray-900 text-xs font-semibold font-['Poppins'] leading-4">
        {{ row.duration }}
      </div>
    </template>
    <template #cell.sales_count="{ row }">
      <div
        :data-value="row.sales_count"
        class="text-center w-full text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 truncate sm:px-1">
        {{ row.sales_count }}
      </div>
    </template>
    <template #cell.sales_usd="{ row }">
      <div
        :data-value="row.sales_usd"
        class="text-right w-full text-gray-900 text-xs font-semibold font-['Poppins'] leading-4 truncate sm:px-1">
        {{ row.sales_usd }}
      </div>
    </template>
    <template v-if="loading" #cell.media="{ row }">
      <div class="flex items-center gap-3 h-full">
        <div class="relative w-[3.5rem] sm:w-[5rem] h-[6rem] flex-shrink-0 -my-2 -ml-2.5">
          <div class="w-full h-full rounded-md bg-gray-200 animate-pulse"></div>
          <div class="w-5 h-5 left-0 top-0 absolute bg-gray-300 animate-pulse flex justify-center items-center">
            <span class="text-white text-sm font-bold font-['Poppins'] leading-none"></span>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="h-3 w-32 rounded-md bg-gray-200 animate-pulse"></div>
          <div class="h-3 w-20 rounded-md bg-gray-200 animate-pulse"></div>
        </div>
      </div>
    </template>
    <template v-if="loading" #cell.clicks="{ row }">
      <div class="text-center w-full">
        <div class="h-3 w-10 rounded-md bg-gray-200 animate-pulse mx-auto"></div>
      </div>
    </template>
    <template v-if="loading" #cell.duration="{ row }">
      <div class="text-right w-full">
        <div class="h-3 w-14 rounded-md bg-gray-200 animate-pulse ml-auto"></div>
      </div>
    </template>
    <template v-if="loading" #cell.sales_count="{ row }">
      <div class="text-center w-full">
        <div class="h-3 w-10 rounded-md bg-gray-200 animate-pulse mx-auto"></div>
      </div>
    </template>
    <template v-if="loading" #cell.sales_usd="{ row }">
      <div class="text-right w-full">
        <div class="h-3 w-16 rounded-md bg-gray-200 animate-pulse ml-auto"></div>
      </div>
    </template>
    <template #empty>
      <DashboardTrendContent
        class="!min-h-[272px] h-[272px]"
        :image="emptyImage"
        alt="list"
        :message="$t('dashboard.analytics.trends.noTrend')"
      />
    </template>
  </FlexTable>
</template>

<script setup>
import FlexTable from '@/components/ui/table/FlexTable.vue'
import DashboardTrendContent from '@/components/ui/card/dashboard/DashboardTrendContent.vue'

defineProps({
  columns: { type: Array, required: true },
  rows: { type: Array, required: true },
  theme: { type: Object, required: true },
  loading: { type: Boolean, default: false },
  innerScroll: { type: Boolean, default: false },
  maxHeight: { type: String, default: '' },
  emptyImage: { type: String, default: '' },
})
</script>
