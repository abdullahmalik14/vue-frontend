<template>
  <div data-component="media-video-thumbnail-selector" class="w-full flex flex-row flex-wrap items-start justify-start gap-6 rounded-2xl">
    <div class="flex w-full flex-col md:flex-row flex-wrap justify-end rounded-3xl gap-2 md:gap-0">
      
      <div class="flex w-full items-start justify-start overflow-hidden md:w-1/2">
        <div class="relative w-full rounded overflow-hidden bg-gray-100">
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
            <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <img 
            v-if="displayThumbnailUrl"
            :src="displayThumbnailUrl" 
            :alt="t('mediaUploader.a11y.selectedThumbnail')"
            class="w-full aspect-[16/9] object-cover rounded transition-opacity duration-200"
            :class="isLoading ? 'opacity-0' : 'opacity-100'" 
            :style="imageBlurStyle"
            loading="eager" 
            decoding="async" 
            fetchpriority="high"
            @load="isLoading = false"
            @error="isLoading = false"
          />
        </div>
      </div>

      <div class="flex w-full flex-col justify-between md:w-1/2 gap-4 md:pl-2">
        <div class="flex w-full flex-col">
          <ThumbnailSelector 
            :thumbnails="displayThumbnails" 
            :selectedIndex="currentIndex"
            @update:selectedIndex="onThumbnailSelect" 
          />
        </div>
        
        <div class="flex items-center gap-2">
          <CheckboxSwitch 
            :label="t('mediaUploader.thumbnail.blurToggle')" 
            showWrapperLabel 
            id="blur-thumbnail-toggle" 
            v-model="blurModel" 
          />

          <div :class="{ 'opacity-50 pointer-events-none': !isBlurVisible('blurControls') }">
             <BlurEffect v-model="blurLevelModel" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import ThumbnailSelector from "./ThumbnailSelector.vue";
import BlurEffect from './BlurEffect.vue';
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";
import { useMediaUploaderAssets } from "@/composables/useMediaUploaderAssets.js";
import { useMediaInteractions } from '@/composables/useMediaInteractions.js';

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const { assets } = useMediaUploaderAssets();
const injected = inject('mediaPreviewInteractions', null);
const blurIx = injected || useMediaInteractions('mediaUploaderVideoThumb');
const ownsBlurScope = !injected;
const blurConfig = blurIx.fieldConfig('blurThumbnail');
const { isVisible: isBlurVisible } = blurIx;

/** Cache: original URL → local blob: URL (for https/http remote assets). */
const blobUrlBySource = ref(new Map());
const preloadedImages = ref(new Set());
const createdBlobUrls = [];

const sourceThumbnails = computed(() => {
  const { slideImage, thumbA, thumbB } = assets.value;
  return [
    slideImage,
    thumbA,
    thumbB,
    thumbA,
    thumbB,
    thumbA,
    thumbB,
    thumbA,
    thumbB,
    thumbB,
    thumbB,
    thumbB,
  ].filter(Boolean);
});

const displayThumbnails = computed(() =>
  sourceThumbnails.value.map((src) => blobUrlBySource.value.get(src) || src),
);

const isLoading = ref(false);
const selectedIndex = ref(0);

const currentSourceUrl = computed(() => {
  const list = sourceThumbnails.value;
  if (!list.length) return '';
  const stored = uploaderStore.form.thumbnailUrl || '';
  // Prefer the grid selection — stale thumbnailUrl (e.g. video data URL) must not break preview.
  if (list[selectedIndex.value]) return list[selectedIndex.value];
  if (stored && list.includes(stored)) return stored;
  return list[0] || '';
});

const displayThumbnailUrl = computed(() => {
  const src = currentSourceUrl.value;
  if (!src) return '';
  return blobUrlBySource.value.get(src) || src;
});

const currentIndex = computed(() => selectedIndex.value);

const blurModel = computed({
  get: () => uploaderStore.form.blurThumbnail || false,
  set: (val) => {
    uploaderStore.updateFormField("blurThumbnail", val);
    blurIx.changeField(blurConfig, val, 'blurControls');
  }
});

