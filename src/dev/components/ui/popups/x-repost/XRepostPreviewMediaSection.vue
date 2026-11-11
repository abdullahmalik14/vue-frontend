<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePlanDropdown from '@/components/ui/dropdowns/BasePlanDropdown.vue';
import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';

const MEDIA_MODE = {
  TOP_SELLING: 'topSelling',
  UPLOAD_OWN: 'uploadOwn',
  NONE: 'none',
};

const MAX_MEDIA = 4;
const ACCEPT = 'image/png,image/jpeg,image/gif,image/webp,video/mp4,video/quicktime';
/** Match top-selling 2×2 height (2 × 126px) */
const GRID_HEIGHT_CLASS = 'h-[252px]';

const props = defineProps({
  assets: {
    type: Object,
    required: true,
  },
  defaultImages: {
    type: Array,
    default: () => [],
  },
});

const { t } = useI18n();

const mediaMode = ref(MEDIA_MODE.TOP_SELLING);
const customMedia = ref([]);
const isMediaHovered = ref(false);
const isMediaMenuOpen = ref(false);

const mediaModeOptions = computed(() => [
  {
    value: MEDIA_MODE.TOP_SELLING,
    label: t('dashboard.xRepost.postPreview.media.modes.topSelling'),
  },
  {
    value: MEDIA_MODE.UPLOAD_OWN,
    label: t('dashboard.xRepost.postPreview.media.modes.uploadOwn'),
  },
  {
    value: MEDIA_MODE.NONE,
    label: t('dashboard.xRepost.postPreview.media.modes.none'),
  },
]);

const showMediaMenu = computed(() => isMediaHovered.value || isMediaMenuOpen.value);

const mediaChromeClass = computed(() =>
  showMediaMenu.value
    ? 'border border-[#2E90FA] bg-[#EFF8FF] rounded-[2px] p-1'
    : 'border border-transparent bg-transparent rounded-[2px] p-1',
);

const topSellingItems = computed(() =>
  (props.defaultImages || []).slice(0, MAX_MEDIA).map((src, index) => ({
    id: `top-${index}`,
    url: src,
  })),
);

const displayItems = computed(() => {
  if (mediaMode.value === MEDIA_MODE.NONE) return [];
  if (mediaMode.value === MEDIA_MODE.TOP_SELLING) return topSellingItems.value;
  return customMedia.value;
});

const uploadedCount = computed(() =>
  mediaMode.value === MEDIA_MODE.UPLOAD_OWN ? customMedia.value.length : displayItems.value.length,
);

const canUploadMore = computed(
  () => mediaMode.value === MEDIA_MODE.UPLOAD_OWN && customMedia.value.length < MAX_MEDIA,
);

const showUploaderOnly = computed(
  () => mediaMode.value === MEDIA_MODE.UPLOAD_OWN && customMedia.value.length === 0,
);

const showEmptyNone = computed(() => mediaMode.value === MEDIA_MODE.NONE);

const showTopSellingGrid = computed(
  () => mediaMode.value === MEDIA_MODE.TOP_SELLING && displayItems.value.length > 0,
);

/**
 * Layout slots by upload count (Upload Your Own):
 * 1 → [uploader | image]
 * 2 → [image tall | image / uploader]
 * 3 → 2×2 [uploader | imgs…] (uploader top-left)
 * 4 → 2×2 images only
 * Top selling always 2×2 images.
 */
const slotsForGrid = computed(() => {
  const images = displayItems.value.map((item) => ({ type: 'image', item }));

  if (mediaMode.value === MEDIA_MODE.TOP_SELLING) {
    return images;
  }

  const count = customMedia.value.length;
  if (count === 1) {
    return [{ type: 'uploader' }, images[0]];
  }
  if (count === 2) {
    return [images[0], images[1], { type: 'uploader' }];
  }
  if (count === 3) {
    return [{ type: 'uploader' }, images[0], images[1], images[2]];
  }
  return images;
});

/** Fixed 252px — same as top-selling; minmax(0,1fr) stops content from stretching rows */
const gridClass = computed(() => {
  const count = uploadedCount.value;
  if (mediaMode.value === MEDIA_MODE.UPLOAD_OWN && count === 1) {
    return `grid-cols-2 gap-[2px] ${GRID_HEIGHT_CLASS} [grid-template-rows:minmax(0,1fr)]`;
  }
  return `grid-cols-2 gap-[2px] ${GRID_HEIGHT_CLASS} [grid-template-rows:repeat(2,minmax(0,1fr))]`;
});

/** Outer corners only — 10px; inner corners stay square */
function outerRadiusClass(index) {
  const count = uploadedCount.value;
  const isUpload = mediaMode.value === MEDIA_MODE.UPLOAD_OWN;

  if (isUpload && count === 1) {
    return index === 0 ? 'rounded-l-[10px]' : 'rounded-r-[10px]';
  }
  if (isUpload && count === 2) {
    if (index === 0) return 'rounded-l-[10px]';
    if (index === 1) return 'rounded-tr-[10px]';
    return 'rounded-br-[10px]';
  }
  // 2×2 (top selling / 3 / 4 images)
  if (index === 0) return 'rounded-tl-[10px]';
  if (index === 1) return 'rounded-tr-[10px]';
  if (index === 2) return 'rounded-bl-[10px]';
  return 'rounded-br-[10px]';
}

