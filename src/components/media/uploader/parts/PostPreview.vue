<template>
  <!-- post preview -->
  <div data-component="media-post-preview" class="flex flex-col w-full min-w-0 gap-2 md:w-[17.625rem] md:shrink-0">
    <div class="flex md:justify-end">
      <span class="text-xs leading-[1.125rem] text-gray-500 font-normal">{{ t('mediaUploader.postPreview.heading') }}</span>
    </div>

    <div class="relative flex w-full min-w-0 gap-2 p-3 overflow-hidden rounded-[0.313rem] bg-white border border-gray-100 shadow-sm">
      <!-- user-image -->
      <div class="flex items-center justify-center h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
        <img
          :src="assets.postPreviewAvatar"
          :alt="t('mediaUploader.postPreview.avatarAlt')"x
          class="w-full h-full object-cover"
        />
      </div>

      <!-- user-content -->
      <div class="flex flex-col flex-1 gap-1.5 min-w-0">
        <!-- user-info -->
        <div class="flex items-center gap-1.5 overflow-hidden">
          <span class="text-dark-text font-bold text-[0.813rem] leading-none truncate">
            {{ t('mediaUploader.postPreview.displayName') }}
          </span>
          <img
            :src="assets.postPreviewVerified"
            :alt="t('mediaUploader.postPreview.verifiedAlt')"
            class="w-3.5 h-3.5 flex-shrink-0"
          />
          <span class="text-text-quaternary text-[0.75rem] truncate">
            {{ t('mediaUploader.postPreview.handle') }}
          </span>
        </div>

        <!-- user-description -->
        <div class="flex flex-col gap-1 min-w-0">
          <Paragraph theme="custom" no-wrap add-class="text-dark-text font-medium text-[12px] leading-[1.125rem] break-words" :text="displayMessage" />
          <span class="text-text-primary text-[12px] font-[500] cursor-pointer break-all">{{ t('mediaUploader.postPreview.linkPreview') }}</span>
        </div>

        <!-- preview-image/video card -->
        <div
          v-if="uploaderStore.form.socialThumbnailMode !== 'none'"
          class="relative mt-2 flex gap-1 w-full rounded-[0.625rem] overflow-hidden"
        >
          <!-- Left Side: Video Preview (Always Video focus) -->
          <div 
            class="relative flex-1 aspect-square bg-gray-200 overflow-hidden cursor-pointer group"
            @click="togglePlay"
          >
            <video
              ref="videoRef"
              v-if="videoSource && isVideo(videoSource)"
              :src="videoSource"
              class="w-full h-full object-cover"
              autoplay
              loop
              muted
              playsinline
              @play="isPlaying = true"
              @pause="isPlaying = false"
            ></video>
            
            <!-- Play Button Overlay (Show if video source exists and is paused) -->
            <div 
              v-if="videoSource && isVideo(videoSource) && !isPlaying" 
              class="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none transition-opacity duration-200"
            >
               <div class="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center border border-white/50 shadow-lg">
                  <div class="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
               </div>
            </div>

            <!-- Video Placeholder -->
            <div v-if="!videoSource || !isVideo(videoSource)" class="flex flex-col items-center justify-center h-full text-text-quaternary opacity-30 scale-75">
               <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
               </svg>
            </div>
          </div>

          <!-- Right Side: Image Preview (Always Image focus) -->
          <div class="relative flex-1 aspect-square bg-gray-200 overflow-hidden">
            <img
              v-if="imageSource"
              :src="imageSource"
              class="w-full h-full object-cover"
              @error="(e) => e.target.style.display = 'none'"
            />
            
            <!-- Image Placeholder -->
            <div v-if="!imageSource" class="flex flex-col items-center justify-center h-full text-text-quaternary opacity-30 scale-75">
               <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import Paragraph from "@/components/ui/typography/Paragraph.vue";
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";
import { useMediaUploaderAssets } from "@/composables/useMediaUploaderAssets.js";

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const { assets } = useMediaUploaderAssets();
const videoRef = ref(null);
const isPlaying = ref(true); // Autoplay is default

function togglePlay() {
  if (!videoRef.value) return;
  if (videoRef.value.paused) {
    videoRef.value.play();
  } else {
    videoRef.value.pause();
  }
}

// Dynamic message logic
const displayMessage = computed(() => {
  return uploaderStore.form.socialPostMessage || t('mediaUploader.postPreview.defaultMessage');
});

// Logic for Video (Left Side)
const videoSource = computed(() => {
  const mode = uploaderStore.form.socialThumbnailMode;
  if (mode === 'useCustom') {
    return uploaderStore.form.socialThumbnailCustomVideoSrc;
  }
  if (mode === 'useOriginal') {
    return uploaderStore.form.previewTrailerUrl || uploaderStore.form.mediaUrl;
  }
  return null;
});

// Logic for Image (Right Side)
const imageSource = computed(() => {
  const mode = uploaderStore.form.socialThumbnailMode;
  if (mode === 'useCustom') {
    return uploaderStore.form.socialThumbnailCustomImageSrc;
  }
  if (mode === 'useOriginal') {
    return uploaderStore.form.thumbnailUrl;
  }
  return null;
});

// Helper to check if string is a video URL
function isVideo(url) {
  if (!url) return false;
  if (url.startsWith('data:video/')) return true;
  if (url.startsWith('data:image/') || url.startsWith('data:audio/')) return false;

  const videoExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.m4v'];
  const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
  const isBlobOrVideoType = url.startsWith('blob:') || url.toLowerCase().includes('video');

  return hasVideoExtension || isBlobOrVideoType;
}
</script>
