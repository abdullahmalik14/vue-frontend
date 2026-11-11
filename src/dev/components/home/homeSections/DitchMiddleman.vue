<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Heading from '@/components/ui/typography/Heading.vue';
import Paragraph from '@/components/ui/typography/Paragraph.vue';
import DashboardPrimaryButton from '@/components/ui/buttons/DashboardPrimaryButton.vue';
import { getAssetUrls } from '@/systems/assets/assetLibrary.js';

const { t } = useI18n();

const homeAssets = ref({});

getAssetUrls([
    'home.section.sampleBg',
    'home.ditch.plus',
    'home.ditch.minus',
]).then((map) => {
    homeAssets.value = map || {};
});

const sectionStyle = computed(() => {
    const bg = homeAssets.value['home.section.sampleBg'];
    return {
        backgroundImage: bg ? `url('${bg}')` : undefined,
    };
});

const accordionItems = ref([
    { key: 'management', isOpen: true },
    { key: 'production', isOpen: false },
    { key: 'visibility', isOpen: false },
]);

const toggleAccordion = (index) => {
    accordionItems.value.forEach((item, i) => {
        if (i === index) {
            item.isOpen = !item.isOpen;
        } else {
            item.isOpen = false;
        }
    });
};

const WRAPPER_OVERRIDES = [
    { target: 'wrapper1', removeClass: true },
    { target: 'wrapper2', removeClass: true },
];
</script>

<template>
    <div
        class="w-full bg-cover [background-position:top_center] bg-no-repeat"
        :style="sectionStyle">
        <div
            class="flex flex-col gap-4 w-full h-full px-4 py-12 bg-[linear-gradient(180deg,rgba(251,91,162,0.45)_0%,rgba(255,4,100,0.81)_100%)] relative xl:px-12 xl:py-[4.875rem]">
            <div class="absolute inset-0 w-full h-full backdrop-blur-[5px] pointer-events-none z-[-1]"></div>

            <div class="flex flex-col gap-2 md:justify-center md:items-center md:gap-6">
                <div class="flex flex-col gap-2 py-2.5 drop-shadow-[0_0_4px_#00000040] md:py-0 xl:hidden">
                    <Heading
                        :text="t('home.ditch.title')"
                        tag="h2"
                        theme="homeDitchTitle"
                        no-wrap
                    />
                    <Paragraph
                        :text="t('home.ditch.subtitle')"
                        theme="homeDitchSubtitle"
                        no-wrap
                    />
                </div>

                <div class="flex flex-col gap-4 pb-2 md:items-center md:flex-row md:gap-0 md:pb-0">
                    <div class="flex flex-col gap-10 md:flex-1 xl:drop-shadow-[0_0_4px_#00000040]">
                        <div class="flex flex-col gap-6">
                            <div class="hidden xl:flex flex-col gap-2">
                                <Heading
                                    :text="t('home.ditch.title')"
                                    tag="h2"
                                    theme="homeDitchTitleXl"
                                    no-wrap
                                />
                                <Paragraph
                                    :text="t('home.ditch.subtitle')"
                                    theme="homeDitchSubtitleXl"
                                    no-wrap
                                />
                            </div>

                            <Paragraph
                                :text="t('home.ditch.body')"
                                theme="homeDitchBody"
                                no-wrap
                            />
                        </div>

                        <DashboardPrimaryButton
                            theme="homeDitchDesktop"
                            type="button"
                            :text="t('home.ditch.cta')"
                            :wrapper-overrides="WRAPPER_OVERRIDES"
                            custom-class="hidden xl:flex"
                        />
                    </div>

                    <div class="flex flex-col md:flex-1 w-full">
                        <div v-for="(item, index) in accordionItems" :key="item.key"
                            :class="['flex flex-col py-4 border-b border-white group/accordion-item md:px-4 md:py-6 xl:min-h-[7rem] xl:justify-center dark:border-[#303436]', { 'open': item.isOpen }]">
                            <button @click="toggleAccordion(index)"
                                class="flex justify-between items-center w-full outline-none border-none bg-transparent">
                                <span
                                    class="text-lg font-semibold text-left drop-shadow-[0_0_4px_#00000040] text-white md:text-2xl dark:text-[#e8e6e3]">{{
                                    t(`home.ditch.items.${item.key}.title`) }}</span>

                                <div class="flex justify-center items-center w-6 h-6">
                                    <img v-if="!item.isOpen" loading="lazy"
                                        :src="homeAssets['home.ditch.plus']" :alt="t('home.ditch.plusAlt')"
                                        class="w-6 h-6 min-w-[1.5rem]" />
                                    <img v-else loading="lazy" :src="homeAssets['home.ditch.minus']"
                                        :alt="t('home.ditch.minusAlt')" class="w-6 h-6 min-w-[1.5rem]" />
                                </div>
                            </button>

                            <div class="pr-8 overflow-hidden transition-all duration-300"
                                :style="{ maxHeight: item.isOpen ? '200px' : '0', opacity: item.isOpen ? '1' : '0', marginTop: item.isOpen ? '1rem' : '0' }">
                                <Paragraph theme="custom" no-wrap add-class="text-base font-medium text-white dark:text-[#e8e6e3]" :text="t(`home.ditch.items.${item.key}.content`)" />
                            </div>
                        </div>
                    </div>
                </div>

                <DashboardPrimaryButton
                    theme="homeDitchMobile"
                    type="button"
                    :text="t('home.ditch.cta')"
                    :wrapper-overrides="WRAPPER_OVERRIDES"
                    custom-class="xl:hidden"
                />
            </div>
        </div>
    </div>
</template>
