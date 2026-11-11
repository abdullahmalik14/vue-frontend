<template>
    <section class="flex flex-col gap-6">
        <DemoSectionHeader :title="t('demo.checkboxGroup.sectionTitle')" />
        <div class="flex flex-col gap-10 max-w-3xl">
            <!-- MediaUploaderStepSubmit — custom check + bullets -->
                <div class="flex flex-col gap-3">
                    <CheckboxGroup
                    v-model="term1"
                    :label="t('mediaUploader.submit.term1')"
                    theme="successCustom"
                    labelClass="block text-[12px] sm:text-[14px] leading-4 text-text-primary font-[400] cursor-pointer m-0 p-0"
                    custom-check-mark
                    wrapperClass="flex items-start gap-2 leading-none"
                />
                <ul class="pl-2 list-none text-[12px] sm:text-[14px] font-normal leading-5 text-dark-text">
                    <li class="relative pl-4 text-almost-black text-[12px] sm:text-[14px] font-normal leading-normal before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-darker-text dark:before:bg-mediaUi-bulletDark before:absolute before:left-[0.188rem] before:top-[0.438rem]">
                        {{ t('mediaUploader.submit.term1Bullet1') }}
                    </li>
                    <li class="relative pl-4 text-almost-black text-[12px] sm:text-[14px] font-normal leading-normal before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-darker-text dark:before:bg-mediaUi-bulletDark before:absolute before:left-[0.188rem] before:top-[0.438rem]">
                        {{ t('mediaUploader.submit.term1Bullet2') }}
                    </li>
                    <li class="relative pl-4 text-almost-black text-[12px] sm:text-[14px] font-normal leading-normal before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-darker-text dark:before:bg-mediaUi-bulletDark before:absolute before:left-[0.188rem] before:top-[0.438rem]">
                        {{ t('mediaUploader.submit.term1Bullet3') }}
                    </li>
                </ul>
                <ShowCodeToggle :code="code.term1" />
                </div>

            <!-- Publish coming soon + info tooltip, panel via interactionsEngine -->
                <div class="flex flex-col gap-3">
                <div class="flex gap-2 items-center">
                    <CheckboxGroup
                        :label="t('mediaUploader.publish.featureComingSoon')"
                        v-model="featureOnComingSoonModel"
                        theme="successTickSm"
                        labelClass="text-[16px] leading-4 text-black font-[500] cursor-pointer"
                        wrapperClass="flex items-center leading-none"
                    />
                    <div class="relative group">
                        <img :src="infoIconUrl" alt="" class="cursor-pointer" />
                        <div class="absolute left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block bg-mediaUi-tooltip text-white text-xs px-3 py-2 shadow-lg z-50 w-[280px] rounded-[8px]">
                            {{ t('mediaUploader.publish.featureComingSoonTip') }}
                        </div>
                    </div>
                </div>
                <div v-if="groupIx.isVisible('featurePanel')" class="ml-6">
                    <Paragraph
                        :text="t('mediaUploader.publish.preorderPrice')"
                        font-size="text-[14px]"
                        font-weight="font-[400]"
                        font-color="text-text-quaternary"
                    />
                </div>
                <ShowCodeToggle :code="code.comingSoon" />
            </div>

            <!-- Subscription display — semibold 16px -->
            <div class="flex flex-col gap-3">
                    <CheckboxGroup
                    :label="t('mediaUploader.subscription.discoveryPage')"
                    v-model="discoveryPage"
                    theme="successCustom"
                    labelClass="text-[16px] text-text-primary font-[600] cursor-pointer"
                    custom-check-mark
                    wrapperClass="flex items-center"
                />
                <ShowCodeToggle :code="code.discovery" />
            </div>

            <!-- MediaFilterPopup — icon + count, checkbox on the right -->
            <div class="flex flex-col gap-3">
                    <CheckboxGroup
                    v-model="videoType"
                    custom-check-mark
                    theme="filterBlack"
                    wrapper-class="flex items-center w-full min-h-10 [&_svg_path]:stroke-success [&>div]:w-full [&>div]:flex-row-reverse [&>div]:justify-between"
                >
                    <template #label>
                        <div class="flex items-center gap-2 min-w-0 flex-1">
                            <img
                                v-if="videoIconUrl"
                                :src="videoIconUrl"
                                alt=""
                                class="w-5 h-5 shrink-0 object-contain mix-blend-multiply dark:mix-blend-normal dark:invert"
                            />
                            <span class="min-w-0 text-[14px] leading-normal font-medium text-text-primary truncate dark:text-timberwolf">
                                {{ t('mediaUploader.library.filterPopup.types.video') }}
                                <span class="ml-0.5 text-[12px] font-normal leading-none text-text-primary align-super">{{ videoCount }}</span>
                            </span>
                        </div>
                    </template>
                </CheckboxGroup>
                <ShowCodeToggle :code="code.filterType" />
                </div>

            <!-- PlanDetail — published tier tag -->
            <div class="flex flex-col gap-3">
                    <CheckboxGroup
                    v-model="mediaPublished"
                    :label="t('plan.detail.mediaFeatures.someContent.label')"
                    :tags="[{ text: t('plan.detail.tagPublished'), variant: '#D1E0FF', class: 'text-[#155EEF]' }]"
                    :metaText="t('plan.detail.mediaFeatures.someContent.meta')"
                    theme="successTick"
                />
                <ShowCodeToggle :code="code.planMediaPublished" />
                </div>

            <!-- PlanDetail — draft tag -->
                <div class="flex flex-col gap-3">
                    <CheckboxGroup
                    v-model="mediaDraft"
                    :label="t('plan.detail.mediaFeatures.evenSomeMoreContent.label')"
                    :tags="[{ text: t('plan.detail.tagDraft'), variant: '', class: 'text-[#98A2B3]' }]"
                    :metaText="t('plan.detail.mediaFeatures.evenSomeMoreContent.meta')"
                    theme="successTick"
                />
                <ShowCodeToggle :code="code.planMediaDraft" />
            </div>

            <!-- AddTierPopup — tooltip on the heading, apply-on-sale checkbox -->
            <div class="flex flex-col gap-3">
                <div class="relative flex items-center gap-2">
                    <h3 class="text-base font-medium text-text-primary md:text-lg dark:text-timberwolf">
                        {{ t('mediaUploader.addTier.merchDiscount') }}
                    </h3>
                    <BaseTooltip placement="top">
                        <ul>
                            <li class="text-xs leading-normal font-medium text-white relative pl-4 before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-white before:absolute before:left-[0.188rem] before:top-[0.438rem] dark:text-timberwolf">
                                {{ t('mediaUploader.addTier.merchDiscountBullet1') }}
                            </li>
                        </ul>
                    </BaseTooltip>
                </div>
                <CheckboxGroup
                    :label="t('mediaUploader.addTier.applyOnSale')"
                    v-model="applyMerch"
                    theme="successCustom"
                    labelClass="text-sm leading-4 text-text-primary font-[400] cursor-pointer m-0 p-0 dark:text-timberwolf"
                    custom-check-mark
                    wrapperClass="pl-1 flex items-center gap-2 leading-none"
                />
                <ShowCodeToggle :code="code.applyOnSale" />
            </div>

            <!-- PlanSharing — green svg check -->
            <div class="flex flex-col gap-3">
                <CheckboxGroup
                    :label="t('plan.sharing.verifiedFanOnly')"
                    v-model="verifiedFan"
                    theme="mintIcon"
                    labelClass="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]"
                    wrapperClass="pl-1 flex items-center gap-3"
                />
                <ShowCodeToggle :code="code.verifiedFan" />
            </div>

            <!-- PurchaseFlow — terms with green links -->
            <div class="flex flex-col gap-3">
                    <CheckboxGroup
                    v-model="termsAgreed"
                    theme="mintTick"
                    labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
                    wrapperClass="flex items-center gap-2"
                >
                    {{ t('demo.checkboxGroup.checkout.websiteTermsPrefix') }}
                    <a href="" class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">{{ t('demo.checkboxGroup.links.terms') }}</a>
                    {{ t('demo.checkboxGroup.checkout.and') }}
                    <a href="" class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">{{ t('demo.checkboxGroup.links.privacy') }}</a>.
                </CheckboxGroup>
                <ShowCodeToggle :code="code.checkoutTerms" />
            </div>

            <!-- PaymentMethodNotLoggedIn — save card + brand -->
            <div class="flex flex-col gap-3">
                <div class="flex justify-between items-center gap-[0.625rem]">
                    <CheckboxGroup
                        :label="t('demo.checkoutReusable.paymentNotLoggedIn.saveCard')"
                        v-model="saveCard"
                        :customCheckMark="true"
                        theme="mintCustom"
                        labelClass="text-xs sm:text-sm leading-none tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
                        wrapperClass="flex items-center"
                    />
                    <img src="/images/payment-card-brand.png" :alt="t('demo.checkboxGroup.checkout.cardBrandAlt')" class="h-[1.0625rem] w-auto" />
                </div>
                <ShowCodeToggle :code="code.saveCard" />
            </div>

            <!-- OneOnOneBookingStep1 — mid icon -->
            <div class="flex flex-col gap-3">
                    <CheckboxGroup
                    v-model="allowInstantBooking"
                    :label="t('demo.checkboxGroup.booking.instantBooking')"
                    theme="booking"
                    labelClass="text-slate-700 mt-[1px] text-[16px] leading-normal"
                    wrapperClass="flex items-center gap-2 mb-3"
                    :mid-img="instantBookingIconUrl"
                />
                <ShowCodeToggle :code="code.instantBooking" />
            </div>

            <!-- OneOnOneBookingStep1 — smaller nested checkbox -->
            <div class="flex flex-col gap-3">
                    <CheckboxGroup
                    v-model="disableChat"
                    :label="t('demo.checkboxGroup.booking.disableChat')"
                    theme="bookingSmall"
                    labelClass="text-slate-700 text-[16px] leading-normal"
                    wrapperClass="flex items-center gap-2 mb-3 mt-2"
                />
                <ShowCodeToggle :code="code.smallNested" />
            </div>

            <!-- OneOnOneBookingStep2 — tooltip icon -->
            <div class="flex flex-col gap-3">
                <div class="flex items-center gap-2">
                    <CheckboxGroup
                        v-model="allowRecording"
                        :label="t('demo.checkboxGroup.bookingStep2.allowFanRecord')"
                        theme="booking"
                        labelClass="text-slate-700 text-[16px] leading-normal cursor-pointer"
                        wrapperClass="flex items-center gap-2"
                    />
                    <DropdownTooltipIcon
                        :text="t('demo.checkboxGroup.bookingStep2.allowFanRecordTooltip')"
                        :icon-src="bookingHelpIconUrl"
                    />
                </div>
                <ShowCodeToggle :code="code.recordingTooltip" />
            </div>

            <!-- EventDropdownContent — indigo / cyan / rose / gray -->
            <div class="flex flex-col gap-3">
                <div class="w-[240px] sm:w-[340px] bg-white rounded-[5px] inline-flex flex-col justify-start items-start shadow-lg border border-gray-100">
                    <div class="self-stretch h-14 px-3 py-2 inline-flex justify-start items-center gap-2">
                            <CheckboxGroup
                            v-model="calVideo"
                            :label="t('calendar.eventDropdown.videoCall')"
                            theme="calendarVideo"
                        />
                        <div class="flex-1 flex justify-between items-center">
                            <div class="w-2 h-2 bg-indigo-600 rounded-full" />
                        </div>
                    </div>
                    <div class="self-stretch h-14 px-3 py-2 inline-flex justify-start items-center gap-2">
                        <CheckboxGroup
                            v-model="calAudio"
                            :label="t('calendar.eventDropdown.audioCall')"
                            theme="calendarAudio"
                        />
                        <div class="w-2 h-2 bg-cyan-500 rounded-full" />
                </div>
                    <div class="self-stretch h-14 px-3 py-2 inline-flex justify-start items-center gap-2">
                        <CheckboxGroup
                            v-model="calGroup"
                            :label="t('calendar.eventDropdown.groupCall')"
                            theme="calendarGroup"
                        />
                        <div class="w-2 h-2 bg-rose-600 rounded-full" />
            </div>
                    <div class="self-stretch h-14 px-3 py-2 border-t border-gray-300 inline-flex justify-start items-center gap-4">
                    <CheckboxGroup
                            v-model="calSchedule"
                            :label="t('calendar.eventDropdown.showSchedule')"
                            theme="calendarSchedule"
                        />
                    </div>
                </div>
                <ShowCodeToggle :code="code.calendarDropdown" />
            </div>

            <!-- MainCalendar — pink check -->
            <div class="flex flex-col gap-3">
                <CheckboxGroup
                    :label="t('calendar.main.showExistingEvents')"
                    v-model="showSchedule"
                    theme="calendarPink"
                />
                <ShowCodeToggle :code="code.calendarPink" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CheckboxGroup from '@/components/forms/checkboxes/CheckboxGroup.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import BaseTooltip from '@/dev/components/plan/parts/BaseTooltip.vue';
