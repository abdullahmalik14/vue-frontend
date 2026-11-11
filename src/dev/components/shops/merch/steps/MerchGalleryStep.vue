<template>
  <div
    data-component="merch-gallery-step"
    class="relative flex w-full flex-col gap-6"
  >
    <!-- Flush top notice: over-limit warning or post-upload approval — no gap under tabs -->
    <div
      v-if="showTopNotice"
      class="absolute left-0 right-0 top-0 z-20 -mx-6 -mt-4"
    >
      <NotificationCard
        v-model="topNoticeOpen"
        :variant="showOverLimitWarning ? 'alert' : 'notice'"
        :theme="showOverLimitWarning ? 'merchGalleryAlert' : 'merchGalleryNotice'"
        :title="topNoticeTitle"
        :icon="limitWarningIconUrl"
        closable
      />
    </div>

    <ul
      class="flex list-disc flex-col gap-1 pl-5 marker:text-[#344054]"
      :class="showTopNotice ? 'pt-16' : ''"
    >
      <li>
        <Paragraph
          :text="t('shops.merch.listing.gallery.helpUploadLimit')"
          theme="custom"
          no-wrap
          add-class="text-base font-normal leading-6 text-[#344054]"
        />
      </li>
      <li>
        <Paragraph
          :text="t('shops.merch.listing.gallery.helpReorder')"
          theme="custom"
          no-wrap
          add-class="text-base font-normal leading-6 text-[#344054]"
        />
      </li>
    </ul>

    <!-- Uploading / processing -->
    <template v-if="isProgressPhase">
      <MediaUploadProgressState
        :progress="uploadProgress"
        :phase="galleryPhase"
        compact
        @cancel="cancelUploadProgress"
      />
      <div
        v-if="uploadedFiles.length === 0"
        class="flex h-[320px] w-full flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-handle-light bg-transparent"
      >
        <img
          v-if="galleryEmptyIconUrl"
          :src="galleryEmptyIconUrl"
          :alt="t('shops.merch.listing.gallery.emptyIconAlt')"
          class="h-12 w-14 object-contain"
        />
        <Paragraph
          :text="t('shops.merch.listing.gallery.emptyMessage')"
          theme="custom"
          no-wrap
          add-class="text-center text-xs font-normal leading-[1.125rem] text-[#667085]"
        />
      </div>
      <MerchGalleryMediaGrid
        v-else
        :files="uploadedFiles"
        @remove="removeUploaded"
        @reorder="reorderUploaded"
      />
    </template>

    <!-- Pending file list -->
    <template v-else-if="showPending">
      <MediaGalleryPendingList
        variant="merch"
        :files="pendingFiles"
        :file-count="pendingFiles.length"
        :upload-disabled="isOverLimit"
        @remove="removePending"
        @add-files="addPending"
        @upload="startGalleryUpload"
      />
      <div
        v-if="uploadedFiles.length === 0"
        class="flex h-[320px] w-full flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-handle-light bg-transparent"
      >
        <img
          v-if="galleryEmptyIconUrl"
          :src="galleryEmptyIconUrl"
          :alt="t('shops.merch.listing.gallery.emptyIconAlt')"
          class="h-12 w-14 object-contain"
        />
        <Paragraph
          :text="t('shops.merch.listing.gallery.emptyMessage')"
          theme="custom"
          no-wrap
          add-class="text-center text-xs font-normal leading-[1.125rem] text-[#667085]"
        />
      </div>
      <MerchGalleryMediaGrid
        v-else
        :files="uploadedFiles"
        @remove="removeUploaded"
        @reorder="reorderUploaded"
      />
    </template>

    <!-- Idle / ready -->
    <template v-else>
      <ThumbnailUploader
        v-if="showUploader"
        :title="t('mediaUploader.thumbnailUploader.title')"
        :subtitle="t('mediaUploader.uploadPopup.drop.imageGallery')"
        :file-info="t('mediaUploader.uploadPopup.formats.imageGallery')"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
        :use-media-store="false"
        :show-selected-name="false"
        icon-variant="badge"
        full-area-click
        multiple
        :wrapper-class="uploadWrapperClass"
        inner-wrapper-class="gap-1 w-full flex flex-col justify-center items-center self-stretch border-2 border-dashed border-transparent"
        title-class="text-sm leading-5 text-center font-normal text-text-quaternary"
        title-highlight-class="font-semibold text-text-primary"
        file-info-class="text-text-quaternary text-xs leading-[1.125rem] text-center mb-0"
        @files-selected="onFilesSelected"
      />

      <div
        v-if="uploadedFiles.length === 0"
        class="flex h-[320px] w-full flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-handle-light bg-transparent"
      >
        <img
          v-if="galleryEmptyIconUrl"
          :src="galleryEmptyIconUrl"
          :alt="t('shops.merch.listing.gallery.emptyIconAlt')"
          class="h-12 w-14 object-contain"
        />
        <Paragraph
          :text="t('shops.merch.listing.gallery.emptyMessage')"
          theme="custom"
          no-wrap
          add-class="text-center text-xs font-normal leading-[1.125rem] text-[#667085]"
        />
      </div>

      <MerchGalleryMediaGrid
        v-else
        :files="uploadedFiles"
        @remove="removeUploaded"
        @reorder="reorderUploaded"
      />
    </template>

    <!-- Success toast — same top-right placement as UploadMediaPopup -->
    <Teleport to="body">
      <div
        v-if="showSuccessToast"
        class="pointer-events-auto fixed top-[10px] left-[10px] right-[10px] z-[9999] w-auto animate-in fade-in slide-in-from-top duration-300 sm:left-auto sm:right-2 sm:top-2 sm:w-[350px] sm:slide-in-from-right"
      >
        <NotificationCard
          v-model="showSuccessToast"
          variant="success-teal"
          :title="successToastTitle"
          :closable="false"
        >
          <template #icon>
            <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-mediaUi-mintSoft">
              <img
                v-if="gallerySuccessTickUrl"
                :src="gallerySuccessTickUrl"
                :alt="successToastTitle"
                class="h-7 w-7 object-contain"
              />
            </div>
          </template>
        </NotificationCard>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';
