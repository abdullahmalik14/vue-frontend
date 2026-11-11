<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.thumbnailUploader.sectionTitle')" />
        <DemoPageViewport variant="dashboard">
            <div class="w-full max-w-3xl flex flex-col gap-10">
                <!-- MediaUploaderStepPreviewSettings — uploadThumbnail -->
                <div class="flex flex-col gap-3">
                    <ThumbnailUploader
                        :title="t('mediaUploader.thumbnailUploader.title')"
                        :subtitle="t('mediaUploader.thumbnailUploader.subtitle')"
                        :file-info="t('mediaUploader.thumbnailUploader.fileInfo')"
                    />
                    <ShowCodeToggle :code="code.previewUploadThumbnail" />
                </div>

                <!-- MediaUploaderStepPreviewSettings — trailerUploadOwn -->
                <div class="flex flex-col gap-3">
                    <ThumbnailUploader
                        :subtitle="t('mediaUploader.preview.videoDropSubtitle')"
                        :fileInfo="t('mediaUploader.preview.videoFileInfo')"
                        accept="video/*"
                        stateUrlKey="previewTrailerUrl"
                        stateFileKey="uploadedTrailerFile"
                    />
                    <ShowCodeToggle :code="code.previewVideoTrailer" />
                </div>

                <!-- MediaUploaderStepPublishAndSharing — custom thumbnail image -->
                <div class="flex flex-col gap-3">
                    <ThumbnailUploader
                        :subtitle="t('mediaUploader.publish.imageDropSubtitle')"
                        :fileInfo="t('mediaUploader.publish.imageFileInfo')"
                        stateUrlKey="socialThumbnailCustomImageSrc"
                        stateFileKey="socialThumbnailCustomImageFile"
                    />
                    <ShowCodeToggle :code="code.publishImage" />
                </div>

                <!-- MediaUploaderStepPublishAndSharing — custom trailer video -->
                <div class="flex flex-col gap-3">
                    <ThumbnailUploader
                        :subtitle="t('mediaUploader.publish.videoDropSubtitle')"
                        :fileInfo="t('mediaUploader.publish.videoFileInfo')"
                        stateUrlKey="socialThumbnailCustomVideoSrc"
                        stateFileKey="socialThumbnailCustomVideoFile"
                        accept="video/*"
                    />
                    <ShowCodeToggle :code="code.publishVideo" />
                </div>

                <!-- UploadMediaPopup — single image dropzone -->
                <div class="flex flex-col gap-3 min-h-[12.5rem] md:min-h-[28.125rem]">
                    <ThumbnailUploader
                        :title="t('mediaUploader.thumbnailUploader.title')"
                        :subtitle="t('mediaUploader.uploadPopup.drop.singleImage')"
                        :file-info="t('mediaUploader.uploadPopup.formats.singleImage')"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                        :use-media-store="false"
                        :show-selected-name="true"
                        icon-variant="badge"
                        full-area-click
                        wrapper-class="cursor-pointer border-2 border-transparent bg-black/5 rounded-xl p-2 flex-1 min-h-0 h-full md:h-[450px] md:flex-none md:min-h-[450px] flex flex-col items-center justify-center hover:border-dark-text hover:bg-black/10 group relative dark:hover:border-border-input-dark"
                        inner-wrapper-class="gap-1 w-full flex flex-col justify-center items-center self-stretch border-2 border-dashed border-transparent"
                        title-class="text-sm leading-5 text-center font-normal text-text-quaternary dark:text-text-badge-dark"
                        title-highlight-class="font-semibold text-text-primary dark:text-timberwolf"
                        file-info-class="text-text-quaternary text-xs leading-[1.125rem] text-center mb-0 dark:text-text-badge-dark"
                    />
                    <ShowCodeToggle :code="code.uploadMediaPopup" />
                </div>

                <!-- AddTierPopup — plain icon, media store tier keys -->
                <div class="flex flex-col gap-3">
                    <ThumbnailUploader
                        :title="t('mediaUploader.addTier.uploadTitle')"
                        :subtitle="t('mediaUploader.addTier.uploadSubtitle')"
                        :fileInfo="t('mediaUploader.addTier.uploadFileInfo')"
                        stateUrlKey="tier_backgroundUrl"
                        stateFileKey="tier_backgroundFile"
                        accept="image/jpeg, image/png"
                        :show-selected-name="false"
                        icon-variant="plain"
                        full-area-click
                    >
                        <template #icon>
                            <img
                                :src="addTierBackgroundUrl"
                                alt=""
                                class="w-10 h-10 object-contain pointer-events-none"
                            />
                        </template>
                    </ThumbnailUploader>
                    <ShowCodeToggle :code="code.addTier" />
                </div>

                <!-- PlanDetail — plain icon, custom wrapper, no media store -->
                <div class="flex flex-col gap-3">
                    <ThumbnailUploader
                        :title="t('mediaUploader.addTier.uploadTitle')"
                        :subtitle="t('mediaUploader.addTier.uploadSubtitle')"
                        :file-info="t('mediaUploader.addTier.uploadFileInfo')"
                        accept="image/jpeg, image/png"
                        :use-media-store="false"
                        :show-selected-name="false"
                        icon-variant="plain"
                        underline-title
                        full-area-click
                        wrapper-class="cursor-pointer border-2 border-transparent bg-[rgba(0,0,0,0.05)] rounded-lg p-10 h-[12.1875rem] w-full flex flex-col items-center justify-center hover:border-[#0c111d] dark:hover:border-[#857c6d] hover:bg-[rgba(0,0,0,0.10)] dark:hover:bg-[rgba(0,0,0,0.05)] group relative"
                        inner-wrapper-class="gap-2 w-full flex flex-col justify-center items-center self-stretch border-2 border-dashed border-transparent"
                        title-class="text-sm font-semibold text-center text-[#0C111D] dark:text-[#dbd8d3]"
                        title-highlight-class="text-sm font-semibold underline text-[#0C111D] dark:text-[#dbd8d3]"
                        file-info-class="text-[#333333] text-sm leading-normal font-medium text-center tracking-[0.00875rem] opacity-70 dark:text-[#c8c3bc]"
                    >
                        <template #icon>
                            <img
                                v-if="planAssets.backgroundUpload"
                                :src="planAssets.backgroundUpload"
                                :alt="t('mediaUploader.addTier.backgroundImage')"
                                class="w-10 h-10 [filter:brightness(0)] dark:[filter:brightness(100%)]"
                            />
                        </template>
                    </ThumbnailUploader>
                    <ShowCodeToggle :code="code.planDetail" />
                </div>

                <!-- EditProfilePage — gallery attach media -->
                <div class="flex flex-col gap-3">
                    <ThumbnailUploader
                        :title="t('editProfile.page.gallery.clickUpload')"
                        :subtitle="t('editProfile.page.gallery.dragDrop')"
                        :fileInfo="t('editProfile.page.gallery.formats')"
                        :use-media-store="false"
                        :show-selected-name="false"
                        wrapperClass="cursor-pointer border-2 border-transparent bg-[rgba(0,0,0,0.05)] rounded-xl px-6 py-4 relative h-[12.5rem] w-full flex flex-col items-center justify-center hover:border-[#0c111d] dark:bg-[#181a1b]/5 dark:hover:border-[#857c6d] hover:bg-[rgba(0,0,0,0.10)] dark:hover:bg-[rgba(0,0,0,0.05)] group/upload sm:h-[13.3125rem] md:h-[12.5rem] lg:h-[13.3125rem]"
                        innerWrapperClass="gap-3 w-full flex flex-col justify-center items-center self-stretch border-2 border-dashed border-transparent"
                        iconOuterClass="flex justify-center items-center w-10 h-10 rounded-lg shadow-[0px_1px_2px_0px_#1018280D] bg-[#07F468] group-hover/upload:bg-[#0C111D] dark:bg-[#06c454] dark:group-hover/upload:bg-[#162036]"
                        iconBadgeClass="contents"
                        titleClass="text-sm text-[#475467] dark:text-[#b1aba0]"
                        titleHighlightClass="text-sm font-semibold text-center text-[#0C111D] dark:text-[#dbd8d3]"
                        fileInfoClass="text-xs leading-normal text-[#475467] dark:text-[#b1aba0]"
                    >
                        <template #icon>
                            <img
                                :src="editProfileAssets.uploadDraft"
                                :alt="t('editProfile.page.alt.upload')"
                                class="w-5 h-5 [filter:brightness(0)] group-hover/upload:[filter:brightness(0)_saturate(100%)_invert(65%)_sepia(22%)_saturate(4910%)_hue-rotate(97deg)_brightness(113%)_contrast(94%)]"
                            />
                        </template>
                    </ThumbnailUploader>
                    <ShowCodeToggle :code="code.editProfile" />
                </div>

                <!-- PayoutCosmoFlowPopup — document upload -->
                <div class="flex flex-col gap-3 max-w-[22.5rem]">
                    <ThumbnailUploader
                        :use-media-store="false"
                        :show-selected-name="false"
                        icon-variant="badge"
                        :title="t('payoutCosmo.popup.clickToUpload')"
                        :subtitle="t('payoutCosmo.popup.orDrag')"
                        :file-info="t('payoutCosmo.popup.fileInfo')"
                        accept="image/png, image/jpeg, application/pdf"
                        wrapper-class="cursor-pointer border-2 border-transparent bg-black/5 rounded-xl p-2 h-[7.875rem] w-full flex flex-col items-center justify-center hover:border-dark-text hover:bg-black/10 group relative dark:bg-white/5"
                        inner-wrapper-class="gap-1 w-full flex flex-col justify-center self-stretch border-2 border-dashed border-transparent"
                        full-area-click
                    >
                        <template #icon>
                            <PayoutCdnIcon :src="uploadCloudUrl" class="h-5 w-5 text-black group-hover:text-success" />
                        </template>
                    </ThumbnailUploader>
                    <ShowCodeToggle :code="code.payoutCosmo" />
                </div>

                <!-- OrderDetailsPopup — tracking screenshot -->
                <div class="flex flex-col gap-3 max-w-[22.5rem]">
                    <ThumbnailUploader
                        :use-media-store="false"
                        :show-selected-name="false"
                        icon-variant="badge"
                        :title="t('dashboard.orders.popup.tracking.uploadTitle')"
                        :subtitle="t('dashboard.orders.popup.tracking.uploadSubtitle')"
                        :file-info="t('dashboard.orders.popup.tracking.uploadFileInfo')"
                        wrapper-class="cursor-pointer border-2 border-transparent bg-black/5 rounded-xl p-2 h-[7.875rem] w-full flex flex-col items-center justify-center hover:border-dark-text hover:bg-black/10 group relative"
                        inner-wrapper-class="gap-1 w-full flex flex-col justify-center self-stretch border-2 border-dashed border-transparent"
                        full-area-click
                    />
                    <ShowCodeToggle :code="code.orderDetails" />
                </div>
            </div>
        </DemoPageViewport>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';
