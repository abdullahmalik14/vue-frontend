<template>
  <BasePopup
    :modelValue="modelValue"
    :popup-config="popupConfig"
    @update:modelValue="onPopupModelUpdate"
  >
    <div
      data-component="upload-media-popup"
      data-upload-media-popup
      class="relative w-full h-[100dvh] max-h-[100dvh] min-h-0 flex flex-col overflow-hidden bg-[#F9FAFBE5] backdrop-blur-[30px] shadow-[0px_0px_10px_0px_#00000040] md:w-[55.9375rem] dark:bg-cosmo-shell/90"
    >
      <div class="absolute inset-0 w-full h-full backdrop-blur-[30px] pointer-events-none z-[-1]"></div>

      <div
        class="relative z-[1] flex flex-col h-full pb-6 min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        :class="[
          isWizardStep ? ' overflow-y-auto' : ' px-2 overflow-hidden md:px-6 md:overflow-y-auto',
        ]"
      >
        <!-- Header (always padded) -->
        <div
          class="w-full flex justify-between items-center shrink-0 py-4 px-4"
          
        >
          <Heading
            :text="popupTitle"
            tag="h2"
            theme="custom"
            no-wrap
            add-class="text-lg font-medium text-text-quaternary dark:text-text-badge-dark"
          />

          <button
            type="button"
            data-action="close-upload-media"
            class="cursor-pointer p-1 hover:opacity-80"
            :aria-label="t('mediaUploader.uploadPopup.closeAlt')"
            @click="requestClose"
          >
            <img
              v-if="closeIconUrl"
              :src="closeIconUrl"
              :alt="t('mediaUploader.uploadPopup.closeAlt')"
              class="w-4 h-4 [filter:brightness(0)_saturate(100%)_invert(68%)_sepia(8%)_saturate(456%)_hue-rotate(182deg)_brightness(92%)_contrast(87%)]"
            />
          </button>
        </div>

        <!-- Wizard steps — full width, no horizontal parent padding on the 5 tabs -->
        <MediaUploader
          v-if="isWizardStep"
          ref="mediaUploaderRef"
          embedded
          class="flex-1 min-h-0 w-full"
          @back="backFromWizard"
        />

        <template v-else>
          <div class="flex flex-col flex-1 min-h-0 gap-2 md:gap-6">
          <!-- Media type tabs -->
          <div class="shrink-0 w-full">
            <MediaUploadTypeTabs
              :tabs="mediaTypeTabs"
              :engine="engine"
              :before-tab-change="beforeTabChange"
            />
          </div>

          <div
            class="flex flex-col  md:gap-4 gap-2 flex-1 min-h-0 overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            :class="showPrimaryNext ? 'pb-10' : ''"
          >
            <!-- Uploading / Processing -->
            <template v-if="showUploadProgress">
              <MediaUploadProgressState
                :progress="uploadProgress"
                :phase="uploadPhase"
                :compact="isGalleryTab"
                @cancel="cancelUploadProgress"
              />
              <!-- Gallery Figma: dashed empty box stays under compact progress -->
              <div
                v-if="isGalleryTab"
                class="h-[450px] w-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-handle-light bg-transparent dark:border-panel-dark-border"
              >
                <img
                  v-if="galleryEmptyIconUrl"
                  :src="galleryEmptyIconUrl"
                  :alt="t('mediaUploader.uploadPopup.galleryEmpty.iconAlt')"
                  class="w-14 h-12 object-contain"
                />
                <Paragraph
                  :text="t('mediaUploader.uploadPopup.galleryEmpty.message')"
                  theme="custom"
                  no-wrap
                  add-class="text-sm font-normal text-center text-text-quaternary dark:text-text-badge-dark"
                />
              </div>
            </template>

            <!-- Gallery pending: file list + dashed empty gallery below (exact design) -->
            <template v-else-if="showGalleryPending">
              <MediaGalleryPendingList
                :files="galleryPendingFiles"
                @remove="removeGalleryPending"
                @add-files="addGalleryPending"
                @upload="startGalleryUpload"
              />
              <div
                class="h-[450px] w-full flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-handle-light bg-transparent dark:border-panel-dark-border"
              >
                <img
                  v-if="galleryEmptyIconUrl"
                  :src="galleryEmptyIconUrl"
                  :alt="t('mediaUploader.uploadPopup.galleryEmpty.iconAlt')"
                  class="w-14 h-12 object-contain"
                />
                <Paragraph
                  :text="t('mediaUploader.uploadPopup.galleryEmpty.message')"
                  theme="custom"
                  no-wrap
                  add-class="text-gray-500 text-xs font-normal text-center dark:text-text-badge-dark"
                />
              </div>
            </template>

            <!-- Ready preview (video or single image) -->
            <MediaUploadedVideoPreview
              v-else-if="showMediaReady"
              :src="mediaPreviewUrl"
              :media-kind="previewMediaKind"
              :file-name="mediaFileName"
              @delete="deleteUploadedMedia"
            />

            <!-- Gallery ready: dropzone + uploaded grid -->
            <template v-else-if="showGalleryReady">
              <ThumbnailUploader
                :title="t('mediaUploader.thumbnailUploader.title')"
                :subtitle="uploadCopy.subtitle"
                :file-info="uploadCopy.fileInfo"
                :accept="uploadCopy.accept"
                :use-media-store="false"
                :show-selected-name="false"
                icon-variant="badge"
                full-area-click
                multiple
                :wrapper-class="uploadWrapperClass"
                inner-wrapper-class="gap-1 w-full flex flex-col justify-center items-center self-stretch border-2 border-dashed border-transparent"
                title-class="text-sm leading-5 text-center font-normal text-text-quaternary dark:text-text-badge-dark"
                title-highlight-class="font-semibold text-text-primary dark:text-timberwolf"
                file-info-class="text-text-quaternary text-xs leading-[1.125rem] text-center mb-0 dark:text-text-badge-dark"
                @files-selected="onGalleryFilesSelected"
              />
              <MediaGalleryUploadedGrid
                :files="galleryUploadedFiles"
                @remove="removeGalleryUploaded"
              />
            </template>

            <!-- Default dropzone (video / single / gallery idle / audio) -->
            <template v-else>
              <ThumbnailUploader
                :key="activeTab"
                :title="t('mediaUploader.thumbnailUploader.title')"
                :subtitle="uploadCopy.subtitle"
                :file-info="uploadCopy.fileInfo"
                :accept="uploadCopy.accept"
                :use-media-store="false"
                :show-selected-name="activeTab !== 'imageGallery'"
                icon-variant="badge"
                full-area-click
                :multiple="activeTab === 'imageGallery'"
                :wrapper-class="uploadWrapperClass"
                inner-wrapper-class="gap-1 w-full flex flex-col justify-center items-center self-stretch border-2 border-dashed border-transparent"
                title-class="text-sm leading-5 text-center font-normal text-text-quaternary dark:text-text-badge-dark"
                title-highlight-class="font-semibold text-text-primary dark:text-timberwolf"
                file-info-class="text-text-quaternary text-xs leading-[1.125rem] text-center mb-0 dark:text-text-badge-dark"
                @file-selected="onFileSelected"
                @files-selected="onGalleryFilesSelected"
              />

              <!-- Image Gallery empty state -->
              <div
                v-if="activeTab === 'imageGallery'"
                class="h-[450px] w-full flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-handle-light bg-transparent dark:border-panel-dark-border"
              >
                <img
                  v-if="galleryEmptyIconUrl"
                  :src="galleryEmptyIconUrl"
                  :alt="t('mediaUploader.uploadPopup.galleryEmpty.iconAlt')"
                  class="w-14 h-12 object-contain"
                />
                <Paragraph
                  :text="t('mediaUploader.uploadPopup.galleryEmpty.message')"
                  theme="custom"
                  no-wrap
                  add-class="text-sm font-normal text-center text-text-quaternary dark:text-text-badge-dark"
                />
              </div>
            </template>
          </div>
          </div>
        </template>
      </div>

      <!-- Next / Submit — single flush bottom-right control -->
      <div
        v-if="showPrimaryNext"
        class="absolute bottom-0 inset-x-0 z-30 flex justify-end "
      >
        <DashboardPrimaryButton
          :text="primaryNextLabel"
          variant="polygonLeft"
          :rightIcon="nextIconUrl"
          :rightIconClass="primaryNextIconClass"
          :btnBg="primaryBtnBg"
          btnHoverBg="black"
          :btnText="primaryBtnText"
          btnHoverText="#07f468"
          :disabled="isSubmitDisabled"
          :customClass="isSubmitDisabled ? 'disabled:!opacity-100' : ''"
          type="button"
          @click="onPrimaryNext"
        />
      </div>

      <!-- Leave confirm — centered inside Upload Media panel -->
      <CancelUploadPopup
        v-model="leaveConfirmOpen"
        mode="leave"
        nested
        contain
        :title="t('mediaUploader.uploadPopup.leaveConfirm.title')"
        :message="t('mediaUploader.uploadPopup.leaveConfirm.description')"
        :cancel-label="t('mediaUploader.uploadPopup.leaveConfirm.saveDraft')"
        :confirm-label="t('mediaUploader.uploadPopup.leaveConfirm.leave')"
        @save-draft="onSaveDraft"
        @delete="onLeaveWithoutSaving"
      />

      <!-- Tab change confirm — discard current media progress -->
      <CancelUploadPopup
        v-model="tabChangeConfirmOpen"
        mode="tabChange"
        nested
        contain
        :message="t('mediaUploader.uploadPopup.tabChangeConfirm.message')"
        :cancel-label="t('mediaUploader.uploadPopup.tabChangeConfirm.back')"
        :confirm-label="t('mediaUploader.uploadPopup.tabChangeConfirm.continue')"
        @delete="onTabChangeContinue"
      />

      <!-- Success toast (exact NotificationCard pattern from Preview Settings) -->
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
              <div class="w-10 h-10 flex justify-center items-center rounded-lg bg-mediaUi-mintSoft overflow-hidden">
                <img
                  v-if="successTickUrl"
                  :src="successTickUrl"
                  :alt="t('mediaUploader.preview.uploadSuccess')"
                  class="w-7 h-7 object-contain"
                />
              </div>
            </template>
          </NotificationCard>
        </div>
      </Teleport>
    </div>
  </BasePopup>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, toRaw, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePopup from '@/components/ui/popups/BasePopup.vue';
