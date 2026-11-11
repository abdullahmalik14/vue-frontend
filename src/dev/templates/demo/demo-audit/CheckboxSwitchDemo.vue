<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.checkboxSwitch.sectionTitle')" />
        <div class="flex flex-col gap-10 max-w-3xl">
            <!-- MediaUploaderStepPublishAndSharing — default switch, panel via interactionsEngine -->
            <div class="flex flex-col gap-3">
                <CheckboxSwitch
                    :label="t('mediaUploader.publish.postToX')"
                    id="publish-media-toggle-imm"
                    v-model="postToXModel"
                />
                <div v-if="publishIx.isVisible('socialImmediate')" class="mt-4 flex flex-col gap-2">
                    <div class="text-[14px] font-[600] text-text-primary">
                        {{ t('mediaUploader.publish.postMessageLabel') }}
                    </div>
                </div>
                <ShowCodeToggle :code="code.postToX" />
            </div>

            <!-- MediaUploaderStepSubscriptionP2v — row switch reveals plan checkboxes -->
            <div class="flex flex-col gap-3">
                <CheckboxSwitch
                    :label="t('mediaUploader.subscription.linkToggle')"
                    id="link-subscription-toggle"
                    v-model="linkSubscriptionModel"
                    theme="linkRow"
                />
                <div v-if="publishIx.isVisible('linkPanel')" class="mt-4 w-full min-w-0">
                    <CheckboxGroup
                        :label="t('mediaUploader.subscription.plans.free')"
                        v-model="planSelected"
                        :checkboxClass="planCheckboxClass"
                        :labelClass="planLabelClass"
                        custom-check-mark
                        wrapperClass="flex items-center w-full min-w-0 max-w-full"
                    />
                </div>
                <ShowCodeToggle :code="code.linkSubscription" />
            </div>

            <!-- VideoThumbnailSelector — wrapper label, blur controls via interactionsEngine -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <CheckboxSwitch
                        :label="t('mediaUploader.thumbnail.blurToggle')"
                        showWrapperLabel
                        id="blur-thumbnail-toggle"
                        v-model="blurModel"
                    />
                    <div :class="{ 'opacity-50 pointer-events-none': !publishIx.isVisible('blurControls') }">
                        <BlurEffect v-model="blurLevel" />
                    </div>
                </div>
                <ShowCodeToggle :code="code.blur" />
            </div>

            <!-- MediaFilterPopup — icon row, no switch label -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2 min-h-10">
                    <img
                        v-if="p2vIconUrl"
                        :src="p2vIconUrl"
                        alt=""
                        class="w-5 h-5 shrink-0 object-contain mix-blend-multiply dark:mix-blend-normal dark:invert"
                    />
                    <span class="flex-1 min-w-0 text-[14px] leading-normal font-medium text-text-primary truncate dark:text-timberwolf">
                        {{ t('mediaUploader.library.filterPopup.payToViewAvailable') }}
                        <span class="ml-0.5 text-[12px] font-normal leading-none text-text-primary align-super">{{ payToViewCount }}</span>
                    </span>
                    <CheckboxSwitch
                        id="media-filter-p2v"
                        v-model="payToViewOnlyModel"
                        label=""
                        theme="filter"
                    />
                </div>
                <ShowCodeToggle :code="code.filterP2v" />
            </div>

            <!-- MediaUploaderStepPreviewSettings — trailer toggle + helper text below -->
            <div class="flex flex-col gap-3">
                <div data-component="media-trailer-setting">
                    <CheckboxSwitch
                        :label="t('mediaUploader.trailerSetting.label')"
                        id="show-preview-toggle-demo"
                        v-model="showPreviewTrailerModel"
                    />
                    <Paragraph
                        theme="custom"
                        no-wrap
                        add-class="ml-10 text-almost-black text-[14px] font-[400]"
                        :text="t('mediaUploader.trailerSetting.paragraph')"
                    />
                </div>
                <ShowCodeToggle :code="code.trailerPreview" />
            </div>

            <!-- PlanDetail — semibold label, alert when on -->
            <div class="flex flex-col gap-3">
                <CheckboxSwitch
                    v-model="isFeatured"
                    :label="t('plan.detail.featuredTier')"
                    id="featured-tier"
                    theme="planFeatured"
                />
                <div class="ml-12 flex flex-col gap-1">
                    <Paragraph theme="custom" no-wrap add-class="text-sm text-[#0C111D] dark:text-[#dbd8d3]" :text="t('plan.detail.featuredHelp')" />
                    <NotificationCard
                        v-if="isFeatured"
                        variant="alert"
                        :showIcon="false"
                        :closable="false"
                        :title="t('plan.detail.featuredAlertTitle')"
                        :description="t('plan.detail.featuredAlertDescription')"
                    />
                </div>
                <ShowCodeToggle :code="code.featuredTier" />
            </div>

            <!-- LuckyDrawEventPopup — medium label + tooltip -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <CheckboxSwitch
                        v-model="luckyDrawPostToX"
                        :label="t('plan.luckyDraw.popup.postToX')"
                        id="lucky-draw-post-to-x"
                        theme="plan"
                    />
                    <BaseTooltip placement="top" :width="220">
                        <p class="text-xs leading-normal font-medium text-white dark:text-[#dbd8d3]">
                            {{ t('plan.luckyDraw.popup.postToXTooltip') }}
                        </p>
                    </BaseTooltip>
                </div>
                <ShowCodeToggle :code="code.luckyDraw" />
            </div>

            <!-- OneOnOneBookingStep2 — theme + icon (same row packing as lucky-draw sample) -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <CheckboxSwitch
                        v-model="xPostLive"
                        :label="t('demo.checkboxSwitch.booking.xPostLive')"
                        theme="dashboard"
                        :wrapper-label="t('demo.checkboxSwitch.wrapperLabels.darkMode')"
                    />
                    <img class="w-4 h-5 shrink-0" :src="bookingHelpIconUrl" alt="" />
                </div>
                <ShowCodeToggle :code="code.booking" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CheckboxSwitch from '@/components/forms/checkboxes/CheckboxSwitch.vue';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import BlurEffect from '@/components/media/uploader/parts/BlurEffect.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import BaseTooltip from '@/dev/components/plan/parts/BaseTooltip.vue';
