<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DashboardSharedTwoColLayout from '@/templates/dashboard/shared/DashboardSharedTwoColLayout.vue'
import DashboardTabs from '@/components/ui/nav/dashboard/DashboardTabs.vue'
import CustomDropdown from '@/components/ui/dropdowns/CustomDropdown.vue'
import OrdersTableSearchInput from '@/components/ui/table/dashboard/OrdersTableSearchInput.vue'
import OrdersReceivedTable from '@/dev/components/ui/table/dashboard/OrdersReceivedTable.vue'
import Heading from '@/components/ui/typography/Heading.vue'
import { useOrdersAssets } from '@/dev/composables/useOrdersAssets.js'

const { t } = useI18n()
const { assets } = useOrdersAssets()

const currentTab = ref('progress')
const searchQuery = ref('')
const selectedOrderType = ref('all')

const tabList = computed(() => [
  { id: 'progress', labelKey: 'dashboard.orders.tabs.inProgress' },
  { id: 'Completed', labelKey: 'dashboard.orders.tabs.completed' },
  { id: 'Canceled', labelKey: 'dashboard.orders.tabs.canceled' },
  { id: 'All', labelKey: 'dashboard.orders.tabs.all' },
])

const orderTypeOptions = computed(() =>
  ['all', 'p2v', 'subscription', 'merch', 'mix'].map((value) => ({
    value,
    label: t(`dashboard.orders.orderTypes.${value}`),
  })),
)
</script>

<template>
  <DashboardSharedTwoColLayout>
    <div class="flex flex-col gap-[16px] backdrop-blur-[1px]">
      <div class="p-2 flex flex-col gap-[24px]">
        <Heading tag="h1" theme="custom" no-wrap add-class="text-[28px] font-semibold text-[#101828] dark:text-[#e8e6e3]" :text="t('dashboard.orders.title')" />

        <div class="flex flex-col gap-2 lg:flex-row">
          <DashboardTabs v-model="currentTab" :tabs="tabList" />

          <div class="flex justify-between items-center w-full">
            <OrdersTableSearchInput
              v-model="searchQuery"
              input-id="orders-received-search"
            />

            <div class="flex items-center gap-2 w-max h-full">
              <CustomDropdown
                v-model="selectedOrderType"
                :options="orderTypeOptions"
                button-class="w-max bg-transparent p-0 border-none shadow-none h-full flex items-center justify-between [&>img:last-child]:hidden"
                dropdown-class="absolute right-0 w-max top-[calc(100%+0.5rem)] rounded-[2px] bg-white/70 backdrop-blur-[25px] max-h-[245px] overflow-y-auto shadow-none border-none dark:bg-[#181a1bb3] no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                option-class="p-0 border-b border-[#EAECF0] dark:border-[#353a3c] last:border-none"
              >
                <template #trigger="{ isOpen }">
                  <div class="flex items-center gap-2 cursor-pointer h-full">
                    <span class="text-[#344054] text-[14px] font-normal dark:text-[#ACBACF]">
                      {{ t('dashboard.orders.orderTypeLabel') }}
                    </span>
                    <img
                      v-if="assets.dropdown"
                      :src="assets.dropdown"
                      :alt="t('dashboard.orders.dropdownAlt')"
                      :class="{ 'rotate-180': isOpen }"
                      class="w-3 h-2 transition-transform duration-300"
                    />
                  </div>
                </template>

                <template #option="{ option, isSelected }">
                  <div
                    class="flex items-center gap-2 h-12 px-3 transition-all duration-200 cursor-pointer hover:bg-white dark:hover:bg-[#181a1b]"
                    :class="{ 'bg-white dark:bg-[#181a1b] font-semibold': isSelected }"
                  >
                    <span class="text-sm font-medium text-[#0C111D] dark:text-[#dbd8d3]">
                      {{ option.label }}
                    </span>
                  </div>
                </template>
              </CustomDropdown>
            </div>
          </div>
        </div>
      </div>

      <OrdersReceivedTable
        :active-tab="currentTab"
        :active-order-type="selectedOrderType"
        :search-query="searchQuery"
      />
    </div>
  </DashboardSharedTwoColLayout>
</template>
