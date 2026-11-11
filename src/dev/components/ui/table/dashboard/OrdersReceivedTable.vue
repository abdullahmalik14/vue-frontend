<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FlexTable from '@/components/ui/table/FlexTable.vue'
import OrderDetailsPopup from '@/dev/components/ui/popups/orders/OrderDetailsPopup.vue'
import { useOrdersStore } from '@/stores/useOrdersStore.js'
import FlowHandler from '@/services/flow-system/FlowHandler.js'
import { useOrdersAssets, resolveOrderTypeAssetFlag } from '@/dev/composables/useOrdersAssets.js'
import { getAssetUrlSync } from '@/systems/assets/assetLibrary.js'

const { t } = useI18n()
const { assets } = useOrdersAssets()
const ordersStore = useOrdersStore()

const state = reactive({
  selectedOrder: null,
  isPopupOpen: false,
  isPopupLoading: false,
})

const props = defineProps({
  activeTab: {
    type: String,
    default: 'All',
  },
  activeOrderType: {
    type: String,
    default: 'all',
  },
  searchQuery: {
    type: String,
    default: '',
  },
  ownerId: {
    type: String,
    default: 'creator_1',
  },
  disableRowPopup: {
    type: Boolean,
    default: false,
  },
})

const isTransitioning = ref(true)

const fetchOrders = async () => {
  isTransitioning.value = true
  try {
    await FlowHandler.run('orders.fetchOrders', {
      status: props.activeTab,
      type: props.activeOrderType,
      search: props.searchQuery,
      ownerId: props.ownerId,
      page: ordersStore.meta.pagination.currentPage,
      perPage: ordersStore.meta.pagination.perPage,
    })
  } finally {
    isTransitioning.value = false
  }
}

fetchOrders()

watch(
  () => [props.activeTab, props.activeOrderType, props.searchQuery],
  () => {
    ordersStore.meta.pagination.currentPage = 1
    fetchOrders()
  },
)

const statusConfig = computed(() => ({
  defaultIcon: assets.value.stars,
  styles: {
    'In Progress': {
      label: t('dashboard.orders.status.new'),
      iconSrc: assets.value.stars,
      iconBg: 'bg-[#FFE500] p-1 dark:bg-[#3E2E00]',
      textClass: 'text-[#FFE500] px-[6px] py-[4px] bg-[#000000]',
    },
    Completed: {
      iconSrc: assets.value.location,
      iconBg: 'bg-[#07F468] p-1 dark:bg-[#06c454]',
      textClass: 'text-[#07F468] px-[6px] py-[4px] bg-[#000000] font-semibold',
      isCompleted: true,
    },
    Cancelled: {
      iconBg: 'bg-red-500 p-1 dark:bg-red-700',
      textClass: 'text-red-500 bg-black px-[6px] py-[4px] font-semibold',
      isCancelled: true,
    },
  },
}))

const columns = computed(() => [
  {
    key: 'type',
    label: t('dashboard.orders.columns.orderNum'),
    basis: {
      default: 'basis-1/2',
      md: 'md:basis-1/4',
      lg: 'lg:basis-1/4',
    },
    type: 'rich-icon',
    config: {
      iconKey: 'icon',
      bgKey: 'iconBg',
      subtextKey: 'orderNum',
      mobileRightKey: 'date',
      mobileBottomUserKey: 'fromAvatar',
      mobileBottomUserTextKey: 'from',
    },
  },
  {
    key: 'from',
    label: t('dashboard.orders.columns.from'),
    basis: 'basis-1/6',
    type: 'user',
    config: { avatarKey: 'fromAvatar' },
    hiddenAt: ['xs', 'sm'],
  },
  {
    key: 'status',
    label: t('dashboard.orders.columns.status'),
    basis: 'basis-1/6',
    type: 'status',
    config: statusConfig.value,
    hiddenAt: ['xs', 'sm'],
  },
  {
    key: 'date',
    label: t('dashboard.orders.columns.date'),
    basis: 'basis-1/6',
    hiddenAt: ['xs', 'sm'],
  },
  {
    key: 'total',
    label: t('dashboard.orders.columns.total'),
    basis: {
      default: 'basis-1/2',
      md: 'md:basis-1/4',
      lg: 'lg:basis-1/4',
    },
    align: {
      default: 'right',
      md: 'left',
    },
  },
])

const filteredRows = computed(() => {
  const rows = Array.isArray(ordersStore.orders) ? ordersStore.orders : []
  return rows.map((row) => {
    const iconAssetFlag = row.iconAssetFlag || resolveOrderTypeAssetFlag(row.type)
    const fromLabel =
      row.fromLabelKey === 'dashboard.orders.guestUser' || row.from === '__GUEST__'
        ? t('dashboard.orders.guestUser')
        : row.from
    return {
      ...row,
      from: fromLabel,
      icon: row.icon || getAssetUrlSync(iconAssetFlag) || assets.value.cart,
      fromAvatar: row.fromAvatar || assets.value.avatar,
    }
  })
})

const emptyTabLabel = computed(() => {
  const tabLabelKeys = {
    progress: 'dashboard.orders.tabs.inProgress',
    Completed: 'dashboard.orders.tabs.completed',
    Canceled: 'dashboard.orders.tabs.canceled',
    All: 'dashboard.orders.tabs.all',
  }
  const labelKey = tabLabelKeys[props.activeTab]
  return labelKey ? t(labelKey) : props.activeTab
})

const theme = {
  container: 'relative overflow-hidden',
  header: 'border-b border-zinc-200 dark:border-background-dark-app sticky top-0 z-30 backdrop-blur-md',
  headerRow: 'flex items-center ',
  headerCell: 'px-3 py-3 text-xs font-[400] text-[#667085] tracking-wider dark:text-[#7A8195]',
  row: 'flex items-center border-b border-zinc-100 dark:border-background-dark-app odd:bg-[#ebe3eb] dark:odd:bg-[#322C32] even:bg-[#efebf2] dark:even:bg-[#2B282D] transition-colors cursor-pointer last:border-0',
  cell: 'text-xs text-zinc-800 p-0 dark:text-text',
  footer: 'p-3 text-center text-xs text-zinc-400',
}

function handleRowClick(row) {
  if (props.disableRowPopup) return
  state.selectedOrder = row
  state.isPopupOpen = true
  state.isPopupLoading = true
  setTimeout(() => {
    state.isPopupLoading = false
  }, 1500)
}
</script>

<template>
  <div class="px-3 md:px-0">
    <FlexTable
      :columns="columns"
      :rows="filteredRows"
      :skeleton="isTransitioning"
      row-key="id"
      :theme="theme"
      :inner-scroll="true"
      desktop-breakpoint="md"
      max-height="30rem"
      :sticky-header="true"
      @row-click="handleRowClick"
    >
      <template #empty>
        {{ t('dashboard.orders.empty.prefix') }}
        <span v-if="activeTab !== 'All'">{{ emptyTabLabel }}</span>
        {{ t('dashboard.orders.empty.suffix') }}
        <span v-if="searchQuery">
          {{ t('dashboard.orders.empty.matching') }} "{{ searchQuery }}"
        </span>
      </template>
    </FlexTable>

    <OrderDetailsPopup
      v-if="!disableRowPopup"
      v-model="state.isPopupOpen"
      :order="state.selectedOrder"
      :loading="state.isPopupLoading"
    />
  </div>
</template>
