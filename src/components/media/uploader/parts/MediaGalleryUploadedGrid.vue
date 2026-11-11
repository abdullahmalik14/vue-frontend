<template>
  <div data-component="media-gallery-uploaded-grid" class="w-full rounded-[12px] p-3">
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      <div
        v-for="item in files"
        :key="item.id"
        class="relative w-full aspect-[204/115] overflow-hidden rounded-[2px] bg-primary-bg dark:bg-cosmo-shell"
      >
        <img
          :src="item.objectUrl"
          :alt="item.name"
          class="block w-full h-full object-cover"
        />
        <button
          type="button"
          class="absolute top-0 right-0 z-10 flex h-8 w-8 items-center justify-center bg-error cursor-pointer transition-opacity hover:opacity-80"
          :aria-label="t('mediaUploader.uploadPopup.gallery.removeImageAlt')"
          @click="emit('remove', item.id)"
        >
          <img
            v-if="crossIconUrl"
            :src="crossIconUrl"
            :alt="t('mediaUploader.uploadPopup.gallery.removeImageAlt')"
            class="w-3.5 h-3.5"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

defineProps({
  files: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['remove']);
const { t } = useI18n();
const { url: crossIconUrl } = useAssetUrl('mediaUploader.icon.crossWhite');
</script>