import CancelUploadPopup from '@/components/ui/popups/CancelUploadPopup.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import MediaUploadTypeTabs from '@/components/media/uploader/parts/MediaUploadTypeTabs.vue';
import MediaUploadProgressState from '@/components/media/uploader/parts/MediaUploadProgressState.vue';
import MediaUploadedVideoPreview from '@/components/media/uploader/parts/MediaUploadedVideoPreview.vue';
import MediaGalleryPendingList from '@/components/media/uploader/parts/MediaGalleryPendingList.vue';
import MediaGalleryUploadedGrid from '@/components/media/uploader/parts/MediaGalleryUploadedGrid.vue';
import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';
import MediaUploader from '@/components/media/uploader/MediaUploader.vue';
import { createStepStateEngine, toPersistableState } from '@/utils/stateEngine.js';
import { fileToDataUrl, fileMeta, isBlobUrl, revokeIfBlobUrl } from '@/utils/fileToDataUrl.js';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';

const WIZARD_MEDIA_TABS = new Set(['video', 'singleImage', 'audio']);
const PROGRESS_MEDIA_TABS = new Set(['video', 'singleImage', 'imageGallery', 'audio']);

let galleryIdSeq = 0;
function nextGalleryId() {
  galleryIdSeq += 1;
  return `gallery-${Date.now()}-${galleryIdSeq}`;
}

function formatVideoDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '';
  const total = Math.round(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function readVideoDuration(file) {
  return new Promise((resolve) => {
    if (!(file instanceof File) || !String(file.type || '').startsWith('video/')) {
      resolve('');
      return;
    }
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    const finish = (value) => {
      URL.revokeObjectURL(url);
      resolve(value);
    };
    video.onloadedmetadata = () => finish(formatVideoDuration(video.duration));
    video.onerror = () => finish('');
    video.src = url;
  });
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:modelValue',
  'file-selected',
  'upload-cancel',
  'upload-complete',
  'save-draft',
  'submitted',
]);

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const { url: closeIconUrl } = useAssetUrl('mediaUploader.icon.close');
const { url: videoIconUrl } = useAssetUrl('mediaUploader.icon.tabVideo');
const { url: imageIconUrl } = useAssetUrl('mediaUploader.icon.tabSingleImage');
const { url: galleryIconUrl } = useAssetUrl('mediaUploader.icon.tabGallery');
const { url: audioIconUrl } = useAssetUrl('mediaUploader.icon.tabAudio');
const { url: galleryEmptyIconUrl } = useAssetUrl('mediaUploader.icon.galleryEmpty');
const { url: nextIconUrl } = useAssetUrl('mediaUploader.icon.next');
const { url: successTickUrl } = useAssetUrl('mediaUploader.icon.gallerySuccessTick');

const popupConfig = {
  actionType: 'slideIn',
  from: 'right',
  shouldShowOverlay: false,
  shouldCloseOnOutsideClick: true,
  shouldLockBodyScroll: true,
  shouldCloseOnEscape: true,
  scrollable: false,
  containerClass: '[&>div]:h-full [&>div]:min-h-0',
  width: { default: '100%', '>768': '55.9375rem' },
  height: { default: '100%' },
};

/** step 0 = type select / upload / ready; step 1 = MediaUploader wizard */
const engine = createStepStateEngine({
  flowId: 'upload-media-popup',
  urlSync: 'none',
  persist: true,
  initialStep: 0,
  defaults: {
    activeTab: 'video',
    uploadPhase: 'idle',
    galleryUploaded: [],
    galleryPending: [],
    wizardStep: 1,
    wizardSubstep: 'chooseScreenshot',
    form: {},
  },
});

const uploadProgress = ref(0);
const selectedPayload = ref(null);
const galleryPendingFiles = ref([]);
const galleryUploadedFiles = ref([]);
const lastGalleryUploadCount = ref(0);
const showSuccessToast = ref(false);
const leaveConfirmOpen = ref(false);
const tabChangeConfirmOpen = ref(false);
const pendingTabId = ref(null);
const mediaUploaderRef = ref(null);
let progressTimer = null;
let toastTimer = null;
let sessionReady = false;
let isRestoringSession = false;
let skipLeaveConfirm = false;
const isSubmitting = ref(false);

function applyGalleryFromSnapshot(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      const dataUrl = item.dataUrl || item.objectUrl || '';
      if (!dataUrl || isBlobUrl(dataUrl)) return null;
      return {
        id: item.id || nextGalleryId(),
        name: item.name || t('mediaUploader.uploadPopup.gallery.defaultImageName'),
        file: item.file || { name: item.name, size: item.size, type: item.type },
        objectUrl: dataUrl,
        dataUrl,
      };
    })
    .filter(Boolean);
}

