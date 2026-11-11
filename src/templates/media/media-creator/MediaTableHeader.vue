<template>
  <thead data-component="media-table-header">
    <tr>
      <th class="media-header-cell media-sticky-col">
        <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
          {{ t('mediaUploader.library.table.media') }}
        </span>
      </th>
      <th class="media-header-cell" />
      <th class="media-header-cell">
        <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
          {{ t('mediaUploader.library.table.status') }}
        </span>
      </th>
      <th class="media-header-cell">
        <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
          {{ t('mediaUploader.library.table.p2v') }}
        </span>
      </th>
      <th class="media-header-cell">
        <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
          {{ t('mediaUploader.library.table.tiers') }}
        </span>
      </th>
      <th class="media-header-cell">
        <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
          {{ t('mediaUploader.library.table.appearOn') }}
        </span>
      </th>
      <th class="media-header-cell">
        <span class="text-sm text-text-quaternary whitespace-nowrap dark:text-text-dark-mutedBluish">
          {{ t('mediaUploader.library.table.uploadDate') }}
        </span>
      </th>
      <th class="media-header-cell media-header-actions" />
    </tr>
  </thead>
</template>

<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>
