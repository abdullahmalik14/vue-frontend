<template>
  <div data-component="media-table-view" class="media-table-scroll">
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
        <span class="sr-only">{{ t('mediaUploader.empty.title') }}</span>
      </template>

      <!-- Headers -->
      <template #header.media="{ col }">
        <div class="flex items-center h-full w-full p-2.5">
          <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
            {{ col.label }}
          </span>
        </div>
      </template>

      <template #header.title>
        <div class="h-full w-full p-2.5" />
      </template>

      <template #header.status="{ col }">
        <div class="flex items-center h-full w-full p-2.5">
          <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
            {{ col.label }}
          </span>
        </div>
      </template>

      <template #header.p2v="{ col }">
        <div class="flex items-center h-full w-full p-2.5">
          <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
            {{ col.label }}
          </span>
        </div>
      </template>

      <template #header.tiers="{ col }">
        <div class="flex items-center h-full w-full p-2.5">
          <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
            {{ col.label }}
          </span>
        </div>
      </template>

      <template #header.appearOn="{ col }">
        <div class="flex items-center h-full w-full p-2.5">
          <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
            {{ col.label }}
          </span>
        </div>
      </template>

      <template #header.uploadDate="{ col }">
        <div class="flex items-center h-full w-full p-2.5">
          <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
            {{ col.label }}
          </span>
        </div>
      </template>

      <template #header.actions>
        <div class="media-header-actions h-full w-full p-2.5 pr-5 lg:pr-8" />
      </template>

      <!-- Skeleton cells -->
      <template v-if="loading" #cell.media>
        <div class="w-full h-full rounded-md bg-mediaUi-skeleton animate-skeleton-loading" />
      </template>
      <template v-if="loading" #cell.title>
        <div class="flex flex-col justify-center gap-2 px-3 py-2 h-full w-full">
          <div class="h-3 w-full rounded bg-mediaUi-skeleton animate-skeleton-loading" />
          <div class="flex gap-2">
            <div class="h-4 w-14 rounded bg-mediaUi-skeleton animate-skeleton-loading" />
            <div class="h-4 w-16 rounded bg-mediaUi-skeleton animate-skeleton-loading" />
            <div class="h-4 w-10 rounded bg-mediaUi-skeleton animate-skeleton-loading" />
          </div>
        </div>
      </template>
      <template v-if="loading" #cell.status>
        <div class="h-5 w-20 rounded bg-mediaUi-skeleton animate-skeleton-loading mx-auto" />
      </template>
      <template v-if="loading" #cell.p2v>
        <div class="h-4 w-14 rounded bg-mediaUi-skeleton animate-skeleton-loading mx-3" />
      </template>
      <template v-if="loading" #cell.tiers>
        <div class="flex flex-col justify-center gap-2 px-3 py-2 h-full w-full">
          <div class="h-3 w-full rounded bg-mediaUi-skeleton animate-skeleton-loading" />
          <div class="h-3 w-[85%] rounded bg-mediaUi-skeleton animate-skeleton-loading" />
        </div>
      </template>
      <template v-if="loading" #cell.appearOn>
        <div class="h-3 w-20 rounded bg-mediaUi-skeleton animate-skeleton-loading mx-3" />
      </template>
      <template v-if="loading" #cell.uploadDate>
        <div class="h-3 w-16 rounded bg-mediaUi-skeleton animate-skeleton-loading mx-3" />
      </template>
      <template v-if="loading" #cell.actions>
        <div class="flex items-center justify-end pr-5 lg:pr-8 h-full gap-2 w-full">
          <div class="h-6 w-6 rounded-full bg-mediaUi-skeleton animate-skeleton-loading" />
          <div class="h-6 w-6 rounded-full bg-mediaUi-skeleton animate-skeleton-loading" />
        </div>
      </template>

      <!-- Data cells -->
      <template v-if="!loading" #cell.media="{ row }">
        <div class="w-full h-full p-0">
          <MyMediaCard :item="row" variant="table" />
        </div>
      </template>

      <template v-if="!loading" #cell.title="{ row }">
        <div class="w-full min-w-0 max-w-full overflow-hidden flex flex-col gap-0.5 px-3 py-2">
          <h3 class="min-w-0 text-xs leading-normal font-semibold line-clamp-3 break-all [overflow-wrap:anywhere] text-text-primary dark:text-text">
            {{ row.title }}
          </h3>
          <MediaTagOverflow :tags="row.tags" />
        </div>
      </template>

      <template v-if="!loading" #cell.status="{ row }">
        <div class="px-2.5">
          <MediaStatusBadge :status="row.status" />
        </div>
      </template>

      <template v-if="!loading" #cell.p2v="{ row }">
        <span class="px-3 py-2 text-xs leading-normal font-semibold truncate text-text-primary dark:text-text">
          {{ displayPrice(row.price) }}
        </span>
      </template>

      <template v-if="!loading" #cell.tiers="{ row }">
        <ul class="flex flex-col gap-0.5 overflow-hidden px-3 py-2 w-full">
          <li
            v-for="(tier, tIndex) in row.tiers"
            :key="`${row.id}-tier-${tIndex}`"
            class="pl-5 text-xs leading-normal font-semibold truncate text-text-primary dark:text-text relative before:content-[''] before:absolute before:w-1 before:h-1 before:bg-text-primary before:rounded-full before:left-2 before:top-1/2 before:-translate-y-1/2"
          >
            {{ tier }}
          </li>
        </ul>
      </template>

      <template v-if="!loading" #cell.appearOn="{ row }">
        <ul class="flex flex-col gap-0.5 overflow-hidden px-3 py-2 w-full">
          <li
            v-for="(place, pIndex) in appearOnLabels(row)"
            :key="`${row.id}-place-${pIndex}`"
            class="pl-5 text-xs leading-normal font-semibold truncate text-text-primary dark:text-text relative before:content-[''] before:absolute before:w-1 before:h-1 before:bg-text-primary before:rounded-full before:left-2 before:top-1/2 before:-translate-y-1/2"
          >
            {{ place }}
          </li>
        </ul>
      </template>

      <template v-if="!loading" #cell.uploadDate="{ row }">
        <span class="px-3 py-2 text-[0.77875rem] leading-[1.125rem] text-dark-gray dark:text-text-dark-mutedBluish">
          {{ row.date }}
        </span>
      </template>

      <template v-if="!loading" #cell.actions="{ row }">
        <div class="flex items-center justify-end pr-5 lg:pr-8 h-full w-full">
          <MediaTableRowActions
            :status="row.status"
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
import MediaStatusBadge from './MediaStatusBadge.vue';
import MyMediaCard from './MyMediaCard.vue';
import MediaTableRowActions from './MediaTableRowActions.vue';
import MediaTagOverflow from './MediaTagOverflow.vue';