async function enterEditSession() {
  isRestoringSession = true;
  try {
    const mediaType = uploaderStore.form.mediaType || 'video';
    await engine.forceStep(1, { reason: 'edit-library-item' });
    engine.setState('activeTab', mediaType, { silent: true, reason: 'edit-library-item' });
    engine.setState('uploadPhase', 'ready', { silent: true, reason: 'edit-library-item' });
    galleryUploadedFiles.value = applyGalleryFromSnapshot(uploaderStore.form.galleryUploaded);
    galleryPendingFiles.value = [];
    engine.setState('galleryUploaded', galleryUploadedFiles.value, { silent: true, reason: 'edit-library-item' });
    engine.setState('galleryPending', [], { silent: true, reason: 'edit-library-item' });
    engine.setState('wizardStep', uploaderStore.step, { silent: true, reason: 'edit-library-item' });
    engine.setState('wizardSubstep', uploaderStore.substep, { silent: true, reason: 'edit-library-item' });
    selectedPayload.value = uploaderStore.form.mediaUrl
      ? { objectUrl: uploaderStore.form.mediaUrl, mediaType }
      : null;
  } finally {
    isRestoringSession = false;
    syncFormIntoEngine();
  }
}

function syncFormIntoEngine() {
  if (isRestoringSession) return;
  engine.setState('wizardStep', uploaderStore.step, { silent: true, reason: 'form-sync' });
  engine.setState('wizardSubstep', uploaderStore.substep, { silent: true, reason: 'form-sync' });
  const persistedForm = toPersistableState(toRaw(uploaderStore.form)) || {};
  delete persistedForm.galleryUploaded;
  delete persistedForm.galleryPending;
  engine.setState('form', persistedForm, {
    silent: true,
    reason: 'form-sync',
  });
}

function flushSessionPersist() {
  engine.flushPersist?.();
}

onMounted(() => {
  engine.initialize({ fromUrl: false });
  if (props.modelValue) {
    if (uploaderStore.editingItemId) {
      void enterEditSession();
    } else {
      void resetWizardSession();
    }
  } else {
    // Closed on mount: drop any leftover engine draft so a later open is clean.
    void resetWizardSession();
  }
  sessionReady = true;
  window.addEventListener('pagehide', flushSessionPersist);
});

onUnmounted(() => {
  stopProgressSimulation();
  clearToastTimer();
  void resetWizardSession();
  window.removeEventListener('pagehide', flushSessionPersist);
});

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      isSubmitting.value = false;
      if (uploaderStore.editingItemId) {
        void enterEditSession();
      } else {
        // New upload: never restore a previous draft into the wizard.
        void resetWizardSession();
      }
      showSuccessToast.value = false;
      leaveConfirmOpen.value = false;
      tabChangeConfirmOpen.value = false;
      pendingTabId.value = null;
      return;
    }
    void resetWizardSession();
    showSuccessToast.value = false;
    leaveConfirmOpen.value = false;
    tabChangeConfirmOpen.value = false;
    pendingTabId.value = null;
    clearToastTimer();
  },
);

watch(
  () => engine.state.activeTab,
  () => {
    if (!sessionReady || isRestoringSession) return;
    if (engine.step === 0) {
      resetUploadProgress({ silent: true });
      clearGalleryFiles();
    }
  },
);

watch(
  () => [uploaderStore.step, uploaderStore.substep, uploaderStore.form],
  () => {
    syncFormIntoEngine();
  },
  { deep: true },
);

const activeTab = computed(() => engine.state.activeTab);
const uploadPhase = computed(() => engine.state.uploadPhase);
const isWizardStep = computed(() => engine.step === 1);
const popupTitle = computed(() => (
  uploaderStore.editingItemId
    ? t('mediaUploader.uploadPopup.editTitle')
    : t('mediaUploader.uploadPopup.title')
));
const supportsWizardUpload = computed(() => WIZARD_MEDIA_TABS.has(activeTab.value));
const isGalleryTab = computed(() => activeTab.value === 'imageGallery');

const showUploadProgress = computed(
  () =>
    !isWizardStep.value &&
    PROGRESS_MEDIA_TABS.has(activeTab.value) &&
    (uploadPhase.value === 'uploading' || uploadPhase.value === 'processing'),
);
const showMediaReady = computed(
  () =>
    !isWizardStep.value &&
    supportsWizardUpload.value &&
    uploadPhase.value === 'ready',
);
const showGalleryPending = computed(
  () =>
    !isWizardStep.value &&
    isGalleryTab.value &&
    uploadPhase.value === 'idle' &&
    galleryPendingFiles.value.length > 0,
);
const showGalleryReady = computed(
  () =>
    !isWizardStep.value &&
    isGalleryTab.value &&
    uploadPhase.value === 'ready' &&
    galleryUploadedFiles.value.length > 0,
);
const showPrimaryNext = computed(() => {
  if (showMediaReady.value || showGalleryReady.value) return true;
  if (isWizardStep.value && uploaderStore.step >= 1 && uploaderStore.step <= 5) return true;
  return false;
});

const primaryNextLabel = computed(() => {
  if (isWizardStep.value && uploaderStore.step === 5) {
    return t('mediaUploader.submit.submitButton');
  }
  return t('mediaUploader.shell.next');
});

const allTermsAccepted = computed(
  () =>
    Boolean(uploaderStore.form.termsCheckbox1) &&
    Boolean(uploaderStore.form.termsCheckbox2) &&
    Boolean(uploaderStore.form.termsCheckbox3) &&
    Boolean(uploaderStore.form.termsCheckbox4) &&
    Boolean(uploaderStore.form.termsCheckbox5),
);

const isSubmitDisabled = computed(
  () =>
    isWizardStep.value &&
    uploaderStore.step === 5 &&
    (!allTermsAccepted.value || isSubmitting.value),
);

