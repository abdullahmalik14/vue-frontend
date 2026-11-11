<script setup>
import { computed, onBeforeUnmount, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import NotificationCard from "@/components/ui/card/dashboard/NotificationCard.vue";
import CheckboxSwitch from "@/components/forms/checkboxes/CheckboxSwitch.vue";
import PublishDatePicker from "./parts/PublishDatePicker.vue";
import CheckboxGroup from "@/components/forms/checkboxes/CheckboxGroup.vue";
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue";
import BaseInput from "@/components/forms/inputs/BaseInput.vue";
import RadioGroup from "@/components/forms/radio/dashboard/RadioGroup.vue";
import PostPreview from "./parts/PostPreview.vue";
import Paragraph from "@/components/ui/typography/Paragraph.vue";
import Heading from "@/components/ui/typography/Heading.vue";
import DashboardTextInput from "@/components/forms/inputs/DashboardTextInput.vue";
import ThumbnailUploader from "./parts/ThumbnailUploader.vue";
import SocialCustomPreview from "./parts/SocialCustomPreview.vue";
import { useMediaUploaderStore } from "@/stores/useMediaUploaderStore";
import { useAssetUrl } from "@/composables/useAssetUrl.js";
import { useMediaInteractions } from "@/composables/useMediaInteractions.js";
import { interactionsEngine } from "@/utils/validation/interactionsEngine.js";
import MediaUploadTypeTabs from "./parts/MediaUploadTypeTabs.vue";

defineProps({
  hideFooterActions: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const SCOPE_ID = 'mediaUploaderPublish';
const {
  isVisible,
  fieldConfig,
  registerField,
  changeField,
  clear: clearInteractions,
} = useMediaInteractions(SCOPE_ID);

/** Minimum schedule time: now + 2 days (local). */
function getScheduleMinDate() {
  const min = new Date();
  min.setDate(min.getDate() + 2);
  min.setSeconds(0, 0);
  return min;
}

function formatDatetimeLocal(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function isScheduleDateAtLeastTwoDaysAhead(value) {
  if (!value) return true;
  const selected = new Date(value);
  if (Number.isNaN(selected.getTime())) return false;
  return selected.getTime() >= getScheduleMinDate().getTime();
}

const { url: backIconUrl } = useAssetUrl('mediaUploader.icon.back');
const { url: nextIconUrl } = useAssetUrl('mediaUploader.icon.next');
const { url: publishIconUrl } = useAssetUrl('mediaUploader.icon.publish');
const { url: scheduleIconUrl } = useAssetUrl('mediaUploader.icon.schedule');
const { url: infoIconUrl } = useAssetUrl('mediaUploader.icon.info');

const postImmediateConfig = fieldConfig('postToSocials_Immediate');
const postScheduleConfig = fieldConfig('postToSocials_Schedule');
const featureComingSoonConfig = fieldConfig('featureOnComingSoon');
const socialThumbModeConfig = fieldConfig('socialThumbnailMode');

function socialPanelVisible(toggleOn) {
  return !!toggleOn && !!uploaderStore.form.xAccountConnected;
}

function syncSocialPanels() {
  changeField(postImmediateConfig, !!uploaderStore.form.postToSocials_Immediate, 'socialImmediate', socialPanelVisible);
  changeField(postScheduleConfig, !!uploaderStore.form.postToSocials_Schedule, 'socialSchedule', socialPanelVisible);
}

function connectXAccount() {
  uploaderStore.updateFormField("xAccountConnected", true);
  syncSocialPanels();
}

const publishTabs = computed(() => [
  {
    id: "publishImmediately",
    label: t("mediaUploader.publish.publishImmediately"),
    icon: publishIconUrl.value,
  },
  {
    id: "schedulePublish",
    label: t("mediaUploader.publish.schedulePublish"),
    icon: scheduleIconUrl.value,
  },
]);

const postToSocialsImmediateModel = computed({
  get: () => uploaderStore.form.postToSocials_Immediate || false,
  set: (val) => {
    uploaderStore.updateFormField("postToSocials_Immediate", val);
    changeField(postImmediateConfig, val, 'socialImmediate', socialPanelVisible);
  },
});

const postToSocialsScheduleModel = computed({
  get: () => uploaderStore.form.postToSocials_Schedule || false,
  set: (val) => {
    uploaderStore.updateFormField("postToSocials_Schedule", val);
    changeField(postScheduleConfig, val, 'socialSchedule', socialPanelVisible);
  },
});

const socialMessageModel = computed({
  get: () => uploaderStore.form.socialPostMessage || "",
  set: (val) => uploaderStore.updateFormField("socialPostMessage", val)
});

const socialThumbnailModeModel = computed({
  get: () => uploaderStore.form.socialThumbnailMode || "useOriginal",
  set: (val) => {
    uploaderStore.updateFormField("socialThumbnailMode", val);
    changeField(socialThumbModeConfig, val, 'customThumb', (v) => v === 'useCustom');
  },
});

const scheduleDateConfig = computed(() => ({
  scope: SCOPE_ID,
  id: 'scheduledPublishDateTime',
  validation: {
    required: false,
    rules: [
      {
        type: 'custom',
        message: t('mediaUploader.publish.scheduleMessage'),
        param: (value) => isScheduleDateAtLeastTwoDaysAhead(value),
      },
    ],
  },
  validateOnInput: true,
  validateOnMount: true,
}));

const scheduleDateModel = computed({
  get: () => uploaderStore.form.scheduledPublishDateTime || "",
  set: (val) => {
    uploaderStore.updateFormField("scheduledPublishDateTime", val);
    interactionsEngine.processFieldChange(scheduleDateConfig.value, val);
  },
});

const scheduleDateFieldState = computed(() =>
  interactionsEngine.getFieldState(scheduleDateConfig.value),
);

const isScheduleDateInvalid = computed(() => {
  if (!scheduleDateModel.value) return false;
  return !!scheduleDateFieldState.value && !scheduleDateFieldState.value.isValid;
});

const scheduleDateMessage = computed(() =>
  scheduleDateFieldState.value?.failedRules?.[0]?.message ||
  t('mediaUploader.publish.scheduleMessage'),
);

const scheduleDateMessageColor = computed(() =>
  isScheduleDateInvalid.value ? 'text-error' : 'text-dark-gray',
);

const scheduleDateMin = computed(() => formatDatetimeLocal(getScheduleMinDate()));

const featureOnComingSoonModel = computed({
  get: () => uploaderStore.form.featureOnComingSoon || false,
  set: (val) => {
    uploaderStore.updateFormField("featureOnComingSoon", val);
    changeField(featureComingSoonConfig, val, 'featurePanel');
  },
});

const preOrderPriceModel = computed({
  get: () => uploaderStore.form.preOrderPrice,
  set: (val) => uploaderStore.updateFormField("preOrderPrice", val)
});

const transferTypeOptions = computed(() => [
  { value: "useOriginal", label: t('mediaUploader.publish.useOriginal') },
  { value: "useCustom", label: t('mediaUploader.publish.useCustom') },
  { value: "none", label: t('mediaUploader.publish.none') },
]);

onMounted(() => {
  registerField(postImmediateConfig, postToSocialsImmediateModel.value, 'socialImmediate', socialPanelVisible);
  registerField(postScheduleConfig, postToSocialsScheduleModel.value, 'socialSchedule', socialPanelVisible);
  registerField(featureComingSoonConfig, featureOnComingSoonModel.value, 'featurePanel');
  registerField(
    socialThumbModeConfig,
    socialThumbnailModeModel.value,
    'customThumb',
    (v) => v === 'useCustom',
  );
  interactionsEngine.register(
    scheduleDateConfig.value,
    scheduleDateModel.value,
    null,
  );
});

watch(() => uploaderStore.form.xAccountConnected, () => {
  syncSocialPanels();
});

onBeforeUnmount(() => {
  clearInteractions();
});
</script>

<template>
  <div data-component="media-uploader-step-publish" class="relative py-[16px] px-[10px] lg:px-[24px]">

    <div class="mb-[50px]">
      <div @click="uploaderStore.setStep(3)" class="flex gap-2 items-center cursor-pointer">
        <img :src="backIconUrl" :alt="t('mediaUploader.shell.back')" />
        <button type="button" class="text-xs font-medium leading-[1.125rem] text-medium-text break-words">
          {{ t('mediaUploader.shell.back') }}
        </button>
      </div>

      <Heading tag="h4" theme="custom" no-wrap add-class="text-secondary-text text-sm font-[700] leading-normal not-italic my-[10px]" :text="t('mediaUploader.publish.whenTitle')" />

      <MediaUploadTypeTabs
        :tabs="publishTabs"
        :model-value="uploaderStore.substep"
        :tabs-aria-label="t('mediaUploader.publish.whenTitle')"
        @update:model-value="(id) => uploaderStore.setSubstep(id)"
      />

      <!-- substep 1 -->
      <div v-if="uploaderStore.substep === 'publishImmediately'">
        <div class="text-almost-black text-[14px] mt-4 mb-6">
          {{ t('mediaUploader.publish.immediateHelp') }}
        </div>

        <div>
          <Heading tag="h4" theme="custom" no-wrap add-class="text-secondary-text text-sm font-[700] leading-normal not-italic my-[10px]" :text="t('mediaUploader.publish.shareSettings')" />

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
          </NotificationCard>

          <CheckboxSwitch
            v-else
            :label="t('mediaUploader.publish.postToX')"
            id="publish-media-toggle-imm"
            v-model="postToSocialsImmediateModel"
          />

          <div v-if="isVisible('socialImmediate')">
            <div class="flex justify-between gap-[24px]">
              <div class="flex-1">
                <div class="mt-4 mb-4 flex flex-col gap-2">
                  <div class="text-[14px] font-[600] text-text-primary">
                    {{ t('mediaUploader.publish.postMessageLabel') }}
                  </div>
  
                  <BaseInput type="textarea" v-model="socialMessageModel"
                    :placeholder="t('mediaUploader.publish.postMessagePlaceholder')"
                    :maxLength="1000"
                    inputClass="bg-white/50 w-full px-3 py-3 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 text-[16px] resize-none overflow-hidden placeholder:whitespace-normal" />
  
                </div>
  
                <div>
                  <RadioGroup
                    v-model="socialThumbnailModeModel"
                    name="socialMode"
                    :label="t('mediaUploader.publish.attachMedia')"
                    :options="transferTypeOptions"
                    theme="dashboard"
                  />
                </div>
              </div>
  
              <div class="hidden md:flex shrink-0 min-w-0">
                <PostPreview />
              </div>
            </div>
  
            <div v-if="isVisible('customThumb')" class="md:flex justify-between gap-4 mt-4">
              <div class="w-full">
                <SocialCustomPreview 
                  v-if="uploaderStore.form.socialThumbnailCustomImageSrc"
                  :src="uploaderStore.form.socialThumbnailCustomImageSrc"
                  :label="t('mediaUploader.publish.thumbnail')"
                  type="image"
                  @preview-delete="uploaderStore.updateFormField('socialThumbnailCustomImageSrc', '')"
                />
                <ThumbnailUploader v-else :subtitle="t('mediaUploader.publish.imageDropSubtitle')"
                  :fileInfo="t('mediaUploader.publish.imageFileInfo')" stateUrlKey="socialThumbnailCustomImageSrc"
                  stateFileKey="socialThumbnailCustomImageFile" />
              </div>
              <div class="w-full mt-2 md:mt-0">
                <SocialCustomPreview 
                  v-if="uploaderStore.form.socialThumbnailCustomVideoSrc"
                  :src="uploaderStore.form.socialThumbnailCustomVideoSrc"
                  :label="t('mediaUploader.publish.trailer')"
                  type="video"
                  @preview-delete="uploaderStore.updateFormField('socialThumbnailCustomVideoSrc', '')"
                />
                <ThumbnailUploader v-else :subtitle="t('mediaUploader.publish.videoDropSubtitle')"
                  :fileInfo="t('mediaUploader.publish.videoFileInfo')"
                  stateUrlKey="socialThumbnailCustomVideoSrc" stateFileKey="socialThumbnailCustomVideoFile"
                  accept="video/*" />
              </div>
            </div>
  
            <div class="md:hidden mt-2 w-full min-w-0">
              <PostPreview />
            </div>
          </div>
        </div>
      </div>
      <!-- substep 2 -->
      <div v-else-if="uploaderStore.substep === 'schedulePublish'">

        <PublishDatePicker
          v-model="scheduleDateModel"
          :label="t('mediaUploader.publish.scheduleLabel')"
          :message="scheduleDateMessage"
          :message-color="scheduleDateMessageColor"
          :min="scheduleDateMin"
        />

        <div class="mt-4 mb-4 flex gap-2 items-center">
          <CheckboxGroup :label="t('mediaUploader.publish.featureComingSoon')" v-model="featureOnComingSoonModel"
            theme="successTickSm"
            labelClass="text-[16px] leading-4 text-black font-[500] cursor-pointer"
            wrapperClass="flex items-center leading-none" />
          <div class="relative group">
            <img :src="infoIconUrl" alt="" class="cursor-pointer" />
            <div
              class="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-mediaUi-tooltip text-white text-xs px-3 py-2 shadow-lg z-50 w-[280px] rounded-[8px]">
              {{ t('mediaUploader.publish.featureComingSoonTip') }}
            </div>
          </div>
        </div>

        <div v-if="isVisible('featurePanel')">
          <div class="ml-6">
            <Paragraph :text="t('mediaUploader.publish.preorderPrice')" font-size="text-[14px]" font-weight="font-[400]"
              font-color="text-text-quaternary" />
          </div>

          <div class="sm:w-[380px] ml-6">
            <DashboardTextInput
              id="input_preorder"
              type="number"
              v-model="preOrderPriceModel"
              :show-label="false"
              rightSpan
              :rightSpanText="t('mediaUploader.publish.preorderUsd')"
            />
          </div>
          <ul class="list-disc ml-[40px] text-[14px] text-dark-gray mt-2">
            <li>{{ t('mediaUploader.publish.preorderBullet1') }}</li>
            <li>{{ t('mediaUploader.publish.preorderBullet2') }}</li>
          </ul>
        </div>

        <div>
          <Heading tag="h4" theme="custom" no-wrap add-class="text-text-quaternary text-sm font-[700] leading-normal not-italic mb-[12px] mt-[20px]" :text="t('mediaUploader.publish.shareSettings')" />
 
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
          </NotificationCard>

          <CheckboxSwitch
            v-else
            :label="t('mediaUploader.publish.postToX')"
            id="publish-media-toggle-sched"
            v-model="postToSocialsScheduleModel"
          />

          <div v-if="isVisible('socialSchedule')">
            <div class="flex justify-between gap-[24px]">
              <div class="flex-1">
                <div class="mt-4 mb-4 flex flex-col gap-2">
                  <div class="text-[14px] font-[600] text-text-primary">
                    {{ t('mediaUploader.publish.postMessageLabel') }}
                  </div>
  
                  <BaseInput type="textarea" v-model="socialMessageModel"
                    :placeholder="t('mediaUploader.publish.postMessagePlaceholder')"
                    :maxLength="1000"
                    inputClass="bg-white/50 w-full px-3 py-3 rounded-tl-sm rounded-tr-sm outline-none border-b border-gray-300 text-[16px] resize-none overflow-hidden placeholder:whitespace-normal" />
  
                </div>
  
                <div>
                  <RadioGroup
                    v-model="socialThumbnailModeModel"
                    name="socialMode2"
                    :label="t('mediaUploader.publish.attachMedia')"
                    :options="transferTypeOptions"
                    theme="dashboard"
                  />
                </div>
              </div>
  
              <div class="hidden md:flex shrink-0 min-w-0">
                <PostPreview />
              </div>
            </div>
  
            <div v-if="isVisible('customThumb')" class="md:flex justify-between gap-4 mt-4">
              <div class="w-full">
                <SocialCustomPreview 
                  v-if="uploaderStore.form.socialThumbnailCustomImageSrc"
                  :src="uploaderStore.form.socialThumbnailCustomImageSrc"
                  :label="t('mediaUploader.publish.thumbnail')"
                  type="image"
                  @preview-delete="uploaderStore.updateFormField('socialThumbnailCustomImageSrc', '')"
                />
                <ThumbnailUploader v-else :subtitle="t('mediaUploader.publish.imageDropSubtitle')"
                  :fileInfo="t('mediaUploader.publish.imageFileInfo')" stateUrlKey="socialThumbnailCustomImageSrc"
                  stateFileKey="socialThumbnailCustomImageFile" />
              </div>
              <div class="w-full mt-2 md:mt-0">
                <SocialCustomPreview 
                  v-if="uploaderStore.form.socialThumbnailCustomVideoSrc"
                  :src="uploaderStore.form.socialThumbnailCustomVideoSrc"
                  :label="t('mediaUploader.publish.trailer')"
                  type="video"
                  @preview-delete="uploaderStore.updateFormField('socialThumbnailCustomVideoSrc', '')"
                />
                <ThumbnailUploader v-else :subtitle="t('mediaUploader.publish.videoDropSubtitle')"
                  :fileInfo="t('mediaUploader.publish.videoFileInfo')"
                  stateUrlKey="socialThumbnailCustomVideoSrc" stateFileKey="socialThumbnailCustomVideoFile"
                  accept="video/*" />
              </div>
            </div>
  
            <div class="md:hidden mt-2 w-full min-w-0">
              <PostPreview />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!hideFooterActions" class="flex justify-end md:mt-0 mt-4">
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
        @click="uploaderStore.setStep(5)"
      />
    </div>
  </div>
</template>