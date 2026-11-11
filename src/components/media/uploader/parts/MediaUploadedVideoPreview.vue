<template>
  <div data-component="media-uploaded-video-preview" class="relative w-full min-h-0 flex-1 overflow-hidden rounded-[12px] md:h-auto md:flex-none md:aspect-video">
    <video
      v-if="mediaKind === 'video' && src"
      :src="src"
      class="absolute inset-0 w-full h-full object-cover border-0 outline-none md:relative md:aspect-video md:h-auto"
      controls
      playsinline
    />

    <img
      v-else-if="mediaKind === 'image' && src"
      :src="src"
      :alt="t('mediaUploader.uploadPopup.preview.imageAlt')"
      class="absolute inset-0 w-full h-full object-cover border-0 outline-none md:relative md:aspect-video md:h-auto"
    />

    <div
      v-else-if="mediaKind === 'audio'"
      class="absolute inset-0 flex flex-col items-center justify-center gap-3 w-full h-full bg-black/5 md:relative md:aspect-video md:h-auto dark:bg-white/5"
    >
      <img
        v-if="audioWaveformUrl"
        :src="audioWaveformUrl"
        :alt="fileName || t('mediaUploader.uploadPopup.preview.audioAlt')"
        class="w-16 h-16 object-contain"
      />
      <span class="text-sm font-medium text-text-quaternary dark:text-text-badge-dark">
        {{ fileName || t('mediaUploader.uploadPopup.preview.audioAlt') }}
      </span>
    </div>

    <button
      type="button"
      class="absolute top-0 right-0 z-10 cursor-pointer transition-all"
      :aria-label="deleteAlt"
      @click="emit('delete')"
    >
      <img
        v-if="deleteIconUrl"
        :src="deleteIconUrl"
        :alt="deleteAlt"
        class="w-10 h-10 rounded-tr-[12px]"
      />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const props = defineProps({
  src: {
    type: String,
    default: '',
  },
  /** 'video' | 'image' | 'audio' */
  mediaKind: {
    type: String,
    default: 'video',
  },
  fileName: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['delete']);
const { t } = useI18n();
const { url: deleteIconUrl } = useAssetUrl('mediaUploader.deleteIcon');
const { url: audioWaveformUrl } = useAssetUrl('mediaUploader.icon.audioWaveform');

const deleteAlt = computed(() => {
  if (props.mediaKind === 'image') return t('mediaUploader.uploadPopup.preview.deleteImageAlt');
  if (props.mediaKind === 'audio') return t('mediaUploader.uploadPopup.preview.deleteAudioAlt');
  return t('mediaUploader.uploadPopup.preview.deleteAlt');
});
</script>