import DropdownTooltipIcon from '@/components/ui/dropdowns/DropdownTooltipIcon.vue';
import DemoSectionHeader from '@/dev/templates/demo/DemoSectionHeader.vue';
import ShowCodeToggle from '@/dev/templates/demo/ShowCodeToggle.vue';
import { useAssetUrl } from '@/composables/useAssetUrl.js';
import { useMediaInteractions } from '@/composables/useMediaInteractions.js';
import { useMediaUploaderStore } from '@/stores/useMediaUploaderStore';

const { t } = useI18n();
const uploaderStore = useMediaUploaderStore();
const { url: infoIconUrl } = useAssetUrl('mediaUploader.icon.info');
const { url: videoIconUrl } = useAssetUrl('mediaUploader.icon.filterVideo');
const { url: bookingHelpIconUrl } = useAssetUrl('icon.booking.help');
const { url: instantBookingIconUrl } = useAssetUrl('icon.booking.instant');

const groupIx = useMediaInteractions('demoCheckboxGroup');
const featureConfig = groupIx.fieldConfig('featureOnComingSoon');

const term1 = ref(false);
const featureOn = ref(false);
const discoveryPage = ref(false);
const videoType = ref(false);
const mediaPublished = ref(false);
const mediaDraft = ref(false);
const applyMerch = ref(false);
const verifiedFan = ref(false);
const termsAgreed = ref(false);
const saveCard = ref(false);
const allowInstantBooking = ref(false);
const disableChat = ref(false);
const allowRecording = ref(false);
const calVideo = ref(false);
const calAudio = ref(false);
const calGroup = ref(false);
const calSchedule = ref(false);
const showSchedule = ref(false);