import MediaGalleryPendingList from '@/components/media/uploader/parts/MediaGalleryPendingList.vue';
import MediaUploadProgressState from '@/components/media/uploader/parts/MediaUploadProgressState.vue';
import MerchGalleryMediaGrid from '@/dev/components/shops/merch/MerchGalleryMediaGrid.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const MAX_GALLERY = 6;

const props = defineProps({
  /** createStepStateEngine instance for this merch listing flow */
  engine: { type: Object, required: true },
});

const { t } = useI18n();
const { url: galleryEmptyIconUrl } = useAssetUrl('mediaUploader.icon.galleryEmpty');
const { url: gallerySuccessTickUrl } = useAssetUrl('mediaUploader.icon.gallerySuccessTick');
const { url: limitWarningIconUrl } = useAssetUrl('shops.merch.icon.galleryLimitWarning');

const pendingFiles = ref([]);
const uploadedFiles = ref([]);
const galleryPhase = ref('idle');
const uploadProgress = ref(0);
const showSuccessToast = ref(false);
const showApprovalNotice = ref(false);
/** User closed the over-limit warning; show again if they leave then re-enter over-limit. */
const overLimitDismissed = ref(false);
const lastUploadCount = ref(0);

let galleryIdSeq = 0;
let progressTimer = null;
let toastTimer = null;

const uploadWrapperClass =
  'cursor-pointer border-2 border-transparent bg-black/5 rounded-xl p-2 h-[230px] flex flex-col items-center justify-center hover:border-dark-text hover:bg-black/10 group relative';

const isProgressPhase = computed(
  () => galleryPhase.value === 'uploading' || galleryPhase.value === 'processing',
);

const galleryIsFull = computed(() => uploadedFiles.value.length >= MAX_GALLERY);

const showPending = computed(
  () =>
    galleryPhase.value === 'idle' &&
    pendingFiles.value.length > 0 &&
    !galleryIsFull.value,
);

const totalSelected = computed(
  () => uploadedFiles.value.length + pendingFiles.value.length,
);

const isOverLimit = computed(() => totalSelected.value > MAX_GALLERY);

const showOverLimitWarning = computed(
  () => isOverLimit.value && !overLimitDismissed.value,
);

const showTopNotice = computed(
  () => showOverLimitWarning.value || showApprovalNotice.value,
);

const topNoticeTitle = computed(() => {
  if (showOverLimitWarning.value) {
    return t('shops.merch.listing.gallery.overLimitWarning');
  }
  return t('shops.merch.listing.gallery.approvalNotice');
});

const topNoticeOpen = computed({
  get: () => showTopNotice.value,
  set: (open) => {
    if (!open) {
      if (showOverLimitWarning.value) overLimitDismissed.value = true;
      showApprovalNotice.value = false;
    }
  },
});

watch(isOverLimit, (over) => {
  if (!over) overLimitDismissed.value = false;
});

/** Hide dropzone once gallery already has 6 uploaded media. */
const showUploader = computed(
  () =>
    !isProgressPhase.value &&
    !showPending.value &&
    !galleryIsFull.value,
);

const successToastTitle = computed(() => {
  const count = lastUploadCount.value;
  if (count <= 1) {
    return t('shops.merch.listing.gallery.uploadSuccessOne', { count: count || 1 });
  }
  return t('shops.merch.listing.gallery.uploadSuccess', { count });
});

function nextGalleryId() {
  galleryIdSeq += 1;
  return `merch-gallery-${Date.now()}-${galleryIdSeq}`;
}

function isBlobUrl(url) {
  return typeof url === 'string' && url.startsWith('blob:');
}

function revokeIfBlobUrl(url) {
  if (isBlobUrl(url)) URL.revokeObjectURL(url);
}

function mapPayloads(payloads) {
  return (payloads || []).map((payload) => ({
    id: nextGalleryId(),
    file: payload.file,
    objectUrl: payload.objectUrl,
    name: payload.file?.name || t('shops.merch.listing.gallery.defaultImageName'),
  }));
}

