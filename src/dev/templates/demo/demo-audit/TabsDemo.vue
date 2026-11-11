<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.tabs.sectionTitle')" />
        <DemoPageViewport variant="dashboard">
            <div class="w-full flex flex-col gap-10">
                <!-- DashboardOrdersReceivedPage — default DashboardTabs (desktop pills + mobile dropdown) -->
                <div class="flex flex-col gap-3 max-w-3xl">
                    <div :class="demoDashboardTabsFitClass">
                        <DashboardTabs v-model="ordersTab" :tabs="ordersTabList" />
                    </div>
                    <ShowCodeToggle :code="code.dashboardOrders" />
                </div>

                <!-- XRepostPage — tabs-only + counts + white active -->
                <div class="flex flex-col gap-3 max-w-3xl">
                    <div :class="demoDashboardTabsFitClass">
                        <DashboardTabs
                            v-model="xRepostTab"
                            :tabs="xRepostTabList"
                            tabs-only
                            active-tab-class="bg-[#FFFFFF] text-[#0C111D] font-semibold"
                            inactive-tab-class="bg-transparent text-[#667085] font-medium hover:bg-transparent"
                        />
                    </div>
                    <ShowCodeToggle :code="code.dashboardXRepost" />
                </div>

                <!-- DashboardAnalyticsTopMediaTable — compact + tabs-only + black active -->
                <div class="flex flex-col gap-3 max-w-3xl">
                    <div :class="demoDashboardTabsFitClass">
                        <DashboardTabs
                            class="shrink-0"
                            compact
                            :tabs="topMediaTabs"
                            v-model="topMediaTab"
                            active-tab-class="bg-black text-white font-semibold"
                            inactive-tab-class="bg-transparent text-black font-medium"
                            tabs-only
                        />
                    </div>
                    <ShowCodeToggle :code="code.dashboardAnalyticsTopMedia" />
                </div>

                <!-- UploadMediaPopup — media type tabs with icons -->
                <div class="flex flex-col gap-3 max-w-3xl">
                    <MediaUploadTypeTabs
                        :tabs="mediaTypeTabs"
                        v-model="mediaTypeTab"
                        :tabs-aria-label="t('mediaUploader.uploadPopup.tabsAria')"
                    />
                    <ShowCodeToggle :code="code.mediaUploadTypes" />
                </div>

                <!-- MediaUploaderStepPreviewSettings — video thumbnail substeps -->
                <div class="flex flex-col gap-3 max-w-3xl">
                    <MediaUploadTypeTabs
                        :tabs="previewSubstepTabs"
                        v-model="previewSubstep"
                        :tabs-aria-label="t('mediaUploader.preview.thumbnailSettings')"
                    />
                    <ShowCodeToggle :code="code.mediaPreviewSubsteps" />
                </div>

                <!-- MediaUploaderStepPublishAndSharing — publish when -->
                <div class="flex flex-col gap-3 max-w-3xl">
                    <MediaUploadTypeTabs
                        :tabs="publishTabs"
                        v-model="publishSubstep"
                        :tabs-aria-label="t('mediaUploader.publish.whenTitle')"
                    />
                    <ShowCodeToggle :code="code.mediaPublishWhen" />
                </div>

                <!-- MediaUploaderPage — MyMediaTabs library status -->
                <div class="flex flex-col gap-3 max-w-3xl">
                    <div class="w-fit max-w-full">
                        <MyMediaTabs v-model="libraryTab" :tabs="libraryTabList" />
                    </div>
                    <ShowCodeToggle :code="code.myMediaTabs" />
                </div>

                <!-- ServiceTabsSection — HomeServiceTabNav (demo: wrap, no x-scroll; real page keeps overflow-x-auto) -->
                <div class="flex flex-col gap-3 w-full">
                    <div :class="demoHomeServiceTabsClass">
                        <HomeServiceTabNav :tabs="homeServiceTabs" />
                    </div>
                    <ShowCodeToggle :code="code.homeServiceTabNav" />
                </div>
            </div>
        </DemoPageViewport>
    </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import DashboardTabs from '@/components/ui/nav/dashboard/DashboardTabs.vue';
