<template>
    <section class="flex flex-col gap-10">
        <DemoPageViewport variant="dashboard">
        <div class="w-full max-w-3xl flex flex-col gap-10">
            <!-- VideoThumbnailSelector (MediaUploaderStepPreviewSettings.vue — "chooseScreenshot" substep) -->
            <div class="flex flex-col gap-3">
                <VideoThumbnailSelector />
                <ShowCodeToggle :code="code.videoThumbnailSelector" />
            </div>

            <!-- ThumbnailSelector (nested inside VideoThumbnailSelector.vue) -->
            <div class="flex flex-col gap-3">
                <ThumbnailSelector
                    :thumbnails="thumbnailSelectorImages"
                    :selectedIndex="thumbnailSelectedIndex"
                    @update:selectedIndex="(index) => (thumbnailSelectedIndex = index)"
                />
                <ShowCodeToggle :code="code.thumbnailSelector" />
            </div>

            <!-- BlurEffect (nested inside VideoThumbnailSelector.vue) -->
            <div class="flex flex-col gap-3">
                <BlurEffect v-model="blurLevelModel" />
                <ShowCodeToggle :code="code.blurEffect" />
            </div>

            <!-- FileUploadPlaceholder (usePlaceholder substep) -->
            <div class="flex flex-col gap-3">
                <FileUploadPlaceholder />
                <ShowCodeToggle :code="code.fileUploadPlaceholder" />
            </div>

            <!-- SystemGeneratedImage (usePlaceholder > site-generated trailer) -->
            <div class="flex flex-col gap-3">
                <SystemGeneratedImage />
                <ShowCodeToggle :code="code.systemGeneratedImage" />
            </div>

            <!-- UploadYourOwnTrailer (rendered once a trailer preview exists) -->
            <div class="flex flex-col gap-3">
                <UploadYourOwnTrailer />
                <ShowCodeToggle :code="code.uploadYourOwnTrailer" />
            </div>

            <!-- UploadThumbnailPreview (uploadThumbnail substep) -->
            <div class="flex flex-col gap-3">
                <UploadThumbnailPreview
                    :bgImage="assets.slideImage"
                    :deleteIcon="assets.deleteIcon"
                    expandIcon=""
                    :showLabel="false"
                    :showBlurToggle="true"
                    :preloadImages="[assets.slideImage, assets.deleteIcon]"
                />
                <ShowCodeToggle :code="code.uploadThumbnailPreview" />
            </div>

            <!-- PostPreview (publishImmediately / schedulePublish substeps) -->
            <div class="flex flex-col gap-3">
                <PostPreview />
                <ShowCodeToggle :code="code.postPreview" />
            </div>

            <!-- SocialCustomPreview (attach-media > custom image) -->
            <div class="flex flex-col gap-3">
                <SocialCustomPreview
                    v-if="assets.customImage || assets.slideImage"
                    :src="assets.customImage || assets.slideImage"
                    :label="t('mediaUploader.publish.thumbnail')"
                    type="image"
                    @preview-delete="noop"
                />
                <ShowCodeToggle :code="code.socialPreviewThumbnail" />
            </div>

            <!-- SocialCustomPreview (attach-media > custom video) -->
            <div class="flex flex-col gap-3">
                <SocialCustomPreview
                    v-if="assets.sampleVideo || assets.slideImage"
                    :src="assets.sampleVideo || assets.slideImage"
                    :label="t('mediaUploader.publish.trailer')"
                    type="video"
                    @preview-delete="noop"
                />
                <ShowCodeToggle :code="code.socialPreviewTrailer" />
            </div>
        </div>
        </DemoPageViewport>
    </section>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';
import BlurEffect from '@/components/media/uploader/parts/BlurEffect.vue';
import FileUploadPlaceholder from '@/components/media/uploader/parts/FileUploadPlaceholder.vue';
import PostPreview from '@/components/media/uploader/parts/PostPreview.vue';
import SocialCustomPreview from '@/components/media/uploader/parts/SocialCustomPreview.vue';
import SystemGeneratedImage from '@/components/media/uploader/parts/SystemGeneratedImage.vue';
import ThumbnailSelector from '@/components/media/uploader/parts/ThumbnailSelector.vue';
import UploadThumbnailPreview from '@/components/media/uploader/parts/UploadThumbnailPreview.vue';
import UploadYourOwnTrailer from '@/components/media/uploader/parts/UploadYourOwnTrailer.vue';
import VideoThumbnailSelector from '@/components/media/uploader/parts/VideoThumbnailSelector.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import DemoPageViewport from '@/dev/templates/demo/DemoPageViewport.vue';
import { useMediaUploaderDemo } from '@/composables/useMediaUploaderDemo.js';

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const {
  assets,
  thumbnailSelectorImages,
} = useMediaUploaderDemo();

