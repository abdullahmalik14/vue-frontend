<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { createStepStateEngine } from '@/utils/stateEngine.js';
import HomeSectionHeader from '@/dev/components/home/homeComponents/HomeSectionHeader.vue';
import HomeServiceTabNav from '@/dev/components/home/homeComponents/HomeServiceTabNav.vue';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import { getAssetUrls } from '@/systems/assets/assetLibrary.js';

const { t } = useI18n();

const homeAssets = ref({});

getAssetUrls([
    'home.tabs.custom',
    'home.tabs.perks',
    'home.tabs.automated',
    'home.tabs.wish',
    'home.tabs.smart',
    'home.tabs.flexible',
]).then((map) => {
    homeAssets.value = map || {};
});

const tabs = computed(() => [
    { id: 'media-&-merch', label: t('home.services.tabs.mediaMerch') },
    { id: 'membership-subscription', label: t('home.services.tabs.membership') },
    { id: 'calls-&-events', label: t('home.services.tabs.callsEvents') },
    { id: 'coming-soon', label: t('home.services.tabs.comingSoon') },
]);

const tabEngine = createStepStateEngine({
    flowId: 'home-service-tabs',
    urlSync: 'none',
    defaults: {
        activeTab: 'media-&-merch',
    },
});

onMounted(() => {
    tabEngine.initialize({ fromUrl: false });
});

const activeTab = computed(() => tabEngine.state.activeTab);
</script>