const primaryBtnBg = computed(() => (isSubmitDisabled.value ? '#3440540D' : '#07f468'));
const primaryBtnText = computed(() => (isSubmitDisabled.value ? '#98A2B3' : 'black'));

const primaryNextIconClass = computed(() =>
  isSubmitDisabled.value
    ? 'w-5 h-5 pointer-events-none [filter:brightness(0)_saturate(100%)_invert(67%)_sepia(8%)_saturate(281%)_hue-rotate(182deg)_brightness(91%)_contrast(88%)]'
    : 'w-5 h-5 pointer-events-none transition-[filter] duration-200 brightness-0 group-hover/dpb:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]',
);

const successToastTitle = computed(() => {
  if (isGalleryTab.value && lastGalleryUploadCount.value > 0) {
    const count = lastGalleryUploadCount.value;
    return count === 1
      ? t('mediaUploader.uploadPopup.gallery.uploadSuccessOne', { count })
      : t('mediaUploader.uploadPopup.gallery.uploadSuccess', { count });
  }
  if (activeTab.value === 'audio' || uploaderStore.form.mediaType === 'audio') {
    return t('mediaUploader.preview.uploadSuccessAudio');
  }
  if (activeTab.value === 'singleImage' || uploaderStore.form.mediaType === 'singleImage') {
    return t('mediaUploader.preview.uploadSuccessImage');
  }
  return t('mediaUploader.preview.uploadSuccess');
});

const mediaPreviewUrl = computed(
  () => selectedPayload.value?.objectUrl || uploaderStore.form.mediaUrl || '',
);

const mediaFileName = computed(
  () =>
    selectedPayload.value?.file?.name ||
    uploaderStore.form.mediaFile?.name ||
    '',
);

const previewMediaKind = computed(() => {
  const type = activeTab.value || uploaderStore.form.mediaType;
  if (type === 'singleImage') return 'image';
  if (type === 'audio') return 'audio';
  return 'video';
});

const hasUnsavedProgress = computed(
  () =>
    isWizardStep.value ||
    uploadPhase.value === 'uploading' ||
    uploadPhase.value === 'processing' ||
    uploadPhase.value === 'ready' ||
    galleryPendingFiles.value.length > 0 ||
    galleryUploadedFiles.value.length > 0,
);

/** Progress that should warn before switching media-type tabs */
const hasTabSwitchProgress = computed(
  () =>
    uploadPhase.value !== 'idle' ||
    galleryPendingFiles.value.length > 0 ||
    galleryUploadedFiles.value.length > 0 ||
    Boolean(selectedPayload.value),
);

async function beforeTabChange(nextTabId) {
  if (!hasTabSwitchProgress.value) return true;
  pendingTabId.value = nextTabId;
  tabChangeConfirmOpen.value = true;
  return false;
}

function onTabChangeContinue() {
  const nextId = pendingTabId.value;
  tabChangeConfirmOpen.value = false;
  pendingTabId.value = null;
  if (!nextId) return;

  uploaderStore.updateFormField('mediaUrl', '');
  uploaderStore.updateFormField('mediaFile', null);
  uploaderStore.updateFormField('uploadedTrailerFile', null);
  uploaderStore.updateFormField('mediaType', '');
  uploaderStore.updateFormField('thumbnailUrl', '');
  uploaderStore.updateFormField('uploadedThumbnailFile', null);
  uploaderStore.updateFormField('previewTrailerUrl', '');
  uploaderStore.updateFormField('galleryUploaded', []);
  uploaderStore.updateFormField('galleryPending', []);
  showSuccessToast.value = false;
  clearToastTimer();

  engine.setState('activeTab', nextId, { reason: 'tab-change-confirmed' });
}

const mediaTypeTabs = computed(() => [
  {
    id: 'video',
    label: t('mediaUploader.uploadPopup.tabs.video'),
    icon: videoIconUrl.value,
  },
  {
    id: 'singleImage',
    label: t('mediaUploader.uploadPopup.tabs.singleImage'),
    icon: imageIconUrl.value,
  },
  {
    id: 'imageGallery',
    label: t('mediaUploader.uploadPopup.tabs.imageGallery'),
    icon: galleryIconUrl.value,
  },
  {
    id: 'audio',
    label: t('mediaUploader.uploadPopup.tabs.audio'),
    icon: audioIconUrl.value,
  },
]);

const uploadCopyByTab = computed(() => ({
  video: {
    subtitle: t('mediaUploader.uploadPopup.drop.video'),
    fileInfo: t('mediaUploader.uploadPopup.formats.video'),
    accept: 'video/mp4,video/avi,video/quicktime,video/x-matroska,video/x-ms-wmv,video/webm,video/ogg',
  },
  singleImage: {
    subtitle: t('mediaUploader.uploadPopup.drop.singleImage'),
    fileInfo: t('mediaUploader.uploadPopup.formats.singleImage'),
    accept: 'image/png,image/jpeg,image/jpg,image/gif,image/webp',
  },
  imageGallery: {
    subtitle: t('mediaUploader.uploadPopup.drop.imageGallery'),
    fileInfo: t('mediaUploader.uploadPopup.formats.imageGallery'),
    accept: 'image/png,image/jpeg,image/jpg,image/gif,image/webp',
  },
  audio: {
    subtitle: t('mediaUploader.uploadPopup.drop.audio'),
    fileInfo: t('mediaUploader.uploadPopup.formats.audio'),
    accept: 'audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/webm',
  },
}));