import NotificationCard from '@/components/ui/card/dashboard/NotificationCard.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { useMediaInteractions } from '@/composables/useMediaInteractions.js';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const { url: p2vIconUrl } = useAssetUrl('mediaUploader.icon.filterP2v');
const { url: bookingHelpIconUrl } = useAssetUrl('icon.booking.help');

const publishIx = useMediaInteractions('demoCheckboxSwitch');
const { fieldConfig, registerField, changeField } = publishIx;

const planCheckboxClass =
    'h-4 w-4 box-border appearance-none [-webkit-appearance:none] bg-white border border-gray-300 rounded-[4px] checked:bg-success checked:border-success before:!hidden after:!hidden';
const planLabelClass =
    'text-[14px] text-text-primary font-[400] cursor-pointer truncate min-w-0';

const xAccountConnected = ref(true);
const postToX = ref(false);
const linkSubscription = ref(false);
const planSelected = ref(false);
const blurOn = ref(false);
const blurLevel = ref('low');
const payToViewOnly = ref(false);
const showPreviewTrailer = ref(false);
const isFeatured = ref(false);
const luckyDrawPostToX = ref(false);
const xPostLive = ref(false);

const postConfig = fieldConfig('postToSocials_Immediate');
const linkConfig = fieldConfig('linkToSubscriptionPlan');
const blurConfig = fieldConfig('blurThumbnail');
const filterP2vConfig = fieldConfig('payToViewOnly');
const trailerPreviewConfig = fieldConfig('showPreviewTrailer_Screenshot');

function socialPanelVisible(toggleOn) {
    return !!toggleOn && xAccountConnected.value;
}

const postToXModel = computed({
    get: () => postToX.value,
    set: (val) => {
        postToX.value = val;
        changeField(postConfig, val, 'socialImmediate', socialPanelVisible);
    },
});

const linkSubscriptionModel = computed({
    get: () => linkSubscription.value,
    set: (val) => {
        linkSubscription.value = val;
        changeField(linkConfig, val, 'linkPanel');
    },
});

const blurModel = computed({
    get: () => blurOn.value,
    set: (val) => {
        blurOn.value = val;
        changeField(blurConfig, val, 'blurControls');
    },
});

const payToViewOnlyModel = computed({
    get: () => payToViewOnly.value,
    set: (val) => {
        payToViewOnly.value = !!val;
        changeField(filterP2vConfig, !!val);
    },
});

const showPreviewTrailerModel = computed({
    get: () => showPreviewTrailer.value,
    set: (val) => {
        showPreviewTrailer.value = !!val;
        changeField(trailerPreviewConfig, !!val, 'showPreviewTrailer_Screenshot');
    },
});