import PayoutCdnIcon from '@/dev/components/payout/cosmo/PayoutCdnIcon.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { usePlanAssets } from '@/composables/usePlanAssets.js';
import { useEditProfileAssets } from '@/dev/composables/useEditProfileAssets.js';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import DemoPageViewport from '@/dev/templates/demo/DemoPageViewport.vue';

const { t } = useI18n();
const { assets: planAssets } = usePlanAssets();
const { assets: editProfileAssets } = useEditProfileAssets();
const { url: addTierBackgroundUrl } = useAssetUrl('mediaUploader.icon.addTierBackground');
const { url: uploadCloudUrl } = useAssetUrl('payout.icon.uploadCloud');

const code = computed(() => ({
    previewUploadThumbnail: `import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';

<!-- MediaUploaderStepPreviewSettings.vue — "uploadThumbnail" substep -->
<ThumbnailUploader
  v-if="!hasOwnUploadedThumbnail"
  :title="t('mediaUploader.thumbnailUploader.title')"
  :subtitle="t('mediaUploader.thumbnailUploader.subtitle')"
  :file-info="t('mediaUploader.thumbnailUploader.fileInfo')"
/>`,
    previewVideoTrailer: `import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';

<!-- MediaUploaderStepPreviewSettings.vue — "trailerUploadOwn" -->
<ThumbnailUploader
  v-if="!uploaderStore.form.previewTrailerUrl"
  :subtitle="t('mediaUploader.preview.videoDropSubtitle')"
  :fileInfo="t('mediaUploader.preview.videoFileInfo')"
  accept="video/*"
  stateUrlKey="previewTrailerUrl"
  stateFileKey="uploadedTrailerFile"
/>`,
    publishImage: `import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';

<!-- MediaUploaderStepPublishAndSharing.vue — attach-media custom image -->
<ThumbnailUploader
  :subtitle="t('mediaUploader.publish.imageDropSubtitle')"
  :fileInfo="t('mediaUploader.publish.imageFileInfo')"
  stateUrlKey="socialThumbnailCustomImageSrc"
  stateFileKey="socialThumbnailCustomImageFile"
/>`,
    publishVideo: `import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';

<!-- MediaUploaderStepPublishAndSharing.vue — attach-media custom video -->
<ThumbnailUploader
  :subtitle="t('mediaUploader.publish.videoDropSubtitle')"
  :fileInfo="t('mediaUploader.publish.videoFileInfo')"
  stateUrlKey="socialThumbnailCustomVideoSrc"
  stateFileKey="socialThumbnailCustomVideoFile"
  accept="video/*"
/>`,
    uploadMediaPopup: `import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';

<!-- UploadMediaPopup.vue — single image / video / audio dropzone -->
<ThumbnailUploader
  :title="t('mediaUploader.thumbnailUploader.title')"
  :subtitle="uploadCopy.subtitle"
  :file-info="uploadCopy.fileInfo"
  :accept="uploadCopy.accept"
  :use-media-store="false"
  :show-selected-name="activeTab !== 'imageGallery'"
  icon-variant="badge"
  full-area-click
  :wrapper-class="uploadWrapperClass"
  inner-wrapper-class="gap-1 w-full flex flex-col justify-center items-center self-stretch border-2 border-dashed border-transparent"
  title-class="text-sm leading-5 text-center font-normal text-text-quaternary dark:text-text-badge-dark"
  title-highlight-class="font-semibold text-text-primary dark:text-timberwolf"
  file-info-class="text-text-quaternary text-xs leading-[1.125rem] text-center mb-0 dark:text-text-badge-dark"
  @file-selected="onFileSelected"
/>`,
    addTier: `import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { url: backgroundIconUrl } = useAssetUrl('mediaUploader.icon.addTierBackground');

<!-- AddTierPopup.vue -->
<ThumbnailUploader
  :title="t('mediaUploader.addTier.uploadTitle')"
  :subtitle="t('mediaUploader.addTier.uploadSubtitle')"
  :fileInfo="t('mediaUploader.addTier.uploadFileInfo')"
  stateUrlKey="tier_backgroundUrl"
  stateFileKey="tier_backgroundFile"
  accept="image/jpeg, image/png"
  :show-selected-name="false"
  icon-variant="plain"
  full-area-click
>
  <template #icon>
    <img
      :src="backgroundIconUrl"
      alt=""
      class="w-10 h-10 object-contain pointer-events-none"
    />
  </template>
</ThumbnailUploader>`,
    planDetail: `import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';
import { usePlanAssets } from '@/composables/usePlanAssets.js';

const { assets } = usePlanAssets();

<!-- PlanDetail.vue -->
<ThumbnailUploader
  v-if="!bgImageProxy"
  :title="t('mediaUploader.addTier.uploadTitle')"
  :subtitle="t('mediaUploader.addTier.uploadSubtitle')"
  :file-info="t('mediaUploader.addTier.uploadFileInfo')"
  accept="image/jpeg, image/png"
  :use-media-store="false"
  :show-selected-name="false"
  icon-variant="plain"
  underline-title
  full-area-click
  wrapper-class="cursor-pointer border-2 border-transparent bg-[rgba(0,0,0,0.05)] rounded-lg p-10 h-[12.1875rem] w-full flex flex-col items-center justify-center hover:border-[#0c111d] dark:hover:border-[#857c6d] hover:bg-[rgba(0,0,0,0.10)] dark:hover:bg-[rgba(0,0,0,0.05)] group relative"
  inner-wrapper-class="gap-2 w-full flex flex-col justify-center items-center self-stretch border-2 border-dashed border-transparent"
  title-class="text-sm font-semibold text-center text-[#0C111D] dark:text-[#dbd8d3]"
  title-highlight-class="text-sm font-semibold underline text-[#0C111D] dark:text-[#dbd8d3]"
  file-info-class="text-[#333333] text-sm leading-normal font-medium text-center tracking-[0.00875rem] opacity-70 dark:text-[#c8c3bc]"
  @file-selected="onBackgroundImageSelected"
>
  <template #icon>
    <img
      v-if="assets.backgroundUpload"
      :src="assets.backgroundUpload"
      :alt="t('mediaUploader.addTier.backgroundImage')"
      class="w-10 h-10 [filter:brightness(0)] dark:[filter:brightness(100%)]"
    />
  </template>
</ThumbnailUploader>`,
    editProfile: `import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';

<!-- EditProfilePage.vue — attach media upload -->
<ThumbnailUploader
  v-if="!postMediaUploader.state.uploadedThumbnailFile"
  :uploader="postMediaUploader"
  :title="t('editProfile.page.gallery.clickUpload')"
  :subtitle="t('editProfile.page.gallery.dragDrop')"
  :fileInfo="t('editProfile.page.gallery.formats')"
  wrapperClass="cursor-pointer border-2 border-transparent bg-[rgba(0,0,0,0.05)] rounded-xl px-6 py-4 relative h-[12.5rem] w-full flex flex-col items-center justify-center hover:border-[#0c111d] dark:bg-[#181a1b]/5 dark:hover:border-[#857c6d] hover:bg-[rgba(0,0,0,0.10)] dark:hover:bg-[rgba(0,0,0,0.05)] group/upload sm:h-[13.3125rem] md:h-[12.5rem] lg:h-[13.3125rem]"
  innerWrapperClass="gap-3 w-full flex flex-col justify-center items-center self-stretch border-2 border-dashed border-transparent"
  iconWrapperClass="flex justify-center items-center w-10 h-10 rounded-lg shadow-[0px_1px_2px_0px_#1018280D] bg-[#07F468] group-hover/upload:bg-[#0C111D] dark:bg-[#06c454] dark:group-hover/upload:bg-[#162036]"
  iconInnerWrapperClass="contents"
  titleClass="text-sm text-[#475467] dark:text-[#b1aba0]"
  titleHighlightClass="text-sm font-semibold text-center text-[#0C111D] dark:text-[#dbd8d3]"
  fileInfoClass="text-xs leading-normal text-[#475467] dark:text-[#b1aba0]"
>
  <template #icon>
    <img :src="assets.uploadDraft" :alt="t('editProfile.page.alt.upload')" class="w-5 h-5 [filter:brightness(0)] group-hover/upload:[filter:brightness(0)_saturate(100%)_invert(65%)_sepia(22%)_saturate(4910%)_hue-rotate(97deg)_brightness(113%)_contrast(94%)]">
  </template>
</ThumbnailUploader>`,
    payoutCosmo: `import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';
import PayoutCdnIcon from '@/dev/components/payout/cosmo/PayoutCdnIcon.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { url: uploadCloudUrl } = useAssetUrl('payout.icon.uploadCloud');

<!-- PayoutCosmoFlowPopup.vue — onboarding documents -->
<ThumbnailUploader
  :use-media-store="false"
  :show-selected-name="false"
  icon-variant="badge"
  :title="t('payoutCosmo.popup.clickToUpload')"
  :subtitle="t('payoutCosmo.popup.orDrag')"
  :file-info="t('payoutCosmo.popup.fileInfo')"
  accept="image/png, image/jpeg, application/pdf"
  wrapper-class="cursor-pointer border-2 border-transparent bg-black/5 rounded-xl p-2 h-[7.875rem] w-full flex flex-col items-center justify-center hover:border-dark-text hover:bg-black/10 group relative dark:bg-white/5"
  inner-wrapper-class="gap-1 w-full flex flex-col justify-center self-stretch border-2 border-dashed border-transparent"
  full-area-click
  @file-selected="onDocumentSelected(session.documents.proofOfIdentity, $event)"
>
  <template #icon>
    <PayoutCdnIcon :src="assets.uploadCloud" class="h-5 w-5 text-black group-hover:text-success" />
  </template>
</ThumbnailUploader>`,
    orderDetails: `import ThumbnailUploader from '@/components/media/uploader/parts/ThumbnailUploader.vue';

<!-- OrderDetailsPopup.vue — tracking screenshot -->
<ThumbnailUploader
  v-if="!uploader.state.thumbnailUrl"
  :use-media-store="false"
  :show-selected-name="false"
  icon-variant="badge"
  :title="t('dashboard.orders.popup.tracking.uploadTitle')"
  :subtitle="t('dashboard.orders.popup.tracking.uploadSubtitle')"
  :file-info="t('dashboard.orders.popup.tracking.uploadFileInfo')"
  wrapper-class="cursor-pointer border-2 border-transparent bg-black/5 rounded-xl p-2 h-[7.875rem] w-full flex flex-col items-center justify-center hover:border-dark-text hover:bg-black/10 group relative"
  inner-wrapper-class="gap-1 w-full flex flex-col justify-center self-stretch border-2 border-dashed border-transparent"
  full-area-click
  @file-selected="handleScreenshotSelected"
/>`,
}));
</script>