const uploadCopy = computed(
  () => uploadCopyByTab.value[activeTab.value] || uploadCopyByTab.value.video,
);

const uploadWrapperClass = computed(() => {
  const heightClass = activeTab.value === 'imageGallery'
    ? 'h-[126px]'
    : 'flex-1 min-h-0 h-full md:h-[450px] md:flex-none md:min-h-[450px]';
  return `cursor-pointer border-2 border-transparent bg-black/5 rounded-xl p-2 ${heightClass} flex flex-col items-center justify-center hover:border-dark-text hover:bg-black/10 group relative dark:hover:border-border-input-dark`;
});

function clearToastTimer() {
  if (toastTimer != null) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
}

function stopProgressSimulation() {
  if (progressTimer != null) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
}

function resetUploadProgress({ silent = false } = {}) {
  stopProgressSimulation();
  revokeIfBlobUrl(selectedPayload.value?.objectUrl);
  selectedPayload.value = null;
  uploadProgress.value = 0;
  engine.setState('uploadPhase', 'idle', {
    silent,
    reason: 'upload-reset',
  });
}

function clearGalleryFiles() {
  for (const item of galleryPendingFiles.value) {
    revokeIfBlobUrl(item.objectUrl);
  }
  for (const item of galleryUploadedFiles.value) {
    revokeIfBlobUrl(item.objectUrl);
  }
  galleryPendingFiles.value = [];
  galleryUploadedFiles.value = [];
  lastGalleryUploadCount.value = 0;
  if (!isRestoringSession) {
    engine.setState('galleryUploaded', [], { silent: true, reason: 'gallery-clear' });
    engine.setState('galleryPending', [], { silent: true, reason: 'gallery-clear' });
    uploaderStore.updateFormField('galleryUploaded', []);
    uploaderStore.updateFormField('galleryPending', []);
  }
}

function mapGalleryPayloads(payloads) {
  return payloads.map((payload) => ({
    id: nextGalleryId(),
    file: payload.file,
    objectUrl: payload.objectUrl,
    name: payload.file?.name || t('mediaUploader.uploadPopup.gallery.defaultImageName'),
  }));
}

function serializeGalleryItem(item) {
  return {
    id: item.id,
    name: item.name,
    dataUrl: item.dataUrl || (!isBlobUrl(item.objectUrl) ? item.objectUrl : ''),
    size: item.file?.size,
    type: item.file?.type,
  };
}

async function hydrateGalleryItemDataUrl(item) {
  let dataUrl = item.dataUrl;
  if (!dataUrl && item.file instanceof File) {
    try {
      dataUrl = await fileToDataUrl(item.file);
    } catch (error) {
      console.warn('[UploadMediaPopup] gallery data URL persist failed', error);
    }
  }
  if (!dataUrl) dataUrl = isBlobUrl(item.objectUrl) ? '' : (item.objectUrl || '');
  if (dataUrl && isBlobUrl(item.objectUrl) && dataUrl !== item.objectUrl) {
    revokeIfBlobUrl(item.objectUrl);
  }
  item.dataUrl = dataUrl;
  item.objectUrl = dataUrl || item.objectUrl;
  return item;
}

async function persistGalleryPending() {
  const next = [];
  for (const item of galleryPendingFiles.value) {
    await hydrateGalleryItemDataUrl(item);
    next.push(serializeGalleryItem(item));
  }
  engine.setState('galleryPending', next, { reason: 'gallery-pending' });
  uploaderStore.updateFormField('galleryPending', next);
}

function onGalleryFilesSelected(payloads) {
  if (!payloads?.length) return;
  emit('file-selected', { files: payloads, mediaType: 'imageGallery' });

  if (uploadPhase.value === 'ready' && galleryUploadedFiles.value.length > 0) {
    galleryPendingFiles.value = [...galleryPendingFiles.value, ...mapGalleryPayloads(payloads)];
    engine.setState('uploadPhase', 'idle', { reason: 'gallery-add-more' });
    persistGalleryPending();
    return;
  }

  galleryPendingFiles.value = [...galleryPendingFiles.value, ...mapGalleryPayloads(payloads)];
  persistGalleryPending();
}

function addGalleryPending(payloads) {
  if (!payloads?.length) return;
  galleryPendingFiles.value = [...galleryPendingFiles.value, ...mapGalleryPayloads(payloads)];
  persistGalleryPending();
}

function removeGalleryPending(id) {
  const item = galleryPendingFiles.value.find((f) => f.id === id);
  revokeIfBlobUrl(item?.objectUrl);
  galleryPendingFiles.value = galleryPendingFiles.value.filter((f) => f.id !== id);
  persistGalleryPending();
  if (!galleryPendingFiles.value.length && galleryUploadedFiles.value.length) {
    engine.setState('uploadPhase', 'ready', { reason: 'gallery-pending-cleared' });
  }
}