const libraryItems = computed(() => uploaderStore.libraryItems || []);
const payToViewCount = computed(
    () => libraryItems.value.filter((item) => Boolean(String(item.price || '').trim())).length,
);

onMounted(() => {
    registerField(postConfig, postToX.value, 'socialImmediate', socialPanelVisible);
    registerField(linkConfig, linkSubscription.value, 'linkPanel');
    registerField(blurConfig, blurOn.value, 'blurControls');
    registerField(filterP2vConfig, payToViewOnly.value);
    registerField(
        trailerPreviewConfig,
        showPreviewTrailer.value,
        'showPreviewTrailer_Screenshot',
    );
});

onBeforeUnmount(() => {
    publishIx.clear();
});

const code = computed(() => ({
    postToX: `import { useMediaInteractions } from '@/composables/useMediaInteractions.js';

const { isVisible, fieldConfig, registerField, changeField } = useMediaInteractions('mediaUploaderPublish');
const postImmediateConfig = fieldConfig('postToSocials_Immediate');

function socialPanelVisible(toggleOn) {
  return !!toggleOn && !!uploaderStore.form.xAccountConnected;
}

onMounted(() => {
  registerField(postImmediateConfig, postToSocialsImmediateModel.value, 'socialImmediate', socialPanelVisible);
});

<CheckboxSwitch
  :label="t('mediaUploader.publish.postToX')"
  id="publish-media-toggle-imm"
  v-model="postToSocialsImmediateModel"
/>
<div v-if="isVisible('socialImmediate')">
  <div class="text-[14px] font-[600] text-text-primary">
    {{ t('mediaUploader.publish.postMessageLabel') }}
  </div>
</div>`,
    linkSubscription: `<CheckboxSwitch
  :label="t('mediaUploader.subscription.linkToggle')"
  id="link-subscription-toggle"
  v-model="linkSubscriptionModel"
  theme="linkRow"
/>
<div v-if="isVisible('linkPanel')">
  <CheckboxGroup
    :label="item.label"
    :modelValue="isPlanSelected(item.id)"
    custom-check-mark
    :checkboxClass="planCheckboxClass"
    :labelClass="planLabelClass"
    wrapperClass="flex items-center w-full min-w-0 max-w-full"
    @update:modelValue="(val) => togglePlan(item.id, val)"
  />
</div>`,
    blur: `<CheckboxSwitch
  :label="t('mediaUploader.thumbnail.blurToggle')"
  showWrapperLabel
  id="blur-thumbnail-toggle"
  v-model="blurModel"
/>
<div :class="{ 'opacity-50 pointer-events-none': !isBlurVisible('blurControls') }">
  <BlurEffect v-model="blurLevelModel" />
</div>`,
    filterP2v: `<CheckboxSwitch
  id="media-filter-p2v"
  v-model="payToViewOnlyModel"
  label=""
  theme="filter"
/>`,
    trailerPreview: `import Paragraph from '@/components/ui/typography/Paragraph.vue';

<!-- MediaUploaderStepPreviewSettings.vue — trailer settings -->
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
</div>`,
    featuredTier: `<CheckboxSwitch
  v-model="isFeaturedProxy"
  :label="t('plan.detail.featuredTier')"
  id="featured-tier"
  theme="planFeatured"
/>
<NotificationCard
  v-if="isFeaturedProxy"
  variant="alert"
  :showIcon="false"
  :closable="false"
  :title="t('plan.detail.featuredAlertTitle')"
  :description="t('plan.detail.featuredAlertDescription')"
/>`,
    luckyDraw: `<div class="flex items-center gap-2">
  <CheckboxSwitch
    v-model="postToX"
    :label="t('plan.luckyDraw.popup.postToX')"
    id="lucky-draw-post-to-x"
    theme="plan"
  />
  <BaseTooltip placement="top" :width="220">
    <p class="text-xs leading-normal font-medium text-white dark:text-[#dbd8d3]">
      {{ t('plan.luckyDraw.popup.postToXTooltip') }}
    </p>
  </BaseTooltip>
</div>`,
    booking: `<div class="flex items-center gap-2">
  <CheckboxSwitch
    v-model="formData.xPostLive"
    :label="t('demo.checkboxSwitch.booking.xPostLive')"
    theme="dashboard"
    :wrapper-label="t('demo.checkboxSwitch.wrapperLabels.darkMode')"
  />
  <img class="w-4 h-5 shrink-0" :src="bookingHelpIconUrl" alt="" />
</div>`,
}));
</script>