/** Close sits top-right of cell — only round if that corner is an outer image radius */
function closeBtnRadiusClass(index) {
  const count = uploadedCount.value;
  if (mediaMode.value !== MEDIA_MODE.UPLOAD_OWN) return 'rounded-none';

  if (count === 1 && index === 1) return 'rounded-tr-[10px]';
  if (count === 2 && index === 1) return 'rounded-tr-[10px]';
  if (count >= 3 && index === 1) return 'rounded-tr-[10px]';
  return 'rounded-none';
}

function slotCellClass(slot, index) {
  const base = `min-h-0 overflow-hidden ${outerRadiusClass(index)}`;
  if (mediaMode.value === MEDIA_MODE.UPLOAD_OWN && uploadedCount.value === 2 && index === 0 && slot.type === 'image') {
    return `row-span-2 ${base}`;
  }
  return base;
}

const uploaderCompactClass =
  'cursor-pointer border-0 bg-black/5 rounded-none p-1.5 !h-full !min-h-0 w-full flex flex-col items-center justify-center overflow-hidden hover:bg-black/10 group relative';

const uploaderTitleClass = 'text-dark-gray text-[11px] leading-4 text-center font-normal';
const uploaderTitleHighlightClass = 'text-[#0C111D] text-[11px] font-bold leading-4';
const uploaderFileInfoClass = 'text-dark-gray text-[10px] leading-3 text-center mb-0';

function onMediaMenuOpen() {
  isMediaMenuOpen.value = true;
}

function onMediaMenuClose() {
  isMediaMenuOpen.value = false;
}

function modeIconSrc(mode) {
  if (mode === MEDIA_MODE.UPLOAD_OWN) return props.assets.mediaModeUpload;
  if (mode === MEDIA_MODE.NONE) return props.assets.mediaModeNone;
  return props.assets.mediaModeTopSelling;
}

/** Selected → white; unselected → #2970FF */
function modeIconMaskStyle(mode, selected) {
  const src = modeIconSrc(mode);
  if (!src) return null;
  return {
    backgroundColor: selected ? '#FFFFFF' : '#2970FF',
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  };
}