function removeGalleryUploaded(id) {
  const item = galleryUploadedFiles.value.find((f) => f.id === id);
  revokeIfBlobUrl(item?.objectUrl);
  galleryUploadedFiles.value = galleryUploadedFiles.value.filter((f) => f.id !== id);
  if (!galleryUploadedFiles.value.length) {
    engine.setState('uploadPhase', 'idle', { reason: 'gallery-cleared' });
    engine.setState('galleryUploaded', [], { silent: true, reason: 'gallery-cleared' });
    uploaderStore.updateFormField('galleryUploaded', []);
    uploaderStore.updateFormField('mediaType', '');
    uploaderStore.updateFormField('mediaUrl', '');
    uploaderStore.updateFormField('mediaFile', null);
  } else {
    persistGalleryToStore();
  }
}

async function persistGalleryToStore() {
  const items = [];
  for (const item of galleryUploadedFiles.value) {
    await hydrateGalleryItemDataUrl(item);
    items.push(serializeGalleryItem(item));
  }
  engine.setState('galleryUploaded', items, { reason: 'gallery-persist' });
  uploaderStore.updateFormField('galleryUploaded', items);
  uploaderStore.updateFormField('galleryPending', []);
  const first = items[0];
  uploaderStore.updateFormField('mediaType', 'imageGallery');
  uploaderStore.updateFormField('mediaUrl', first?.dataUrl || '');
  uploaderStore.updateFormField(
    'mediaFile',
    first ? { name: first.name, size: first.size, type: first.type } : null,
  );
  uploaderStore.updateFormField('thumbnailUrl', first?.dataUrl || '');
  uploaderStore.updateFormField('uploadedThumbnailFile', null);
}

function startGalleryUpload() {
  if (!galleryPendingFiles.value.length) return;
  startUploadProgress(galleryPendingFiles.value[0]);
}

async function persistMediaToStore(payload, mediaType) {
  if (mediaType === 'imageGallery') {
    const uploadedBatch = [...galleryPendingFiles.value];
    lastGalleryUploadCount.value = uploadedBatch.length;
    galleryUploadedFiles.value = [...galleryUploadedFiles.value, ...uploadedBatch];
    galleryPendingFiles.value = [];
    engine.setState('galleryPending', [], { silent: true, reason: 'gallery-uploaded' });
    uploaderStore.updateFormField('galleryPending', []);
    await persistGalleryToStore();
    return;
  }
  if (!payload) return;

  let dataUrl = isBlobUrl(payload.objectUrl) ? '' : (payload.objectUrl || '');
  if (payload.file instanceof File) {
    try {
      dataUrl = (await fileToDataUrl(payload.file)) || dataUrl;
    } catch (error) {
      console.warn('[UploadMediaPopup] persist media data URL failed', error);
    }
  }
  if (dataUrl && isBlobUrl(payload.objectUrl) && dataUrl !== payload.objectUrl) {
    revokeIfBlobUrl(payload.objectUrl);
  }
  if (selectedPayload.value) {
    selectedPayload.value = {
      ...payload,
      objectUrl: dataUrl || payload.objectUrl,
    };
  }

  uploaderStore.updateFormField('mediaType', mediaType);
  uploaderStore.updateFormField('mediaUrl', dataUrl || payload.objectUrl || '');
  uploaderStore.updateFormField('mediaFile', fileMeta(payload.file));
  if (mediaType === 'video') {
    const duration = await readVideoDuration(payload.file);
    uploaderStore.updateFormField('duration', duration);
  } else {
    uploaderStore.updateFormField('duration', '');
  }
  if (mediaType === 'singleImage') {
    uploaderStore.updateFormField('thumbnailUrl', dataUrl || payload.objectUrl || '');
    uploaderStore.updateFormField('uploadedThumbnailFile', null);
  } else {
    uploaderStore.updateFormField('thumbnailUrl', '');
    uploaderStore.updateFormField('uploadedThumbnailFile', null);
  }
}

function openSuccessToast() {
  showSuccessToast.value = true;
  clearToastTimer();
  toastTimer = setTimeout(() => {
    showSuccessToast.value = false;
  }, 4000);
}

function startUploadProgress(payload) {
  stopProgressSimulation();
  selectedPayload.value = payload;
  uploadProgress.value = 0;
  engine.setState('uploadPhase', 'uploading', { reason: 'file-selected' });

  progressTimer = setInterval(() => {
    if (engine.state.uploadPhase !== 'uploading') return;
    const next = uploadProgress.value + Math.random() * 8 + 2;
    if (next >= 100) {
      uploadProgress.value = 100;
      stopProgressSimulation();
      engine.setState('uploadPhase', 'processing', { reason: 'upload-done' });
      startProcessingProgress();
    } else {
      uploadProgress.value = next;
    }
  }, 180);
}

function startProcessingProgress() {
  stopProgressSimulation();
  uploadProgress.value = 0;
  const mediaType = activeTab.value;
  progressTimer = setInterval(() => {
    const next = uploadProgress.value + Math.random() * 10 + 3;
    if (next >= 100) {
      uploadProgress.value = 100;
      stopProgressSimulation();
      engine.setState('uploadPhase', 'ready', { reason: 'processing-done' });
      persistMediaToStore(selectedPayload.value, mediaType).then(() => {
        openSuccessToast();
        emit('upload-complete', {
          ...(mediaType === 'imageGallery'
            ? { files: galleryUploadedFiles.value, count: lastGalleryUploadCount.value }
            : selectedPayload.value),
          mediaType,
        });
      });
      return;
    }
    uploadProgress.value = next;
  }, 160);
}

