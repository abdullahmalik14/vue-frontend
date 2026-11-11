<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';
import { useMediaUploaderAssets } from '@/composables/useMediaUploaderAssets.js';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const { assets } = useMediaUploaderAssets();
const { url: audioWaveformUrl } = useAssetUrl('mediaUploader.icon.audioWaveform');
const videoRef = ref(null);
const isPlaying = ref(false);

const previewUrl = computed(() => uploaderStore.form.previewTrailerUrl || '');

const trailerFileName = computed(
  () =>
    uploaderStore.form.uploadedTrailerFile?.name ||
    t('mediaUploader.preview.audioFallbackName'),
);

const isMaybeVideo = computed(() => {
  const file = uploaderStore.form.uploadedTrailerFile;
  const url = uploaderStore.form.previewTrailerUrl;

  if (file && file.type && file.type.startsWith('video/')) return true;

  if (typeof url === 'string') {
    if (url.startsWith('data:video/')) return true;
    return url.match(/\.(mp4|webm|ogg|mov)$/i);
  }

  return false;
});

const isMaybeAudio = computed(() => {
  const file = uploaderStore.form.uploadedTrailerFile;
  const url = uploaderStore.form.previewTrailerUrl;

  if (file && file.type && file.type.startsWith('audio/')) return true;

  if (typeof url === 'string') {
    if (url.startsWith('data:audio/')) return true;
    return url.match(/\.(mp3|wav|ogg|m4a|aac)$/i);
  }

  return false;
});

const backgroundStyle = computed(() => {
  if (isMaybeVideo.value || isMaybeAudio.value || !previewUrl.value) return {};
  return {
    backgroundImage: `url('${previewUrl.value}')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
});

function togglePlay() {
  if (!videoRef.value) return;
  if (videoRef.value.paused) {
    videoRef.value.play();
  } else {
    videoRef.value.pause();
  }
}

function removeTrailer() {
  const trailerUrl = uploaderStore.form.previewTrailerUrl;
  if (trailerUrl && typeof trailerUrl === 'string' && trailerUrl.startsWith('blob:')) {
    URL.revokeObjectURL(trailerUrl);
  }
  uploaderStore.updateFormField('previewTrailerUrl', '');
  uploaderStore.updateFormField('uploadedTrailerFile', null);
  isPlaying.value = false;
}
</script>

<template>
  <div data-component="media-upload-own-trailer" v-if="previewUrl" class="relative w-full">
    <div
      class="flex overflow-hidden rounded-[2px] bg-black cursor-pointer group/video"
      @click="togglePlay"
    >
      <video
        ref="videoRef"
        v-if="isMaybeVideo"
        :key="previewUrl"
        :src="previewUrl"
        class="aspect-[16/9] w-full object-cover"
        autoplay
        loop
        muted
        playsinline
        @play="isPlaying = true"
        @pause="isPlaying = false"
      ></video>

      <div
        v-else-if="isMaybeAudio"
        class="flex flex-col items-center justify-center gap-3 aspect-[16/9] w-full bg-black/5 dark:bg-white/5"
      >
        <img
          v-if="audioWaveformUrl"
          :src="audioWaveformUrl"
          :alt="trailerFileName"
          class="w-16 h-16 object-contain"
        />
        <span class="text-sm font-medium text-text-quaternary dark:text-text-badge-dark">
          {{ trailerFileName }}
        </span>
      </div>

      <div
        v-else
        class="aspect-[16/9] w-full bg-no-repeat bg-center bg-cover"
        :style="backgroundStyle"
      ></div>
    </div>

    <button
      type="button"
      class="absolute top-0 right-0 cursor-pointer transition-all z-20"
      @click.stop="removeTrailer"
    >
      <img :src="assets.deleteIcon" :alt="t('mediaUploader.a11y.delete')" class="w-6 h-6 rounded-tr-sm" />
    </button>

    <span
      v-if="isMaybeVideo"
      class="bg-black w-8 h-8 flex justify-center items-center absolute bottom-0 left-0 rounded-bl-sm cursor-pointer z-20 transition-all active:scale-95"
      @click.stop="togglePlay"
    >
      <img :src="assets.videoIcon" :alt="t('mediaUploader.a11y.play')" class="w-4 h-4" />
    </span>
  </div>
</template>
