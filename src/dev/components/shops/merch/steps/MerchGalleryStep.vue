<template>
  <div
    data-component="merch-gallery-step"
    class="relative flex w-full flex-col gap-6"
  >
    <!-- Flush top notices — approval + over-limit can stack -->
    <div
      v-if="showTopNotice"
      class="absolute left-0 right-0 top-0 z-20 -mx-6 -mt-4 flex flex-col"
    >
      <NotificationCard
        v-if="showApprovalNotice"
        v-model="approvalNoticeOpen"
        variant="notice"
        theme="merchGalleryNotice"
        :title="t('shops.merch.listing.gallery.approvalNotice')"
        :icon="limitWarningIconUrl"
        closable
      />
      <NotificationCard
        v-if="showOverLimitWarning"
        v-model="overLimitNoticeOpen"
        variant="alert"
        theme="merchGalleryAlert"
        :title="t('shops.merch.listing.gallery.overLimitWarning')"
        :icon="limitWarningIconUrl"
        closable
      />
    </div>

    <ul
      class="flex list-disc flex-col gap-1 pl-5 marker:text-[#344054]"
      :class="topNoticePadClass"
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';
import MediaGalleryPendingList from '@/components/media/uploader/parts/MediaGalleryPendingList.vue';
import MediaUploadProgressState from '@/components/media/uploader/parts/MediaUploadProgressState.vue';
import MerchGalleryMediaGrid from '@/dev/components/shops/merch/MerchGalleryMediaGrid.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { useMediaInteractions } from '@/composables/useMediaInteractions.js';
import { fileToDataUrl, isBlobUrl, revokeIfBlobUrl } from '@/utils/fileToDataUrl.js';

const MAX_GALLERY = 6;
const SCOPE_ID = 'merchListingGallery';

const props = defineProps({
  /** createStepStateEngine instance for this merch listing flow */
  engine: { type: Object, required: true },
});

const { t } = useI18n();
const { url: galleryEmptyIconUrl } = useAssetUrl('mediaUploader.icon.galleryEmpty');
const { url: gallerySuccessTickUrl } = useAssetUrl('mediaUploader.icon.gallerySuccessTick');
const { url: limitWarningIconUrl } = useAssetUrl('shops.merch.icon.galleryLimitWarning');

const {
  isVisible,
  setVisible,
  fieldConfig,
  registerField,
  changeField,
  clear: clearInteractions,
} = useMediaInteractions(SCOPE_ID);

const pendingFiles = ref([]);
const uploadedFiles = ref([]);
const galleryPhase = ref('idle');
const uploadProgress = ref(0);
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

/** interactionsEngine visibility — over-limit card */
const showOverLimitWarning = computed(
  () => isVisible('overLimitWarning') && !overLimitDismissed.value,
);

/** interactionsEngine visibility — post-upload approval notice */
const showApprovalNotice = computed(() => isVisible('approvalNotice'));

/** interactionsEngine visibility — upload success toast */
const showSuccessToast = computed({
  get: () => isVisible('successToast'),
  set: (open) => setVisible('successToast', !!open),
});

const showTopNotice = computed(
  () => showOverLimitWarning.value || showApprovalNotice.value,
);

/** One card ≈ 4rem; two stacked ≈ 8rem — keep help list clear of banners. */
const topNoticePadClass = computed(() => {
  const count =
    (showApprovalNotice.value ? 1 : 0) + (showOverLimitWarning.value ? 1 : 0);
  if (count >= 2) return 'pt-32';
  if (count === 1) return 'pt-16';
  return '';
});

const approvalNoticeOpen = computed({
  get: () => showApprovalNotice.value,
  set: (open) => {
    if (!open) setVisible('approvalNotice', false);
  },
});