function syncEngineUploaded() {
  props.engine.setState(
    'galleryUploaded',
    uploadedFiles.value.map((item) => ({
      id: item.id,
      name: item.name,
      objectUrl: item.objectUrl,
    })),
  );
}

function stopProgressSimulation() {
  if (progressTimer != null) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

function clearToastTimer() {
  if (toastTimer != null) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
}

function openSuccessToast() {
  showSuccessToast.value = true;
  showApprovalNotice.value = true;
  clearToastTimer();
  toastTimer = setTimeout(() => {
    showSuccessToast.value = false;
  }, 4000);
}

function onFilesSelected(payloads) {
  if (!payloads?.length || galleryIsFull.value) return;
  pendingFiles.value = [...pendingFiles.value, ...mapPayloads(payloads)];
  galleryPhase.value = 'idle';
}

function addPending(payloads) {
  if (!payloads?.length || galleryIsFull.value) return;
  pendingFiles.value = [...pendingFiles.value, ...mapPayloads(payloads)];
}

function removePending(id) {
  const item = pendingFiles.value.find((f) => f.id === id);
  revokeIfBlobUrl(item?.objectUrl);
  pendingFiles.value = pendingFiles.value.filter((f) => f.id !== id);
  if (!pendingFiles.value.length && uploadedFiles.value.length) {
    galleryPhase.value = 'ready';
  }
}

function removeUploaded(id) {
  const item = uploadedFiles.value.find((f) => f.id === id);
  revokeIfBlobUrl(item?.objectUrl);
  uploadedFiles.value = uploadedFiles.value.filter((f) => f.id !== id);
  syncEngineUploaded();
  if (!uploadedFiles.value.length && !pendingFiles.value.length) {
    galleryPhase.value = 'idle';
  }
}

function reorderUploaded({ from, to }) {
  if (from < 0 || to < 0 || from === to) return;
  const next = [...uploadedFiles.value];
  const [moved] = next.splice(from, 1);
  if (!moved) return;
  next.splice(to, 0, moved);
  uploadedFiles.value = next;
  syncEngineUploaded();
}

function startGalleryUpload() {
  if (!pendingFiles.value.length || isOverLimit.value) return;
  stopProgressSimulation();
  uploadProgress.value = 0;
  galleryPhase.value = 'uploading';

  progressTimer = setInterval(() => {
    if (galleryPhase.value !== 'uploading') return;
    const next = uploadProgress.value + Math.random() * 8 + 2;
    if (next >= 100) {
      uploadProgress.value = 100;
      stopProgressSimulation();
      galleryPhase.value = 'processing';
      startProcessingProgress();
    } else {
      uploadProgress.value = next;
    }
  }, 180);
}

function startProcessingProgress() {
  stopProgressSimulation();
  uploadProgress.value = 0;
  progressTimer = setInterval(() => {
    const next = uploadProgress.value + Math.random() * 10 + 3;
    if (next >= 100) {
      uploadProgress.value = 100;
      stopProgressSimulation();
      const batch = [...pendingFiles.value];
      lastUploadCount.value = batch.length;
      uploadedFiles.value = [...uploadedFiles.value, ...batch].slice(0, MAX_GALLERY);
      pendingFiles.value = [];
      galleryPhase.value = 'ready';
      syncEngineUploaded();
      openSuccessToast();
      return;
    }
    uploadProgress.value = next;
  }, 160);
}

function cancelUploadProgress() {
  stopProgressSimulation();
  uploadProgress.value = 0;
  if (uploadedFiles.value.length) {
    galleryPhase.value = 'ready';
  } else if (pendingFiles.value.length) {
    galleryPhase.value = 'idle';
  } else {
    galleryPhase.value = 'idle';
  }
}

function hydrateFromEngine() {
  const saved = props.engine.state?.galleryUploaded;
  if (!Array.isArray(saved) || !saved.length) return;
  uploadedFiles.value = saved.map((item) => ({
    id: item.id || nextGalleryId(),
    name: item.name || t('shops.merch.listing.gallery.defaultImageName'),
    objectUrl: item.objectUrl || item.dataUrl || '',
    file: null,
  }));
  if (uploadedFiles.value.length) {
    galleryPhase.value = 'ready';
  }
}

watch(
  () => props.engine.state?.galleryUploaded,
  () => {
    if (!uploadedFiles.value.length) hydrateFromEngine();
  },
  { immediate: true },
);

/** At 6 uploaded, drop any leftover pending picks so the uploader stays hidden. */
watch(galleryIsFull, (full) => {
  if (!full || !pendingFiles.value.length) return;
  for (const item of pendingFiles.value) revokeIfBlobUrl(item.objectUrl);
  pendingFiles.value = [];
});

onBeforeUnmount(() => {
  stopProgressSimulation();
  clearToastTimer();
  // Keep uploaded blob URLs alive — they stay in engine while the listing popup is open.
  for (const item of pendingFiles.value) revokeIfBlobUrl(item.objectUrl);
});
</script>