<template>
    <div
        class="flex flex-col gap-6 py-20 relative bg-[#EAECF0] bg-[linear-gradient(180deg,rgba(255,255,255,0.75)_70%,rgba(255,255,255,0)_100%)]">
        <!-- blur-overlay -->
        <div class="absolute inset-0 w-full h-full backdrop-blur-[25px] pointer-events-none z-[-1]"></div>

        <div class="flex flex-col gap-6">
            <HomeSectionHeader
                heading-theme="homeSectionTitleServices"
                subtitle-theme="homeSectionSubtitleServices"
                class="flex flex-col justify-center items-center text-center gap-2 px-4 py-2.5 md:gap-4 md:py-0 xl:gap-7 xl:px-12"
                :title="t('home.services.title')"
                :subtitle="t('home.services.subtitle')"
            />

            <!-- tab-section -->
            <div class="flex flex-col gap-6">
                <HomeServiceTabNav :tabs="tabs" :engine="tabEngine" />

                <!-- tab-container -->
                <div class="flex flex-col px-4 xl:px-12">
                    <!-- Media & Merch -->
                    <div v-if="activeTab === 'media-&-merch'" class="flex flex-col gap-6 md:gap-4 xl:flex-row">
                        <article
                            class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[34.375rem] overflow-hidden relative md:flex-row md:h-[29.09375rem] md:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:flex-col xl:w-[42.75rem] xl:h-[48.25rem] xl:[background:#F5F5F5] dark:bg-[#1e2021]">
                            <div
                                class="w-full h-[19.375rem] absolute top-0 md:static md:w-1/2 md:h-full xl:w-full xl:h-[44.75rem]">
                                <img loading="lazy" :src="homeAssets['home.tabs.custom']" :alt="t('home.services.panels.mediaMerch.ecosystem.alt')"
                                    class="w-full object-cover">
                            </div>
                            <section
                                class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:w-1/2 md:p-5 md:[background:transparent] xl:w-full xl:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:pt-16 xl:px-8 xl:pb-8">
                                <Heading tag="h3" theme="custom" no-wrap
                                    add-class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]"
                                    :text="t('home.services.panels.mediaMerch.ecosystem.title')" />
                                <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.mediaMerch.ecosystem.body')" />
                            </section>
                        </article>

                        <div class="flex flex-col gap-6 md:flex-row md:gap-4 xl:flex-col xl:flex-1">
                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[25rem] overflow-hidden relative md:w-1/2 md:order-2 md:h-[29.09375rem] xl:w-full xl:h-1/2 dark:bg-[#1e2021]">
                                <div
                                    class="w-full h-full absolute top-0 md:h-[24.59375rem] lg:h-[22.46875rem] xl:h-[21.625rem]">
                                    <img loading="lazy" :src="homeAssets['home.tabs.perks']" :alt="t('home.services.panels.mediaMerch.strategy.alt')"
                                        class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-16 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] xl:pt-16 xl:px-8 xl:pb-8">
                                    <Heading tag="h3" theme="custom" no-wrap
                                        add-class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]"
                                        :text="t('home.services.panels.mediaMerch.strategy.title')" />
                                    <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.mediaMerch.strategy.body')" />
                                </section>
                            </article>

                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[25rem] overflow-hidden relative md:w-1/2 md:order-1 md:h-[29.09375rem] xl:w-full xl:h-1/2 dark:bg-[#1e2021]">
                                <div
                                    class="w-full h-[18rem] absolute top-0 md:h-[20.96875rem] lg:h-full xl:h-[23.125rem]">
                                    <img loading="lazy" :src="homeAssets['home.tabs.automated']"
                                        :alt="t('home.services.panels.mediaMerch.reach.alt')" class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] xl:pt-16 xl:px-8 xl:pb-8">
                                    <Heading tag="h3" theme="custom" no-wrap
                                        add-class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]"
                                        :text="t('home.services.panels.mediaMerch.reach.title')" />
                                    <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.mediaMerch.reach.body')" />
                                </section>
                            </article>
                        </div>
                    </div>

                    <!-- Membership Subscription -->
                    <div v-if="activeTab === 'membership-subscription'"
                        class="grid grid-rows-4 gap-6 md:gap-4 md:[grid-template-rows:repeat(3,minmax(0,auto))] md:grid-cols-2 xl:[grid-template-rows:repeat(2,minmax(0,auto))] xl:[grid-template-columns:repeat(2,minmax(0,auto))]">
                        <article
                            class="flex flex-col justify-end items-end w-full h-[25rem] relative rounded-[1.875rem] overflow-hidden bg-[#F5F5F5] order-1 md:order-1 md:col-span-2 md:flex-row md:w-full md:h-[14.046875rem] md:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:row-span-1 xl:col-span-1 xl:[background:#f5f5f5] xl:flex-col xl:h-[33.35rem] dark:bg-[#1e2021]">
                            <div
                                class="absolute top-0 w-full h-[16.75rem] md:static md:w-1/2 md:h-full xl:w-full xl:h-[31.35rem]">
                                <img loading="lazy" :src="homeAssets['home.tabs.wish']" :alt="t('home.services.panels.membership.flexible.alt')"
                                    class="w-full object-cover">
                            </div>
                            <section
                                class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:w-1/2 md:p-5 md:[background:transparent] xl:w-full xl:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:pt-16 xl:px-8 xl:pb-8">
                                <Heading tag="h3" theme="custom" no-wrap
                                    add-class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]"
                                    :text="t('home.services.panels.membership.flexible.title')" />
                                <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.membership.flexible.body')" />
                            </section>
                        </article>

                        <article
                            class="flex flex-col justify-end items-end w-full h-[25rem] relative rounded-[1.875rem] overflow-hidden bg-[#F5F5F5] order-2 md:order-3 md:row-span-3 md:flex-col md:w-full md:h-[29.0625rem] xl:row-span-2 xl:col-span-1 xl:flex-col xl:h-[21.9rem] dark:bg-[#1e2021]">
                            <div
                                class="absolute top-0 w-full h-[16.75rem] md:static md:h-[16.0625rem] xl:w-full xl:h-[19.9rem]">
                                <img loading="lazy" :src="homeAssets['home.tabs.custom']" :alt="t('home.services.panels.membership.retention.alt')"
                                    class="w-full object-cover">
                            </div>
                            <section
                                class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:px-5 md:pt-10 md:pb-5 xl:w-full xl:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:pt-16 xl:px-8 xl:pb-8">
                                <Heading tag="h3" theme="custom" no-wrap
                                    add-class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]"
                                    :text="t('home.services.panels.membership.retention.title')" />
                                <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.membership.retention.body')" />
                            </section>
                        </article>

                        <article
                            class="flex flex-col justify-end items-end w-full h-[25rem] relative rounded-[1.875rem] overflow-hidden bg-[#F5F5F5] order-3 md:order-2 md:col-span-2 md:flex-row md:w-full md:h-[14.046875rem] md:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:row-span-1 xl:col-span-1 xl:[background:#f5f5f5] xl:flex-col xl:h-[33.35rem] dark:bg-[#1e2021]">
                            <div
                                class="absolute top-0 w-full h-full md:static md:w-1/2 md:h-full xl:w-full xl:h-[31.35rem]">
                                <img loading="lazy" :src="homeAssets['home.tabs.smart']" :alt="t('home.services.panels.membership.perks.alt')"
                                    class="w-full object-cover">
                            </div>
                            <section
                                class="flex flex-col gap-2 px-5 pt-16 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:w-1/2 md:p-5 md:[background:transparent] xl:w-full xl:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:pt-16 xl:px-8 xl:pb-8">
                                <Heading tag="h3" theme="custom" no-wrap
                                    add-class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]"
                                    :text="t('home.services.panels.membership.perks.title')" />
                                <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.membership.perks.body')" />
                            </section>
                        </article>

                        <article
                            class="flex flex-col justify-end items-end w-full h-[25rem] relative rounded-[1.875rem] overflow-hidden bg-[#F5F5F5] order-4 md:order-4 md:row-span-3 md:flex-col md:w-full md:h-[29.0625rem] xl:row-span-2 xl:col-span-1 xl:flex-col xl:h-[21.9rem] dark:bg-[#1e2021]">
                            <div
                                class="absolute top-0 w-full h-full md:static md:h-[27.9375rem] xl:w-full xl:h-[21.4rem]">
                                <img loading="lazy" :src="homeAssets['home.tabs.flexible']" :alt="t('home.services.panels.membership.loop.alt')"
                                    class="w-full object-cover">
                            </div>
                            <section
                                class="flex flex-col gap-2 px-5 pt-16 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:px-5 md:pt-16 md:pb-5 xl:w-full xl:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:pt-16 xl:px-8 xl:pb-8">
                                <Heading tag="h3" theme="custom" no-wrap
                                    add-class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]"
                                    :text="t('home.services.panels.membership.loop.title')" />
                                <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.membership.loop.body')" />
                            </section>
                        </article>
                    </div>

                    <!-- Calls & Events -->
                    <div v-if="activeTab === 'calls-&-events'" class="flex flex-col gap-6 md:gap-4">
                        <div class="flex flex-col gap-6 md:flex-row md:gap-4">
                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[28.125rem] overflow-hidden relative md:w-1/2 md:h-[34.11rem] md:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:flex-col xl:h-[32.45rem] dark:bg-[#1e2021]">
                                <div
                                    class="w-full h-[17.375rem] absolute top-0 md:static md:h-[19.98rem] xl:w-full xl:h-[20.556rem]">
                                    <img loading="lazy" :src="homeAssets['home.tabs.perks']" :alt="t('home.services.panels.callsEvents.instant.alt')"
                                        class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:[background:transparent] xl:w-full xl:p-8">
                                    <Heading tag="h3" theme="custom" no-wrap
                                        add-class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]"
                                        :text="t('home.services.panels.callsEvents.instant.title')" />
                                    <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.callsEvents.instant.body')" />
                                </section>
                            </article>

                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[31.25rem] overflow-hidden relative md:w-1/2 md:h-[34.11rem] md:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:flex-col xl:h-[32.45rem] dark:bg-[#1e2021]">
                                <div
                                    class="w-full h-[21.75rem] absolute top-0 md:static md:h-[21.48rem] xl:w-full xl:h-[24.214rem]">
                                    <img loading="lazy" :src="homeAssets['home.tabs.automated']"
                                        :alt="t('home.services.panels.callsEvents.booking.alt')" class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:[background:transparent] xl:w-full xl:p-8">
                                    <Heading tag="h3" theme="custom" no-wrap
                                        add-class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]"
                                        :text="t('home.services.panels.callsEvents.booking.title')" />
                                    <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.callsEvents.booking.body')" />
                                </section>
                            </article>
                        </div>

                        <article
                            class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[31.25rem] overflow-hidden relative md:flex-row-reverse md:h-[24.078rem] md:bg-[linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] xl:h-[21.3rem] dark:bg-[#1e2021]">
                            <div class="w-full h-[19.25rem] absolute top-0 md:static md:w-1/2 md:h-full">
                                <img loading="lazy" :src="homeAssets['home.tabs.wish']" :alt="t('home.services.panels.callsEvents.group.alt')"
                                    class="w-full object-cover">
                            </div>
                            <section
                                class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] md:w-1/2 md:p-5 md:[background:transparent] xl:p-8">
                                <Heading tag="h3" theme="custom" no-wrap
                                    add-class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]"
                                    :text="t('home.services.panels.callsEvents.group.title')" />
                                <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.callsEvents.group.body')" />
                            </section>
                        </article>
                    </div>

                    <!-- Coming Soon -->
                    <div v-if="activeTab === 'coming-soon'" class="flex flex-col gap-6 md:gap-4">
                        <div class="flex flex-col gap-6 md:gap-4 md:flex-row">
                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[25rem] overflow-hidden relative md:w-1/2 md:h-[35.045rem] xl:h-[35.96rem] dark:bg-[#1e2021]">
                                <div
                                    class="w-full h-[17.5rem] absolute top-0 md:h-[24.59375rem] lg:h-full xl:h-[35.46rem]">
                                    <img loading="lazy" :src="homeAssets['home.tabs.custom']" :alt="t('home.services.panels.comingSoon.pricing.alt')"
                                        class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] xl:p-8">
                                    <Heading tag="h3" theme="custom" no-wrap
                                        add-class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]"
                                        :text="t('home.services.panels.comingSoon.pricing.title')" />
                                    <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.comingSoon.pricing.body')" />
                                </section>
                            </article>

                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[28.125rem] overflow-hidden relative md:w-1/2 md:h-[35.045rem] xl:h-[35.96rem] dark:bg-[#1e2021]">
                                <div
                                    class="w-full h-[19.875rem] absolute top-0 md:h-[33.92rem] lg:h-full xl:h-[35.46rem]">
                                    <img loading="lazy" :src="homeAssets['home.tabs.smart']" :alt="t('home.services.panels.comingSoon.custom.alt')"
                                        class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] xl:w-full xl:px-8 xl:pt-16 xl:pb-8">
                                    <Heading tag="h3" theme="custom" no-wrap
                                        add-class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]"
                                        :text="t('home.services.panels.comingSoon.custom.title')" />
                                    <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.comingSoon.custom.body')" />
                                </section>
                            </article>
                        </div>

                        <div class="flex flex-col gap-6 md:gap-4 md:flex-row">
                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[31.77rem] overflow-hidden relative md:w-1/2 xl:h-[32.6rem] dark:bg-[#1e2021]">
                                <div
                                    class="w-full h-[27.77rem] absolute top-0 md:h-[25.77rem] lg:h-[30.64rem] xl:h-[27.1rem]">
                                    <img loading="lazy" :src="homeAssets['home.tabs.flexible']" :alt="t('home.services.panels.comingSoon.broadcast.alt')"
                                        class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] xl:pt-16 xl:px-8 xl:pb-8">
                                    <Heading tag="h3" theme="custom" no-wrap
                                        add-class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]"
                                        :text="t('home.services.panels.comingSoon.broadcast.title')" />
                                    <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.comingSoon.broadcast.body')" />
                                </section>
                            </article>

                            <article
                                class="flex flex-col justify-end items-end rounded-[1.875rem] bg-[#F5F5F5] h-[31.77rem] overflow-hidden relative md:w-1/2 xl:h-[32.6rem] dark:bg-[#1e2021]">
                                <div class="w-full h-full absolute top-0 md:h-[30.64rem] lg:h-full xl:h-[32.1rem]">
                                    <img loading="lazy" :src="homeAssets['home.tabs.perks']" :alt="t('home.services.panels.comingSoon.wish.alt')"
                                        class="w-full object-cover">
                                </div>
                                <section
                                    class="flex flex-col gap-2 px-5 pt-10 pb-5 [background:linear-gradient(180deg,rgba(239,239,240,0)_0%,rgba(239,239,240,0.95)_60%)] backdrop-blur-[6px] xl:pt-16 xl:px-8 xl:pb-8">
                                    <Heading tag="h3" theme="custom" no-wrap
                                        add-class="text-lg font-semibold text-[#0C111D] md:text-xl md:leading-normal md:font-medium xl:text-2xl dark:text-[#dbd8d3]"
                                        :text="t('home.services.panels.comingSoon.wish.title')" />
                                    <Paragraph theme="custom" no-wrap add-class="text-sm text-[#101828] md:text-base dark:text-[#d6d3cd]" :text="t('home.services.panels.comingSoon.wish.body')" />
                                </section>
                            </article>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