const thumbnailSelectedIndex = ref(0);
const blurLevelModel = ref('20px');

function noop() {}

function initUploaderStore() {
  const a = assets.value;
  if (!a.slideImage) return;

  uploaderStore.updateFormField('thumbnailUrl', a.slideImage);
  uploaderStore.updateFormField('previewTrailerUrl', a.slideImage);
  uploaderStore.updateFormField('blurThumbnail', false);
  uploaderStore.updateFormField('blurThumbnailLevel', '20px');
  uploaderStore.updateFormField('socialThumbnailMode', 'useOriginal');
  uploaderStore.updateFormField('socialPostMessage', '');
}

watch(assets, initUploaderStore, { immediate: true, deep: true });

const importLine = (name, path) => `import ${name} from '${path}';`;

const code = computed(() => ({
  videoThumbnailSelector: `${importLine('VideoThumbnailSelector', '@/components/media/uploader/parts/VideoThumbnailSelector.vue')}

<!-- MediaUploaderStepPreviewSettings.vue — "chooseScreenshot" substep -->
<VideoThumbnailSelector />`,
  thumbnailSelector: `${importLine('ThumbnailSelector', '@/components/media/uploader/parts/ThumbnailSelector.vue')}

<!-- VideoThumbnailSelector.vue -->
<ThumbnailSelector
  :thumbnails="thumbnails"
  :selectedIndex="currentIndex"
  @update:selectedIndex="onThumbnailSelect"
/>`,
  blurEffect: `${importLine('BlurEffect', '@/components/media/uploader/parts/BlurEffect.vue')}

<!-- VideoThumbnailSelector.vue -->
<BlurEffect v-model="blurLevelModel" />`,
  fileUploadPlaceholder: `${importLine('FileUploadPlaceholder', '@/components/media/uploader/parts/FileUploadPlaceholder.vue')}

<!-- MediaUploaderStepPreviewSettings.vue — "usePlaceholder" substep -->
<FileUploadPlaceholder />`,
  systemGeneratedImage: `${importLine('SystemGeneratedImage', '@/components/media/uploader/parts/SystemGeneratedImage.vue')}

<!-- MediaUploaderStepPreviewSettings.vue — site-generated trailer preview -->
<SystemGeneratedImage />`,
  uploadYourOwnTrailer: `${importLine('UploadYourOwnTrailer', '@/components/media/uploader/parts/UploadYourOwnTrailer.vue')}

<!-- MediaUploaderStepPreviewSettings.vue — rendered once previewTrailerUrl is set -->
<UploadYourOwnTrailer />`,
  uploadThumbnailPreview: `${importLine('UploadThumbnailPreview', '@/components/media/uploader/parts/UploadThumbnailPreview.vue')}
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { url: slideImageUrl } = useAssetUrl('mediaUploader.slideImage');
const { url: deleteIconUrl } = useAssetUrl('mediaUploader.deleteIcon');
const previewPreloadImages = computed(() => [slideImageUrl.value, deleteIconUrl.value].filter(Boolean));

<!-- MediaUploaderStepPreviewSettings.vue — "uploadThumbnail" substep -->
<UploadThumbnailPreview
  :bgImage="slideImageUrl"
  :deleteIcon="deleteIconUrl"
  expandIcon=""
  :showLabel="false"
  :showBlurToggle="true"
  :preloadImages="previewPreloadImages"
/>`,
  postPreview: `${importLine('PostPreview', '@/components/media/uploader/parts/PostPreview.vue')}

<!-- MediaUploaderStepPublishAndSharing.vue -->
<PostPreview />`,
  socialPreviewThumbnail: `${importLine('SocialCustomPreview', '@/components/media/uploader/parts/SocialCustomPreview.vue')}

<!-- MediaUploaderStepPublishAndSharing.vue — "useCustom" attach-media -->
<SocialCustomPreview
  v-if="uploaderStore.form.socialThumbnailCustomImageSrc"
  :src="uploaderStore.form.socialThumbnailCustomImageSrc"
  :label="t('mediaUploader.publish.thumbnail')"
  type="image"
  @preview-delete="uploaderStore.updateFormField('socialThumbnailCustomImageSrc', '')"
/>`,
  socialPreviewTrailer: `${importLine('SocialCustomPreview', '@/components/media/uploader/parts/SocialCustomPreview.vue')}

<!-- MediaUploaderStepPublishAndSharing.vue — "useCustom" attach-media -->
<SocialCustomPreview
  v-if="uploaderStore.form.socialThumbnailCustomVideoSrc"
  :src="uploaderStore.form.socialThumbnailCustomVideoSrc"
  :label="t('mediaUploader.publish.trailer')"
  type="video"
  @preview-delete="uploaderStore.updateFormField('socialThumbnailCustomVideoSrc', '')"
/>`,
}));
</script>