import MediaUploadTypeTabs from '@/components/media/uploader/parts/MediaUploadTypeTabs.vue';
import MyMediaTabs from '@/templates/media/media-creator/MyMediaTabs.vue';
import HomeServiceTabNav from '@/dev/components/home/homeComponents/HomeServiceTabNav.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import DemoPageViewport from '@/dev/templates/demo/DemoPageViewport.vue';

const { t } = useI18n();

/**
 * Demo-only: DashboardTabs uses `w-full` below `lg` and `flex-1` tab items.
 * Force content-sized pills on DemoPage without changing the component.
 */
const demoDashboardTabsFitClass =
  'w-fit max-w-full [&_.relative]:w-fit [&_.relative]:max-w-full [&_.relative>div]:!w-fit [&_.relative>div]:!max-w-full [&_.relative>div_[data-value]]:!flex-none';

/**
 * Demo-only: HomeServiceTabNav scrolls on real home; here wrap so every tab stays visible.
 */
const demoHomeServiceTabsClass =
  'w-full overflow-visible [&>div]:!overflow-x-visible [&>div]:!overflow-y-visible [&>div]:!px-0 [&>div]:!justify-start [&_ul]:!flex-wrap [&_ul]:!justify-start';

const { url: videoIconUrl } = useAssetUrl('mediaUploader.icon.tabVideo');
const { url: imageIconUrl } = useAssetUrl('mediaUploader.icon.tabSingleImage');
const { url: galleryIconUrl } = useAssetUrl('mediaUploader.icon.tabGallery');
const { url: audioIconUrl } = useAssetUrl('mediaUploader.icon.tabAudio');
const { url: screenshotIconUrl } = useAssetUrl('mediaUploader.icon.screenshot');
const { url: placeholderIconUrl } = useAssetUrl('mediaUploader.icon.placeholder');
const { url: uploadIconUrl } = useAssetUrl('mediaUploader.icon.upload');
const { url: publishIconUrl } = useAssetUrl('mediaUploader.icon.publish');
const { url: scheduleIconUrl } = useAssetUrl('mediaUploader.icon.schedule');

const ordersTab = ref('progress');
const xRepostTab = ref('all');
const topMediaTab = ref('Views');
const mediaTypeTab = ref('video');
const previewSubstep = ref('chooseScreenshot');
const publishSubstep = ref('publishImmediately');
const libraryTab = ref('all');

/** Same shape as DashboardOrdersReceivedPage.vue */
const ordersTabList = computed(() => [
    { id: 'progress', labelKey: 'dashboard.orders.tabs.inProgress' },
    { id: 'Completed', labelKey: 'dashboard.orders.tabs.completed' },
    { id: 'Canceled', labelKey: 'dashboard.orders.tabs.canceled' },
    { id: 'All', labelKey: 'dashboard.orders.tabs.all' },
]);

/** Same shape as XRepostPage.vue (counts from rules list) */
const xRepostTabList = computed(() => [
    { id: 'all', labelKey: 'dashboard.xRepost.filters.tabs.all', count: 5 },
    { id: 'published', labelKey: 'dashboard.xRepost.filters.tabs.published', count: 3 },
    { id: 'draft', labelKey: 'dashboard.xRepost.filters.tabs.draft', count: 2 },
]);

/** Same shape as DashboardAnalyticsTopMediaTable.vue */
const topMediaTabs = computed(() => [
    { id: 'Views', label: t('dashboard.analytics.tables.media.viewsTab') },
    { id: 'P2V Sales', label: t('dashboard.analytics.tables.media.p2vSalesTab') },
]);

/** Same shape as UploadMediaPopup.vue */
const mediaTypeTabs = computed(() => [
    { id: 'video', label: t('mediaUploader.uploadPopup.tabs.video'), icon: videoIconUrl.value },
    { id: 'singleImage', label: t('mediaUploader.uploadPopup.tabs.singleImage'), icon: imageIconUrl.value },
    { id: 'imageGallery', label: t('mediaUploader.uploadPopup.tabs.imageGallery'), icon: galleryIconUrl.value },
    { id: 'audio', label: t('mediaUploader.uploadPopup.tabs.audio'), icon: audioIconUrl.value },
]);

