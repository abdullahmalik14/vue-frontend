<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.notificationCard.sectionTitle')" />
        <div class="flex flex-col gap-10 max-w-3xl">
            <div class="flex flex-col gap-3">
                <NotificationCard
                    v-model="open.publishConnectX"
                    variant="notice"
                    :title="t('mediaUploader.publish.connectXNotice')"
                    :show-icon="false"
                    :closable="false"
                >
                    <DashboardPrimaryButton
                        :text="t('mediaUploader.publish.connectX')"
                        variant="none"
                        text-class="text-[12px] text-white"
                        custom-class="py-1 px-2 w-max bg-border-notification-info-light text-[12px] text-white"
                    />
                </NotificationCard>
                <ShowCodeToggle :code="code.publishConnectX" />
            </div>

            <div class="flex flex-col gap-3">
                <NotificationCard
                    v-model="open.submitWarning"
                    variant="warning"
                    :icon="ExclamationTriangleIcon"
                    :description="t('mediaUploader.submit.warning')"
                    :closable="false"
                />
                <ShowCodeToggle :code="code.submitWarning" />
            </div>

            <div class="flex flex-col gap-3">
                <div class="w-full sm:w-[350px]">
                    <NotificationCard
                        v-model="open.previewUpload"
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
                <ShowCodeToggle :code="code.previewUpload" />
            </div>

            <div class="flex flex-col gap-3">
                <div class="w-full sm:w-[350px]">
                    <NotificationCard
                        v-model="open.tierAdded"
                        variant="success-teal"
                        :title="t('mediaUploader.subscription.tierAddedToast')"
                        :closable="false"
                    >
                        <template #icon>
                            <div class="w-10 h-10 flex justify-center items-center rounded-lg bg-mediaUi-mintSoft overflow-hidden">
                                <img
                                    v-if="successTickUrl"
                                    :src="successTickUrl"
                                    alt=""
                                    class="w-7 h-7 object-contain"
                                />
                            </div>
                        </template>
                    </NotificationCard>
                </div>
                <ShowCodeToggle :code="code.tierAdded" />
            </div>

            <div class="flex flex-col gap-3">
                <div class="w-full sm:w-[350px]">
                    <NotificationCard
                        v-model="open.uploadSuccess"
                        variant="success-teal"
                        :title="t('mediaUploader.preview.uploadSuccess')"
                        :closable="false"
                    >
                        <template #icon>
                            <div class="w-10 h-10 flex justify-center items-center rounded-lg bg-mediaUi-mintSoft overflow-hidden">
                                <img
                                    v-if="gallerySuccessTickUrl"
                                    :src="gallerySuccessTickUrl"
                                    :alt="t('mediaUploader.preview.uploadSuccess')"
                                    class="w-7 h-7 object-contain"
                                />
                            </div>
                        </template>
                    </NotificationCard>
                </div>
                <ShowCodeToggle :code="code.uploadSuccess" />
            </div>

            <div class="flex flex-col gap-3">
                <div class="w-full sm:max-w-[24rem]">
                    <NotificationCard
                        v-model="open.xRepostSaved"
                        variant="success-teal"
                        :title="t('dashboard.xRepost.savedToast')"
                    >
                        <template #icon>
                            <div class="relative">
                                <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/10">
                                    <img
                                        v-if="xRepostAssets.toastUpload"
                                        :src="xRepostAssets.toastUpload"
                                        alt=""
                                        class="h-7 w-7 object-contain"
                                    />
                                </div>
                                <div class="absolute -bottom-2.5 -right-2.5 flex h-[22px] w-[23px] items-center justify-center">
                                    <img
                                        v-if="xRepostAssets.toastSuccess"
                                        :src="xRepostAssets.toastSuccess"
                                        alt=""
                                        class="h-[22px] w-[23px] object-contain"
                                    />
                                </div>
                            </div>
                        </template>
                    </NotificationCard>
                </div>
                <ShowCodeToggle :code="code.xRepostSaved" />
            </div>

            <div class="flex flex-col gap-3">
                <div class="payment-fail-toast w-full sm:max-w-[32rem]">
                    <NotificationCard
                        v-model="open.paymentFailed"
                        variant="limit-exceeded"
                        :title="t('booking.paymentFailedTitle')"
                        :description="t('booking.paymentFailedDescription')"
                        left-border-class="bg-[#FF4405]"
                        title-class="text-[#FF4405] text-[14px] font-[600]"
                    >
                        <template #icon>
                            <div class="relative h-[40px] w-[40px]">
                                <div class="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-[rgba(255,68,5,0.12)]">
                                    <img src="/images/checkout-payment-fail-cart.png" alt="" class="block h-[23px] w-[23px] object-contain" />
                                </div>
                                <div class="absolute -bottom-2.5 -right-2.5 flex h-[22px] w-[23px] items-center justify-center rounded-[8px] bg-[#FF4405]">
                                    <img src="/images/checkout-payment-fail-warning.png" alt="" class="block h-[12px] w-[12px] object-contain" />
                                </div>
                            </div>
                        </template>
                    </NotificationCard>
                </div>
                <ShowCodeToggle :code="code.paymentFailed" />
            </div>

            <div class="flex flex-col gap-3">
                <NotificationCard
                    v-model="open.payoutFail"
                    variant="error"
                    theme="payoutFail"
                    :show-icon="false"
                    :closable="false"
                    :title="t('payout.processing.failTitle')"
                    :description="payoutFailDescription"
                >
                    <DashboardPrimaryButton
                        :text="t('payout.processing.defaults.actionUploadAddressProof')"
                        theme="payoutFail"
                        :right-icon="payoutAssets.arrowUpRight"
                    />
                </NotificationCard>
                <ShowCodeToggle :code="code.payoutFail" />
            </div>

            <div class="flex flex-col gap-3">
                <NotificationCard
                    v-model="open.withdrawAccepted"
                    variant="success-teal"
                    :title="t('payout.withdraw.step5.acceptedTitle')"
                    :icon="payoutAssets.checkCircle"
                    :closable="false"
                />
                <ShowCodeToggle :code="code.withdrawAccepted" />
            </div>

            <div class="flex flex-col gap-3">
                <NotificationCard
                    v-model="open.planFeatured"
                    variant="alert"
                    :showIcon="false"
                    :closable="false"
                    :title="t('plan.detail.featuredAlertTitle')"
                    :description="t('plan.detail.featuredAlertDescription')"
                />
                <ShowCodeToggle :code="code.planFeatured" />
            </div>

            <div class="flex flex-col gap-3">
                <div class="w-full sm:w-[30rem]">
                    <NotificationCard
                        v-model="open.planTierPublished"
                        variant="success-teal"
                        theme="planTierToast"
                        :title="t('plan.toast.detailsUpdated')"
                        :description="t('plan.toast.updatedAndPublished', {
                            name: t('plan.toast.featuredName', {
                                name: t('plan.preview.mock.title'),
                            }),
                        })"
                    >
                        <template #icon>
                            <div class="relative h-10 w-10 shrink-0">
                                <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-[#2ED3B71A]">
                                    <img
                                        v-if="planAssets.toastKeyhole"
                                        :src="planAssets.toastKeyhole"
                                        alt=""
                                        class="h-[15px] w-[10px] object-contain"
                                    >
                                </div>
                                <div
                                    class="absolute -bottom-[0.563rem] -right-[0.563rem] flex h-[1.375rem] w-[1.375rem] items-center justify-center overflow-hidden rounded-full bg-[#2ed3b7]"
                                >
                                    <img
                                        v-if="planAssets.toastUploadCloud"
                                        :src="planAssets.toastUploadCloud"
                                        alt=""
                                        class="h-3.5 w-3.5 object-contain mix-blend-screen"
                                    >
                                </div>
                            </div>
                        </template>
                        <template #actions>
                            <div class="flex w-full items-end justify-between gap-2 pt-1">
                                <span class="text-xs leading-[1.125rem] text-[#98A2B3]">
                                    {{ t('plan.toast.justNow') }}
                                </span>
                                <button
                                    type="button"
                                    class="inline-flex items-center gap-0.5 text-xs font-medium leading-[1.125rem] text-teal-400"
                                >
                                    {{ t('plan.toast.viewInProfile') }}
                                    <svg
                                        class="h-4 w-4 shrink-0"
                                        viewBox="0 0 16 16"
                                        fill="none"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M4.5 11.5 11.5 4.5M11.5 4.5H6.5M11.5 4.5V9.5"
                                            stroke="currentColor"
                                            stroke-width="1.5"
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </template>
                    </NotificationCard>
                </div>
                <ShowCodeToggle :code="code.planTierPublished" />
            </div>

            <div class="flex flex-col gap-3">
                <NotificationCard
                    v-model="open.tipTokens"
                    theme="tipSuccess"
                    variant="notice"
                    :closable="false"
                    :title="t('booking.tipSentTokens', { amount: 10 })"
                    :badge-alt="t('booking.tipTokenAlt')"
                />
                <ShowCodeToggle :code="code.tipTokens" />
            </div>

            <div class="flex flex-col gap-3">
                <div class="w-full relative">
                    <NotificationCard
                        v-model="open.tipLimit"
                        theme="tipLimit"
                        variant="limit-exceeded"
                        :closable="false"
                        class="w-full"
                        :title="t('booking.tipLimitExceeded')"
                        :action-label="t('booking.tipSetToMax')"
                        :alert-alt="t('booking.tipAlertAlt')"
                    />
                </div>
                <ShowCodeToggle :code="code.tipLimit" />
            </div>

            <div class="flex flex-col gap-3">
                <NotificationCard
                    v-model="open.bookingSubscribers"
                    variant="alert"
                    :showIcon="false"
                    :title="t('booking.activeSubscribersTitle')"
                    :description="t('booking.activeSubscribersDescription')"
                />
                <ShowCodeToggle :code="code.bookingSubscribers" />
            </div>

            <div class="flex flex-col gap-3">
                <NotificationCard
                    v-model="open.bookingValidation"
                    variant="error"
                    :title="t('booking.validationTitle')"
                    :description="t('booking.eventTitleRequired')"
                    class="mb-4"
                />
                <ShowCodeToggle :code="code.bookingValidation" />
            </div>

            <div class="flex flex-col gap-3">
                <NotificationCard
                    v-model="open.editUnsaved"
                    variant="notice"
                    :title="t('editProfile.page.notice.unsavedTitle')"
                    :description="t('editProfile.page.notice.unsavedDescription')"
                    :icon="editAssets.smileyFace"
                    :badgeIcon="editAssets.infoSquare"
                />
                <ShowCodeToggle :code="code.editUnsaved" />
            </div>

            <div class="flex flex-col gap-3">
                <NotificationCard
                    v-model="open.editGallerySuccess"
                    variant="success-teal"
                    :title="t('editProfile.page.gallery.successTitle', { count: 2 })"
                    :description="t('editProfile.page.gallery.successDescription')"
                    :icon="editAssets.previewFallback"
                    :badgeIcon="editAssets.tickMark"
                />
                <ShowCodeToggle :code="code.editGallerySuccess" />
            </div>

            <div class="flex flex-col gap-3">
                <NotificationCard
                    v-model="open.editGalleryVideo"
                    variant="error"
                    :title="t('editProfile.page.gallery.failOneTitle')"
                    :description="t('editProfile.page.gallery.failVideoDesc', { name: t('editProfile.page.gallery.sampleVideoFile') })"
                    :icon="editAssets.previewFallback"
                    :badgeIcon="editAssets.alertTriangle"
                />
                <ShowCodeToggle :code="code.editGalleryVideo" />
            </div>

            <div class="flex flex-col gap-3">
                <NotificationCard
                    v-model="open.editGalleryAdd"
                    variant="error"
                    :title="t('editProfile.page.gallery.failAddTitle')"
                    :description="t('editProfile.page.gallery.failAddDesc', { name: t('editProfile.page.gallery.sampleImageFile') })"
                    :icon="editAssets.previewFallback"
                    :badgeIcon="editAssets.alertTriangle"
                />
                <ShowCodeToggle :code="code.editGalleryAdd" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/solid';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { useEditProfileAssets } from '@/dev/composables/useEditProfileAssets.js';
import { usePlanAssets } from '@/composables/usePlanAssets.js';
import { usePayoutAssets } from '@/dev/composables/usePayoutAssets.js';
import { useXRepostAssets } from '@/dev/composables/useXRepostAssets.js';

const { t } = useI18n();
const { url: successTickUrl } = useAssetUrl('mediaUploader.icon.successTick');
const { url: gallerySuccessTickUrl } = useAssetUrl('mediaUploader.icon.gallerySuccessTick');
const { assets: editAssets } = useEditProfileAssets();
const { assets: planAssets } = usePlanAssets();
const { assets: payoutAssets } = usePayoutAssets();
const { assets: xRepostAssets } = useXRepostAssets();

const payoutFailDescription = computed(
    () => `${t('payout.processing.failDescriptionPrefix')} ${t('payout.processing.defaults.failReason')}`,
);

const open = reactive({
    publishConnectX: true,
    submitWarning: true,
    previewUpload: true,
    tierAdded: true,
    uploadSuccess: true,
    xRepostSaved: true,
    paymentFailed: true,
    payoutFail: true,
    withdrawAccepted: true,
    planFeatured: true,
    planTierPublished: true,
    tipTokens: true,
    tipLimit: true,
    bookingSubscribers: true,
    bookingValidation: true,
    editUnsaved: true,
    editGallerySuccess: true,
    editGalleryVideo: true,
    editGalleryAdd: true,
});

const importLine = "import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';";

const mintIconSlot = `<template #icon>
  <div class="w-10 h-10 flex justify-center items-center rounded-lg bg-mediaUi-mintSoft overflow-hidden">
    <img v-if="successTickUrl" :src="successTickUrl" alt="" class="w-7 h-7 object-contain" />
  </div>
</template>`;

const code = computed(() => ({
    publishConnectX: `import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
${importLine}

<!-- MediaUploaderStepPublishAndSharing.vue — publish immediately and schedule -->
<NotificationCard
  v-if="!uploaderStore.form.xAccountConnected"
  variant="notice"
  :title="t('mediaUploader.publish.connectXNotice')"
  :show-icon="false"
  :closable="false"
>
  <DashboardPrimaryButton
    :text="t('mediaUploader.publish.connectX')"
    variant="none"
    text-class="text-[12px] text-white"
    custom-class="py-1 px-2 w-max bg-border-notification-info-light text-[12px] text-white"
    @click="connectXAccount"
  />
</NotificationCard>`,
    submitWarning: `import { ExclamationTriangleIcon } from '@heroicons/vue/24/solid';
${importLine}

<!-- MediaUploaderStepSubmit.vue -->
<NotificationCard
  variant="warning"
  :icon="ExclamationTriangleIcon"
  :description="t('mediaUploader.submit.warning')"
  :closable="false"
/>`,
    previewUpload: `const { url: successTickUrl } = useAssetUrl('mediaUploader.icon.successTick');

<!-- MediaUploaderStepPreviewSettings.vue -->
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
</NotificationCard>`,
    tierAdded: `const { url: successTickUrl } = useAssetUrl('mediaUploader.icon.successTick');

<!-- MediaUploaderStepSubscriptionP2v.vue -->
<NotificationCard
  v-model="showTierAddedToast"
  variant="success-teal"
  :title="t('mediaUploader.subscription.tierAddedToast')"
  :closable="false"
>
  ${mintIconSlot}
</NotificationCard>`,
    uploadSuccess: `const { url: successTickUrl } = useAssetUrl('mediaUploader.icon.gallerySuccessTick');

<!-- UploadMediaPopup.vue — success toast (same look for video / image / audio / gallery / submitted) -->
<NotificationCard
  v-model="showSuccessToast"
  variant="success-teal"
  :title="t('mediaUploader.preview.uploadSuccess')"
  :closable="false"
>
  <template #icon>
    <div class="w-10 h-10 flex justify-center items-center rounded-lg bg-mediaUi-mintSoft overflow-hidden">
      <img v-if="successTickUrl" :src="successTickUrl" :alt="t('mediaUploader.preview.uploadSuccess')" class="w-7 h-7 object-contain" />
    </div>
  </template>
</NotificationCard>`,
    xRepostSaved: `${importLine}

<!-- XRepostPage.vue -->
<NotificationCard
  v-model="showSavedToast"
  variant="success-teal"
  :title="t('dashboard.xRepost.savedToast')"
>
  <template #icon>
    <div class="relative">
      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-400/10">
        <img v-if="assets.toastUpload" :src="assets.toastUpload" alt="" class="h-7 w-7 object-contain" />
      </div>
      <div class="absolute -bottom-2.5 -right-2.5 flex h-[22px] w-[23px] items-center justify-center">
        <img v-if="assets.toastSuccess" :src="assets.toastSuccess" alt="" class="h-[22px] w-[23px] object-contain" />
      </div>
    </div>
  </template>
</NotificationCard>`,
    paymentFailed: `${importLine}

<!-- PurchaseFlowSubscriptionOrderPopup.vue and GuestPurchaseFlowPopup.vue -->
<NotificationCard
  v-model="showPaymentFailedToast"
  variant="limit-exceeded"
  :title="t('booking.paymentFailedTitle')"
  :description="t('booking.paymentFailedDescription')"
  left-border-class="bg-[#FF4405]"
  title-class="text-[#FF4405] text-[14px] font-[600]"
>
  <template #icon>
    <div class="relative h-[40px] w-[40px]">
      <div class="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-[rgba(255,68,5,0.12)]">
        <img src="/images/checkout-payment-fail-cart.png" alt="" class="block h-[23px] w-[23px] object-contain" />
      </div>
      <div class="absolute -bottom-2.5 -right-2.5 flex h-[22px] w-[23px] items-center justify-center rounded-[8px] bg-[#FF4405]">
        <img src="/images/checkout-payment-fail-warning.png" alt="" class="block h-[12px] w-[12px] object-contain" />
      </div>
    </div>
  </template>
</NotificationCard>`,
    payoutFail: `import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
${importLine}

<!-- PayoutProcessingStatus.vue — single failed payout -->
<NotificationCard
  v-model="alertOpen"
  variant="error"
  theme="payoutFail"
  :show-icon="false"
  :closable="false"
  :title="t('payout.processing.failTitle')"
  :description="t('payout.processing.failDescriptionPrefix') + ' ' + t('payout.processing.defaults.failReason')"
>
  <DashboardPrimaryButton
    :text="t('payout.processing.defaults.actionUploadAddressProof')"
    theme="payoutFail"
    :right-icon="assets.arrowUpRight"
    @click="emitAction(normalizedPayouts[0])"
  />
</NotificationCard>`,
    withdrawAccepted: `${importLine}

<!-- WithdrawEarningsStep5.vue -->
<NotificationCard
  variant="success-teal"
  :title="t('payout.withdraw.step5.acceptedTitle')"
  :icon="assets.checkCircle"
  :closable="false"
/>`,
    planFeatured: `${importLine}

<!-- PlanDetail.vue -->
<NotificationCard
  v-if="isFeaturedProxy"
  variant="alert"
  :showIcon="false"
  :closable="false"
  :title="t('plan.detail.featuredAlertTitle')"
  :description="t('plan.detail.featuredAlertDescription')"
/>`,
    planTierPublished: `const { assets } = usePlanAssets();
${importLine}

<!-- PlanPage.vue — after publish / update-and-publish -->
<div class="pointer-events-none fixed right-2 top-2 z-[9999] h-max w-[calc(100%-1rem)] sm:w-[30rem]">
  <div class="pointer-events-auto">
    <NotificationCard
      v-model="showPublishToast"
      variant="success-teal"
      theme="planTierToast"
      :title="t('plan.toast.detailsUpdated')"
      :description="wasUpdate
        ? t('plan.toast.updatedAndPublished', { name })
        : t('plan.toast.published', { name })"
    >
      <template #icon>
        <div class="relative h-10 w-10 shrink-0">
          <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-[#2ED3B71A]">
            <img v-if="assets.toastKeyhole" :src="assets.toastKeyhole" alt="" class="h-[15px] w-[10px] object-contain" />
          </div>
          <div class="absolute -bottom-[0.563rem] -right-[0.563rem] flex h-[1.375rem] w-[1.375rem] items-center justify-center overflow-hidden rounded-full bg-[#2ed3b7]">
            <img v-if="assets.toastUploadCloud" :src="assets.toastUploadCloud" alt="" class="h-3.5 w-3.5 object-contain mix-blend-screen" />
          </div>
        </div>
      </template>
      <template #actions>
        <div class="flex w-full items-end justify-between gap-2 pt-1">
          <span class="text-xs leading-[1.125rem] text-[#98A2B3]">{{ t('plan.toast.justNow') }}</span>
          <button type="button" class="inline-flex items-center gap-0.5 text-xs font-medium leading-[1.125rem] text-teal-400">
            {{ t('plan.toast.viewInProfile') }}
            <svg class="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4.5 11.5 11.5 4.5M11.5 4.5H6.5M11.5 4.5V9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </template>
    </NotificationCard>
  </div>
</div>`,
    tipTokens: `${importLine}

<!-- TipStep2.vue -->
<NotificationCard
  theme="tipSuccess"
  variant="notice"
  :closable="false"
  :title="t('booking.tipSentTokens', { amount })"
  :badge-alt="t('booking.tipTokenAlt')"
/>`,
    tipLimit: `${importLine}

<!-- TipStep2.vue -->
<NotificationCard
  theme="tipLimit"
  variant="limit-exceeded"
  :closable="false"
  class="w-full"
  :title="t('booking.tipLimitExceeded')"
  :action-label="t('booking.tipSetToMax')"
  :alert-alt="t('booking.tipAlertAlt')"
  @action="setToMax"
/>`,
    bookingSubscribers: `${importLine}

<!-- UnifiedBookingForm.vue -->
<NotificationCard
  variant="alert"
  :showIcon="false"
  :title="t('booking.activeSubscribersTitle')"
  :description="t('booking.activeSubscribersDescription')"
/>`,
    bookingValidation: `${importLine}

<!-- OneOnOneBookingStep1.vue -->
<NotificationCard
  v-model="showTitleError"
  variant="error"
  :title="t('booking.validationTitle')"
  :description="t('booking.eventTitleRequired')"
  class="mb-4"
/>`,
    editUnsaved: `${importLine}

<!-- EditProfilePage.vue -->
<NotificationCard
  v-model="showNotification"
  variant="notice"
  :title="t('editProfile.page.notice.unsavedTitle')"
  :description="t('editProfile.page.notice.unsavedDescription')"
  :icon="assets.smileyFace"
  :badgeIcon="assets.infoSquare"
/>`,
    editGallerySuccess: `${importLine}

<NotificationCard
  v-model="isGalleryNotificationOpen"
  variant="success-teal"
  :title="t('editProfile.page.gallery.successTitle', { count })"
  :description="t('editProfile.page.gallery.successDescription')"
  :icon="assets.previewFallback"
  :badgeIcon="assets.tickMark"
/>`,
    editGalleryVideo: `${importLine}

<NotificationCard
  v-model="isGalleryNotificationOpen"
  variant="error"
  :title="t('editProfile.page.gallery.failOneTitle')"
  :description="t('editProfile.page.gallery.failVideoDesc', { name: file.name })"
  :icon="assets.previewFallback"
  :badgeIcon="assets.alertTriangle"
/>`,
    editGalleryAdd: `${importLine}

<NotificationCard
  v-model="isGalleryNotificationOpen"
  variant="error"
  :title="t('editProfile.page.gallery.failAddTitle')"
  :description="t('editProfile.page.gallery.failAddDesc', { name: file.name })"
  :icon="assets.previewFallback"
  :badgeIcon="assets.alertTriangle"
/>`,
}));
</script>

<style scoped>
.payment-fail-toast :deep(.border-b) {
    border-bottom-color: transparent;
}

.payment-fail-toast :deep(.dashboard-toast-inner-wrapper) {
    background: #000000e5 !important;
}

.payment-fail-toast :deep(.dashboard-toast-inner-wrapper::before) {
    content: none;
}

.payment-fail-toast :deep(.text-\[\#0F172A\]) {
    color: #f2f4f7;
}
</style>
