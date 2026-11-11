<script setup>
import { ref, computed, watch, provide, onMounted, onBeforeUnmount } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import VideoThumbnailSelector from './parts/VideoThumbnailSelector.vue';
import FileUploadPlaceholder from './parts/FileUploadPlaceholder.vue';
import ThumbnailUploader from './parts/ThumbnailUploader.vue';
import UploadThumbnailPreview from './parts/UploadThumbnailPreview.vue';
import SystemGeneratedImage from './parts/SystemGeneratedImage.vue';
import UploadYourOwnTrailer from './parts/UploadYourOwnTrailer.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { useMediaInteractions } from '@/composables/useMediaInteractions.js';
import MediaUploadTypeTabs from './parts/MediaUploadTypeTabs.vue';

const emit = defineEmits(['back']);

defineProps({
  hideFooterActions: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const SCOPE_ID = 'mediaUploaderPreview';
const previewIx = useMediaInteractions(SCOPE_ID);
provide('mediaPreviewInteractions', previewIx);
const {
  isVisible,
  setVisible,
  fieldConfig,
  registerField,
  changeField,
  clear: clearInteractions,
} = previewIx;

const { url: backIconUrl } = useAssetUrl('mediaUploader.icon.back');
const { url: nextIconUrl } = useAssetUrl('mediaUploader.icon.next');
const { url: screenshotIconUrl } = useAssetUrl('mediaUploader.icon.screenshot');
const { url: placeholderIconUrl } = useAssetUrl('mediaUploader.icon.placeholder');
const { url: uploadIconUrl } = useAssetUrl('mediaUploader.icon.upload');
const { url: imageThumbIconUrl } = useAssetUrl('mediaUploader.icon.tabSingleImage');
const { url: slideImageUrl } = useAssetUrl('mediaUploader.slideImage');
const { url: deleteIconUrl } = useAssetUrl('mediaUploader.deleteIcon');
const { url: successTickUrl } = useAssetUrl('mediaUploader.icon.successTick');
const { url: audioWaveformUrl } = useAssetUrl('mediaUploader.icon.audioWaveform');

const showSuccessToast = ref(false);

const isAudio = computed(() => uploaderStore.form.mediaType === 'audio');
const isSingleImage = computed(() => uploaderStore.form.mediaType === 'singleImage');
const isVideo = computed(() => !isAudio.value && !isSingleImage.value);

const singleImageUrl = computed(
  () => uploaderStore.form.mediaUrl || uploaderStore.form.thumbnailUrl || '',
);

const audioFileName = computed(
  () =>
    uploaderStore.form.mediaFile?.name ||
    t('mediaUploader.preview.audioFallbackName'),
);

const hasPreviewTrailer = computed(() => Boolean(uploaderStore.form.previewTrailerUrl));

const audioTrailerAccept =
  'audio/mpeg,audio/mp3,audio/wav,audio/ogg,video/mp4,video/avi,video/quicktime,video/x-matroska,video/x-ms-wmv,video/webm,video/ogg,image/jpeg,image/png';

const blurConfig = fieldConfig('blurThumbnail');
const trailerSourceConfig = fieldConfig('previewTrailerSource');
const trailerScreenshotConfig = fieldConfig('showPreviewTrailer_Screenshot');
const trailerPlaceholderConfig = fieldConfig('showPreviewTrailer_Placeholder');
const trailerUploadConfig = fieldConfig('showPreviewTrailer_Upload');

const blurModel = computed({
  get: () => uploaderStore.form.blurThumbnail || false,
  set: (val) => {
    uploaderStore.updateFormField('blurThumbnail', val);
    changeField(blurConfig, val, 'blurControls');
  },
});

function makeTrailerToggleModel(stateKey, config) {
  return computed({
    get: () => uploaderStore.form[stateKey] || false,
    set: (val) => {
      uploaderStore.updateFormField(stateKey, val);
      changeField(config, val, stateKey);
    },
  });
}

const trailerScreenshotModel = makeTrailerToggleModel(
  'showPreviewTrailer_Screenshot',
  trailerScreenshotConfig,
);
const trailerPlaceholderModel = makeTrailerToggleModel(
  'showPreviewTrailer_Placeholder',
  trailerPlaceholderConfig,
);
const trailerUploadModel = makeTrailerToggleModel(
  'showPreviewTrailer_Upload',
  trailerUploadConfig,
);

const trailerParagraphForAudioOrVideo = computed(() =>
  isAudio.value
    ? t('mediaUploader.trailerSetting.paragraphAudio')
    : t('mediaUploader.trailerSetting.paragraph'),
);

function syncTrailerSourcePanels(source) {
  const value = source || 'siteGenerated';
  changeField(trailerSourceConfig, value);
  setVisible('trailerSiteGenerated', value === 'siteGenerated');
  setVisible('trailerUploadOwn', value === 'uploadOwn');
}

onMounted(() => {
  registerField(blurConfig, blurModel.value, 'blurControls');
  registerField(
    trailerSourceConfig,
    uploaderStore.form.previewTrailerSource || 'siteGenerated',
  );
  registerField(
    trailerScreenshotConfig,
    trailerScreenshotModel.value,
    'showPreviewTrailer_Screenshot',
  );
  registerField(
    trailerPlaceholderConfig,
    trailerPlaceholderModel.value,
    'showPreviewTrailer_Placeholder',
  );
  registerField(
    trailerUploadConfig,
    trailerUploadModel.value,
    'showPreviewTrailer_Upload',
  );
  syncTrailerSourcePanels(uploaderStore.form.previewTrailerSource || 'siteGenerated');
});

onBeforeUnmount(() => {
  clearInteractions();
});

const singleImageBlurStyle = computed(() => {
  if (!blurModel.value) return {};
  return {
    filter: 'blur(8px)',
    '-webkit-filter': 'blur(8px)',
  };
});

watch(
  [isAudio, isSingleImage],
  ([audio, single]) => {
    if (audio) {
      const ok = ['usePlaceholder', 'uploadThumbnail'];
      if (!ok.includes(uploaderStore.substep)) {
        uploaderStore.setSubstep('usePlaceholder');
      }
      return;
    }
    if (single) {
      const ok = ['useImageAsThumbnail', 'usePlaceholder'];
      if (!ok.includes(uploaderStore.substep)) {
        uploaderStore.setSubstep('useImageAsThumbnail');
      }
    }
  },
  { immediate: true },
);

watch(
  () => [isSingleImage.value, uploaderStore.substep, uploaderStore.form.mediaUrl],
  ([single, currentSubstep, mediaUrl]) => {
    if (!single || currentSubstep !== 'useImageAsThumbnail' || !mediaUrl) return;
    if (uploaderStore.form.thumbnailUrl === mediaUrl) return;
    uploaderStore.updateFormField('thumbnailUrl', mediaUrl);
  },
  { immediate: true },
);

function handleBack() {
  emit('back');
}

watch(() => uploaderStore.form.previewTrailerUrl, (newVal, oldVal) => {
  if (newVal && !oldVal) {
    showSuccessToast.value = true;
    setTimeout(() => {
      showSuccessToast.value = false;
    }, 4000);
  }
});

const previewTrailerSourceModel = computed({
  get: () => uploaderStore.form.previewTrailerSource || 'siteGenerated',
  set: (val) => {
    uploaderStore.updateFormField('previewTrailerSource', val);
    syncTrailerSourcePanels(val);
  },
});

const previewSubstepTabs = computed(() => {
  if (isSingleImage.value) {
    return [
      {
        id: 'useImageAsThumbnail',
        label: t('mediaUploader.preview.useImageAsThumbnail'),
        icon: imageThumbIconUrl.value,
      },
      {
        id: 'usePlaceholder',
        label: t('mediaUploader.preview.usePlaceholder'),
        icon: placeholderIconUrl.value,
      },
    ];
  }
  if (isAudio.value) {
    return [
      {
        id: 'usePlaceholder',
        label: t('mediaUploader.preview.usePlaceholder'),
        icon: placeholderIconUrl.value,
      },
      {
        id: 'uploadThumbnail',
        label: t('mediaUploader.preview.uploadThumbnail'),
        icon: uploadIconUrl.value,
      },
    ];
  }
  return [
    {
      id: 'chooseScreenshot',
      label: t('mediaUploader.preview.chooseScreenshot'),
      icon: screenshotIconUrl.value,
    },
    {
      id: 'usePlaceholder',
      label: t('mediaUploader.preview.usePlaceholder'),
      icon: placeholderIconUrl.value,
    },
    {
      id: 'uploadThumbnail',
      label: t('mediaUploader.preview.uploadThumbnail'),
      icon: uploadIconUrl.value,
    },
  ];
});

const trailerSourceTabs = computed(() => [
  {
    id: 'siteGenerated',
    label: t('mediaUploader.preview.siteGeneratedTrailer'),
    icon: screenshotIconUrl.value,
  },
  {
    id: 'uploadOwn',
    label: t('mediaUploader.preview.uploadOwnTrailer'),
    icon: uploadIconUrl.value,
  },
]);

const previewPreloadImages = computed(() =>
  [slideImageUrl.value, deleteIconUrl.value].filter(Boolean),
);

const hasOwnUploadedThumbnail = computed(
  () => Boolean(uploaderStore.form.uploadedThumbnailFile && uploaderStore.form.thumbnailUrl),
);
</script>

<template>
  <div data-component="media-uploader-step-preview" class="relative py-[16px] px-[8px] lg:px-[24px] flex flex-col gap-4">
    <div class="flex gap-2 items-center cursor-pointer" @click="handleBack">
      <img :src="backIconUrl" :alt="t('mediaUploader.shell.back')" />
      <button type="button" class="text-xs font-medium leading-[1.125rem] text-medium-text break-words">
        {{ t('mediaUploader.shell.back') }}
      </button>
    </div>

    <Heading tag="h4" theme="custom" no-wrap add-class="text-text-quaternary text-sm font-[700] leading-normal not-italic" :text="t('mediaUploader.preview.thumbnailSettings')" />

    <MediaUploadTypeTabs
      :tabs="previewSubstepTabs"
      :model-value="uploaderStore.substep"
      :tabs-aria-label="t('mediaUploader.preview.thumbnailSettings')"
      @update:model-value="(id) => uploaderStore.setSubstep(id)"
    />

    <!-- Video: Choose screenshot -->
    <div v-if="isVideo && uploaderStore.substep === 'chooseScreenshot'" class="w-full">
      <VideoThumbnailSelector />

      <Heading tag="h4" theme="custom" no-wrap add-class="text-text-quaternary text-sm font-[700] leading-normal not-italic pt-[24px] pb-[16px]" :text="t('mediaUploader.preview.trailerSettings')" />
      <div data-component="media-trailer-setting">
        <CheckboxSwitch
          :label="t('mediaUploader.trailerSetting.label')"
          id="show-preview-toggle-screenshot"
          v-model="trailerScreenshotModel"
        />
        <Paragraph
          theme="custom"
          no-wrap
          add-class="ml-10 text-almost-black text-[14px] font-[400]"
          :text="t('mediaUploader.trailerSetting.paragraph')"
        />
      </div>
    </div>

    <!-- Single image: uploaded image only + Blur thumbnail (no gallery grid) -->
    <div
      v-else-if="isSingleImage && uploaderStore.substep === 'useImageAsThumbnail'"
      class="w-full flex flex-col md:flex-row gap-4 md:items-stretch"
    >
      <div class="w-full md:w-1/2 overflow-hidden rounded bg-light-bg dark:bg-dark-gray-bg-2">
        <img
          v-if="singleImageUrl"
          :src="singleImageUrl"
          alt=""
          class="w-full aspect-[16/9] object-cover transition-all duration-300"
          :style="singleImageBlurStyle"
        />
      </div>
      <div class="w-full md:w-1/2 flex flex-col justify-end">
        <CheckboxSwitch
          :label="t('mediaUploader.thumbnail.blurToggle')"
          showWrapperLabel
          id="single-image-blur-toggle"
          v-model="blurModel"
        />
      </div>
    </div>

    <!-- Use placeholder -->
    <div v-else-if="uploaderStore.substep === 'usePlaceholder'" class="w-full">
      <div
        v-if="isAudio"
        class="flex h-[14.375rem] flex-col justify-center items-center gap-3 w-full rounded bg-light-bg dark:bg-dark-gray-bg-2"
      >
        <img
          v-if="audioWaveformUrl"
          :src="audioWaveformUrl"
          :alt="audioFileName"
          class="w-16 h-16 object-contain"
        />
        <span class="text-sm font-medium text-text-quaternary dark:text-text-badge-dark">
          {{ audioFileName }}
        </span>
      </div>
      <FileUploadPlaceholder v-else />

      <!-- Trailer settings: video + audio only (not single image) -->
      <template v-if="!isSingleImage">
        <Heading tag="h4" theme="custom" no-wrap add-class="text-text-quaternary text-sm font-[700] leading-normal not-italic pt-[24px] pb-[16px]" :text="t('mediaUploader.preview.trailerSettings')" />
        <div class="mb-[16px]" data-component="media-trailer-setting">
          <CheckboxSwitch
            :label="t('mediaUploader.trailerSetting.label')"
            id="show-preview-toggle-placeholder"
            v-model="trailerPlaceholderModel"
          />
          <Paragraph
            theme="custom"
            no-wrap
            add-class="ml-10 text-almost-black text-[14px] font-[400]"
            :text="trailerParagraphForAudioOrVideo"
          />
        </div>

        <!-- Audio trailer upload — only when toggle ON -->
        <div
          v-if="isAudio && isVisible('showPreviewTrailer_Placeholder')"
          class="w-full mb-[50px]"
        >
          <ThumbnailUploader
            v-if="!hasPreviewTrailer"
            :subtitle="t('mediaUploader.preview.audioTrailerDropSubtitle')"
            :fileInfo="t('mediaUploader.preview.audioTrailerFileInfo')"
            :accept="audioTrailerAccept"
            stateUrlKey="previewTrailerUrl"
            stateFileKey="uploadedTrailerFile"
            icon-variant="badge"
          />
          <div v-else class="w-full md:w-1/2 mt-2 flex flex-col gap-2">
            <UploadYourOwnTrailer />
          </div>
        </div>

        <!-- Video trailer source tabs + preview — only when toggle ON -->
        <template v-if="isVideo && isVisible('showPreviewTrailer_Placeholder')">
          <MediaUploadTypeTabs
            :tabs="trailerSourceTabs"
            :model-value="previewTrailerSourceModel"
            :tabs-aria-label="t('mediaUploader.preview.trailerSettings')"
            @update:model-value="(id) => { previewTrailerSourceModel = id; }"
          />

          <div v-if="isVisible('trailerSiteGenerated')" class="w-full md:w-1/2">
            <div class="mt-4 text-gray-700">
              <SystemGeneratedImage />
            </div>
          </div>

          <div v-else-if="isVisible('trailerUploadOwn')" class="w-full">
            <div class="mt-4">
              <ThumbnailUploader
                v-if="!uploaderStore.form.previewTrailerUrl"
                :subtitle="t('mediaUploader.preview.videoDropSubtitle')"
                :fileInfo="t('mediaUploader.preview.videoFileInfo')"
                accept="video/*"
                stateUrlKey="previewTrailerUrl"
                stateFileKey="uploadedTrailerFile"
              />
              <div v-if="uploaderStore.form.previewTrailerUrl" class="w-full md:w-1/2 mt-4 flex flex-col gap-2">
                <UploadYourOwnTrailer />
              </div>

              <Teleport to="body">
                <div
                  v-if="showSuccessToast"
                  class="pointer-events-auto fixed top-[10px] left-[10px] right-[10px] z-[9999] w-auto animate-in fade-in slide-in-from-top duration-300 sm:left-auto sm:right-6 sm:top-6 sm:w-[350px] sm:slide-in-from-right"
                >
                  <NotificationCard
                    variant="success-teal"
                    :title="t('mediaUploader.preview.uploadSuccess')"
                    :closable="false"
                  >
                    <template #icon>
                      <div class="w-10 h-10 flex justify-center items-center rounded-lg bg-teal-400/10 overflow-hidden">
                        <img
                          v-if="successTickUrl"
                          :src="successTickUrl"
                          :alt="t('mediaUploader.preview.uploadSuccess')"
                          class="w-7 h-7 object-contain [mix-blend-mode:screen]"
                        />
                      </div>
                    </template>
                  </NotificationCard>
                </div>
              </Teleport>
            </div>
          </div>
        </template>
      </template>
    </div>

    <!-- Upload your own thumbnail (video / audio) -->
    <div v-else-if="!isSingleImage && uploaderStore.substep === 'uploadThumbnail'" class="w-full">
      <ThumbnailUploader
        v-if="!hasOwnUploadedThumbnail"
        :title="t('mediaUploader.thumbnailUploader.title')"
        :subtitle="t('mediaUploader.thumbnailUploader.subtitle')"
        :file-info="t('mediaUploader.thumbnailUploader.fileInfo')"
      />
      <UploadThumbnailPreview
        v-else
        :deleteIcon="deleteIconUrl"
        expandIcon=""
        :showLabel="false"
        :showBlurToggle="true"
        :preloadImages="previewPreloadImages"
      />
      <Heading tag="h4" theme="custom" no-wrap add-class="text-text-quaternary text-sm font-[700] leading-normal not-italic pt-[24px] pb-[16px]" :text="t('mediaUploader.preview.trailerSettings')" />
      <div :class="isAudio ? 'mb-[16px]' : 'mb-[50px]'" data-component="media-trailer-setting">
        <CheckboxSwitch
          :label="t('mediaUploader.trailerSetting.label')"
          id="show-preview-toggle-upload"
          v-model="trailerUploadModel"
        />
        <Paragraph
          theme="custom"
          no-wrap
          add-class="ml-10 text-almost-black text-[14px] font-[400]"
          :text="trailerParagraphForAudioOrVideo"
        />
      </div>
      <div
        v-if="isAudio && isVisible('showPreviewTrailer_Upload')"
        class="w-full mb-[50px]"
      >
        <ThumbnailUploader
          v-if="!hasPreviewTrailer"
          :subtitle="t('mediaUploader.preview.audioTrailerDropSubtitle')"
          :fileInfo="t('mediaUploader.preview.audioTrailerFileInfo')"
          :accept="audioTrailerAccept"
          stateUrlKey="previewTrailerUrl"
          stateFileKey="uploadedTrailerFile"
          icon-variant="badge"
        />
        <div v-else class="w-full md:w-1/2 mt-2 flex flex-col gap-2">
          <UploadYourOwnTrailer />
        </div>
      </div>
    </div>

    <div v-if="!hideFooterActions" class="sticky bottom-0 z-30 flex justify-end mt-4">
      <DashboardPrimaryButton
        :text="t('mediaUploader.shell.next')"
        variant="polygonLeft"
        :rightIcon="nextIconUrl"
        rightIconClass="w-5 h-5 transition duration-200 brightness-0 group-hover:[filter:brightness(0)_saturate(100%)_invert(75%)_sepia(23%)_saturate(7280%)_hue-rotate(93deg)_brightness(109%)_contrast(95%)]"
        btnBg="#07f468"
        btnHoverBg="black"
        btnText="black"
        btnHoverText="#07f468"
        type="button"
        @click="uploaderStore.setStep(2)"
      />
    </div>
  </div>
</template>