/** Same shape as MediaUploaderStepPreviewSettings.vue — video preview substeps */
const previewSubstepTabs = computed(() => [
    { id: 'chooseScreenshot', label: t('mediaUploader.preview.chooseScreenshot'), icon: screenshotIconUrl.value },
    { id: 'usePlaceholder', label: t('mediaUploader.preview.usePlaceholder'), icon: placeholderIconUrl.value },
    { id: 'uploadThumbnail', label: t('mediaUploader.preview.uploadThumbnail'), icon: uploadIconUrl.value },
]);

/** Same shape as MediaUploaderStepPublishAndSharing.vue */
const publishTabs = computed(() => [
    { id: 'publishImmediately', label: t('mediaUploader.publish.publishImmediately'), icon: publishIconUrl.value },
    { id: 'schedulePublish', label: t('mediaUploader.publish.schedulePublish'), icon: scheduleIconUrl.value },
]);

/** Same shape as MediaUploaderPage.vue library tabs */
const libraryTabList = computed(() => [
    { label: t('mediaUploader.library.tabs.all'), value: 'all', count: 12 },
    { label: t('mediaUploader.library.tabs.published'), value: 'published', count: 7 },
    { label: t('mediaUploader.library.tabs.notPublished'), value: 'not_published', count: 3 },
    { label: t('mediaUploader.library.tabs.reviewing'), value: 'reviewing', count: 2 },
]);

/** Same shape as ServiceTabsSection.vue */
const homeServiceTabs = computed(() => [
    { id: 'media-&-merch', label: t('home.services.tabs.mediaMerch') },
    { id: 'membership-subscription', label: t('home.services.tabs.membership') },
    { id: 'calls-&-events', label: t('home.services.tabs.callsEvents') },
    { id: 'coming-soon', label: t('home.services.tabs.comingSoon') },
]);