const blurLevelModel = computed({
  get: () => uploaderStore.form.blurThumbnailLevel || 'low',
  set: (val) => {
    uploaderStore.updateFormField("blurThumbnailLevel", val);
  }
});

const imageBlurStyle = computed(() => {
  if (!blurModel.value) {
    return {};
  }
  
  const blurMap = {
    '20px': '8px',
    '50px': '20px',
    '100px': '40px'
  };
  
  const blurValue = blurMap[blurLevelModel.value] || '8px';

  return {
    filter: `blur(${blurValue})`,
    '-webkit-filter': `blur(${blurValue})`
  };
});

function isRemoteHttpUrl(src) {
  return typeof src === 'string' && /^https?:\/\//i.test(src);
}

async function materializeLocalUrl(src) {
  if (!src || blobUrlBySource.value.has(src) || !isRemoteHttpUrl(src)) {
    return blobUrlBySource.value.get(src) || src;
  }

  try {
    const response = await fetch(src, { mode: 'cors', credentials: 'omit' });
    if (!response.ok) return src;
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    createdBlobUrls.push(objectUrl);
    const next = new Map(blobUrlBySource.value);
    next.set(src, objectUrl);
    blobUrlBySource.value = next;
    return objectUrl;
  } catch {
    return src;
  }
}

function markPreloaded(src) {
  if (!src || preloadedImages.value.has(src)) return;
  const img = new Image();
  img.decoding = 'async';
  img.onload = () => {
    preloadedImages.value.add(src);
    const local = blobUrlBySource.value.get(src);
    if (local) preloadedImages.value.add(local);
    if (src === currentSourceUrl.value || local === displayThumbnailUrl.value) {
      isLoading.value = false;
    }
  };
  img.src = blobUrlBySource.value.get(src) || src;
}

async function preloadImages() {
  const unique = [...new Set(sourceThumbnails.value)];
  await Promise.all(unique.map((src) => materializeLocalUrl(src)));
  unique.forEach((src) => markPreloaded(src));
}

const onThumbnailSelect = (index) => {
  const selectedUrl = sourceThumbnails.value[index];
  if (!selectedUrl) return;

  selectedIndex.value = index;

  const displayUrl = blobUrlBySource.value.get(selectedUrl) || selectedUrl;
  if (!preloadedImages.value.has(selectedUrl) && !preloadedImages.value.has(displayUrl)) {
    isLoading.value = true;
  }
  uploaderStore.updateFormField("thumbnailUrl", selectedUrl);
};

watch(currentSourceUrl, (src) => {
  const displayUrl = blobUrlBySource.value.get(src) || src;
  if (preloadedImages.value.has(src) || preloadedImages.value.has(displayUrl)) {
    isLoading.value = false;
  }
});

watch(
  sourceThumbnails,
  (list) => {
    if (uploaderStore.form.mediaType && uploaderStore.form.mediaType !== 'video') return;
    if (!list.length) return;

    const stored = uploaderStore.form.thumbnailUrl || '';
    const storedIdx = stored ? list.indexOf(stored) : -1;

    if (storedIdx === -1) {
      // Reset invalid/stale thumbnail (video bytes, missing asset, etc.)
      selectedIndex.value = 0;
      if (stored !== list[0]) {
        uploaderStore.updateFormField('thumbnailUrl', list[0]);
      }
    } else if (list[selectedIndex.value] !== stored) {
      selectedIndex.value = storedIdx;
    }

    preloadImages();
  },
  { immediate: true },
);

onMounted(() => {
  if (!uploaderStore.form.blurThumbnailLevel) {
    uploaderStore.updateFormField("blurThumbnailLevel", '20px');
  }
  blurIx.registerField(blurConfig, blurModel.value, 'blurControls');
});

onBeforeUnmount(() => {
  if (ownsBlurScope) blurIx.clear();
  createdBlobUrls.forEach((url) => URL.revokeObjectURL(url));
});
</script>