const featureOnComingSoonModel = computed({
    get: () => featureOn.value,
    set: (val) => {
        featureOn.value = val;
        groupIx.changeField(featureConfig, val, 'featurePanel');
    },
});

function itemKind(item) {
    if (item.mediaKind) return item.mediaKind;
    if (item.type === 'image') return 'singleImage';
    if (item.type === 'gallery') return 'imageGallery';
    if (item.type === 'audio') return 'audio';
    return 'video';
}

const videoCount = computed(
    () => (uploaderStore.libraryItems || []).filter((item) => itemKind(item) === 'video').length,
);

onMounted(() => {
    groupIx.registerField(featureConfig, featureOn.value, 'featurePanel');
});

onBeforeUnmount(() => {
    groupIx.clear();
});

const code = computed(() => ({
    term1: `<CheckboxGroup
  v-model="term1"
  :label="t('mediaUploader.submit.term1')"
  theme="successCustom"
  custom-check-mark
  labelClass="block text-[12px] sm:text-[14px] leading-4 text-text-primary font-[400] cursor-pointer m-0 p-0"
  wrapperClass="flex items-start gap-2 leading-none"
/>`,
    comingSoon: `const { isVisible, fieldConfig, registerField, changeField } = useMediaInteractions('mediaUploaderPublish');
const featureComingSoonConfig = fieldConfig('featureOnComingSoon');

onMounted(() => {
  registerField(featureComingSoonConfig, featureOnComingSoonModel.value, 'featurePanel');
});

<CheckboxGroup
  :label="t('mediaUploader.publish.featureComingSoon')"
  v-model="featureOnComingSoonModel"
  theme="successTickSm"
  labelClass="text-[16px] leading-4 text-black font-[500] cursor-pointer"
  wrapperClass="flex items-center leading-none"
/>
<div v-if="isVisible('featurePanel')">
  <Paragraph :text="t('mediaUploader.publish.preorderPrice')" font-size="text-[14px]" font-weight="font-[400]" font-color="text-text-quaternary" />
</div>`,
    discovery: `<CheckboxGroup
  :label="t('mediaUploader.subscription.discoveryPage')"
  v-model="discoveryPageModel"
  theme="successCustom"
  labelClass="text-[16px] text-text-primary font-[600] cursor-pointer"
  custom-check-mark
  wrapperClass="flex items-center"
/>`,
    filterType: `<CheckboxGroup
  custom-check-mark
  theme="filterBlack"
  wrapper-class="flex items-center w-full min-h-10 [&_svg_path]:stroke-success [&>div]:w-full [&>div]:flex-row-reverse [&>div]:justify-between"
>
  <template #label>
    <img :src="type.icon" alt="" class="w-5 h-5 shrink-0 object-contain" />
    <span>{{ type.label }} <span>{{ type.count }}</span></span>
  </template>
</CheckboxGroup>`,
    planMediaPublished: `<CheckboxGroup
  :label="t('plan.detail.mediaFeatures.someContent.label')"
  :tags="[{ text: t('plan.detail.tagPublished'), variant: '#D1E0FF', class: 'text-[#155EEF]' }]"
  :metaText="t('plan.detail.mediaFeatures.someContent.meta')"
  v-model="mediaOptionsProxy"
  theme="successTick"
/>`,
    planMediaDraft: `<CheckboxGroup
  :label="t('plan.detail.mediaFeatures.evenSomeMoreContent.label')"
  :tags="[{ text: t('plan.detail.tagDraft'), variant: '', class: 'text-[#98A2B3]' }]"
  :metaText="t('plan.detail.mediaFeatures.evenSomeMoreContent.meta')"
  v-model="mediaOptionsProxy"
  theme="successTick"
/>`,
    applyOnSale: `<CheckboxGroup
  :label="t('mediaUploader.addTier.applyOnSale')"
  v-model="applyMerch"
  theme="successCustom"
  labelClass="text-sm leading-4 text-text-primary font-[400] cursor-pointer m-0 p-0 dark:text-timberwolf"
  custom-check-mark
  wrapperClass="pl-1 flex items-center gap-2 leading-none"
/>`,
    verifiedFan: `<CheckboxGroup
  :label="t('plan.sharing.verifiedFanOnly')"
  v-model="verifiedFanProxy"
  theme="mintIcon"
  labelClass="text-sm align-text-top text-[#0c111d] dark:text-[#dbd8d3]"
  wrapperClass="pl-1 flex items-center gap-3"
/>`,
    checkoutTerms: `<CheckboxGroup
  v-model="checkout.state.termsAgreed"
  theme="mintTick"
  labelClass="text-sm leading-normal tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
  wrapperClass="flex items-center gap-2"
>
  {{ t('demo.checkboxGroup.checkout.websiteTermsPrefix') }}
  <a href="" class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">{{ t('demo.checkboxGroup.links.terms') }}</a>
  {{ t('demo.checkboxGroup.checkout.and') }}
  <a href="" class="text-sm leading-normal font-medium tracking-[0.0175rem] text-[#07F468] cursor-pointer">{{ t('demo.checkboxGroup.links.privacy') }}</a>.
</CheckboxGroup>`,
    saveCard: `<CheckboxGroup
  :label="t('demo.checkoutReusable.paymentNotLoggedIn.saveCard')"
  :modelValue="saveCard"
  :customCheckMark="true"
  theme="mintCustom"
  labelClass="text-xs sm:text-sm leading-none tracking-[0.0175rem] text-[#98A2B3] cursor-pointer"
  wrapperClass="flex items-center"
/>`,
    instantBooking: `const { url: instantBookingIconUrl } = useAssetUrl('icon.booking.instant');

<CheckboxGroup
  v-model="formData.allowInstantBooking"
  :label="t('demo.checkboxGroup.booking.instantBooking')"
  :mid-img="instantBookingIconUrl"
  theme="booking"
  labelClass="text-slate-700 mt-[1px] text-[16px] leading-normal"
  wrapperClass="flex items-center gap-2 mb-3"
/>`,
    smallNested: `<CheckboxGroup
  v-model="formData.disableChatBeforeCall"
  :label="t('demo.checkboxGroup.booking.disableChat')"
  theme="bookingSmall"
  labelClass="text-slate-700 text-[16px] leading-normal"
  wrapperClass="flex items-center gap-2 mb-3 mt-2"
/>`,
    recordingTooltip: `<div class="flex items-center gap-2">
  <CheckboxGroup
    v-model="formData.allowRecording"
    :label="t('demo.checkboxGroup.bookingStep2.allowFanRecord')"
    theme="booking"
    labelClass="text-slate-700 text-[16px] leading-normal cursor-pointer"
    wrapperClass="flex items-center gap-2"
  />
  <DropdownTooltipIcon
    :text="t('demo.checkboxGroup.bookingStep2.allowFanRecordTooltip')"
    :icon-src="bookingHelpIconUrl"
  />
</div>`,
    calendarDropdown: `<CheckboxGroup
  v-model="calVideo"
  :label="t('calendar.eventDropdown.videoCall')"
  theme="calendarVideo"
/>
<CheckboxGroup
  v-model="calAudio"
  :label="t('calendar.eventDropdown.audioCall')"
  theme="calendarAudio"
/>
<CheckboxGroup
  v-model="calGroup"
  :label="t('calendar.eventDropdown.groupCall')"
  theme="calendarGroup"
/>
<CheckboxGroup
  v-model="calSchedule"
  :label="t('calendar.eventDropdown.showSchedule')"
  theme="calendarSchedule"
/>`,
    calendarPink: `<CheckboxGroup
  :label="t('calendar.main.showExistingEvents')"
  v-model="showSchedule"
  theme="calendarPink"
/>`,
}));
</script>