function cancelUploadProgress() {
  const phase = engine.state.uploadPhase;
  const payload = selectedPayload.value;
  const mediaType = activeTab.value;
  resetUploadProgress();
  if (
    mediaType === 'imageGallery' &&
    !galleryPendingFiles.value.length &&
    galleryUploadedFiles.value.length
  ) {
    engine.setState('uploadPhase', 'ready', { reason: 'gallery-upload-cancelled' });
  }
  emit('upload-cancel', { mediaType, phase, payload });
}

function deleteUploadedMedia() {
  revokeIfBlobUrl(uploaderStore.form.mediaUrl);
  uploaderStore.updateFormField('mediaUrl', '');
  uploaderStore.updateFormField('mediaFile', null);
  uploaderStore.updateFormField('mediaType', '');
  uploaderStore.updateFormField('thumbnailUrl', '');
  uploaderStore.updateFormField('uploadedThumbnailFile', null);
  uploaderStore.updateFormField('previewTrailerUrl', '');
  uploaderStore.updateFormField('uploadedTrailerFile', null);
  uploaderStore.updateFormField('duration', '');
  resetUploadProgress();
}

async function goToWizard() {
  await engine.goToStep(1, { reason: 'next-click' });
  if (uploaderStore.step < 1 || uploaderStore.step > 5) {
    uploaderStore.setStep(1);
  }
}

async function backFromWizard() {
  await engine.forceStep(0, { reason: 'wizard-back' });
  if (isGalleryTab.value && galleryUploadedFiles.value.length) {
    engine.setState('uploadPhase', 'ready', { silent: true, reason: 'wizard-back' });
    return;
  }
  if (selectedPayload.value?.objectUrl || uploaderStore.form.mediaUrl) {
    engine.setState('uploadPhase', 'ready', { silent: true, reason: 'wizard-back' });
  }
}

async function onPrimaryNext() {
  if (showMediaReady.value || showGalleryReady.value) {
    await goToWizard();
    return;
  }
  if (isWizardStep.value && uploaderStore.step === 5) {
    if (!allTermsAccepted.value || isSubmitting.value) return;
    isSubmitting.value = true;
    skipLeaveConfirm = true;
    emit('submitted');
    emit('update:modelValue', false);
    void resetWizardSession();
    return;
  }
  if (isWizardStep.value && uploaderStore.step < 5) {
    uploaderStore.setStep(uploaderStore.step + 1);
  }
}

function onFileSelected(payload) {
  emit('file-selected', { ...payload, mediaType: activeTab.value });

  if (WIZARD_MEDIA_TABS.has(activeTab.value)) {
    startUploadProgress(payload);
  }
}

function onPopupModelUpdate(val) {
  if (val === false) {
    requestClose();
    return;
  }
  emit('update:modelValue', true);
}

function requestClose() {
  if (skipLeaveConfirm) {
    skipLeaveConfirm = false;
    emit('update:modelValue', false);
    return;
  }
  if (hasUnsavedProgress.value) {
    leaveConfirmOpen.value = true;
    return;
  }
  emit('update:modelValue', false);
}

function forceCloseUpload() {
  leaveConfirmOpen.value = false;
  tabChangeConfirmOpen.value = false;
  pendingTabId.value = null;
  showSuccessToast.value = false;
  clearToastTimer();
  engine.flushPersist?.();
  emit('update:modelValue', false);
}

function onLeaveWithoutSaving() {
  forceCloseUpload();
}

async function resetWizardSession() {
  isRestoringSession = true;
  try {
    stopProgressSimulation();
    selectedPayload.value = null;
    uploadProgress.value = 0;
    galleryPendingFiles.value = [];
    galleryUploadedFiles.value = [];
    lastGalleryUploadCount.value = 0;
    uploaderStore.resetForm();
    uploaderStore.clearEditingItem();
    engine.clearPersist();
    await engine.forceStep(0, { reason: 'submit-reset' });
    engine.setState('activeTab', 'video', { silent: true, reason: 'submit-reset' });
    engine.setState('uploadPhase', 'idle', { silent: true, reason: 'submit-reset' });
    engine.setState('galleryUploaded', [], { silent: true, reason: 'submit-reset' });
    engine.setState('galleryPending', [], { silent: true, reason: 'submit-reset' });
    engine.setState('wizardStep', 1, { silent: true, reason: 'submit-reset' });
    engine.setState('wizardSubstep', 'chooseScreenshot', { silent: true, reason: 'submit-reset' });
    engine.setState('form', {}, { silent: true, reason: 'submit-reset' });
    engine.flushPersist?.();
  } finally {
    isRestoringSession = false;
  }
}

function onSaveDraft() {
  emit('save-draft', {
    mediaType: activeTab.value || uploaderStore.form.mediaType,
    phase: uploadPhase.value,
    step: isWizardStep.value ? uploaderStore.step : 0,
    payload: selectedPayload.value,
    galleryPending: galleryPendingFiles.value,
    galleryUploaded: galleryUploadedFiles.value,
    form: { ...uploaderStore.form },
  });
  skipLeaveConfirm = true;
  resetWizardSession().then(() => {
    forceCloseUpload();
  });
}
</script>
