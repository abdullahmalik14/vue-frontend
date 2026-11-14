<template>
  <div data-component="merch-table-view" class="media-table-scroll">
    <FlexTable
      :columns="columns"
      :rows="tableRows"
      row-key="id"
      :theme="tableTheme"
      :row-attrs="rowAttrs"
      desktop-breakpoint="md"
      :show-mobile="false"
      :inner-scroll="false"
      :sticky-header="false"
    >
      <template #empty>
        <span class="sr-only">{{ t('shops.merch.title') }}</span>
      </template>

      <template #header.media="{ col }">
        <div class="flex items-center h-full w-full p-2.5 border-b border-gray-500">
          <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
            {{ col.label }}
          </span>
        </div>
      </template>
      <template #header.title>
        <div class="h-full w-full p-2.5 border-b border-gray-500" />
      </template>
      <template #header.status="{ col }">
        <div class="flex items-center h-full w-full p-2.5 border-b border-gray-500">
          <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
            {{ col.label }}
          </span>
        </div>
      </template>
      <template #header.collection="{ col }">
        <div class="flex items-center h-full w-full p-2.5 border-b border-gray-500">
          <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
            {{ col.label }}
          </span>
        </div>
      </template>
      <template #header.inventory="{ col }">
        <div class="flex items-center h-full w-full p-2.5 border-b border-gray-500">
          <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
            {{ col.label }}
          </span>
        </div>
      </template>
      <template #header.itemsSold="{ col }">
        <div class="flex items-center h-full w-full p-2.5 border-b border-gray-500">
          <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
            {{ col.label }}
          </span>
        </div>
      </template>
      <template #header.totalSales="{ col }">
        <div class="flex items-center h-full w-full p-2.5 border-b border-gray-500">
          <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
            {{ col.label }}
          </span>
        </div>
      </template>
      <template #header.actions>
        <div class="media-header-actions h-full w-full p-2.5 pr-5 lg:pr-8 border-b border-gray-500" />
      </template>

      <template #cell.media="{ row }">
        <div class="h-full w-36 shrink-0 self-stretch overflow-hidden bg-black">
          <img
            v-if="row.thumbnail"
            :src="row.thumbnail"
            alt=""
            class="h-full w-full object-cover"
          />
        </div>
      </template>

      <template #cell.title="{ row }">
        <div class="w-full min-w-0 max-w-full overflow-hidden flex flex-col gap-0.5 px-3 py-2">
          <h3 class="min-w-0 text-xs leading-normal font-semibold line-clamp-3 break-all [overflow-wrap:anywhere] text-text-primary dark:text-text">
            {{ row.title }}
          </h3>
          <MediaTagOverflow :tags="row.tags" theme="merchMedia" />
        </div>
      </template>

      <template #cell.status="{ row }">
        <div class="px-2.5">
          <MediaStatusBadge
            :status="row.status"
            status-i18n-prefix="shops.merch.library.status"
          />
        </div>
      </template>

      <template #cell.collection="{ row }">
        <div class="px-3 py-2 w-full min-w-0">
          <MediaTagOverflow :tags="row.collections" theme="merch" />
        </div>
      </template>

      <template #cell.inventory="{ row }">
        <span
          class="px-3 py-2 text-xs leading-normal font-semibold truncate"
          :class="Number(row.stock) <= 0 ? 'text-[#FF4405]' : 'text-text-primary dark:text-text'"
        >
          {{ inventoryLabel(row) }}
        </span>
      </template>

      <template #cell.itemsSold="{ row }">
        <span class="px-3 py-2 text-xs leading-normal font-semibold truncate text-text-primary dark:text-text">
          {{ row.itemsSold ?? 0 }}
        </span>
      </template>

      <template #cell.totalSales="{ row }">
        <span class="px-3 py-2 text-xs leading-normal font-semibold truncate text-text-primary dark:text-text">
          {{ totalSalesLabel(row) }}
        </span>
      </template>

      <template #cell.actions="{ row }">
        <div class="flex items-center justify-end pr-5 lg:pr-8 h-full w-full">
          <MediaTableRowActions
            theme="merch"
            :status="row.status === 'preorder' ? 'published' : row.status"
            @menu-action="(action) => onMenuAction(row, action)"
          />
        </div>
      </template>
    </FlexTable>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import FlexTable from '@/components/ui/table/FlexTable.vue';