const code = computed(() => ({
    dashboardOrders: `import DashboardTabs from '@/components/ui/nav/dashboard/DashboardTabs.vue';

const currentTab = ref('progress');
const tabList = computed(() => [
  { id: 'progress', labelKey: 'dashboard.orders.tabs.inProgress' },
  { id: 'Completed', labelKey: 'dashboard.orders.tabs.completed' },
  { id: 'Canceled', labelKey: 'dashboard.orders.tabs.canceled' },
  { id: 'All', labelKey: 'dashboard.orders.tabs.all' },
]);

<!-- DashboardOrdersReceivedPage.vue -->
<DashboardTabs v-model="currentTab" :tabs="tabList" />`,
    dashboardXRepost: `import DashboardTabs from '@/components/ui/nav/dashboard/DashboardTabs.vue';

const currentTab = ref('all');
const tabList = computed(() => [
  { id: 'all', labelKey: 'dashboard.xRepost.filters.tabs.all', count: rules.value.length },
  { id: 'published', labelKey: 'dashboard.xRepost.filters.tabs.published', count: rules.value.filter((rule) => rule.status === 'published').length },
  { id: 'draft', labelKey: 'dashboard.xRepost.filters.tabs.draft', count: rules.value.filter((rule) => rule.status === 'draft').length },
]);

<!-- XRepostPage.vue -->
<DashboardTabs
  v-model="currentTab"
  :tabs="tabList"
  tabs-only
  active-tab-class="bg-[#FFFFFF] text-[#0C111D] font-semibold"
  inactive-tab-class="bg-transparent text-[#667085] font-medium hover:bg-transparent"
/>`,
    dashboardAnalyticsTopMedia: `import DashboardTabs from '@/components/ui/nav/dashboard/DashboardTabs.vue';

const selectedTopMediaTab = ref('Views');
const topMediaTabs = computed(() => [
  { id: 'Views', label: t('dashboard.analytics.tables.media.viewsTab') },
  { id: 'P2V Sales', label: t('dashboard.analytics.tables.media.p2vSalesTab') },
]);

<!-- DashboardAnalyticsTopMediaTable.vue -->
<DashboardTabs
  class="shrink-0"
  compact
  :tabs="topMediaTabs"
  v-model="selectedTopMediaTab"
  active-tab-class="bg-black text-white font-semibold"
  inactive-tab-class="bg-transparent text-black font-medium"
  tabs-only
/>`,
    mediaUploadTypes: `import MediaUploadTypeTabs from '@/components/media/uploader/parts/MediaUploadTypeTabs.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';

const { url: videoIconUrl } = useAssetUrl('mediaUploader.icon.tabVideo');
const { url: imageIconUrl } = useAssetUrl('mediaUploader.icon.tabSingleImage');
const { url: galleryIconUrl } = useAssetUrl('mediaUploader.icon.tabGallery');
const { url: audioIconUrl } = useAssetUrl('mediaUploader.icon.tabAudio');

const mediaTypeTabs = computed(() => [
  { id: 'video', label: t('mediaUploader.uploadPopup.tabs.video'), icon: videoIconUrl.value },
  { id: 'singleImage', label: t('mediaUploader.uploadPopup.tabs.singleImage'), icon: imageIconUrl.value },
  { id: 'imageGallery', label: t('mediaUploader.uploadPopup.tabs.imageGallery'), icon: galleryIconUrl.value },
  { id: 'audio', label: t('mediaUploader.uploadPopup.tabs.audio'), icon: audioIconUrl.value },
]);

<!-- UploadMediaPopup.vue -->
<MediaUploadTypeTabs
  :tabs="mediaTypeTabs"
  :engine="engine"
  :before-tab-change="beforeTabChange"
/>`,
    mediaPreviewSubsteps: `import MediaUploadTypeTabs from '@/components/media/uploader/parts/MediaUploadTypeTabs.vue';

<!-- MediaUploaderStepPreviewSettings.vue — video thumbnail substeps -->
<MediaUploadTypeTabs
  :tabs="previewSubstepTabs"
  :model-value="uploaderStore.substep"
  :tabs-aria-label="t('mediaUploader.preview.thumbnailSettings')"
  @update:model-value="(id) => uploaderStore.setSubstep(id)"
/>`,
    mediaPublishWhen: `import MediaUploadTypeTabs from '@/components/media/uploader/parts/MediaUploadTypeTabs.vue';

<!-- MediaUploaderStepPublishAndSharing.vue -->
<MediaUploadTypeTabs
  :tabs="publishTabs"
  :model-value="uploaderStore.substep"
  :tabs-aria-label="t('mediaUploader.publish.whenTitle')"
  @update:model-value="(id) => uploaderStore.setSubstep(id)"
/>`,
    myMediaTabs: `import MyMediaTabs from '@/templates/media/media-creator/MyMediaTabs.vue';

const currentTab = ref('all');
const tabList = computed(() => {
  const items = uploaderStore.libraryItems || [];
  return [
    { label: t('mediaUploader.library.tabs.all'), value: 'all', count: items.length },
    { label: t('mediaUploader.library.tabs.published'), value: 'published', count: items.filter((item) => item.status === 'published').length },
    { label: t('mediaUploader.library.tabs.notPublished'), value: 'not_published', count: items.filter((item) => item.status === 'draft').length },
    { label: t('mediaUploader.library.tabs.reviewing'), value: 'reviewing', count: items.filter((item) => item.status === 'reviewing').length },
  ];
});

<!-- MediaUploaderPage.vue -->
<MyMediaTabs v-model="currentTab" :tabs="tabList" />`,
    homeServiceTabNav: `import HomeServiceTabNav from '@/dev/components/home/homeComponents/HomeServiceTabNav.vue';

const tabs = computed(() => [
  { id: 'media-&-merch', label: t('home.services.tabs.mediaMerch') },
  { id: 'membership-subscription', label: t('home.services.tabs.membership') },
  { id: 'calls-&-events', label: t('home.services.tabs.callsEvents') },
  { id: 'coming-soon', label: t('home.services.tabs.comingSoon') },
]);

<!-- ServiceTabsSection.vue -->
<HomeServiceTabNav :tabs="tabs" :engine="tabEngine" />`,
}));
</script>