function revokeUrl(url) {
  if (url && String(url).startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

function addMediaFiles(payloads) {
  const list = Array.isArray(payloads) ? payloads : payloads ? [payloads] : [];
  const room = MAX_MEDIA - customMedia.value.length;
  let added = 0;
  list.forEach((payload) => {
    if (added >= room || !payload?.objectUrl) return;
    // Same pick can emit twice (file-selected + files-selected) — keep one entry
    if (customMedia.value.some((item) => item.url === payload.objectUrl)) return;
    customMedia.value.push({
      id: `${Date.now()}-${Math.random()}`,
      url: payload.objectUrl,
    });
    added += 1;
  });
}

/** Prefer files-selected; ignore file-selected when multiple also fires */
let filesSelectedTick = 0;

function onFilesSelected(payloads) {
  filesSelectedTick = Date.now();
  addMediaFiles(payloads);
}

function onFileSelected(payload) {
  if (Date.now() - filesSelectedTick < 50) return;
  addMediaFiles(payload);
}

function removeMedia(id) {
  const index = customMedia.value.findIndex((item) => item.id === id);
  if (index === -1) return;
  const [removed] = customMedia.value.splice(index, 1);
  revokeUrl(removed?.url);
}
</script>

<template>
  <div
    class="relative w-full"
    :class="showEmptyNone ? 'min-h-10' : ''"
    @mouseenter="isMediaHovered = true"
    @mouseleave="isMediaHovered = false"
  >
    <div
      v-show="showMediaMenu"
      class="absolute bottom-full right-0 z-20"
    >
      <BasePlanDropdown
        v-model="mediaMode"
        unstyled
        width-class="w-[174px]"
        :options="mediaModeOptions"
        @open="onMediaMenuOpen"
        @close="onMediaMenuClose"
      >
        <template #trigger="{ isOpen, selectedLabel }">
          <div
            class="flex h-8 w-[174px] items-center gap-1.5 rounded-t-[2px] bg-[#2970FF] px-2.5 text-[12px] font-semibold leading-4 text-white"
          >
            <span
              v-if="modeIconMaskStyle(mediaMode, true)"
              class="size-3.5 shrink-0"
              :style="modeIconMaskStyle(mediaMode, true)"
            />
            <span class="min-w-0 flex-1 truncate">{{ selectedLabel }}</span>
            <span
              v-if="assets.chevron"
              class="size-2.5 shrink-0 bg-white transition-transform"
              :class="isOpen ? 'rotate-180' : ''"
              :style="{
                WebkitMaskImage: `url(${assets.chevron})`,
                maskImage: `url(${assets.chevron})`,
                WebkitMaskSize: 'contain',
                maskSize: 'contain',
                WebkitMaskRepeat: 'no-repeat',
                maskRepeat: 'no-repeat',
                WebkitMaskPosition: 'center',
                maskPosition: 'center',
              }"
              aria-hidden="true"
            />
          </div>
        </template>

        <template #options-container="{ options, selectOption, isOpen, modelValue }">
          <div
            v-show="isOpen"
            class="absolute right-0 top-full z-30 mt-0 w-[174px] overflow-hidden rounded-b-[2px] rounded-tl-[2px] bg-[#FFFFFF] shadow-[0_3px_6px_0_#00000033]"
          >
            <button
              v-for="option in options.filter((item) => item.value !== modelValue)"
              :key="option.value"
              type="button"
              class="flex w-full items-center gap-2 bg-[#FFFFFF] px-2.5 py-2.5 text-left text-[#2970FF] transition-colors hover:bg-[#EFF8FF]"
              @click.stop="selectOption(option)"
            >
              <span
                v-if="modeIconMaskStyle(option.value, false)"
                class="size-4 shrink-0"
                :style="modeIconMaskStyle(option.value, false)"
              />
              <span class="min-w-0 flex-1 text-[12px] font-semibold leading-4">
                {{ option.label }}
              </span>
            </button>
          </div>
        </template>
      </BasePlanDropdown>
    </div>

    <!-- Don't use media -->
    <div
      v-if="showEmptyNone"
      class="w-full min-h-10 transition-colors"
      :class="mediaChromeClass"
    />

    <!-- Upload own empty — 126px; inner uploader 12px, hover chrome stays 2px -->
    <div
      v-else-if="showUploaderOnly"
      class="h-[126px] w-full transition-colors"
      :class="mediaChromeClass"
    >
      <ThumbnailUploader
        :title="t('dashboard.xRepost.postPreview.media.uploadTitle')"
        subtitle=""
        :file-info="t('dashboard.xRepost.postPreview.media.uploadFileInfo')"
        :accept="ACCEPT"
        :use-media-store="false"
        :show-selected-name="false"
        :multiple="true"
        icon-variant="badge"
        full-area-click
        :wrapper-class="`${uploaderCompactClass} !h-full !min-h-0 !rounded-[12px]`"
        :title-class="uploaderTitleClass"
        :title-highlight-class="uploaderTitleHighlightClass"
        :file-info-class="uploaderFileInfoClass"
        @files-selected="onFilesSelected"
      />
    </div>

    <!-- Top selling / upload with images — fixed height -->
    <div
      v-else
      class="relative w-full overflow-hidden transition-colors"
      :class="showTopSellingGrid && !showMediaMenu ? 'border border-transparent rounded-[2px] p-1' : mediaChromeClass"
    >
      <div
        class="grid w-full overflow-hidden"
        :class="gridClass"
      >
        <template
          v-for="(slot, index) in slotsForGrid"
          :key="slot.type === 'image' ? slot.item.id : `uploader-${index}`"
        >
          <div
            v-if="slot.type === 'image'"
            class="group/media relative bg-[#F2F4F7]"
            :class="slotCellClass(slot, index)"
          >
            <img
              :src="slot.item.url"
              alt=""
              class="absolute inset-0 h-full w-full object-cover"
            />

            <button
              v-if="mediaMode === MEDIA_MODE.UPLOAD_OWN"
              type="button"
              class="absolute right-0 top-0 z-10 flex size-6 cursor-pointer items-center justify-center bg-[#FF4405] opacity-0 transition-opacity group-hover/media:opacity-100"
              :class="closeBtnRadiusClass(index)"
              @click.stop="removeMedia(slot.item.id)"
            >
              <img
                v-if="assets.close"
                :src="assets.close"
                alt=""
                width="14"
                height="14"
                class="size-3.5 object-contain brightness-0 invert"
              />
            </button>

            <div
              class="absolute bottom-1.5 left-1.5 z-10 flex items-center gap-1 rounded-[2px] bg-black/50 px-1.5 py-0.5 opacity-0 transition-opacity group-hover/media:opacity-100"
            >
              <img
                v-if="assets.imageTag"
                :src="assets.imageTag"
                alt=""
                width="12"
                height="12"
                class="size-3 object-contain brightness-0 invert"
              />
              <span class="text-[10px] font-medium leading-3 text-white">
                {{ t('dashboard.xRepost.postPreview.media.imageLabel') }}
              </span>
            </div>
          </div>

          <div
            v-else
            class="relative h-full"
            :class="slotCellClass(slot, index)"
          >
            <ThumbnailUploader
              :title="t('dashboard.xRepost.postPreview.media.uploadTitle')"
              subtitle=""
              :file-info="t('dashboard.xRepost.postPreview.media.uploadFileInfo')"
              :accept="ACCEPT"
              :use-media-store="false"
              :show-selected-name="false"
              :multiple="customMedia.length < MAX_MEDIA - 1"
              icon-variant="badge"
              full-area-click
              :wrapper-class="uploaderCompactClass"
              :title-class="uploaderTitleClass"
              :title-highlight-class="uploaderTitleHighlightClass"
              :file-info-class="uploaderFileInfoClass"
              @files-selected="onFilesSelected"
              @file-selected="onFileSelected"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