const overLimitNoticeOpen = computed({
  get: () => showOverLimitWarning.value,
  set: (open) => {
    if (!open) {
      overLimitDismissed.value = true;
      setVisible('overLimitWarning', false);
    }
  },
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

const galleryTotalFieldConfig = computed(() =>
  fieldConfig('galleryTotal', {
    validation: {
      required: false,
      rules: [
        {
          type: 'maxNum',
          param: MAX_GALLERY,
          message: t('shops.merch.listing.gallery.overLimitWarning'),
        },
      ],
    },
    validateOnInput: true,
    validateOnMount: false,
    events: {
      input: {
        onInvalid: [{ type: 'showElement', elementKey: `${SCOPE_ID}_overLimitWarning` }],
        onValid: [{ type: 'hideElement', elementKey: `${SCOPE_ID}_overLimitWarning` }],
      },
    },
  }),
);

function nextGalleryId() {
  galleryIdSeq += 1;
  return `merch-gallery-${Date.now()}-${galleryIdSeq}`;
}

function mapPayloads(payloads) {
  return (payloads || []).map((payload) => ({
    id: nextGalleryId(),
    file: payload.file,
    objectUrl: payload.objectUrl,
    name: payload.file?.name || t('shops.merch.listing.gallery.defaultImageName'),
  }));
}

async function syncEngineUploaded() {
  const items = await Promise.all(
    uploadedFiles.value.map(async (item) => {
      let dataUrl = item.dataUrl || '';
      if (!dataUrl && item.file instanceof File) {
        try {
          dataUrl = await fileToDataUrl(item.file);
          item.dataUrl = dataUrl;
        } catch {
          /* keep blob preview */
        }
      }
      if (!dataUrl && item.objectUrl && !isBlobUrl(item.objectUrl)) {
        dataUrl = item.objectUrl;
      }
      return {
        id: item.id,
        name: item.name,
        objectUrl: dataUrl || item.objectUrl || '',
        dataUrl: dataUrl || '',
      };
    }),
  );
  props.engine.setState('galleryUploaded', items);
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
  setVisible('successToast', true);
  setVisible('approvalNotice', true);
  clearToastTimer();
  toastTimer = setTimeout(() => {
    setVisible('successToast', false);
  }, 4000);
}

function syncGalleryTotalToEngine() {
  changeField(galleryTotalFieldConfig.value, totalSelected.value);
  if (!isOverLimit.value) {
    overLimitDismissed.value = false;
  } else if (overLimitDismissed.value) {
    // Keep dismissed until count drops back under the limit.
    setVisible('overLimitWarning', false);
  }
}

function onFilesSelected(payloads) {
  if (!payloads?.length || galleryIsFull.value) return;
  pendingFiles.value = [...pendingFiles.value, ...mapPayloads(payloads)];
  galleryPhase.value = 'idle';
  syncGalleryTotalToEngine();
}

function addPending(payloads) {
  if (!payloads?.length || galleryIsFull.value) return;
  pendingFiles.value = [...pendingFiles.value, ...mapPayloads(payloads)];
  syncGalleryTotalToEngine();
}

function removePending(id) {
  const item = pendingFiles.value.find((f) => f.id === id);
  revokeIfBlobUrl(item?.objectUrl);
  pendingFiles.value = pendingFiles.value.filter((f) => f.id !== id);
  if (!pendingFiles.value.length && uploadedFiles.value.length) {
    galleryPhase.value = 'ready';
  }
  syncGalleryTotalToEngine();
}

function removeUploaded(id) {
  const item = uploadedFiles.value.find((f) => f.id === id);
  revokeIfBlobUrl(item?.objectUrl);
  uploadedFiles.value = uploadedFiles.value.filter((f) => f.id !== id);
  syncEngineUploaded();
  if (!uploadedFiles.value.length && !pendingFiles.value.length) {
    galleryPhase.value = 'idle';
  }
  syncGalleryTotalToEngine();
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
  uploadedFiles.value = saved
    .map((item) => {
      const src = item.dataUrl || item.objectUrl || '';
      if (!src) return null;
      return {
        id: item.id || nextGalleryId(),
        name: item.name || t('shops.merch.listing.gallery.defaultImageName'),
        objectUrl: src,
        dataUrl: item.dataUrl || (!isBlobUrl(src) ? src : ''),
        file: null,
      };
    })
    .filter(Boolean);
  if (uploadedFiles.value.length) {
    galleryPhase.value = 'ready';
  }
}

watch(
  () => props.engine.state?.galleryUploaded,
  (saved) => {
    if (!Array.isArray(saved)) return;
    const localHasSrc = uploadedFiles.value.some((f) => Boolean(f?.objectUrl || f?.dataUrl));
    const savedHasSrc = saved.some(
      (item) => Boolean(item?.dataUrl || item?.objectUrl),
    );
    // Re-hydrate on edit reopen, or when IndexedDB restores media into empty slots.
    if (
      !uploadedFiles.value.length
      || uploadedFiles.value.length < saved.length
      || (savedHasSrc && !localHasSrc)
    ) {
      hydrateFromEngine();
    }
  },
  { immediate: true, deep: true },
);

/** At 6 uploaded, drop any leftover pending picks so the uploader stays hidden. */
watch(galleryIsFull, (full) => {
  if (!full || !pendingFiles.value.length) return;
  for (const item of pendingFiles.value) revokeIfBlobUrl(item.objectUrl);
  pendingFiles.value = [];
  syncGalleryTotalToEngine();
});

watch(totalSelected, () => {
  syncGalleryTotalToEngine();
});

onMounted(() => {
  registerField(galleryTotalFieldConfig.value, totalSelected.value);
  syncGalleryTotalToEngine();
});

onBeforeUnmount(() => {
  stopProgressSimulation();
  clearToastTimer();
  clearInteractions();
  // Keep uploaded blob URLs alive — they stay in engine while the listing popup is open.
  for (const item of pendingFiles.value) revokeIfBlobUrl(item.objectUrl);
});
</script>