import MediaStatusBadge from '@/templates/media/media-creator/MediaStatusBadge.vue';
import MediaTableRowActions from '@/templates/media/media-creator/MediaTableRowActions.vue';
import MediaTagOverflow from '@/templates/media/media-creator/MediaTagOverflow.vue';

const emit = defineEmits(['menu-action']);

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
});

const { t } = useI18n();

const columns = computed(() => [
  {
    key: 'media',
    label: t('shops.merch.library.table.media'),
    basis: 'basis-36 !w-36 !min-w-36 !max-w-36 !shrink-0',
    grow: false,
  },
  {
    key: 'title',
    label: '',
    basis: {
      default: 'basis-[12rem] !w-[12rem] !min-w-[12rem] !max-w-[12rem]',
      lg: 'lg:basis-[16rem] lg:!w-auto lg:!min-w-0 lg:!max-w-[16rem] lg:grow',
      xl: 'xl:basis-[18rem] xl:!max-w-[18rem]',
    },
    grow: false,
  },
  {
    key: 'status',
    label: t('shops.merch.library.table.status'),
    basis: {
      default: 'basis-[8.25rem] !min-w-[8.25rem]',
      lg: 'lg:basis-0 lg:!min-w-0 lg:grow',
    },
    grow: false,
  },
  {
    key: 'collection',
    label: t('shops.merch.library.table.collection'),
    basis: {
      default: 'basis-[13rem] !min-w-[13rem]',
      lg: 'lg:basis-0 lg:!min-w-[11rem] lg:grow',
    },
    grow: false,
  },
  {
    key: 'inventory',
    label: t('shops.merch.library.table.inventory'),
    basis: {
      default: 'basis-[8.5rem] !min-w-[8.5rem]',
      lg: 'lg:basis-0 lg:!min-w-0 lg:grow',
    },
    grow: false,
  },
  {
    key: 'itemsSold',
    label: t('shops.merch.library.table.itemsSold'),
    basis: {
      default: 'basis-[8.5rem] !min-w-[8.5rem]',
      lg: 'lg:basis-0 lg:!min-w-0 lg:grow',
    },
    grow: false,
  },
  {
    key: 'totalSales',
    label: t('shops.merch.library.table.totalSales'),
    basis: {
      default: 'basis-[8.5rem] !min-w-[8.5rem]',
      lg: 'lg:basis-0 lg:!min-w-0 lg:grow',
    },
    grow: false,
  },
  {
    key: 'actions',
    label: '',
    basis: 'basis-[7.5rem] !min-w-[7.5rem] !shrink-0',
    grow: false,
    align: 'right',
  },
]);

const tableTheme = {
  container: 'relative w-max min-w-full lg:w-full bg-transparent border-0 shadow-none rounded-none',
  header: 'bg-transparent',
  headerRow: 'media-ft-header flex items-stretch w-max min-w-full lg:w-full',
  headerCell: 'flex items-center h-[2.625rem] p-0 font-normal text-left bg-transparent',
  row: 'media-ft-row flex items-stretch w-max min-w-full lg:w-full h-20',
  cell: 'flex items-center self-stretch h-20 p-0 overflow-hidden',
  footer: 'hidden',
};

const tableRows = computed(() => (Array.isArray(props.items) ? props.items : []));

function rowAttrs(_row, index) {
  return {
    class: index % 2 === 0 ? 'bg-[#F2F4F780] dark:bg-background-dark-app/40' : '',
  };
}

function inventoryLabel(row) {
  const stock = Number(row.stock);
  const count = Number.isFinite(stock) ? stock : 0;
  return t('shops.merch.library.inStock', { count });
}

function totalSalesLabel(row) {
  const amount = row.totalSales ?? 0;
  return t('shops.merch.library.totalSalesValue', { amount });
}

function onMenuAction(row, action) {
  emit('menu-action', { item: row, action });
}
</script>

<style scoped>
.media-table-scroll {
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: clip;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.media-table-scroll::-webkit-scrollbar {
  display: none;
}

.media-table-scroll :deep(.media-ft-header > div:first-child),
.media-table-scroll :deep(.media-ft-row > div:first-child) {
  position: sticky;
  left: 0;
  z-index: 3;
  background: transparent;
  box-shadow: none;
}

.media-table-scroll :deep(.media-ft-header > div:first-child) {
  z-index: 6;
}

@media (min-width: 1024px) {
  .media-table-scroll {
    overflow-x: hidden;
  }
}
</style>