const emit = defineEmits(['menu-action']);

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n();

const columns = computed(() => [
  {
    key: 'media',
    label: t('mediaUploader.library.table.media'),
    basis: {
      default: 'basis-[11.11125rem] !w-[11.11125rem] !min-w-[11.11125rem] !max-w-[11.11125rem] !shrink-0',
      lg: 'lg:basis-[12.5rem] lg:!w-[12.5rem] lg:!min-w-[12.5rem] lg:!max-w-[12.5rem]',
      xl: 'xl:basis-[14.22rem] xl:!w-[14.22rem] xl:!min-w-[14.22rem] xl:!max-w-[14.22rem]',
    },
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
    label: t('mediaUploader.library.table.status'),
    basis: {
      default: 'basis-[8.25rem] !min-w-[8.25rem]',
      lg: 'lg:basis-0 lg:!min-w-0 lg:grow',
    },
    grow: false,
  },
  {
    key: 'p2v',
    label: t('mediaUploader.library.table.p2v'),
    basis: {
      default: 'basis-[7.1875rem] !min-w-[7.1875rem]',
      lg: 'lg:basis-0 lg:!min-w-0 lg:grow',
    },
    grow: false,
  },
  {
    key: 'tiers',
    label: t('mediaUploader.library.table.tiers'),
    basis: {
      default: 'basis-[10.75rem] !min-w-[10.75rem]',
      lg: 'lg:basis-0 lg:!min-w-0 lg:grow',
    },
    grow: false,
  },
  {
    key: 'appearOn',
    label: t('mediaUploader.library.table.appearOn'),
    basis: {
      default: 'basis-[8.4375rem] !min-w-[8.4375rem]',
      lg: 'lg:basis-0 lg:!min-w-0 lg:grow',
    },
    grow: false,
  },
  {
    key: 'uploadDate',
    label: t('mediaUploader.library.table.uploadDate'),
    basis: {
      default: 'basis-[7.8125rem] !min-w-[7.8125rem]',
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
  row: 'media-ft-row flex items-stretch w-max min-w-full lg:w-full h-[6.25rem] lg:h-[7.03125rem] xl:h-[8rem]',
  cell: 'flex items-center self-stretch h-auto p-0 overflow-hidden',
  footer: 'hidden',
};

const skeletonRows = Array.from({ length: 8 }, (_, index) => ({ id: `sk-${index + 1}` }));

const tableRows = computed(() => {
  if (props.loading) return skeletonRows;
  return Array.isArray(props.items) ? props.items : [];
});

/** 1st data row (index 0) gets stripe — not CSS odd/even (header steals nth-child). */
function rowAttrs(_row, index) {
  return {
    class: index % 2 === 0 ? 'bg-[#F2F4F780] dark:bg-background-dark-app/40' : '',
  };
}

function appearOnLabels(item) {
  return (item.appearOn || []).map((key) => t(`mediaUploader.library.appearOn.${key}`));
}

function displayPrice(price) {
  const value = String(price ?? '').trim();
  return value || t('mediaUploader.library.emptyCell');
}

function onMenuAction(item, action) {
  emit('menu-action', { item, action });
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

/* Sticky first column on the FlexTable cell itself (same as old <td>) */
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
