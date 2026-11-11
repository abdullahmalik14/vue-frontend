<template>
  <div data-component="media-upload-progress-state"
    class="relative w-full flex flex-col bg-black/5  p-4 dark:bg-white/5"
    :class="compact ? 'h-[200px] max-h-[200px]' : 'h-full min-h-0 flex-1 md:h-[450px] md:flex-none md:min-h-[450px]'"
    role="status"
    :aria-label="statusLabel"
  >
    <!-- Centered progress -->
    <div class="flex-1 flex flex-col items-center justify-center gap-3 px-6 sm:px-16 md:px-24">
      <div
        class="w-full max-w-[28rem] h-[6px] bg-border-light overflow-hidden dark:bg-panel-dark-border rounded-[50px] "
        role="progressbar"
        :aria-valuenow="Math.round(progress)"
        aria-valuemin="0"
        aria-valuemax="100"
      >
        <div
          class="h-full bg-text-primary transition-[width] duration-150 ease-linear dark:bg-timberwolf"
          :style="{ width: `${Math.min(100, Math.max(0, progress))}%` }"
        />
      </div>

      <p class="text-sm font-medium text-center text-medium-text dark:text-cosmo-darkInk">
        {{ statusLabel }}
      </p>
    </div>

    <!-- Cancel — bottom right -->
    <button
      type="button"
      class="absolute bottom-4 right-4 flex items-center gap-1.5 cursor-pointer hover:opacity-80"
      @click="emit('cancel')"
    >
      <img
        v-if="closeIconUrl"
        :src="closeIconUrl"
        :alt="t('mediaUploader.uploadPopup.progress.cancel')"
        class="w-3.5 h-3.5 [filter:brightness(0)_saturate(100%)_invert(30%)_sepia(10%)_saturate(743%)_hue-rotate(182deg)_brightness(95%)_contrast(90%)]"
      />
      <span class="text-xs font-medium text-medium-text dark:text-cosmo-darkInk">
        {{ t('mediaUploader.uploadPopup.progress.cancel') }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const props = defineProps({
  /** 0–100 */
  progress: {
    type: Number,
    default: 0,
  },
  /** 'uploading' | 'processing' */
  phase: {
    type: String,
    default: 'uploading',
  },
  /** Gallery: shorter box (200px) matching Figma */
  compact: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['cancel']);
const { t } = useI18n();
const { url: closeIconUrl } = useAssetUrl('mediaUploader.icon.close');

const statusLabel = computed(() =>
  props.phase === 'processing'
    ? t('mediaUploader.uploadPopup.progress.processing')
    : t('mediaUploader.uploadPopup.progress.uploading'),
);
</script>
